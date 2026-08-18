from types import SimpleNamespace

import numpy as np
import pytest

from app.errors import PermanentProcessingError
from app.services.face_engine import FaceEngine


class FakeAnalysis:
    def __init__(self, faces: list[SimpleNamespace]) -> None:
        self._faces = faces

    def get(self, _: np.ndarray) -> list[SimpleNamespace]:
        return self._faces


def fake_face(
    bbox: tuple[float, float, float, float],
    embedding_index: int,
) -> SimpleNamespace:
    embedding = np.zeros(512, dtype=np.float32)
    embedding[embedding_index] = 2
    return SimpleNamespace(
        bbox=np.asarray(bbox),
        det_score=0.99,
        normed_embedding=embedding,
    )


def engine_with_faces(faces: list[SimpleNamespace]) -> FaceEngine:
    engine = FaceEngine.__new__(FaceEngine)
    engine.model_name = "test"
    engine._analysis = FakeAnalysis(faces)
    return engine


def test_event_photo_extracts_and_normalizes_every_face() -> None:
    engine = engine_with_faces(
        [
            fake_face((0, 0, 100, 100), 0),
            fake_face((100, 100, 150, 150), 1),
        ]
    )

    faces = engine.event_photo_faces(np.zeros((200, 200, 3), dtype=np.uint8))

    assert [face.face_index for face in faces] == [0, 1]
    assert np.linalg.norm(faces[0].embedding) == pytest.approx(1)
    assert np.linalg.norm(faces[1].embedding) == pytest.approx(1)


def test_selfie_uses_dominant_face_when_background_face_is_small() -> None:
    engine = engine_with_faces(
        [
            fake_face((0, 0, 100, 100), 0),
            fake_face((0, 0, 20, 20), 1),
        ]
    )

    selected = engine.selfie_face(
        np.zeros((200, 200, 3), dtype=np.uint8),
        prominent_face_ratio=0.6,
    )

    assert selected.bounding_box == (0.0, 0.0, 100.0, 100.0)


def test_selfie_rejects_two_prominent_faces() -> None:
    engine = engine_with_faces(
        [
            fake_face((0, 0, 100, 100), 0),
            fake_face((0, 0, 90, 90), 1),
        ]
    )

    with pytest.raises(PermanentProcessingError, match="more than one"):
        engine.selfie_face(
            np.zeros((200, 200, 3), dtype=np.uint8),
            prominent_face_ratio=0.6,
        )
