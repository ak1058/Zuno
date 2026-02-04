# app/routers/workspace.py 
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.dependencies import get_current_active_user
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.models.user import User
from app.schemas.workspace import (
    WorkspaceResponse, 
    WorkspaceCreate, 
    InviteTeamMemberRequest,
    InviteResponse,
    CreateWorkspaceResponse
)
from app.services.workspace_service import WorkspaceService
from uuid import UUID

router = APIRouter(prefix="/workspaces", tags=["workspaces"])

@router.get("/default", response_model=WorkspaceResponse)
async def get_default_workspace(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get user's default (first created) workspace
    """

    workspace = (
        db.query(Workspace)
        .filter(Workspace.owner_id == current_user.id)
        .order_by(Workspace.created_at.asc())
        .first()
    )

    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No workspace found for user"
        )

    return workspace

@router.post("/create", response_model=CreateWorkspaceResponse)
async def create_workspace(
    workspace_data: WorkspaceCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new workspace with plan validation
    """
    result = WorkspaceService.create_new_workspace(
        db=db,
        user_id=current_user.id,
        workspace_name=workspace_data.name,
        description=workspace_data.description
    )
    
    return CreateWorkspaceResponse(
        message="Workspace created successfully",
        workspace=result["workspace"],
        current_plan=result["current_plan"],
        workspace_count=result["workspace_count"],
        workspace_limit=result["workspace_limit"]
    )

@router.post("/{workspace_id}/invite", response_model=InviteResponse)
async def invite_team_member(
    workspace_id: UUID,
    invite_data: InviteTeamMemberRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Invite a team member to workspace
    Only owners and admins can invite members
    Validates seat limits based on current plan
    """
    result = WorkspaceService.invite_team_member(
        db=db,
        workspace_id=workspace_id,
        inviter_id=current_user.id,
        invitee_email=invite_data.email,
        role=invite_data.role
    )
    
    return InviteResponse(
        message=result["message"],
        invite_id=result["invite_id"],
        email=result["email"]
    )

@router.get("/my-workspaces", response_model=list[WorkspaceResponse])
async def get_my_workspaces(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all workspaces owned by the current user
    """
    workspaces = (
        db.query(Workspace)
        .filter(Workspace.owner_id == current_user.id)
        .order_by(Workspace.created_at.desc())
        .all()
    )
    
    return workspaces

@router.get("/{workspace_id}/members", response_model=list)
async def get_workspace_members(
    workspace_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all members of a workspace
    User must be a member of the workspace
    """
    # Check if user is a member of the workspace
    user_membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == current_user.id,
        WorkspaceMember.is_active == True
    ).first()
    
    if not user_membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this workspace"
        )
    
    # Get all active members
    members = (
        db.query(WorkspaceMember)
        .join(User, WorkspaceMember.user_id == User.id)
        .filter(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.is_active == True
        )
        .order_by(
            WorkspaceMember.role.desc(),  # Owners first, then admins, then members
            User.full_name.asc()
        )
        .all()
    )
    
    # Format response with user details
    member_list = []
    for member in members:
        member_data = {
            "id": member.id,
            "workspace_id": member.workspace_id,
            "user_id": member.user_id,
            "role": member.role,
            "is_active": member.is_active,
            "joined_at": member.joined_at,
            "user": {
                "id": member.user.id,
                "full_name": member.user.full_name,
                "email": member.user.email,
                "profile_picture": member.user.profile_picture
            }
        }
        member_list.append(member_data)
    
    return member_list