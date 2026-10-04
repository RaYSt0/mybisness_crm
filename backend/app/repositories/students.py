from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate


def create(db: Session, organization_id: int, data: StudentCreate) -> Student:
    student = Student(organization_id=organization_id, **data.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def get(db: Session, organization_id: int, student_id: int) -> Student | None:
    return db.scalar(
        select(Student).where(
            Student.id == student_id,
            Student.organization_id == organization_id,
        )
    )


def list_page(
    db: Session,
    organization_id: int,
    skip: int,
    limit: int,
    search: str | None,
    archived: bool | None,
) -> tuple[list[Student], int]:
    conditions = [Student.organization_id == organization_id]
    if search:
        pattern = f"%{search.strip()}%"
        conditions.append(or_(Student.name.ilike(pattern), Student.group_name.ilike(pattern)))
    if archived is not None:
        conditions.append(Student.archived == archived)
    items = list(
        db.scalars(
            select(Student)
            .where(*conditions)
            .order_by(Student.id)
            .offset(skip)
            .limit(limit)
        )
    )
    total = db.scalar(select(func.count()).select_from(Student).where(*conditions)) or 0
    return items, total


def update(db: Session, student: Student, data: StudentUpdate) -> Student:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(student, field, value)
    db.commit()
    db.refresh(student)
    return student


def delete(db: Session, student: Student) -> None:
    db.delete(student)
    db.commit()
