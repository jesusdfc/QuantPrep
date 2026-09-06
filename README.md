# QuantPrep

An open-source study platform for **quant research / quant trading interviews**, focused on
the skills that actually get tested: statistical reasoning, telling signal from noise,
formulating and testing hypotheses, probability, portfolio construction, and research
methodology (plus a practical dose of ML and SQL).

Think of it as a [quantguide.io](https://www.quantguide.io/questions)-style question bank,
but aimed at *real research skills* rather than pure brainteasers — and 100% open source.

Live site: **quantprep.me**.

---

## Repository layout

```text
QuantPrep/
├─ content/         The course. Curated, version-controlled, legally clean.
│  ├─ topics/       One folder per topic: topic.yaml + one folder per subtopic
│  │                (each with questions/*.yaml + theory/*.mdx)
│  ├─ resources.yaml  Curated external links (link-only, no copied text)
│  └─ schema/       JSON Schema for questions / lessons / topics (CI-validated)
├─ data/            ⛔ GITIGNORED raw inputs (PDFs, scraped HTML). Never committed.
├─ backend/         Python application: validation, indexing, and local ingestion
└─ frontend/        Vite + React + TS PWA (installable on phone/desktop, offline-capable)
```

## Topics

| Topic | Folder |
|---|---|
| Probability | `content/topics/probability` |
| Statistics & statistical rigor | `content/topics/statistics` |
| Machine learning / statistical learning | `content/topics/machine-learning` |
| Portfolio construction & factors | `content/topics/portfolio-construction` |
| Quantitative research (cross-cutting) | `content/topics/quantitative-research` |
| SQL | `content/topics/sql` |

## How it works

1. **Author** questions as one YAML file each under
   `content/topics/<topic>/<subtopic>/questions/`, and theory as MDX under
   `content/topics/<topic>/<subtopic>/theory/`.
2. **Validate** against JSON Schema: `make validate`.
3. **Build** a static index the frontend consumes: `make content`
   → emits `frontend/public/questions.json` (+ search index, topic manifests).
4. **Run** the PWA: `make dev`. Anonymous progress lives in IndexedDB. Signed-in users
   retain the same offline cache and synchronize it to Supabase.

## Authentication and progress sync

QuantPrep uses the official `@supabase/supabase-js` client for email/password sessions and
PostgreSQL persistence. The database is protected with Row Level Security so users can only
read and write their own question progress.

1. Create a Supabase project.
2. Run `supabase/migrations/202609070001_create_question_progress.sql` in the Supabase SQL
   editor.
3. In **Authentication → URL Configuration**, set:
   - Site URL: `https://quantprep.me`
   - Redirect URLs: `https://quantprep.me/auth/callback` and
     `http://localhost:5173/auth/callback`
4. Copy `frontend/.env.example` to `frontend/.env.local` and set the project URL and
   publishable key.
5. Add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` variables to the
   Cloudflare Worker build settings.

Supabase's default email sender is development-only: it only sends to authorized project
team addresses and is heavily rate-limited. Public email confirmation requires custom SMTP.
The service-role key must never be placed in the frontend or committed.

## Quick start

```bash
# 1. Backend content pipeline (Python, via uv)
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
`hints`, `answer`, `locked`). `make validate` checks both the schemas and every rendered
Markdown/KaTeX expression.

Install the repository hooks once after `make install`:

```bash
uv run --project backend pre-commit install --hook-type pre-commit --hook-type pre-push
```

Commits run content validation, Ruff, Black, pytest, Biome, and TypeScript. Pushes additionally
run the frontend production build. Use `make check` to run all fast quality gates manually, or
`make format` to apply the configured formatters.
