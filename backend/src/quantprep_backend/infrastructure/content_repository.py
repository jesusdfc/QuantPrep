"""Filesystem-backed access to authored QuantPrep content."""

from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path
from typing import Any

import yaml

from quantprep_backend.config import BackendConfig
from quantprep_backend.domain.models import LessonDocument, StructuredDocument
from quantprep_backend.infrastructure.frontmatter import parse_frontmatter


class FileContentRepository:
    """Read topics, questions, and lessons from the content directory."""

    def __init__(self, config: BackendConfig) -> None:
        self._config = config

    def topic_directories(self) -> list[Path]:
        if not self._config.topics_dir.exists():
            return []
        return sorted(path for path in self._config.topics_dir.iterdir() if path.is_dir())

    def topic(self, topic_dir: Path) -> StructuredDocument:
        path = topic_dir / "topic.yaml"
        return StructuredDocument(path=path, data=self._read_yaml(path))

    def questions(self, topic_dir: Path) -> Iterator[StructuredDocument]:
        for path in sorted(topic_dir.glob("*/questions/*.yaml")):
            yield StructuredDocument(path=path, data=self._read_yaml(path))

    def lesson_paths(self, topic_dir: Path) -> Iterator[Path]:
        yield from sorted(topic_dir.glob("*/theory/*.mdx"))

    @staticmethod
    def subtopic_of(path: Path) -> str:
        """The subtopic folder name for a question/theory file.

        Layout is ``<topic>/<subtopic>/{questions,theory}/<file>`` so the subtopic
        is the grandparent directory of the file.
        """
        return path.parents[1].name

    def lesson(self, path: Path) -> LessonDocument:
        metadata, body = parse_frontmatter(path)
        return LessonDocument(path=path, metadata=metadata, body=body)

    @staticmethod
    def _read_yaml(path: Path) -> dict[str, Any]:
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        if not isinstance(data, dict):
            raise ValueError(f"{path}: expected a YAML mapping")
        return data
