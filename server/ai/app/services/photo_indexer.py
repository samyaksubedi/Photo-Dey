import asyncio
from dataclasses import dataclass

from app.clients.images import ImageClient
from app.clients.state import ProcessingStateStore
from app.clients.vectors import VectorStore
from app.errors import EventDeletedError
from app.schemas import PhotoIndexJob
from app.services.face_engine import FaceEngine


@dataclass(frozen=True)
class PhotoIndexResult:
    face_count: int
    skipped: bool = False


class PhotoIndexer:
    def __init__(
        self,
        image_client: ImageClient,
        face_engine: FaceEngine,
        vector_store: VectorStore,
        state_store: ProcessingStateStore,
    ) -> None:
        self._images = image_client
        self._faces = face_engine
        self._vectors = vector_store
        self._state = state_store

    async def index(self, job: PhotoIndexJob) -> PhotoIndexResult:
        await self._raise_if_deleted(job.event_id)
        async with self._images.temporary_file(str(job.secure_url)) as image_path:
            faces = await asyncio.to_thread(
                self._faces.event_photo_faces_from_file,
                image_path,
            )
        await self._raise_if_deleted(job.event_id)

        await self._vectors.replace_photo_faces(
            event_id=job.event_id,
            photo_id=job.photo_id,
            faces=faces,
        )

        if await self._state.is_event_deleted(job.event_id):
            await self._vectors.delete_event(job.event_id)
            raise EventDeletedError("Event was deleted during face indexing")

        return PhotoIndexResult(face_count=len(faces))

    async def _raise_if_deleted(self, event_id: str) -> None:
        if await self._state.is_event_deleted(event_id):
            raise EventDeletedError("Event was deleted before face indexing")
