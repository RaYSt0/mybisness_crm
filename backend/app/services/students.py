from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.student import Student
from app.repositories import students as repository
from app.services.organizations import get_or_404 as organization_or_404
from app.schemas.student import StudentCreate, StudentUpdate


def create(db: Session, organization_id: int, data: StudentCreate) -> Student:
    organization_or_404(db, organization_id)
    return repository.create(db, organization_id, data)


def get_or_404(db: Session, organization_id: int, student_id: int) -> Student:
    organization_or_404(db, organization_id)
    student = repository.get(db, organization_id, student_id)
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ученик не найден")
    return student


def update(db: Session, student: Student, data: StudentUpdate) -> Student:
    if not data.model_fields_set:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Не переданы поля для обновления")
    return repository.update(db, student, data)


def delete(db: Session, student: Student) -> None:
    repository.delete(db, student)
