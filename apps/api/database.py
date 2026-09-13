"""MongoDB persistence and an explicit async session adapter for API routes."""
from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any

import structlog
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy import inspect
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.sql import operators

from config import settings

logger = structlog.get_logger()

mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
mongo_database = mongo_client[settings.MONGODB_DATABASE]


class Base(DeclarativeBase):
    """Compatibility metadata for the existing typed domain models."""


def _collection_name(model: type) -> str:
    return model.__tablename__


def _to_mongo(value: Any) -> Any:
    if isinstance(value, Enum):
        return value.value
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, datetime):
        return value
    if isinstance(value, list):
        return [_to_mongo(item) for item in value]
    if isinstance(value, dict):
        return {key: _to_mongo(item) for key, item in value.items()}
    return value


def _model_document(instance: Any) -> dict[str, Any]:
    mapper = inspect(instance).mapper
    return {
        column.key: _to_mongo(getattr(instance, column.key, None))
        for column in mapper.columns
        if getattr(instance, column.key, None) is not None
    }


def _condition_to_mongo(condition: Any) -> dict[str, Any]:
    if condition.operator is operators.eq:
        value = _to_mongo(condition.right.value)
        return {condition.left.key: value}
    if condition.operator is operators.gt:
        return {condition.left.key: {"$gt": _to_mongo(condition.right.value)}}
    if condition.operator is operators.ge:
        return {condition.left.key: {"$gte": _to_mongo(condition.right.value)}}
    if condition.operator is operators.lt:
        return {condition.left.key: {"$lt": _to_mongo(condition.right.value)}}
    if condition.operator is operators.le:
        return {condition.left.key: {"$lte": _to_mongo(condition.right.value)}}
    if condition.operator is operators.in_op:
        return {condition.left.key: {"$in": _to_mongo(condition.right.value)}}
    if condition.operator is operators.is_:
        return {condition.left.key: None}
    raise ValueError(f"Unsupported MongoDB query operator: {condition.operator}")


def _query_from_statement(statement: Any) -> tuple[type, dict[str, Any], list[tuple[str, int]], int | None]:
    descriptions = statement.column_descriptions
    model = descriptions[0]["entity"]
    filters: dict[str, Any] = {}
    for criterion in statement._where_criteria:
        if hasattr(criterion, "clauses"):
            for clause in criterion.clauses:
                filters.update(_condition_to_mongo(clause))
        else:
            filters.update(_condition_to_mongo(criterion))

    sort: list[tuple[str, int]] = []
    for clause in getattr(statement, "_order_by_clauses", ()):
        sort.append((clause.element.key, -1 if clause.operator.__name__ == "desc_op" else 1))

    limit = statement._limit_clause.value if statement._limit_clause is not None else None
    return model, filters, sort, limit


class MongoResult:
    def __init__(self, rows: list[Any]):
        self.rows = rows

    def scalars(self) -> "MongoResult":
        return self

    def all(self) -> list[Any]:
        return self.rows

    def scalar_one_or_none(self) -> Any | None:
        if len(self.rows) > 1:
            raise ValueError("Expected at most one MongoDB result")
        return self.rows[0] if self.rows else None


class MongoSession:
    """Small unit-of-work adapter used by the existing FastAPI route layer."""

    def __init__(self) -> None:
        self._pending: list[Any] = []

    async def __aenter__(self) -> "MongoSession":
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: Any,
    ) -> None:
        if exc_type is None:
            await self.commit()
        else:
            await self.rollback()
        await self.close()

    async def execute(self, statement: Any) -> MongoResult:
        model, filters, sort, limit = _query_from_statement(statement)
        collection = mongo_database[_collection_name(model)]
        cursor = collection.find(filters)
        if sort:
            cursor = cursor.sort(sort)
        if limit is not None:
            cursor = cursor.limit(limit)
        documents = await cursor.to_list(length=limit or 1000)
        rows = []
        for document in documents:
            document.pop("_id", None)
            rows.append(model(**document))
        return MongoResult(rows)

    def add(self, instance: Any) -> None:
        if getattr(instance, "id", None) is None:
            instance.id = uuid.uuid4()
        self._pending.append(instance)

    async def flush(self) -> None:
        await self._write_pending()

    async def commit(self) -> None:
        await self._write_pending()

    async def refresh(self, instance: Any) -> None:
        collection = mongo_database[_collection_name(type(instance))]
        document = await collection.find_one({"id": str(instance.id)})
        if document:
            document.pop("_id", None)
            for key, value in document.items():
                if hasattr(instance, key):
                    setattr(instance, key, value)

    async def rollback(self) -> None:
        self._pending.clear()

    async def close(self) -> None:
        self._pending.clear()

    async def _write_pending(self) -> None:
        pending, self._pending = self._pending, []
        for instance in pending:
            collection = mongo_database[_collection_name(type(instance))]
            document = _model_document(instance)
            await collection.replace_one({"id": document["id"]}, document, upsert=True)


async def init_db() -> None:
    """Verify MongoDB connectivity and create required indexes."""
    try:
        await mongo_database.command("ping")
        from models import User, OTPVerification, RiskProfile, MarketSignal

        await mongo_database[_collection_name(User)].create_index("whatsapp_number", unique=True)
        await mongo_database[_collection_name(OTPVerification)].create_index("whatsapp_number")
        await mongo_database[_collection_name(RiskProfile)].create_index("user_id", unique=True)
        await mongo_database[_collection_name(MarketSignal)].create_index([("timestamp", -1)])
        logger.info("Connected to MongoDB", database=settings.MONGODB_DATABASE)
    except Exception as exc:
        logger.error("MongoDB connection failed", error=str(exc))
        raise RuntimeError("Configured MongoDB is unavailable") from exc


async def close_db() -> None:
    mongo_client.close()
    logger.info("MongoDB connection closed")


async def get_db() -> MongoSession:
    session = MongoSession()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


AsyncSessionLocal = MongoSession
