from typing import List

import psycopg2
import psycopg2.extras
import psycopg2.pool

from models import ScoreEntry


class PostgresStorage:
    """
    PostgreSQL storage backend for the Flappy scoreboard.

    Usage:
        storage = PostgresStorage(dsn="postgres://user:pass@host:5432/dbname")
        storage.put_result("alice", 42)
        entries = storage.get_scoreboard(10)
        storage.close()

    The implementation uses a threaded connection pool and performs minimal
    schema bootstrapping (creates the `scoreboard` table if it doesn't exist).
    """

    def __init__(self, dsn: str, minconn: int = 1, maxconn: int = 10) -> None:
        if not dsn:
            raise ValueError("dsn must be provided")
        self._pool = psycopg2.pool.ThreadedConnectionPool(
            minconn, maxconn, dsn=dsn, cursor_factory=psycopg2.extras.RealDictCursor
        )
        self._ensure_table()

    def _ensure_table(self) -> None:
        conn = None
        try:
            conn = self._pool.getconn()
            with conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS scoreboard (
                        nickname TEXT PRIMARY KEY,
                        score INTEGER NOT NULL
                    )
                    """
                )
            conn.commit()
        finally:
            if conn is not None:
                self._pool.putconn(conn)

    def get_scoreboard(self, limit: int = 100) -> List[ScoreEntry]:
        if limit <= 0:
            raise ValueError("limit must be positive")
        conn = None
        try:
            conn = self._pool.getconn()
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT nickname, score
                    FROM scoreboard
                    ORDER BY score DESC, nickname ASC
                    LIMIT %s
                    """,
                    (limit,),
                )
                rows = cur.fetchall()
            return [ScoreEntry(nickname=r["nickname"], score=r["score"]) for r in rows]
        finally:
            if conn is not None:
                self._pool.putconn(conn)

    def put_result(self, nickname: str, score: int) -> ScoreEntry:
        if not nickname:
            raise ValueError("nickname must be non-empty")
        if score < 0:
            raise ValueError("score must be non-negative")
        conn = None
        try:
            conn = self._pool.getconn()
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO scoreboard (nickname, score)
                    VALUES (%s, %s)
                    ON CONFLICT (nickname)
                    DO UPDATE SET score = GREATEST(scoreboard.score, EXCLUDED.score)
                    RETURNING nickname, scoreboard.score AS score
                    """,
                    (nickname, score),
                )
                row = cur.fetchone()
            conn.commit()
            return ScoreEntry(nickname=row["nickname"], score=row["score"])
        finally:
            if conn is not None:
                self._pool.putconn(conn)

    def clear(self) -> None:
        conn = None
        try:
            conn = self._pool.getconn()
            with conn.cursor() as cur:
                cur.execute("DELETE FROM scoreboard")
            conn.commit()
        finally:
            if conn is not None:
                self._pool.putconn(conn)

    def close(self) -> None:
        try:
            self._pool.closeall()
        except Exception:
            pass
