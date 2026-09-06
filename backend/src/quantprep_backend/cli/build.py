"""Build static content artifacts for the frontend."""

from __future__ import annotations

from quantprep_backend.bootstrap import BackendContainer
from quantprep_backend.config import BackendConfig
from quantprep_backend.domain.models import ContentValidationError


def main() -> int:
    backend = BackendContainer(BackendConfig.discover())
    try:
        result = backend.build_content.execute()
    except ContentValidationError as error:
        print(f"❌ Refusing to build: {len(error.errors)} validation error(s):\n")
        print("\n".join(error.errors))
        return 1

    output = backend.config.frontend_public_dir.relative_to(backend.config.repository_root)
    print(
        f"✅ Built {result.questions} questions across {result.topics} topics "
        f"-> {output}/"
    )
    return 0
