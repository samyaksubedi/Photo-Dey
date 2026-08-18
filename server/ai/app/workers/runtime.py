import asyncio
from dataclasses import dataclass

from app.clients.backend import BackendClient
from app.clients.images import ImageClient
from app.clients.state import ProcessingStateStore
from app.clients.vectors import VectorStore
from app.config import Settings
from app.services.face_engine import FaceEngine


@dataclass
class CoreRuntime:
    settings: Settings
    state_store: ProcessingStateStore
    vector_store: VectorStore

    @classmethod
    async def create(cls, settings: Settings) -> "CoreRuntime":
        state_store = ProcessingStateStore(
            redis_url=settings.redis_url,
            deleted_event_key_prefix=settings.deleted_event_key_prefix,
            callback_marker_key_prefix=settings.callback_marker_key_prefix,
        )
        vector_store = VectorStore(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key,
            collection_name=settings.qdrant_collection,
            model_version=settings.model_version,
        )
        await vector_store.ensure_collection()
        return cls(
            settings=settings,
            state_store=state_store,
            vector_store=vector_store,
        )

    async def close(self) -> None:
        await self.state_store.close()
        await self.vector_store.close()


@dataclass
class InferenceRuntime(CoreRuntime):
    backend_client: BackendClient
    image_client: ImageClient
    face_engine: FaceEngine

    @classmethod
    async def create(cls, settings: Settings) -> "InferenceRuntime":
        core = await CoreRuntime.create(settings)
        backend_client = BackendClient(
            base_url=settings.node_api_url,
            webhook_secret=settings.ai_webhook_secret,
            timeout_seconds=settings.http_timeout_seconds,
        )
        image_client = ImageClient(
            max_image_bytes=settings.max_image_bytes,
            timeout_seconds=settings.http_timeout_seconds,
        )
        face_engine = await asyncio.to_thread(
            FaceEngine,
            settings.face_model_name,
            settings.face_model_root,
            settings.face_detection_size,
            settings.face_detection_threshold,
        )
        return cls(
            settings=settings,
            state_store=core.state_store,
            vector_store=core.vector_store,
            backend_client=backend_client,
            image_client=image_client,
            face_engine=face_engine,
        )

    async def close(self) -> None:
        await self.backend_client.close()
        await self.image_client.close()
        await super().close()
