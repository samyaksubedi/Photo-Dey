from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
import numpy as np
from insightface.app import FaceAnalysis
from numpy.typing import NDArray

from app.clients.vectors import FaceVector
from app.errors import PermanentProcessingError


@dataclass(frozen=True)
class DetectedFace:
    embedding: NDArray[Any]
    detection_score: float
    bounding_box: tuple[float, float, float, float]

    @property
    def area(self) -> float:
        left, top, right, bottom = self.bounding_box
        return max(0.0, right - left) * max(0.0, bottom - top)


class FaceEngine:
    def __init__(
        self,
        model_name: str,
        model_root: Path,
        detection_size: int,
        detection_threshold: float,
    ) -> None:
        self.model_name = model_name
        self._analysis = FaceAnalysis(
            name=model_name,
            root=str(model_root),
            allowed_modules=["detection", "recognition"],
            providers=["CPUExecutionProvider"],
        )
        self._analysis.prepare(
            ctx_id=-1,
            det_size=(detection_size, detection_size),
            det_thresh=detection_threshold,
        )

    @staticmethod
    def load_image(path: Path) -> NDArray[np.uint8]:
        image = cv2.imread(str(path), cv2.IMREAD_COLOR)
        if image is None or image.size == 0:
            raise PermanentProcessingError("Image could not be decoded")
        return image

    def detect(self, image: NDArray[np.uint8]) -> list[DetectedFace]:
        detected: list[DetectedFace] = []
        for face in self._analysis.get(image):
            raw_embedding = getattr(face, "normed_embedding", None)
            if raw_embedding is None:
                raw_embedding = getattr(face, "embedding", None)
            if raw_embedding is None:
                continue

            embedding = np.asarray(raw_embedding, dtype=np.float32)
            norm = float(np.linalg.norm(embedding))
            if norm == 0:
                continue
            embedding = embedding / norm
            if embedding.shape != (512,):
                raise PermanentProcessingError(
                    f"Face model returned {embedding.shape} instead of a 512d vector"
                )

            bbox = tuple(float(value) for value in face.bbox)
            detected.append(
                DetectedFace(
                    embedding=embedding,
                    detection_score=float(face.det_score),
                    bounding_box=(bbox[0], bbox[1], bbox[2], bbox[3]),
                )
            )
        return detected

    def event_photo_faces(self, image: NDArray[np.uint8]) -> list[FaceVector]:
        return [
            FaceVector(
                face_index=index,
                embedding=face.embedding,
                detection_score=face.detection_score,
                bounding_box=face.bounding_box,
            )
            for index, face in enumerate(self.detect(image))
        ]

    def event_photo_faces_from_file(self, path: Path) -> list[FaceVector]:
        return self.event_photo_faces(self.load_image(path))

    def selfie_face(
        self,
        image: NDArray[np.uint8],
        prominent_face_ratio: float,
    ) -> DetectedFace:
        faces = sorted(self.detect(image), key=lambda face: face.area, reverse=True)
        if not faces:
            raise PermanentProcessingError("No face was detected in the selfie")

        primary = faces[0]
        if (
            len(faces) > 1
            and primary.area > 0
            and faces[1].area / primary.area >= prominent_face_ratio
        ):
            raise PermanentProcessingError(
                "The selfie contains more than one prominent face"
            )
        return primary

    def selfie_face_from_file(
        self,
        path: Path,
        prominent_face_ratio: float,
    ) -> DetectedFace:
        return self.selfie_face(self.load_image(path), prominent_face_ratio)
