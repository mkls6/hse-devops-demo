from threading import Lock
from typing import Dict, List

from models import ScoreEntry


class InMemoryStorage:
    """
    Thread-safe in-memory storage for the scoreboard.

    Responsibilities:
    - Keep the best (maximum) score per nickname.
    - Provide retrieval of the scoreboard sorted by score descending.

    Public API:
    - get_scoreboard(limit: int = 100) -> List[ScoreEntry]
    - put_result(nickname: str, score: int) -> ScoreEntry
    """

    def __init__(self) -> None:
        self._lock = Lock()
        self._board: Dict[str, int] = {}

    def get_scoreboard(self, limit: int = 100) -> List[ScoreEntry]:
        """
        Return the scoreboard as a list of ScoreEntry objects sorted by score (descending),
        then by nickname (ascending) to provide deterministic ordering.

        Args:
            limit: maximum number of entries to return (must be positive).

        Raises:
            ValueError: if `limit` is not positive.
        """
        if limit <= 0:
            raise ValueError("limit must be positive")

        with self._lock:
            items = [ScoreEntry(nickname=n, score=s) for n, s in self._board.items()]

        items.sort(key=lambda e: (-e.score, e.nickname))
        return items[:limit]

    def put_result(self, nickname: str, score: int) -> ScoreEntry:
        """
        Store a result for `nickname`. Keeps the maximal score per nickname.

        Args:
            nickname: player's nickname.
            score: player's score (expected to be non-negative).

        Returns:
            The ScoreEntry currently stored for the nickname after the operation.

        Raises:
            ValueError: if `nickname` is empty or `score` is negative.
        """
        if not nickname:
            raise ValueError("nickname must be non-empty")
        if score < 0:
            raise ValueError("score must be non-negative")

        with self._lock:
            current = self._board.get(nickname)
            if current is None or score > current:
                self._board[nickname] = score
            stored = self._board[nickname]

        return ScoreEntry(nickname=nickname, score=stored)

    # Helper methods that can be useful for testing / debugging

    def clear(self) -> None:
        """Remove all entries from the storage."""
        with self._lock:
            self._board.clear()

    def dump(self) -> Dict[str, int]:
        """Return a shallow copy of the underlying storage mapping (nickname -> score)."""
        with self._lock:
            return dict(self._board)
