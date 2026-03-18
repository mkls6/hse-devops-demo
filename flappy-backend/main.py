from typing import List

from fastapi import Depends, FastAPI, HTTPException

from logic.handlers import get_scoreboard as logic_get_scoreboard
from logic.handlers import put_result as logic_put_result

# Application layers
from models import Result, ScoreEntry
from storage.in_memory import InMemoryStorage

app = FastAPI(title="Flappy Scoreboard (layered)")

# Single in-memory storage instance. You can replace this with another implementation
# that follows the same interface (methods used below) and the rest of the app remains unchanged.
_storage = InMemoryStorage()


# Dependency provider for handlers/endpoints
def get_storage() -> InMemoryStorage:
    return _storage


@app.get("/", summary="API info")
def root():
    return {"message": "Flappy Scoreboard API (GET /scoreboard, PUT /scoreboard)"}


@app.get("/scoreboard", response_model=List[ScoreEntry])
def read_scoreboard(limit: int = 100, storage: InMemoryStorage = Depends(get_storage)):
    """
    Read the scoreboard. Delegates to the logic layer which uses the storage layer.
    Returns a list of ScoreEntry sorted by score descending.
    """
    try:
        return logic_get_scoreboard(storage, limit)
    except ValueError as exc:
        # Convert logic-level validation errors to HTTP errors
        raise HTTPException(status_code=400, detail=str(exc))


@app.put("/scoreboard", response_model=ScoreEntry, status_code=201)
def add_result(result: Result, storage: InMemoryStorage = Depends(get_storage)):
    """
    Submit a new result for a nickname. The logic layer decides how to store/update entries.
    Returns the stored ScoreEntry for the nickname after applying business rules.
    """
    try:
        return logic_put_result(storage, result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


if __name__ == "__main__":
    import uvicorn

    # Run with: python main.py
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
