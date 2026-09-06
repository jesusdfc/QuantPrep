"""Polite, local-only web ingestion for manual research."""

from __future__ import annotations

import re
import time
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

from quantprep_backend.config import BackendConfig


class WebIngestor:
    """Download one page into the gitignored research corpus."""

    def __init__(self, config: BackendConfig) -> None:
        self._config = config
        self._user_agent = "QuantPrepBot/0.1 (+https://quantprep.me; personal study)"

    def ingest(self, url: str) -> Path:
        request = urllib.request.Request(url, headers={"User-Agent": self._user_agent})
        time.sleep(1.0)
        with urllib.request.urlopen(request, timeout=30) as response:  # noqa: S310
            body = response.read().decode("utf-8", errors="replace")

        output_dir = self._config.data_dir / "scraped"
        output_dir.mkdir(parents=True, exist_ok=True)
        parsed = urlparse(url)
        source_name = f"{parsed.netloc}_{parsed.path}".strip("_/") or "index"
        slug = re.sub(r"[^a-zA-Z0-9._-]+", "_", source_name)
        output_path = output_dir / f"{slug}.html"
        output_path.write_text(body, encoding="utf-8")
        return output_path
