from app.clients.vectors import VectorMatch
from app.services.face_search import FaceSearchService


def test_search_deduplicates_photos_and_keeps_best_score() -> None:
    results = FaceSearchService.deduplicate_matches(
        [
            VectorMatch(photo_id="photo-a", score=0.72),
            VectorMatch(photo_id="photo-b", score=0.81),
            VectorMatch(photo_id="photo-a", score=0.93),
        ]
    )

    assert [result.photo_id for result in results] == ["photo-a", "photo-b"]
    assert [result.confidence for result in results] == [0.93, 0.81]


def test_search_clamps_cosine_score_to_api_range() -> None:
    results = FaceSearchService.deduplicate_matches(
        [
            VectorMatch(photo_id="high", score=1.2),
            VectorMatch(photo_id="low", score=-0.2),
        ]
    )

    assert results[0].confidence == 1
    assert results[1].confidence == 0
