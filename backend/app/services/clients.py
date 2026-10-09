from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.client import Client
from app.repositories import clients as repository
from app.schemas.client import ClientCreate, ClientUpdate
from app.services.organizations import ensure_organization


def create(db: Session, organization_id: int, data: ClientCreate) -> Client:
    ensure_organization(db, organization_id)
    return repository.create(db, organization_id, data)


def get_or_404(db: Session, organization_id: int, client_id: int) -> Client:
    ensure_organization(db, organization_id)
    client = repository.get(db, organization_id, client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Клиент не найден")
    return client


def update(db: Session, client: Client, data: ClientUpdate) -> Client:
    return repository.update(db, client, data)


def delete(db: Session, client: Client) -> None:
    repository.delete(db, client)
