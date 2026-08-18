import asyncio
import logging
import signal
from collections.abc import Awaitable, Callable

from bullmq import Worker


async def run_worker(
    queue_name: str,
    processor: Callable[..., Awaitable[object]],
    redis_url: str,
    concurrency: int,
    close_runtime: Callable[[], Awaitable[None]],
) -> None:
    logger = logging.getLogger(f"worker.{queue_name}")
    shutdown_event = asyncio.Event()
    loop = asyncio.get_running_loop()

    def request_shutdown(*_: object) -> None:
        loop.call_soon_threadsafe(shutdown_event.set)

    for signal_name in (signal.SIGINT, signal.SIGTERM):
        signal.signal(signal_name, request_shutdown)

    worker = Worker(
        queue_name,
        processor,
        {
            "connection": redis_url,
            "concurrency": concurrency,
            "name": f"photodey-{queue_name}",
        },
    )
    worker.on("error", lambda error: logger.error("Worker error: %s", error))
    logger.info("Worker started")

    try:
        await shutdown_event.wait()
    finally:
        logger.info("Worker shutting down")
        await worker.close()
        await close_runtime()
