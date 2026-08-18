from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class CamelModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class PhotoIndexJob(CamelModel):
    event_id: str = Field(alias="eventId")
    photo_id: str = Field(alias="photoId")
    secure_url: HttpUrl = Field(alias="secureUrl")


class SearchJob(CamelModel):
    job_type: Literal["telegram-selfie"] = Field(alias="jobType")
    event_id: str = Field(alias="eventId")
    search_request_id: str = Field(alias="searchRequestId")
    selfie_url: HttpUrl = Field(alias="selfieUrl")


class EventCleanupJob(CamelModel):
    event_id: str = Field(alias="eventId")


class PhotoStatusCallback(CamelModel):
    photo_id: str = Field(alias="photoId")
    status: Literal["PROCESSING", "COMPLETED", "FAILED"]


class MatchedPhotoMetadata(CamelModel):
    photo_id: str = Field(alias="photoId")
    confidence: float = Field(ge=0, le=1)


class SearchStatusCallback(CamelModel):
    search_request_id: str = Field(alias="searchRequestId")
    status: Literal["PROCESSING", "COMPLETED", "FAILED"]
    matched_photos_metadata: list[MatchedPhotoMetadata] | None = Field(
        default=None,
        alias="matchedPhotosMetadata",
    )
