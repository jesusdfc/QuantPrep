"""Build use case for frontend content artifacts."""

from __future__ import annotations

from typing import Any

from quantprep_backend.application.validate_content import ContentValidator
from quantprep_backend.domain.models import BuildResult, ContentValidationError
from quantprep_backend.infrastructure.content_repository import FileContentRepository
from quantprep_backend.infrastructure.json_writer import JsonArtifactWriter


class ContentIndexBuilder:
    """Compile validated source documents into the frontend data contract."""

    def __init__(
        self,
        content: FileContentRepository,
        writer: JsonArtifactWriter,
    ) -> None:
        self._content = content
        self._writer = writer

    def build(self) -> BuildResult:
        questions: list[dict[str, Any]] = []
        topics: list[dict[str, Any]] = []

        for topic_dir in self._content.topic_directories():
            topic = dict(self._content.topic(topic_dir).data)
            lessons = [self._content.lesson(path) for path in self._content.lesson_paths(topic_dir)]
            lessons.sort(
                key=lambda lesson: (
                    lesson.metadata.get("subtopic", ""),
                    lesson.metadata.get("order", 0),
                    lesson.metadata.get("id", ""),
                )
            )

            topic["lessons"] = [lesson.metadata for lesson in lessons]
            topic["lessonBodies"] = {str(lesson.metadata["id"]): lesson.body for lesson in lessons}

            topic_questions = []
            for document in self._content.questions(topic_dir):
                question = dict(document.data)
                question.setdefault("locked", False)
                topic_questions.append(question)

            questions.extend(topic_questions)
            topic["questionCount"] = len(topic_questions)
            topics.append(topic)

        questions.sort(key=lambda question: question["id"])
        topics.sort(key=lambda topic: (topic.get("order", 0), topic.get("id", "")))

        search_index = [
            {
                "id": question["id"],
                "title": question["title"],
                "topic": question["topic"],
                "subtopic": question["subtopic"],
                "difficulty": question["difficulty"],
                "tags": question.get("tags", []),
                "locked": question.get("locked", False),
            }
            for question in questions
        ]

        self._writer.write("questions.json", questions)
        self._writer.write("topics.json", topics)
        self._writer.write("search-index.json", search_index)
        return BuildResult(questions=len(questions), topics=len(topics))


class BuildContent:
    """Validate content, then build all frontend artifacts."""

    def __init__(self, validator: ContentValidator, builder: ContentIndexBuilder) -> None:
        self._validator = validator
        self._builder = builder

    def execute(self) -> BuildResult:
        errors = self._validator.validate()
        if errors:
            raise ContentValidationError(errors)
        return self._builder.build()
