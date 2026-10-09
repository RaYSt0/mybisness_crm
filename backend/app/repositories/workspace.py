from sqlalchemy.orm import Session

from app.models.workspace_configuration import WorkspaceConfiguration


def get_configuration(db: Session, organization_id: int) -> WorkspaceConfiguration | None:
    return db.get(WorkspaceConfiguration, organization_id)


def save_configuration(db: Session, organization_id: int, content: dict) -> WorkspaceConfiguration:
    current = get_configuration(db, organization_id)
    if current is None:
        current = WorkspaceConfiguration(organization_id=organization_id, version=1, content=content)
        db.add(current)
    else:
        current.version += 1
        current.content = content
    db.commit()
    db.refresh(current)
    return current
