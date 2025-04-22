import json
from typing import Dict, Union
from sentence_transformers import SentenceTransformer
import torch
from ...extension import celery_app, milvus_client
from ...core.utils import get_logger
from ...core.config import settings, GAIEmbeddersCollections
from ...core.schemas import CRPlanRequest
from ...agents import Tool, AgentBase
from ...agents.prompts import *

logger = get_logger(__name__)

@celery_app.task(ignore_result=False, track_started=True)
def start_thresholding(cr_plan_dict: dict, user_instructions: str) -> Union[None, int]:
    logger.info("------------Executing Thresholder Agent------------")
    cr_plan = CRPlanRequest(**cr_plan_dict)

    logger.info("Started deciding the threshold no. of loops required to complete the planning!")

    thresholder_agent = AgentBase(
        genai_model=cr_plan.genai_model, 
        temperature=0.7, 
        device=cr_plan.device, 
        system_message=SYSTEM_PROMPT_THRESHOLDER
    )

    req_threshold = None

    for _ in range(2):
        try:
            agent_out = thresholder_agent(user_instructions, json_out=True)[0]
            req_threshold = int(min(max(1, agent_out["threshold"]), 5))
            break
        except Exception as e:
            logger.warning(f"Thresholder retrying due to error: {e}")
            thresholder_agent.clear_history()

    return req_threshold


@celery_app.task(ignore_result=False, track_started=True)
def start_planning(cr_plan_dict: dict, user_instructions: str, req_threshold: int) -> Union[None, Dict]:
    logger.info("------------Executing Planner Process------------")
    embedding_model = "stella_15"
    emb_model = settings.embedders.model_fields[embedding_model].default
    device = "cuda" if torch.cuda.is_available() else "cpu"

    embedder = SentenceTransformer(emb_model,
                                   trust_remote_code=True, 
                                   device=device)
    query_embedding = embedder.encode(user_instructions, device=device)

    vector_col_name = GAIEmbeddersCollections.mapping()[embedding_model]

    results = milvus_client.search(
        collection_name=vector_col_name,
        anns_field="vector_embs",
        data=[query_embedding],
        limit=3,
        search_params={"metric_type": "L2"}, 
        output_fields=["text_chunk"]
    )

    context = ""

    if len(results) > 0:
        results = "\n".join([f"{i+1}. {chunk}" for i, chunk in enumerate(results)])

        context = ADDITIONAL_CONTEXT.format(context = results)
    logger.info("------------RESULT OF CONTEXT------------")
    logger.info("RAG context result: %s", context)

    cr_plan = CRPlanRequest(**cr_plan_dict)

    planner_agent = AgentBase(
        genai_model=cr_plan.genai_model, 
        temperature=0.7, 
        device=cr_plan.device,
        system_message=SYSTEM_PROMPT_PLANNING
    )
    
    evaluation_agent = AgentBase(
        genai_model=cr_plan.genai_model, 
        temperature=0.7, 
        device=cr_plan.device,
        system_message=SYSTEM_PROMPT_PLAN_EVALUATION
    )

    plan_instruction = context + "\n\n" + user_instructions
    plan_instruction.strip()
    generated_plan = None

    for _ in range(2):
        try:
            for _ in range(req_threshold):
                logger.info("------------Generating Plan------------")
                generated_plan = planner_agent(plan_instruction, json_out=True)[0]

                generated_plan_str = json.dumps(generated_plan, indent=4)

                critique = evaluation_agent(
                    AGENT_PLAN_PROMPT.format(plan=generated_plan_str), json_out=True
                )[0]

                if critique.get("modification", None) is not None:
                    logger.info("------------Modifying Plan based on the critique------------")
                    plan_instruction = PLAN_MODIFICATION_CRITIQUE.format(critique=critique["critique"])
                    continue
                else:
                    break

            if generated_plan is not None:
                break
        except Exception as e:
            logger.warning(f"Planner retrying due to error: {e}")
            planner_agent.clear_history()
            evaluation_agent.clear_history()
            continue
    
    return generated_plan
