from fastapi import APIRouter, Depends, Path, Query, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories import organizations as repository
from app.schemas.organization import OrganizationCreate, OrganizationList, OrganizationRead, OrganizationUpdate
from app.services import organizations as service

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.post("", response_model=OrganizationRead, status_code=status.HTTP_201_CREATED, summary="Создать организацию")
def create_organization(data: OrganizationCreate, db: Session = Depends(get_db)) -> OrganizationRead:
    return service.create(db, data)


@router.get("", response_model=OrganizationList, summary="Получить организации")
def list_organizations(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
) -> OrganizationList:
    items, total = repository.list_page(db, skip=skip, limit=limit)
    return OrganizationList(items=items, total=total)


@router.get("/{organization_id}", response_model=OrganizationRead, summary="Получить организацию и её учеников")
def get_organization(organization_id: int = Path(gt=0), db: Session = Depends(get_db)) -> OrganizationRead:
    return service.get_or_404(db, organization_id)


@router.patch("/{organization_id}", response_model=OrganizationRead, summary="Изменить настройки организации")
def update_organization(
    data: OrganizationUpdate,
    organization_id: int = Path(gt=0),
    db: Session = Depends(get_db),
) -> OrganizationRead:
    organization = service.get_or_404(db, organization_id)
    return service.update(db, organization, data)


@router.delete("/{organization_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Удалить организацию")
def delete_organization(organization_id: int = Path(gt=0), db: Session = Depends(get_db)) -> Response:
    organization = service.get_or_404(db, organization_id)
    service.delete(db, organization)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
