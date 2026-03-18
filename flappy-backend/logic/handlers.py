from typing import List, Protocol, runtime_checkable

from models import Result, ScoreEntry


@runtime_checkable
class StorageProtocol(Protocol):
    """
    Minimal storage protocol expected by the logic layer.

    Implementations must provide:
    - get_scoreboard(limit: int) -> List[ScoreEntry]
    - put_result(nickname: str, score: int) -> ScoreEntry
    """

    def get_scoreboard(self, limit: int = 100) -> List[ScoreEntry]: ...

    def put_result(self, nickname: str, score: int) -> ScoreEntry: ...


def get_scoreboard(storage: StorageProtocol, limit: int = 100) -> List[ScoreEntry]:
    """
    Return the scoreboard via the provided storage.

    Validates the input and delegates retrieval to the storage layer.

    Raises:
        ValueError: if `limit` is not positive or storage doesn't implement the required methods.
    """
    if limit <= 0:
        raise ValueError("limit must be positive")

    # Basic runtime check for the storage interface (helpful during development/tests)
    if not hasattr(storage, "get_scoreboard"):
        raise ValueError("storage must implement get_scoreboard(limit)")

    return storage.get_scoreboard(limit)


def put_result(storage: StorageProtocol, result: Result) -> ScoreEntry:
    """
    Process a submitted result and delegate storage decisions to the storage layer.

    Business rules:
    - Score must be non-negative (validated by DTO, but double-check here).
    - Storage is responsible for keeping the best (maximum) score per nickname.

    Raises:
        ValueError: if score is negative or storage doesn't implement the required methods.
    """
    if result.score < 0:
        raise ValueError("score must be non-negative")

    if not hasattr(storage, "put_result"):
        raise ValueError("storage must implement put_result(nickname, score)")

    return storage.put_result(result.nickname, result.score)
