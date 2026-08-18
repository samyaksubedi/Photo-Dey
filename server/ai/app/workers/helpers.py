import logging

from app.clients.backend import BackendClient
from app.clients.state import ProcessingStateStore
from app.errors import RemoteResourceMissingError
from app.schemas import PhotoStatusCallback, SearchStatusCallback


def is_final_attempt(job: object) -> bool:
    opts = getattr(job, "opts", {})
    attempts = int(opts.get("attempts") or 1)
    attempts_made = int(getattr(job, "attemptsMade", 0))
    return attempts_made + 1 >= attempts


async def notify_photo_processing_once(
    state: ProcessingStateStore,
    backend: BackendClient,
    photo_id: str,
) -> None:
    callback_type = "photo-processing"
    if await state.callback_was_sent(callback_type, photo_id):
        return
    await backend.update_photo_status(
        PhotoStatusCallback(photoId=photo_id, status="PROCESSING")
    )
    await state.mark_callback_sent(callback_type, photo_id)


async def notify_search_processing_once(
    state: ProcessingStateStore,
    backend: BackendClient,
    search_request_id: str,
) -> None:
    callback_type = "search-processing"
    if await state.callback_was_sent(callback_type, search_request_id):
        return
    await backend.update_search_status(
        SearchStatusCallback(
            searchRequestId=search_request_id,
            status="PROCESSING",
        )
    )
    await state.mark_callback_sent(callback_type, search_request_id)


async def best_effort_photo_failed(
    backend: BackendClient,
    photo_id: str,
    logger: logging.Logger,
) -> None:
    try:
        await backend.update_photo_status(
            PhotoStatusCallback(photoId=photo_id, status="FAILED")
        )
    except RemoteResourceMissingError:
        return
    except Exception:
        logger.exception("Failed to report terminal photo failure")


async def best_effort_search_failed(
    backend: BackendClient,
    search_request_id: str,
    logger: logging.Logger,
) -> None:
    try:
        await backend.update_search_status(
            SearchStatusCallback(
                searchRequestId=search_request_id,
                status="FAILED",
            )
        )
    except RemoteResourceMissingError:
        return
    except Exception:
        logger.exception("Failed to report terminal search failure")
