from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.organization import Organization
from app.schemas.organization import OrganizationCreate, OrganizationUpdate


def create(db: Session, data: OrganizationCreate) -> Organization:
    organization = Organization(
        **data.model_dump(exclude_none=True),
    )
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization


def get(db: Session, organization_id: int) -> Organization | None:
    statement = (
        select(Organization)
        .options(selectinload(Organization.students))
        .where(Organization.id == organization_id)
    )
    return db.scalar(statement)


def list_page(db: Session, skip: int, limit: int) -> tuple[list[Organization], int]:
    items = list(
        db.scalars(
            select(Organization)
            .options(selectinload(Organization.students))
            .order_by(Organization.id)
            .offset(skip)
            .limit(limit)
        )
    )
    total = db.scalar(select(func.count()).select_from(Organization)) or 0
    return items, total


def update(db: Session, organization: Organization, data: OrganizationUpdate) -> Organization:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(organization, field, value)
    db.commit()
    db.refresh(organization)
    return organization


def delete(db: Session, organization: Organization) -> None:
    db.delete(organization)
    db.commit()
