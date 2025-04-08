import json
from typing import Dict, Union

from ...main import celery_app, milvus_client
from ...core.utils import get_logger
from ...core.schemas import CRPlanRequest
from ...agents import Tool, AgentBase
from ...agents.prompts import *


logger = get_logger(__name__)

@celery_app.task(ignore_result=False, track_started=True)
def start_generating(cr_plan: CRPlanRequest, user_instructions: str, generated_plan: Dict) -> Union[None, Dict]:
    logger.info("------------Executing Generation Process------------")

    logger.info("------------Creating All required Agents------------")

    desc_agent = AgentBase(genai_model=cr_plan.genai_model, 
                           temperature=0.7,
                           device=cr_plan.device,
                           system_message=SYSTEM_PROMPT_DESCRIPTION)
    
    multi_agents = []

    for section, desc in generated_plan.items():
        desc_prompt = [user_instructions, 
                       ADD_SECTION_CONTEXT.format(section_name=section, 
                                                  section_ctx=desc)]
        detailed_desc = desc_agent(desc_prompt, store_history=False)

        agent = AgentBase(genai_model=cr_plan.genai_model, 
                          temperature=0.7,
                          device=cr_plan.device,
                          system_message=SYSTEM_PROMPT_SECTION_GENERATION)
        
        multi_agents.append({
            "agent": agent,
            "section": section,
            "description": detailed_desc
        })
    
    for idx, agent_dict in enumerate(multi_agents):
        agent = agent["agent"]
        agent_desc = ADD_SECTION_DESCRIPTION.format(section_name=agent_dict["section"], 
                                                    section_desc=agent_dict["description"])
        agent_prompt = [user_instructions, agent_desc]
        agent_output = agent(agent_prompt)

        multi_agents[idx]["agent_output"] = agent_output
    
    return multi_agents
