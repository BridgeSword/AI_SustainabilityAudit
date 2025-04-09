from fastapi import APIRouter, HTTPException
from core.schemas import (
    UserLoginRequest, 
    UserSignUpRequest, 
    UserChangePwdRequest, 
    UserDeleteAccountRequest,
    UserOperationResponse
)
from core.utils import get_logger
from database import mongo_db  

logger = get_logger(__name__)
router = APIRouter()

@router.post("/login", tags=["User Operations"], response_model=UserOperationResponse)
async def login(user_login_request: UserLoginRequest):
    user_email = user_login_request.user_email
    pwd = user_login_request.pwd

    collection = mongo_db["users"] 
    user = collection.find_one({"user_email": user_email})
    if user and user["pwd"] == pwd:
        return UserOperationResponse(
            success=True, 
            token=str(user["_id"]), 
            message="Login successful"
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid user email or password")

@router.post("/sign-up", tags=["User Operations"], response_model=UserOperationResponse)
async def signup(user_sign_up_request: UserSignUpRequest):
    user_email = user_sign_up_request.user_email
    pwd = user_sign_up_request.pwd

    collection = mongo_db["users"] 
    user = collection.find_one({"user_email": user_email})
    if user:
        return UserOperationResponse(success=False, message="User already exists")
    else:
        user = {"user_email": user_email, "pwd": pwd}
        result = collection.insert_one(user)
        return UserOperationResponse(
            success=True, 
            token=str(result.inserted_id), 
            message="User created successfully"
        )

@router.post("/change-pwd", tags=["User Operations"], response_model=UserOperationResponse)
async def change_pwd(user_change_pwd_request: UserChangePwdRequest):
    user_email = user_change_pwd_request.user_email
    old_pwd = user_change_pwd_request.old_pwd
    new_pwd = user_change_pwd_request.new_pwd

    collection = mongo_db["users"] 
    user = collection.find_one({"user_email": user_email})
    if user and user["pwd"] == old_pwd:
        collection.update_one({"user_email": user_email}, {"$set": {"pwd": new_pwd}})
        return UserOperationResponse(
            success=True, 
            token=str(user["_id"]), 
            message="Password changed successfully"
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid credentials")

@router.post("/delete-account", tags=["User Operations"], response_model=UserOperationResponse)
async def delete_account(user_delete_account_request: UserDeleteAccountRequest):
    user_email = user_delete_account_request.user_email
    pwd = user_delete_account_request.pwd

    collection = mongo_db["users"]  
    user = collection.find_one({"user_email": user_email})
    if user and user["pwd"] == pwd:
        collection.delete_one({"_id": user["_id"]})
        return UserOperationResponse(success=True, message="Account deleted successfully")
    else:
        raise HTTPException(status_code=400, detail="Invalid credentials")
