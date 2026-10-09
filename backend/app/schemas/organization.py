from datetime import datetime
from enum import StrEnum

from pydantic import EmailStr, Field, field_validator, model_validator

from app.schemas.common import ORMModel
from app.schemas.student import StudentRead


class BusinessType(StrEnum):
    KIDS = "kids"
    SPORT = "sport"
    EDUCATION = "education"
    WELLNESS = "wellness"
    CLEANING = "cleaning"
    FIELD = "field"
    REPAIR = "repair"
    OTHER = "other"
    DANCE = "dance"
    SPORTS = "sports"
    TUTORING = "tutoring"


class BusinessModule(StrEnum):
    CLIENTS = "clients"
    TEAM = "team"
    GROUPS = "groups"
    DOCUMENTS = "documents"
    TASKS = "tasks"
    AUTOMATIONS = "automations"
    REPORTS = "reports"
    SCHEDULE = "schedule"
    PAYMENTS = "payments"
    SUBSCRIPTIONS = "subscriptions"
    MEDICAL = "medical"
    SCHEDULING = "scheduling"
    FINANCE = "finance"


class OrganizationCreate(ORMModel):
    name: str = Field(min_length=1, max_length=100)
    owner_name: str = Field(min_length=1, max_length=100)
    owner_email: EmailStr
    business_type: BusinessType
    enabled_modules: list[BusinessModule] = Field(default_factory=list, max_length=9)

    @field_validator("name", "owner_name", mode="before")
    @classmethod
    def trim_text(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value

    @field_validator("name", "owner_name")
    @classmethod
    def reject_blank_required_text(cls, value: str) -> str:
        if not value:
            raise ValueError("Поле не может состоять только из пробелов")
        return value

    @field_validator("enabled_modules")
    @classmethod
    def require_unique_modules(cls, value: list[BusinessModule]) -> list[BusinessModule]:
        if len(value) != len(set(value)):
            raise ValueError("Список модулей не должен содержать повторы")
        return value


class OrganizationUpdate(ORMModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    owner_name: str | None = Field(default=None, min_length=1, max_length=100)
    owner_email: EmailStr | None = None
    business_type: BusinessType | None = None
    enabled_modules: list[BusinessModule] | None = Field(default=None, max_length=9)

    @field_validator("name", "owner_name", mode="before")
    @classmethod
    def trim_text(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value

    @field_validator("name", "owner_name")
    @classmethod
    def reject_blank_required_text(cls, value: str | None) -> str | None:
        if value == "":
            raise ValueError("Поле не может состоять только из пробелов")
        return value

    @field_validator("enabled_modules")
    @classmethod
    def require_unique_modules(cls, value: list[BusinessModule] | None) -> list[BusinessModule] | None:
        if value is not None and len(value) != len(set(value)):
            raise ValueError("Список модулей не должен содержать повторы")
        return value

    @model_validator(mode="after")
    def reject_null_required_values(self) -> "OrganizationUpdate":
        for field in ("name", "owner_name", "owner_email", "business_type", "enabled_modules"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"Поле {field} не может быть пустым")
        return self


class OrganizationRead(ORMModel):
    id: int
    name: str
    owner_name: str
    owner_email: EmailStr
    business_type: BusinessType
    enabled_modules: list[BusinessModule]
    created_at: datetime
    updated_at: datetime
    students: list[StudentRead] = Field(default_factory=list)


class OrganizationList(ORMModel):
    items: list[OrganizationRead]
    total: int
