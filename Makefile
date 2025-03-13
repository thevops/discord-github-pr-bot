docker-build: ## Build Docker
	docker build -t discord-github-pr-bot .

docker-run: ## Run Docker
	docker run --rm -it --env-file .env discord-github-pr-bot

local-run: ## Run locally
	node server.js

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\t\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
