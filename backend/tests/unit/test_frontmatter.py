from pathlib import Path

import pytest

from quantprep_backend.infrastructure.frontmatter import parse_frontmatter


def test_parse_frontmatter_returns_metadata_and_body(tmp_path: Path) -> None:
    lesson = tmp_path / "lesson.mdx"
    lesson.write_text("---\nid: lesson-1\norder: 2\n---\n\n# Lesson\n", encoding="utf-8")

    metadata, body = parse_frontmatter(lesson)

    assert metadata == {"id": "lesson-1", "order": 2}
    assert body == "# Lesson\n"


def test_parse_frontmatter_rejects_missing_fence(tmp_path: Path) -> None:
    lesson = tmp_path / "lesson.mdx"
    lesson.write_text("# Lesson\n", encoding="utf-8")

    with pytest.raises(ValueError, match="missing"):
        parse_frontmatter(lesson)
