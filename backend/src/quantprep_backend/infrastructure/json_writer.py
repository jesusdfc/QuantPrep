"""Stable JSON artifact output."""

from __future__ import annotations

import json
from typing import Any

from quantprep_backend.config import BackendConfig


class JsonArtifactWriter:
    """Write reproducible frontend artifacts."""

    def __init__(self, config: BackendConfig) -> None:
        self._output_dir = config.frontend_public_dir

    def write(self, filename: str, value: Any) -> None:
        self._output_dir.mkdir(parents=True, exist_ok=True)
        path = self._output_dir / filename
        path.write_text(
            json.dumps(value, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
