import httpx
import pytest

from app.clients.backend import BackendClient
from app.clients.images import ImageClient
from app.schemas import PhotoStatusCallback


async def test_backend_client_sends_expected_webhook_contract() -> None:
    captured: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["path"] = request.url.path
        captured["secret"] = request.headers["x-webhook-secret"]
        captured["body"] = request.content
        return httpx.Response(200, request=request)

    http_client = httpx.AsyncClient(
        base_url="http://api.test",
        transport=httpx.MockTransport(handler),
    )
    client = BackendClient("http://api.test", "secret", 5, http_client)

    await client.update_photo_status(
        PhotoStatusCallback(photoId="photo-id", status="COMPLETED")
    )

    assert captured["path"] == "/api/v1/ai/photo-status"
    assert captured["secret"] == "secret"
    assert captured["body"] == b'{"photoId":"photo-id","status":"COMPLETED"}'
    await http_client.aclose()


async def test_image_client_streams_to_temporary_file_and_removes_it() -> None:
    image_bytes = b"fake-image-data"

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            headers={"content-type": "image/jpeg"},
            content=image_bytes,
            request=request,
        )

    http_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = ImageClient(1024 * 1024, 5, http_client)

    async with client.temporary_file("http://image.test/photo.jpg") as image_path:
        saved_path = image_path
        assert image_path.exists()
        assert image_path.read_bytes() == image_bytes

    assert not saved_path.exists()
    await http_client.aclose()


async def test_image_client_removes_temporary_file_after_processing_failure() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            headers={"content-type": "image/jpeg"},
            content=b"fake-image-data",
            request=request,
        )

    http_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = ImageClient(1024 * 1024, 5, http_client)

    with pytest.raises(RuntimeError, match="inference failed"):
        async with client.temporary_file("http://image.test/photo.jpg") as image_path:
            saved_path = image_path
            raise RuntimeError("inference failed")

    assert not saved_path.exists()
    await http_client.aclose()
