import os

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from motor.motor_asyncio import AsyncIOMotorDatabase

from bson.objectid import ObjectId

from sentence_transformers import SentenceTransformer

from ..core.utils import get_logger
from ..core.schemas import ManualEditsRequest, GenericResponse, AIEditsRequest, AIEditsResponse
from ..core.constants import Status
from ..core.config import GAIModels, settings, GAIEmbeddersCollections

from ..agents import AgentBase
from ..agents.prompts import *

from ..main import get_mongo_client, milvus_client


logger = get_logger(__name__)

router = APIRouter()


@router.post(
    "/manual",
    tags=["PDF Edit Requests"],
    description="Use this API to save the Manual Edits by the user to the database"
)
async def manual_edits(
    manual_edit_request: ManualEditsRequest,
    db: AsyncIOMotorDatabase = Depends(get_mongo_client)
):
    section_collection = db.get_collection("sections")

    section_id = manual_edit_request.section_id
    user_edit = manual_edit_request.user_edit

    if not section_id or not user_edit:
        return GenericResponse(
            response = "Section ID and User Edits should not be empty or None", 
            status = Status.failed.value
        )
    
    try:
        section_id = ObjectId(section_id)
    except:
        return GenericResponse(
            response = "Invalid Section Id Format", 
            status = Status.invalid.value
        )
    
    section = await section_collection.find_one(
        {"_id": section_id}
    )

    if not section:
        return GenericResponse(
            response = f"No Section found with ID: {str(section_id)}", 
            status = Status.invalid.value
        )

    edits = section.get("edits", None)

    if not edits:
        edits = {
            "latest": user_edit,
            "previous_versions": []
        }
    else:
        edits["previous_versions"] += [edits["latest"]]
        edits["latest"] = user_edit

    section_update = await section_collection.find_one_and_update(
        {"_id": section_id},
        {"$set": 
            {
                "edits": edits
            }
        }
    )

    return GenericResponse(
        response = "Successfully Updated!",
        status = Status.success.value
    )


@router.post(
    "/ai",
    tags=["PDF Edit Requests"],
    description="Use this API to make AI Edits by the user and save to the Database"
)
async def ai_edits(
    ai_edit_request: AIEditsRequest,
    db: AsyncIOMotorDatabase = Depends(get_mongo_client)
):
    report_collection = db.get_collection("reports")
    section_collection = db.get_collection("sections")

    report_id = ai_edit_request.report_id
    section_id = ai_edit_request.section_id
    user_request = ai_edit_request.user_request
    genai_model = ai_edit_request.genai_model
    device = ai_edit_request.device

    if genai_model is None:
        genai_model = "openai-4o"

    if device is None:
        device = "cpu"
    
    gai_model = genai_model.lower().split("-")

    if len(gai_model) < 2:
        return GenericResponse(
            response = "No GenAI Model specified or the variant is not supported!",
            status = Status.failed.value
        )

    genai_models = GAIModels.mapping().get(gai_model[0], None)
    genai_model_variant = genai_models.get("-".join(gai_model[1:]), None)

    if not section_id or not user_request:
        return GenericResponse(
            response = "Section ID and User Edits should not be empty or None", 
            status = Status.failed.value
        )
    
    try:
        section_id = ObjectId(section_id)
        report_id = ObjectId(report_id)
    except:
        return GenericResponse(
            response = "Invalid Report Id or Section Id Format", 
            status = Status.invalid.value
        )
    
    report = await report_collection.find_one(
        {"_id": report_id}
    )

    if not report:
        return GenericResponse(
            response = f"No Report found with ID: {str(report_id)}", 
            status = Status.invalid.value
        )
    
    section = await section_collection.find_one(
        {"_id": section_id}
    )

    if not section:
        return GenericResponse(
            response = f"No Section found with ID: {str(section_id)}", 
            status = Status.invalid.value
        )
    
    latest_content = None
    edits = section.get("edits", None)

    if not edits:
        latest_content = section.get("agent_output")
    else:
        latest_content = edits["latest"]

    user_instructions = USER_INSTRUCTIONS.format(
        company=report.get("company").upper(),
        carbon_std=report.get("standard"), 
        carbon_goal=report.get("goal"), 
        carbon_plan=report.get("user_plan"), 
        carbon_action=report.get("action")
    )
    
    embedding_model = "stella_15"
    emb_model = settings.embedders.model_fields[embedding_model].default

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

    edit_instruction = context + "\n\n" + user_instructions + "\n\n" + latest_content
    edit_instruction = edit_instruction.strip()

    edit_agent = AgentBase(genai_model=genai_model_variant, 
                           temperature=0.7, 
                           device=device, 
                           system_message=SYSTEM_PROMPT_AI_EDIT
                        )
    
    modified_section = None

    for _ in range(2):
        try:
            agent_out = edit_agent(edit_instruction, json_out=True)[0]
            modified_section = agent_out["modified_section"]
            break
        except:
            edit_agent.clear_history()
            logger.info("------------Some issue in processing Agent output or intialization, trying again...------------")

    if not modified_section:
        return GenericResponse(
            response = "Some issue occured during processing of Agent request...",
            status = Status.failed.value
        )

    return AIEditsResponse(
        section_id = str(section_id),
        modified_section=modified_section
    )
