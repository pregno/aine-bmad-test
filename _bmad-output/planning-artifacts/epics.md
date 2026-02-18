---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - product-brief-aine-bmad-test-2026-02-17.md
  - technical-architecture-aine-bmad-test-2026-02-17.md
  - architecture-decisions-aine-bmad-test-2026-02-17.md
  - ux-design-specification.md
project_name: aine-bmad-test
user_name: Pregno
date: 2026-02-17
---

# aine-bmad-test - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for aine-bmad-test, decomposing the requirements from the Product Brief (serving as PRD), UX Design, and Architecture documents into implementable stories.

## Requirements Inventory

### Functional Requirements

**Extracted from Product Brief - Core Features (MVP Scope):**

**FR1:** Create Task - User can create a new task with plain text description via floating action button, with auto-captured creation timestamp, in under 5 seconds total interaction time with optimistic UI.

**FR2:** View Tasks - User can view active tasks displayed newest-first with creation timestamps, and completed tasks displayed below active tasks (crossed out), with chronological sorting by creation date and visible timestamps for both creation and completion.

**FR3:** Complete Task - User can tap a task to mark it complete, with visual feedback (cross out text, animate slide to completed section), capture completion timestamp, and completed tasks remain visible below active list.

**FR4:** Delete Task - User can swipe to delete a task permanently with confirmation prompt to prevent accidental deletion (removes from database, no undo in v1).

**FR5:** Clear Completed Tasks - User can execute bulk action to remove all completed tasks, providing clean slate when completed section gets cluttered, user-controlled with no automatic archiving or deletion.

**FR6:** Cross-Session Persistence - All tasks are stored in PostgreSQL database, data survives browser refresh, tab close, and container restart, with named Docker volume ensuring database persistence.

**FR7:** Cross-Device Consistency - Same backend API accessible from phone and desktop browsers, real-time data sync where tasks created on phone are visible on desktop immediately, with single source of truth (PostgreSQL database).

**FR8:** Mobile-First Responsive UI - Material Design components and patterns, thumb-friendly touch targets (minimum 48px), one-handed mobile operation optimized, fully functional on desktop with same responsive interface.

**FR9:** Optimistic UI Pattern - Instant feedback for all user actions (add, complete, delete), background API synchronization, retry mechanism for failed network requests, error toast notifications for sync failures.

**FR10:** Graceful State Handling - Empty state with clear call-to-action when no tasks exist, loading state with minimal spinner on initial load only, error state where network failures are handled without crashing app, offline queue where tasks captured offline sync when connection returns.

**FR11:** Docker Compose Multi-Environment Setup - Development environment configuration, test environment configuration, environment-specific variables (database credentials, API URLs, ports), service definitions for frontend/backend/database, named volumes for database persistence.

**FR12:** REST API - CRUD endpoints for task operations, proper HTTP methods (GET, POST, PUT/PATCH, DELETE), JSON request/response format, error handling and validation, CORS configuration for cross-origin requests.

**FR13:** Comprehensive Test Coverage - Unit tests for business logic/utilities/components (minimum 80% coverage), integration tests for API endpoints and database operations, E2E tests for critical user paths (add task, complete task, delete task, clear completed, data persistence, cross-device sync), 100% test pass rate required before deployment.

**FR14:** Auto-Delete Completed Tasks - Completed tasks automatically delete after 24 hours to prevent list bloat and enforce completion-focused workflow (ephemeral storage model).

### Non-Functional Requirements

**Extracted from Product Brief - Success Metrics, Performance, and Quality Gates:**

**NFR1:** Capture Speed - Task creation flow must complete in under 5 seconds from action item mention to task saved and visible in UI.

**NFR2:** Zero Data Loss - All captured tasks must persist across sessions, devices, and container restarts with no data loss incidents.

**NFR3:** Zero Crashes - Application must remain stable during normal operation with no runtime errors or application crashes.

**NFR4:** Performance Baseline - Application must start without issues and load instantly on subsequent visits with initial load under 2 seconds, task operations must feel instant via optimistic UI.

**NFR5:** Test Coverage Threshold - Minimum 80% code coverage across unit, integration, and E2E test suites with 100% test pass rate across all layers.

**NFR6:** Code Quality Standards - TypeScript strict mode enabled, linting configured with zero type errors, ESLint and Prettier configured for consistent code quality.

**NFR7:** Task Volume Scalability - Application must handle 20-100 accumulated tasks without performance issues, single-page app with minimal loading states.

**NFR8:** Network Resilience - Silent background retry with exponential backoff for failed operations, error toast only after 3+ retry attempts (~30 seconds), graceful degradation for network failures and database errors.

**NFR9:** Cross-Browser Compatibility - Must work on iOS Safari and Android Chrome (mobile browsers) and Chrome/Firefox (desktop browsers) without browser-specific issues.

**NFR10:** Accessibility Compliance - WCAG 2.1 AA compliant with semantic HTML, keyboard navigation support, focus management, ARIA labels, and screen reader support.

### Additional Requirements

**From Technical Architecture:**

- **ARCH-1:** Technology Stack - React 18+ with TypeScript, Vite build tool, React Router v6, Material-UI v5 for frontend; Fastify 4+ with TypeScript, Prisma ORM, Pino logging for backend; PostgreSQL 16+ with named Docker volume for persistence.

- **ARCH-2:** State Management - TanStack Query v5 (React Query) for server state with optimistic updates, LocalStorage for user preferences, React Hook Form with Zod schemas for form validation.

- **ARCH-3:** API Specifications - 5 REST endpoints: GET /api/tasks, POST /api/tasks, PATCH /api/tasks/:id, DELETE /api/tasks/:id, DELETE /api/tasks/completed with Zod schema validation and standardized error response format.

- **ARCH-4:** Data Model - Single Task model with UUID id, VARCHAR(500) text, ENUM(ACTIVE, COMPLETED) status, createdAt timestamp, completedAt nullable timestamp, composite index on (status, createdAt).

- **ARCH-5:** Docker Configuration - Multi-stage Dockerfiles for frontend/backend with development, test, and production targets; Docker Compose profiles for environment separation; named volumes for PostgreSQL data persistence.

- **ARCH-6:** Error Handling - Pino structured logging with console output, centralized Fastify error handler, Axios error interceptors on frontend, silent retry with exponential backoff for network failures.

- **ARCH-7:** Testing Infrastructure - Vitest for unit/integration tests, Playwright for E2E tests, Testcontainers for database testing with automatic container lifecycle management.

**From Architecture Decisions:**

- **ARCH-8:** Workspace Structure - pnpm workspaces (NOT Nx) with packages/frontend, packages/backend, packages/shared for shared types; root-level shared configs (ESLint, TypeScript, Prettier).

- **ARCH-9:** Development Environment - Docker Compose profiles (local, test, prod) with hot reload via bind mounts for local development, isolated test containers, Hybrid mode support (database in Docker, services local).

- **ARCH-10:** Shared Types Package - @aine/shared package with TypeScript types shared between frontend and backend (Task, TaskStatus, API request/response types) for type safety across layers.

- **ARCH-11:** Database Migrations - Prisma migrations for schema management with `prisma migrate dev` for development, `prisma migrate deploy` for test/production.

- **ARCH-12:** Logging Strategy - Pino with pretty-print in development (colorized), JSON output in production, log levels by environment (debug for dev, warn for test, info for prod).

**From UX Design Specification:**

- **UX-1:** 5-Second Capture Flow - FAB positioned bottom-right (thumb-reachable), autofocus input field on dialog open, single tap/Enter to save, optimistic UI with instant visual feedback, no loading states in capture flow.

- **UX-2:** Chronological Organization - Date-based grouping (Today, Yesterday, This Week, Older) for active tasks with visual hierarchy through typography (bold weight + 100% opacity for today, regular + 70% opacity for older).

- **UX-3:** Completion Satisfaction - Smooth animation (~300ms) when marking complete (check icon → cross-out → slide down), completed section collapsed by default with count badge, expandable to review wins, manual "Clear Completed" action.

- **UX-4:** Mobile-First Ergonomics - Minimum 48px touch targets, full-card tap for completion (no tiny checkboxes), swipe-left gesture for delete, one-handed thumb operation optimized.

- **UX-5:** Responsive Design - Same UI scales from mobile to desktop without separate feature sets, card max-width 600px on desktop, centered layout on large screens, adaptive density (more tasks visible on desktop).

- **UX-6:** Visual Design Foundation - Material-UI with calming blue accent color (#2196F3), Roboto typography with weight-based hierarchy, 8px base spacing unit, monochrome palette (95%) with single accent color.

- **UX-7:** Accessibility Requirements - Semantic HTML, ARIA labels, keyboard navigation (Tab, Enter, Escape), focus management, screen reader support for all interactive elements, WCAG 2.1 AA compliance.

- **UX-8:** Interaction Micro-animations - Task slides in from right when created, crosses out and slides down when completed, slides out left when deleted, staggered fade-out for bulk clear completed.

- **UX-9:** Ephemeral Completed Tasks - 24-hour auto-delete of completed tasks (hardcoded, not configurable) to prevent list bloat and enforce completion-first philosophy inspired by Slack's retention model.

- **UX-10:** Network Resilience UX - Silent background retry with no "syncing" indicators, error toast only on final failure after retries, manual retry button in error message, subtle offline indicator if device fully disconnected.

### FR Coverage Map

**Epic 1 (Development Environment & Infrastructure Setup):**
- FR11: Docker Compose Multi-Environment Setup
- FR13: Comprehensive Test Coverage

**Epic 2 (Core Task Management - Capture & Storage):**
- FR1: Create Task
- FR2: View Tasks
- FR6: Cross-Session Persistence
- FR7: Cross-Device Consistency
- FR12: REST API

**Epic 3 (Task Lifecycle - Completion & Deletion):**
- FR3: Complete Task
- FR4: Delete Task
- FR5: Clear Completed Tasks
- FR14: Auto-Delete Completed Tasks

**Epic 4 (Mobile-First User Experience & Visual Design):**
- FR8: Mobile-First Responsive UI
- FR10: Graceful State Handling

**Epic 5 (Network Resilience & Optimistic UI):**
- FR9: Optimistic UI Pattern

**Epic 6 (Accessibility & Inclusive Design):**
- NFR10: Accessibility Compliance (WCAG 2.1 AA)

**Coverage Summary:** All 14 FRs mapped to epics ✅

## Epic List

### Epic 1: Development Environment & Infrastructure Setup
Enable developers to build, test, and deploy the application reliably across local/test/prod environments with complete development infrastructure, workspace configuration, Docker Compose orchestration, database migrations, hot reload, and executable test suites.

**FRs covered:** FR11, FR13  
**NFRs covered:** NFR5, NFR6  
**Additional requirements:** ARCH-1, ARCH-5, ARCH-7, ARCH-8, ARCH-9, ARCH-11

### Epic 2: Core Task Management - Capture & Storage
Enable users to capture tasks instantly during meetings (5-second flow) and trust they're saved reliably across sessions and devices with task creation, viewing, PostgreSQL persistence, cross-device sync, and REST API.

**FRs covered:** FR1, FR2, FR6, FR7, FR12  
**NFRs covered:** NFR1, NFR2, NFR4  
**Additional requirements:** ARCH-2, ARCH-3, ARCH-4, ARCH-6, ARCH-10, UX-1

### Epic 3: Task Lifecycle - Completion & Deletion
Enable users to mark tasks complete with satisfying feedback, delete unwanted tasks, and clear completed tasks to maintain focus with completion animations, swipe-to-delete, bulk clear, and 24-hour ephemeral storage.

**FRs covered:** FR3, FR4, FR5, FR14  
**NFRs covered:** NFR7  
**Additional requirements:** UX-3, UX-8, UX-9

### Epic 4: Mobile-First User Experience & Visual Design
Enable users to experience fast, intuitive, beautiful mobile-first interactions optimized for one-handed thumb operation with Material-UI theme, responsive layout, FAB positioning, chronological date grouping, typography hierarchy, micro-animations, and graceful state handling.

**FRs covered:** FR8, FR10  
**NFRs covered:** NFR9  
**Additional requirements:** UX-2, UX-4, UX-5, UX-6, UX-8

### Epic 5: Network Resilience & Optimistic UI
Enable users to experience instant feedback for all actions regardless of network quality with optimistic UI updates, background sync, retry logic with exponential backoff, error toasts only on final failure, and offline operation queue.

**FRs covered:** FR9  
**NFRs covered:** NFR3, NFR8  
**Additional requirements:** ARCH-2, ARCH-6, UX-10

### Epic 6: Accessibility & Inclusive Design
Enable users with disabilities to navigate, create, complete, and delete tasks using keyboard, screen readers, and assistive technologies with WCAG 2.1 AA compliance, semantic HTML, ARIA labels, keyboard navigation, focus management, and screen reader announcements.

**FRs covered:** None (NFR-driven)  
**NFRs covered:** NFR10  
**Additional requirements:** UX-7

## Epic 1: Development Environment & Infrastructure Setup

Enable developers to build, test, and deploy the application reliably across local/test/prod environments with complete development infrastructure, workspace configuration, Docker Compose orchestration, database migrations, hot reload, and executable test suites.

### Story 1.1: Workspace Setup with pnpm and Shared Types

As a developer,
I want a pnpm workspace monorepo with shared TypeScript types between frontend and backend,
So that I can maintain type safety across the entire application and avoid type drift.

**Acceptance Criteria:**

**Given** a fresh project repository
**When** I run `pnpm install` from the project root
**Then** the workspace installs dependencies for all packages (frontend, backend, shared)
**And** the `@aine/shared` package exports TypeScript types accessible to both frontend and backend
**And** root-level ESLint, Prettier, and TypeScript configs are enforced across all packages
**And** TypeScript strict mode is enabled with zero type errors

**Given** I modify a type in `packages/shared/src/types/task.ts`
**When** I import that type in both frontend and backend code
**Then** both packages receive the updated type definition immediately via pnpm symlinks
**And** TypeScript compilation succeeds in both packages

### Story 1.2: Docker Compose Multi-Environment Configuration

As a developer,
I want Docker Compose profiles for local, test, and production environments,
So that I can run the application in isolated environments with appropriate configurations.

**Acceptance Criteria:**

**Given** the Docker Compose configuration file exists
**When** I run `docker compose --profile local up -d`
**Then** the local development environment starts with PostgreSQL 16+ database, hot reload enabled via bind mounts for frontend and backend, and environment variables loaded from `.env.development`
**And** the database uses a named volume `postgres_data_local` for persistence
**And** the backend is accessible at `http://localhost:3000`
**And** the frontend is accessible at `http://localhost:5173`

**Given** I run `docker compose --profile test up -d`
**When** the test environment starts
**Then** services use isolated test database with environment variables from `.env.test`
**And** the database uses a separate named volume `postgres_data_test`
**And** services run on different ports (backend: 3001, frontend: 5174)

**Given** I run `docker compose --profile prod up -d`
**When** the production environment starts
**Then** services use production-optimized builds without bind mounts
**And** environment variables are loaded from `.env.production`
**And** services have restart policies configured (`unless-stopped`)

**Given** I run `docker compose down -v`
**When** I restart with the same profile
**Then** the database retains data from previous sessions via named volumes

### Story 1.3: Backend Foundation with Fastify and Prisma

As a developer,
I want a Fastify backend with Prisma ORM, Pino logging, and initial database schema,
So that I can build REST API endpoints with type-safe database access.

**Acceptance Criteria:**

**Given** the backend package structure exists
**When** I run `pnpm --filter backend dev`
**Then** the Fastify server starts on port 3000 with Pino logger configured (pretty-print in development, JSON in production)
**And** the server responds to health check at `GET /health` with status 200
**And** CORS is configured to accept requests from `http://localhost:5173`

**Given** the Prisma schema is defined
**When** I run `pnpm --filter backend prisma migrate dev`
**Then** a PostgreSQL migration creates the `tasks` table with columns: `id` (UUID primary key), `text` (VARCHAR 500), `status` (ENUM 'ACTIVE'/'COMPLETED'), `createdAt` (TIMESTAMP), `completedAt` (TIMESTAMP nullable)
**And** a composite index is created on `(status, createdAt)` for optimized sorting

**Given** the Prisma client is generated
**When** I import `@prisma/client` in backend code
**Then** TypeScript autocomplete provides type-safe access to the `task` model
**And** I can execute queries like `prisma.task.findMany()` with full type safety

**Given** hot reload is enabled in local development
**When** I modify a TypeScript file in `packages/backend/src`
**Then** the server restarts automatically within 2 seconds via `tsx watch`
**And** Pino logs indicate the restart

### Story 1.4: Frontend Foundation with React, Vite, and Material-UI

As a developer,
I want a React frontend with Vite build tool, TypeScript, React Router, and Material-UI,
So that I can build responsive UI components with fast development iteration.

**Acceptance Criteria:**

**Given** the frontend package structure exists
**When** I run `pnpm --filter frontend dev`
**Then** the Vite dev server starts on port 5173 with hot module replacement (HMR) enabled
**And** the browser displays a basic Material-UI themed homepage
**And** React Router v6 is configured with at least one route

**Given** I access the app in a browser
**When** the page loads
**Then** Material-UI theme is applied with primary color #2196F3 (calming blue)
**And** Roboto font is loaded and applied to all Typography components
**And** the viewport is configured for mobile-first responsive design (`<meta name="viewport">`)

**Given** hot reload is enabled
**When** I modify a React component in `packages/frontend/src`
**Then** the browser updates within 1 second without full page refresh
**And** component state is preserved via HMR

**Given** I import shared types from `@aine/shared`
**When** I use those types in frontend components
**Then** TypeScript provides autocomplete and type checking
**And** the build completes with zero type errors

**Given** I run `pnpm --filter frontend build`
**When** the build completes
**Then** production-optimized static files are output to `packages/frontend/dist`
**And** the build includes code splitting and minification
**And** the bundle size is reasonable for a mobile-first app

### Story 1.5: Testing Infrastructure with Vitest, Testcontainers, and Playwright

As a developer,
I want comprehensive testing infrastructure with unit, integration, and E2E test capabilities,
So that I can validate code quality and functionality with automated tests.

**Acceptance Criteria:**

**Given** Vitest is configured for the backend
**When** I run `pnpm --filter backend test`
**Then** unit tests execute with coverage reporting (v8 provider)
**And** coverage thresholds are enforced (80% lines, functions, branches, statements)
**And** test output uses the Node environment

**Given** Testcontainers is configured
**When** I run integration tests that need a database
**Then** a PostgreSQL 16 container starts automatically before tests
**And** Prisma migrations run against the test container
**And** each test gets a clean database state via `afterEach` cleanup
**And** the container stops automatically after all tests complete

**Given** Playwright is configured for the frontend
**When** I run `pnpm --filter frontend test:e2e`
**Then** E2E tests execute against a running development server
**And** tests run in both Desktop Chrome and Mobile Chrome viewports
**And** screenshots are captured on test failures
**And** HTML test report is generated

**Given** I run `pnpm test` from the project root
**When** the command completes
**Then** all tests execute across all packages (frontend, backend)
**And** the command exits with code 0 if all tests pass
**And** the command exits with non-zero code if any tests fail

**Given** I run `pnpm test:coverage` from the project root
**When** coverage reports are generated
**Then** combined coverage meets the 80% threshold requirement (NFR5)
**And** coverage reports are output in text, JSON, and HTML formats

## Epic 2: Core Task Management - Capture & Storage

Enable users to capture tasks instantly during meetings (5-second flow) and trust they're saved reliably across sessions and devices with task creation, viewing, PostgreSQL persistence, cross-device sync, and REST API.

### Story 2.1: Backend API - Create Task Endpoint

As a user,
I want the backend to accept and persist new tasks,
So that my captured tasks are stored reliably in the database.

**Acceptance Criteria:**

**Given** the Fastify server is running
**When** I send `POST /api/v1/tasks` with JSON body `{ "text": "Review PR #123" }`
**Then** the response has status 201 Created
**And** the response body contains the created task with generated UUID `id`, the provided `text`, `status: "ACTIVE"`, `createdAt` timestamp, and `completedAt: null`
**And** the task is persisted in the PostgreSQL database

**Given** I send `POST /api/v1/tasks` with empty text `{ "text": "" }`
**When** the request is processed
**Then** the response has status 400 Bad Request
**And** the response body contains a validation error message indicating text is required

**Given** I send `POST /api/v1/tasks` with text exceeding 500 characters
**When** the request is processed
**Then** the response has status 400 Bad Request
**And** the response body contains a validation error message indicating text must be 500 characters or less

**Given** the database connection fails during task creation
**When** I send a valid create task request
**Then** the response has status 500 Internal Server Error
**And** Pino logs the error with full stack trace and request context
**And** the response body contains a generic error message (no sensitive data exposed)

### Story 2.2: Backend API - Get All Tasks Endpoint with Sorting

As a user,
I want to retrieve all my tasks sorted chronologically,
So that I can see active tasks newest-first and completed tasks oldest-first.

**Acceptance Criteria:**

**Given** the database contains 5 active tasks and 3 completed tasks
**When** I send `GET /api/v1/tasks`
**Then** the response has status 200 OK
**And** the response body contains a `tasks` array with all 8 tasks
**And** active tasks appear before completed tasks in the array
**And** within active tasks, sorting is by `createdAt` DESC (newest first)
**And** within completed tasks, sorting is by `completedAt` ASC (oldest first)

**Given** the database has no tasks
**When** I send `GET /api/v1/tasks`
**Then** the response has status 200 OK
**And** the response body contains an empty `tasks` array `{ "tasks": [] }`

**Given** the database connection fails
**When** I send `GET /api/v1/tasks`
**Then** the response has status 500 Internal Server Error
**And** Pino logs the error with stack trace
**And** the response body contains a generic error message

**Given** a task has `createdAt: "2026-02-18T10:00:00Z"` and `status: "ACTIVE"`
**When** I retrieve all tasks
**Then** the task's JSON includes both `createdAt` and `completedAt` fields
**And** `completedAt` is `null` for active tasks

### Story 2.3: Frontend - Task List View with Empty State

As a user,
I want to see my task list displayed in a clean, mobile-friendly layout,
So that I can scan my tasks at a glance.

**Acceptance Criteria:**

**Given** the frontend app loads successfully
**When** I navigate to the home page (`/`)
**Then** I see a Material-UI themed page with primary color #2196F3
**And** the page displays a centered content area with max-width 600px on desktop
**And** Roboto font is applied to all text

**Given** there are no tasks in the database
**When** the task list view loads
**Then** I see an empty state message: "No tasks yet. Tap + to get started."
**And** I see a floating action button (FAB) in the bottom-right corner
**And** the FAB has a "+" icon and uses the primary color (#2196F3)

**Given** the task list API returns 3 active tasks
**When** the task list view loads
**Then** I see 3 task cards displayed in a vertical list
**And** each task card shows the task text
**And** each task card shows a relative timestamp (e.g., "2 min ago", "10:30 AM")
**And** the cards are ordered newest-first (matching API sort order)
**And** each task card has a minimum height of 48px for touch targets

**Given** the task list API request fails
**When** the task list view attempts to load
**Then** I see an error message: "Failed to load tasks"
**And** I see a "Retry" button to manually trigger reload
**And** the FAB remains visible and functional

### Story 2.4: Frontend - Task Creation via FAB and Dialog (5-Second Flow)

As a user,
I want to create a task in under 5 seconds by tapping the FAB and typing,
So that I can capture action items during meetings without breaking focus.

**Acceptance Criteria:**

**Given** I'm on the task list page
**When** I tap the FAB (floating action button)
**Then** a Material-UI Dialog opens immediately (no animation delay)
**And** the dialog contains a TextField with label "What needs to be done?"
**And** the TextField has autofocus enabled (keyboard appears on mobile)
**And** the dialog has "Cancel" and "Add Task" buttons

**Given** the add task dialog is open
**When** I type "Review Sarah's PR" in the text field
**And** I tap the "Add Task" button
**Then** the dialog closes immediately
**And** the new task appears at the top of the task list instantly (optimistic UI)
**And** the total interaction time from FAB tap to task visible is under 5 seconds (NFR1)

**Given** the add task dialog is open
**When** I type "Review Sarah's PR" and press Enter on keyboard
**Then** the dialog closes and the task is created (same as tapping "Add Task" button)

**Given** the add task dialog is open with empty text
**When** I tap "Add Task"
**Then** the TextField shows a validation error: "Task text is required"
**And** the dialog remains open for correction

**Given** the add task dialog is open
**When** I tap "Cancel" or press Escape key
**Then** the dialog closes without creating a task
**And** any entered text is discarded

**Given** I type text exceeding 500 characters
**When** I attempt to submit
**Then** the TextField shows a validation error: "Task text must be 500 characters or less"
**And** the character count is displayed (e.g., "523/500")

### Story 2.5: TanStack Query Integration with Optimistic Updates

As a user,
I want task creation to feel instant even with slow network connections,
So that I never wait for server confirmation during meetings.

**Acceptance Criteria:**

**Given** TanStack Query is configured in the frontend
**When** I create a new task
**Then** the task appears in the list immediately with a temporary ID
**And** the background POST request to `/api/v1/tasks` executes asynchronously
**And** no loading spinner blocks the UI

**Given** the backend successfully creates the task
**When** the POST response returns with the real task ID
**Then** the temporary ID is replaced with the real UUID from the server
**And** the task remains in the same position in the list
**And** no UI flicker or re-render is visible to the user

**Given** the backend request fails (network error, 500 status)
**When** TanStack Query receives the error
**Then** the optimistically added task is removed from the list
**And** an error toast appears: "Failed to create task. Try again?"
**And** the toast includes a "Retry" button that re-attempts the POST request

**Given** I create multiple tasks in rapid succession (3 tasks within 10 seconds)
**When** all tasks are created
**Then** all 3 tasks appear in the list immediately (optimistic UI)
**And** all 3 background POST requests execute concurrently
**And** tasks are replaced with real IDs as responses arrive
**And** the list maintains correct sort order throughout

**Given** TanStack Query cache is configured
**When** I create a task and then refresh the page
**Then** the task persists (fetched from server, not just local cache)
**And** the `GET /api/v1/tasks` query executes on page load
**And** the task list displays server data

### Story 2.6: Cross-Device Sync Validation

As a user,
I want tasks created on my phone to appear instantly on my desktop,
So that I have consistent data across all devices.

**Acceptance Criteria:**

**Given** I have the app open on my phone and desktop simultaneously
**When** I create a task on my phone
**Then** the task appears on my phone immediately (optimistic UI from Story 2.5)
**And** the task appears on my desktop within 3 seconds (via TanStack Query refetch)

**Given** TanStack Query is configured with refetch intervals
**When** the desktop app is idle
**Then** the task list automatically refetches every 30 seconds (configurable)
**And** new tasks from other devices appear without manual refresh

**Given** I create a task on desktop while offline
**When** the network reconnects
**Then** the task syncs to the server automatically (via TanStack Query retry)
**And** the task becomes visible on mobile after refetch

**Given** both devices fetch the task list
**When** both display the same task
**Then** the task has identical `id`, `text`, `status`, `createdAt`, and `completedAt` values
**And** timestamps are displayed in the user's local timezone

**Given** I open the app on a new device for the first time
**When** the task list loads
**Then** all previously created tasks appear (fetched from PostgreSQL database)
**And** the data is consistent with other devices (single source of truth: database)

## Epic 3: Task Lifecycle - Completion & Deletion

Enable users to mark tasks complete with satisfying feedback, delete unwanted tasks, and clear completed tasks to maintain focus with completion animations, swipe-to-delete, bulk clear, and 24-hour ephemeral storage.

### Story 3.1: Backend API - Update Task Status Endpoint

As a user,
I want the backend to update task status and capture completion timestamps,
So that my completed tasks are tracked with accurate timing data.

**Acceptance Criteria:**

**Given** an active task exists with `id: "123"` and `status: "ACTIVE"`
**When** I send `PATCH /api/v1/tasks/123` with JSON body `{ "status": "COMPLETED" }`
**Then** the response has status 200 OK
**And** the response body contains the updated task with `status: "COMPLETED"` and `completedAt` timestamp set to current server time
**And** the task in the database reflects the updated status and timestamp

**Given** a completed task exists with `id: "456"` and `status: "COMPLETED"`
**When** I send `PATCH /api/v1/tasks/456` with JSON body `{ "status": "ACTIVE" }`
**Then** the response has status 200 OK
**And** the response body contains the updated task with `status: "ACTIVE"` and `completedAt: null`
**And** the task can be toggled back and forth between states

**Given** I send `PATCH /api/v1/tasks/nonexistent-id` with valid status
**When** the request is processed
**Then** the response has status 404 Not Found
**And** the response body contains error message: "Task not found"

**Given** I send `PATCH /api/v1/tasks/123` with invalid status `{ "status": "INVALID" }`
**When** the request is processed
**Then** the response has status 400 Bad Request
**And** the response body contains validation error indicating status must be "ACTIVE" or "COMPLETED"

**Given** the database connection fails during update
**When** I send a valid update request
**Then** the response has status 500 Internal Server Error
**And** Pino logs the error with full context
**And** the task status remains unchanged in the database (transaction rollback)

### Story 3.2: Backend API - Delete Single Task Endpoint

As a user,
I want the backend to permanently delete tasks,
So that I can remove unwanted or erroneous tasks from my list.

**Acceptance Criteria:**

**Given** a task exists with `id: "789"`
**When** I send `DELETE /api/v1/tasks/789`
**Then** the response has status 204 No Content
**And** the response body is empty
**And** the task is permanently removed from the database

**Given** I send `DELETE /api/v1/tasks/nonexistent-id`
**When** the request is processed
**Then** the response has status 404 Not Found
**And** the response body contains error message: "Task not found"

**Given** I delete a task with `id: "789"` successfully
**When** I send `GET /api/v1/tasks` to retrieve all tasks
**Then** the deleted task with `id: "789"` does not appear in the response
**And** other tasks remain unaffected

**Given** the database connection fails during deletion
**When** I send a valid delete request
**Then** the response has status 500 Internal Server Error
**And** Pino logs the error
**And** the task remains in the database

### Story 3.3: Backend API - Bulk Delete Completed Tasks Endpoint

As a user,
I want the backend to delete all completed tasks in a single operation,
So that I can quickly clear my completed task history.

**Acceptance Criteria:**

**Given** the database contains 5 active tasks and 12 completed tasks
**When** I send `DELETE /api/v1/tasks/completed`
**Then** the response has status 200 OK
**And** the response body contains `{ "deletedCount": 12 }`
**And** all 12 completed tasks are permanently removed from the database
**And** all 5 active tasks remain unchanged

**Given** the database contains only active tasks (no completed tasks)
**When** I send `DELETE /api/v1/tasks/completed`
**Then** the response has status 200 OK
**And** the response body contains `{ "deletedCount": 0 }`
**And** all active tasks remain unchanged

**Given** the database connection fails during bulk deletion
**When** I send the delete completed request
**Then** the response has status 500 Internal Server Error
**And** Pino logs the error
**And** completed tasks remain in the database (transaction rollback)

### Story 3.4: Frontend - Complete Task with Animation and Optimistic UI

As a user,
I want to tap a task card to mark it complete with satisfying visual feedback,
So that I feel a sense of accomplishment when finishing tasks.

**Acceptance Criteria:**

**Given** I see an active task in the task list
**When** I tap anywhere on the task card
**Then** a checkmark icon appears on the task card with a brief animation (~150ms)
**And** the task text becomes crossed out (strikethrough) with smooth transition (~300ms)
**And** the task card slides down to a "Completed" section at the bottom of the list (~300ms)
**And** the total animation duration is approximately 300ms (not too fast or slow)

**Given** I tap a task to complete it
**When** the optimistic UI update occurs
**Then** the task moves to the completed section immediately (before server response)
**And** a background `PATCH /api/v1/tasks/:id` request executes with `{ "status": "COMPLETED" }`
**And** the task card remains in the completed section after server confirms

**Given** the backend successfully updates the task status
**When** the PATCH response returns with `completedAt` timestamp
**Then** the task data is updated with the server-provided timestamp
**And** no visible UI change occurs (optimistic update already applied)

**Given** the backend request fails (network error or 500 status)
**When** TanStack Query receives the error
**Then** the task reverts back to the active section with undo animation
**And** an error toast appears: "Failed to complete task. Try again?"
**And** the strikethrough is removed

**Given** I tap a completed task in the completed section
**When** the tap is registered
**Then** the task un-completes (strikethrough removed, moves back to active section)
**And** the same optimistic UI pattern applies (immediate update, background PATCH)

### Story 3.5: Frontend - Delete Task with Swipe Gesture

As a user,
I want to swipe left on a task card to delete it,
So that I can quickly remove unwanted tasks with a natural gesture.

**Acceptance Criteria:**

**Given** I see a task card in the list (active or completed)
**When** I swipe left on the card
**Then** the card slides partially left revealing a red delete button/icon
**And** the rest of the list remains stationary (only swiped card moves)

**Given** the delete action is revealed via swipe
**When** I tap the delete button
**Then** a confirmation dialog appears: "Delete this task? This cannot be undone."
**And** the dialog has "Cancel" and "Delete" buttons

**Given** the delete confirmation dialog is open
**When** I tap "Delete"
**Then** the dialog closes immediately
**And** the task card slides out left with fade animation (~300ms)
**And** the task disappears from the list
**And** a background `DELETE /api/v1/tasks/:id` request executes

**Given** I swipe to reveal delete but tap elsewhere
**When** I tap outside the delete button or swipe right
**Then** the card slides back to its original position (undo swipe)
**And** no deletion occurs

**Given** the backend successfully deletes the task
**When** the DELETE response returns
**Then** the task remains removed from the UI (already optimistically deleted)

**Given** the backend request fails
**When** TanStack Query receives the error
**Then** the task reappears in the list with fade-in animation
**And** an error toast appears: "Failed to delete task. Try again?"

**Given** I am on a desktop browser
**When** I hover over a task card
**Then** a delete icon button appears on the right side of the card
**And** clicking the icon triggers the same confirmation dialog and deletion flow

### Story 3.6: Frontend - Completed Tasks Section with Collapse/Expand

As a user,
I want completed tasks to collapse into a separate section below active tasks,
So that I can focus on active work while still seeing my progress.

**Acceptance Criteria:**

**Given** I have 5 active tasks and 8 completed tasks
**When** the task list loads
**Then** active tasks appear at the top in their own section (no header needed)
**And** completed tasks appear in a collapsible section below with header "Completed (8)"
**And** the completed section is collapsed by default (only header visible)

**Given** the completed section is collapsed
**When** I tap the "Completed (8)" header
**Then** the section expands with smooth animation (~300ms)
**And** all 8 completed tasks become visible with strikethrough text
**And** the header icon changes from chevron-down to chevron-up

**Given** the completed section is expanded
**When** I tap the "Completed (8)" header again
**Then** the section collapses with smooth animation
**And** only the header remains visible

**Given** I complete a task while the completed section is collapsed
**When** the task moves to the completed section
**Then** the completed count badge updates (e.g., "Completed (8)" → "Completed (9)")
**And** the section remains collapsed (doesn't auto-expand)

**Given** I have no completed tasks
**When** the task list loads
**Then** the completed section is not visible at all
**And** only active tasks are shown

**Given** the completed section collapse/expand state
**When** I change the state and refresh the page
**Then** the section state is persisted via LocalStorage (preference saved)
**And** the section opens in the previously selected state

### Story 3.7: Frontend - Clear All Completed Tasks Action

As a user,
I want to clear all completed tasks in one action,
So that I can maintain a clean task list without individually deleting each completed task.

**Acceptance Criteria:**

**Given** the completed section is expanded and contains 12 completed tasks
**When** I see the completed section
**Then** a "Clear All Completed" button appears at the top of the section (below the header)
**And** the button has secondary styling (not primary color, less prominent)

**Given** I tap "Clear All Completed"
**When** the button is tapped
**Then** a confirmation dialog appears: "Delete all 12 completed tasks? This cannot be undone."
**And** the dialog shows the count of tasks to be deleted
**And** the dialog has "Cancel" and "Clear Completed" buttons

**Given** the confirmation dialog is open
**When** I tap "Clear Completed"
**Then** the dialog closes immediately
**And** all completed tasks fade out with staggered animation (~50ms delay between each, total ~600ms)
**And** the completed section header updates to "Completed (0)" and disappears
**And** a background `DELETE /api/v1/tasks/completed` request executes

**Given** the backend successfully deletes all completed tasks
**When** the DELETE response returns with `{ "deletedCount": 12 }`
**Then** the UI already reflects the deletion (optimistic update)
**And** a subtle success toast appears briefly: "12 tasks cleared"

**Given** the backend request fails
**When** TanStack Query receives the error
**Then** all completed tasks reappear in the completed section with fade-in animation
**And** an error toast appears: "Failed to clear completed tasks. Try again?"

**Given** I have no completed tasks
**When** the completed section is not visible
**Then** the "Clear All Completed" button does not appear anywhere in the UI

### Story 3.8: Backend - Auto-Delete Completed Tasks After 24 Hours (Cron Job)

As a user,
I want completed tasks to automatically delete after 24 hours,
So that my list stays clean without manual maintenance (ephemeral storage model).

**Acceptance Criteria:**

**Given** a task was completed 25 hours ago (completedAt timestamp is older than 24 hours)
**When** the automated cleanup job runs
**Then** the task is permanently deleted from the database
**And** Pino logs the deletion with task ID and completedAt timestamp

**Given** a task was completed 12 hours ago (within 24-hour window)
**When** the automated cleanup job runs
**Then** the task remains in the database unchanged
**And** the task is not deleted

**Given** 15 tasks were completed more than 24 hours ago and 5 tasks completed within 24 hours
**When** the automated cleanup job runs
**Then** exactly 15 tasks are deleted
**And** the 5 recent completed tasks remain
**And** Pino logs summary: "Auto-deleted 15 completed tasks older than 24 hours"

**Given** the cleanup job is configured as a scheduled task (cron job)
**When** the backend server starts
**Then** the job is scheduled to run every 1 hour (configurable interval)
**And** Pino logs indicate the job is registered: "Cleanup job scheduled: every 1 hour"

**Given** the cleanup job executes successfully
**When** the job completes
**Then** Pino logs the execution time and number of deleted tasks
**And** the job exits gracefully without affecting other server operations

**Given** the database connection fails during cleanup
**When** the job attempts to delete tasks
**Then** the job logs the error via Pino
**And** the job exits gracefully without crashing the server
**And** the job retries on the next scheduled run

**Given** no tasks are older than 24 hours
**When** the cleanup job runs
**Then** no tasks are deleted
**And** Pino logs: "Auto-cleanup completed: 0 tasks deleted"

## Epic 4: Mobile-First User Experience & Visual Design

Enable users to experience fast, intuitive, beautiful mobile-first interactions optimized for one-handed thumb operation with Material-UI theme, responsive layout, FAB positioning, chronological date grouping, typography hierarchy, micro-animations, and graceful state handling.

### Story 4.1: Material-UI Theme with Calming Blue Accent and Roboto Typography

As a user,
I want a visually calming interface with consistent typography,
So that the app feels professional and reduces visual stress during busy workdays.

**Acceptance Criteria:**

**Given** the Material-UI theme is configured
**When** the app loads in any browser
**Then** the primary color is #2196F3 (calming blue) applied to FAB, links, and interactive elements
**And** the secondary color is a neutral gray for less prominent actions
**And** Roboto font family is loaded and applied to all Typography components

**Given** I view the app on any device
**When** text is rendered
**Then** all headings use Roboto font with appropriate weights (500 for emphasis, 400 for body)
**And** body text uses 16px base size for readability on mobile
**And** line height is 1.5 for comfortable reading

**Given** the color palette is defined
**When** I inspect the interface
**Then** 95% of the interface uses monochrome colors (black, white, grays)
**And** the blue accent (#2196F3) is used sparingly for primary actions and focus states
**And** error states use standard Material-UI error red
**And** success states use standard Material-UI success green

**Given** spacing tokens are configured
**When** UI components are rendered
**Then** all spacing uses 8px base unit increments (8px, 16px, 24px, etc.)
**And** touch targets have minimum 48px height for thumb-friendly interaction
**And** card padding is generous (16px mobile, 24px desktop)

**Given** border radius is configured
**When** cards and buttons are rendered
**Then** corners use 8px border radius for a softer, modern feel
**And** FAB uses 50% border radius (circular)

### Story 4.2: Responsive Layout with Mobile-First Breakpoints

As a user,
I want the interface to adapt seamlessly from mobile to desktop,
So that I have an optimal experience on any device without separate interfaces.

**Acceptance Criteria:**

**Given** I access the app on a mobile device (width < 600px)
**When** the task list loads
**Then** the content spans full viewport width with 16px horizontal padding
**And** task cards stack vertically with 8px gaps
**And** the FAB is positioned in bottom-right corner (16px from edges)
**And** 6-8 tasks are visible without scrolling on average phone screen

**Given** I access the app on a tablet (width 600px - 900px)
**When** the task list loads
**Then** the content area has max-width 600px and is centered
**And** horizontal padding increases to 24px
**And** task cards maintain full width of content area
**And** 10-12 tasks are visible without scrolling

**Given** I access the app on desktop (width > 900px)
**When** the task list loads
**Then** the content area has max-width 600px and is horizontally centered
**And** vertical space is maximized to show 20+ tasks without scrolling
**And** the FAB remains in bottom-right of content area (not viewport edge)
**And** hover states appear on interactive elements

**Given** I rotate my device from portrait to landscape
**When** the orientation changes
**Then** the layout re-flows automatically without page refresh
**And** touch targets remain 48px minimum height
**And** content remains readable and accessible

**Given** I resize my desktop browser window
**When** the width crosses breakpoints (600px, 900px)
**Then** the layout transitions smoothly without content jumping
**And** all functionality remains accessible at every size

### Story 4.3: Chronological Date Grouping (Today, Yesterday, This Week, Older)

As a user,
I want tasks grouped by recency with clear date headers,
So that I can quickly identify what's fresh versus what's been sitting for days.

**Acceptance Criteria:**

**Given** I have tasks from multiple days
**When** the task list loads
**Then** active tasks are grouped into sections: "Today", "Yesterday", "This Week", "Older"
**And** each section has a header with the group label (Typography variant h6, bold weight)
**And** sections appear in chronological order (Today at top, Older at bottom)

**Given** a task was created today at 2:00 PM and current time is 4:00 PM
**When** the task list displays
**Then** the task appears under "Today" section
**And** the timestamp shows relative time: "2 hours ago"

**Given** a task was created yesterday at any time
**When** the task list displays
**Then** the task appears under "Yesterday" section
**And** the timestamp shows absolute time: "Feb 17, 10:30 AM"

**Given** a task was created 3 days ago (within current week)
**When** the task list displays
**Then** the task appears under "This Week" section
**And** the timestamp shows day name and time: "Monday, 2:15 PM"

**Given** a task was created 2 weeks ago
**When** the task list displays
**Then** the task appears under "Older" section
**And** the timestamp shows full date: "Feb 4, 2026"

**Given** a date group has no tasks
**When** the task list displays
**Then** that group header does not appear
**And** only groups with tasks are shown

**Given** I complete a task from "Today" section
**When** the task moves to completed section
**Then** the "Today" section header remains if other today tasks exist
**And** the "Today" section header disappears if no more today tasks remain

### Story 4.4: Typography Hierarchy for Visual Urgency (Bold Today, Faded Older)

As a user,
I want recent tasks to visually stand out from older tasks,
So that I can immediately see what needs attention without reading dates.

**Acceptance Criteria:**

**Given** I have tasks across multiple date groups
**When** the task list displays
**Then** tasks in "Today" section use font weight 500 (medium/bold) and 100% opacity
**And** tasks in "Yesterday" section use font weight 400 (regular) and 90% opacity
**And** tasks in "This Week" section use font weight 400 and 80% opacity
**And** tasks in "Older" section use font weight 400 and 70% opacity

**Given** a task is in the "Today" section
**When** I view the task card
**Then** the text is visually prominent (darker, bolder)
**And** the task "pops" compared to older tasks

**Given** a task is in the "Older" section
**When** I view the task card
**Then** the text is visually receded (lighter, more faded)
**And** the task appears less urgent without requiring explicit priority labels

**Given** completed tasks in the completed section
**When** the section is expanded
**Then** all completed tasks use 60% opacity regardless of original date group
**And** strikethrough text decoration is applied
**And** font weight is regular (400)

**Given** I scan the task list from top to bottom
**When** my eye moves down the list
**Then** visual hierarchy creates a natural gradient from "urgent" (bold, dark) to "can wait" (regular, faded)
**And** no color coding or badges are needed to communicate priority

### Story 4.5: Micro-Animations for State Changes

As a user,
I want smooth, delightful animations when tasks change state,
So that the interface feels responsive and polished rather than abrupt.

**Acceptance Criteria:**

**Given** I create a new task
**When** the task is added to the list
**Then** the task card slides in from the right with fade-in (~300ms ease-out)
**And** existing tasks slide down smoothly to make room
**And** the animation completes before I can interact with the new task

**Given** I complete a task
**When** the task moves to completed section
**Then** the checkmark icon appears with scale animation (~150ms)
**And** the text crosses out with smooth transition (~300ms)
**And** the card slides down to completed section (~300ms)
**And** total animation duration is ~300ms (animations overlap, not sequential)

**Given** I delete a task
**When** the delete action is confirmed
**Then** the task card slides out left with fade-out (~300ms)
**And** remaining tasks slide up smoothly to fill the gap
**And** the animation completes before the gap closes

**Given** I clear all completed tasks
**When** the bulk delete action executes
**Then** completed tasks fade out with staggered timing (~50ms delay between each)
**And** total animation completes within ~600ms for typical 10-12 completed tasks
**And** the completed section header fades out last

**Given** I expand the completed section
**When** I tap the section header
**Then** the section expands with smooth height transition (~300ms ease-in-out)
**And** completed tasks fade in as section opens
**And** the chevron icon rotates 180 degrees during expansion

**Given** animations are playing
**When** multiple animations occur simultaneously
**Then** animations do not conflict or cause visual jank
**And** performance remains smooth (60fps on modern devices)

### Story 4.6: Loading State with Minimal Spinner

As a user,
I want to see a subtle loading indicator only when necessary,
So that I know the app is working without intrusive blocking spinners.

**Acceptance Criteria:**

**Given** the app is loading for the first time (initial page load)
**When** the task list is fetching from the API
**Then** a centered Material-UI CircularProgress spinner appears in the content area
**And** the spinner uses the primary color (#2196F3)
**And** the spinner size is 40px (not too large or small)
**And** no other UI elements are visible during initial load

**Given** the initial load completes successfully
**When** tasks are displayed
**Then** the spinner fades out smoothly (~200ms)
**And** task list fades in simultaneously
**And** no loading state persists after data arrives

**Given** I create, complete, or delete a task (optimistic UI operations)
**When** the background API request executes
**Then** NO loading spinner appears
**And** the UI updates immediately (optimistic update)
**And** only error states are shown if the request fails

**Given** I manually trigger a refresh (pull-to-refresh gesture)
**When** the task list refetches
**Then** a small spinner appears in the header area (not blocking content)
**And** existing tasks remain visible during refresh
**And** the spinner disappears when new data arrives

**Given** the initial load fails (network error, 500 status)
**When** the error occurs
**Then** the spinner is replaced with error message: "Failed to load tasks"
**And** a "Retry" button appears below the message
**And** the FAB remains visible and functional

**Given** I'm on a slow 3G connection
**When** the initial load takes longer than 2 seconds
**Then** the spinner remains visible until data arrives
**And** no timeout message appears (patient loading, no artificial time limits)
**And** the app doesn't crash or freeze

## Epic 5: Network Resilience & Optimistic UI

Enable users to experience instant feedback for all actions regardless of network quality with optimistic UI updates, background sync, retry logic with exponential backoff, error toasts only on final failure, and offline operation queue.

### Story 5.1: TanStack Query Retry Logic with Exponential Backoff

As a user,
I want failed network requests to retry automatically in the background,
So that temporary network issues don't require my intervention.

**Acceptance Criteria:**

**Given** TanStack Query is configured for mutations (create, update, delete)
**When** a mutation request fails with network error or 5xx status
**Then** TanStack Query retries the request automatically
**And** the first retry happens after 1 second
**And** the second retry happens after 2 seconds (exponential backoff)
**And** the third retry happens after 4 seconds
**And** a maximum of 3 retry attempts are made

**Given** a create task request fails on first attempt but succeeds on second retry
**When** the retry completes successfully
**Then** the task remains in the UI (optimistic update already applied)
**And** the temporary ID is replaced with the real server ID
**And** no error message is shown to the user (silent success)

**Given** all 3 retry attempts fail
**When** the final retry fails
**Then** TanStack Query triggers the `onError` callback
**And** the optimistic update is rolled back (task removed from UI)
**And** an error toast appears to the user (see Story 5.2)

**Given** a GET request (fetch tasks) fails temporarily
**When** the retry logic executes
**Then** the query retries with the same exponential backoff pattern
**And** cached data remains displayed during retries (no flashing empty state)
**And** only after final failure does the error state appear

**Given** I'm on a flaky network connection
**When** I perform multiple actions rapidly (create 3 tasks, complete 2)
**Then** each mutation retries independently with its own backoff schedule
**And** successful retries don't block or interfere with other retries
**And** the UI remains responsive throughout

**Given** network connectivity is restored after temporary outage
**When** pending retries execute
**Then** all queued operations complete successfully
**And** the UI state syncs with the server
**And** no duplicate operations occur (idempotent retries)

### Story 5.2: Error Toast Component with Manual Retry

As a user,
I want clear error messages when operations fail permanently,
So that I understand what went wrong and can manually retry if needed.

**Acceptance Criteria:**

**Given** a task creation fails after all retries
**When** the error is surfaced
**Then** a Material-UI Snackbar appears at the bottom center of the screen
**And** the toast contains error message: "Failed to create task. Try again?"
**And** the toast includes a "Retry" button
**And** the toast auto-dismisses after 6 seconds if not interacted with

**Given** the error toast is displayed
**When** I tap the "Retry" button
**Then** the failed mutation is re-attempted immediately
**And** the toast disappears
**And** the same optimistic UI update occurs again
**And** the retry follows the same retry logic (3 attempts with backoff)

**Given** the error toast is displayed
**When** I tap the dismiss "X" button or wait 6 seconds
**Then** the toast fades out and disappears
**And** no retry occurs
**And** the optimistic update remains rolled back

**Given** a task completion fails after all retries
**When** the error toast appears
**Then** the message reads: "Failed to complete task. Try again?"
**And** the task has reverted to active state in the UI (undo optimistic update)

**Given** a task deletion fails after all retries
**When** the error toast appears
**Then** the message reads: "Failed to delete task. Try again?"
**And** the task has reappeared in the UI (undo optimistic delete)

**Given** multiple operations fail simultaneously
**When** errors surface
**Then** error toasts stack vertically (max 3 visible at once)
**And** older toasts dismiss automatically to make room for newer ones
**And** each toast has its own "Retry" button for the specific failed operation

**Given** a network error occurs (no internet connection)
**When** the error toast appears
**Then** the message reads: "No internet connection. Check your network."
**And** no "Retry" button appears (retry won't help without connection)
**And** the toast persists until dismissed manually (no auto-dismiss)

### Story 5.3: Offline Detection and Queue Management

As a user,
I want to continue using the app when offline,
So that I can capture tasks during network outages and have them sync when connectivity returns.

**Acceptance Criteria:**

**Given** the app detects no internet connection (navigator.onLine = false)
**When** the offline state is detected
**Then** a subtle banner appears at the top: "You're offline. Changes will sync when connected."
**And** the banner uses a neutral color (not error red)
**And** the banner does not block content or require dismissal

**Given** I'm offline
**When** I create a new task
**Then** the task appears in the UI immediately (optimistic update)
**And** the task is stored locally (TanStack Query cache or IndexedDB)
**And** no network request is made (request queued for later)
**And** no error toast appears

**Given** I'm offline and have created 3 tasks
**When** network connectivity is restored (navigator.onLine = true)
**Then** the offline banner updates to: "Back online. Syncing changes..."
**And** all 3 queued create requests execute in order
**And** temporary IDs are replaced with real server IDs as responses arrive
**And** the banner disappears after all operations sync successfully

**Given** I'm offline and complete a task
**When** the completion action occurs
**Then** the task moves to completed section immediately (optimistic UI)
**And** the update request is queued for when connectivity returns
**And** no error toast appears

**Given** I'm offline for an extended period (5+ minutes)
**When** I refresh the page or close/reopen the app
**Then** queued operations persist (via TanStack Query cache or IndexedDB)
**And** operations sync when the app reopens with connectivity
**And** no data is lost

**Given** a queued operation fails when synced after coming back online
**When** the sync attempt fails after retries
**Then** an error toast appears: "Failed to sync offline changes. Try again?"
**And** the failed operation remains queued for manual retry

### Story 5.4: Network Error Handling in Backend with Comprehensive Logging

As a developer,
I want comprehensive error logging for all backend errors,
So that I can diagnose and fix production issues quickly.

**Acceptance Criteria:**

**Given** a client sends a malformed request (invalid JSON, missing required fields)
**When** the request is processed
**Then** Fastify responds with 400 Bad Request
**And** Pino logs the error at WARN level with request body and validation errors
**And** the response includes a clear error message indicating what's wrong
**And** the response does NOT include sensitive data (stack traces, database details)

**Given** a database query fails (connection timeout, constraint violation)
**When** the error occurs
**Then** Fastify responds with 500 Internal Server Error
**And** Pino logs the error at ERROR level with full stack trace, query details, and request context
**And** the response includes a generic message: "Internal server error"
**And** a unique request ID is included in both logs and response for correlation

**Given** a request exceeds timeout threshold (e.g., 10 seconds)
**When** the timeout occurs
**Then** Fastify responds with 504 Gateway Timeout
**And** Pino logs the timeout with request details and duration
**And** the database connection is properly cleaned up (no connection leaks)

**Given** an unhandled exception occurs in route handler
**When** the exception bubbles up
**Then** Fastify's centralized error handler catches it
**And** Pino logs the error at ERROR level with full context
**And** the response is 500 Internal Server Error with generic message
**And** the server does NOT crash (exception is caught and handled)

**Given** I review production logs after an incident
**When** I search logs by request ID
**Then** I can see the full request/response lifecycle for that request
**And** all related log entries include the request ID for correlation
**And** timestamps use ISO 8601 format with timezone information
**And** structured JSON logs include all relevant metadata (method, URL, status code, duration, error)

**Given** the app is running in development environment
**When** errors are logged
**Then** logs use pretty-print format with colors for readability
**And** stack traces are fully expanded

**Given** the app is running in production environment
**When** errors are logged
**Then** logs use JSON format for machine parsing
**And** log level is INFO or higher (no DEBUG logs in production)
**And** sensitive data is redacted from logs (passwords, tokens, PII)

## Epic 6: Accessibility & Inclusive Design

Enable users with disabilities to navigate, create, complete, and delete tasks using keyboard, screen readers, and assistive technologies with WCAG 2.1 AA compliance, semantic HTML, ARIA labels, keyboard navigation, focus management, and screen reader announcements.

### Story 6.1: Semantic HTML Structure with Landmarks and Headings

As a screen reader user,
I want the app to use semantic HTML with proper landmarks and heading hierarchy,
So that I can navigate the page structure efficiently and understand content organization.

**Acceptance Criteria:**

**Given** I load the app with a screen reader (NVDA, JAWS, VoiceOver)
**When** I navigate by landmarks
**Then** the page includes `<main>` landmark containing the task list
**And** the page includes `<header>` landmark if app header exists
**And** the FAB is within a landmark or has `role="navigation"` if needed

**Given** the task list is rendered
**When** I navigate by headings (H key in screen readers)
**Then** date group headers use `<h2>` elements ("Today", "Yesterday", "This Week", "Older")
**And** the completed section header uses `<h2>` element ("Completed (N)")
**And** headings follow logical hierarchy (no skipped levels like h1 → h3)
**And** the main app title uses `<h1>` (single h1 per page)

**Given** the task list contains multiple tasks
**When** I inspect the HTML structure
**Then** the task list uses `<ul>` (unordered list) element
**And** each task is a `<li>` (list item) element
**And** screen readers announce "List, N items" when entering the task list

**Given** I use a screen reader
**When** I navigate to the add task dialog
**Then** the dialog uses `<dialog>` element or `role="dialog"` on a `<div>`
**And** the dialog has `aria-labelledby` pointing to the dialog title
**And** the dialog has `aria-modal="true"` to indicate modal behavior

**Given** I inspect the HTML with accessibility tools
**When** I check for semantic correctness
**Then** interactive elements use `<button>` elements (not `<div>` with click handlers)
**And** form inputs use `<input>`, `<textarea>` with proper `<label>` associations
**And** no generic `<div>` or `<span>` elements are used where semantic HTML exists

### Story 6.2: Comprehensive Keyboard Navigation Support

As a keyboard-only user,
I want to navigate and interact with all features using only my keyboard,
So that I can use the app without a mouse or touch screen.

**Acceptance Criteria:**

**Given** I load the app
**When** I press Tab key
**Then** focus moves to the first interactive element (likely the FAB)
**And** focus indicator is visible (2px blue outline with 2px offset)
**And** focus order follows logical reading order (top to bottom, left to right)

**Given** the task list is visible
**When** I press Tab repeatedly
**Then** focus cycles through all interactive elements: FAB, task cards, completed section header, clear completed button, delete buttons
**And** focus skips non-interactive elements (date headers, empty state text)
**And** focus never gets trapped (I can Tab through entire page)

**Given** focus is on the FAB
**When** I press Enter or Space
**Then** the add task dialog opens
**And** focus automatically moves to the text input field inside the dialog
**And** the dialog receives focus trap (Tab cycles only within dialog elements)

**Given** the add task dialog is open
**When** I type task text and press Enter
**Then** the task is created and the dialog closes
**And** focus returns to the FAB (where it was before opening dialog)

**Given** the add task dialog is open
**When** I press Escape key
**Then** the dialog closes without creating a task
**And** focus returns to the FAB

**Given** focus is on a task card
**When** I press Enter or Space
**Then** the task toggles completion status (active ↔ completed)
**And** focus remains on the same task card after state change

**Given** focus is on a task card
**When** I press Delete key
**Then** the delete confirmation dialog opens
**And** focus moves to the "Delete" button in the confirmation dialog

**Given** the completed section is collapsed
**When** I Tab to the completed section header and press Enter or Space
**Then** the section expands
**And** focus remains on the section header (not moved to first task)

**Given** I navigate through the page
**When** I use Tab (forward) and Shift+Tab (backward)
**Then** focus moves in logical order in both directions
**And** focus wraps from last element back to first element when pressing Tab at the end

### Story 6.3: ARIA Labels and Live Regions for Screen Reader Feedback

As a screen reader user,
I want descriptive labels and dynamic announcements for all interactive elements,
So that I understand what each element does and am notified of state changes.

**Acceptance Criteria:**

**Given** I navigate to the FAB with a screen reader
**When** focus lands on the FAB
**Then** the screen reader announces: "Add new task, button"
**And** the FAB has `aria-label="Add new task"`

**Given** I navigate to a task card with a screen reader
**When** focus lands on the task
**Then** the screen reader announces: "Review Sarah's PR, active task, button" (or similar)
**And** the task card has `aria-label` or accessible text that includes task text and status

**Given** a task is in completed state
**When** I navigate to the task with a screen reader
**Then** the screen reader announces the task as completed (e.g., "Review Sarah's PR, completed, button")
**And** the task has `aria-checked="true"` or similar state indicator

**Given** I create a new task
**When** the task appears in the list
**Then** an ARIA live region announces: "Task added: Review Sarah's PR"
**And** the live region uses `aria-live="polite"` (doesn't interrupt current announcements)
**And** the live region uses `role="status"` for non-critical updates

**Given** I complete a task
**When** the task moves to the completed section
**Then** an ARIA live region announces: "Task completed: Review Sarah's PR"
**And** the announcement happens immediately (polite interruption)

**Given** I delete a task
**When** the task is removed from the list
**Then** an ARIA live region announces: "Task deleted: Review Sarah's PR"

**Given** I clear all completed tasks
**When** the bulk delete completes
**Then** an ARIA live region announces: "12 tasks cleared" (includes count)

**Given** a network error occurs and error toast appears
**When** the toast is displayed
**Then** an ARIA live region announces the error message: "Failed to create task. Try again?"
**And** the live region uses `aria-live="assertive"` for errors (interrupts for important messages)
**And** the toast has `role="alert"` for critical notifications

**Given** the completed section header shows a count badge
**When** I navigate to the header
**Then** the screen reader announces: "Completed, 8 tasks, button, collapsed" (or "expanded")
**And** the header has `aria-expanded="false"` (or "true") to indicate state

**Given** date group headers are rendered
**When** I navigate to a date header
**Then** the screen reader announces the header text: "Today, heading level 2"
**And** the header is non-interactive (no focus, not in Tab order)

### Story 6.4: Focus Management for Dialogs and Dynamic Content

As a keyboard user,
I want focus to move logically when dialogs open/close and content changes,
So that I don't lose my place or have to navigate from the top of the page.

**Acceptance Criteria:**

**Given** I open the add task dialog by clicking the FAB
**When** the dialog opens
**Then** focus automatically moves to the text input field inside the dialog
**And** the input field has `autofocus` attribute or receives focus programmatically
**And** background content becomes inert (cannot be focused or interacted with)

**Given** the add task dialog is open
**When** I press Tab
**Then** focus cycles only within the dialog: input field → "Add Task" button → "Cancel" button → back to input field
**And** Tab does not move focus outside the dialog (focus trap implemented)
**And** Shift+Tab cycles backward through dialog elements

**Given** I submit a task and the dialog closes
**When** the dialog closes
**Then** focus returns to the FAB (the element that opened the dialog)
**And** the new task is visible in the list but does not steal focus

**Given** I cancel the dialog by pressing Escape or clicking "Cancel"
**When** the dialog closes
**Then** focus returns to the FAB
**And** no task is created

**Given** I delete a task and the confirmation dialog opens
**When** the delete confirmation dialog appears
**Then** focus moves to the primary action button ("Delete" button)
**And** the dialog implements focus trap (Tab cycles only within dialog)

**Given** I confirm deletion and the dialog closes
**When** the task is removed
**Then** focus moves to the next task in the list
**And** if no next task exists, focus moves to the previous task
**And** if no tasks remain, focus moves to the FAB

**Given** I expand the completed section
**When** the section opens
**Then** focus remains on the section header (does not auto-move to first completed task)
**And** I can Tab to navigate into the completed tasks if desired

**Given** I collapse the completed section
**When** the section closes
**Then** focus remains on the section header
**And** completed tasks become non-focusable (removed from Tab order)

**Given** I clear all completed tasks
**When** the bulk delete completes
**Then** focus moves to the next interactive element (likely the last active task or the FAB)
**And** the completed section header disappears (no longer focusable)

**Given** an error toast appears
**When** the toast is displayed
**Then** focus does NOT move to the toast automatically (non-modal notification)
**And** the toast is reachable by Tab if I choose to navigate to it
**And** the "Retry" button is focusable and operable via keyboard

### Story 6.5: Color Contrast Compliance and Visual Accessibility (WCAG 2.1 AA)

As a user with low vision or color blindness,
I want all text and interactive elements to have sufficient color contrast,
So that I can read and interact with the app without strain.

**Acceptance Criteria:**

**Given** I view the app
**When** I inspect color contrast ratios
**Then** all normal text (16px and smaller) has minimum 4.5:1 contrast ratio against background
**And** all large text (18px+ or 14px+ bold) has minimum 3:1 contrast ratio against background

**Given** task text is displayed
**When** I check contrast with automated tools (Axe, WAVE)
**Then** active task text (Gray 900 on White) has 16.1:1 contrast ratio (exceeds 4.5:1 minimum)
**And** timestamp text (Gray 700 on White) has 8.3:1 contrast ratio (exceeds 4.5:1 minimum)
**And** completed task text (60% opacity) still maintains minimum 4.5:1 contrast

**Given** the FAB is displayed
**When** I check the blue accent color (#2196F3)
**Then** the white "+" icon on blue background has minimum 4.5:1 contrast
**And** the FAB meets WCAG AA standards for interactive elements

**Given** error toast messages appear
**When** I check the error red color (#F44336)
**Then** error text on white background has 4.5:1 contrast ratio
**And** error messages are readable for users with red-green color blindness

**Given** focus indicators appear on interactive elements
**When** I Tab through the interface
**Then** the focus outline (2px blue) has 4.5:1 contrast against the background
**And** the focus indicator is visible on all interactive elements (FAB, task cards, buttons)
**And** the focus indicator does not rely solely on color (includes visible outline shape)

**Given** I enable Windows High Contrast Mode or similar accessibility features
**When** I view the app
**Then** all text remains visible and readable
**And** interactive elements remain distinguishable
**And** focus indicators adapt to high contrast theme

**Given** date group headers use different font weights for hierarchy
**When** I view headers ("Today" is bold, "Older" is regular)
**Then** hierarchy is distinguishable by font weight, not just color
**And** no information is conveyed by color alone (complies with WCAG 1.4.1)

**Given** I have `prefers-reduced-motion` enabled in my browser
**When** I interact with tasks (create, complete, delete)
**Then** animations are disabled or significantly reduced
**And** state changes are instant (strikethrough, appearance) without motion
**And** functionality remains fully accessible without animations

**Given** I zoom the page to 200% (WCAG 1.4.4 requirement)
**When** I view the app at increased zoom levels
**Then** all content remains visible and functional
**And** text does not overlap or become cut off
**And** horizontal scrolling is not required for reading lines of text
**And** touch targets remain accessible and properly sized
