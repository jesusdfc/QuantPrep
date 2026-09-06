"""CLI adapter for local-only web ingestion."""

from __future__ import annotations

import sys

from quantprep_backend.config import BackendConfig
from quantprep_backend.ingestion.web import WebIngestor


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: qp-scrape <url>")
        return 2

    config = BackendConfig.discover()
    try:
        output = WebIngestor(config).ingest(sys.argv[1])
    except (OSError, ValueError) as error:
        print(f"❌ {error}")
        return 1

    print(f"✅ Saved: {output.relative_to(config.repository_root)} (personal study only)")
    return 0
