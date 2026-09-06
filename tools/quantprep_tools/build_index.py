"""Compile ``content/`` into static artifacts consumed by the frontend.

Outputs (written to ``frontend/public/``, all gitignored):
  * ``questions.json``     — full question objects + body of each question
  * ``topics.json``        — topic manifests + lesson list (with rendered-ready MDX body)
  * ``search-index.json``  — lightweight per-question search records

Validation runs first; the build aborts on any schema error.
"""

from __future__ import annotations

import json
import sys

import yaml

from quantprep_tools import frontmatter, paths
from quantprep_tools.validate_content import validate


def _read_yaml(path) -> dict:
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def build() -> dict[str, int]:
    questions: list[dict] = []
    topics: list[dict] = []

    for topic_dir in sorted(p for p in paths.TOPICS_DIR.iterdir() if p.is_dir()):
        topic_meta = _read_yaml(topic_dir / "topic.yaml")

        lessons = []
        for lf in sorted(topic_dir.glob("theory/*.mdx")):
            front, body = frontmatter.parse(lf)
            lessons.append({**front, "body": body})
        lessons.sort(key=lambda x: x.get("order", 0))
        topic_meta["lessons"] = [
            {k: v for k, v in lesson.items() if k != "body"} for lesson in lessons
        ]
        topic_meta["lessonBodies"] = {lesson["id"]: lesson["body"] for lesson in lessons}

        n_q = 0
        for qf in sorted(topic_dir.glob("questions/*.yaml")):
            q = _read_yaml(qf)
            q.setdefault("locked", False)
            questions.append(q)
            n_q += 1

        topic_meta["questionCount"] = n_q
        topics.append(topic_meta)

    # Stable ordering for reproducible builds / clean diffs.
    questions.sort(key=lambda q: q["id"])
    topics.sort(key=lambda t: (t.get("order", 0), t.get("id", "")))

    search_index = [
        {
            "id": q["id"],
            "title": q["title"],
            "topic": q["topic"],
            "subtopic": q["subtopic"],
            "difficulty": q["difficulty"],
            "tags": q.get("tags", []),
            "locked": q.get("locked", False),
        }
        for q in questions
    ]

    paths.FRONTEND_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    _write(paths.FRONTEND_PUBLIC_DIR / "questions.json", questions)
    _write(paths.FRONTEND_PUBLIC_DIR / "topics.json", topics)
    _write(paths.FRONTEND_PUBLIC_DIR / "search-index.json", search_index)

    return {"questions": len(questions), "topics": len(topics)}


def _write(path, obj) -> None:
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    errors = validate()
    if errors:
        print(f"\u274c Refusing to build: {len(errors)} validation error(s):\n")
        print("\n".join(errors))
        return 1

    counts = build()
    print(
        f"\u2705 Built {counts['questions']} questions across {counts['topics']} topics "
        f"-> {paths.FRONTEND_PUBLIC_DIR.relative_to(paths.REPO_ROOT)}/"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
