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
from app.schemas import SearchJob, SearchStatusCallback
from app.services.face_search import FaceSearchService
from app.utils.logging import configure_logging
from app.workers.helpers import (
    best_effort_search_failed,
    is_final_attempt,
    notify_search_processing_once,
)
from app.workers.runner import run_worker
from app.workers.runtime import InferenceRuntime

QUEUE_NAME = "queue-search"


async def main() -> None:
    settings = get_settings()
    configure_logging(settings.log_level)
    logger = logging.getLogger("worker.search")
    runtime = await InferenceRuntime.create(settings)
    search_service = FaceSearchService(
        image_client=runtime.image_client,
        face_engine=runtime.face_engine,
        vector_store=runtime.vector_store,
        state_store=runtime.state_store,
        score_threshold=settings.face_match_threshold,
        search_limit=settings.face_search_limit,
        prominent_face_ratio=settings.prominent_face_ratio,
    )

    async def process(job: Job, _: str) -> object:
        try:
            data = SearchJob.model_validate(job.data)
        except ValidationError as error:
            raise UnrecoverableError(f"Invalid search job: {error}") from error

        try:
            await notify_search_processing_once(
                runtime.state_store,
                runtime.backend_client,
                data.search_request_id,
            )
            matches = await search_service.search(data)
            await runtime.backend_client.update_search_status(
                SearchStatusCallback(
                    searchRequestId=data.search_request_id,
                    status="COMPLETED",
                    matchedPhotosMetadata=matches,
                )
            )
            return {"matchCount": len(matches)}
        except (EventDeletedError, RemoteResourceMissingError):
            logger.info(
                "Discarded search job for deleted resource",
                extra={
                    "eventId": data.event_id,
                    "searchRequestId": data.search_request_id,
                },
            )
            return {"skipped": True}
        except PermanentProcessingError as error:
            await best_effort_search_failed(
                runtime.backend_client,
                data.search_request_id,
                logger,
            )
            raise UnrecoverableError(str(error)) from error
        except Exception:
            if is_final_attempt(job):
                await best_effort_search_failed(
                    runtime.backend_client,
                    data.search_request_id,
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
