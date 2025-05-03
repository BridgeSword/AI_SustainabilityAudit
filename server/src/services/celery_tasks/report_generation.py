import json
from typing import Dict, Union

from ...extension import celery_app, milvus_client
from ...core.utils import get_logger
from ...core.schemas import CRPlanRequest
from ...agents import Tool, AgentBase
from ...agents.prompts import *

logger = get_logger(__name__)

@celery_app.task(ignore_result=False, track_started=True)
def start_generating(cr_plan_dict: dict, user_instructions: str, generated_plan: Dict) -> Union[None, Dict]:

    cr_plan = CRPlanRequest(**cr_plan_dict)
    logger.info("------------Executing Generation Process------------")
    logger.info("------------Creating All required Agents------------")
    

    desc_agent = AgentBase(
        genai_model=cr_plan.genai_model,
        temperature=0.7,
        device=cr_plan.device,
        system_message=SYSTEM_PROMPT_DESCRIPTION
    )
    

    multi_agents = []
    logger.info("Initialized multi_agents as an empty list.")


    for section, desc in generated_plan.items():
        logger.info(f"Processing section: {section}, Desc Type: {type(desc)}")
        desc_prompt = [
            user_instructions,
            ADD_SECTION_CONTEXT.format(section_name=section, section_ctx=desc)
        ]

        desc_result = desc_agent(desc_prompt, store_history=False)
        if not isinstance(desc_result, str):
            desc_result = str(desc_result)

      
        entry = {
            "section": str(section),      
            "description": desc_result,   
            "agent_output": None         
        }

        logger.info(f"Appending entry to multi_agents: {entry} (type: {type(entry)})")
        multi_agents.append(entry)


    for idx, item in enumerate(multi_agents):
        if not isinstance(item, dict):
            logger.error(f"multi_agents[{idx}] is NOT a dict! It's {type(item)} -> {item}")
            continue

        section_agent = AgentBase(
            genai_model=cr_plan.genai_model,
            temperature=0.7,
            device=cr_plan.device,
            system_message=SYSTEM_PROMPT_SECTION_GENERATION
        )

        agent_desc = ADD_SECTION_DESCRIPTION.format(
            section_name=item["section"],
            section_desc=item["description"]
        )
        agent_prompt = [user_instructions, agent_desc]

        output_result = section_agent(agent_prompt)
        if not isinstance(output_result, str):
            output_result = str(output_result)


        multi_agents[idx]["agent_output"] = output_result

        logger.info(f"Generated agent_output for index {idx}, agent_output type={type(output_result)}")


    for i, item in enumerate(multi_agents):
        sec_t = type(item.get("section"))
        desc_t = type(item.get("description"))
        out_t = type(item.get("agent_output"))
        logger.info(f"[Before returning] multi_agents[{i}] -> section type={sec_t}, "
                    f"description type={desc_t}, agent_output type={out_t}")

    result = []
    for item in multi_agents:
        result.append({
            "section": str(item["section"]),
            "description": str(item["description"]),
            "agent_output": str(item["agent_output"])
        })

    logger.info(f"Final result ready to return (len={len(result)}).")

    return result
