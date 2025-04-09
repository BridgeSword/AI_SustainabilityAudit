
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserLoginRequest(BaseModel):
    user_email: EmailStr
    pwd: str

class UserSignUpRequest(BaseModel):
    user_email: EmailStr
    pwd: str

class UserChangePwdRequest(BaseModel):
    user_email: EmailStr
    old_pwd: str
    new_pwd: str

class UserDeleteAccountRequest(BaseModel):
    user_email: EmailStr
    pwd: str

class UserOperationResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    message: str
