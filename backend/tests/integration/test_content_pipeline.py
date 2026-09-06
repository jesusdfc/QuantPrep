import json
import shutil
from pathlib import Path

from quantprep_backend.bootstrap import BackendContainer
from quantprep_backend.config import BackendConfig


def test_pipeline_validates_and_builds_current_content(tmp_path: Path) -> None:
    source_config = BackendConfig.discover()
    shutil.copytree(source_config.content_dir, tmp_path / "content")
    config = BackendConfig.from_repository_root(tmp_path)
    backend = BackendContainer(config)

    assert backend.validator.validate() == []

    result = backend.build_content.execute()
    question_files = list(config.topics_dir.glob("*/*/questions/*.yaml"))
    topic_directories = [path for path in config.topics_dir.iterdir() if path.is_dir()]

    assert result.questions == len(question_files)
    assert result.topics == len(topic_directories)

    questions = json.loads((config.frontend_public_dir / "questions.json").read_text())
    topics = json.loads((config.frontend_public_dir / "topics.json").read_text())
    search_index = json.loads((config.frontend_public_dir / "search-index.json").read_text())

    assert len(questions) == result.questions
    assert len(topics) == result.topics
    assert len(search_index) == result.questions
    assert [question["id"] for question in questions] == sorted(
        question["id"] for question in questions
    )
    assert all("solution" not in record for record in search_index)
