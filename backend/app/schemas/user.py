# app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

# Base schemas
class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserVerify(BaseModel):
    token: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    id: UUID
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# UPDATED: Removed refresh_token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # Token expiry in seconds (optional but useful for frontend)

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None