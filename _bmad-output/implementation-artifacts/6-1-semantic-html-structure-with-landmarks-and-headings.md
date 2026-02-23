# Story 6.1: Semantic HTML Structure with Landmarks and Headings

Status: backlog

## Story

As a screen reader user,
I want the app to use semantic HTML with proper landmarks and heading hierarchy,
So that I can navigate the page structure efficiently and understand content organization.

## Acceptance Criteria

**AC1 — Landmarks**
- **Given** I load the app with a screen reader (NVDA, JAWS, VoiceOver)
- **When** I navigate by landmarks
- **Then** the page includes `<main>` landmark containing the task list
- **And** the page includes `<header>` landmark if app header exists
- **And** the FAB is within a landmark or has `role="navigation"` if needed

**AC2 — Heading hierarchy**
- **Given** the task list is rendered
- **When** I navigate by headings (H key in screen readers)
- **Then** date group headers use `<h2>` elements ("Today", "Yesterday", etc.)
- **And** the completed section header uses `<h2>` ("Completed (N)")
- **And** headings follow logical hierarchy (no skipped levels)
- **And** the main app title uses `<h1>` (single h1 per page)

**AC3 — List structure**
- **Given** the task list contains multiple tasks
- **When** I inspect the HTML structure
- **Then** the task list uses `<ul>` (unordered list) element
- **And** each task is a `<li>` (list item) element
- **And** screen readers announce "List, N items" when entering the task list

**AC4 — Dialog semantics**
- **Given** I use a screen reader
- **When** I navigate to the add task dialog
- **Then** the dialog uses `<dialog>` or `role="dialog"` on a div
- **And** the dialog has `aria-labelledby` pointing to the dialog title
- **And** the dialog has `aria-modal="true"`

**AC5 — Interactive elements**
- **Given** I inspect the HTML with accessibility tools
- **When** I check for semantic correctness
- **Then** interactive elements use `<button>` (not div with click handlers)
- **And** form inputs use `<input>`/`<textarea>` with proper `<label>` associations

## Tasks / Subtasks

- [ ] **Task 1: Add main, header landmarks** (AC1)
- [ ] **Task 2: Add h1, h2 hierarchy** (AC2)
- [ ] **Task 3: Use ul/li for task list** (AC3)
- [ ] **Task 4: Add dialog semantics** (AC4)
- [ ] **Task 5: Add E2E axe/playwright a11y tests** (all ACs)

## Dev Notes

- Epic 6 Story 1; frontend semantic HTML.
- Use @axe-core/playwright or expect(locator).toHaveAttribute for assertions.
