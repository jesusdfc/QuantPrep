"""Loading and caching for content JSON Schemas."""

from __future__ import annotations

import json

from jsonschema import Draft7Validator

from quantprep_backend.config import BackendConfig


class SchemaRepository:
    """Provide validators for each authored content type."""

    def __init__(self, config: BackendConfig) -> None:
        self._config = config
        self._validators: dict[str, Draft7Validator] = {}

    def validator(self, content_type: str) -> Draft7Validator:
        if content_type not in self._validators:
            path = self._config.schema_dir / f"{content_type}.schema.json"
            with path.open(encoding="utf-8") as file:
                self._validators[content_type] = Draft7Validator(json.load(file))
        return self._validators[content_type]
