# Story 4.2: Responsive Layout with Mobile-First Breakpoints

Status: backlog

## Story

As a user,
I want the interface to adapt seamlessly from mobile to desktop,
So that I have an optimal experience on any device without separate interfaces.

## Acceptance Criteria

**AC1 — Mobile (<600px)**
- **Given** I access the app on a mobile device (width < 600px)
- **When** the task list loads
- **Then** the content spans full viewport width with 16px horizontal padding
- **And** task cards stack vertically with 8px gaps
- **And** the FAB is positioned in bottom-right corner (16px from edges)
- **And** 6-8 tasks are visible without scrolling on average phone screen

**AC2 — Tablet (600px–900px)**
- **Given** I access the app on a tablet (width 600px–900px)
- **When** the task list loads
- **Then** the content area has max-width 600px and is centered
- **And** horizontal padding increases to 24px
- **And** task cards maintain full width of content area
- **And** 10-12 tasks are visible without scrolling

**AC3 — Desktop (>900px)**
- **Given** I access the app on desktop (width > 900px)
- **When** the task list loads
- **Then** the content area has max-width 600px and is horizontally centered
- **And** vertical space is maximized to show 20+ tasks without scrolling
- **And** the FAB remains in bottom-right of content area (not viewport edge)
- **And** hover states appear on interactive elements

**AC4 — Orientation change**
- **Given** I rotate my device from portrait to landscape
- **When** the orientation changes
- **Then** the layout re-flows automatically without page refresh
- **And** touch targets remain 48px minimum height

**AC5 — Breakpoint transitions**
- **Given** I resize my desktop browser window
- **When** the width crosses breakpoints (600px, 900px)
- **Then** the layout transitions smoothly without content jumping
- **And** all functionality remains accessible at every size

## Tasks / Subtasks

- [ ] **Task 1: Add MUI breakpoints (xs, sm, md)** (AC1–AC5)
- [ ] **Task 2: Implement responsive padding and max-width** (AC1–AC3)
- [ ] **Task 3: Add viewport meta and touch target min-height** (AC4)
- [ ] **Task 4: Add E2E viewport tests** (all ACs)

## Dev Notes

- Epic 4 Story 2; no new API endpoints.
- Use MUI Grid/Box with useMediaQuery or sx breakpoints.
