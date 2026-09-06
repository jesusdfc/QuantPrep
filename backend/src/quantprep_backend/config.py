"""Application configuration and canonical repository paths."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class BackendConfig:
    """Filesystem configuration shared by backend services."""

    repository_root: Path

    @classmethod
    def from_repository_root(cls, repository_root: Path) -> BackendConfig:
        return cls(repository_root=repository_root.resolve())

    @classmethod
    def discover(cls) -> BackendConfig:
        return cls.from_repository_root(Path(__file__).resolve().parents[3])

    @property
    def content_dir(self) -> Path:
        return self.repository_root / "content"

    @property
    def topics_dir(self) -> Path:
        return self.content_dir / "topics"

    @property
    def schema_dir(self) -> Path:
        return self.content_dir / "schema"

    @property
    def resources_file(self) -> Path:
        return self.content_dir / "resources.yaml"

    @property
    def frontend_public_dir(self) -> Path:
        return self.repository_root / "frontend" / "public"

    @property
    def data_dir(self) -> Path:
        return self.repository_root / "data"
