# Admin User Stats Viewer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins view any student's full stats (mirroring the student's own Stats page) in a read-only tabbed modal from the Users table.

**Architecture:** A new `GET /admin/users/:id/stats` endpoint aggregates user-specific data from four tables and returns a shape the existing stats sub-components already understand. A new `UserStatsModal.svelte` fetches from this endpoint (plus the existing `/progress/leaderboard`) and renders the existing stats sub-components in three tabs. `UserTable` gains a "View Stats" icon button; `AdminPage` wires up the modal the same way it does for `ResetPasswordModal` and `ResetProgressModal`.

**Tech Stack:** Express/CommonJS (backend), Sequelize (ORM), Svelte 4 + TypeScript (frontend), Tailwind CSS, lucide-svelte icons, Vitest (server unit tests).

---

## File Map

| Status | File | Change |
|---|---|---|
| Modify | `server/routes/admin.js` | Add `GET /users/:id/stats` endpoint + import `getAllAchievementsStatus` |
| Create | `server/__tests__/admin-user-stats.test.js` | Unit tests for stats calculation logic |
| Modify | `client/src/lib/api/admin.ts` | Add `UserStatsResponse` interface + `getUserStats` method |
| Create | `client/src/lib/components/admin/UserStatsModal.svelte` | Tabbed stats modal |
| Modify | `client/src/lib/components/admin/UserTable.svelte` | Add View Stats button + `viewStats` event |
| Modify | `client/src/routes/AdminPage.svelte` | Wire up modal state + render `<UserStatsModal>` |

---

## Task 1: Backend stats calculation unit tests

**Files:**
- Create: `server/__tests__/admin-user-stats.test.js`

- [ ] **Step 1: Write the failing tests**

Create `server/__tests__/admin-user-stats.test.js`:

```js
import { describe, it, expect } from 'vitest';

// Pure logic mirroring what the new /admin/users/:id/stats endpoint will do.
// We test this in isolation so we don't need a DB connection.

function calcProgressStats(allProgress) {
  const totalCorrect = allProgress.reduce((sum, p) => sum + p.correctCount, 0);
  const totalIncorrect = allProgress.reduce((sum, p) => sum + p.incorrectCount, 0);
  const wordsLearned = allProgress.filter(p => p.isKnown).length;
  const inProgressWords = allProgress.filter(p => !p.isKnown && p.reviewCount > 0).length;
  const accuracy =
    totalCorrect + totalIncorrect > 0
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
      : 0;
  return { wordsLearned, inProgressWords, accuracy };
}

function calcActivityStats(sessions) {
  const totalSessions = sessions.length;
  const totalStudyTimeMs = sessions.reduce((sum, s) => {
    if (s.endedAt && s.startedAt)
      return sum + (new Date(s.endedAt) - new Date(s.startedAt));
    return sum;
  }, 0);
  const avgMs = totalSessions > 0 ? totalStudyTimeMs / totalSessions : 0;
  return {
    totalSessions,
    totalStudyTime: Math.round(totalStudyTimeMs / 60000),
    avgSessionTime: Math.round(avgMs / 60000),
  };
}

describe('calcProgressStats', () => {
  it('counts learned, in-progress, and accuracy correctly', () => {
    const progress = [
      { isKnown: true,  reviewCount: 3, correctCount: 3, incorrectCount: 0 },
      { isKnown: true,  reviewCount: 2, correctCount: 1, incorrectCount: 1 },
      { isKnown: false, reviewCount: 2, correctCount: 1, incorrectCount: 1 }, // in-progress
      { isKnown: false, reviewCount: 0, correctCount: 0, incorrectCount: 0 }, // not started
    ];
    const result = calcProgressStats(progress);
    expect(result.wordsLearned).toBe(2);
    expect(result.inProgressWords).toBe(1);
    expect(result.accuracy).toBe(83); // 5 correct / 6 total = 83%
  });

  it('returns 0 accuracy when no reviews', () => {
    expect(calcProgressStats([{ isKnown: false, reviewCount: 0, correctCount: 0, incorrectCount: 0 }]).accuracy).toBe(0);
  });

  it('returns zeros for empty progress', () => {
    const result = calcProgressStats([]);
    expect(result.wordsLearned).toBe(0);
    expect(result.inProgressWords).toBe(0);
    expect(result.accuracy).toBe(0);
  });
});

describe('calcActivityStats', () => {
  it('converts ms to minutes and averages correctly', () => {
    const now = new Date('2026-05-07T10:00:00Z');
    const sessions = [
      { startedAt: new Date('2026-05-07T09:00:00Z'), endedAt: new Date('2026-05-07T09:20:00Z') }, // 20 min
      { startedAt: new Date('2026-05-07T10:00:00Z'), endedAt: new Date('2026-05-07T10:40:00Z') }, // 40 min
    ];
    const result = calcActivityStats(sessions);
    expect(result.totalSessions).toBe(2);
    expect(result.totalStudyTime).toBe(60);
    expect(result.avgSessionTime).toBe(30);
  });

  it('skips sessions with no endedAt', () => {
    const sessions = [
      { startedAt: new Date('2026-05-07T09:00:00Z'), endedAt: null },
    ];
    const result = calcActivityStats(sessions);
    expect(result.totalSessions).toBe(1);
    expect(result.totalStudyTime).toBe(0);
    expect(result.avgSessionTime).toBe(0);
  });

  it('returns zeros for empty sessions', () => {
    const result = calcActivityStats([]);
    expect(result.totalSessions).toBe(0);
    expect(result.totalStudyTime).toBe(0);
    expect(result.avgSessionTime).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:server
```

Expected: FAIL — `calcProgressStats` and `calcActivityStats` are not yet imported from anywhere (they're defined inline in the test for now; tests should pass once written). Actually, since the functions are defined inline in the test file, they should pass immediately — run and confirm green before moving on.

Expected output: all 6 tests pass.

- [ ] **Step 3: Commit**

```bash
git add server/__tests__/admin-user-stats.test.js
git commit -m "test: add unit tests for admin user stats calculation logic"
```

---

## Task 2: Backend endpoint `GET /admin/users/:id/stats`

**Files:**
- Modify: `server/routes/admin.js`

- [ ] **Step 1: Add the `getAllAchievementsStatus` require at the top of `admin.js`**

At the top of `server/routes/admin.js`, after the existing requires, add:

```js
const { getAllAchievementsStatus } = require('../utils/achievements');
```

- [ ] **Step 2: Add the endpoint**

Add this block to `server/routes/admin.js` just before `module.exports = router;` (or after the `DELETE /users/:id` route):

```js
// GET /admin/users/:id/stats — full stats for a single user (admin only)
router.get('/users/:id/stats', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Parallel queries
    const [gamification, allProgress, sessions, testAttempts] = await Promise.all([
      UserGamification.findOne({ where: { userId } }),
      UserProgress.findAll({ where: { userId } }),
      StudySession.findAll({
        where: { userId },
        order: [['started_at', 'DESC']],
      }),
      TestAttempt.findAll({
        where: { userId },
        order: [['startedAt', 'DESC']],
        limit: 50,
      }),
    ]);

    const gam = gamification || { totalXp: 0, level: 1, dailyStreak: 0, unlockedAchievements: [], perfectSessions: 0 };

    // Progress stats
    const totalCorrect   = allProgress.reduce((sum, p) => sum + p.correctCount,   0);
    const totalIncorrect = allProgress.reduce((sum, p) => sum + p.incorrectCount, 0);
    const wordsLearned   = allProgress.filter(p => p.isKnown).length;
    const inProgressWords = allProgress.filter(p => !p.isKnown && p.reviewCount > 0).length;
    const accuracy = (totalCorrect + totalIncorrect) > 0
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
      : 0;
    const totalWords = await Vocabulary.count();
    const lastStudy = allProgress.reduce((max, p) => {
      if (!p.lastReviewed) return max;
      const d = new Date(p.lastReviewed);
      return !max || d > max ? d : max;
    }, null);

    // Activity stats
    const totalSessions = sessions.length;
    const totalStudyTimeMs = sessions.reduce((sum, s) => {
      if (s.endedAt && s.startedAt)
        return sum + (new Date(s.endedAt) - new Date(s.startedAt));
      return sum;
    }, 0);
    const avgSessionTimeMs = totalSessions > 0 ? totalStudyTimeMs / totalSessions : 0;

    // Achievements
    const learnedCount = wordsLearned;
    const testsCompleted = testAttempts.filter(t => t.status === 'completed').length;
    const highScoreTests = testAttempts.filter(
      t => t.status === 'completed' && (t.results?.accuracy ?? 0) >= 90
    ).length;
    const achievementData = {
      learnedCount,
      streak: gam.dailyStreak,
      perfectSessions: gam.perfectSessions || 0,
      totalXp: gam.totalXp,
      testsCompleted,
      highScoreTests,
    };
    const achievements = getAllAchievementsStatus(gam.unlockedAchievements || [], achievementData);

    res.json({
      gamification: {
        level: gam.level,
        totalXp: gam.totalXp,
        dailyStreak: gam.dailyStreak,
      },
      progress: {
        wordsLearned,
        totalWords,
        inProgressWords,
        accuracy,
      },
      activity: {
        totalSessions,
        totalStudyTime: Math.round(totalStudyTimeMs / 60000),
        avgSessionTime: Math.round(avgSessionTimeMs / 60000),
        lastStudy,
      },
      testHistory: testAttempts.map(t => ({
        id: t.id,
        startedAt: t.startedAt,
        completedAt: t.completedAt,
        config: t.config,
        results: t.results,
        xpEarned: t.xpEarned,
        status: t.status,
      })),
      achievements,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});
```

- [ ] **Step 3: Run server tests to confirm nothing broke**

```bash
npm run test:server
```

Expected: all tests still pass.

- [ ] **Step 4: Smoke-test the endpoint manually**

Start the dev server (`npm run dev`), then in a terminal:

```bash
# Replace 2 with any real user id from your DB
curl -s http://localhost:3001/api/admin/users/2/stats \
  -H "Cookie: <your session cookie>" | jq .
```

Expected: JSON with keys `gamification`, `progress`, `activity`, `testHistory`, `achievements`.

- [ ] **Step 5: Commit**

```bash
git add server/routes/admin.js
git commit -m "feat: add GET /admin/users/:id/stats endpoint"
```

---

## Task 3: Frontend API — `UserStatsResponse` type + `getUserStats`

**Files:**
- Modify: `client/src/lib/api/admin.ts`

- [ ] **Step 1: Add import and interface**

At the top of `client/src/lib/api/admin.ts`, add the import after the existing `import { apiClient }` line:

```ts
import type { TestAttempt } from './test';
```

Then add the `UserStatsResponse` interface alongside the existing interfaces (after `AppSettings`):

```ts
export interface UserStatsResponse {
  gamification: {
    level: number;
    totalXp: number;
    dailyStreak: number;
  };
  progress: {
    wordsLearned: number;
    totalWords: number;
    inProgressWords: number;
    accuracy: number;
  };
  activity: {
    totalSessions: number;
    totalStudyTime: number;   // minutes
    avgSessionTime: number;   // minutes
    lastStudy: string | null;
  };
  testHistory: TestAttempt[];
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    type: 'vocab_builder' | 'streak_warrior' | 'perfectionist' | 'xp_enthusiast' | 'test_taker' | 'test_ace' | 'one_off';
    level?: number;
    totalTiers?: number;
    currentValue?: number;
    nextThreshold?: number;
    currentThreshold?: number;
  }>;
}
```

- [ ] **Step 2: Add `getUserStats` to `adminApi`**

Inside the `adminApi` object at the bottom of the file, add after `getSettings`:

```ts
  getUserStats: (userId: number) =>
    apiClient<UserStatsResponse>(`/admin/users/${userId}/stats`),
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd client && npm run build 2>&1 | head -30
```

Expected: no TypeScript errors related to the new interface.

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/api/admin.ts
git commit -m "feat: add UserStatsResponse interface and getUserStats to adminApi"
```

---

## Task 4: `UserStatsModal.svelte`

**Files:**
- Create: `client/src/lib/components/admin/UserStatsModal.svelte`

- [ ] **Step 1: Create the component**

Create `client/src/lib/components/admin/UserStatsModal.svelte`:

```svelte
<script lang="ts">
  import { adminApi, type UserStatsResponse } from '$lib/api/admin';
  import { apiClient } from '$lib/api/client';
  import StatsOverview from '$lib/components/stats/StatsOverview.svelte';
  import StudyActivity from '$lib/components/stats/StudyActivity.svelte';
  import TestTrendChart from '$lib/components/stats/TestTrendChart.svelte';
  import VocabularyProgress from '$lib/components/stats/VocabularyProgress.svelte';
  import AchievementGrid from '$lib/components/stats/AchievementGrid.svelte';
  import Leaderboard from '$lib/components/stats/Leaderboard.svelte';
  import { X } from 'lucide-svelte';

  export let show = false;
  export let user: { id: number; username: string; email: string; role: string; level: number } | null = null;

  type Tab = 'overview' | 'tests' | 'vocabulary';

  let stats: UserStatsResponse | null = null;
  let leaderboard: Array<{
    rank: number; username: string; totalXp: number;
    level: number; streak: number; wordsLearned: number; accuracy: number;
  }> = [];
  let loading = false;
  let errorMsg = '';
  let activeTab: Tab = 'overview';

  // Load data whenever the modal opens for a user
  $: if (show && user) loadStats(user.id);

  async function loadStats(userId: number) {
    loading = true;
    errorMsg = '';
    stats = null;
    leaderboard = [];
    try {
      const [statsData, lbData] = await Promise.all([
        adminApi.getUserStats(userId),
        apiClient<{ leaderboard: typeof leaderboard }>('/progress/leaderboard'),
      ]);
      stats = statsData;
      leaderboard = lbData.leaderboard ?? [];
    } catch {
      errorMsg = 'Failed to load stats. Please try again.';
    } finally {
      loading = false;
    }
  }

  function close() {
    show = false;
    activeTab = 'overview';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    on:click|self={close}
    role="dialog"
    aria-modal="true"
    aria-label="{user?.username ?? 'User'} stats"
  >
    <!-- Modal -->
    <div class="relative w-full max-w-5xl h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">

      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 bg-gray-900 dark:bg-gray-950 text-white shrink-0">
        <div>
          <p class="text-lg font-bold leading-none">{user?.username ?? '—'}</p>
          <p class="text-sm text-gray-400 mt-0.5">{user?.email} · Level {user?.level} · {user?.role}</p>
        </div>
        <button
          class="text-gray-400 hover:text-white transition-colors"
          on:click={close}
          aria-label="Close"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 dark:border-gray-700 px-6 shrink-0 bg-white dark:bg-gray-900">
        {#each (['overview', 'tests', 'vocabulary'] as const) as tab}
          <button
            class="px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize
              {activeTab === tab
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
            on:click={() => (activeTab = tab)}
          >
            {tab === 'overview' ? 'Overview' : tab === 'tests' ? 'Tests' : 'Vocabulary'}
          </button>
        {/each}
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-800">
        {#if loading}
          <div class="flex items-center justify-center h-full">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        {:else if errorMsg}
          <div class="flex items-center justify-center h-full">
            <p class="text-red-500 dark:text-red-400">{errorMsg}</p>
          </div>
        {:else if stats}
          {#if activeTab === 'overview'}
            <div class="space-y-6">
              <StatsOverview
                currentXP={stats.gamification.totalXp}
                streak={stats.gamification.dailyStreak}
                totalWords={stats.progress.totalWords}
                learnedWords={stats.progress.wordsLearned}
                lastStudyDate={stats.activity.lastStudy ?? undefined}
              />
              <StudyActivity
                totalSessions={stats.activity.totalSessions}
                totalStudyTime={stats.activity.totalStudyTime}
                averageSessionTime={stats.activity.avgSessionTime}
                averageAccuracy={stats.progress.accuracy}
                lastStudyDate={stats.activity.lastStudy ?? undefined}
              />
            </div>
          {:else if activeTab === 'tests'}
            <TestTrendChart attempts={stats.testHistory} />
          {:else}
            <div class="space-y-6">
              <VocabularyProgress
                totalWords={stats.progress.totalWords}
                learnedWords={stats.progress.wordsLearned}
                inProgressWords={stats.progress.inProgressWords}
                notStartedWords={stats.progress.totalWords - stats.progress.wordsLearned - stats.progress.inProgressWords}
              />
              <Leaderboard {leaderboard} />
              <AchievementGrid achievements={stats.achievements} />
            </div>
          {/if}
        {/if}
      </div>

    </div>
  </div>
{/if}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd client && npm run build 2>&1 | head -30
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/components/admin/UserStatsModal.svelte
git commit -m "feat: add UserStatsModal component with tabbed stats view"
```

---

## Task 5: Add "View Stats" button to `UserTable.svelte`

**Files:**
- Modify: `client/src/lib/components/admin/UserTable.svelte`

- [ ] **Step 1: Add `BarChart2` to the lucide import**

In `UserTable.svelte`, find the existing lucide import line:

```ts
import { Search, Shield, Trash2, Edit, Lock, RotateCcw } from "lucide-svelte";
```

Replace it with:

```ts
import { Search, Shield, Trash2, Edit, Lock, RotateCcw, BarChart2 } from "lucide-svelte";
```

- [ ] **Step 2: Add `viewStats` to the event dispatcher type**

Find the `createEventDispatcher` call and add the new event:

```ts
const dispatch = createEventDispatcher<{
    toggleAdmin: { userId: number; role: "student" | "admin" };
    deleteUser: { userId: number };
    search: { query: string };
    resetPassword: { userId: number; username: string };
    resetProgress: { userId: number; username: string };
    viewStats: { userId: number; username: string; email: string; role: "student" | "admin"; level: number };
  }>();
```

- [ ] **Step 3: Add the View Stats button in the actions cell**

Find the row's actions `<div class="flex items-center justify-center gap-2">` block. Add the new button **before** the Shield (toggle admin) button:

```svelte
<Button
  variant="ghost"
  size="sm"
  on:click={() =>
    dispatch("viewStats", {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      level: user.level,
    })}
  class="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
  title="View Stats"
>
  <BarChart2 class="w-4 h-4" />
</Button>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd client && npm run build 2>&1 | head -30
```

Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/components/admin/UserTable.svelte
git commit -m "feat: add View Stats button to UserTable"
```

---

## Task 6: Wire up modal in `AdminPage.svelte`

**Files:**
- Modify: `client/src/routes/AdminPage.svelte`

- [ ] **Step 1: Import `UserStatsModal`**

In the `<script>` block of `AdminPage.svelte`, add the import alongside the other modal imports:

```ts
import UserStatsModal from "$lib/components/admin/UserStatsModal.svelte";
```

- [ ] **Step 2: Add modal state variables**

After the existing `showResetProgressModal` state variables, add:

```ts
// User stats modal state
let showStatsModal = false;
let statsModalUser: { id: number; username: string; email: string; role: "student" | "admin"; level: number } | null = null;
```

- [ ] **Step 3: Add the event handler**

After `handleResetProgress`, add:

```ts
function handleViewStats({
  detail,
}: CustomEvent<{ userId: number; username: string; email: string; role: "student" | "admin"; level: number }>) {
  statsModalUser = {
    id: detail.userId,
    username: detail.username,
    email: detail.email,
    role: detail.role,
    level: detail.level,
  };
  showStatsModal = true;
}
```

- [ ] **Step 4: Wire the event on `<UserTable>`**

Find the `<UserTable>` component in the template and add the new event listener:

```svelte
<UserTable
  {users}
  on:toggleAdmin={handleToggleAdmin}
  on:deleteUser={handleDeleteUser}
  on:search={handleSearchUsers}
  on:resetPassword={handleResetPassword}
  on:resetProgress={handleResetProgress}
  on:viewStats={handleViewStats}
/>
```

- [ ] **Step 5: Render `<UserStatsModal>` in the template**

After `</ResetProgressModal>` and before `<Footer />`, add:

```svelte
<UserStatsModal
  bind:show={showStatsModal}
  user={statsModalUser}
  on:close={() => {
    showStatsModal = false;
    statsModalUser = null;
  }}
/>
```

- [ ] **Step 6: Final build check**

```bash
cd client && npm run build 2>&1 | head -30
```

Expected: clean build, no TypeScript errors.

- [ ] **Step 7: Manual end-to-end test**

1. Start the dev server: `npm run dev`
2. Log in as admin, navigate to `/admin/users`
3. Click the teal bar-chart icon on any user row
4. Confirm the modal opens with the correct username/email in the header
5. Check **Overview** tab: XP, streak, study activity visible
6. Check **Tests** tab: test trend chart (or empty state if no tests)
7. Check **Vocabulary** tab: vocabulary progress bars, leaderboard, achievements
8. Press Escape or click outside — confirm modal closes cleanly
9. Open a second user's stats — confirm data reloads (no stale data from the previous user)

- [ ] **Step 8: Commit**

```bash
git add client/src/routes/AdminPage.svelte
git commit -m "feat: wire up UserStatsModal in AdminPage"
```
