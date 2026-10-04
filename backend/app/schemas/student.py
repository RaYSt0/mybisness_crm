from datetime import date, datetime

from pydantic import EmailStr, Field, field_validator, model_validator

from app.schemas.common import ORMModel


def _clean_string(value: str | None) -> str | None:
    return value.strip() if isinstance(value, str) else value


class StudentCreate(ORMModel):
    name: str = Field(min_length=1, max_length=100)
    group_name: str = Field(min_length=1, max_length=100)
    guardian: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=30)
    email: EmailStr | None = None
    birth_date: date | None = None
    notes: str | None = Field(default=None, max_length=5000)

    @field_validator("name", "group_name", "guardian", "phone", "notes", mode="before")
    @classmethod
    def trim_text(cls, value: str | None) -> str | None:
        return _clean_string(value)

    @field_validator("name", "group_name")
    @classmethod
    def reject_blank_required_text(cls, value: str) -> str:
        if not value:
            raise ValueError("Поле не может состоять только из пробелов")
        return value


class StudentUpdate(ORMModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    group_name: str | None = Field(default=None, min_length=1, max_length=100)
    guardian: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=30)
    email: EmailStr | None = None
    birth_date: date | None = None
    notes: str | None = Field(default=None, max_length=5000)
    archived: bool | None = None

    @field_validator("name", "group_name", "guardian", "phone", "notes", mode="before")
    @classmethod
    def trim_text(cls, value: str | None) -> str | None:
        return _clean_string(value)

    @field_validator("name", "group_name")
    @classmethod
    def reject_blank_required_text(cls, value: str | None) -> str | None:
        if value == "":
            raise ValueError("Поле не может состоять только из пробелов")
        return value

    @model_validator(mode="after")
    def reject_null_required_values(self) -> "StudentUpdate":
        for field in ("name", "group_name"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"Поле {field} не может быть пустым")
        return self


class StudentRead(ORMModel):
    id: int
    organization_id: int
    name: str
    group_name: str
    guardian: str | None
    phone: str | None
    email: EmailStr | None
    birth_date: date | None
    notes: str | None
    archived: bool
    created_at: datetime
    updated_at: datetime


class StudentList(ORMModel):
    items: list[StudentRead]
    total: int
