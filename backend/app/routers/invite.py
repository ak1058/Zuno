# app/routers/invite.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.dependencies import get_current_active_user
from app.models.invite import Invite
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.schemas.workspace import InviteTeamMemberRequest
from app.schemas.invite import (
    AcceptInviteRequest, 
    AcceptInviteResponse,
    InviteDetailsResponse
)
from app.services.invite_service import InviteService
from datetime import datetime
from uuid import UUID
from app.config import settings

router = APIRouter(prefix="/invites", tags=["invites"])

@router.get("/details/{token}", response_model=InviteDetailsResponse)
async def get_invite_details(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Get invite details for the acceptance page
    No authentication required
    """
    result = InviteService.get_invite_details(db, token)
    
    return InviteDetailsResponse(
        id=result["invite"].id,
        workspace_id=result["invite"].workspace_id,
        workspace_name=result["workspace_name"],
        invited_by=result["inviter_name"],
        email=result["invite"].email,
        role=result["invite"].role,
        status=result["invite"].status,
        expires_at=result["invite"].expires_at,
        created_at=result["invite"].created_at
    )

@router.post("/accept")
async def accept_invite(
    accept_data: AcceptInviteRequest,
    db: Session = Depends(get_db)
):
    """
    Accept a workspace invitation
    Handles both existing users and new user registration
    """
    result = InviteService.accept_invite(
        db=db,
        token=accept_data.token,
        full_name=accept_data.full_name,
        password=accept_data.password
    )
    
    return {
        "message": "Invitation accepted successfully",
        "access_token": result["access_token"],
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": result["user"].id,
            "email": result["user"].email,
            "full_name": result["user"].full_name,
            "is_verified": result["user"].is_verified
        },
        "workspace": {
            "id": result["workspace"].id,
            "name": result["workspace"].name,
            "slug": result["workspace"].slug
        },
        "role": result["role"],
        "is_new_user": result["is_new_user"],
        "personal_workspace_id": result["personal_workspace_id"]
    }

@router.post("/{token}/decline")
async def decline_invite(
    token: str,
    email: str = Query(..., description="Email address of the invitee"),
    db: Session = Depends(get_db)
):
    """
    Decline a workspace invitation
    """
    result = InviteService.decline_invite(db, token, email)
    return result

@router.get("/pending", response_model=list[InviteDetailsResponse])
async def get_pending_invites(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get pending invites for the current user's email
    """
    pending_invites = (
        db.query(Invite)
        .join(Workspace, Invite.workspace_id == Workspace.id)
        .filter(
            Invite.email == current_user.email,
            Invite.status == "pending",
            Invite.expires_at > datetime.utcnow()
        )
        .all()
    )
    
    # Format response
    invites_list = []
    for invite in pending_invites:
        inviter_name = None
        if invite.invited_by:
            inviter = db.query(User).filter(User.id == invite.invited_by).first()
            inviter_name = inviter.full_name if inviter else None
        
        invites_list.append(InviteDetailsResponse(
            id=invite.id,
            workspace_id=invite.workspace_id,
            workspace_name=invite.workspace.name if invite.workspace else invite.invited_to_workspace_name,
            invited_by=inviter_name,
            email=invite.email,
            role=invite.role,
            status=invite.status,
            expires_at=invite.expires_at,
            created_at=invite.created_at
        ))
    
    return invites_list

@router.get("/{workspace_id}/sent-invites")
async def get_sent_invites(
    workspace_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all invites sent for a workspace (admin/owner only)
    """
    # Check if user is owner/admin of the workspace
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == current_user.id,
        WorkspaceMember.is_active == True,
        WorkspaceMember.role.in_(["owner", "admin"])
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners and admins can view sent invites"
        )
    
    invites = (
        db.query(Invite)
        .filter(
            Invite.workspace_id == workspace_id
        )
        .order_by(Invite.created_at.desc())
        .all()
    )
    
    invites_list = []
    for invite in invites:
        inviter_name = None
        if invite.invited_by:
            inviter = db.query(User).filter(User.id == invite.invited_by).first()
            inviter_name = inviter.full_name if inviter else None
        
        # Check if user exists
        user_exists = db.query(User).filter(
            User.email == invite.email,
            User.is_verified == True
        ).first() is not None
        
        invites_list.append({
            "id": invite.id,
            "email": invite.email,
            "role": invite.role,
            "status": invite.status,
            "invited_by": inviter_name,
            "created_at": invite.created_at,
            "expires_at": invite.expires_at,
            "accepted_at": invite.accepted_at,
            "user_exists": user_exists
        })
    
    return invites_list