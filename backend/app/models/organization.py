from datetime import datetime

from sqlalchemy import DateTime, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    owner_name: Mapped[str] = mapped_column(String(100), nullable=False)
    owner_email: Mapped[str] = mapped_column(String(254), nullable=False, unique=True, index=True)
    business_type: Mapped[str] = mapped_column(String(30), nullable=False)
    enabled_modules: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    students: Mapped[list["Student"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    clients: Mapped[list["Client"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    workspace_configuration: Mapped["WorkspaceConfiguration | None"] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
        uselist=False,
    )
