# Story 1.1: Workspace Setup with pnpm and Shared Types

Status: done

## Story

As a developer,
I want a pnpm workspace monorepo with shared TypeScript types between frontend and backend,
so that I can maintain type safety across the entire application and avoid type drift.

## Acceptance Criteria

**AC1 — Workspace installs correctly**
- **Given** a fresh project repository (cloned, no node_modules)
- **When** I run `pnpm install` from the project root
- **Then** the workspace installs dependencies for all packages (frontend, backend, shared)
- **And** the `@aine/shared` package is accessible to both frontend and backend via pnpm symlinks
- **And** root-level ESLint, Prettier, and TypeScript configs are enforced across all packages
- **And** TypeScript strict mode is enabled with zero type errors

**AC2 — Shared types propagate instantly**
- **Given** I modify a type in `packages/shared/src/types/task.ts`
- **When** I import that type in both frontend and backend code
- **Then** both packages receive the updated type definition immediately (via pnpm symlinks, no rebuild needed)
- **And** TypeScript compilation succeeds in both packages (`pnpm type-check` exits 0)

**AC3 — Root scripts work**
- **Given** the workspace is installed
- **When** I run `pnpm lint` from the root
- **Then** ESLint runs across all packages with zero errors on the initial scaffold
- **When** I run `pnpm type-check` from the root
- **Then** TypeScript checks all packages (frontend, backend, shared) with zero errors
- **When** I run `pnpm format` from the root
- **Then** Prettier formats all `.ts`, `.tsx`, `.json` files consistently

## Tasks / Subtasks

- [x] Task 1: Initialize root workspace (AC1, AC3)
  - [x] Create root `package.json` with workspace scripts and dev dependencies
  - [x] Create `pnpm-workspace.yaml` declaring `packages/*`
  - [x] Create `tsconfig.base.json` with strict mode settings
  - [x] Create `.eslintrc.js` (or `eslint.config.js`) at root with TypeScript rules
  - [x] Create `.prettierrc.js` at root
  - [x] Create `.gitignore` at root
  - [x] Create root `README.md` with dev setup instructions

- [x] Task 2: Create `packages/shared` with `@aine/shared` types (AC1, AC2)
  - [x] Create `packages/shared/package.json` with name `@aine/shared`
  - [x] Create `packages/shared/tsconfig.json` extending `tsconfig.base.json`
  - [x] Create `packages/shared/src/types/task.ts` with Task, TaskStatus, API types
  - [x] Create `packages/shared/src/types/api.ts` with request/response interfaces
  - [x] Create `packages/shared/src/types/index.ts` barrel export
  - [x] Create `packages/shared/src/index.ts` root barrel export

- [x] Task 3: Scaffold `packages/frontend` (AC1, AC2, AC3)
  - [x] Create `packages/frontend/package.json` with React/Vite/MUI deps (no implementation yet)
  - [x] Create `packages/frontend/tsconfig.json` extending `tsconfig.base.json`
  - [x] Create minimal `packages/frontend/src/main.tsx` entry point (placeholder)
  - [x] Create minimal `packages/frontend/src/App.tsx` (placeholder "hello world")
  - [x] Create `packages/frontend/vite.config.ts`
  - [x] Create `packages/frontend/index.html`
  - [x] Verify `@aine/shared` types import successfully in frontend

- [x] Task 4: Scaffold `packages/backend` (AC1, AC2, AC3)
  - [x] Create `packages/backend/package.json` with Fastify/Prisma/Zod deps (no implementation yet)
  - [x] Create `packages/backend/tsconfig.json` extending `tsconfig.base.json`
  - [x] Create minimal `packages/backend/src/index.ts` entry point (placeholder)
  - [x] Create `packages/backend/prisma/schema.prisma` with Task model
  - [x] Verify `@aine/shared` types import successfully in backend

- [x] Task 5: Verify full workspace (AC1, AC2, AC3)
  - [x] Run `pnpm install` from root — verify zero errors
  - [x] Run `pnpm type-check` — verify zero TypeScript errors across all packages
  - [x] Run `pnpm lint` — verify zero ESLint errors on scaffold
  - [x] Run `pnpm format` — verify Prettier formats consistently
  - [x] Manually verify `@aine/shared` import resolves in both frontend and backend

## Dev Notes

### CRITICAL: pnpm Only — Never Use Nx
The architecture explicitly excludes Nx. Use **pnpm workspaces only**. Do not install or reference any Nx tooling.
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#1-workspace-structure--monorepo-setup]

### This Story is Scaffold Only
Story 1.1 creates the **workspace skeleton** — package.json files, tsconfig files, shared types, and minimal placeholder entry points. Do NOT implement any actual business logic, UI components, API routes, or database connections. Those come in Stories 1.3, 1.4, and beyond.

### Exact File Structure to Create
```
aine-bmad-test/
├── packages/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── main.tsx          # Minimal entry (placeholder)
│   │   │   └── App.tsx           # Placeholder component
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── index.html
│   ├── backend/
│   │   ├── src/
│   │   │   └── index.ts          # Minimal entry (placeholder)
│   │   ├── prisma/
│   │   │   └── schema.prisma     # Task model (no migrations yet)
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/
│       ├── src/
│       │   ├── types/
│       │   │   ├── task.ts
│       │   │   ├── api.ts
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── docker-compose.yml            # Create placeholder (full impl in Story 1.2)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .eslintrc.js
├── .prettierrc.js
├── .gitignore
├── package.json                  # Root workspace config
└── README.md
```
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#project-structure]

### Exact Root `pnpm-workspace.yaml`
```yaml
packages:
  - 'packages/*'
```

### Exact Root `package.json`
```json
{
  "name": "aine-bmad-test",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "pnpm --filter frontend dev & pnpm --filter backend dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "format": "prettier --write \"packages/**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "pnpm -r type-check"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.3.0"
  }
}
```
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#root-packagejson]

### Exact `packages/shared/package.json`
```json
{
  "name": "@aine/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#shared-package]

### Exact `tsconfig.base.json` (Strict Mode Required)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  }
}
```
TypeScript strict mode is NON-NEGOTIABLE. Zero type errors required.
[Source: technical-architecture-aine-bmad-test-2026-02-17.md#code-quality]

### Exact Shared Types to Create

**`packages/shared/src/types/task.ts`:**
```typescript
export enum TaskStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface Task {
  id: string;
  text: string;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
}
```

**`packages/shared/src/types/api.ts`:**
```typescript
import type { Task, TaskStatus } from './task';

export interface CreateTaskRequest { text: string; }
export interface UpdateTaskRequest { status: TaskStatus; }
export interface GetTasksResponse { tasks: Task[]; }
export interface CreateTaskResponse { task: Task; }
export interface UpdateTaskResponse { task: Task; }
export interface DeleteCompletedResponse { deletedCount: number; }
```

**`packages/shared/src/types/index.ts`:**
```typescript
export * from './task';
export * from './api';
```

**`packages/shared/src/index.ts`:**
```typescript
export * from './types';
```
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#shared-types-example]

### Prisma Schema (in backend, no migration yet)
Place this in `packages/backend/prisma/schema.prisma`. Do NOT run `prisma migrate dev` — that happens in Story 1.3.
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TaskStatus {
  ACTIVE
  COMPLETED
}

model Task {
  id          String     @id @default(uuid())
  text        String     @db.VarChar(500)
  status      TaskStatus @default(ACTIVE)
  createdAt   DateTime   @default(now()) @map("created_at")
  completedAt DateTime?  @map("completed_at")

  @@map("tasks")
  @@index([status, createdAt])
}
```
[Source: technical-architecture-aine-bmad-test-2026-02-17.md#prisma-schema]

### Frontend Package Dependencies (install but don't implement)
The `packages/frontend/package.json` should list these deps so `pnpm install` brings them in. No implementation yet.
```json
{
  "name": "@aine/frontend",
  "dependencies": {
    "@aine/shared": "workspace:*",
    "@mui/material": "^5.15.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0"
  },
  "devDependencies": {
    "@aine/shared": "workspace:*",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@playwright/test": "^1.41.0"
  }
}
```

### Backend Package Dependencies (install but don't implement)
```json
{
  "name": "@aine/backend",
  "dependencies": {
    "@aine/shared": "workspace:*",
    "@prisma/client": "^5.8.0",
    "fastify": "^4.26.0",
    "@fastify/cors": "^9.0.0",
    "pino": "^8.18.0",
    "pino-pretty": "^10.3.0",
    "zod": "^3.22.0",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "@aine/shared": "workspace:*",
    "prisma": "^5.8.0",
    "@types/node": "^20.0.0",
    "@types/node-cron": "^3.0.11",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "testcontainers": "^10.6.0"
  },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "lint": "eslint src"
  }
}
```
Note: `node-cron` is included now (needed for Story 3.8 24-hour cleanup job).
[Source: technical-architecture-aine-bmad-test-2026-02-17.md#technology-stack]

### Project Structure Notes

- **Root location**: The project root is the workspace root (`aine-bmad-test/`). All paths are relative to this.
- **Package naming**: Use `@aine/frontend`, `@aine/backend`, `@aine/shared` as package names for clear namespacing.
- **Workspace reference**: Frontend and backend reference shared via `"@aine/shared": "workspace:*"` — pnpm resolves this to `packages/shared` via symlink.
- **No dist folder for shared**: The shared package is consumed directly via TypeScript source (no build step needed) because both frontend (Vite) and backend (tsx) can resolve `.ts` files directly. The `"main": "./src/index.ts"` in shared's package.json makes this work.
- **docker-compose.yml**: Create a minimal placeholder file at root (full implementation in Story 1.2). Just needs to exist to signal project structure.

### References

- Full workspace structure: [Source: architecture-decisions-aine-bmad-test-2026-02-17.md#1-workspace-structure--monorepo-setup]
- Technology stack: [Source: technical-architecture-aine-bmad-test-2026-02-17.md#technology-stack]
- Prisma schema: [Source: technical-architecture-aine-bmad-test-2026-02-17.md#data-models]
- Shared types examples: [Source: architecture-decisions-aine-bmad-test-2026-02-17.md#shared-types-example]
- API types used by frontend/backend: [Source: architecture-decisions-aine-bmad-test-2026-02-17.md#backend-usage]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking (Cursor)

### Debug Log References

_none_

### Completion Notes List

- ✅ Created pnpm workspace with all 4 packages: root, @aine/shared, @aine/frontend, @aine/backend
- ✅ Root `tsconfig.base.json` with strict mode, noUncheckedIndexedAccess, noImplicitReturns as specified
- ✅ Shared types (`Task`, `TaskStatus`, API request/response interfaces) created with exact interfaces from architecture doc
- ✅ `@aine/shared` consumed directly via TypeScript source (no build step) from both frontend and backend via `workspace:*` reference; confirmed with `import type { GetTasksResponse } from '@aine/shared'` in both App.tsx and backend/src/index.ts
- ✅ Backend tsconfig uses ESNext module + bundler resolution (aligned with base), noEmit: true for scaffold phase
- ✅ Frontend tsconfig uses `moduleResolution: "bundler"` with JSX support for Vite
- ✅ `pnpm.onlyBuiltDependencies` added to root package.json to pre-approve build scripts for @prisma/client, @prisma/engines, esbuild, etc. (required for pnpm v10 security model)
- ✅ Placeholder `docker-compose.yml` created (minimal Postgres service — full multi-service implementation in Story 1.2)
- ✅ All verification commands pass: `pnpm install` (545 packages), `pnpm type-check` (0 errors), `pnpm lint` (0 errors), `pnpm format --check` (all files formatted)

### File List

- `package.json` — root workspace config with scripts, devDependencies, pnpm onlyBuiltDependencies
- `pnpm-workspace.yaml` — declares `packages/*`
- `tsconfig.base.json` — strict TypeScript base config (ES2022, bundler resolution)
- `.eslintrc.js` — TypeScript ESLint rules with prettier compat
- `.prettierrc.js` — code formatting config (singleQuote, trailingComma: es5, printWidth: 100)
- `.gitignore` — excludes node_modules, dist, .env, coverage, playwright-report, etc.
- `README.md` — dev setup instructions with script reference table
- `docker-compose.yml` — placeholder with minimal Postgres service
- `packages/shared/package.json` — @aine/shared, exports via ./src/index.ts
- `packages/shared/tsconfig.json` — extends base, noEmit
- `packages/shared/src/index.ts` — root barrel export
- `packages/shared/src/types/index.ts` — barrel re-export
- `packages/shared/src/types/task.ts` — Task interface, TaskStatus enum
- `packages/shared/src/types/api.ts` — request/response API interfaces
- `packages/frontend/package.json` — @aine/frontend with React/Vite/MUI/TanStack deps
- `packages/frontend/tsconfig.json` — extends base, JSX react-jsx, noEmit, DOM lib
- `packages/frontend/vite.config.ts` — Vite config with React plugin, /api proxy
- `packages/frontend/index.html` — HTML entry point
- `packages/frontend/src/main.tsx` — React entry point (placeholder)
- `packages/frontend/src/App.tsx` — placeholder component importing @aine/shared type
- `packages/backend/package.json` — @aine/backend with Fastify/Prisma/Zod/node-cron deps
- `packages/backend/tsconfig.json` — extends base, ESNext/bundler resolution, noEmit: true
- `packages/backend/src/index.ts` — minimal entry point (placeholder) importing @aine/shared type
- `packages/backend/prisma/schema.prisma` — Task model with TaskStatus enum, indexes

### Change Log

- 2026-02-18: Story 1.1 implemented — pnpm workspace scaffold created. 545 packages installed, all type checks and lint checks pass.
- 2026-02-18: Code review — 7 issues fixed (3 HIGH, 4 MEDIUM). All verification re-passed.

## Senior Developer Review (AI)

**Review Date:** 2026-02-18
**Review Outcome:** Changes Requested → All Fixed
**Reviewer Model:** claude-4.6-opus-high-thinking (Cursor)

### Issues Found: 3 High, 4 Medium, 2 Low

### Action Items

- [x] [HIGH] H1: `exactOptionalPropertyTypes` missing from `tsconfig.base.json` — added per architecture spec
- [x] [HIGH] H2: Shared package had no `lint` script — `pnpm -r lint` skipped shared types (AC3 violation) — added lint script
- [x] [HIGH] H3: Backend tsconfig used `module: "CommonJS"` + `noEmit: false` producing broken tsc output — changed to ESNext/bundler + noEmit: true
- [x] [MED] M1: `tsconfig.base.json` had extraneous `declaration`/`declarationMap`/`sourceMap` not in spec — removed
- [x] [MED] M2: `docker-compose.yml` used deprecated `version: '3.9'` key — removed
- [x] [MED] M3: `.eslintrc.js` `ignorePatterns: ['*.js']` overly broad — narrowed to specific config files
- [x] [MED] M4: `@aine/shared` missing from frontend/backend `devDependencies` per spec — added
- [ ] [LOW] L1: Placeholder files re-export @aine/shared types from component modules (will be replaced in later stories)
- [ ] [LOW] L2: Root package.json has `test:coverage` script not in story spec (useful addition, not harmful)
