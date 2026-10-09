import json
from typing import Any

from pydantic import Field, field_validator

from app.schemas.common import ORMModel


class WorkspaceConfigurationWrite(ORMModel):
    configuration: dict[str, Any] = Field()

    @field_validator("configuration")
    @classmethod
    def validate_size_and_shape(cls, value: dict[str, Any]) -> dict[str, Any]:
        if len(json.dumps(value, ensure_ascii=False).encode("utf-8")) > 512_000:
            raise ValueError("Конфигурация не должна превышать 512 КБ")
        for key in ("entities", "processes", "automations"):
            if key not in value or not isinstance(value[key], list):
                raise ValueError(f"Поле {key} должно быть списком")
        return value


class WorkspaceConfigurationRead(ORMModel):
    organization_id: int
    version: int
    configuration: dict[str, Any]


class DashboardSummary(ORMModel):
    total_clients: int
    active_clients: int
    new_clients: int
    attention_clients: int
