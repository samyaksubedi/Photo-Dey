from dataclasses import dataclass
from typing import Any

from numpy.typing import NDArray
from qdrant_client import AsyncQdrantClient, models

from app.utils.identifiers import face_point_id


@dataclass(frozen=True)
class FaceVector:
    face_index: int
    embedding: NDArray[Any]
    detection_score: float
    bounding_box: tuple[float, float, float, float]


@dataclass(frozen=True)
class VectorMatch:
    photo_id: str
    score: float


class VectorStore:
    VECTOR_SIZE = 512

    def __init__(
        self,
        url: str,
        api_key: str | None,
        collection_name: str,
        model_version: str,
        client: AsyncQdrantClient | None = None,
    ) -> None:
        self._owns_client = client is None
        self._client = client or AsyncQdrantClient(url=url, api_key=api_key)
        self.collection_name = collection_name
        self.model_version = model_version

    @property
    def client(self) -> AsyncQdrantClient:
        return self._client

    async def ensure_collection(self) -> None:
        if not await self._client.collection_exists(self.collection_name):
            await self._client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=self.VECTOR_SIZE,
                    distance=models.Distance.COSINE,
                ),
            )

        for field_name in ("eventId", "photoId", "modelVersion"):
            await self._client.create_payload_index(
                collection_name=self.collection_name,
                field_name=field_name,
                field_schema=models.PayloadSchemaType.KEYWORD,
                wait=True,
            )

    async def replace_photo_faces(
        self,
        event_id: str,
        photo_id: str,
        faces: list[FaceVector],
    ) -> None:
        await self.delete_photo(event_id, photo_id)
        if not faces:
            return

        points = [
            models.PointStruct(
                id=face_point_id(self.model_version, photo_id, face.face_index),
                vector=face.embedding.astype(float).tolist(),
                payload={
                    "eventId": event_id,
                    "photoId": photo_id,
                    "faceIndex": face.face_index,
                    "modelVersion": self.model_version,
                    "detectionScore": face.detection_score,
                    "boundingBox": list(face.bounding_box),
                },
            )
            for face in faces
        ]
        await self._client.upsert(
            collection_name=self.collection_name,
            points=points,
            wait=True,
        )

    async def search_event(
        self,
        event_id: str,
        embedding: NDArray[Any],
        score_threshold: float,
        limit: int,
    ) -> list[VectorMatch]:
        response = await self._client.query_points(
            collection_name=self.collection_name,
            query=embedding.astype(float).tolist(),
            query_filter=self._search_filter(event_id),
            score_threshold=score_threshold,
            limit=limit,
            with_payload=["photoId"],
            with_vectors=False,
        )

        matches: list[VectorMatch] = []
        for point in response.points:
            payload = point.payload or {}
            photo_id = payload.get("photoId")
            if isinstance(photo_id, str):
                matches.append(VectorMatch(photo_id=photo_id, score=point.score))
        return matches

    async def delete_photo(self, event_id: str, photo_id: str) -> None:
        await self._client.delete(
            collection_name=self.collection_name,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="eventId",
                            match=models.MatchValue(value=event_id),
                        ),
                        models.FieldCondition(
                            key="photoId",
                            match=models.MatchValue(value=photo_id),
                        ),
                    ]
                )
            ),
            wait=True,
        )

    async def delete_event(self, event_id: str) -> None:
        await self._client.delete(
            collection_name=self.collection_name,
            points_selector=models.FilterSelector(
                filter=self._event_filter(event_id)
            ),
            wait=True,
        )

    async def is_ready(self) -> bool:
        return await self._client.collection_exists(self.collection_name)

    async def close(self) -> None:
        if self._owns_client:
            await self._client.close()

    @staticmethod
    def _event_filter(event_id: str) -> models.Filter:
        return models.Filter(
            must=[
                models.FieldCondition(
                    key="eventId",
                    match=models.MatchValue(value=event_id),
                )
            ]
        )

    def _search_filter(self, event_id: str) -> models.Filter:
        return models.Filter(
            must=[
                models.FieldCondition(
                    key="eventId",
                    match=models.MatchValue(value=event_id),
                ),
                models.FieldCondition(
                    key="modelVersion",
                    match=models.MatchValue(value=self.model_version),
                ),
            ]
        )
