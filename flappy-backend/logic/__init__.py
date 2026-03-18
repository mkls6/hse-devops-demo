"""
logic package - application logic / handlers

This module re-exports the public symbols from the handlers module so other
parts of the application can import them as:

    from logic import get_scoreboard, put_result, StorageProtocol

The logic layer contains business logic and delegates persistence to a storage
implementation that follows the minimal StorageProtocol.
"""

from .handlers import StorageProtocol, get_scoreboard, put_result

__all__ = ["get_scoreboard", "put_result", "StorageProtocol"]
