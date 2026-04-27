# Quick Start Modal + Test CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-time quick-start welcome modal explaining study modes and a three-surface test nudge system to drive regular test-taking.

**Architecture:** localStorage controls quick-start visibility; `GET /progress/gamification` is extended with `lastTestDate`; test nudge logic lives in three surfaces (banner on flashcard page, session summary modal, stats chart). SessionSummaryModal is wired up for the first time — triggered after the set-complete celebration closes.

**Tech Stack:** Svelte 4, TypeScript, Tailwind CSS, lucide-svelte, Express/Node.js, Sequelize.

---

## File Map

| Action | File |
|--------|------|
| Modify | `server/routes/progress.js` — add `lastTestDate` to gamification response |
| Modify | `client/src/lib/api/progress.ts` — add `getGamification()` API call |
| **Create** | `client/src/lib/components/flashcard/QuickStartModal.svelte` |
| **Create** | `client/src/lib/components/flashcard/TestNudgeBanner.svelte` |
| Modify | `client/src/lib/components/flashcard/ControlBar.svelte` — add `?` help button + `openHelp` event |
| Modify | `client/src/lib/components/flashcard/SessionSummaryModal.svelte` — add `lastTestDate` prop + test nudge |
| Modify | `client/src/routes/FlashcardsPage.svelte` — wire modal, banner, summary; fetch `lastTestDate` |
| Modify | `client/src/lib/components/stats/TestTrendChart.svelte` — empty state CTA + inline nudge |

---

## Task 1: Backend — add `lastTestDate` to gamification endpoint

**Files:**
- Modify: `server/routes/progress.js` (the `router.get('/gamification', ...)` handler, around line 333)

- [ ] **Step 1: Add the `lastTestDate` query inside the gamification route**

Find the `router.get('/gamification', requireAuth, async (req, res) => {` block. Replace the `res.json(...)` call at the end so it reads:

```js
// Get gamification data
router.get('/gamification', requireAuth, async (req, res) => {
  try {
    let gamification = await UserGamification.findOne({
      where: { userId: req.user.id }
    });

    if (!gamification) {
      gamification = await UserGamification.create({ userId: req.user.id });
    }

    // Update streak
    const streak = gamification.updateStreak();
    await gamification.save();

    // Find the most recent completed test
    const { TestAttempt } = require('../models');
    const lastTest = await TestAttempt.findOne({
      where: { userId: req.user.id, status: 'completed' },
      order: [['completed_at', 'DESC']],
      attributes: ['completed_at']
    });
    const lastTestDate = lastTest ? lastTest.getDataValue('completed_at') : null;

    res.json({
      totalXp: gamification.totalXp,
      level: gamification.level,
      dailyStreak: streak,
      unlockedAchievements: gamification.unlockedAchievements || [],
      lastTestDate
    });
  } catch (error) {
    console.error('Get gamification error:', error);
    res.status(500).json({ error: 'Failed to get gamification data' });
  }
});
```

Note: `xpToNext` was removed — it referenced `UserGamification.getXPForLevel` which is a static method that may not exist. If it was being used by the frontend, verify and restore. The frontend gamification store derives level progress client-side via `getLevelProgress()`.

- [ ] **Step 2: Manual smoke test**

Start the server (`npm run dev:server`) and hit the endpoint:

```bash
curl -s -b cookies.txt http://localhost:3001/api/progress/gamification | jq .
```

(Authenticate first via the app and copy the session cookie. Or just verify via the browser Network tab after logging in.)

Expected: JSON response includes `"lastTestDate": null` (or an ISO date string if you've taken tests).

- [ ] **Step 3: Commit**

```bash
git add server/routes/progress.js
git commit -m "feat: add lastTestDate to gamification endpoint"
```

---

## Task 2: Frontend — add `getGamification()` to progress API

**Files:**
- Modify: `client/src/lib/api/progress.ts`

- [ ] **Step 1: Add the type and API function**

At the end of `client/src/lib/api/progress.ts`, before the closing of `progressApi`, add the `getGamification` function and its return type:

```ts
export interface GamificationData {
  totalXp: number;
  level: number;
  dailyStreak: number;
  unlockedAchievements: string[];
  lastTestDate: string | null;
}
```

Then inside the `progressApi` object (after `getLeaderboard`):

```ts
  getGamification: () =>
    apiClient<GamificationData>('/progress/gamification'),
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd client && npx tsc --noEmit
```

Expected: No errors relating to `progress.ts`.

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/api/progress.ts
git commit -m "feat: add getGamification API call with lastTestDate"
```

---

## Task 3: QuickStartModal component

**Files:**
- Create: `client/src/lib/components/flashcard/QuickStartModal.svelte`

- [ ] **Step 1: Create the component**

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { X, HelpCircle } from 'lucide-svelte';

  export let show = false;

  const dispatch = createEventDispatcher<{ close: void }>();

  function close() {
    localStorage.setItem('vocabquest-quickstart-seen', '1');
    dispatch('close');
  }

  function handleBackdrop(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('qs-backdrop')) close();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  function goToTest() {
    close();
    push('/test');
  }
</script>

{#if show}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="qs-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    on:click={handleBackdrop}
    on:keydown={handleKeydown}
  >
    <div
      class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qs-title"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 p-6 pb-4">
        <div class="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <HelpCircle class="w-5 h-5 text-white" />
        </div>
        <div class="flex-1">
          <h2 id="qs-title" class="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">Welcome to VocabQuest!</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Here's how to level up your vocabulary</p>
        </div>
        <button
          on:click={close}
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="px-6 pb-6 space-y-5">
        <!-- Mode grid -->
        <div>
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Study Modes</p>
          <div class="grid grid-cols-2 gap-2.5">
            <!-- Practice -->
            <div class="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-bold text-teal-700 dark:text-teal-300">Practice</span>
                <span class="text-xs font-semibold px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full">10 XP</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Flip cards — mark Known or Not Yet. Best for first exposure.</p>
            </div>

            <!-- Quiz -->
            <div class="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-bold text-sky-700 dark:text-sky-300">Quiz</span>
                <span class="text-xs font-semibold px-1.5 py-0.5 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-full">15 XP</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Pick the correct definition from 4 choices.</p>
            </div>

            <!-- Context -->
            <div class="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-bold text-purple-700 dark:text-purple-300">Context</span>
                <span class="text-xs font-semibold px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">15 XP</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Fill in the blank in a real sentence.</p>
            </div>

            <!-- Relate -->
            <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-bold text-amber-700 dark:text-amber-300">Relate</span>
                <span class="text-xs font-semibold px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full">15 XP</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Find synonyms and antonyms.</p>
            </div>

            <!-- Typing — full width -->
            <div class="col-span-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-bold text-rose-700 dark:text-rose-300">Typing</span>
                <span class="text-xs font-semibold px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-full">20 XP</span>
                <span class="ml-auto text-xs font-bold px-2 py-0.5 bg-rose-600 text-white rounded-full uppercase tracking-wide">Hardest</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">See the definition — spell the word from memory. Save this for last!</p>
            </div>
          </div>
        </div>

        <!-- Suggested progression -->
        <div class="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Suggested Progression</p>
          <div class="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span class="px-2.5 py-1 bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-full">Practice</span>
            <span class="text-gray-400">→</span>
            <span class="px-2.5 py-1 bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 rounded-full">Quiz</span>
            <span class="text-gray-400">→</span>
            <span class="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-full">Context</span>
            <span class="text-gray-400">→</span>
            <span class="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-full">Relate</span>
            <span class="text-gray-400">→</span>
            <span class="px-2.5 py-1 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-full">Typing</span>
          </div>
        </div>

        <!-- Tests callout -->
        <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
          <span class="text-xl mt-0.5">📋</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              After studying a set of words, take a <strong class="font-semibold">Test</strong> to lock in your learning — and earn bonus XP.
            </p>
            <button
              on:click={goToTest}
              class="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Go to Tests →
            </button>
          </div>
        </div>

        <!-- Footer CTA -->
        <div class="flex justify-end pt-1">
          <button
            on:click={close}
            class="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
          >
            Start Studying →
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/lib/components/flashcard/QuickStartModal.svelte
git commit -m "feat: add QuickStartModal component"
```

---

## Task 4: Add `?` help button to ControlBar

**Files:**
- Modify: `client/src/lib/components/flashcard/ControlBar.svelte`

- [ ] **Step 1: Add `HelpCircle` import and `openHelp` event**

At the top of the `<script>` block, change the import line:

```ts
import { Search, Zap, HelpCircle } from 'lucide-svelte';
```

Add `openHelp: void` to the dispatcher type:

```ts
const dispatch = createEventDispatcher<{
  modeChange: { mode: StudyMode };
  toggleAdvanced: void;
  search: { query: string };
  posSelect: { pos: string | null };
  openHelp: void;
}>();
```

- [ ] **Step 2: Add the button in the desktop layout (right column)**

Find the desktop right column (the `<!-- Advanced Toggle (Right) -->` section). Replace it:

```svelte
<!-- Advanced Toggle + Help (Right) -->
<div class="flex items-center gap-3 justify-end">
  <div
    class="flex items-center gap-2 transition-opacity {advancedApplies ? '' : 'opacity-40'}"
    title={advancedApplies
      ? 'Type the answer instead of selecting from options'
      : 'Advanced mode applies to Context and Relate modes'}
  >
    <Zap class="w-4 h-4 text-amber-500" />
    <Toggle
      checked={advanced}
      onCheckedChange={() => dispatch('toggleAdvanced')}
    />
    <span class="text-sm text-gray-600 dark:text-gray-400">Advanced</span>
  </div>
  <button
    type="button"
    on:click={() => dispatch('openHelp')}
    class="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    aria-label="How to use VocabQuest"
    title="How to use VocabQuest"
  >
    <HelpCircle class="w-4 h-4" />
  </button>
</div>
```

- [ ] **Step 3: Add the button in the mobile layout (row 1)**

Find the mobile `<!-- Row 1: Mode Dropdown + Advanced Toggle -->` section. Replace it:

```svelte
<!-- Row 1: Mode Dropdown + Advanced Toggle + Help -->
<div class="flex items-center gap-2">
  <select
    value={mode}
    on:change={handleModeDropdownChange}
    class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
  >
    {#each modes as { value, label }}
      <option {value}>{label}</option>
    {/each}
  </select>

  <div
    class="flex items-center gap-1.5 transition-opacity {advancedApplies ? '' : 'opacity-40'}"
    title="Advanced (typing instead of multiple choice)"
  >
    <Zap class="w-4 h-4 text-amber-500" />
    <Toggle
      checked={advanced}
      onCheckedChange={() => dispatch('toggleAdvanced')}
    />
  </div>

  <button
    type="button"
    on:click={() => dispatch('openHelp')}
    class="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
    aria-label="How to use VocabQuest"
  >
    <HelpCircle class="w-4 h-4" />
  </button>
</div>
```

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/components/flashcard/ControlBar.svelte
git commit -m "feat: add help button to ControlBar"
```

---

## Task 5: TestNudgeBanner component

**Files:**
- Create: `client/src/lib/components/flashcard/TestNudgeBanner.svelte`

- [ ] **Step 1: Create the component**

```svelte
<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { ClipboardList, X } from 'lucide-svelte';

  export let lastTestDate: string | null;

  $: daysSince = lastTestDate
    ? Math.floor((Date.now() - new Date(lastTestDate).getTime()) / 86_400_000)
    : null;

  $: shouldShow = daysSince === null || daysSince >= 3;

  let dismissed = false;

  $: if (typeof sessionStorage !== 'undefined') {
    dismissed = sessionStorage.getItem('vocabquest-test-banner-dismissed') === '1';
  }

  function dismiss() {
    dismissed = true;
    sessionStorage.setItem('vocabquest-test-banner-dismissed', '1');
  }

  function goToTest() {
    push('/test');
  }
</script>

{#if shouldShow && !dismissed}
  <div class="bg-blue-50 dark:bg-blue-950/50 border-b border-blue-200 dark:border-blue-800">
    <div class="container mx-auto px-4 py-2.5 flex items-center gap-3">
      <ClipboardList class="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
      <p class="flex-1 text-sm text-blue-800 dark:text-blue-200 font-medium">
        {#if daysSince === null}
          You haven't taken a test yet — ready to check what you know?
        {:else}
          No test in {daysSince} day{daysSince === 1 ? '' : 's'} — ready to check your progress?
        {/if}
      </p>
      <button
        on:click={goToTest}
        class="text-xs font-bold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0"
      >
        Go to Test
      </button>
      <button
        on:click={dismiss}
        class="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
{/if}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/lib/components/flashcard/TestNudgeBanner.svelte
git commit -m "feat: add TestNudgeBanner component"
```

---

## Task 6: Add test nudge to SessionSummaryModal

**Files:**
- Modify: `client/src/lib/components/flashcard/SessionSummaryModal.svelte`

- [ ] **Step 1: Add `lastTestDate` prop and import**

In the `<script>` block, add after the existing exports:

```ts
import { push } from 'svelte-spa-router';

export let lastTestDate: string | null = null;

$: daysSinceTest = lastTestDate
  ? Math.floor((Date.now() - new Date(lastTestDate).getTime()) / 86_400_000)
  : null;

$: showTestNudge = daysSinceTest === null || daysSinceTest >= 3;

function goToTest() {
  dispatch('close');
  push('/test');
}
```

Note: `push` from `svelte-spa-router` is already imported at the top of this file.

- [ ] **Step 2: Add the test nudge section before the Actions buttons**

Find `<!-- Actions -->` in the template. Insert just before it:

```svelte
<!-- Test nudge -->
{#if showTestNudge}
  <div class="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
    <span class="text-xl flex-shrink-0">📋</span>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-blue-800 dark:text-blue-200">Ready to prove it?</p>
      <p class="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
        {#if daysSinceTest === null}
          You haven't taken a test yet. Lock in what you've learned!
        {:else}
          You haven't taken a test in {daysSinceTest} day{daysSinceTest === 1 ? '' : 's'}. Lock in what you've learned!
        {/if}
      </p>
    </div>
    <button
      on:click={goToTest}
      class="text-xs font-bold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0 self-center"
    >
      Take Test →
    </button>
  </div>
{/if}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/components/flashcard/SessionSummaryModal.svelte
git commit -m "feat: add test nudge to SessionSummaryModal"
```

---

## Task 7: Wire everything into FlashcardsPage

**Files:**
- Modify: `client/src/routes/FlashcardsPage.svelte`

This task wires up `QuickStartModal`, `TestNudgeBanner`, and `SessionSummaryModal` and fetches `lastTestDate`.

- [ ] **Step 1: Add imports**

Add to the import block in the `<script>` section (after existing flashcard imports):

```ts
import QuickStartModal from "$lib/components/flashcard/QuickStartModal.svelte";
import TestNudgeBanner from "$lib/components/flashcard/TestNudgeBanner.svelte";
import SessionSummaryModal from "$lib/components/flashcard/SessionSummaryModal.svelte";
import { progressApi } from "$lib/api/progress";
```

- [ ] **Step 2: Add local state variables**

Add after the existing `let showNewSetConfirm = false;` line:

```ts
let showQuickStart = false;
let showSummary = false;
let lastTestDate: string | null = null;
```

- [ ] **Step 3: Fetch `lastTestDate` and check quick start in `onMount`**

Inside `onMount`, after the existing `await progress.checkAndResumeSession(mode)` call, add:

```ts
// Fetch lastTestDate for test nudge surfaces
try {
  const gam = await progressApi.getGamification();
  lastTestDate = gam.lastTestDate;
} catch {
  // non-critical — banner just won't show
}

// Show quick start modal on first visit
if (!localStorage.getItem('vocabquest-quickstart-seen')) {
  showQuickStart = true;
}
```

- [ ] **Step 4: Handle `openHelp` event and session summary**

Add a handler for the new ControlBar event:

```ts
function handleOpenHelp() {
  showQuickStart = true;
}
```

Modify `handleCloseCelebration` to detect set completion and trigger the session summary:

```ts
function handleCloseCelebration() {
  const closedType = currentCelebration?.type;
  showNextCelebration();
  if (closedType === 'setComplete' && currentCelebration === null) {
    triggerSessionEnd();
  }
}

async function triggerSessionEnd() {
  try {
    await progress.endSession();
  } catch {
    // endSession throws if no active session — safe to ignore
  }
  showSummary = true;
}
```

- [ ] **Step 5: Wire the template**

In the template, update `<ControlBar>` to listen for the `openHelp` event:

```svelte
<ControlBar
  {mode}
  {advanced}
  selectedPos={$vocab.filters.pos}
  on:modeChange={({ detail }) => handleModeChange(detail.mode)}
  on:toggleAdvanced={handleToggleAdvanced}
  on:search={handleSearch}
  on:posSelect={handlePOSSelect}
  on:openHelp={handleOpenHelp}
/>
```

Add `<TestNudgeBanner>` immediately after `<ControlBar>` (before `<Container>`):

```svelte
<TestNudgeBanner {lastTestDate} />
```

Add `<QuickStartModal>` and `<SessionSummaryModal>` just before the closing `</div>` of the page root (alongside `<CelebrationOverlay>` and `<Footer>`):

```svelte
<QuickStartModal
  show={showQuickStart}
  on:close={() => (showQuickStart = false)}
/>

<SessionSummaryModal
  show={showSummary}
  cardsReviewed={$progress.lastSessionSummary?.cardsReviewed ?? 0}
  correctAnswers={$progress.lastSessionSummary?.correctAnswers ?? 0}
  xpEarned={$progress.lastSessionSummary?.xpEarned ?? 0}
  duration={$progress.lastSessionSummary?.duration ?? 0}
  completedSets={$progress.lastSessionSummary?.completedSets ?? 0}
  levelUp={$progress.lastSessionSummary?.levelUp ?? false}
  newLevel={$gamification?.level ?? 1}
  {lastTestDate}
  on:close={() => (showSummary = false)}
  on:continue={() => (showSummary = false)}
/>
```

- [ ] **Step 6: Commit**

```bash
git add client/src/routes/FlashcardsPage.svelte
git commit -m "feat: wire QuickStartModal, TestNudgeBanner, SessionSummaryModal into FlashcardsPage"
```

---

## Task 8: Test score trend CTA on Stats page

**Files:**
- Modify: `client/src/lib/components/stats/TestTrendChart.svelte`

- [ ] **Step 1: Add `push` import and derived CTA values**

`push` is already imported. Add these reactive declarations after the existing `$: xLabels` declaration:

```ts
$: lastCompletedAt = chartData.length > 0
  ? chartData[chartData.length - 1].completedAt
  : null;

$: daysSinceTest = lastCompletedAt
  ? Math.floor((Date.now() - new Date(lastCompletedAt).getTime()) / 86_400_000)
  : null;

$: showInlineNudge = hasEnoughData && daysSinceTest !== null && daysSinceTest >= 3;
```

- [ ] **Step 2: Replace the empty state (0 tests) with a CTA version**

Find the `{#if chartData.length === 0}` branch. Replace its content:

```svelte
{#if chartData.length === 0}
  <!-- Empty state: no tests taken -->
  <div class="flex flex-col items-center justify-center py-10 text-center">
    <div class="text-4xl mb-3">🎯</div>
    <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No tests yet</p>
    <p class="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs">
      Tests lock in your learning and show where to focus. They also earn bonus XP!
    </p>
    <button
      type="button"
      on:click={() => push('/test')}
      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
    >
      Take a Test Now →
    </button>
  </div>
```

- [ ] **Step 3: Add a nudge to the 1-test branch too**

Find the `{:else if chartData.length === 1}` block. Replace its content:

```svelte
{:else if chartData.length === 1}
  <div class="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
    <TrendingUp class="w-10 h-10 mb-3 opacity-40" />
    <p class="text-sm font-medium">Only 1 test completed</p>
    <p class="text-xs mt-1 mb-4">Complete one more test to see your trend</p>
    {#if showInlineNudge}
      <button
        type="button"
        on:click={() => push('/test')}
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
      >
        Take a Test →
      </button>
    {/if}
  </div>
```

- [ ] **Step 4: Add the inline nudge below the chart**

After the closing `</div>` of the `{:else}` (chart) branch, but still inside the outer `{#if chartData.length === 0} ... {:else} ... {/if}` block, add the nudge at the end of the `{:else}` block, just before its closing `{/if}`:

The inline nudge goes right after the `</div>` that closes the `<div class="relative select-none">` tooltip wrapper. Add:

```svelte
{#if showInlineNudge}
  <div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
    <p class="text-xs text-gray-500 dark:text-gray-400">
      Keep your trend going — last test was {daysSinceTest} day{daysSinceTest === 1 ? '' : 's'} ago.
    </p>
    <button
      type="button"
      on:click={() => push('/test')}
      class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap ml-3"
    >
      Take a Test →
    </button>
  </div>
{/if}
```

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/components/stats/TestTrendChart.svelte
git commit -m "feat: add test CTA to TestTrendChart empty state and inline nudge"
```

---

## Task 9: Manual QA

- [ ] **Step 1: Run the full dev stack**

```bash
npm run dev
```

Open http://localhost:3000 in the browser.

- [ ] **Step 2: Verify QuickStartModal**

1. Open the app in an incognito window (clean localStorage) — modal should appear automatically.
2. Click ✕ or "Start Studying →" — modal closes, `vocabquest-quickstart-seen = "1"` appears in localStorage.
3. Reload — modal does NOT reappear automatically.
4. Click the `?` icon in the ControlBar — modal opens again.

- [ ] **Step 3: Verify TestNudgeBanner**

1. With a fresh account (no tests), confirm the banner appears on the flashcard page with "You haven't taken a test yet".
2. Click ✕ — banner disappears for the session.
3. Open a new tab to the flashcard page — banner reappears (sessionStorage is tab-scoped).
4. Take a test and return — if test was just taken, banner should NOT show. (You may need to wait or temporarily lower the 3-day threshold in `TestNudgeBanner.svelte` for local testing.)

- [ ] **Step 4: Verify SessionSummaryModal**

1. Complete a full set of cards (mark all as Known via the Practice mode).
2. After the celebration overlay closes, the `SessionSummaryModal` should appear.
3. If no test taken in 3+ days (or never), the "Ready to prove it?" card should appear above the action buttons.
4. Clicking "Take Test →" should navigate to `/test` and close the modal.

- [ ] **Step 5: Verify Stats page CTA**

1. Navigate to `/stats`.
2. With no tests: the `TestTrendChart` card should show "No tests yet" with a "Take a Test Now →" button.
3. With some tests but last test ≥ 3 days ago: chart renders normally, inline nudge appears below.
4. With a recent test (< 3 days): no nudge shown.

- [ ] **Step 6: Final commit if any QA fixes were made**

```bash
git add -p
git commit -m "fix: QA fixes for quick start modal and test CTA"
```
