# QuantPrep backend

The Python backend validates authored content, builds the static JSON contract consumed by
the frontend, and provides local-only ingestion utilities for manual research.

## Architecture

- `application/` — validation and build use cases.
- `domain/` — dependency-free value objects and errors.
- `infrastructure/` — filesystem, schema, front-matter, and JSON adapters.
- `ingestion/` — guarded utilities that write raw source material only under `/data`.
- `cli/` — thin command-line adapters and exit-code handling.
- `bootstrap.py` — the single dependency-composition root.

All services are configured through `BackendConfig`. The published `content/` tree remains
separate from the gitignored `data/` research corpus.

## Commands

Run from the repository root:

```bash
uv run --project backend qp-validate
uv run --project backend qp-build
uv run --project backend pytest
uv run --project backend ruff check backend/src backend/tests
```

PDF and web ingestion are intentionally manual and local:

```bash
uv run --project backend qp-ingest-pdf data/books/example.pdf
uv run --project backend qp-scrape https://example.com/article
```
