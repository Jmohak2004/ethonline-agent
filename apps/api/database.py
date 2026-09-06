"""
AgentFi — Async SQLAlchemy Database Setup
Resilient setup supporting PostgreSQL with graceful SQLite fallback.
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
import structlog
import os

from config import settings

logger = structlog.get_logger()

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


def _create_engine_instance(db_url: str):
    if "sqlite" in db_url:
        return create_async_engine(
            db_url,
            echo=False,
        )
    return create_async_engine(
        db_url,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        echo=settings.is_development,
    )


# Active engine & sessionmaker (can be updated on fallback)
engine = _create_engine_instance(settings.DATABASE_URL)
_active_sessionmaker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

class _SessionProxy:
    def __call__(self, *args, **kwargs):
        return _active_sessionmaker(*args, **kwargs)

AsyncSessionLocal = _SessionProxy()


async def init_db() -> None:
    """Initialize DB connection pool and auto-create tables if needed."""
    global engine, _active_sessionmaker
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Connected to primary database", url=settings.DATABASE_URL.split("@")[-1])
    except Exception as e:
        logger.warning(
            "Primary database connection failed, falling back to local SQLite",
            error=str(e),
            url=settings.DATABASE_URL
        )
        sqlite_url = "sqlite+aiosqlite:///agentfi.db"
        engine = _create_engine_instance(sqlite_url)
        _active_sessionmaker = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
            autocommit=False,
        )

    # Ensure all tables are created
    async with engine.begin() as conn:
        import models  # noqa: F401 - ensure models are registered
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema initialized successfully")


async def close_db() -> None:
    """Close DB connection pool."""
    await engine.dispose()
    logger.info("Database connection closed")


async def get_db() -> AsyncSession:
    """FastAPI dependency — yield an async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

