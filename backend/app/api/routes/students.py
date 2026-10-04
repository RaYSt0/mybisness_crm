from fastapi import APIRouter, Depends, Path, Query, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories import students as repository
from app.schemas.student import StudentCreate, StudentList, StudentRead, StudentUpdate
from app.services import students as service
from app.services.organizations import ensure_organization

router = APIRouter(prefix="/organizations/{organization_id}/students", tags=["students"])


@router.post("", response_model=StudentRead, status_code=status.HTTP_201_CREATED, summary="Добавить ученика")
def create_student(
    data: StudentCreate,
    organization_id: int = Path(gt=0),
    db: Session = Depends(get_db),
) -> StudentRead:
    return service.create(db, organization_id, data)


@router.get("", response_model=StudentList, summary="Получить учеников организации")
def list_students(
    organization_id: int = Path(gt=0),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    search: str | None = Query(default=None, min_length=1, max_length=100),
    archived: bool | None = None,
    db: Session = Depends(get_db),
) -> StudentList:
    ensure_organization(db, organization_id)
    items, total = repository.list_page(db, organization_id, skip, limit, search, archived)
    return StudentList(items=items, total=total)


@router.get("/{student_id}", response_model=StudentRead, summary="Получить карточку ученика")
def get_student(
    organization_id: int = Path(gt=0),
    student_id: int = Path(gt=0),
    db: Session = Depends(get_db),
) -> StudentRead:
    return service.get_or_404(db, organization_id, student_id)


@router.patch("/{student_id}", response_model=StudentRead, summary="Изменить ученика или его статус архива")
def update_student(
    data: StudentUpdate,
    organization_id: int = Path(gt=0),
    student_id: int = Path(gt=0),
    db: Session = Depends(get_db),
) -> StudentRead:
    student = service.get_or_404(db, organization_id, student_id)
    return service.update(db, student, data)


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Удалить ученика")
def delete_student(
    organization_id: int = Path(gt=0),
    student_id: int = Path(gt=0),
    db: Session = Depends(get_db),
) -> Response:
    student = service.get_or_404(db, organization_id, student_id)
    service.delete(db, student)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
