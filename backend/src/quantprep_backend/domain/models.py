"""Domain value objects used by the content pipeline."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class LessonDocument:
    path: Path
    metadata: dict[str, Any]
    body: str


@dataclass(frozen=True)
class StructuredDocument:
    path: Path
    data: dict[str, Any]


@dataclass(frozen=True)
class BuildResult:
    questions: int
    topics: int


class ContentValidationError(Exception):
    """Raised when invalid source content prevents an index build."""

    def __init__(self, errors: list[str]) -> None:
        self.errors = errors
        super().__init__(f"Content validation failed with {len(errors)} error(s)")
