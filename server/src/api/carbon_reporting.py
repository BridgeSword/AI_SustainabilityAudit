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
from ..services.celery_tasks.report_generation import start_generating

from ..ws.manager import WSConnectionManager

from ..agents.prompts import USER_INSTRUCTIONS
from ..core.constants import Constants, WebsocketStatus


logger = get_logger(__name__)

router = APIRouter()

ws_manager = WSConnectionManager()


@router.websocket("/ws/plan_generate")
async def plan_report_ws(
    websocket: WebSocket
):
    
    await ws_manager.connect(websocket)
    
    # Need to update all these by saving and fetching the values from MongoDB
    cr_plan_obj = CRPlanRequest()
    generated_plan = None
    user_modification_request = None
    user_instructions = None
    req_threshold = None
    completed = False

    current_status = WebsocketStatus.plan.value

    try:
        while True:
            if current_status == WebsocketStatus.plan.value:
                if user_modification_request is None:
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
                    
                    current_status = WebsocketStatus.user_acceptance.value

                else:
                    # handle the user_modification flow
                    # need to modify the way in which history of the planning agent is maintained
                    pass
            
            elif current_status == WebsocketStatus.user_acceptance.value:
                user_accepted = await websocket.receive_json()

                if user_accepted["proceed"]:
                    current_status = WebsocketStatus.generate.value
                    continue
                else:
                    user_modification_request = user_accepted["user_comment"]
                    current_status == WebsocketStatus.plan.value
                
            elif current_status == WebsocketStatus.generate.value:
                report_gen_task = start_generating.apply_async(
                    args=[cr_plan_obj, user_instructions, generated_plan]
                )

                while not report_gen_task.ready():
                    await asyncio.sleep(1)

                generated_report = report_gen_task.get()

                if generated_report is None:
                    await ws_manager.send_json_obj(
                        CRPlanResponse(
                            task_status = Status.failed.value,
                            error = "Generation step failed!"
                        ).json(), websocket)

                    await ws_manager.disconnect_and_close(websocket)
                        
                    break

                report_response = {}

                for report_dict in generated_report:
                    report_response[report_dict["section"]] = report_dict["agent_output"]
                
                # Add References to generated report independently by fetching it from public sources and vector database

                # Stitch the whole report and save the PDF File

                await ws_manager.send_json_obj(
                    CRPlanResponse(
                        task_status = Status.success.value,
                        response = generated_report
                    ).json(), websocket)
                
                completed = True
            
            if completed:
                await ws_manager.disconnect_and_close(websocket)
                break
            
        if websocket in ws_manager.active_connections:
            await ws_manager.disconnect_and_close(websocket)

    except WebSocketDisconnect:
        await ws_manager.broadcast("Some issue occured!")
        await ws_manager.disconnect_and_close(websocket)

