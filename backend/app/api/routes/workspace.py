from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories import clients as client_repository
from app.repositories import workspace as repository
from app.schemas.workspace import DashboardSummary, WorkspaceConfigurationRead, WorkspaceConfigurationWrite
from app.services.organizations import ensure_organization

router = APIRouter(prefix="/organizations/{organization_id}", tags=["workspace"])


@router.put("/workspace", response_model=WorkspaceConfigurationRead, summary="Сохранить конфигурацию рабочего пространства")
def save_workspace(
    data: WorkspaceConfigurationWrite,
    organization_id: int = Path(gt=0),
    db: Session = Depends(get_db),
) -> WorkspaceConfigurationRead:
    ensure_organization(db, organization_id)
    saved = repository.save_configuration(db, organization_id, data.configuration)
    return WorkspaceConfigurationRead(organization_id=organization_id, version=saved.version, configuration=saved.content)


@router.get("/workspace", response_model=WorkspaceConfigurationRead, summary="Получить конфигурацию рабочего пространства")
def get_workspace(organization_id: int = Path(gt=0), db: Session = Depends(get_db)) -> WorkspaceConfigurationRead:
    ensure_organization(db, organization_id)
    saved = repository.get_configuration(db, organization_id)
    if saved is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Конфигурация рабочего пространства не найдена")
    return WorkspaceConfigurationRead(organization_id=organization_id, version=saved.version, configuration=saved.content)


@router.get("/dashboard-summary", response_model=DashboardSummary, summary="Рассчитать сводку клиентов на сервере")
def dashboard_summary(organization_id: int = Path(gt=0), db: Session = Depends(get_db)) -> DashboardSummary:
    ensure_organization(db, organization_id)
    return DashboardSummary(**client_repository.summary(db, organization_id))
