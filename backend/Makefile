

BINARY_NAME=api
BUILD_DIR=bin
CMD_PATH=./cmd/api/main.go

# Go related variables
GOBASE=$(shell pwd)
GOBIN=$(GOBASE)/$(BUILD_DIR)

.PHONY: all build run test clean help migrate

all: build

build: ## Build the application
	@echo "Building..."
	@go build -o $(BUILD_DIR)/$(BINARY_NAME) $(CMD_PATH)
	@echo "Build complete. Binary is at $(BUILD_DIR)/$(BINARY_NAME)"

build-linux: ## Build for Linux amd64
	@echo "Building for Linux (amd64)..."
	@GOOS=linux GOARCH=amd64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 $(CMD_PATH)
	@echo "Build complete: $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64"

build-migrate: ## Build the migration tool
	@echo "Building migration tool..."
	@go build -o $(BUILD_DIR)/migrate ./cmd/migrate/main.go
	@echo "Migration tool built at $(BUILD_DIR)/migrate"

build-migrate-linux: ## Build the migration tool for Linux
	@echo "Building migration tool for Linux..."
	@GOOS=linux GOARCH=amd64 go build -o $(BUILD_DIR)/migrate-linux-amd64 ./cmd/migrate/main.go
	@echo "Migration tool built: $(BUILD_DIR)/migrate-linux-amd64"

migrate: build-migrate ## Run database migrations
	@echo "Running database migrations..."
	@if [ -f ../.env ]; then export $$(grep -v '^#' ../.env | xargs); fi; \
	./$(BUILD_DIR)/migrate up
	@echo "Migrations complete."

migrate-status: build-migrate 
	@echo "Checking migration status..."
	@if [ -f ../.env ]; then export $$(grep -v '^#' ../.env | xargs); fi; \
	./$(BUILD_DIR)/migrate status

migrate-down: build-migrate ## Rollback last migration
	@echo "Rolling back last migration..."
	@if [ -f ../.env ]; then export $$(grep -v '^#' ../.env | xargs); fi; \
	./$(BUILD_DIR)/migrate down

run: build ## Run the application
	@echo "Running..."
	@go run $(CMD_PATH)

test: ## Run tests
	@echo "Running tests..."
	@go test -v ./...

coverage: ## Run tests with coverage
	@echo "Running tests with coverage..."
	@go test -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out

clean: ## Clean build artifacts
	@echo "Cleaning..."
	@rm -rf $(BUILD_DIR)
	@echo "Clean complete."

help: ## Display this help screen
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
