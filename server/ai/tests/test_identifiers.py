from app.utils.identifiers import face_point_id


def test_face_point_id_is_deterministic_and_face_specific() -> None:
    first = face_point_id("buffalo_l-v1", "photo-1", 0)
    repeated = face_point_id("buffalo_l-v1", "photo-1", 0)
    another_face = face_point_id("buffalo_l-v1", "photo-1", 1)

    assert first == repeated
    assert first != another_face
