"""
data package - DTOs for the Flappy Scoreboard application.

Expose commonly used Pydantic models so other layers can import them as:
    from data import Result, ScoreEntry
"""

from .models import Result, ScoreEntry

__all__ = ["Result", "ScoreEntry"]
