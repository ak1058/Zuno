from app.database import engine, Base

# import all models here
from app.models.user import User
from app.models.invite import Invite
from app.models.project import Project
from app.models.subscription import Subscription
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember

def init():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Done ✅")

if __name__ == "__main__":
    init()
