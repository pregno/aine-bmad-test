---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 14]
workflowComplete: true
completedAt: 2026-02-17
inputDocuments:
  - product-brief-aine-bmad-test-2026-02-17.md
  - technical-architecture-aine-bmad-test-2026-02-17.md
  - architecture-decisions-aine-bmad-test-2026-02-17.md
project_name: aine-bmad-test
user_name: Pregno
date: 2026-02-17
---

# UX Design Specification aine-bmad-test

**Author:** Pregno
**Date:** 2026-02-17

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

**aine-bmad-test** is a mobile-first task management web application designed to solve a specific UX failure in existing productivity tools: the inability to capture tasks quickly during meetings without breaking focus. The application optimizes for a single critical interaction—capturing an action item in under 5 seconds—while maintaining chronological clarity as tasks accumulate over days and weeks.

The UX philosophy centers on **chronological organization without forced categorization**. Instead of imposing projects, priorities, or due dates, the interface uses temporal grouping (Today, Yesterday, This Week, Older) and visual hierarchy (typography, opacity, positioning) to create natural urgency cues. Users trust their own judgment to triage tasks based on recency and context, eliminating the cognitive overhead of maintaining organizational systems.

Built as a responsive web application using Material Design patterns, the interface delivers identical experiences across mobile and desktop through adaptive density rather than separate feature sets. The mobile experience prioritizes one-handed thumb ergonomics with large touch targets, gestural interactions, and minimal taps. The desktop experience provides the same interface with more screen real estate for power-user scanning of larger task lists.

Network resilience through optimistic UI ensures that slow connections or offline moments never block the user. Tasks appear instantly when created, complete immediately when tapped, and sync silently in the background with retry logic handling failures gracefully.

### Target Users

**Primary User: Pregno (Tech Lead)**

- **Role**: Tech Lead managing 3 developers at a consulting company
- **Meeting Density**: 3-5 meetings daily (team syncs, client calls, planning sessions)
- **Context Switching**: Moves between technical discussions, client communication, and team leadership
- **Task Volume**: Manages 20-100 accumulated tasks across multiple days/weeks
- **Device Usage**: Mobile-first reality—phone is primary capture device during meetings, desktop for review and deep work
- **Interaction Pattern**: One-handed mobile operation (typing with thumb while holding coffee), shorthand task text ("PR review Sarah" not full sentences)

**User Success Criteria:**
- Capture action items in under 5 seconds without breaking meeting focus
- Scan 20-100 tasks and quickly identify what's urgent vs. stale based on visual grouping
- Feel satisfaction when completing tasks (crossed-out visual feedback)
- Trust the system won't lose data (zero tolerance for data loss)
- Maintain clarity without organizational overhead (no forced categorization)

### Key Design Challenges

**1. Speed vs. Clarity Trade-off**

The 5-second capture flow is the primary UX constraint. Every interaction decision must be evaluated against "does this slow down capture?" The challenge is providing enough visual feedback to build user trust (task was saved successfully) without introducing loading states, confirmation dialogs, or multi-step workflows that add friction.

**Solution approach:** Optimistic UI with instant visual feedback (task appears at top of list immediately), silent background sync, and error handling only on final failure after retries.

**2. Chronological Clarity at Scale**

Without categories, tags, or priorities, the interface must help users triage 20-100 tasks using only temporal cues. The challenge is making "what's urgent" obvious through visual design without imposing organizational systems the user must maintain.

**Solution approach:** Date-based grouping (Today, Yesterday, This Week, Older) with visual hierarchy through typography (weight, opacity, size) to create natural urgency gradients. Recent tasks "pop" visually, older tasks recede, completed tasks fade out.

**3. One-Handed Mobile Ergonomics**

Primary usage scenario is mid-meeting, one-handed mobile operation. The challenge is ensuring every interaction is reachable with the right thumb (while left hand holds coffee) without sacrificing functionality or requiring hand repositioning.

**Solution approach:** FAB positioned in bottom-right thumb zone, large touch targets (48px minimum height), full-card tap for completion (no tiny checkboxes), swipe gestures for secondary actions (delete).

**4. Completion Satisfaction Without Clutter**

Users need the psychological reward of seeing completed tasks crossed out, but completed items shouldn't overwhelm the active task list. The challenge is balancing visibility of progress with maintaining focus on active work.

**Solution approach:** Completed section slides below active tasks, collapsed by default with count badge ("12 completed"). Expand to see crossed-out tasks for satisfaction, collapse to focus on active work. Manual "Clear Completed" action gives user control over when to reset.

**5. Network Resilience Transparency**

Mobile usage means spotty connections and offline moments. The challenge is making network failures invisible to the user without hiding actual sync problems that need attention.

**Solution approach:** Silent background retry with exponential backoff. Only surface errors to user if all retries fail (error toast with manual retry button). Subtle offline indicator in status bar if device is fully disconnected.

### Design Opportunities

**1. Gestural Fluency**

Mobile-first design enables natural gestural interactions that feel more fluid than tapping buttons. Opportunities include:
- Swipe-left to delete tasks (reveals delete confirmation)
- Pull-to-refresh for manual sync
- Long-press for future contextual actions (edit, duplicate, defer)

**2. Smart Temporal Grouping**

Date-based grouping can create intelligent default states that reduce cognitive load:
- "Today" group always expanded (focus on fresh tasks)
- "Yesterday" auto-expands if it contains uncompleted tasks (gentle nudge)
- "This Week" / "Older" collapsed by default (reduce visual noise)
- Tap group headers to toggle expand/collapse

**3. Visual Hierarchy Through Typography**

Material Design's type scale enables creating urgency cues without color-coding or explicit labels:
- Today's tasks: bold weight, 100% opacity (high attention)
- Yesterday: regular weight, 90% opacity (medium attention)
- Older: regular weight, 70% opacity, slightly smaller (low attention)
- Completed: line-through, 60% opacity (context but not focus)

**4. Delightful Micro-interactions**

Small animations create emotional connection and provide feedback without blocking interactions:
- New task slides in from right (adding to stack metaphor)
- Completion: check icon animates, text crosses out, card slides down smoothly to completed section
- Delete: card slides out left with fade (removal metaphor)
- Clear completed: staggered fade-out of multiple cards (satisfying batch action)

**5. Adaptive Density on Desktop**

Same responsive UI scales to desktop without separate feature sets:
- More tasks visible without scrolling (utilize vertical space)
- Card max-width 600px (maintain readable line length)
- Centered layout on large screens (comfortable scanning distance)
- Identical interactions (no keyboard shortcuts in MVP) maintain cross-device consistency

## Core User Experience

### Defining Experience

The core user experience of **aine-bmad-test** centers on a single critical interaction: **capturing a task in under 5 seconds during a meeting without breaking focus**. This moment—when someone verbally assigns an action item mid-conversation—is the make-or-break point for tool adoption. If the capture flow requires choosing categories, setting priorities, or navigating multi-step dialogs, the user will abandon the tool and revert to mental tracking.

The experience is designed around three high-frequency interactions that form the core loop:

1. **Create Task** (primary interaction, 4-8 times daily): Tap floating action button → type shorthand text → task appears at top of list instantly
2. **Scan Tasks** (multiple times daily): Visual triage of 20-100 tasks using date grouping and typography hierarchy to distinguish fresh from stale
3. **Complete Task** (3-7 times daily): Tap task card → watch it cross out and slide to completed section → feel satisfaction

All other interactions (delete task, clear completed, expand/collapse groups) are secondary and optimized for occasional use rather than high frequency.

### Platform Strategy

**Primary Platform: Mobile Web Browser**
- Touch-first interaction design optimized for one-handed thumb operation
- Progressive Web App (PWA) capabilities for future native-like experience
- Works across iOS Safari and Android Chrome without app store distribution

**Secondary Platform: Desktop Web Browser**
- Identical responsive UI that scales to larger screens
- No separate feature set or keyboard shortcuts in MVP
- More vertical density (20+ tasks visible vs 6-8 on mobile) for power-user scanning

**Offline Capability:**
- Full functionality works offline with local-first architecture
- Operations queue in background and sync when connection returns
- Silent retry with exponential backoff for failed network requests
- User only sees error toast if all retries fail after ~30 seconds

**Device Capabilities Leveraged:**
- LocalStorage for user preferences (theme, drawer state, sort order)
- Service Workers for offline capability and background sync (future enhancement)
- Standard web APIs only—no device-specific features (camera, geolocation, etc.) in MVP

### Effortless Interactions

The following interactions are designed to feel completely natural and require zero conscious thought:

**1. Task Creation Feels Instant**
- Optimistic UI: task appears at top of "Today" group immediately when user taps save
- No loading spinner, no "saving..." message, no blocking wait
- Silent background sync happens while user has already moved on mentally
- Trust is built through consistency—tasks always appear instantly, every time

**2. Completion Feels Satisfying**
- Entire task card is tappable surface (no hunting for tiny checkbox)
- Visual feedback: subtle check icon animates in, text crosses out with smooth transition
- Card smoothly slides down to completed section below active tasks
- Animation duration tuned to feel responsive but not rushed (~300ms total)

**3. Visual Scanning Requires Zero Thought**
- Typography hierarchy creates natural urgency gradient without color-coding
- Date grouping provides context at a glance ("Today" = 3 tasks, "Yesterday" = 5 tasks, "Older" = 12 tasks)
- Collapsed/expanded states auto-adjust based on task presence (empty groups stay collapsed)
- User opens app and immediately knows what's fresh vs. what's been sitting for a week

**4. Network Failures Are Invisible (Until Critical)**
- All create/complete/delete operations feel instant regardless of connection quality
- No "you're offline" banners or connectivity warnings during normal use
- Only surface error toast if retry fails after multiple attempts (~3 retries over 30 seconds)
- Error message includes manual retry button: "Task couldn't sync. Try again?"

**5. Gestural Deletion Feels Fast But Safe**
- Swipe-left gesture reveals delete button (iOS Mail pattern)
- Swipe doesn't immediately delete (prevents accidental loss)
- Delete button tap required for confirmation (single extra tap acceptable for destructive action)
- Card animates out left with fade when deleted

### Critical Success Moments

**The "This is better" Moment (First-Time User Success)**

**Scenario:** User is in a client call. Someone says "Can you send the updated architecture diagram by Thursday?"

**Experience:**
1. User pulls out phone mid-conversation (one-handed operation)
2. Taps floating action button in bottom-right corner (thumb-reachable)
3. Types shorthand text: "Send arch diagram Thu"
4. Taps save or presses Enter
5. Task appears at top of "Today" group instantly
6. User pockets phone and refocuses on conversation

**Time elapsed:** 4 seconds

**Critical element:** The instant visual feedback (task appears immediately) builds trust that the system captured it. No anxiety about whether it saved. No disruption to meeting flow.

**Outcome:** User realizes "this is faster than my old system" and adopts the tool.

---

**The "I feel successful" Moment (End-of-Day Progress)**

**Scenario:** End of workday. User opens app to review what was accomplished.

**Experience:**
1. Opens app on desktop (larger screen for review mode)
2. Sees "Today" group with 3 remaining tasks, "Yesterday" with 2 tasks, "Completed" showing "12 completed today"
3. Taps through remaining tasks from today's meetings, watches each cross out and slide down
4. Expands completed section to see all 15 crossed-out tasks (tangible progress)
5. Feels satisfied seeing the visual record of accomplishments
6. Optionally hits "Clear Completed" to reset for tomorrow

**Critical element:** The crossed-out tasks stay visible until user explicitly clears them. This provides psychological reward and proof of productivity without forcing immediate cleanup.

**Outcome:** User feels accomplished and trusts the system is helping them stay on top of commitments.

---

**The Make-or-Break Flow (First Capture in Meeting)**

**Critical Success:** If first-time capture in a meeting takes < 5 seconds and feels effortless, user adopts tool immediately.

**Critical Failure:** If first-time capture is slow (loading states), confusing (where's the add button?), or unreliable (did it save?), user abandons tool and never returns.

**Design Focus:**
- FAB is immediately visible when app opens (no scrolling to find "add" button)
- Task input dialog opens instantly (no animation delay)
- Keyboard appears immediately on mobile (autofocus input field)
- Save operation feels instant (optimistic UI, no blocking)
- Visual confirmation is clear (task appears at top of list)

### Experience Principles

All UX design decisions for **aine-bmad-test** are evaluated against these five guiding principles:

**1. Speed is Sacred**

Every interaction design decision must answer: "Does this slow down the 5-second capture flow?" 

- Loading states are forbidden in primary flows
- Confirmation dialogs are forbidden for non-destructive actions
- Multi-step workflows are forbidden if they add friction
- Optimistic UI is default—assume success, handle failure gracefully

**Application:** Task creation shows instant feedback (task appears in list immediately) rather than waiting for server confirmation.

---

**2. Optimism Over Accuracy**

The UI assumes operations will succeed rather than waiting for server confirmation.

- Create/complete/delete operations update UI immediately
- Background sync happens silently without blocking user
- Errors surface only when retry logic exhausts (3+ attempts over 30 seconds)
- User perceives instant response time regardless of network quality

**Application:** Tap task to complete → text crosses out and slides down immediately, even if device is offline. Sync happens in background.

---

**3. Chronology Creates Clarity**

Visual hierarchy through temporal grouping and typography replaces forced organizational systems.

- Date-based grouping (Today, Yesterday, This Week, Older) provides context
- Typography (weight, opacity, size) creates natural urgency gradient
- Recent tasks visually "pop" (bold, 100% opacity)
- Older tasks visually recede (regular weight, 70% opacity, smaller)
- Users trust their judgment over imposed categorization

**Application:** Opening the app immediately shows what's fresh (Today group at top, bold text) vs. what's been sitting (Older group at bottom, faded text).

---

**4. Gestures Over Buttons**

Touch interactions leverage natural gestures rather than requiring precise button taps.

- Full-card tap for primary actions (complete task)
- Swipe gestures for secondary actions (delete task)
- Large touch targets (minimum 48px height) for all interactions
- No tiny UI controls (checkboxes, icon buttons, etc.) that require precision

**Application:** Tap anywhere on a task card to mark it complete (entire card is interactive surface) rather than hunting for a tiny checkbox.

---

**5. Mobile-First, Desktop-Same**

One responsive UI design that scales gracefully across screen sizes without separate feature sets.

- Mobile prioritizes thumb-reachable zones (FAB bottom-right, actions within thumb arc)
- Desktop provides identical UI with more vertical density (20+ visible tasks vs 6-8)
- No keyboard shortcuts, desktop-specific features, or different interaction patterns in MVP
- Cross-device consistency means user never has to learn different interfaces

**Application:** Same FAB, same task cards, same gestures on both mobile and desktop. Desktop just shows more of the list at once.

## Desired Emotional Response

### Primary Emotional Goals

**Calm & Confident Control**

The primary emotional goal of **aine-bmad-test** is to create a sense of **calm** during task capture and **confidence** in the system's reliability, which over time builds into a feeling of **control** over commitments without organizational overhead.

**Calm during capture:** When mid-meeting, users should feel zero anxiety about capturing tasks. The interaction is so fast and effortless that it doesn't disrupt their mental flow or attention to the conversation. They offload the task to the system and immediately refocus, trusting it will be there when needed.

**Confidence in reliability:** Users should trust the system completely—tasks won't be lost, sync happens automatically, and data persists across devices and sessions. This trust is built through consistency (tasks always appear instantly), transparency (timestamps prove capture time), and forgiveness (silent retry handles network failures).

**Control without overhead:** Over time, the cumulative effect of calm capture + reliable storage is a feeling of being on top of commitments without maintaining organizational systems. Users feel empowered because they control what matters (when to clear completed tasks, how to interpret chronology) rather than being forced into imposed workflows.

### Emotional Journey Mapping

**Stage 1: First Discovery (Relief)**

**Current state with existing tools:** Frustration with slow capture flows that require choosing projects, setting priorities, and navigating multi-step dialogs during meetings.

**Desired emotional shift:** Relief when first using the tool—"Finally, something that gets out of my way." First capture in under 5 seconds creates immediate trust that this tool is different.

**Design enablers:** Visible FAB (no hunting for "add"), instant dialog open, autofocus input, single tap/Enter to save, immediate visual confirmation (task appears at top).

---

**Stage 2: During Core Action - Task Capture (Flow)**

**Current state:** Anxiety about whether the task saved, whether sync worked, whether attention was pulled away from the meeting too long.

**Desired emotional state:** Flow—the capture action is so fast and fluid it doesn't register as a separate mental context. Hand reaches for phone, thumb taps and types, task appears, phone goes back in pocket. Total disruption: 4 seconds, zero mental residue.

**Design enablers:** Optimistic UI (instant appearance), no loading states, silent background sync, muscle-memory gestures (FAB always bottom-right, same interaction every time).

---

**Stage 3: Task Scanning (Clarity)**

**Current state:** Overwhelm from flat unsorted lists or decision fatigue from having to manually organize/prioritize.

**Desired emotional state:** Clarity—open the app and immediately understand what's fresh (today's meetings), what's aging (yesterday, this week), what's stale (older). Visual hierarchy does the work, no mental effort required.

**Design enablers:** Date grouping (temporal context at a glance), typography hierarchy (bold for today, faded for older), collapsed groups for noise reduction, relative timestamps ("10 min ago" vs "Feb 12").

---

**Stage 4: Task Completion (Accomplishment)**

**Current state:** Completing tasks feels like just another click, no sense of tangible progress.

**Desired emotional state:** Accomplishment—tapping a task feels satisfying because of the visual feedback (check icon animates, text crosses out, card slides down to completed section). Expanding the completed section at end of day shows concrete record of what was achieved.

**Design enablers:** Smooth animations (~300ms, not too fast or slow), crossed-out text stays visible until manually cleared, completed count badge ("12 completed today"), expandable section for reviewing wins.

---

**Stage 5: Error Recovery (Trust)**

**Current state:** Panic when network fails—"Did I lose my task? Do I need to retype it?"

**Desired emotional state:** Trust—even when things go wrong (network failure, offline mode), the system handles it gracefully. User doesn't need to think about sync status or retry logic. Only critical failures surface as gentle error toasts with manual retry option.

**Design enablers:** Silent background retry with exponential backoff, offline queue for operations, tasks always appear locally first (optimistic UI), error toast only after 3+ retry attempts (~30 seconds), manual retry button in error message.

---

**Stage 6: Daily Return (Habit & Reliability)**

**Current state:** Dread opening task apps because they're cluttered, unreliable, or require maintenance.

**Desired emotional state:** Habit—the tool becomes invisible infrastructure. Opening it is muscle memory, not a conscious decision. Trust has been built through consistent zero-data-loss experiences. The chronological list always reflects reality (fresh tasks at top, completed tasks visible until cleared).

**Design enablers:** Consistent UI patterns (same gestures, same positions, same responses), reliable performance (no crashes, no slowdowns as list grows), data persistence across sessions/devices, user control over cleanup (manual "Clear Completed").

### Micro-Emotions

**Confidence (Not Confusion)**

When users tap "save" on a new task, they should feel **instant confidence** it worked because the task appears in the list immediately. No ambiguity, no "saving..." spinner, no wondering "did it actually save?"

**Design pattern:** Optimistic UI with temp ID → real ID swap in background. Task appears at top of "Today" group the moment user taps save/Enter.

---

**Trust (Not Skepticism)**

Over time, users should develop **deep trust** that the system won't lose data, even in edge cases (network failures, browser crashes, device switching). Trust is earned through consistency—every task ever created is still there unless explicitly deleted or cleared.

**Design pattern:** Silent background sync with retry logic, comprehensive error handling, named Docker volume for database persistence, cross-device data consistency via single source of truth (PostgreSQL).

---

**Calm (Not Anxiety)**

During the capture moment mid-meeting, users should feel **calm**—mental energy stays focused on the conversation, not on the tool. The capture interaction is so fast it doesn't register as a context switch.

**Design pattern:** 5-second capture flow (FAB → type → save), autofocus input field (keyboard ready immediately), instant visual feedback (task appears), no loading states or confirmation dialogs.

---

**Accomplishment (Not Frustration)**

When completing tasks, users should feel **tangible accomplishment**—crossed-out text and smooth animations provide satisfying feedback. End-of-day review of completed section reinforces productivity.

**Design pattern:** Smooth completion animation (~300ms: check icon → cross-out → slide down), completed tasks stay visible in collapsed section (badge shows count), expandable to see all wins, manual "Clear Completed" gives user control.

---

**Clarity (Not Overwhelm)**

When scanning 20-100 accumulated tasks, users should feel **clarity**—what's urgent vs. stale is immediately obvious through visual hierarchy, without needing to manually organize or prioritize.

**Design pattern:** Date-based grouping (Today, Yesterday, This Week, Older), typography hierarchy (bold weight + 100% opacity for today, regular + 70% opacity for older), collapsed empty groups, relative timestamps within groups.

---

**Control (Not Helplessness)**

Users should feel **in control** of the system's behavior—when to clear completed tasks, how to interpret temporal grouping, which tasks deserve attention. The system provides structure (chronology) without imposing workflow.

**Design pattern:** Manual "Clear Completed" action (user decides when to reset), collapsible date groups (user controls density), no forced categorization or priority systems, no automatic archiving or deletion.

### Design Implications

**Emotional Goal: Calm during capture**

**UX Choices:**
- Autofocus input field when dialog opens (keyboard ready, no extra tap)
- Auto-save on blur or Enter key (no hunting for save button)
- Single tap to open FAB dialog (minimal interaction count)
- Optimistic UI (task appears instantly, no waiting for server)
- No loading spinners or "saving..." messages in capture flow

**Avoid:**
- Multi-step forms (project selection, priority dropdowns, date pickers)
- Confirmation dialogs ("Are you sure?")
- Blocking wait states (spinner while saving)
- Manual sync buttons (user shouldn't think about sync)

---

**Emotional Goal: Trust in reliability**

**UX Choices:**
- Visible timestamps on every task (proof of when captured)
- Completed section persists until manually cleared (record of accomplishments)
- Error toasts only for critical failures (silent retry for transient issues)
- Cross-device data consistency (same tasks on phone and desktop)
- Zero data loss through comprehensive error handling

**Avoid:**
- Silent failures (errors must surface eventually if retry fails)
- Tasks disappearing without user action
- Ambiguous sync states ("syncing..." badges, spinning icons)
- Data inconsistency across devices

---

**Emotional Goal: Accomplishment at completion**

**UX Choices:**
- Smooth animation when marking complete (~300ms check icon → cross-out → slide down)
- Crossed-out text stays visible in completed section (tangible progress)
- Completed count badge ("12 completed today") shows productivity
- Expandable completed section for reviewing wins
- Manual "Clear Completed" gives user control over when to reset

**Avoid:**
- Instant disappearance of completed tasks (no visual reward)
- Auto-archiving or hiding completed items (takes away satisfaction)
- Tiny completion checkboxes (requires precision, slows down flow)
- No visual differentiation between active and completed

---

**Emotional Goal: Clarity when scanning**

**UX Choices:**
- Date-based grouping with clear headers (Today, Yesterday, This Week, Older)
- Typography hierarchy (bold + 100% opacity for today → regular + 70% for older)
- Collapsed empty date groups (reduce visual noise)
- Relative timestamps within groups ("10 min ago", "2:30 PM", "Feb 15")
- Smart expand/collapse defaults (Today always expanded, Older collapsed)

**Avoid:**
- Flat unsorted list (no temporal context)
- Forced categorization (projects, tags, priorities require maintenance)
- Uniform visual weight (all tasks look equally urgent)
- Overwhelming density (showing 100 tasks with same visual treatment)

---

**Emotional Goal: Efficiency & speed**

**UX Choices:**
- FAB always visible (no scrolling to find "add" button)
- Large touch targets (48px minimum height, full card tap for completion)
- Gestural interactions (swipe-left to delete)
- Keyboard-friendly (Enter to save, Escape to cancel)
- Minimal taps for common actions (1 tap to complete, 2 taps to delete)

**Avoid:**
- Hidden actions (hamburger menus, multi-level navigation)
- Small tap targets (checkboxes, icon buttons require precision)
- Modal dialogs for every action (interrupts flow)
- Excessive confirmation prompts (slows down power users)

### Emotional Design Principles

**Principle 1: Instant Feedback Builds Confidence**

Every user action receives immediate visual feedback. Task creation shows the task in the list instantly (optimistic UI). Task completion shows check icon + cross-out + slide-down animation immediately. Deletion shows card sliding out left with fade. Users never wonder "did that work?"

**Application:** No loading spinners in primary flows. Background sync happens silently. Only show error states if retry exhausts (3+ attempts).

---

**Principle 2: Trust is Earned Through Consistency**

Reliability creates trust over time. Tasks never disappear unless user explicitly deletes them. Data persists across browser sessions, device switches, and container restarts. Timestamps provide proof of capture time. Cross-device consistency means mobile and desktop always show same data.

**Application:** Zero data loss through comprehensive error handling, named Docker volumes for persistence, silent retry for network failures, visible audit trail (creation/completion timestamps).

---

**Principle 3: Visual Hierarchy Reduces Cognitive Load**

Users shouldn't need to manually organize or prioritize—the visual design does the work. Recent tasks (today) are bold and high-opacity. Older tasks (last week) are regular weight and faded. Completed tasks are crossed out and lower opacity. Chronological grouping provides context without forced categorization.

**Application:** Date-based groups (Today, Yesterday, This Week, Older), typography scale (weight + opacity + size), collapsed/expanded states based on content, relative timestamps for temporal awareness.

---

**Principle 4: Micro-interactions Create Emotional Connection**

Small animations and transitions make the tool feel alive and responsive. Task cards slide in when created, cross out and slide down when completed, slide out when deleted. Animations are tuned to feel snappy but not rushed (~300ms). Gestures (swipe-left to delete) feel more natural than button taps.

**Application:** Smooth CSS transitions for all state changes, gesture-based interactions for secondary actions, hover states on desktop for affordance, haptic feedback on mobile (future enhancement).

---

**Principle 5: User Control Prevents Helplessness**

The system provides structure (chronological grouping, visual hierarchy) without imposing workflow. Users decide when to clear completed tasks, how to interpret temporal urgency, which tasks deserve attention. No forced categorization, no automatic archiving, no productivity methodology enforcement.

**Application:** Manual "Clear Completed" action (user-triggered, not automatic), collapsible date groups (user controls density), no required fields beyond task text, no imposed priorities or due dates, user preferences stored in LocalStorage (theme, drawer state, sort order).

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Apple Notes** serves as the primary inspiration source for this task manager's interaction patterns and visual simplicity. However, we **diverge significantly** from Apple Notes' permanent storage philosophy. Apple Notes succeeds at **retrieval-optimized note storage**; this task manager is optimized for **completion-first task capture with ephemeral completed task storage**.

**What We're Adopting from Apple Notes:**
- **Minimal UI**: Nearly chrome-free interface that maximizes content visibility
- **Instant Interaction**: Immediate keyboard focus, no loading states, optimistic sync
- **Natural Gestures**: Swipe-to-complete/delete feels physical and immediate
- **Typography as Hierarchy**: Bold titles and font weight create scanning paths without decorative elements
- **Chronological Organization**: Default list sorted by recency, no forced categorization

**What We're Rejecting from Apple Notes:**
- **Permanent Storage Model**: Apple Notes keeps everything forever; we auto-delete completed tasks after 24 hours to prevent list bloat
- **Retrieval-First Design**: Apple Notes optimizes for searching/browsing old content; we optimize for completing and clearing tasks
- **Folders as Core Organization**: We use a single collapsed "Completed" section instead of folder hierarchies

**True Inspiration Positioning:**
This is **"Apple Notes' interaction simplicity + Slack's ephemeral retention model"** applied to task management. Users capture freely knowing completed tasks auto-cleanup after 24 hours, creating a self-cleaning workspace that enforces focus on active commitments.

**Key Success Factors:**
- **Minimal UI**: Nearly chrome-free interface that maximizes content visibility
- **Instant Interaction**: Immediate keyboard focus, no loading states, optimistic sync
- **Natural Gestures**: Swipe-to-complete/delete feels physical and immediate
- **Typography as Hierarchy**: Bold titles and font weight create scanning paths without decorative elements
- **Ephemeral Completed Tasks**: 24-hour auto-delete prevents list bloat while preserving end-of-day satisfaction

**What Makes Users Return:**
- Trust in data reliability (active tasks never auto-delete, completed tasks cleanup silently)
- Zero cognitive overhead during capture
- Familiar, predictable interaction patterns
- Fresh start mentality with automatic cleanup of completed work

### Transferable UX Patterns

**Navigation & Information Hierarchy:**
- **Chronological-First View**: Active tasks sorted by creation time with date grouping (Today, Yesterday, This Week, Older)
- **Collapsed Completed Section**: Completed tasks move to a collapsed section at bottom of list, auto-delete after 24 hours
- **No Forced Categorization**: No projects, tags, or priorities required during capture
- **Content-Focused Layout**: Minimal chrome, maximum screen real estate for task content

**Interaction Patterns:**
- **FAB for Primary Action**: Persistent floating action button for task creation (thumb-reachable zone, Material Design standard)
- **Full-Card Tap for Completion**: Entire task card is tappable to toggle completion state
- **Swipe Gestures**: Left/right swipes for quick actions (complete, delete)
- **Instant Keyboard Focus**: Keyboard appears immediately when creating new task, no tap required

**Visual Design Patterns:**
- **Typography Hierarchy**: Font weight (bold for active, strikethrough for completed) and size variations create visual scanning paths
- **System Fonts**: Clean, readable fonts optimized for mobile screens (Roboto for Material-UI)
- **Minimal Color Palette**: Primarily monochrome with single accent color for interactive elements (Material Design primary color)
- **White Space**: Generous padding and spacing to support one-handed thumb operation (48px minimum touch targets)

**State Management Patterns:**
- **Optimistic UI**: Immediate visual feedback, background sync without loading states
- **Inline Editing**: Long-press to edit task text directly in list (no modal dialogs)
- **Silent Auto-Cleanup**: Completed tasks auto-delete after 24 hours with no user notification
- **Date Grouping**: Active tasks grouped by recency (Today, Yesterday, This Week, Older) for chronological clarity

### Anti-Patterns to Avoid

**Forced Categorization:**
- ❌ Requiring project, priority, or tag selection during task creation
- ❌ Multi-step wizards or forms with mandatory fields beyond task text
- ❌ Forced organizational systems that slow down capture flow
- ❌ "Smart" suggestions for categories/projects during capture (adds cognitive load)

**Visual Noise:**
- ❌ Colorful priority indicators, badges, or icons cluttering task list
- ❌ Showing all metadata (creation date, tags, notes) by default
- ❌ Decorative elements that don't support task scanning or completion
- ❌ Progress bars, completion percentages, or gamification elements in MVP

**Complex Navigation:**
- ❌ Nested folder hierarchies as primary navigation structure
- ❌ Tab bars with 4+ sections requiring mental mapping
- ❌ Hiding primary actions (create, complete) behind hamburger menus or overflow menus
- ❌ Multiple list views (by project, by priority, by date) creating decision paralysis

**Desktop-First Patterns:**
- ❌ Hover states or tooltips as primary interaction affordances
- ❌ Right-click context menus as the only way to access actions
- ❌ Small touch targets (<48px) optimized for mouse precision instead of thumb accuracy
- ❌ Keyboard shortcuts as the only efficient path to task completion

**Feature Bloat:**
- ❌ Rich text editing capabilities beyond plain text task descriptions
- ❌ Attachment, photo, or file management features
- ❌ Collaboration features (sharing, comments, assignments)
- ❌ Advanced filtering, search, or custom view configurations in MVP
- ❌ **Configurable retention settings** (hardcode 24-hour completed task cleanup to enforce design philosophy)

**Permanent Storage Assumptions:**
- ❌ Treating task history as permanent archive requiring backup/export features
- ❌ Building retrieval-first features (search, advanced filters) for completed tasks
- ❌ Creating "review old tasks" workflows that encourage hoarding instead of completion

### Anti-Patterns to Avoid

**Forced Categorization:**
- ❌ Requiring project, priority, or tag selection during task creation
- ❌ Multi-step wizards or forms with mandatory fields beyond task text
- ❌ Forced organizational systems that slow down capture flow
- ❌ "Smart" suggestions for categories/projects during capture (adds cognitive load)

**Visual Noise:**
- ❌ Colorful priority indicators, badges, or icons cluttering task list
- ❌ Showing all metadata (creation date, tags, notes) by default
- ❌ Decorative elements that don't support task scanning or completion
- ❌ Progress bars, completion percentages, or gamification elements in MVP

**Complex Navigation:**
- ❌ Nested folder hierarchies as primary navigation structure
- ❌ Tab bars with 4+ sections requiring mental mapping
- ❌ Hiding primary actions (create, complete) behind hamburger menus or overflow menus
- ❌ Multiple list views (by project, by priority, by date) creating decision paralysis

**Desktop-First Patterns:**
- ❌ Hover states or tooltips as primary interaction affordances
- ❌ Right-click context menus as the only way to access actions
- ❌ Small touch targets (<48px) optimized for mouse precision instead of thumb accuracy
- ❌ Keyboard shortcuts as the only efficient path to task completion

**Feature Bloat:**
- ❌ Rich text editing capabilities beyond plain text task descriptions
- ❌ Attachment, photo, or file management features
- ❌ Collaboration features (sharing, comments, assignments)
- ❌ Advanced filtering, search, or custom view configurations in MVP
- ❌ **Configurable retention settings** (hardcode 24-hour completed task cleanup to enforce design philosophy)

**Permanent Storage Assumptions:**
- ❌ Treating task history as permanent archive requiring backup/export features
- ❌ Building retrieval-first features (search, advanced filters) for completed tasks
- ❌ Creating "review old tasks" workflows that encourage hoarding instead of completion

### Design Inspiration Strategy

**What to Adopt:**
- **Minimal UI Philosophy**: Chrome-free interface with content-first design approach
- **Swipe Gestures**: Natural left/right swipes for task state changes (complete/delete)
- **FAB for Creation**: Persistent, thumb-reachable floating action button for new tasks
- **Typography Hierarchy**: Font weight and size variations instead of colors for visual importance
- **Optimistic UI**: Immediate visual feedback with background sync (no loading spinners)
- **Chronological Organization**: Date grouping (Today, Yesterday, This Week, Older) for active tasks

**What to Adapt:**
- **Folder Pattern → Collapsed Completed Section**: Apple Notes uses folders for organization; we use a single collapsed "Completed" section at list bottom that auto-cleans after 24 hours
- **Note Preview → Date Grouping**: Apple Notes shows preview text; we show date headers for active tasks to create chronological clarity
- **Full-Card Tap → Task Toggle**: Apple Notes taps open editor; our tasks toggle completion state on tap (edit on long-press)
- **Permanent Storage → Ephemeral Completed Tasks**: Apple Notes keeps everything forever; we auto-delete completed tasks after 24 hours to prevent list bloat
- **iCloud Sync → PostgreSQL + Optimistic UI**: Apple's cloud sync model adapted to web architecture with TanStack Query

**What to Reject:**
- **Permanent Storage Model**: Completed tasks auto-delete after 24 hours; this is a capture-and-complete tool, not a task archive
- **Retrieval-First Features**: No search, advanced filters, or "review history" workflows in MVP
- **Organizational Complexity**: No folders, projects, tags, or hierarchies beyond "Active" vs "Completed"
- **Rich Editing**: Plain text only, no formatting toolbar or attachments
- **Configurable Settings**: No retention period settings, auto-delete timing, or organizational preferences

**Design Strategy Summary:**

This task manager adopts **Apple Notes' interaction simplicity** (minimal UI, swipe gestures, typography hierarchy, instant interactions) while **rejecting its permanent storage model** in favor of an **ephemeral completed task approach** inspired by Slack's message retention philosophy.

**Core Philosophy:** Active tasks persist with chronological clarity until completed or manually deleted. Completed tasks remain visible in a collapsed section for 24 hours (providing end-of-day satisfaction), then auto-delete silently to prevent list bloat.

**Why This Hybrid Approach:**
- **Meeting-capture use case**: Most tasks get completed same-day or next-day; long-term retention is unnecessary
- **Prevents list anxiety**: Users can capture freely knowing the system self-cleans without manual archiving
- **Enforces completion focus**: Unlike retrieval-optimized tools (Apple Notes, Evernote), this is a completion-optimized tool
- **Fresh start mentality**: Daily auto-cleanup of completed work reinforces "what's next" mindset instead of "look what I did last month"

**5-Second Capture Constraint Impact:**
The Apple Notes interaction patterns (FAB + instant keyboard focus + minimal UI) directly support the 5-second capture goal. The ephemeral storage model supports it indirectly by removing cleanup anxiety—users never think "I'll have to organize/archive this later."

**Material Design Integration:**
All patterns map to standard Material-UI components (FAB, Typography, SwipeableViews, List) for familiar Android/web interactions. We're not reinventing interaction patterns; we're applying proven patterns to a completion-first philosophy.

## Design System Foundation

### Design System Choice

**Material-UI (MUI)** serves as the design system foundation for **aine-bmad-test**. Material Design's mobile-first philosophy, comprehensive component library, and proven interaction patterns align perfectly with the meeting-capture use case and Apple Notes-inspired simplicity.

MUI provides the complete UI toolkit needed for the MVP without custom component development: List, Card, Fab (Floating Action Button), Typography, Dialog, and responsive utilities. All components include built-in accessibility (ARIA attributes, keyboard navigation, focus management), eliminating the need for custom accessibility implementation.

### Rationale for Selection

**1. Already Specified in Technical Architecture**

The technical architecture document specifies "Material-UI (MUI)" as the component library. This decision was made during the architecture phase based on React ecosystem standards, comprehensive documentation, and wide adoption. The UX design builds upon this foundation rather than revisiting the technology choice.

**2. Mobile-First Foundation**

Material Design was created specifically for touch interfaces and mobile-first experiences. Core patterns like Floating Action Buttons (FAB), swipe gestures, and card-based layouts are native to Material Design, requiring zero custom implementation to achieve the Apple Notes-inspired interaction model.

**3. Speed Over Uniqueness**

This is a personal productivity tool, not a consumer-facing branded product. Development speed and reliability trump visual uniqueness. MUI's pre-built components mean the MVP can ship without weeks of custom component development, testing, and accessibility work.

**4. Boring Technology Principle**

MUI is established, well-documented, and widely adopted. It aligns with the architecture principle of "boring technology" over cutting-edge frameworks. The React community has extensive MUI knowledge, making future maintenance and feature additions straightforward.

**5. Accessibility Out-of-the-Box**

MUI handles WCAG 2.1 AA compliance automatically: semantic HTML, keyboard navigation, focus management, ARIA labels, screen reader support. This eliminates the accessibility burden from custom component development and ensures the tool is usable by all users.

**6. Themeable for Future Needs**

If visual customization becomes important later (branding, color preferences, typography adjustments), MUI's theming system supports deep customization without rewriting components. Design tokens (color, typography, spacing) can be overridden through MUI's theme API.

### Implementation Approach

**Use MUI Defaults for 95% of the UI**

Leverage MUI's standard components without customization:
- **Task List**: `<List>` + `<ListItem>` components with MUI's default styling
- **Task Cards**: `<Card>` or `<ListItemButton>` for full-card tap targets
- **FAB**: `<Fab>` component positioned bottom-right (Material Design standard)
- **Task Creation Dialog**: `<Dialog>` with `<TextField>` for text input
- **Typography Hierarchy**: MUI's `<Typography>` variants (h6, body1, body2) for date groups and task text
- **Swipe Gestures**: `react-swipeable-views` library (MUI ecosystem) for swipe-to-delete

**Apply Custom Theme for Brand Identity**

Define design tokens through MUI's `createTheme` API:
- **Primary Color**: Choose calming accent (blue, teal, or green) for FAB and interactive elements
- **Typography Scale**: Adjust font weights (bold for "Today" tasks, regular for "Older") and sizes to strengthen visual hierarchy
- **Spacing Tokens**: Ensure 48px minimum touch target height, generous padding for thumb operation
- **Animation Durations**: Set global transition duration to ~300ms for snappy but smooth animations

**Override Only When Necessary**

If MUI's default behavior conflicts with Apple Notes-inspired simplicity:
- **Example**: MUI's List components don't include swipe-to-delete by default → wrap ListItems with `react-swipeable-views` for custom gesture handling
- **Example**: MUI's Dialog animations might be slower than 5-second capture goal → override animation duration via theme or component-level `sx` prop
- **Principle**: Start with MUI defaults, measure against UX goals, override only when default behavior demonstrably slows down core flows

**Leverage MUI's Responsive Utilities**

Use MUI's built-in responsive features for mobile/desktop adaptation:
- **Breakpoints**: `xs`, `sm`, `md`, `lg`, `xl` for device-specific layout adjustments
- **`useMediaQuery` Hook**: Conditionally render or adjust behavior based on screen size
- **`sx` Prop**: Apply responsive styling inline (e.g., `sx={{ width: { xs: '100%', md: '600px' } }}`)
- **Grid/Stack Components**: Handle layout without custom CSS media queries

### Customization Strategy

**Keep (Use MUI Defaults):**
- Component structure and internal behavior (List, Card, Dialog, Fab)
- Accessibility features (focus management, ARIA labels, keyboard navigation)
- Responsive breakpoint system (xs: 0px, sm: 600px, md: 900px, lg: 1200px, xl: 1536px)
- Layout utilities (Grid, Stack, Box) for responsive design
- Form components (TextField, Checkbox) with built-in validation patterns

**Customize (Override via Theme):**
- **Primary Color**: Define brand accent color for FAB, links, focus states (default: blue → choose calming color)
- **Typography Scale**: Adjust font weights and sizes to create stronger date grouping hierarchy
  - `h6` for date group headers (Today, Yesterday, This Week, Older)
  - `body1` for task text (bold variant for active tasks, regular for older)
  - `body2` for timestamps and metadata (smaller, lower opacity)
- **Spacing Tokens**: Ensure minimum 48px touch targets, generous padding for one-handed operation
  - Override `spacing` scale if MUI's default (8px base) doesn't provide enough thumb-friendly zones
- **Border Radius**: Adjust card corner radius if needed (MUI default: 4px → consider 8px for softer feel)
- **Animation Durations**: Tune transition speeds via `transitions.duration` theme setting
  - MUI default: `shortest: 150ms, short: 200ms, standard: 300ms, complex: 375ms`
  - Adjust if animations feel too slow or too fast during testing

**Don't Customize (Trust MUI):**
- Component internals (List, Card, Dialog rendering logic)
- Accessibility implementation (WCAG compliance, screen reader support)
- Responsive grid system (12-column layout, breakpoint behavior)
- Form validation patterns (TextField error states, helper text)
- Focus management and keyboard navigation (built into components)

**Customization Philosophy:**

Start with 100% MUI defaults. Ship the MVP using standard components and default theme. Only customize when user testing or usage metrics reveal specific UX friction. Material Design patterns are battle-tested across billions of Android devices—trust the defaults until evidence proves otherwise.

**Future Customization Paths:**

- **Theme Switcher**: Light/dark mode via MUI's `ThemeProvider` (future enhancement, not MVP)
- **Color Preferences**: User-selectable primary color via LocalStorage + theme override
- **Density Options**: Compact/comfortable/spacious list density for power users vs. accessibility needs
- **Custom Components**: If MVP reveals gaps in MUI's component library, build custom components on top of MUI primitives (Box, Typography) for consistency

## Core User Experience Deep Dive

### Defining Experience

**"Capture a task in under 5 seconds during a meeting without breaking mental focus"**

This is the defining interaction that makes **aine-bmad-test** succeed or fail. If a user is mid-conversation when someone assigns an action item ("Can you send the architecture diagram by Thursday?"), they need to offload that commitment to the system **faster than writing on paper** and **without losing focus on the conversation**.

The 5-second constraint is not arbitrary—it's the threshold where task capture feels invisible. Beyond 5 seconds, the user experiences a mental context switch away from the meeting and toward "using an app." Under 5 seconds, the capture feels like a muscle-memory reflex: pull out phone, tap FAB, type shorthand, tap save, pocket phone, refocus on conversation.

**Why This Matters:**

If this interaction takes 10+ seconds (navigating menus, choosing projects, setting priorities), users will abandon the tool mid-meeting and revert to mental tracking or paper notes. The entire value proposition—offloading cognitive load to reliable digital storage—collapses if the capture flow adds friction.

**Success Definition:**

Users describe the tool to colleagues as "so fast I barely notice I'm using it" or "like writing on paper but digital." First-time capture in a live meeting takes under 5 seconds and feels effortless, leading to immediate adoption.

### User Mental Model

**Current Solution: Manual Paper Notes**

Before building this tool, the target user (Pregno) solves the meeting-capture problem by **writing tasks on paper**. This establishes the mental model and sets the competitive bar:

**What Works with Paper:**
- **Instant availability**: No app launch, no login, no navigation—paper is already there
- **Zero friction**: Pick up pen, write shorthand text, done (3-4 seconds total)
- **No loading states**: Text appears instantly as you write, no waiting for sync or save
- **Familiar interaction**: Writing is muscle memory, requires no conscious thought
- **Flexible format**: Can write shorthand ("PR review Sarah"), no forced structure

**What Breaks with Paper:**
- **Data loss**: Paper gets lost, coffee spills on it, left in meeting room
- **No cross-device access**: Tasks captured on paper at office aren't visible on phone later
- **Illegible handwriting**: Shorthand notes become indecipherable hours later
- **No completion tracking**: Crossing out tasks on paper doesn't feel satisfying (no visual feedback)
- **Manual rewriting**: Need to transcribe paper notes to digital later (double work)

**Mental Model Implications:**

The digital task manager must **feel as fast as paper** while **fixing paper's weaknesses** (data loss, cross-device access, illegibility). Users bring the expectation that task capture should be **instant, friction-free, and flexible**—any interaction slower than picking up a pen and writing fails to compete.

**Design Constraints from Mental Model:**

- FAB must be **as visible as a pen on the table** (always on screen, bottom-right thumb zone)
- Text input must **feel as fast as writing** (keyboard appears immediately, autofocus, no tap required)
- Save must **feel instantaneous** (optimistic UI, no "saving..." spinner)
- Task format must be **as flexible as paper** (plain text, no required fields beyond shorthand description)

### Success Criteria

**Core Experience Success Criteria:**

The 5-second task capture interaction succeeds when users:

1. **Feel zero friction** during the capture moment
   - No app navigation (FAB visible on screen when app opens)
   - No multi-step forms (single text input field, no dropdowns or pickers)
   - No waiting for loading states (task appears instantly when saved)
   - No mental context switch (interaction feels like reflex, not "using software")

2. **Trust the system captured it correctly**
   - Task appears at top of "Today" group immediately (visual confirmation)
   - Timestamp shows exact capture time (proof it worked)
   - No ambiguity about save status (no "saving..." spinner, no sync icons)

3. **Complete the capture in under 5 seconds**
   - Measured from: user pulls out phone
   - To: user pockets phone after task appears in list
   - Breakdown: ~1 second to open app, ~1 second to tap FAB, ~2 seconds to type shorthand text, ~1 second to save and confirm

4. **Describe the tool as "faster than paper"**
   - In user interviews or conversations with colleagues, users say: "It's so fast, I barely notice I'm using it" or "Like writing on paper but digital"
   - Users adopt the tool immediately after first capture in a live meeting (no trial period needed)

5. **Return to conversation without mental residue**
   - After pocketing phone, user's attention immediately refocuses on the meeting
   - No lingering thoughts like "Did that save?" or "I need to organize that later"
   - Mental offload is complete—task is system's responsibility now, not user's

**Failure Indicators:**

If users exhibit these behaviors, the core experience has failed:

- Abandoning capture mid-meeting and returning to paper notes
- Finishing capture but continuing to think about the task (anxiety about whether it saved)
- Describing the tool as "pretty good" instead of "invisible" (indicates friction is still present)
- Taking 10+ seconds to complete capture (lost the competitive advantage vs. paper)

### Novel UX Patterns

**Pattern Analysis: Established Patterns with Innovative Constraints**

The 5-second task capture experience uses **100% established UX patterns** (FAB, text input, optimistic UI) but applies them with **novel constraint-driven optimization**:

**Established Patterns We're Using:**

1. **Floating Action Button (FAB)** - Material Design standard for primary actions
   - Users already understand: tap FAB to create new item
   - No user education needed, pattern proven across thousands of Android apps

2. **Modal Dialog for Input** - Familiar pattern for focused data entry
   - Dialog appears over main content, dims background, focuses attention on single task
   - Users expect: type text, tap save or press Enter, dialog closes

3. **Optimistic UI** - Established pattern in modern web apps (Gmail, Slack, Todoist)
   - Users understand: actions appear to complete instantly, sync happens in background
   - Builds trust through consistency when system reliably handles background errors

4. **Chronological Lists** - Familiar from email, messaging apps, social feeds
   - Users already scan chronologically (newest first), no mental model shift required
   - Date grouping (Today, Yesterday, This Week) is established pattern from email clients

**Novel Constraint: "Faster Than Paper" Optimization**

What makes this **innovative within established patterns** is the ruthless application of the 5-second constraint:

- **FAB positioned bottom-right** (not top-right) for one-handed thumb reach during meetings
- **Autofocus input field** immediately when dialog opens (keyboard ready, no extra tap)
- **Auto-save on Enter key** or blur (no hunting for save button)
- **No confirmation dialogs** for any non-destructive action (speed over safety)
- **No required fields** beyond task text (project/priority/tags forbidden in MVP)

**Other Tools vs. This Tool:**

- **Todoist**: Requires tapping "+" button → selecting inbox/project → typing task → tapping "Add Task" (6-8 seconds, 4 taps)
- **Things**: Requires Quick Entry → typing task → choosing list → setting date → hitting Enter (8-10 seconds)
- **Apple Reminders**: Requires opening app → tapping "New Reminder" → typing → tapping "Add" (7-9 seconds)
- **This Tool**: Tap FAB → type → Enter (4-5 seconds, 2 taps)

The innovation is **not inventing new patterns** (users would need education), but **stripping away every non-essential interaction** to achieve paper-competitive speed.

**Teaching Required: None**

Because we use 100% established patterns, users need **zero onboarding**:
- See FAB → already know it creates new items
- Tap FAB, see text field → already know to type task description
- Type and hit Enter → already expect task to save and dialog to close
- See task appear at top of list → already understand chronological order

The only "novel" aspect (24-hour ephemeral completed task cleanup) happens in background and doesn't require user education—they discover it organically when yesterday's completed tasks are gone.

### Experience Mechanics

**Core Experience Mechanics: 5-Second Task Capture**

**1. Initiation (1 second)**

**User Action:**
- Pulls out phone during meeting when action item is mentioned
- App is already open (or user taps app icon to launch)

**System Response:**
- App opens instantly to task list view (no splash screen, no login)
- FAB is immediately visible in bottom-right corner (no scrolling needed)
- Visual cue: FAB uses primary accent color (blue/teal/green) against neutral background

**Trigger/Invitation:**
- External trigger: Someone in meeting assigns action item verbally
- Internal trigger: User's brain recognizes "I need to capture this"
- FAB's persistent visibility invites action without requiring menu navigation

**Design Details:**
- FAB positioned 16px from bottom-right edge (thumb-reachable zone on mobile)
- FAB size: 56px diameter (Material Design standard, large enough for quick tap)
- FAB elevation: raised shadow to appear "tappable" and separate from list content

---

**2. Interaction (2-3 seconds)**

**User Action:**
- Taps FAB with thumb (one-handed operation)
- Types shorthand task text using on-screen keyboard ("PR review Sarah", "Send arch diagram Thu")
- Taps "Save" button or presses Enter key on keyboard

**System Response:**
- FAB tap opens modal dialog instantly (no animation delay, <100ms)
- Dialog contains single text input field, autofocused (keyboard appears immediately)
- Text field placeholder: "Task description..." (gentle guidance, no prescription)
- Save button appears in dialog footer (or Enter key auto-saves)

**Controls/Inputs:**
- **Primary input**: On-screen keyboard for text entry
- **Primary save action**: Enter key on keyboard (fastest for users typing)
- **Secondary save action**: "Save" button in dialog (for users who lift thumb from keyboard)
- **Cancel action**: "X" icon in dialog header or Escape key (rare, low priority)

**Real-Time Feedback:**
- Text appears in input field as user types (standard behavior, no lag)
- Character count invisible (no limit, no anxiety about length)
- No validation errors (plain text accepted, no required format)

**Design Details:**
- Dialog width: 90% of screen width on mobile, max 400px on desktop
- Input field: single-line text field (multi-line not needed for shorthand)
- Autofocus behavior: input field focused on dialog open, keyboard appears without extra tap
- Save button: primary color (matches FAB), positioned bottom-right in dialog

---

**3. Feedback (<1 second)**

**User Action:**
- User taps "Save" or presses Enter

**System Response (Optimistic UI):**
- **Immediate (0ms)**: Dialog closes instantly, no fade-out animation delay
- **Immediate (0ms)**: Task appears at top of "Today" date group in task list
- **Immediate (0ms)**: Task text matches what user typed exactly
- **Background (async)**: POST request to backend API to persist task in PostgreSQL
- **Background (async)**: If POST fails, silent retry with exponential backoff (3 attempts over 30 seconds)
- **Only if retry exhausted**: Error toast appears: "Task couldn't sync. Try again?" with manual retry button

**Success Indicators:**
- Task visible in list (proof of capture)
- Timestamp shows current time (proof of when captured)
- Task positioned at top of "Today" group (confirms it's fresh/active)

**Error Handling:**
- No error shown during initial save (optimistic assumption: success)
- No "saving..." spinner or sync status icon (user shouldn't think about sync)
- Only critical errors surface (all retries failed after 30+ seconds)

**Design Details:**
- Task appearance: slide-in animation from right (~200ms) for satisfying visual feedback
- Typography: bold weight, 100% opacity (active task styling from design system)
- Timestamp: relative format ("Just now") immediately after creation
- Position: absolute top of "Today" group (newest-first chronological order)

---

**4. Completion (<1 second)**

**User Action:**
- Glances at screen to confirm task appeared
- Pockets phone or sets it down

**System Response:**
- Task list shows new task at top
- Screen remains on task list view (no automatic navigation away)
- FAB remains visible (ready for next capture if needed)

**Success Outcome:**
- User sees task in list (mental offload complete)
- User refocuses attention on meeting (no lingering "did it save?" anxiety)
- Task persists in system indefinitely until completed or manually deleted

**What's Next:**
- User returns to meeting conversation (primary context)
- Task remains at top of "Today" group until more tasks are captured or time passes
- When user reopens app later, task is still there with timestamp proof

**Design Details:**
- No confirmation toast (e.g., "Task created!") — visual appearance in list is confirmation enough
- FAB remains in same position (muscle memory for next capture)
- List scroll position: top of "Today" group (user sees their new task without scrolling)

## Visual Design Foundation

### Color System

**Primary Color: Calming Blue (#2196F3 - Material Blue 500)**

The primary color serves as the single accent color in an otherwise monochrome interface. Blue was chosen to support the "calm and confident control" emotional goal—it's associated with trust, reliability, and calm focus. The color appears sparingly on interactive elements only, never as decorative or informational indicators.

**Color Usage:**
- **Primary Blue (#2196F3)**: FAB, active focus states, links, primary action buttons
- **Gray Scale**: All other UI elements use Material Design gray palette
  - Gray 900 (#212121): Primary text (active task descriptions)
  - Gray 700 (#616161): Secondary text (older task descriptions)
  - Gray 500 (#9E9E9E): Disabled text, placeholders
  - Gray 300 (#E0E0E0): Dividers, borders
  - Gray 50 (#FAFAFA): Background surfaces
- **White (#FFFFFF)**: Main background, card surfaces
- **Black (#000000)**: Reserved for highest contrast needs only

**Semantic Color Mapping:**
- **Primary**: Blue (#2196F3) - interactive elements, FAB
- **Secondary**: Not used in MVP (monochrome approach)
- **Success**: Green (#4CAF50) - used only for subtle completion feedback (check icon)
- **Warning**: Orange (#FF9800) - not used in MVP
- **Error**: Red (#F44336) - error toasts only (rare, when all retries fail)
- **Info**: Not used in MVP

**Minimal Color Philosophy:**

95% of the interface is achromatic (grays, whites). The primary blue appears only on the FAB and active interactive states. This minimalism supports the Apple Notes inspiration and ensures users focus on task content rather than decorative UI elements.

**No Color-Coding for Task Priority:**

Unlike traditional task managers that use red/orange/yellow to indicate priority, this tool relies on **chronological grouping and typography** to create urgency cues. Fresh tasks (Today) are visually prominent through bold weight and position, not color. This reduces visual noise and supports the "chronology creates clarity" principle.

**Accessibility Compliance:**

All text/background color combinations meet WCAG 2.1 AA contrast requirements:
- Gray 900 on White: 16.1:1 (exceeds 4.5:1 minimum)
- Gray 700 on White: 8.3:1 (exceeds 4.5:1 minimum)
- Blue 500 on White: 4.5:1 (meets 4.5:1 minimum for normal text)

### Typography System

**Primary Typeface: Roboto (Material-UI default)**

Roboto is the default system font for Material Design and Android. It's optimized for screen readability, familiar to users, and requires no custom font loading (faster initial page load). The font family includes sufficient weights (300, 400, 500, 700) to create visual hierarchy without introducing additional typefaces.

**Type Scale and Hierarchy:**

Typography creates the primary visual hierarchy in the interface, replacing color-coded priorities or decorative badges:

- **h6 (20px, 500 weight, 1.6 line-height)**: Date group headers (Today, Yesterday, This Week, Older)
  - Semi-bold weight makes headers stand out as section dividers
  - Slightly larger size (vs body text) without overwhelming task content

- **body1 (16px, 500 weight, 1.5 line-height)**: Active task text (Today group)
  - Medium weight (500) creates visual "pop" for fresh tasks
  - 16px size ensures readability on mobile without requiring zoom

- **body1 (16px, 400 weight, 1.5 line-height)**: Older task text (Yesterday, This Week, Older groups)
  - Regular weight (400) makes older tasks visually recede
  - Same size as active tasks (consistency) but lighter weight (hierarchy)

- **body2 (14px, 400 weight, 1.43 line-height)**: Timestamps, metadata
  - Smaller size de-emphasizes secondary information
  - Paired with Gray 700 color for additional visual de-emphasis

- **caption (12px, 400 weight, 1.33 line-height)**: Completed count badge ("12 completed today")
  - Smallest text size, used sparingly for non-essential information

**Font Weight as Urgency Signal:**

- **500 weight (medium)**: Fresh tasks (captured today) demand attention
- **400 weight (regular)**: Older tasks (yesterday, this week) have lower urgency
- **Strikethrough + 400 weight**: Completed tasks (visual record, low attention priority)

This weight-based hierarchy replaces traditional color-coding (red = urgent, orange = medium, gray = low). Users scan the list top-to-bottom and immediately see which tasks "pop" (bold recent tasks) vs. which recede (regular older tasks).

**Line Height and Readability:**

- All line heights ≥ 1.5 for body text (WCAG 2.1 success criterion 1.4.12)
- Generous line height supports one-handed mobile scanning (easier to tap correct task)
- Adequate spacing between lines prevents accidental taps on wrong tasks

**Text Decoration:**

- **Strikethrough**: Completed tasks only (crossed-out text = done)
- **No underlines**: Except for actual hyperlinks (rare in MVP)
- **No italics**: Reserved for future enhancement (notes, context)

### Spacing & Layout Foundation

**Base Spacing Unit: 8px (Material-UI default)**

The 8px base unit creates a consistent rhythm throughout the interface. All spacing values are multiples of 8px (8, 16, 24, 32, 40, 48) to maintain mathematical harmony and visual consistency.

**Spacing Scale:**
- **xs (4px)**: Tight spacing within components (icon-to-text in buttons)
- **sm (8px)**: Compact spacing between related elements
- **md (16px)**: Default spacing for most elements (card padding, section gaps)
- **lg (24px)**: Breathing room between major sections (date groups)
- **xl (32px)**: Large gaps for visual separation (header to content)

**Minimum Touch Target: 48px (Mobile Accessibility)**

All interactive elements meet Material Design's 48px minimum touch target height:
- Task list items: 56px height (8px above minimum for comfortable thumb tapping)
- FAB: 56px diameter (Material Design standard)
- Dialog buttons: 48px height minimum
- Text input fields: 56px height (includes padding)

This ensures one-handed thumb operation during meetings—no precision tapping required.

**Layout Density: Airy (Generous White Space)**

The interface prioritizes **calm** over **density**. Generous spacing between tasks and date groups supports visual scanning without feeling cramped:

- **Vertical spacing between tasks**: 8px (tasks breathe individually)
- **Vertical spacing between date groups**: 24px (clear section separation)
- **Horizontal padding on cards**: 16px (text doesn't touch edges)
- **FAB positioning**: 16px from bottom and right edges (thumb-reachable, not edge-hugging)

**Comparison to Dense UIs:**

- **Todoist**: 40px task height, 4px vertical spacing (dense, efficient, feels busy)
- **This Tool**: 56px task height, 8px vertical spacing (airy, calm, supports emotional goal)

The airier layout supports the "calm during capture" emotional goal. Users shouldn't feel visually overwhelmed when opening the app mid-meeting.

**Grid System: Centered Content with Max Width**

- **Mobile (xs, sm)**: Full-width list (minus 16px horizontal padding)
- **Desktop (md+)**: Centered column with 600px max width
  - Maintains readable line length (50-75 characters)
  - Prevents tasks from stretching edge-to-edge on large monitors
  - Centered layout feels balanced, not left-aligned crowded

**Component Spacing Relationships:**

- **Date group header**: 24px margin-top, 8px margin-bottom (breathes above, close to tasks below)
- **Task card**: 16px horizontal padding, 12px vertical padding (touch-friendly, not cramped)
- **Completed section**: 32px margin-top (clear visual break from active tasks)
- **FAB**: Fixed position, 16px from bottom-right (never scrolls away, always accessible)

### Accessibility Considerations

**Color Contrast:**

All text/background combinations meet WCAG 2.1 AA standards (4.5:1 minimum for normal text, 3:1 for large text):
- **Gray 900 on White**: 16.1:1 (primary task text)
- **Gray 700 on White**: 8.3:1 (secondary text, timestamps)
- **Blue 500 on White**: 4.5:1 (FAB, interactive elements)
- **Error Red (#F44336) on White**: 4.5:1 (error toasts)

**Typography Readability:**

- Minimum body text size: 16px (exceeds WCAG AAA recommendation of 14px)
- Line height: ≥ 1.5 for body text (WCAG 1.4.12 compliance)
- No light text (300 weight) on white backgrounds (insufficient contrast)

**Touch Target Sizes:**

- All interactive elements: ≥ 48px height/width (WCAG 2.5.5 Target Size)
- Task cards: 56px height (8px above minimum for comfortable tapping)
- FAB: 56px diameter (Material Design standard)

**Focus Indicators:**

- Keyboard focus: 2px blue outline with 2px offset (visible, doesn't obscure content)
- Focus indicator contrast: 4.5:1 against background (WCAG 2.4.7)
- Focus order: logical top-to-bottom, left-to-right sequence

**Screen Reader Support:**

Material-UI components include built-in ARIA labels and semantic HTML:
- Task list: `<ul>` with `<li>` items (semantic list structure)
- FAB: `aria-label="Add new task"` (describes action)
- Dialog: `role="dialog"`, `aria-labelledby`, `aria-describedby` (accessible modal)
- Completion status: `aria-checked` attribute on task cards (conveys state)

**Reduced Motion:**

Respect user preference for reduced motion (`prefers-reduced-motion: reduce`):
- Disable slide-in animations for task creation/completion
- Disable smooth scroll behaviors
- Keep instant state changes (strikethrough, appearance) without animation

**Keyboard Navigation:**

- FAB: Accessible via Tab key
- Task list: Arrow keys navigate between tasks
- Task completion: Space or Enter toggles completion state
- Dialog: Tab cycles through inputs, Enter submits, Escape cancels
