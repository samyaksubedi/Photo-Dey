from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI

from app.api.health import router as health_router
from app.config import get_settings
from app.workers.runtime import CoreRuntime


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    runtime = await CoreRuntime.create(get_settings())
    app.state.runtime = runtime
    try:
        yield
    finally:
        await runtime.close()


app = FastAPI(title="PhotoDey AI", version="0.1.0", lifespan=lifespan)
app.include_router(health_router)
