# QuantPrep — top-level orchestration
# Content pipeline runs via uv (see backend/). Frontend runs via npm (see frontend/).

.DEFAULT_GOAL := help
UV := uv run --project backend

.PHONY: help validate content dev build lint test clean install

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install backend + frontend dependencies
	cd backend && uv sync
	cd frontend && npm install

validate: ## Validate all content against JSON Schema
	$(UV) qp-validate

content: validate ## Build static index (frontend/public/questions.json)
	$(UV) qp-build

dev: content ## Build content then start the Vite dev server
	cd frontend && npm run dev

build: content ## Production build of the PWA
	cd frontend && npm run build

lint: ## Lint backend and frontend
	$(UV) ruff check backend/src backend/tests
	cd frontend && npm run lint

test: ## Run backend tests
	$(UV) pytest

clean: ## Remove build artifacts
	rm -f frontend/public/questions.json frontend/public/search-index.json frontend/public/topics.json
	rm -rf build/
