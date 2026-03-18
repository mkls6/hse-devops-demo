import os
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from logic import StorageProtocol
from logic import get_scoreboard as logic_get_scoreboard
from logic import put_result as logic_put_result
from models import Result, ScoreEntry
from storage import InMemoryStorage, PostgresStorage

_storage_instance: Optional[StorageProtocol] = None


def _create_storage_from_env() -> StorageProtocol:
    storage_type = os.environ.get("STORAGE_TYPE", "memory").lower()
    if storage_type in ("memory", "inmemory", "in_memory"):
        return InMemoryStorage()
    if storage_type in ("postgres", "postgresql", "db"):
        dsn = os.environ.get("DATABASE_DSN") or os.environ.get("POSTGRES_DSN")
        if not dsn:
            raise RuntimeError(
                "DATABASE_DSN environment variable is required for Postgres storage"
            )
        return PostgresStorage(dsn)
    raise RuntimeError(f"unsupported STORAGE_TYPE: {storage_type}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _storage_instance
    if _storage_instance is None:
        try:
            _storage_instance = _create_storage_from_env()
        except Exception as exc:
            raise RuntimeError(f"failed to initialize storage: {exc}") from exc
    try:
        yield
    finally:
        # Ensure we always try to clean up the storage instance when the app shuts down.
        if _storage_instance is not None:
            close_fn = getattr(_storage_instance, "close", None)
            if callable(close_fn):
                try:
                    close_fn()
                except Exception:
                    # ignore cleanup errors
                    pass
            # release reference
            _storage_instance = None


app = FastAPI(title="Flappy Scoreboard", lifespan=lifespan)

# CORS configuration: use CORS_ALLOW_ORIGINS env var (comma-separated) or "*" for all.
_cors_env = os.environ.get("CORS_ALLOW_ORIGINS", "*")
if _cors_env.strip() == "*":
    _origins = ["*"]
else:
    _origins = [o.strip() for o in _cors_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_storage_dep() -> StorageProtocol:
    if _storage_instance is None:
        raise RuntimeError("storage is not initialized")
    return _storage_instance


@app.get("/", summary="API info")
def root():
    return {"message": "Flappy Scoreboard API (GET /scoreboard, PUT /scoreboard)"}


@app.get("/scoreboard", response_model=List[ScoreEntry])
def read_scoreboard(
    limit: int = 100, storage: StorageProtocol = Depends(get_storage_dep)
):
    try:
        return logic_get_scoreboard(storage, limit)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.put("/scoreboard", response_model=ScoreEntry, status_code=201)
def add_result(result: Result, storage: StorageProtocol = Depends(get_storage_dep)):
    try:
        return logic_put_result(storage, result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "8000")),
        reload=False,
    )
