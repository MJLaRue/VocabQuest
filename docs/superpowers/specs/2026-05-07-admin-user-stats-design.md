# Admin User Stats Viewer — Design Spec

**Date:** 2026-05-07  
**Status:** Approved

## Overview

Admins can view any student's full stats from the Users table in the admin dashboard. Clicking a "View Stats" icon on a user row opens a read-only, full-screen modal that mirrors what the student sees on their own Stats page.

## Entry Point

A "View Stats" icon button (bar-chart icon from `lucide-svelte`) is added to each row's action column in `UserTable.svelte`. It dispatches a `viewStats` event with the user's `{ id, username, email, role, level }`. The modal is purely read-only — no admin actions appear inside it.

## Modal Layout

`UserStatsModal.svelte` is a fixed-height, full-screen modal (~90% viewport) with:

- **Header** — dark background, username, email, level badge, close (✕) button
- **3 tabs** — the modal height is fixed; each tab's body scrolls independently:
  - **Overview** — `StatsOverview` + `StudyActivity` components
  - **Tests** — `TestTrendChart` component
  - **Vocabulary** — `VocabularyProgress` + `AchievementGrid` + `Leaderboard` components
- **Loading state** — spinner while data fetches
- **Error state** — inline message if the fetch fails

All stats sub-components are reused as-is; they are props-driven and have no dependency on the auth or progress stores.

## Backend

### New endpoint

`GET /api/admin/users/:id/stats`

Protected by existing admin middleware. Runs 4 queries in parallel:

| Query | Source | Data |
|---|---|---|
| Gamification | `UserGamification` | XP, level, streak |
| Progress + activity | `UserProgress` + `StudySession` | learned/in-progress words, session count, total time, accuracy, last study date, difficult words |
| Test history | `TestAttempt` | Full list for trend chart |
| Achievements | `getAllAchievementsStatus` utility | Achievement statuses |

Response shape mirrors the student's own progress endpoint so existing frontend components need no data-shape changes.

## Frontend API

New method added to `adminApi` in `client/src/lib/api/admin.ts`:

```ts
getUserStats: (userId: number) =>
  apiClient<UserStatsResponse>(`/admin/users/${userId}/stats`)
```

`UserStatsResponse` is a new interface defined alongside existing admin interfaces in the same file. It contains: `gamification`, `progress`, `activity`, `testHistory`, `achievements`.

## Component & Wiring

### `UserStatsModal.svelte` (new)
- **Location:** `client/src/lib/components/admin/UserStatsModal.svelte`
- **Props:** `show: boolean`, `user: { id, username, email, role, level }`
- Fetches data on open via `adminApi.getUserStats(user.id)`
- Maps response to props consumed by each existing stats sub-component
- Manages active tab state internally

### `UserTable.svelte` (modified)
- Adds a "View Stats" icon button to each row's action column
- Dispatches `viewStats: { userId, username, email, role, level }`

### `AdminPage.svelte` (modified)
- Handles `viewStats` event from `UserTable` (same pattern as `resetPassword` / `resetProgress`)
- Binds `showStatsModal`, `statsModalUser` state variables
- Renders `<UserStatsModal>` at the bottom of the template

## Files Changed

| File | Change |
|---|---|
| `server/routes/admin.js` | Add `GET /users/:id/stats` endpoint |
| `client/src/lib/api/admin.ts` | Add `getUserStats` method + `UserStatsResponse` interface |
| `client/src/lib/components/admin/UserStatsModal.svelte` | New component |
| `client/src/lib/components/admin/UserTable.svelte` | Add View Stats button + event |
| `client/src/routes/AdminPage.svelte` | Wire up modal state and component |

## Out of Scope

- No admin actions inside the modal (password reset, progress reset, etc.)
- No editing of any user data from this view
- No changes to existing student-facing routes or components
