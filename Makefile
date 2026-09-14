.PHONY: help install dev build start clean typecheck lint fmt format check db-pull db-generate db-push db-studio run up

help:
	@echo ======================================================================
	@echo         Headcount Planning - Next.js Fullstack Make Commands          
	@echo ======================================================================
	@echo [Development and Run]
	@echo   make dev              - Chay Next.js Dev Server (App: :3000, Swagger UI: :3000/api-doc)
	@echo   make build            - Bien dich ban san xuat (Production Build)
	@echo   make start            - Chay Next.js Production Server
	@echo   make clean            - Xoa cache .next va build artifacts
	@echo ----------------------------------------------------------------------
	@echo [Dependencies]
	@echo   make install          - Cai dat npm packages
	@echo ----------------------------------------------------------------------
	@echo [Code Quality]
	@echo   make typecheck        - Kiem tra kieu du lieu TypeScript (tsc --noEmit)
	@echo   make lint             - Kiem tra cu phap ma nguon (Next Lint)
	@echo   make fmt / format     - Tu dong dinh dang code bang Biome
	@echo   make check            - Chay typecheck va lint
	@echo ----------------------------------------------------------------------
	@echo [Database: Supabase / Drizzle ORM]
	@echo   make db-pull          - Doc schema truc tiep tu Supabase (Introspect)
	@echo   make db-generate      - Tao file migration tu schema Drizzle
	@echo   make db-push          - Day thay doi schema truc tiep len Supabase
	@echo   make db-studio        - Mo Drizzle Studio UI duyet du lieu Supabase
	@echo ======================================================================

# Dependencies
install:
	npm install

# Development & Build
dev:
	npm run dev

build:
	npm run build

start:
	npm run start

clean:
	powershell -Command "Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .next, dist, tsconfig.tsbuildinfo"

# Code Quality
typecheck:
	npm run typecheck

lint:
	npm run lint

fmt: format

format:
	npm run format

check: typecheck lint

# Database (Supabase PostgreSQL via Drizzle ORM)
db-pull:
	npm run db:pull

db-generate:
	npm run db:generate

db-push:
	npm run db:push

db-studio:
	npm run db:studio

# Quick Aliases
run: dev
up: dev
