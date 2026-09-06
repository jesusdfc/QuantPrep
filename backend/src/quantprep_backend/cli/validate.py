"""Validate all authored content."""

from __future__ import annotations

from quantprep_backend.bootstrap import BackendContainer
from quantprep_backend.config import BackendConfig


def main() -> int:
    backend = BackendContainer(BackendConfig.discover())
    errors = backend.validator.validate()
    if errors:
        print(f"❌ Content validation failed with {len(errors)} error(s):\n")
        print("\n".join(errors))
        return 1

    print("✅ Content validation passed.")
    return 0
