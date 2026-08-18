import asyncio
import sys

from bullmq import Job, Worker


async def main(queue_name: str) -> None:
    processed = asyncio.Event()

    async def process(job: Job, _: str) -> dict[str, object]:
        processed.set()
        return {
            "processedBy": "python",
            "received": job.data,
        }

    worker = Worker(
        queue_name,
        process,
        {"connection": "redis://:photodeyredis123@127.0.0.1:6379"},
    )
    try:
        await asyncio.wait_for(processed.wait(), timeout=120)
        await asyncio.sleep(0.5)
    finally:
        await worker.close()


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1]))
