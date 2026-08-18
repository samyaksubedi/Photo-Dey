from uuid import NAMESPACE_URL, uuid5


def face_point_id(model_version: str, photo_id: str, face_index: int) -> str:
    value = f"photodey:{model_version}:{photo_id}:{face_index}"
    return str(uuid5(NAMESPACE_URL, value))
