from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate


def create(db: Session, organization_id: int, data: ClientCreate) -> Client:
    client = Client(organization_id=organization_id, **data.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


def get(db: Session, organization_id: int, client_id: int) -> Client | None:
    return db.scalar(select(Client).where(Client.organization_id == organization_id, Client.id == client_id))


def list_page(db: Session, organization_id: int, skip: int, limit: int, search: str | None) -> tuple[list[Client], int]:
    conditions = [Client.organization_id == organization_id]
    if search:
        pattern = f"%{search.strip()}%"
        conditions.append(or_(Client.name.ilike(pattern), Client.segment.ilike(pattern), Client.contact.ilike(pattern)))
    items = list(db.scalars(select(Client).where(*conditions).order_by(Client.created_at.desc(), Client.id.desc()).offset(skip).limit(limit)))
    total = db.scalar(select(func.count()).select_from(Client).where(*conditions)) or 0
    return items, total


def update(db: Session, client: Client, data: ClientUpdate) -> Client:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(client, field, value)
    db.commit()
    db.refresh(client)
    return client


def delete(db: Session, client: Client) -> None:
    db.delete(client)
    db.commit()


def summary(db: Session, organization_id: int) -> dict[str, int]:
    rows = db.execute(
        select(Client.status, func.count(Client.id))
        .where(Client.organization_id == organization_id)
        .group_by(Client.status)
    ).all()
    counts = {status: count for status, count in rows}
    return {
        "total_clients": sum(counts.values()),
        "active_clients": counts.get("active", 0),
        "new_clients": counts.get("new", 0),
        "attention_clients": counts.get("attention", 0),
    }
