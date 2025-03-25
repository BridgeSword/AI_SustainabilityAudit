import time
import asyncio
from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse

from ..core.utils import get_logger
from ..core.schemas import *
from ..core.config import GAIModels
from ..core.constants import Status

from ..services.celery_tasks.report_planning import start_planning, start_thresholding

from ..ws.manager import WSConnectionManager

from ..agents.prompts import USER_INSTRUCTIONS
from ..core.constants import Constants


logger = get_logger(__name__)

router = APIRouter()

ws_manager = WSConnectionManager()

# Need to update this by saving and fetching the values from Moongo DB
cr_plan_obj = CRPlanRequest()


@router.websocket("/ws/plan")
async def plan_report_ws(
    websocket: WebSocket
):
    
    await ws_manager.connect(websocket)

    try:
        while True:
            cr_plan_req = await websocket.receive_json()
            
            cr_std = Constants[cr_plan_req["standard"].upper()].value
            cr_std_prompt = f"{cr_std.full_form}: {cr_std.description}"
            
            cr_plan_obj.standard = cr_std_prompt
            cr_plan_obj.goal = cr_plan_req["goal"]
            cr_plan_obj.plan = cr_plan_req["plan"]
            cr_plan_obj.action = cr_plan_req["action"]
            cr_plan_obj.company = cr_plan_req["company"]

            cr_plan_obj.device = cr_plan_req["device"]

            user_instructions = USER_INSTRUCTIONS.format(
                company=cr_plan_obj.company.upper(),
                carbon_std=cr_plan_obj.standard, 
                carbon_goal=cr_plan_obj.goal, 
                carbon_plan=cr_plan_obj.plan, 
                carbon_action=cr_plan_obj.action
            )

            gai_model = cr_plan_req["genai_model"].lower().split("-")

            if len(gai_model) < 2:
                await ws_manager.send_json_obj(
                    CRPlanResponse(
                        task_status = Status.failed.value,
                        error = "No GenAI Model specified or the variant is not supported!"
                    ).json(), websocket)

                await ws_manager.disconnect_and_close(websocket)
                
                break

            genai_models = GAIModels.mapping().get(gai_model[0], None)
            genai_model_variant = genai_models.get("-".join(gai_model[1:]), None)

            cr_plan_obj.genai_model = genai_model_variant

            threshold_task = start_thresholding.apply_async(
                args=[cr_plan_obj, user_instructions]
            )

            while not threshold_task.ready():
                await asyncio.sleep(1)

            req_threshold = threshold_task.get()
            
            if req_threshold is None:
                await ws_manager.send_json_obj(
                    CRPlanResponse(
                        task_status = Status.failed.value,
                        error = "Thresholding step failed!"
                    ).json(), websocket)

                await ws_manager.disconnect_and_close(websocket)
                
                break

            await ws_manager.send_json_obj(
                CRPlanResponse(
                    task_status = Status.success.value,
                    response = "Thresholding completed! Moving to Planning now..."
                ).json(), websocket)
            
            planning_task = start_planning.apply_async(
                args=[cr_plan_obj, user_instructions, req_threshold]
            )

            while not planning_task.ready():
                await asyncio.sleep(1)

            generated_plan = planning_task.get()

            if generated_plan is None:
                await ws_manager.send_json_obj(
                    CRPlanResponse(
                        task_status = Status.failed.value,
                        error = "Planning step failed!"
                    ).json(), websocket)

                await ws_manager.disconnect_and_close(websocket)
                
                break

            await ws_manager.send_json_obj(
                CRPlanResponse(
                    task_status = Status.success.value,
                    response = generated_plan
                ).json(), websocket)
            
            await ws_manager.disconnect_and_close(websocket)
            break
            

        await ws_manager.disconnect_and_close(websocket)

    except WebSocketDisconnect:
        await ws_manager.broadcast("Some issue occured!")
        await ws_manager.disconnect_and_close(websocket)


# @router.post(
#         "/plan_report", 
#         tags=["Report Planning"], 
#         description="Starts Carbon Report Planning by automatically taking care of Carbon action, plan and goal!", 
#         response_model=CarbonReportPlanResponse)
# async def plan_report(
#     cr_plan_request: CarbonReportPlanRequest, 
# ):
#     carbon_std = cr_plan_request.standard
#     carbon_goal = cr_plan_request.goal
#     carbon_plan = cr_plan_request.plan
#     carbon_action = cr_plan_request.action
#     target_company = cr_plan_request.company
#     genai_model = cr_plan_request.genai_model
#     device = cr_plan_request.device

#     plan_response = CarbonReportPlanResponse()

#     gai_model = genai_model.lower().split("-")

#     if len(gai_model) < 2:
#         plan_response.task_status = Status.failed.value
#         plan_response.error = "No GenAI Model specified or the variant is not supported!"
#         return plan_response

#     genai_models = GAIModels.mapping().get(gai_model[0], None)
#     genai_model_variant = genai_models.get("-".join(gai_model[1:]), None)

#     if not genai_models:
#         plan_response.task_status = Status.failed.value
#         plan_response.error = "Specified GenAI Model is not supported or doesn't exist"
#         return plan_response
    
#     elif not genai_model_variant:
#         plan_response.task_status = Status.failed.value
#         plan_response.error = "Specified Model Variant is not supported or doesn't exist"
#         return plan_response
    
#     ai_client = None

#     GAIModels

#     logger.info("Automated Carbon Plan initialization in progress")

#     planning_task = start_planning.apply_async(
#         args=[carbon_std, carbon_goal, carbon_plan, carbon_action, target_company, genai_model, device]
#     )

#     plan_response.task_status = Status.started.value
#     plan_response.task_id = planning_task.id

#     return plan_response


# @router.post(
#         "/report_generation", 
#         tags=["Report Generation"], 
#         description="Starts Report Generation after all checks are completed", 
#         response_model=CarbonReportGenResponse)
# # @router.websocket("/report_generation_ws")
# async def report_generation(
#     # cr_gen_request: CarbonReportGenRequest
    
# ):
    
#     user_approved = cr_gen_request.user_approved

#     cr_gen_resp = CarbonReportGenResponse()

#     if not user_approved:
#         cr_gen_resp.report_status = Status.invalid.value
#         return cr_gen_resp

#     cr_gen_resp.report_status = Status.started.value

#     return cr_gen_resp
