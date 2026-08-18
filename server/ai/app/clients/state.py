from redis.asyncio import Redis


class ProcessingStateStore:
    def __init__(
        self,
        redis_url: str,
        deleted_event_key_prefix: str,
        callback_marker_key_prefix: str,
        client: Redis | None = None,
    ) -> None:
        self._owns_client = client is None
        self._redis = client or Redis.from_url(redis_url, decode_responses=True)
        self._deleted_event_key_prefix = deleted_event_key_prefix
        self._callback_marker_key_prefix = callback_marker_key_prefix

    def deleted_event_key(self, event_id: str) -> str:
        return f"{self._deleted_event_key_prefix}{event_id}"

    def callback_marker_key(self, callback_type: str, resource_id: str) -> str:
        return f"{self._callback_marker_key_prefix}{callback_type}:{resource_id}"

    async def is_event_deleted(self, event_id: str) -> bool:
        return bool(await self._redis.exists(self.deleted_event_key(event_id)))

    async def mark_event_deleted(self, event_id: str) -> None:
        await self._redis.set(self.deleted_event_key(event_id), "1")

    async def callback_was_sent(
        self,
        callback_type: str,
        resource_id: str,
    ) -> bool:
        return bool(
            await self._redis.exists(
                self.callback_marker_key(callback_type, resource_id)
            )
        )

    async def mark_callback_sent(
        self,
        callback_type: str,
        resource_id: str,
    ) -> None:
        await self._redis.set(
            self.callback_marker_key(callback_type, resource_id),
            "1",
        )

    async def ping(self) -> bool:
        return bool(await self._redis.ping())

    async def close(self) -> None:
        if self._owns_client:
            await self._redis.aclose()
