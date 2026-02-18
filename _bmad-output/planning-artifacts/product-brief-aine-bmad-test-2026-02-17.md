---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['PRD - Todo App (provided in conversation)']
date: 2026-02-17
author: Pregno
---

# Product Brief: aine-bmad-test

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

**aine-bmad-test** is a mobile-first web application for rapid task capture and chronological tracking, optimized for professionals who need to capture action items during meetings without breaking focus. 

The application solves a specific failure mode in existing productivity tools: they demand too much interaction when speed matters most. By focusing exclusively on instant capture, chronological organization, and satisfying completion tracking, it eliminates the cognitive overhead that makes users abandon complex systems.

Built as a containerized web app with optimistic UI and network resilience, it handles the reality of mobile usage—spotty connections, one-handed typing, and accumulating tasks that need clarity without forced organization. Tasks sort newest-first with visible timestamps, completed items move below active work (crossed out for satisfaction), and users control when to clear completed tasks.

The technical foundation prioritizes reliability and maintainability: Docker Compose deployment, comprehensive testing, graceful error handling, and clean architecture that can evolve (authentication, collaboration) without rebuilding. No authentication in v1 keeps scope tight for immediate personal use.

Success is measured by daily usage without friction: capture tasks mid-meeting in under 5 seconds, maintain clarity across 20-100 accumulated items, and trust the system won't lose data.

---

## Core Vision

### Problem Statement

Professionals in meetings need to capture action items instantly—someone assigns a task mid-conversation, and you have 5 seconds to record it before the discussion moves on. Existing solutions fail this moment:

- **Complex Todo Apps** (Todoist, Things, Asana): Require choosing projects, setting priorities, or picking due dates—too much friction when you just need to capture "Follow up on client proposal" and return attention to the speaker
- **Notes Apps** (Apple Notes, Google Keep): Fast capture but lack task-specific features—no completion tracking, no separation of active vs. done, everything mixed together
- **Desktop-First Tools**: Optimized for keyboard and mouse, clunky on mobile when you're typing one-handed while holding coffee

The deeper problem emerges over time: tasks accumulate across days and weeks. Without forced prioritization or due dates, how do you maintain clarity about what's urgent vs. stale? Most tools either impose organizational overhead (manual sorting, categorization) or devolve into chaos (flat unsorted lists).

### Problem Impact

This friction creates three failure modes:

1. **Capture Abandonment**: People stop using the tool mid-meeting because it's too slow, losing track of commitments made verbally
2. **List Chaos**: Tasks accumulate without structure, creating an anxiety-inducing wall of undifferentiated items
3. **System Maintenance Overhead**: Time spent organizing the task system exceeds time spent completing tasks

The result: professionals either rely on memory (risky), paper notes (lost or forgotten), or over-engineered systems they eventually abandon. The gap is a tool that respects the capture moment AND handles accumulation gracefully.

### Why Existing Solutions Fall Short

The todo app market has optimized for the wrong metrics:

- **Feature Competition**: Apps add priorities, tags, projects, collaboration to differentiate—creating complexity users don't need
- **Desktop Heritage**: Most tools originated on desktop and adapted to mobile as an afterthought—interactions optimized for mouse, not thumb
- **Organization Philosophy Enforcement**: Apps impose GTD, Eisenhower Matrix, or other methodologies rather than adapting to how users naturally think

**The missing position**: A tool optimized for speed-of-capture and chronological clarity, assuming users are smart enough to recognize urgent vs. stale tasks without imposed categorization.

Additionally, no existing solution handles the network reality of mobile usage well—slow connections or offline moments create blocking delays or lost tasks rather than optimistic UI that syncs when possible.

### Proposed Solution

**aine-bmad-test** is a mobile-first web application for meeting-driven task capture:

**Core User Experience:**
- Open app → see active tasks newest-first with timestamps
- Tap floating action button → type task → save (< 5 seconds total)
- Tap task → marks complete, crosses out, slides below active list
- Swipe task → delete
- "Clear Completed" action → removes all crossed-out tasks when list gets cluttered
- Chronological sorting by creation date—newest always at top

**Technical Foundation:**
- Responsive web app (works on phone browser and desktop)
- Material Design UI patterns (familiar, thumb-friendly)
- Optimistic UI—tasks appear instantly, API syncs in background
- Network resilience—offline tasks queue and sync when connection returns
- Docker Compose deployment (runs locally or deploys anywhere)
- Comprehensive testing (unit, integration, E2E)
- No authentication in v1 (personal use, trusted environment)

**Design Constraints:**
- Handles 20-100 accumulated tasks without performance issues
- Single-page app, minimal loading states
- Mobile-first but fully functional on desktop
- Data persists across browser sessions and devices
- Active tasks remain until explicitly completed or deleted
- Completed tasks auto-delete 24 hours after completion (silent, background; not configurable)

### Key Differentiators

1. **Meeting-Optimized Capture**: Designed for the 5-second interaction mid-conversation—minimal taps, mobile keyboard optimization, instant feedback

2. **Chronological Organization**: Newest-first with visible timestamps eliminates need for manual prioritization while maintaining clarity about task age

3. **Accumulation-Aware UX**: Handles realistic task volume (20-100 items) with crossed-out completion pattern that provides satisfaction without clutter

4. **Network-Resilient Architecture**: Optimistic UI means slow connections don't block productivity—tasks save locally, sync when possible

5. **Completion Satisfaction**: Crossed-out tasks stay visible in the completed section — you can manually clear them, or they auto-delete after 24 hours. Either way, the crossed-out record is visible for the rest of the day, honoring the psychological reward of "done"

6. **Deployment Flexibility**: Docker Compose runs on laptop for development, deploys to any cloud/VPS/self-hosted environment with same configuration

7. **Clean Architecture Foundation**: Built for reliability and maintainability—proper separation of concerns, comprehensive tests, documented decisions—can evolve to add authentication or multi-user without rebuilding

**The Unfair Advantage**: We solve the capture moment and the accumulation problem simultaneously through chronological clarity, while competitors either optimize for capture (but devolve into chaos) or organization (but create friction at capture).

---

## Target Users

### Primary User

**Persona: Pregno, Tech Lead**

**Role & Context:**  
Tech Lead at a consulting company managing a delivery team of 3 developers. Operates at the intersection of technical execution, team coordination, and client relationship management. Daily schedule includes internal team syncs, client calls, planning sessions, and strategic discussions—all generating action items that need rapid capture and reliable follow-through.

**Current Problem:**  
During meetings, action items emerge from multiple directions: clients request follow-ups, team members need unblocking, stakeholders ask for status updates. Existing todo apps require too many interactions (choosing projects, setting priorities, picking due dates) when focus needs to stay on the conversation. Mental tracking fails by end of day when trying to recall which commitments were made in which meetings. Tasks accumulate throughout the week—urgent client deliverables mixed with lower-priority team improvements—creating a need for chronological clarity without imposed organization systems.

**Key Characteristics:**
- **High meeting density**: 3-5 meetings daily across internal team, clients, and planning sessions
- **Context switching**: Moves between technical discussions, client communication, and team leadership
- **Accountability-focused**: Commitments made verbally in meetings must be tracked and completed
- **Mobile-first reality**: Phone is the capture device during meetings (one-handed typing while holding coffee)
- **Accumulated task volume**: 20-100 items across days/weeks requiring clarity about age and relevance

**Success Criteria:**
- Capture action items in under 5 seconds without breaking meeting focus
- Post-meeting review shows all commitments at a glance
- Chronological organization provides natural urgency cues (today's items at top)
- Completing tasks feels satisfying (visible crossed-out progress)
- Zero anxiety about forgotten commitments
- System requires no maintenance overhead—just capture and complete

**Motivations:**
- **Reliability**: Never drop a commitment made to client or team
- **Speed**: Don't let the tool slow down the capture moment
- **Clarity**: Distinguish fresh action items from week-old tasks without manual sorting
- **Simplicity**: Avoid productivity theater—just remember and complete tasks

### Secondary Users

**N/A for v1** - This is a personal tool without authentication. Future versions may introduce team collaboration features, but initial release is single-user focused.

### User Journey

**Discovery & Onboarding:**
- **Trigger**: Frustration with existing tools (too slow during meetings) or dropped commitments from mental tracking
- **First Use**: Opens web app on phone → sees empty list with floating action button → immediately understands the interaction model (Material Design familiarity)
- **Onboarding**: Zero required—UI is self-explanatory through standard patterns

**Daily Usage Pattern:**

**Morning (9 AM - Team Standup):**
1. Team discusses yesterday's progress and today's blockers
2. Action items emerge: "Pregno, can you review Sarah's PR?" "Update the sprint board with new tasks"
3. Pulls out phone mid-meeting → taps floating + button → types "Review Sarah's PR" → saves (3 seconds)
4. Captures second item the same way
5. Returns phone to pocket, refocuses on standup

**Mid-Morning (11 AM - Client Call):**
1. Client discusses project status and requests follow-ups
2. Multiple action items: "Send updated architecture diagram," "Confirm deployment timeline," "Schedule security review"
3. Rapid capture: tap, type, save × 4 items (under 20 seconds total)
4. Tasks appear at top of list with current timestamp
5. Meeting continues without disruption

**Between Meetings (12 PM):**
1. Opens app on desktop (same web URL)
2. Reviews list: 6 new items from this morning, 8 older items from previous days
3. Completes quick win: taps "Update sprint board" → crosses out, slides below active tasks
4. Satisfaction moment: sees progress (1 completed today)

**Afternoon (3 PM - Planning Session):**
1. Strategic discussion generates longer-term items
2. Captures: "Research new framework options," "Draft Q2 technical roadmap"
3. These mix with urgent client items—chronological sorting keeps today's captures visible at top

**End of Day (6 PM - Review):**
1. Opens app, scrolls through active list
2. Completes 3-4 items from today → taps each, watches them cross out and move below
3. Sees 10 active items remaining (mix of today + previous days)
4. Older items naturally sink to bottom—mental triage happens through timestamp visibility
5. Decides not to "Clear Completed" yet—wants to see today's accomplishments

**Weekly Pattern:**
- **Monday-Friday**: Accumulates 5-10 new tasks daily, completes 3-7 daily
- **Friday afternoon**: Reviews full list, completes stragglers, uses "Clear Completed" to reset for next week
- **Steady state**: 20-40 active tasks, fresh ones always visible at top

**Success Moments:**

- **"Aha!" Moment (Day 1)**: First time capturing task mid-meeting in under 5 seconds without losing conversation thread
- **Trust Building (Week 1)**: Realizes tasks persist across devices and sessions—no data loss anxiety
- **Habit Formation (Week 2)**: Automatically pulls out phone when action item emerges—tool becomes invisible part of workflow
- **Long-term Value (Month 1)**: Completes client request, scrolls back through completed items, confirms exact wording from original meeting capture

**Failure Modes to Avoid:**
- Slow load times → abandonment during meeting
- Network errors losing tasks → trust erosion
- Completed items disappearing immediately → loss of satisfaction/progress visibility
- Manual organization required → system maintenance overhead returns

---

## Success Metrics

### User Success Metrics

**Primary Success Indicator: Tool Adoption & Daily Use**

Success is measured by consistent daily usage replacing existing task management methods. The tool must become the default capture mechanism for meeting-driven action items, indicating trust in reliability and satisfaction with user experience.

**Usage Pattern Targets:**

- **Task Capture Rate**: 4-9 tasks per day (2-3 items per meeting × 2-3 meetings daily)
- **Completion Velocity**: Tasks completed within 3 days of creation
- **Tool Adoption**: Complete replacement of current task management method within 2 weeks
- **Long-term Engagement**: Continued daily use beyond initial month

**Reliability Thresholds (Non-negotiable):**

- **Zero data loss**: All captured tasks persist across sessions, devices, and container restarts
- **Zero crashes**: Application remains stable during normal operation (no runtime errors)
- **Zero blocking errors**: Network failures or edge cases handled gracefully without disrupting user flow
- **Performance baseline**: Application starts without issues, loads instantly on subsequent visits

**Behavior Indicators of Success:**

- **Week 1**: Tool used alongside existing method (validation phase)
- **Week 2**: Existing method abandoned completely (adoption achieved)
- **Month 1+**: Daily usage pattern sustained without conscious effort (habit formed)

**User Experience Success Criteria:**

- **Capture speed**: 5-second flow from "action item mentioned" to "task saved" achieved consistently
- **Cross-device reliability**: Same data visible on phone and desktop without sync issues
- **Completion satisfaction**: Crossed-out tasks provide visible progress and accomplishment feedback
- **Cognitive clarity**: Chronological sorting with timestamps maintains distinction between fresh and aged tasks without manual organization

### Technical Success Metrics

**Delivery Success Criteria:**

- **Deployment**: Application running via Docker Compose in local development environment
- **Accessibility**: Accessible from both mobile browser and desktop browser on local network
- **Test Coverage**: Minimum 80% code coverage with all critical user paths covered
- **Test Status**: 100% test pass rate across unit, integration, and E2E test suites
- **Architecture Quality**: Clean separation of concerns (frontend, backend, database layers)

**Technology Stack:**

- **Backend**: Node.js with TypeScript
- **Frontend**: TypeScript (no Next.js constraint)
- **Database**: PostgreSQL
- **Containerization**: Docker Compose with service definitions for frontend, backend, database
- **Testing**: Comprehensive coverage across layers (unit, integration, E2E)

**Quality Gates:**

- **Code Quality**: TypeScript strict mode, linting configured, no type errors
- **Test Quality**: All tests pass before deployment, critical paths have E2E coverage
- **Performance**: Initial load under 2 seconds, task operations feel instant (optimistic UI)
- **Error Handling**: Graceful degradation for network failures, database errors, edge cases

**Critical Path Coverage (Must Have E2E Tests):**

1. Add task (capture flow)
2. Complete task (mark done, visual feedback, move to completed section)
3. Delete task
4. Clear completed tasks
5. Data persistence across browser refresh
6. Cross-device data consistency (same tasks visible on phone and desktop)

### Success Validation Timeline

**Week 1 - Technical Validation:**
- Docker Compose runs successfully on local environment
- All tests passing (unit + integration + E2E)
- Application accessible from phone and desktop browsers
- Core CRUD operations functional and tested

**Week 2 - Usage Validation:**
- Daily task capture achieved (4-9 tasks/day)
- Zero data loss incidents
- Zero crashes or blocking errors
- Tool used alongside existing method (parallel validation)

**Week 3-4 - Adoption Validation:**
- Existing task management method abandoned completely
- Daily usage pattern established
- Task completion velocity within 3-day target
- User confidence in reliability established

**Month 2+ - Sustained Success:**
- Continued daily usage without friction
- Task volume remains manageable (20-100 active tasks)
- Completion rate stays healthy (most tasks resolved within 3 days)
- No reliability regression (zero data loss, zero crashes maintained)

### Definition of "Working App"

The application is considered **working** when:

1. **Functional**: All core operations (add, complete, delete, clear completed) work correctly
2. **Reliable**: Zero data loss, zero crashes, graceful error handling for edge cases
3. **Tested**: 80%+ code coverage, 100% test pass rate, critical paths covered by E2E tests
4. **Deployed**: Running in Docker Compose, accessible from multiple devices
5. **Performant**: Starts without issues, operations feel instant via optimistic UI
6. **Adopted**: Daily usage achieved, existing methods replaced, habit formed

Success is binary: either the tool is trusted for daily use (and thus all criteria met), or it's not ready yet.

---

## MVP Scope

### Core Features

**Task Management Operations:**

1. **Create Task**
   - Floating action button (Material Design pattern)
   - Text input field for task description
   - Auto-capture creation timestamp
   - Save operation < 5 seconds total interaction time
   - Optimistic UI—task appears immediately, syncs in background

2. **View Tasks**
   - Active tasks displayed newest-first with creation timestamps
   - Completed tasks displayed below active tasks (crossed out)
   - Chronological sorting by creation date (no manual reordering)
   - Visible timestamps for both creation and completion
   - Responsive list view optimized for mobile and desktop

3. **Complete Task**
   - Tap task to mark complete
   - Visual feedback: cross out text, animate slide to completed section
   - Capture completion timestamp
   - Completed tasks remain visible below active list

4. **Delete Task**
   - Swipe gesture to delete task permanently
   - Confirmation prompt to prevent accidental deletion
   - Removes task from database (no undo in v1)

5. **Clear Completed Tasks**
   - Bulk action button to remove all completed tasks immediately
   - Provides clean slate when completed section gets cluttered
   - User-controlled bulk action available at any time

6. **Ephemeral Completed Task Cleanup**
   - Completed tasks automatically delete after 24 hours (hardcoded, not configurable)
   - Prevents completed list from growing indefinitely without manual maintenance
   - Silent background cleanup — no user notification when auto-delete runs
   - Complements the manual "Clear Completed" action; whichever happens first wins
   - Enforces a completion-first, forward-looking workflow (captures the "what's next" mindset)

**Data Persistence & Sync:**

6. **Cross-Session Persistence**
   - All tasks stored in PostgreSQL database
   - Data survives browser refresh, tab close, container restart
   - Named Docker volume ensures database persistence

7. **Cross-Device Consistency**
   - Same backend API accessible from phone and desktop browsers
   - Real-time data sync—tasks created on phone visible on desktop immediately
   - Single source of truth (PostgreSQL database)

**User Experience:**

8. **Mobile-First Responsive UI**
   - Material Design components and patterns
   - Thumb-friendly touch targets (minimum 48px)
   - One-handed mobile operation optimized
   - Fully functional on desktop (same responsive interface)

9. **Optimistic UI Pattern**
   - Instant feedback for all user actions (add, complete, delete)
   - Background API synchronization
   - Retry mechanism for failed network requests
   - Error toast notifications for sync failures

10. **Graceful State Handling**
    - Empty state: Clear call-to-action when no tasks exist
    - Loading state: Minimal spinner on initial load only
    - Error state: Network failures handled without crashing app
    - Offline queue: Tasks captured offline sync when connection returns

**Technical Infrastructure:**

11. **Docker Compose Multi-Environment Setup**
    - Development environment configuration
    - Test environment configuration
    - Environment-specific variables (database credentials, API URLs, ports)
    - Service definitions: frontend, backend, database
    - Named volumes for database persistence

12. **REST API**
    - CRUD endpoints for task operations
    - Proper HTTP methods (GET, POST, PUT, DELETE)
    - JSON request/response format
    - Error handling and validation
    - CORS configuration for cross-origin requests

13. **Comprehensive Test Coverage**
    - **Unit Tests**: Business logic, utilities, components (minimum 80% coverage)
    - **Integration Tests**: API endpoints, database operations
    - **E2E Tests**: Critical user paths (add task, complete task, delete task, clear completed, data persistence, cross-device sync)
    - 100% test pass rate required before deployment
    - Test environment configured in Docker Compose

14. **Technology Stack**
    - **Backend**: Node.js with TypeScript (strict mode)
    - **Frontend**: TypeScript with modern framework (React or similar)
    - **Database**: PostgreSQL
    - **Containerization**: Docker Compose
    - **Code Quality**: ESLint, Prettier, strict TypeScript configuration

### Out of Scope for MVP

The following features are explicitly **excluded** from v1 to maintain focus on core value delivery:

**Deferred to Future Versions:**

- ❌ **Configurable Retention Period** - The 24-hour completed task auto-delete window is hardcoded and not user-configurable in v1
- ❌ **Task Editing** - Tasks cannot be edited after creation; users must delete and re-add (acceptable workaround for v1)
- ❌ **Authentication & User Management** - No login, no user accounts, single-user only
- ❌ **Categories & Tags** - No organizational systems beyond chronological sorting
- ❌ **Priorities & Due Dates** - No imposed productivity methodology
- ❌ **Search & Filter** - Chronological list only (manageable for 20-100 task volume)
- ❌ **Notifications & Reminders** - No push notifications or deadline alerts
- ❌ **Collaboration & Sharing** - Personal tool only, no team features
- ❌ **Attachments & Rich Content** - Text-only task descriptions
- ❌ **Task Notes/Details** - Simple text field only, no expandable detail views
- ❌ **Recurring Tasks** - One-time tasks only
- ❌ **Bulk Operations** - No multi-select, no batch actions (except Clear Completed)
- ❌ **Data Export/Import** - No backup/restore functionality in v1
- ❌ **Public Deployment** - Local/home network only, no cloud hosting setup

**Rationale for Exclusions:**

These features would add complexity without addressing the core problem: rapid task capture and chronological clarity. Each deferred feature represents either:
- Organizational overhead that contradicts the "simplicity" value proposition
- Multi-user capabilities not needed for personal use case
- Polish features that don't impact core reliability or usability

### MVP Success Criteria

The MVP is considered **successful** when:

**Technical Success Gates:**

1. ✅ All core features implemented and functional (including 24-hour completed task cleanup)
2. ✅ Docker Compose runs in both dev and test environments
3. ✅ 80%+ test coverage with 100% test pass rate
4. ✅ Zero crashes or data loss during normal operation
5. ✅ Application accessible from phone and desktop browsers on local network

**User Adoption Success:**

1. ✅ Daily usage achieved within first week
2. ✅ Task capture rate matches expected volume (4-9 tasks/day)
3. ✅ Existing task management method abandoned (complete tool replacement)
4. ✅ Zero instances of lost tasks or reliability issues
5. ✅ Capture flow consistently under 5 seconds

**Go/No-Go Decision Point (Week 2):**

- **GO**: If daily usage sustained and zero reliability issues → Proceed with continued use, consider v2 enhancements
- **NO-GO**: If tool not used daily or reliability issues emerge → Revisit architecture or core UX assumptions

### Future Vision

**Version 2.0 Enhancements (Post-MVP):**

If v1 proves successful through sustained daily usage and zero reliability issues, future versions could introduce:

**Organizational Features:**
- **Categories/Tags**: Optional grouping for users who want light organization without forced methodology
- **Task Editing**: In-line editing of task text without delete/re-add workflow
- **Search/Filter**: Find specific tasks in larger lists (100+ items)

**Multi-User Capabilities:**
- **Authentication**: User accounts with secure login
- **Team Sharing**: Shared task lists for small teams
- **Collaboration**: Assign tasks to team members, track who completed what

**Advanced Functionality:**
- **Priorities**: Optional priority flags (low/medium/high) without forced usage
- **Due Dates**: Optional deadline tracking with calendar integration
- **Recurring Tasks**: Template tasks that regenerate on schedule
- **Notifications**: Optional reminders for tasks approaching deadlines
- **Data Export**: Backup functionality (CSV, JSON export)

**Platform Expansion:**
- **Native Mobile App**: PWA or native iOS/Android apps for better mobile experience
- **Desktop App**: Electron wrapper for offline-first desktop usage
- **Browser Extension**: Quick-capture from any web page
- **API Integrations**: Connect with calendars, email, project management tools

**Long-Term Vision (2-3 Years):**

If the product evolves beyond personal use, it could become a **team-focused task capture tool** that maintains simplicity while enabling lightweight collaboration:

- Small teams (3-10 people) share task lists
- Meeting-driven capture becomes team knowledge base
- Action items from meetings automatically tracked and assigned
- Integration with meeting tools (Zoom, Google Meet) for automatic task extraction
- Analytics: Team velocity, completion rates, commitment tracking

**Core Principle Maintained:**

All future enhancements must preserve the founding principle: **speed of capture and chronological clarity without productivity theater**. Any feature that adds friction to the 5-second capture flow or imposes organizational overhead will be rejected, regardless of market pressure.
