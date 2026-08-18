from pathlib import Path
from tempfile import TemporaryDirectory

import cv2
from insightface.data import get_image

from app.services.face_engine import FaceEngine


def main() -> None:
    engine = FaceEngine(
        model_name="buffalo_l",
        model_root=Path("./models"),
        detection_size=640,
        detection_threshold=0.5,
    )
    image = get_image("t1")
    encoded, image_bytes = cv2.imencode(".jpg", image)
    if not encoded:
        raise RuntimeError("Could not encode the smoke-test image")

    with TemporaryDirectory() as temp_directory:
        image_path = Path(temp_directory) / "downloaded-image"
        image_path.write_bytes(image_bytes.tobytes())
        faces = engine.event_photo_faces_from_file(image_path)
    if not faces:
        raise RuntimeError("buffalo_l did not detect a face in the smoke image")
    if any(face.embedding.shape != (512,) for face in faces):
        raise RuntimeError("buffalo_l returned an unexpected embedding shape")
    print(f"buffalo_l smoke test passed with {len(faces)} detected face(s)")


if __name__ == "__main__":
    main()
