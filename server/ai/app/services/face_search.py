import asyncio

from app.clients.images import ImageClient
from app.clients.state import ProcessingStateStore
from app.clients.vectors import VectorMatch, VectorStore
from app.errors import EventDeletedError
from app.schemas import MatchedPhotoMetadata, SearchJob
from app.services.face_engine import FaceEngine


class FaceSearchService:
    def __init__(
        self,
        image_client: ImageClient,
        face_engine: FaceEngine,
        vector_store: VectorStore,
        state_store: ProcessingStateStore,
        score_threshold: float,
        search_limit: int,
        prominent_face_ratio: float,
    ) -> None:
        self._images = image_client
        self._faces = face_engine
        self._vectors = vector_store
        self._state = state_store
        self._score_threshold = score_threshold
        self._search_limit = search_limit
        self._prominent_face_ratio = prominent_face_ratio

    async def search(self, job: SearchJob) -> list[MatchedPhotoMetadata]:
        await self._raise_if_deleted(job.event_id)
        async with self._images.temporary_file(str(job.selfie_url)) as image_path:
            selfie_face = await asyncio.to_thread(
                self._faces.selfie_face_from_file,
                image_path,
                self._prominent_face_ratio,
            )
        await self._raise_if_deleted(job.event_id)

        matches = await self._vectors.search_event(
            event_id=job.event_id,
            embedding=selfie_face.embedding,
            score_threshold=self._score_threshold,
            limit=self._search_limit,
        )
        return self.deduplicate_matches(matches)

    @staticmethod
    def deduplicate_matches(
        matches: list[VectorMatch],
    ) -> list[MatchedPhotoMetadata]:
        best_scores: dict[str, float] = {}
        for match in matches:
            best_scores[match.photo_id] = max(
                best_scores.get(match.photo_id, -1.0),
                match.score,
            )

        return [
            MatchedPhotoMetadata(
                photoId=photo_id,
                confidence=min(1.0, max(0.0, score)),
            )
            for photo_id, score in sorted(
                best_scores.items(),
                key=lambda item: item[1],
                reverse=True,
            )
        ]

    async def _raise_if_deleted(self, event_id: str) -> None:
        if await self._state.is_event_deleted(event_id):
            raise EventDeletedError("Event was deleted before face search")
