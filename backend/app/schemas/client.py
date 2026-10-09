from datetime import datetime
from typing import Literal

from pydantic import EmailStr, Field, field_validator, model_validator

from app.schemas.common import ORMModel

ClientStatus = Literal["active", "new", "attention", "archived"]


class ClientCreate(ORMModel):
    name: str = Field(min_length=1, max_length=100)
    contact: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    status: ClientStatus = "active"
    segment: str | None = Field(default=None, max_length=100)
    note: str | None = Field(default=None, max_length=5000)

    @field_validator("name", "contact", "segment", "note", mode="before")
    @classmethod
    def trim_text(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value

    @field_validator("name")
    @classmethod
    def require_name(cls, value: str) -> str:
        if not value:
            raise ValueError("Имя клиента не может быть пустым")
        return value


class ClientUpdate(ORMModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    contact: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    status: ClientStatus | None = None
    segment: str | None = Field(default=None, max_length=100)
    note: str | None = Field(default=None, max_length=5000)

    @field_validator("name", "contact", "segment", "note", mode="before")
    @classmethod
    def trim_text(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value

    @model_validator(mode="after")
    def require_fields(self) -> "ClientUpdate":
        if not self.model_fields_set:
            raise ValueError("Не переданы поля для обновления")
        if "name" in self.model_fields_set and not self.name:
            raise ValueError("Имя клиента не может быть пустым")
        if "status" in self.model_fields_set and self.status is None:
            raise ValueError("Статус не может быть пустым")
        return self


class ClientRead(ORMModel):
    id: int
    organization_id: int
    name: str
    contact: str | None
    email: EmailStr | None
    status: ClientStatus
    segment: str | None
    note: str | None
    created_at: datetime
    updated_at: datetime


class ClientList(ORMModel):
    items: list[ClientRead]
    total: int
