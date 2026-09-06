"""Minimal YAML front-matter parser for ``.mdx`` lesson files.

A lesson file looks like::

    ---
    id: intro
    title: Introduction
    topic: probability
    order: 0
    ---

    # Body markdown...

We deliberately avoid an extra dependency and parse the ``---`` fenced block ourselves.
"""

from __future__ import annotations

from pathlib import Path

import yaml


def parse(path: Path) -> tuple[dict, str]:
    """Return ``(front_matter_dict, body)`` for an MDX file.

    Raises ``ValueError`` if the front-matter fence is missing or malformed.
    """
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        raise ValueError(f"{path}: missing '---' front-matter fence at start of file")

    parts = text.split("---", 2)
    # parts == ['', '<yaml>', '<body>']
    if len(parts) < 3:
        raise ValueError(f"{path}: unterminated front-matter fence")

    front = yaml.safe_load(parts[1]) or {}
    if not isinstance(front, dict):
        raise ValueError(f"{path}: front-matter must be a mapping")
    body = parts[2].lstrip("\n")
    return front, body
