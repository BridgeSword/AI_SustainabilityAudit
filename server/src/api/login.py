import asyncio

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from ..core.utils import get_logger
from ..core.schemas import UserLoginRequest, UserSignUpRequest, UserChangePwdRequest, UserDeleteAccountRequest
from ..core.schemas import UserOperationResponse
from server.src.extension import  core_db  as db, get_mongo_client


from ..db.mongo.user import UserModel


logger = get_logger(__name__)

router = APIRouter()

user_collection = db.get_collection("users")

@router.post("/login", tags=["User Operations"], response_model=UserOperationResponse)
async def login(user_login_request: UserLoginRequest):
    user_email = user_login_request.user_email
    password = user_login_request.password

    user_operation_response = UserOperationResponse()
    success = False

    user = await user_collection.find_one({"email": user_email})
    if user and user["password"] == password:
        success = True
    else:
        # user not found or password does not match
        pass

    user_operation_response.success = success
    user_operation_response.user_id = str(user["_id"]) if success else None
    user_operation_response.message = "Login successful" if success else "Invalid user email or password"
    return user_operation_response


@router.post("/sign-up", tags=["User Operations"], response_model=UserOperationResponse)
async def signup(user_sign_up_request: UserSignUpRequest):
    user_info = UserModel(
        email=user_sign_up_request.user_email,
        password=user_sign_up_request.password
    )

    user_operation_response = UserOperationResponse()
    success = False
    message = ""

    user = await user_collection.find_one({"email": user_sign_up_request.user_email})
    if user:
        success = False
        message = "User already exists"
    else:
      result = await user_collection.insert_one(user_info.model_dump(by_alias=True, exclude=["id"]))
      message = "User created successfully"
      success = True
    
    user_operation_response.success = success
    user_operation_response.user_id = str(result.inserted_id) if success else None
    user_operation_response.message = message
    return user_operation_response


@router.post("/change-pwd", tags=["User Operations"], response_model=UserOperationResponse)
async def change_pwd(user_change_pwd_request: UserChangePwdRequest):
    user_email = user_change_pwd_request.user_email
    old_password = user_change_pwd_request.old_password
    new_password = user_change_pwd_request.new_password

    user_operation_response = UserOperationResponse()
    success = False
    message = ""

    user = await user_collection.find_one({"email": user_email})
    if user and user["password"] == old_password:
        await user_collection.update_one({"email": user_email}, {"$set": {"password": new_password}})
        success = True
        message = "Password changed successfully"
    else:
        success = False
        message = "Invalid credentials"

    user_operation_response.success = success
    user_operation_response.user_id = str(user["_id"]) if success else None
    user_operation_response.message = message
    return user_operation_response


@router.post("/delete-account", tags=["User Operations"])
async def delete_account(user_delete_account_request: UserDeleteAccountRequest):
    user_email = user_delete_account_request.user_email
    password = user_delete_account_request.password

    user_operation_response = UserOperationResponse()
    success = False
    message = "Invalid credentials"

    user = await user_collection.find_one({"email": user_email})
    if user:
        if user["passord"] == password:
            await user_collection.delete_one({"_id": user["_id"]})
            success = True
            message = "Account deleted successfully" 

    user_operation_response.success = success
    user_operation_response.user_id = str(user["_id"]) if success else None
    user_operation_response.message = message
    return user_operation_response