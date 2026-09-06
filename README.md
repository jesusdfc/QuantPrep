# QuantPrep

An open-source study platform for **quant research / quant trading interviews**, focused on
the skills that actually get tested: statistical reasoning, telling signal from noise,
formulating and testing hypotheses, probability, portfolio construction, and research
methodology (plus a practical dose of ML and SQL).

Think of it as a [quantguide.io](https://www.quantguide.io/questions)-style question bank,
but aimed at *real research skills* rather than pure brainteasers — and 100% open source.

Live idea: **quantprep.ai**.

---

## Repository layout

```text
QuantPrep/
├─ content/         The course. Curated, version-controlled, legally clean.
│  ├─ topics/       One folder per topic: topic.yaml + theory/*.mdx + questions/*.yaml
│  ├─ resources.yaml  Curated external links (link-only, no copied text)
│  └─ schema/       JSON Schema for questions / lessons / topics (CI-validated)
├─ data/            ⛔ GITIGNORED raw inputs (PDFs, scraped HTML). Never committed.
├─ tools/           uv project: ingestion + build pipeline (content/ → questions.json)
└─ frontend/        Vite + React + TS PWA (installable on phone/desktop, offline-capable)
```

## Topics

| Topic | Folder |
|---|---|
| Probability | `content/topics/probability` |
| Statistics & statistical rigor | `content/topics/statistics` |
| Machine learning / statistical learning | `content/topics/machine-learning` |
| Portfolio construction & factors | `content/topics/portfolio-construction` |
| Research methodology (cross-cutting) | `content/topics/research-methodology` |
| SQL | `content/topics/sql` |

## How it works

1. **Author** questions as one YAML file each under `content/topics/<topic>/questions/`,
   and theory as MDX under `content/topics/<topic>/theory/`.
2. **Validate** against JSON Schema: `make validate`.
3. **Build** a static index the frontend consumes: `make content`
   → emits `frontend/public/questions.json` (+ search index, topic manifests).
4. **Run** the PWA: `make dev`. Progress / favorites / spaced-repetition live in
   the browser (IndexedDB) — no backend required.

A FastAPI backend (for cross-device progress sync) can be added later following the
same domain-driven conventions as the companion `qme_app_backend`; the frontend's data
contract does not change.

## Quick start

```bash
# 1. Content pipeline (Python, via uv)
make validate      # schema-check all content
make content       # build frontend/public/questions.json

# 2. Frontend (Vite PWA)
cd frontend && npm install && npm run dev
```

## Licensing & legal hygiene

- Code and original content are **MIT licensed** (see `LICENSE`).
- Every question declares its `source` + `license`. Only **original** material or
  content under a **permissive license** (MIT / Apache-2.0 / CC-BY) with attribution is
  committed. Content from all-rights-reserved sources is **link-only** in `resources.yaml`.
- Raw books/PDFs/scrapes are kept under the gitignored `/data` directory and are never
  committed, so the public repository stays clean.

## Contributing content

See `content/schema/` for the exact required fields. In short, a question needs:
`id, title, topic, subtopic, difficulty, tags, source, prompt, solution` (plus optional
`hints`, `answer`, `locked`). Run `make validate` before committing.
