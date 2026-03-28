# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A journaling application with client-side SQLite storage. All data lives locally in the browser.

## Commands

### Development

- Install dependencies: `bun install`
- Start dev server: `bun dev` - Runs Vite dev server on localhost
- Lint: `bun lint` - Runs oxlint
- Lint with fixes: `bun lint:fix`
- Format: `bun fmt` - Runs oxfmt formatter
- Format check: `bun fmt:check`

### Build & Deploy

- Production build: `bun run build` - Builds the client SPA with Vite
- Preview build: `bun preview` - Preview production build locally
- Deploy: Deploy the built SPA to your hosting provider

### Testing

No automated test setup is currently configured. If adding tests, prefer vitest and name files `*.test.ts` / `*.test.tsx`.

## Architecture

### Client SPA

**`src/`** - Client web application (React + Vite)

- Runs in the browser
- Uses SQLite via `sqlocal` (WASM-based client-side database)
- React 19, TanStack Query for data management
- Tailwind CSS v4 for styling
- Entry point: `src/main.tsx`

### Path Aliases

TypeScript path aliases configured in `vite.config.ts`:

- `@/*` → `./src/*`

### TypeScript Configuration

Project uses composite TypeScript setup:

- `tsconfig.json` - Root references file
- `tsconfig.app.json` - Client app config
- `tsconfig.node.json` - Node build scripts config

### Database

**Client-side database** (`src/db/`):

- SQLite via `sqlocal` (WASM-based, runs in browser)
- Kysely for type-safe query building
- Database file: `journal-local-9192390.db`
- Schema: `note` table (id, content, created_at, updated_at, deleted_at)

**Migrations** (`src/db/migrations/`):

- Kysely migrations manage schema evolution
- Run automatically on app load via `AppProvider`
- Add new migrations as `YYYY-MM-DD-description.ts` in `src/db/migrations/`
- Migrations run in `AppProvider` before rendering children

### State Management

**Client state** (`src/features/` and `src/providers/`):

- TanStack Query manages all data fetching and mutations
- `AppProvider` wraps app with `QueryClientProvider`
- All queries auto-invalidate on any mutation (acceptable for local-first data)

### Code Style

- Language: TypeScript (ESM) + React
- Formatting/linting: oxlint and oxfmt
- Prefer small, focused modules
- CSS: Tailwind CSS v4 for styling

### Commit Conventions

Commit messages follow lightweight Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `tech:`.

## Key Files

- `src/db/db.ts` - Database schema and client setup
- `src/db/dump.ts` - Database dump/merge logic (used by export/import)
- `src/main.tsx` - App entry point with providers
