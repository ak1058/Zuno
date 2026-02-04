# app/services/workspace_service.py
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.models.subscription import Subscription
from app.utils.slug import create_slug

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
