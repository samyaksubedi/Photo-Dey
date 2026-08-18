import os
import tempfile
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

import httpx

from app.errors import PermanentProcessingError


class ImageClient:
    def __init__(
        self,
        max_image_bytes: int,
        timeout_seconds: float,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        self._max_image_bytes = max_image_bytes
        self._owns_client = client is None
        self._client = client or httpx.AsyncClient(
            timeout=timeout_seconds,
            follow_redirects=True,
        )

    @asynccontextmanager
    async def temporary_file(self, url: str) -> AsyncIterator[Path]:
        file_descriptor, raw_path = tempfile.mkstemp(prefix="photo-dey-ai-")
        os.close(file_descriptor)
        temp_path = Path(raw_path)

        try:
            downloaded_bytes = 0
            with temp_path.open("wb") as temp_file:
                async with self._client.stream("GET", url) as response:
                    response.raise_for_status()
                    content_type = response.headers.get("content-type", "")
                    if content_type and not content_type.lower().startswith("image/"):
                        raise PermanentProcessingError(
                            "Downloaded resource is not an image"
                        )

                    content_length = response.headers.get("content-length")
                    if content_length and int(content_length) > self._max_image_bytes:
                        raise PermanentProcessingError(
                            "Image exceeds the configured size limit"
                        )

                    async for chunk in response.aiter_bytes():
                        downloaded_bytes += len(chunk)
                        if downloaded_bytes > self._max_image_bytes:
                            raise PermanentProcessingError(
                                "Image exceeds the configured size limit"
                            )
                        temp_file.write(chunk)

            if downloaded_bytes == 0:
                raise PermanentProcessingError("Downloaded image is empty")

            yield temp_path
        finally:
            temp_path.unlink(missing_ok=True)

    async def close(self) -> None:
        if self._owns_client:
            await self._client.aclose()
