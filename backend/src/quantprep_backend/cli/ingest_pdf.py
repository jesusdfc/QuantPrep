"""CLI adapter for PDF ingestion."""

from __future__ import annotations

import sys
from pathlib import Path

from quantprep_backend.config import BackendConfig
from quantprep_backend.ingestion.pdf import PdfIngestor


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: qp-ingest-pdf data/books/<file>.pdf")
        return 2

    config = BackendConfig.discover()
    try:
        output = PdfIngestor(config).ingest(Path(sys.argv[1]))
    except (FileNotFoundError, RuntimeError, ValueError) as error:
        print(f"❌ {error}")
        return 1

    print(f"✅ Wrote draft: {output.relative_to(config.repository_root)}")
    return 0
