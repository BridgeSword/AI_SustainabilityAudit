import time
import json
import asyncio

from fastapi import WebSocket
from fastapi.responses import JSONResponse

from ...main import celery_app, milvus_client
from ...core.utils import get_logger
from ...core.schemas import CRPlanRequest, CRPlanResponse
from ...ws.manager import WSConnectionManager
from ...agents import Tool, AgentBase
from ...agents.prompts import *


logger = get_logger(__name__)

ws_manager = WSConnectionManager()

@celery_app.task(ignore_result=False, track_started=True)
def start_thresholding(cr_plan: CRPlanRequest, user_instructions:str):
    logger.info("------------Executing Thresholder Agent------------")

    thresholder_agent = AgentBase(genai_model=cr_plan.genai_model, 
                                  temperature=0.7, 
                                  device=cr_plan.device, 
                                  system_message=SYSTEM_PROMPT_THRESHOLDER)
    req_threshold = None

    for _ in range(2):
        try:
            agent_out = thresholder_agent(user_instructions, json_out=True)[0]

            req_threshold = int(min(max(1, agent_out["threshold"]), 5))
            
            break
        except:
            thresholder_agent.clear_history()
            logger.info("------------Unable to find the threshold value, trying again...------------")

    if not req_threshold:
        return None

    return req_threshold

@celery_app.task(ignore_result=False, track_started=True)
def start_planning(cr_plan: CRPlanRequest, user_instructions:str, req_threshold: int):
    
    logger.info("Starting deciding the threshold no. of loops required to complete the planning!")

    planner_agent = AgentBase(genai_model=cr_plan.genai_model, 
                              temperature=0.7, 
                              device=cr_plan.device,
                              system_message=SYSTEM_PROMPT_PLANNING)
    
    evaluation_agent = AgentBase(genai_model=cr_plan.genai_model, 
                                 temperature=0.7, 
                                 device=cr_plan.device,
                                 system_message=SYSTEM_PROMPT_PLAN_EVALUATION)

    plan_instruction = user_instructions

    generated_plan = None

    for _ in range(2):
        try:
            for _ in range(req_threshold):
                generated_plan = planner_agent(plan_instruction, json_out=True)[0]

                generated_plan_str = json.dumps(generated_plan, indent=4)

                critique = evaluation_agent(AGENT_PLAN_PROMPT.format(plan=generated_plan_str), json_out=True)[0]

                if critique["modification"]:
                    plan_instruction = PLAN_MODIFICATION_CRITIQUE.format(critique=critique["critique"])
                    continue
                else:
                    break
            
            if generated_plan is not None:
                break
        except:
            planner_agent.clear_history()
            evaluation_agent.clear_history()
            continue
    
    return generated_plan
    
