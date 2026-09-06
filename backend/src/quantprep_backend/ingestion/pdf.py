"""Extract a local PDF into a gitignored Markdown research draft."""

from __future__ import annotations

from pathlib import Path

from quantprep_backend.config import BackendConfig


class PdfIngestor:
    """Create personal-study Markdown drafts without publishing source text."""

    def __init__(self, config: BackendConfig) -> None:
        self._config = config

    def ingest(self, pdf_path: Path) -> Path:
        pdf_path = pdf_path.resolve()
        if self._config.data_dir not in pdf_path.parents:
            raise ValueError(f"input must live under {self._config.data_dir}")
        if not pdf_path.is_file():
            raise FileNotFoundError(pdf_path)

        try:
            from pypdf import PdfReader  # type: ignore[import-not-found]
        except ImportError as error:
            raise RuntimeError(
                "pypdf is not installed; run: uv add --project backend pypdf"
            ) from error

        text = "\n\n".join(page.extract_text() or "" for page in PdfReader(str(pdf_path)).pages)
        output_dir = self._config.data_dir / "md"
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"{pdf_path.stem}.md"
        header = (
            f"<!-- Draft extracted from {pdf_path.name}. PERSONAL STUDY ONLY.\n"
            "     Do NOT copy this text into content/. Distill in your own words. -->\n\n"
        )
        output_path.write_text(header + text, encoding="utf-8")
        return output_path
