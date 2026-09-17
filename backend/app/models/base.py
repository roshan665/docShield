"""
Base SQLAlchemy Model & Mixins
Establishes UUIDv4 primary keys, UTC timestamps, and pgvector type mapping.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import declarative_base, declared_attr

try:
    from pgvector.sqlalchemy import Vector

    @compiles(Vector, "sqlite")
    def compile_vector_sqlite(type_, compiler, **kw):
        return "TEXT"
except ImportError:
    pass

@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

Base = declarative_base()


class UUIDPrimaryKeyMixin:
    """Provides a UUIDv4 primary key default for models."""

    @declared_attr
    def id(cls):
        return Column(
            UUID(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
            nullable=False,
            doc="Unique identifier (UUIDv4)",
        )


class TimestampMixin:
    """Provides automatic created_at and updated_at UTC timestamps."""

    @declared_attr
    def created_at(cls):
        return Column(
            DateTime(timezone=True),
            default=lambda: datetime.now(UTC),
            nullable=False,
            doc="UTC timestamp of creation",
        )

    @declared_attr
    def updated_at(cls):
        return Column(
            DateTime(timezone=True),
            default=lambda: datetime.now(UTC),
            onupdate=lambda: datetime.now(UTC),
            nullable=True,
            doc="UTC timestamp of last update",
        )


class BaseModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Abstract base model incorporating UUID and timestamps."""

    __abstract__ = True
