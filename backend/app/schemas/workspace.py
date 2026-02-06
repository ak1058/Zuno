# app/schemas/workspace.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class WorkspaceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceResponse(WorkspaceBase):
    id: UUID
    slug: str
    owner_id: UUID
    is_active: bool
    created_at: datetime
    user_role: str  
    is_owner: bool  
    
    class Config:
        from_attributes = True

class WorkspaceMemberResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    user_id: UUID
    role: str
    is_active: bool
    joined_at: datetime
    
    class Config:
        from_attributes = True

# New schemas for invite functionality
class InviteTeamMemberRequest(BaseModel):
    email: EmailStr
    role: str = Field(..., pattern="^(owner|admin|member)$")
    
class InviteResponse(BaseModel):
    message: str
    invite_id: UUID
    email: str
    
class CreateWorkspaceResponse(BaseModel):
    message: str
    workspace: WorkspaceResponse
    current_plan: str
    workspace_count: int
    workspace_limit: int