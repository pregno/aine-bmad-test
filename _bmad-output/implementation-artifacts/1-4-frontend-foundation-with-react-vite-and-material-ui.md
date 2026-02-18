# Story 1.4: Frontend Foundation with React, Vite, and Material-UI

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a React frontend with Vite build tool, TypeScript, React Router, and Material-UI,
so that I can build responsive UI components with fast development iteration.

## Acceptance Criteria

**AC1 — Vite dev server starts with HMR and themed homepage**
- **Given** the frontend package structure exists
- **When** I run `pnpm --filter frontend dev`
- **Then** the Vite dev server starts on port 5173 with hot module replacement (HMR) enabled
- **And** the browser displays a basic Material-UI themed homepage
- **And** React Router v6 is configured with at least one route

**AC2 — Material-UI theme and viewport**
- **Given** I access the app in a browser
- **When** the page loads
- **Then** Material-UI theme is applied with primary color #2196F3 (calming blue)
- **And** Roboto font is loaded and applied to all Typography components
- **And** the viewport is configured for mobile-first responsive design (`<meta name="viewport">`)

**AC3 — Hot reload works**
- **Given** hot reload is enabled
- **When** I modify a React component in `packages/frontend/src`
- **Then** the browser updates within 1 second without full page refresh
- **And** component state is preserved via HMR

**AC4 — Shared types and type-check**
- **Given** I import shared types from `@aine/shared`
- **When** I use those types in frontend components
- **Then** TypeScript provides autocomplete and type checking
- **And** the build completes with zero type errors

**AC5 — Production build**
- **Given** I run `pnpm --filter frontend build`
- **When** the build completes
- **Then** production-optimized static files are output to `packages/frontend/dist`
- **And** the build includes code splitting and minification
- **And** the bundle size is reasonable for a mobile-first app

## Tasks / Subtasks

- [x] Task 1: Create MUI theme with primary color and Roboto (AC1, AC2)
  - [x] Create `packages/frontend/src/theme/muiTheme.ts` with `createTheme` from `@mui/material/styles`
  - [x] Set primary color to #2196F3
  - [x] Configure Roboto font family (typography)
  - [x] Export theme for use in app

- [x] Task 2: Add Roboto font to index.html (AC2)
  - [x] Add Google Fonts link for Roboto (400, 500) to `index.html` head
  - [x] Ensure viewport meta exists: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`

- [x] Task 3: Configure React Router v6 (AC1)
  - [x] Create `packages/frontend/src/App.tsx` with at least one `Route`
  - [x] Define a home route (`/`) rendering the homepage
  - [x] Use `Routes` and `Route` from `react-router-dom` v6

- [x] Task 4: Create themed homepage component (AC1)
  - [x] Create a simple homepage component (e.g., `HomePage` or use App) with MUI components
  - [x] Use `ThemeProvider` wrapping the app with the theme from Task 1
  - [x] Display at least one MUI `Typography` and one `Box` or `Container` to demonstrate theme application
  - [x] Use Roboto via Typography (theme typography.fontFamily)

- [x] Task 5: Wire ThemeProvider and Router in main.tsx (AC1)
  - [x] Wrap app with `ThemeProvider` (theme) and `BrowserRouter`
  - [x] Ensure `main.tsx` renders the app with theme and routing
  - [x] Verify `pnpm --filter frontend dev` shows themed homepage at http://localhost:5173

- [x] Task 6: Import and use @aine/shared types (AC4)
  - [x] Import type(s) from `@aine/shared` in a component (e.g., `GetTasksResponse` or `Task`)
  - [x] Use the type in props or variable (type-only usage is fine for this story)
  - [x] Run `pnpm type-check` — verify zero TypeScript errors

- [x] Task 7: Verify HMR (AC3)
  - [x] Run `pnpm --filter frontend dev`
  - [x] Modify a component (e.g., change text in homepage)
  - [x] Verify browser updates within ~1s without full refresh
  - [x] Verify component state preserved (if applicable)

- [x] Task 8: Verify production build (AC5)
  - [x] Run `pnpm --filter frontend build`
  - [x] Verify `packages/frontend/dist` contains index.html and assets
  - [x] Verify build uses code splitting (e.g., chunk files for lazy routes if any)
  - [x] Verify output is minified (e.g., no readable source in JS chunks)
  - [x] Run `pnpm lint` — verify zero ESLint errors

## Dev Notes

### CRITICAL: This Story Builds Frontend Infrastructure Only

Story 1.4 creates the **React frontend skeleton** — MUI theme, React Router, themed homepage, viewport, and build verification. Do NOT implement:
- Task list UI — Story 2.3
- FAB and add-task dialog — Story 2.4
- TanStack Query integration — Story 2.5
- Task CRUD API calls — Story 2.x
- Optimistic UI patterns — Story 2.5+

### Exact Frontend File Structure After This Story

```
packages/frontend/
├── src/
│   ├── main.tsx                 # Entry: ThemeProvider, BrowserRouter, App
│   ├── App.tsx                  # Root: Routes, Route(s)
│   ├── theme/
│   │   └── muiTheme.ts          # createTheme with #2196F3, Roboto
│   └── (optional) components/   # e.g., HomePage.tsx
├── index.html                   # Viewport meta, Roboto font link
├── package.json
├── vite.config.ts
├── tsconfig.json
├── Dockerfile
└── .dockerignore
```

[Source: technical-architecture-aine-bmad-test-2026-02-17.md#frontend-architecture]

### MUI Theme Configuration (Architecture)

Primary color: **#2196F3** (calming blue per UX-6). Roboto font. Typography base 16px for mobile readability.

```typescript
// theme/muiTheme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16,
  },
});
```

[Source: ux-design-specification.md — UX-6 Visual Design Foundation]

### Viewport Meta (Already Present)

`index.html` already has: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`. Verify it exists; if missing, add it.

[Source: epics.md Story 1.4 AC2]

### Roboto Font Loading

Add to `index.html` head:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
```

Or use MUI's CssBaseline + default Roboto (MUI ships with Roboto). MUI v5 includes Roboto in default theme — ensure `CssBaseline` is used if relying on MUI defaults.

[Source: architecture-decisions, UX-6]

### Vite HMR Configuration

Current `vite.config.ts` has:
- `host: '0.0.0.0'` (Docker/bind-mount compatibility)
- `watch.usePolling: true` (needed for some Docker setups)
- `hmr.host: 'localhost'` (HMR client connects here)

These are correct for hybrid local dev. HMR should work when running `pnpm --filter frontend dev` locally.

[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#2-development-environment-details]

### API Proxy

Vite proxy forwards `/api` to `http://localhost:3000`. Backend uses `/api/v1` for task routes. Proxy `/api` covers `/api/v1/*`. No changes needed for this story.

[Source: vite.config.ts, backend architecture]

### TypeScript Strict Mode

`tsconfig.base.json` enforces: `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns`, `exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch`. All frontend code must compile with zero errors.

[Source: Story 1.1, tsconfig.base.json]

### Previous Story Learnings (Story 1.3)

- Backend runs on port 3000, CORS allows `http://localhost:5173`
- Backend health at `GET /health` and `GET /health/detailed`
- `@aine/shared` exports types (Task, GetTasksResponse, etc.) — use `import type { X } from '@aine/shared'` for type-only imports
- pnpm workspace: frontend depends on `@aine/shared` — symlink works; type-check resolves correctly
- Docker build context is project root (`.`); frontend Dockerfile copies from `packages/frontend`

### References

- Frontend structure: [Source: technical-architecture-aine-bmad-test-2026-02-17.md#frontend-architecture]
- MUI theming: [Source: ux-design-specification.md — UX-6]
- Vite config: [Source: architecture-decisions-aine-bmad-test-2026-02-17.md#2-development-environment-details]
- Shared types: [Source: architecture-decisions-aine-bmad-test-2026-02-17.md#1-workspace-structure]
- Viewport: [Source: epics.md Story 1.4 AC2]

## Dev Agent Record

### Agent Model Used

Claude (via Cursor)

### Debug Log References

- Vite HMR deterministic check: launched local dev server and ran a Playwright probe that modified `HomePage.tsx` while the app was open. The UI updated in `176ms` and preserved component state (`Count: 1`), satisfying AC3 runtime thresholds.

### Completion Notes List

- **Task 1**: MUI theme in `theme/muiTheme.ts` with primary #2196F3 and Roboto typography (fontSize 16).
- **Task 2**: Google Fonts Roboto links added to `index.html`; viewport meta already present.
- **Task 3–5**: React Router v6 routes defined in `App.tsx`; ThemeProvider, CssBaseline, and BrowserRouter wired in `main.tsx`; HomePage component includes Typography, Container, and a small stateful counter for HMR state-preservation validation.
- **Task 6**: `GetTasksResponse` used in `HomePageProps.initialData` for future API integration (Story 2.5).
- **Task 7**: HMR objectively verified with automated Playwright check (`176ms` update, state preserved).
- **Task 8**: Production build outputs `dist/` with minified JS and code splitting (`index` + lazy `AboutPage` chunk); type-check and lint pass.
- **Tests**: Added route-structure tests in `App.test.tsx` plus theme tests in `muiTheme.test.ts` (4 tests total).

### File List

New files:
- `packages/frontend/src/theme/muiTheme.ts`
- `packages/frontend/src/theme/muiTheme.test.ts`
- `packages/frontend/src/components/HomePage.tsx`
- `packages/frontend/src/components/AboutPage.tsx`
- `packages/frontend/src/App.test.tsx`

Modified files:
- `packages/frontend/index.html` (Roboto font links)
- `packages/frontend/src/App.tsx` (Routes + lazy-loaded about page for code splitting)
- `packages/frontend/src/main.tsx` (ThemeProvider, CssBaseline, BrowserRouter wiring)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (story state sync)

### Change Log

- 2026-02-18: Implemented Story 1.4 — Frontend foundation with MUI theme (#2196F3, Roboto), React Router v6, themed HomePage, viewport meta, @aine/shared type usage, production build verification, and muiTheme unit tests.
- 2026-02-18: Code review fixes — moved provider/router wiring to `main.tsx`, added lazy route code splitting (`/about`), added route test coverage, and captured deterministic HMR proof (`176ms`, state preserved).

## Senior Developer Review (AI)

**Outcome:** Approved  
**Review Date:** 2026-02-18

### Action Items

- [x] [HIGH] Align Task 5 implementation with story claim by wiring ThemeProvider and BrowserRouter in `main.tsx`.
- [x] [HIGH] Provide objective AC3 HMR evidence (update time + state preservation).
- [x] [HIGH] Ensure AC5 code splitting claim has concrete build evidence.
- [x] [MEDIUM] Sync story File List with actual changed files.
- [x] [MEDIUM] Improve tests beyond theme-only checks by validating routing structure.
