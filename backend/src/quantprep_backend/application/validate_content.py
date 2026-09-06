"""Validation use case for authored content."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from jsonschema import Draft7Validator

from quantprep_backend.config import BackendConfig
from quantprep_backend.infrastructure.content_repository import FileContentRepository
from quantprep_backend.infrastructure.schema_repository import SchemaRepository


class ContentValidator:
    """Validate schemas and relationships across the content tree."""

    def __init__(
        self,
        config: BackendConfig,
        content: FileContentRepository,
        schemas: SchemaRepository,
    ) -> None:
        self._config = config
        self._content = content
        self._schemas = schemas

    def validate(self) -> list[str]:
        if not self._config.topics_dir.exists():
            return [f"topics directory not found: {self._config.topics_dir}"]

        errors: list[str] = []
        seen_question_ids: dict[str, str] = {}
        seen_lesson_ids: dict[str, str] = {}

        topic_validator = self._schemas.validator("topic")
        question_validator = self._schemas.validator("question")
        lesson_validator = self._schemas.validator("lesson")

        for topic_dir in self._content.topic_directories():
            topic_id = topic_dir.name
            topic_path = topic_dir / "topic.yaml"
            declared_subtopics: set[str] = set()

            if not topic_path.exists():
                errors.append(f"{topic_dir}: missing topic.yaml")
            else:
                topic = self._content.topic(topic_dir)
                label = self._relative(topic.path)
                errors.extend(self._schema_errors(topic_validator, topic.data, label))
                if topic.data.get("id") != topic_id:
                    errors.append(
                        f"{topic.path}: id '{topic.data.get('id')}' != folder '{topic_id}'"
                    )
                declared_subtopics = {
                    s.get("id") for s in topic.data.get("subtopics", []) if isinstance(s, dict)
                }

            for question in self._content.questions(topic_dir):
                label = self._relative(question.path)
                errors.extend(self._schema_errors(question_validator, question.data, label))
                question_id = question.data.get("id")
                if question_id:
                    if question_id in seen_question_ids:
                        errors.append(
                            f"{label}: duplicate id '{question_id}' "
                            f"(also in {seen_question_ids[question_id]})"
                        )
                    seen_question_ids[question_id] = label
                if question.data.get("topic") and question.data["topic"] != topic_id:
                    errors.append(
                        f"{label}: topic '{question.data['topic']}' != folder '{topic_id}'"
                    )
                errors.extend(
                    self._subtopic_errors(
                        question.path, question.data.get("subtopic"), declared_subtopics, label
                    )
                )

            for lesson_path in self._content.lesson_paths(topic_dir):
                label = self._relative(lesson_path)
                try:
                    lesson = self._content.lesson(lesson_path)
                except ValueError as error:
                    errors.append(str(error))
                    continue

                errors.extend(self._schema_errors(lesson_validator, lesson.metadata, label))
                lesson_id = lesson.metadata.get("id")
                if lesson_id:
                    if lesson_id in seen_lesson_ids:
                        errors.append(
                            f"{label}: duplicate lesson id '{lesson_id}' "
                            f"(also in {seen_lesson_ids[lesson_id]})"
                        )
                    seen_lesson_ids[lesson_id] = label
                if lesson.metadata.get("topic") and lesson.metadata["topic"] != topic_id:
                    errors.append(
                        f"{label}: topic '{lesson.metadata['topic']}' != folder '{topic_id}'"
                    )
                errors.extend(
                    self._subtopic_errors(
                        lesson_path, lesson.metadata.get("subtopic"), declared_subtopics, label
                    )
                )

        return errors

    def _subtopic_errors(
        self,
        path: Path,
        declared_value: str | None,
        declared_subtopics: set[str],
        label: str,
    ) -> list[str]:
        """Check the file's subtopic folder is declared and matches its metadata."""
        folder_subtopic = self._content.subtopic_of(path)
        errors: list[str] = []
        if declared_subtopics and folder_subtopic not in declared_subtopics:
            errors.append(
                f"{label}: subtopic folder '{folder_subtopic}' is not declared in topic.yaml"
            )
        if declared_value and declared_value != folder_subtopic:
            errors.append(f"{label}: subtopic '{declared_value}' != folder '{folder_subtopic}'")
        return errors

    def _relative(self, path: Path) -> str:
        return str(path.relative_to(self._config.repository_root))

    @staticmethod
    def _schema_errors(
        validator: Draft7Validator,
        instance: dict[str, Any],
        label: str,
    ) -> list[str]:
        errors = []
        for error in sorted(validator.iter_errors(instance), key=lambda item: list(item.path)):
            location = "/".join(str(part) for part in error.path) or "<root>"
            errors.append(f"  [{label}] {location}: {error.message}")
        return errors
