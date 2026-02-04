# app/schemas/invite.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class AcceptInviteRequest(BaseModel):
    token: str
    # For new users
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)

class AcceptInviteResponse(BaseModel):
    message: str
    user_id: UUID
    workspace_id: UUID
    role: str
    workspace_name: str
    is_new_user: bool
    personal_workspace_id: Optional[UUID] = None

class InviteDetailsResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    workspace_name: str
    invited_by: Optional[str] = None
    email: str
    role: str
    status: str
    expires_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True