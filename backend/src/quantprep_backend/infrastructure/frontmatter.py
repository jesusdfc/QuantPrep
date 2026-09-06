"""YAML front-matter parsing for MDX lesson files."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml


def parse_frontmatter(path: Path) -> tuple[dict[str, Any], str]:
    """Return an MDX file's front-matter mapping and body."""

    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        raise ValueError(f"{path}: missing '---' front-matter fence at start of file")

    parts = text.split("---", 2)
    if len(parts) < 3:
        raise ValueError(f"{path}: unterminated front-matter fence")

    metadata = yaml.safe_load(parts[1]) or {}
    if not isinstance(metadata, dict):
        raise ValueError(f"{path}: front-matter must be a mapping")

    return metadata, parts[2].lstrip("\n")
