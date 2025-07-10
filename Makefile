.PHONY: help install dev build start lint lint-fix format format-check check clean redis-up redis-down redis-logs redis-cli deploy deploy-logs deploy-open storybook build-storybook

# Default target
help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	npm install

## Redis Development Setup
redis-up: ## Start Redis container for development
	docker compose up -d redis
	@echo "✅ Redis is running on localhost:6379"

redis-down: ## Stop Redis container
	docker compose down

redis-logs: ## View Redis container logs
	docker compose logs -f redis

redis-cli: ## Connect to Redis CLI
	docker exec -it kttt-redis redis-cli

redis-reset: ## Reset Redis data (stop, remove volumes, start fresh)
	docker compose down -v
	docker compose up -d redis
	@echo "✅ Redis reset complete - fresh instance running"

dev: redis-up ## Start development servers (client + server) with Redis
	npm run dev

dev-server: ## Start only the server in development mode
	npm run dev:server

dev-client: ## Start only the client in development mode
	npm run dev:client

storybook: ## Start Storybook development server
	npm run storybook

build: ## Build the project for production
	npm run build

build-client: ## Build only the client
	npm run build:client

build-server: ## Build only the server
	npm run build:server

build-storybook: ## Build Storybook for production
	npm run build-storybook

start: ## Start the production server
	npm run start

type-check: ## Run TypeScript type checking for both client and server
	npm run type-check

type-check-client: ## Run TypeScript type checking for client only
	npm run type-check:client

type-check-server: ## Run TypeScript type checking for server only
	npm run type-check:server

lint: ## Run ESLint to check for issues
	npm run lint

lint-fix: ## Run ESLint and auto-fix issues
	npm run lint:fix

format: ## Format code with Prettier
	npm run format

format-check: ## Check code formatting without changing files
	npm run format:check

check: ## Run linting and format checks
	npm run check

clean: ## Clean build artifacts and dependencies
	rm -rf dist/
	rm -rf node_modules/
	rm -f package-lock.json

clean-dist: ## Clean only build artifacts
	rm -rf dist/

reinstall: clean install ## Clean and reinstall dependencies

audit: ## Run npm security audit
	npm audit

audit-fix: ## Fix npm security issues
	npm audit fix

## Deployment (Fly.io)
deploy: ## Deploy to Fly.io production
	fly deploy

deploy-logs: ## View production logs from Fly.io
	fly logs

deploy-open: ## Open the live application (https://kttt.io)
	fly open

# Development workflow shortcuts
setup: install ## Initial project setup
	@echo "✅ Project setup complete! Run 'make dev' to start development."

ci: install check build ## CI pipeline: install, check, and build
	@echo "✅ CI pipeline completed successfully!"

# Quick checks before committing
pre-commit: lint-fix format check ## Complete pre-commit workflow
	@echo "✅ Code is ready for commit!"

## Testing
test: ## Run unit tests
	npm run test

test-watch: ## Run unit tests in watch mode
	npm run test:watch

test-coverage: ## Run unit tests with coverage report
	npm run test:coverage 