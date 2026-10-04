from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.repositories import organizations as repository
from app.schemas.organization import OrganizationCreate, OrganizationUpdate


def create(db: Session, data: OrganizationCreate) -> Organization:
    try:
        return repository.create(db, data)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Организация с таким email владельца уже существует",
        ) from error


def get_or_404(db: Session, organization_id: int) -> Organization:
    organization = repository.get(db, organization_id)
    if organization is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Организация не найдена")
    return organization


def ensure_organization(db: Session, organization_id: int) -> None:
    if repository.get(db, organization_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Организация не найдена")


def update(db: Session, organization: Organization, data: OrganizationUpdate) -> Organization:
    if not data.model_fields_set:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Не переданы поля для обновления")
    try:
        return repository.update(db, organization, data)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Организация с таким email владельца уже существует",
        ) from error


def delete(db: Session, organization: Organization) -> None:
    repository.delete(db, organization)
