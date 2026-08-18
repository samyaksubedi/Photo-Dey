from fastapi import APIRouter, HTTPException, Request, status

router = APIRouter()


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "healthy"}


@router.get("/ready")
async def ready(request: Request) -> dict[str, str]:
    try:
        redis_ready = await request.app.state.runtime.state_store.ping()
        qdrant_ready = await request.app.state.runtime.vector_store.is_ready()
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI dependencies are unavailable",
        ) from error

    if not redis_ready or not qdrant_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI dependencies are unavailable",
        )
    return {"status": "ready"}
