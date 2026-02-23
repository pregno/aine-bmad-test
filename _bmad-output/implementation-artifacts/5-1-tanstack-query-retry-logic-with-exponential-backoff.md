# Story 5.1: TanStack Query Retry Logic with Exponential Backoff

Status: backlog

## Story

As a user,
I want failed network requests to retry automatically in the background,
So that temporary network issues don't require my intervention.

## Acceptance Criteria

**AC1 — Retry configuration**
- **Given** TanStack Query is configured for mutations (create, update, delete)
- **When** a mutation request fails with network error or 5xx status
- **Then** TanStack Query retries the request automatically
- **And** the first retry happens after 1 second
- **And** the second retry happens after 2 seconds (exponential backoff)
- **And** the third retry happens after 4 seconds
- **And** a maximum of 3 retry attempts are made

**AC2 — Success on retry (silent)**
- **Given** a create task request fails on first attempt but succeeds on second retry
- **When** the retry completes successfully
- **Then** the task remains in the UI (optimistic update already applied)
- **And** the temporary ID is replaced with the real server ID
- **And** no error message is shown to the user (silent success)

**AC3 — Final failure (rollback + toast)**
- **Given** all 3 retry attempts fail
- **When** the final retry fails
- **Then** TanStack Query triggers the onError callback
- **And** the optimistic update is rolled back (task removed from UI)
- **And** an error toast appears (see Story 5.2)

**AC4 — GET retry + cache**
- **Given** a GET request (fetch tasks) fails temporarily
- **When** the retry logic executes
- **Then** the query retries with the same exponential backoff pattern
- **And** cached data remains displayed during retries (no flashing empty state)
- **And** only after final failure does the error state appear

**AC5 — Concurrent mutations**
- **Given** I'm on a flaky network connection
- **When** I perform multiple actions rapidly (create 3 tasks, complete 2)
- **Then** each mutation retries independently with its own backoff schedule
- **And** successful retries don't block or interfere with other retries

## Tasks / Subtasks

- [ ] **Task 1: Configure mutation retry (retry: 3, delay fn)** (AC1)
- [ ] **Task 2: Configure query retry for GET** (AC4)
- [ ] **Task 3: Verify temp ID replacement on retry success** (AC2)
- [ ] **Task 4: Add unit/E2E tests for fail→retry→success** (AC1–AC5)

## Dev Notes

- Epic 5 Story 1; frontend TanStack Query config.
- Use Playwright route interception for network fail simulation.
