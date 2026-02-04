# app/services/invite_service.py
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from app.models.invite import Invite
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.models.subscription import Subscription
from app.utils.security import get_password_hash, create_access_token
from app.services.workspace_service import WorkspaceService
from app.config import settings
from app.core.plan_config import PLANS
from typing import Optional

class InviteService:
    
    @staticmethod
    def get_invite_details(db: Session, token: str):
        """
        Get invite details for the acceptance page
        """
        invite = db.query(Invite).filter(
            Invite.token == token,
            Invite.status == "pending"
        ).first()
        
        if not invite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found or already used"
            )
        
        # Check if invite is expired
        if invite.expires_at and invite.expires_at < datetime.utcnow():
            invite.status = "expired"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This invitation has expired"
            )
        
        # Get workspace details
        workspace = db.query(Workspace).filter(
            Workspace.id == invite.workspace_id
        ).first()
        
        # Get inviter details
        inviter_name = None
        if invite.invited_by:
            inviter = db.query(User).filter(User.id == invite.invited_by).first()
            inviter_name = inviter.full_name if inviter else None
        
        return {
            "invite": invite,
            "workspace_name": workspace.name if workspace else invite.invited_to_workspace_name,
            "inviter_name": inviter_name
        }
    
    @staticmethod
    def accept_invite(
        db: Session,
        token: str,
        full_name: Optional[str] = None,
        password: Optional[str] = None
    ):
        """
        Accept workspace invitation
        Handles both existing users and new users
        """
        try:
            # 1. Get and validate invite
            invite = db.query(Invite).filter(
                Invite.token == token,
                Invite.status == "pending"
            ).first()
            
            if not invite:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Invitation not found or already used"
                )
            
            if invite.expires_at and invite.expires_at < datetime.utcnow():
                invite.status = "expired"
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_410_GONE,
                    detail="This invitation has expired"
                )
            
            # 2. Check if user exists
            existing_user = db.query(User).filter(
                User.email == invite.email,
                User.is_verified == True
            ).first()
            
            is_new_user = False
            user = existing_user
            
            # 3. Handle new user registration
            if not existing_user:
                if not full_name or not password:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="New users must provide full name and password"
                    )
                
                # Create new user
                user = User(
                    full_name=full_name,
                    email=invite.email,
                    hashed_password=get_password_hash(password),
                    is_verified=True,  # Auto-verify since they came through invite
                    is_active=True
                )
                
                db.add(user)
                db.commit()
                db.refresh(user)
                is_new_user = True
                
                # 4. Create FREE subscription for new user
                subscription = Subscription(
                    owner_id=user.id,
                    plan="free",
                    status="active"
                )
                db.add(subscription)
                db.commit()
                
                # 5. Create personal workspace for new user
                personal_workspace = WorkspaceService.create_default_workspace_for_user(
                    db=db,
                    user_id=user.id,
                    user_full_name=user.full_name
                )
                
                personal_workspace_id = personal_workspace.id if personal_workspace else None
            else:
                personal_workspace_id = None
            
            # 6. Get workspace details
            workspace = db.query(Workspace).filter(
                Workspace.id == invite.workspace_id,
                Workspace.is_active == True
            ).first()
            
            if not workspace:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Workspace not found or inactive"
                )
            
            # 7. Check subscription seat limits
            subscription = db.query(Subscription).filter(
                Subscription.owner_id == workspace.owner_id
            ).first()
            
            if subscription:
                current_plan = subscription.plan
                plan_config = PLANS.get(current_plan, PLANS["free"])
                seat_limit = plan_config["seat_limit"]
                
                # Count current active members
                current_members_count = db.query(WorkspaceMember).filter(
                    WorkspaceMember.workspace_id == workspace.id,
                    WorkspaceMember.is_active == True
                ).count()
                
                if current_members_count >= seat_limit:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Workspace has reached its member limit of {seat_limit} for {current_plan} plan"
                    )
            
            # 8. Check if user is already a member
            existing_membership = db.query(WorkspaceMember).filter(
                WorkspaceMember.workspace_id == workspace.id,
                WorkspaceMember.user_id == user.id
            ).first()
            
            if existing_membership:
                if existing_membership.is_active:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="You are already a member of this workspace"
                    )
                else:
                    # Reactivate membership
                    existing_membership.is_active = True
                    existing_membership.role = invite.role
                    db.commit()
            else:
                # Create new membership
                workspace_member = WorkspaceMember(
                    workspace_id=workspace.id,
                    user_id=user.id,
                    role=invite.role,
                    is_active=True
                )
                db.add(workspace_member)
                db.commit()
            
            # 9. Update invite status
            invite.status = "accepted"
            invite.accepted_at = datetime.utcnow()
            db.commit()
            
            # 10. Generate access token for the user
            access_token = create_access_token(
                data={"sub": user.email, "user_id": str(user.id)}
            )
            
            return {
                "user": user,
                "access_token": access_token,
                "workspace": workspace,
                "role": invite.role,
                "is_new_user": is_new_user,
                "personal_workspace_id": personal_workspace_id
            }
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to accept invitation: {str(e)}"
            )
    
    @staticmethod
    def decline_invite(db: Session, token: str, email: str):
        """
        Decline a workspace invitation
        """
        invite = db.query(Invite).filter(
            Invite.token == token,
            Invite.email == email,
            Invite.status == "pending"
        ).first()
        
        if not invite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found or already processed"
            )
        
        invite.status = "declined"
        db.commit()
        
        return {"message": "Invitation declined successfully"}