from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    redis_url: str = "redis://:photodeyredis123@localhost:6379"
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str | None = "photodey_qdrant_key"
    qdrant_collection: str = "photo_faces_v1"

    node_api_url: str = "http://localhost:3000"
    ai_webhook_secret: str = "replace-me"

    face_model_name: str = "buffalo_l"
    face_model_root: Path = Path("./models")
    face_detection_size: int = Field(default=640, ge=128, le=2048)
    face_detection_threshold: float = Field(default=0.5, ge=0, le=1)
    face_match_threshold: float = Field(default=0.45, ge=-1, le=1)
    face_search_limit: int = Field(default=200, ge=1, le=10_000)
    prominent_face_ratio: float = Field(default=0.6, ge=0, le=1)

    max_image_bytes: int = Field(default=25 * 1024 * 1024, ge=1)
    http_timeout_seconds: float = Field(default=30, gt=0)
    worker_concurrency: int = Field(default=1, ge=1)
    log_level: str = "INFO"

    deleted_event_key_prefix: str = "ai:deleted-event:"
    callback_marker_key_prefix: str = "ai:callback-sent:"

    @property
    def model_version(self) -> str:
        return f"{self.face_model_name}-v1"


@lru_cache
def get_settings() -> Settings:
    return Settings()
