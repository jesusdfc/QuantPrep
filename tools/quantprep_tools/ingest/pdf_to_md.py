"""Convert a book/paper PDF into a Markdown draft for personal study.

Usage:
    uv run --project tools python -m quantprep_tools.ingest.pdf_to_md \
        data/books/some_book.pdf

Output goes to ``data/md/<name>.md`` (gitignored). This is a personal reading aid;
copyrighted text must NEVER be copied into ``content/``. Only your own original
distillation belongs in the committed course.

Requires an optional extractor (``pypdf`` or ``pymupdf``). Install on demand:
    uv pip install --project tools pypdf
"""

from __future__ import annotations

import sys
from pathlib import Path

from quantprep_tools import paths


def _extract_text(pdf_path: Path) -> str:
    try:
        from pypdf import PdfReader  # type: ignore
    except ImportError as exc:  # pragma: no cover - optional dependency
        raise SystemExit(
            "pypdf is not installed. Run: uv pip install --project tools pypdf"
        ) from exc

    reader = PdfReader(str(pdf_path))
    return "\n\n".join(page.extract_text() or "" for page in reader.pages)


def main(argv: list[str] | None = None) -> int:
    argv = argv if argv is not None else sys.argv[1:]
    if not argv:
        print(__doc__)
        return 2

    pdf_path = Path(argv[0]).resolve()
    if paths.DATA_DIR not in pdf_path.parents:
        print(f"\u26a0\ufe0f  Refusing: input must live under the gitignored data/ dir ({paths.DATA_DIR}).")
        return 1
    if not pdf_path.exists():
        print(f"Not found: {pdf_path}")
        return 1

    out_dir = paths.DATA_DIR / "md"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{pdf_path.stem}.md"

    text = _extract_text(pdf_path)
    header = (
        f"<!-- Draft extracted from {pdf_path.name}. PERSONAL STUDY ONLY.\n"
        "     Do NOT copy this text into content/. Distill in your own words. -->\n\n"
    )
    out_path.write_text(header + text, encoding="utf-8")
    print(f"\u2705 Wrote draft: {out_path.relative_to(paths.REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
