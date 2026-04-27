# Quick Start Modal + Test CTA Design

**Date:** 2026-04-26  
**Status:** Approved

---

## Overview

Two related features to improve new-user orientation and drive regular test-taking:

1. **Quick Start Modal** — a one-time welcome screen explaining study modes and the recommended progression, re-triggerable via a help button.
2. **Test CTA System** — a repeating nudge that surfaces at three points in the app to encourage users to take tests regularly.

A note on streak achievement tracking: the current behavior (streak achievements checked only on answer submission, not on page load) was reviewed and confirmed intentional — no changes needed there.

---

## Feature 1: Quick Start Modal

### What it does

A modal shown automatically the first time a user reaches the flashcard page after registering. It explains all five study modes, shows the recommended progression order, and includes a brief callout about tests. It can be re-opened at any time via a `?` icon near the mode selector on the flashcard page.

### Persistence

- **Storage:** `localStorage` key `vocabquest-quickstart-seen` (string `"1"`).
- **On first visit:** key is absent → modal opens automatically.
- **On dismiss:** key is set regardless of which dismiss path was used (✕ button, "Start Studying" CTA, or clicking outside).
- **Re-trigger:** `?` icon button added to `ControlBar.svelte` (right-aligned next to existing controls). Clicking it opens the modal regardless of the localStorage key. The key is not cleared on re-open (so auto-show won't fire again).
- **No server changes required.**

### Layout

Single-screen modal, centered overlay, ~480px wide. Dark-themed to match the app. Sections:

1. **Header** — VocabQuest logo/icon, title "Welcome to VocabQuest!", subtitle, ✕ dismiss button.
2. **Mode grid** — 2-column grid of mode cards (Practice, Quiz, Context, Relate) plus Typing spanning full width and tagged "Hardest". Each card shows: emoji icon, mode name, XP badge, one-line description.
3. **Suggested Progression** — pill chain: `Practice → Quiz → Context → Relate → Typing`. Brief copy: "Start here and work your way up as words become familiar."
4. **Tests callout** — compact callout at the bottom of the modal. Copy: "After studying a set of words, take a **Test** to lock in your learning — and earn bonus XP." Includes a link to `/test`.
5. **Footer** — "Start Studying →" CTA button (right-aligned). Both this and the ✕ button dismiss the modal and set the localStorage key.

### Mode card details

| Mode | Color | XP | Description |
|---|---|---|---|
| Practice | Teal | 10 XP | Flip cards — mark Known or Not Yet. Best for first exposure. |
| Quiz | Sky blue | 15 XP | Pick the correct definition from 4 choices. |
| Context | Purple | 15 XP | Fill in the blank in a real sentence. |
| Relate | Amber | 15 XP | Find synonyms and antonyms. |
| Typing | Rose (full width, "Hardest" badge) | 20 XP | See the definition — spell the word from memory. Save this for last. |

### `?` Re-trigger button

- Placed inside `ControlBar.svelte`, right-aligned next to existing controls, using the `HelpCircle` icon from `lucide-svelte`.
- Opens the modal by setting `showQuickStart = true` via a callback prop passed down from `FlashcardsPage`. No routing change needed.

### Component

New file: `client/src/lib/components/flashcard/QuickStartModal.svelte`  
Mounted inside `FlashcardsPage.svelte`, shown/hidden via a local `showQuickStart` boolean.

---

## Feature 2: Test CTA System

### Goal

Surface a "take a test" nudge at natural moments when the user has been actively studying but hasn't tested recently. The nudge should feel helpful, not nagging.

### Trigger condition

**Banner** fires when: `lastTestDate` is ≥ 3 days ago (or the user has never taken a test). Being on the flashcard page is sufficient intent signal — no need to require a completed answer first.

**Session-summary nudge** fires when: the same ≥ 3 day condition is true at the time the session ends (the user has obviously just studied).

`lastTestDate` is fetched by adding it to the existing `GET /progress/gamification` response (see Data requirement below).

The **stats page CTA** always renders regardless of recency, using empty-state vs. inline-nudge variants.

### Surface A — Session Summary Modal

Location: bottom of the existing `SessionSummaryModal.svelte`, below the session stats.

Shown when: trigger condition is met at the time the session ends.

Design: a compact card with a clipboard emoji, heading "Ready to prove it?", a one-line message showing days since last test (e.g., "You haven't taken a test in 4 days"), and a "Take Test →" button that navigates to `/test`.

No dismiss control — it's shown once per session summary, then gone.

### Surface B — Flashcard Page Banner

Location: between `GamificationBar` and the main flashcard content area in `FlashcardsPage.svelte`.

Shown when: trigger condition is met on page load or after first answer submission of the session.

Design: a slim banner (single row) with a clipboard emoji, short copy ("No test in N days — ready to check your progress?"), a "Go to Test" link, and a ✕ dismiss button.

Dismiss behavior: sets `vocabquest-test-banner-dismissed` in `sessionStorage` (cleared automatically when the tab closes, so it can reappear next session). The stats-page CTA is unaffected by this dismiss.

### Surface C — Stats Page / Test Score Trend

Location: inside or below the existing `TestTrendChart.svelte` component in the Stats page.

Two states:

**Empty state** (user has never taken a test): replaces the chart area with a centered card — target emoji, "No tests yet", a brief value prop sentence ("Tests lock in your learning and show where to focus. They also earn bonus XP!"), and a "Take a Test Now →" button.

**Inline nudge** (has test data but last test was ≥ 3 days ago): a single line below the chart — "Keep your trend going — last test was N days ago." with a "Take a Test →" link. Quiet, never dismissible here (stats page is opt-in navigation).

### Data requirement

Need to know the date of the user's most recent completed test. Options:

- **Option 1 (preferred):** Add `lastTestDate` to the existing `GET /progress/gamification` response. The server can compute it with a single query against `TestAttempt` (`WHERE userId = ? AND status = 'completed' ORDER BY completedAt DESC LIMIT 1`). Zero new endpoint.
- **Option 2:** New `GET /progress/last-test-date` endpoint. Slightly cleaner separation but an extra round trip.

Recommend Option 1 — the gamification endpoint is already called on page load; piggybacking avoids an additional fetch.

### New files

- `client/src/lib/components/flashcard/TestNudgeBanner.svelte` — Surface B
- Logic for Surface A added inline to `SessionSummaryModal.svelte`
- Logic for Surface C added inline to `TestTrendChart.svelte` or its parent (`StatsPage.svelte`)

---

## Out of scope

- Server-side persistence of "quick start seen" state (localStorage is sufficient).
- Push notifications or email nudges.
- Any change to streak achievement check timing (confirmed correct as-is).
