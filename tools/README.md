# quantprep-tools

Content pipeline for QuantPrep.

- `validate_content.py` — validate every `topic.yaml`, question `*.yaml`, and lesson `*.mdx`
  front-matter against the JSON Schemas in `content/schema/`. Also checks id uniqueness.
- `build_index.py` — compile `content/` into static artifacts the frontend consumes:
  `frontend/public/questions.json`, `topics.json`, `search-index.json`.
- `ingest/pdf_to_md.py` — convert a book PDF (under the gitignored `data/`) into a Markdown
  draft (also under `data/`) for you to distill by hand into `content/`. Never writes to `content/`.
- `ingest/scrape_example.py` — template for a polite scraper writing only to `data/scraped/`.

Run from the repo root via the Makefile:

```bash
make validate
make content
```
