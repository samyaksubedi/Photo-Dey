import asyncio

from bullmq import Job, UnrecoverableError
from pydantic import ValidationError

from app.config import get_settings
from app.schemas import EventCleanupJob
from app.services.event_cleanup import EventCleanupService
from app.utils.logging import configure_logging
from app.workers.runner import run_worker
from app.workers.runtime import CoreRuntime

QUEUE_NAME = "queue-ai-cleanup"


async def main() -> None:
    settings = get_settings()
    configure_logging(settings.log_level)
    runtime = await CoreRuntime.create(settings)
    cleanup_service = EventCleanupService(
        vector_store=runtime.vector_store,
        state_store=runtime.state_store,
    )

    async def process(job: Job, _: str) -> object:
        try:
            data = EventCleanupJob.model_validate(job.data)
        except ValidationError as error:
            raise UnrecoverableError(f"Invalid cleanup job: {error}") from error
        await cleanup_service.cleanup(data.event_id)
        return {"eventId": data.event_id, "deleted": True}

    await run_worker(
        queue_name=QUEUE_NAME,
        processor=process,
        redis_url=settings.redis_url,
        concurrency=settings.worker_concurrency,
        close_runtime=runtime.close,
    )


if __name__ == "__main__":
    asyncio.run(main())
