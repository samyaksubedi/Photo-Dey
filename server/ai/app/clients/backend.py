import httpx

from app.errors import RemoteResourceMissingError
from app.schemas import PhotoStatusCallback, SearchStatusCallback


class BackendClient:
    def __init__(
        self,
        base_url: str,
        webhook_secret: str,
        timeout_seconds: float,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        self._owns_client = client is None
        self._client = client or httpx.AsyncClient(
            base_url=base_url.rstrip("/"),
            timeout=timeout_seconds,
        )
        self._headers = {"x-webhook-secret": webhook_secret}

    async def update_photo_status(self, payload: PhotoStatusCallback) -> None:
        await self._post("/api/v1/ai/photo-status", payload)

    async def update_search_status(self, payload: SearchStatusCallback) -> None:
        await self._post("/api/v1/ai/search-status", payload)

    async def _post(
        self,
        path: str,
        payload: PhotoStatusCallback | SearchStatusCallback,
    ) -> None:
        response = await self._client.post(
            path,
            headers=self._headers,
            json=payload.model_dump(by_alias=True, exclude_none=True, mode="json"),
        )
        if response.status_code == 404:
            raise RemoteResourceMissingError(
                "The API resource was deleted while the AI job was processing"
            )
        response.raise_for_status()

    async def close(self) -> None:
        if self._owns_client:
            await self._client.aclose()
