import asyncio
import logging

from bullmq import Job, UnrecoverableError
from pydantic import ValidationError

from app.config import get_settings
from app.errors import (
    EventDeletedError,
    PermanentProcessingError,
    RemoteResourceMissingError,
)
from app.schemas import PhotoIndexJob, PhotoStatusCallback
from app.services.photo_indexer import PhotoIndexer
from app.utils.logging import configure_logging
from app.workers.helpers import (
    best_effort_photo_failed,
    is_final_attempt,
    notify_photo_processing_once,
)
from app.workers.runner import run_worker
from app.workers.runtime import InferenceRuntime

QUEUE_NAME = "queue-ai"


async def main() -> None:
    settings = get_settings()
    configure_logging(settings.log_level)
    logger = logging.getLogger("worker.ai")
    runtime = await InferenceRuntime.create(settings)
    indexer = PhotoIndexer(
        image_client=runtime.image_client,
        face_engine=runtime.face_engine,
        vector_store=runtime.vector_store,
        state_store=runtime.state_store,
    )

    async def process(job: Job, _: str) -> object:
        try:
            data = PhotoIndexJob.model_validate(job.data)
        except ValidationError as error:
            raise UnrecoverableError(f"Invalid photo index job: {error}") from error

        try:
            await notify_photo_processing_once(
                runtime.state_store,
                runtime.backend_client,
                data.photo_id,
            )
            result = await indexer.index(data)
            await runtime.backend_client.update_photo_status(
                PhotoStatusCallback(photoId=data.photo_id, status="COMPLETED")
            )
            return {"faceCount": result.face_count}
        except (EventDeletedError, RemoteResourceMissingError):
            await runtime.vector_store.delete_photo(data.event_id, data.photo_id)
            logger.info(
                "Discarded photo job for deleted resource",
                extra={"eventId": data.event_id, "photoId": data.photo_id},
            )
            return {"skipped": True}
        except PermanentProcessingError as error:
            await best_effort_photo_failed(
                runtime.backend_client,
                data.photo_id,
                logger,
            )
            raise UnrecoverableError(str(error)) from error
        except Exception:
            if is_final_attempt(job):
                await best_effort_photo_failed(
                    runtime.backend_client,
                    data.photo_id,
                    logger,
                )
            raise

    await run_worker(
        queue_name=QUEUE_NAME,
        processor=process,
        redis_url=settings.redis_url,
        concurrency=settings.worker_concurrency,
        close_runtime=runtime.close,
    )


if __name__ == "__main__":
    asyncio.run(main())
