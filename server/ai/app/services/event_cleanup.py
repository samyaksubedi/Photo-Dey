from app.clients.state import ProcessingStateStore
from app.clients.vectors import VectorStore


class EventCleanupService:
    def __init__(
        self,
        vector_store: VectorStore,
        state_store: ProcessingStateStore,
    ) -> None:
        self._vectors = vector_store
        self._state = state_store

    async def cleanup(self, event_id: str) -> None:
        await self._state.mark_event_deleted(event_id)
        await self._vectors.delete_event(event_id)

    async def cleanup_photo(self, event_id: str, photo_id: str) -> None:
        await self._vectors.delete_photo(event_id, photo_id)
