"""Dependency composition for backend commands."""

from __future__ import annotations

from quantprep_backend.application.build_content import BuildContent, ContentIndexBuilder
from quantprep_backend.application.validate_content import ContentValidator
from quantprep_backend.config import BackendConfig
from quantprep_backend.infrastructure.content_repository import FileContentRepository
from quantprep_backend.infrastructure.json_writer import JsonArtifactWriter
from quantprep_backend.infrastructure.schema_repository import SchemaRepository


class BackendContainer:
    """Construct the backend object graph from one configuration."""

    def __init__(self, config: BackendConfig) -> None:
        self.config = config
        self.content = FileContentRepository(config)
        self.schemas = SchemaRepository(config)
        self.writer = JsonArtifactWriter(config)
        self.validator = ContentValidator(config, self.content, self.schemas)
        self.index_builder = ContentIndexBuilder(self.content, self.writer)
        self.build_content = BuildContent(self.validator, self.index_builder)
