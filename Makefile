.PHONY: help setup dev up down db-up db-down backend frontend build clean test seed

# Variables
PYTHON ?= python3
PIP ?= pip
DOCKER_COMPOSE ?= docker compose

help:
	@echo "KrishiKotha AI: Offline-First Edge Multi-Agent Mesh"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup       Install backend and frontend dependencies"
	@echo "  make dev         Run postgres, backend, and frontend concurrently"
	@echo "  make up          Start all containers via Docker Compose (detached)"
	@echo "  make down        Stop all Docker Compose services"
	@echo "  make db-up       Start PostgreSQL container"
	@echo "  make db-down     Stop PostgreSQL container"
	@echo "  make backend     Run FastAPI backend locally"
	@echo "  make frontend    Run Next.js frontend locally"
	@echo "  make seed        Seed sample Ondera dossiers into database"
	@echo "  make build       Build frontend and backend docker images"
	@echo "  make clean       Remove temporary files and caches"

setup:
	@echo "Setting up root dependencies..."
	npm install
	@echo "Setting up backend dependencies..."
	cd backend && $(PIP) install -r requirements.txt
	@echo "Setting up frontend dependencies..."
	cd frontend && npm install

dev:
	npm run dev

up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

db-up:
	$(DOCKER_COMPOSE) up postgres -d

db-down:
	$(DOCKER_COMPOSE) stop postgres

backend:
	cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm run dev

seed:
	cd backend && $(PYTHON) seed.py

build:
	cd frontend && npm run build

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf frontend/.next frontend/out backend/.pytest_cache
