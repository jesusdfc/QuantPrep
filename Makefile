# QuantPrep — top-level orchestration
# Content pipeline runs via uv (see tools/). Frontend runs via npm (see frontend/).

.DEFAULT_GOAL := help
UV := uv run --project tools

.PHONY: help validate content dev build lint clean install

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install tool + frontend dependencies
	cd tools && uv sync
	cd frontend && npm install

validate: ## Validate all content against JSON Schema
	$(UV) python -m quantprep_tools.validate_content

content: validate ## Build static index (frontend/public/questions.json)
	$(UV) python -m quantprep_tools.build_index

dev: content ## Build content then start the Vite dev server
	cd frontend && npm run dev

build: content ## Production build of the PWA
	cd frontend && npm run build

lint: ## Lint frontend
	cd frontend && npm run lint

clean: ## Remove build artifacts
	rm -f frontend/public/questions.json frontend/public/search-index.json frontend/public/topics.json
	rm -rf build/
