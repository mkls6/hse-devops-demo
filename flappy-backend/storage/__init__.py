"""
storage package - storage backends for the Flappy Scoreboard application.

This module re-exports concrete storage implementations so other layers can import
them as:

    from storage import InMemoryStorage, PostgresStorage

Add additional storage implementations (e.g. database-backed) in this package
and re-export them here.
"""

from .in_memory import InMemoryStorage
from .postgres import PostgresStorage

__all__ = ["InMemoryStorage", "PostgresStorage"]
