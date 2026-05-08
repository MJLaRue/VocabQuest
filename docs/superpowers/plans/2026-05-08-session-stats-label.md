# Session Stats Label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the unlabeled inline accuracy/cards row below the flashcard with a "Session Stats" section using labeled stat-card tiles, making it clear the numbers are session-scoped.

**Architecture:** Single-file markup change in `FlashcardsPage.svelte`. No logic changes — the `$sessionStats` derived store already provides the correct session-scoped values. The new layout wraps the existing values in individual card tiles under a muted "Session Stats" heading.

**Tech Stack:** Svelte 4, Tailwind CSS (via CDN classes), TypeScript

---

### Task 1: Replace the session stats markup

**Files:**
- Modify: `client/src/routes/FlashcardsPage.svelte:416-428`

- [ ] **Step 1: Open the file and locate the stats block**

  In `client/src/routes/FlashcardsPage.svelte`, find the `<!-- Session Stats -->` comment at approximately line 416. The current block looks like this:

  ```svelte
  <!-- Session Stats -->
  <div
    class="flex justify-center gap-8 text-sm text-gray-600 dark:text-gray-400"
  >
    <div>
      <span class="font-medium">Cards:</span>
      {$sessionStats.cardsReviewed}
    </div>
    <div>
      <span class="font-medium">Accuracy:</span>
      {$sessionStats.accuracy}%
    </div>
  </div>
  ```

- [ ] **Step 2: Replace the block with the labeled stat-card layout**

  Replace the entire block above (from `<!-- Session Stats -->` through its closing `</div>`) with:

  ```svelte
  <!-- Session Stats -->
  <div class="text-center">
    <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
      Session Stats
    </p>
    <div class="flex justify-center gap-3">
      <div class="flex flex-col items-center px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        <span class="text-xl font-bold text-gray-900 dark:text-gray-50 leading-tight">
          {$sessionStats.cardsReviewed}
        </span>
        <span class="text-[0.65rem] uppercase tracking-wide text-gray-400 dark:text-gray-600 mt-0.5">
          Cards
        </span>
      </div>
      <div class="flex flex-col items-center px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        <span class="text-xl font-bold text-gray-900 dark:text-gray-50 leading-tight">
          {$sessionStats.accuracy}%
        </span>
        <span class="text-[0.65rem] uppercase tracking-wide text-gray-400 dark:text-gray-600 mt-0.5">
          Accuracy
        </span>
      </div>
    </div>
  </div>
  ```

- [ ] **Step 3: Run the type-checker to confirm no errors**

  ```bash
  cd client && npm run check
  ```

  Expected: no errors or type warnings related to the changed file.

- [ ] **Step 4: Start the dev server and verify visually**

  ```bash
  cd client && npm run dev
  ```

  Open the app in a browser and navigate to the flashcard page (`/practice`). Verify:
  - A muted "SESSION STATS" heading appears below the navigation row
  - Two tiles appear side by side: one showing the cards reviewed count, one showing accuracy %
  - Both values update correctly as you answer cards
  - Toggle dark mode (if available) and confirm the tiles use the dark surface colors

- [ ] **Step 5: Commit**

  ```bash
  git add client/src/routes/FlashcardsPage.svelte
  git commit -m "feat: label session stats section with stat-card tiles"
  ```
