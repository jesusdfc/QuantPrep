"""Template for a polite web scraper.

Writes ONLY to ``data/scraped/`` (gitignored). Respect each site's robots.txt and
Terms of Service. Scraped text is a personal research aid; never commit it and never
paste all-rights-reserved text into ``content/`` — link to it in ``resources.yaml``
instead.

Usage:
    uv run --project tools python -m quantprep_tools.ingest.scrape_example <url>
"""

from __future__ import annotations

import sys
import time
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

from quantprep_tools import paths

USER_AGENT = "QuantPrepBot/0.1 (+https://quantprep.me; personal study)"
POLITE_DELAY_S = 1.0


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    time.sleep(POLITE_DELAY_S)
    with urllib.request.urlopen(req, timeout=30) as resp:  # noqa: S310 - explicit template
        return resp.read().decode("utf-8", errors="replace")


def main(argv: list[str] | None = None) -> int:
    argv = argv if argv is not None else sys.argv[1:]
    if not argv:
        print(__doc__)
        return 2

    url = argv[0]
    out_dir = paths.DATA_DIR / "scraped"
    out_dir.mkdir(parents=True, exist_ok=True)

    slug = (urlparse(url).netloc + urlparse(url).path).strip("/").replace("/", "_") or "index"
    out_path = out_dir / f"{slug}.html"

    out_path.write_text(fetch(url), encoding="utf-8")
    print(f"\u2705 Saved: {out_path.relative_to(paths.REPO_ROOT)} (personal study only)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
