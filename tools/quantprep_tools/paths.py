"""Canonical repository paths.

The tools package lives at ``<repo>/tools/quantprep_tools``. Everything is resolved
relative to the repo root so the pipeline works regardless of the current directory.
"""

from __future__ import annotations

from pathlib import Path

# <repo>/tools/quantprep_tools/paths.py -> parents[2] == <repo>
REPO_ROOT: Path = Path(__file__).resolve().parents[2]

CONTENT_DIR: Path = REPO_ROOT / "content"
TOPICS_DIR: Path = CONTENT_DIR / "topics"
SCHEMA_DIR: Path = CONTENT_DIR / "schema"
RESOURCES_FILE: Path = CONTENT_DIR / "resources.yaml"

FRONTEND_PUBLIC_DIR: Path = REPO_ROOT / "frontend" / "public"
DATA_DIR: Path = REPO_ROOT / "data"  # gitignored raw inputs

QUESTION_SCHEMA: Path = SCHEMA_DIR / "question.schema.json"
LESSON_SCHEMA: Path = SCHEMA_DIR / "lesson.schema.json"
TOPIC_SCHEMA: Path = SCHEMA_DIR / "topic.schema.json"
