from fastapi import APIRouter, Depends, Path, Query, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories import clients as repository
from app.schemas.client import ClientCreate, ClientList, ClientRead, ClientUpdate
from app.services import clients as service
from app.services.organizations import ensure_organization

router = APIRouter(prefix="/organizations/{organization_id}/clients", tags=["clients"])


@router.post("", response_model=ClientRead, status_code=status.HTTP_201_CREATED, summary="Добавить клиента")
def create_client(data: ClientCreate, organization_id: int = Path(gt=0), db: Session = Depends(get_db)) -> ClientRead:
    return service.create(db, organization_id, data)


@router.get("", response_model=ClientList, summary="Список клиентов организации")
def list_clients(
    organization_id: int = Path(gt=0),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    search: str | None = Query(default=None, min_length=1, max_length=100),
    db: Session = Depends(get_db),
) -> ClientList:
    ensure_organization(db, organization_id)
    items, total = repository.list_page(db, organization_id, skip, limit, search)
    return ClientList(items=items, total=total)


@router.get("/{client_id}", response_model=ClientRead, summary="Получить карточку клиента")
def get_client(organization_id: int = Path(gt=0), client_id: int = Path(gt=0), db: Session = Depends(get_db)) -> ClientRead:
    return service.get_or_404(db, organization_id, client_id)


@router.patch("/{client_id}", response_model=ClientRead, summary="Изменить данные клиента")
def update_client(
    data: ClientUpdate,
    organization_id: int = Path(gt=0),
    client_id: int = Path(gt=0),
    db: Session = Depends(get_db),
) -> ClientRead:
    client = service.get_or_404(db, organization_id, client_id)
    return service.update(db, client, data)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Удалить клиента")
def delete_client(organization_id: int = Path(gt=0), client_id: int = Path(gt=0), db: Session = Depends(get_db)) -> Response:
    client = service.get_or_404(db, organization_id, client_id)
    service.delete(db, client)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
