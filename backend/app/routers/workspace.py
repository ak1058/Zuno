# app/routers/workspace.py 
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.dependencies import get_current_active_user
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.schemas.workspace import WorkspaceResponse

router = APIRouter(prefix="/workspaces", tags=["workspaces"])

@router.get("/default", response_model=WorkspaceResponse)
async def get_default_workspace(
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get user's default workspace (first workspace they own)
    """
    try:
        workspace = db.query(Workspace).filter(
            Workspace.owner_id == current_user.id
        ).first()
    except Exception as e:
        print("Exception in fetching workspace", e)
        
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No workspace found for user"
        )
    
    return workspace