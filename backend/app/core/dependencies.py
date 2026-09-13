"""
Core Application Dependencies
Provides reusable dependency injection providers for FastAPI endpoints.
"""

from collections.abc import AsyncGenerator

import redis.asyncio as aioredis

from app.core.config import settings
from app.core.database import get_db
from app.core.logging import get_logger

logger = get_logger(__name__)

# Re-export get_db
__all__ = ["get_db", "get_redis"]


import fnmatch
import time
from typing import Any

# In-memory mock Redis for environments without a live Redis instance
class InMemoryRedis:
    def __init__(self):
        self._store: dict[str, Any] = {}
        self._expires: dict[str, float] = {}

    def _is_expired(self, key: str) -> bool:
        if key in self._expires and time.time() > self._expires[key]:
            self._store.pop(key, None)
            self._expires.pop(key, None)
            return True
        return False

    async def ping(self) -> bool:
        return True

    async def get(self, key: str) -> Any:
        if self._is_expired(key):
            return None
        return self._store.get(key)

    async def set(self, key: str, value: Any) -> bool:
        self._store[key] = value
        self._expires.pop(key, None)
        return True

    async def setex(self, key: str, time_sec: int, value: Any) -> bool:
        self._store[key] = value
        self._expires[key] = time.time() + time_sec
        return True

    async def exists(self, *keys: str) -> int:
        count = 0
        for k in keys:
            if not self._is_expired(k) and k in self._store:
                count += 1
        return count

    async def delete(self, *keys: str) -> int:
        count = 0
        for k in keys:
            if self._store.pop(k, None) is not None:
                self._expires.pop(k, None)
                count += 1
        return count

    async def incr(self, key: str) -> int:
        if self._is_expired(key):
            self._store[key] = 0
        val = int(self._store.get(key, 0)) + 1
        self._store[key] = str(val)
        return val

    async def expire(self, key: str, time_sec: int) -> bool:
        if key in self._store:
            self._expires[key] = time.time() + time_sec
            return True
        return False

    async def keys(self, pattern: str = "*") -> list[str]:
        # Filter out expired
        now = time.time()
        active_keys = [k for k in list(self._store.keys()) if not (k in self._expires and now > self._expires[k])]
        return fnmatch.filter(active_keys, pattern)

    async def aclose(self) -> None:
        pass

    async def close(self) -> None:
        pass


_fallback_redis_instance = InMemoryRedis()


async def get_redis() -> AsyncGenerator[Any, None]:
    """Provides an asynchronous Redis client connection with resilient local fallback."""
    try:
        client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=1,
        )
        # Check connectivity
        await client.ping()
        try:
            yield client
        finally:
            await client.aclose()
    except Exception:
        # Fall back to thread-safe in-memory mock for local/demo execution
        yield _fallback_redis_instance
