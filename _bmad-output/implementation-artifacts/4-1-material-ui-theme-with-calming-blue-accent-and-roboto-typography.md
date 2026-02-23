# Story 4.1: Material-UI Theme with Calming Blue Accent and Roboto Typography

Status: backlog

## Story

As a user,
I want a visually calming interface with consistent typography,
So that the app feels professional and reduces visual stress during busy workdays.

## Acceptance Criteria

**AC1 — Primary and secondary colors**
- **Given** the Material-UI theme is configured
- **When** the app loads in any browser
- **Then** the primary color is #2196F3 (calming blue) applied to FAB, links, and interactive elements
- **And** the secondary color is a neutral gray for less prominent actions
- **And** Roboto font family is loaded and applied to all Typography components

**AC2 — Typography hierarchy**
- **Given** I view the app on any device
- **When** text is rendered
- **Then** all headings use Roboto font with appropriate weights (500 for emphasis, 400 for body)
- **And** body text uses 16px base size for readability on mobile
- **And** line height is 1.5 for comfortable reading

**AC3 — Color palette usage**
- **Given** the color palette is defined
- **When** I inspect the interface
- **Then** 95% of the interface uses monochrome colors (black, white, grays)
- **And** the blue accent (#2196F3) is used sparingly for primary actions and focus states
- **And** error states use standard Material-UI error red
- **And** success states use standard Material-UI success green

**AC4 — Spacing tokens**
- **Given** spacing tokens are configured
- **When** UI components are rendered
- **Then** all spacing uses 8px base unit increments (8px, 16px, 24px, etc.)
- **And** touch targets have minimum 48px height for thumb-friendly interaction
- **And** card padding is generous (16px mobile, 24px desktop)

**AC5 — Border radius**
- **Given** border radius is configured
- **When** cards and buttons are rendered
- **Then** corners use 8px border radius for a softer, modern feel
- **And** FAB uses 50% border radius (circular)

## Tasks / Subtasks

- [ ] **Task 1: Create MUI theme with calming blue and Roboto** (AC1, AC2, AC3)
- [ ] **Task 2: Configure spacing and touch targets** (AC4)
- [ ] **Task 3: Configure border radius** (AC5)
- [ ] **Task 4: Add theme unit/component tests** (all ACs)

## Dev Notes

- Epic 4 Story 1; no new API endpoints.
- Theme provider wraps app; tests can assert theme object or rendered styles.
