# app/services/workspace_service.py
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.models.subscription import Subscription
from app.models.invite import Invite
from app.models.user import User
from app.core.plan_config import PLANS
from app.utils.slug import create_slug
from datetime import datetime, timedelta
import secrets
from app.services.email_service import EmailService
from app.config import settings
from typing import Optional

class WorkspaceService:
    
    @staticmethod
    def create_default_workspace_for_user(db: Session, user_id: uuid.UUID, user_full_name: str):
        """
        Create default workspace for a new user after verification
        """
        try:
            # Extract first name from full name
            first_name = user_full_name.split()[0] if user_full_name.split() else "User"
            
            # Create workspace name
            workspace_name = f"{first_name}'s Workspace"
            
            # Create unique slug
            base_slug = create_slug(workspace_name)
            slug = base_slug
            counter = 1
            
            # Ensure slug is unique
            while db.query(Workspace).filter(Workspace.slug == slug).first():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            # Create workspace
            workspace = Workspace(
                name=workspace_name,
                slug=slug,
                owner_id=user_id,
                is_active=True
            )
            
            db.add(workspace)
            db.commit()
            db.refresh(workspace)
            
            # Create workspace member entry with owner role
            workspace_member = WorkspaceMember(
                workspace_id=workspace.id,
                user_id=user_id,
                role="owner",
                is_active=True
            )
            
            db.add(workspace_member)
            db.commit()
            
            return workspace
            
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create default workspace: {str(e)}"
            )
    
    @staticmethod
    def create_new_workspace(
        db: Session, 
        user_id: uuid.UUID, 
        workspace_name: str,
        description: Optional[str] = None
    ):
        """
        Create a new workspace for user with plan validation
        """
        try:
            # 1. Get user's subscription plan
            subscription = db.query(Subscription).filter(
                Subscription.owner_id == user_id
            ).first()
            
            if not subscription:
                # Create free subscription if not exists
                subscription = Subscription(
                    owner_id=user_id,
                    plan="free",
                    status="active"
                )
                db.add(subscription)
                db.commit()
                db.refresh(subscription)
            
            current_plan = subscription.plan
            
            # 2. Check workspace limit for the plan
            workspace_count = db.query(Workspace).filter(
                Workspace.owner_id == user_id
            ).count()
            
            plan_config = PLANS.get(current_plan, PLANS["free"])
            workspace_limit = plan_config["workspace_limit"]
            
            if workspace_count >= workspace_limit:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Workspace limit reached. Your {current_plan} plan allows only {workspace_limit} workspace(s)."
                )
            
            # 3. Create unique slug
            base_slug = create_slug(workspace_name)
            slug = base_slug
            counter = 1
            
            while db.query(Workspace).filter(Workspace.slug == slug).first():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            # 4. Create workspace
            workspace = Workspace(
                name=workspace_name,
                slug=slug,
                description=description,
                owner_id=user_id,
                is_active=True
            )
            
            db.add(workspace)
            db.commit()
            db.refresh(workspace)
            
            # 5. Add user as owner member
            workspace_member = WorkspaceMember(
                workspace_id=workspace.id,
                user_id=user_id,
                role="owner",
                is_active=True
            )
            
            db.add(workspace_member)
            db.commit()
            
            return {
                "workspace": workspace,
                "current_plan": current_plan,
                "workspace_count": workspace_count + 1,
                "workspace_limit": workspace_limit
            }
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create workspace: {str(e)}"
            )
    
    @staticmethod
    def invite_team_member(
        db: Session,
        workspace_id: uuid.UUID,
        inviter_id: uuid.UUID,
        invitee_email: str,
        role: str
    ):
        """
        Invite a team member to workspace with plan validation
        """
        try:
            # 1. Get workspace and verify inviter permissions
            workspace = db.query(Workspace).filter(
                Workspace.id == workspace_id,
                Workspace.is_active == True
            ).first()
            
            if not workspace:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Workspace not found"
                )
            
            # 2. Check if inviter is owner or admin of the workspace
            inviter_membership = db.query(WorkspaceMember).filter(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == inviter_id,
                WorkspaceMember.is_active == True
            ).first()
            
            if not inviter_membership:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not a member of this workspace"
                )
            
            if inviter_membership.role not in ["owner", "admin"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only owners and admins can invite members"
                )
            
            # 3. Get inviter's subscription for seat limit check
            subscription = db.query(Subscription).filter(
                Subscription.owner_id == workspace.owner_id
            ).first()
            
            if not subscription:
                subscription = Subscription(
                    owner_id=workspace.owner_id,
                    plan="free",
                    status="active"
                )
                db.add(subscription)
                db.commit()
            
            current_plan = subscription.plan
            plan_config = PLANS.get(current_plan, PLANS["free"])
            seat_limit = plan_config["seat_limit"]
            
            # 4. Count current active members in workspace
            current_members_count = db.query(WorkspaceMember).filter(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.is_active == True
            ).count()
            
            if current_members_count >= seat_limit:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Seat limit reached. Your {current_plan} plan allows only {seat_limit} members per workspace."
                )
            
            # 5. Check if user already exists in system
            existing_user = db.query(User).filter(
                User.email == invitee_email,
                User.is_verified == True
            ).first()
            
            # 6. Check if user is already a member
            if existing_user:
                existing_membership = db.query(WorkspaceMember).filter(
                    WorkspaceMember.workspace_id == workspace_id,
                    WorkspaceMember.user_id == existing_user.id
                ).first()
                
                if existing_membership:
                    if existing_membership.is_active:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="User is already a member of this workspace"
                        )
                    else:
                        # Reactivate membership
                        existing_membership.is_active = True
                        existing_membership.role = role
                        db.commit()
                        
                        return {
                            "message": "Member reactivated",
                            "invite_id": None,
                            "email": invitee_email,
                            "user_exists": True
                        }
            
            # 7. Check if pending invite exists
            existing_invite = db.query(Invite).filter(
                Invite.workspace_id == workspace_id,
                Invite.email == invitee_email,
                Invite.status == "pending",
                Invite.expires_at > datetime.utcnow()
            ).first()
            
            if existing_invite:
                # Update existing invite
                existing_invite.role = role
                existing_invite.expires_at = datetime.utcnow() + timedelta(days=7)
                db.commit()
                
                # Send invitation email
                invite_link = f"{settings.FRONTEND_URL}/accept-invite?token={existing_invite.token}"
                EmailService.send_invitation_email(
                    to_email=invitee_email,
                    workspace_name=workspace.name,
                    inviter_name=inviter_membership.user.full_name,
                    invite_link=invite_link,
                    role=role
                )
                
                return {
                    "message": "Invitation resent",
                    "invite_id": existing_invite.id,
                    "email": invitee_email,
                    "user_exists": bool(existing_user)
                }
            
            # 8. Create new invite
            invite_token = secrets.token_urlsafe(32)
            invite = Invite(
                workspace_id=workspace_id,
                email=invitee_email,
                role=role,
                token=invite_token,
                status="pending",
                expires_at=datetime.utcnow() + timedelta(days=7)  # 7 days expiry
            )
            
            db.add(invite)
            db.commit()
            db.refresh(invite)
            
            # 9. Send invitation email
            invite_link = f"{settings.FRONTEND_URL}/accept-invite?token={invite_token}"
            EmailService.send_invitation_email(
                to_email=invitee_email,
                workspace_name=workspace.name,
                inviter_name=inviter_membership.user.full_name,
                invite_link=invite_link,
                role=role
            )
            
            return {
                "message": "Invitation sent successfully",
                "invite_id": invite.id,
                "email": invitee_email,
                "user_exists": bool(existing_user)
            }
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send invitation: {str(e)}"
            )