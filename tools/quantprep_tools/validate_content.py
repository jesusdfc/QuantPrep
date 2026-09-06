"""Validate all content against the JSON Schemas in ``content/schema/``.

Checks:
  * every ``content/topics/<topic>/topic.yaml`` matches topic.schema.json
  * every ``content/topics/<topic>/questions/*.yaml`` matches question.schema.json
  * every ``content/topics/<topic>/theory/*.mdx`` front-matter matches lesson.schema.json
  * question / lesson ids are globally unique
  * a question's ``topic`` matches the folder it lives in

Exit code 0 on success, 1 on any error. Used by ``make validate`` and CI.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import yaml
from jsonschema import Draft7Validator

from quantprep_tools import frontmatter, paths


def _load_schema(path: Path) -> Draft7Validator:
    with path.open(encoding="utf-8") as fh:
        return Draft7Validator(json.load(fh))


def _errors_for(validator: Draft7Validator, instance: dict, label: str) -> list[str]:
    out = []
    for err in sorted(validator.iter_errors(instance), key=lambda e: list(e.path)):
        loc = "/".join(str(p) for p in err.path) or "<root>"
        out.append(f"  [{label}] {loc}: {err.message}")
    return out


def validate() -> list[str]:
    errors: list[str] = []
    seen_ids: dict[str, str] = {}

    if not paths.TOPICS_DIR.exists():
        return [f"topics directory not found: {paths.TOPICS_DIR}"]

    q_validator = _load_schema(paths.QUESTION_SCHEMA)
    l_validator = _load_schema(paths.LESSON_SCHEMA)
    t_validator = _load_schema(paths.TOPIC_SCHEMA)

    for topic_dir in sorted(p for p in paths.TOPICS_DIR.iterdir() if p.is_dir()):
        topic_id = topic_dir.name

        # topic.yaml
        topic_file = topic_dir / "topic.yaml"
        if not topic_file.exists():
            errors.append(f"{topic_dir}: missing topic.yaml")
        else:
            data = yaml.safe_load(topic_file.read_text(encoding="utf-8")) or {}
            errors += _errors_for(t_validator, data, str(topic_file.relative_to(paths.REPO_ROOT)))
            if data.get("id") != topic_id:
                errors.append(f"{topic_file}: id '{data.get('id')}' != folder '{topic_id}'")

        # questions
        for qf in sorted(topic_dir.glob("questions/*.yaml")):
            rel = str(qf.relative_to(paths.REPO_ROOT))
            data = yaml.safe_load(qf.read_text(encoding="utf-8")) or {}
            errors += _errors_for(q_validator, data, rel)
            qid = data.get("id")
            if qid:
                if qid in seen_ids:
                    errors.append(f"{rel}: duplicate id '{qid}' (also in {seen_ids[qid]})")
                seen_ids[qid] = rel
            if data.get("topic") and data["topic"] != topic_id:
                errors.append(f"{rel}: topic '{data['topic']}' != folder '{topic_id}'")

        # theory lessons
        for lf in sorted(topic_dir.glob("theory/*.mdx")):
            rel = str(lf.relative_to(paths.REPO_ROOT))
            try:
                front, _ = frontmatter.parse(lf)
            except ValueError as exc:
                errors.append(str(exc))
                continue
            errors += _errors_for(l_validator, front, rel)
            lid = front.get("id")
            if lid:
                key = f"lesson:{lid}"
                if key in seen_ids:
                    errors.append(f"{rel}: duplicate lesson id '{lid}' (also in {seen_ids[key]})")
                seen_ids[key] = rel
            if front.get("topic") and front["topic"] != topic_id:
                errors.append(f"{rel}: topic '{front['topic']}' != folder '{topic_id}'")

    return errors


def main() -> int:
    errors = validate()
    if errors:
        print(f"\u274c Content validation failed with {len(errors)} error(s):\n")
        print("\n".join(errors))
        return 1
    print("\u2705 Content validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
