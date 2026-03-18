from pydantic import BaseModel, Field


class Result(BaseModel):
    """
    DTO for submitting a new result.

    - nickname: non-empty string with a reasonable max length
    - score: non-negative integer
    """

    nickname: str = Field(..., min_length=1, max_length=64)
    score: int = Field(..., ge=0)


class ScoreEntry(BaseModel):
    """
    DTO representing a stored scoreboard entry.
    """

    nickname: str
    score: int

    class Config:
        orm_mode = True
