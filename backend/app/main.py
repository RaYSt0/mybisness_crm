from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import health, organizations, students
from app.core.config import settings
from app.db.init_db import create_db_and_tables


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    create_db_and_tables()
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.2.0",
    description="Учебный API персональных CRM и связанных с ними учеников.",
    lifespan=lifespan,
)
app.include_router(health.router)
app.include_router(health.router, prefix=settings.api_v1_prefix, include_in_schema=False)
app.include_router(organizations.router, prefix=settings.api_v1_prefix)
app.include_router(students.router, prefix=settings.api_v1_prefix)


@app.get("/", tags=["health"], summary="Информация об API")
def root() -> dict[str, str]:
    return {"name": settings.app_name, "docs": "/docs", "health": "/health"}
