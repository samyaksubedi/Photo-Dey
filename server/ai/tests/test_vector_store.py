import numpy as np
from qdrant_client import AsyncQdrantClient

from app.clients.vectors import FaceVector, VectorStore


def unit_embedding(index: int) -> np.ndarray:
    embedding = np.zeros(512, dtype=np.float32)
    embedding[index] = 1
    return embedding


async def test_qdrant_filters_by_event_and_replaces_photo_faces() -> None:
    client = AsyncQdrantClient(location=":memory:")
    store = VectorStore(
        url="http://unused",
        api_key=None,
        collection_name="test_faces",
        model_version="test-v1",
        client=client,
    )
    await store.ensure_collection()

    await store.replace_photo_faces(
        "event-a",
        "photo-a",
        [FaceVector(0, unit_embedding(0), 0.99, (0, 0, 10, 10))],
    )
    await store.replace_photo_faces(
        "event-b",
        "photo-b",
        [FaceVector(0, unit_embedding(0), 0.99, (0, 0, 10, 10))],
    )

    matches = await store.search_event("event-a", unit_embedding(0), 0.5, 10)
    assert [(match.photo_id, match.score) for match in matches] == [
        ("photo-a", 1.0)
    ]

    await store.replace_photo_faces("event-a", "photo-a", [])
    assert await store.search_event("event-a", unit_embedding(0), 0.5, 10) == []
    await client.close()


async def test_qdrant_deletes_every_vector_for_event() -> None:
    client = AsyncQdrantClient(location=":memory:")
    store = VectorStore(
        url="http://unused",
        api_key=None,
        collection_name="delete_test_faces",
        model_version="test-v1",
        client=client,
    )
    await store.ensure_collection()
    await store.replace_photo_faces(
        "event-a",
        "photo-a",
        [FaceVector(0, unit_embedding(0), 0.99, (0, 0, 10, 10))],
    )

    await store.delete_event("event-a")

    assert await store.search_event("event-a", unit_embedding(0), 0.5, 10) == []
    await client.close()
