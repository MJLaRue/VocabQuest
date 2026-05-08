# Session Stats Label — Design Spec

**Date:** 2026-05-08

## Problem

The Cards and Accuracy stats displayed below the flashcard are session-scoped, but there is no label indicating this. Users who have also seen the all-time accuracy on the Stats page could reasonably assume the two numbers are the same metric. The section needs a clear "Session Stats" label to remove ambiguity.

## Solution

Replace the existing inline stats row with a labeled stat-card layout (Option C). Each stat gets its own small card tile with a large number and a small label below it. A muted "SESSION STATS" uppercase heading sits above the tiles.

## Affected File

`client/src/routes/FlashcardsPage.svelte` — lines 416–428 (the `<!-- Session Stats -->` block).

## Current Markup

```html
<!-- Session Stats -->
<div class="flex justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
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

## New Markup

```html
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

## Design Decisions

- **Label copy:** "Session Stats" (not "This Session" or "Current Session") — short and unambiguous.
- **Label style:** Muted uppercase tracking — visually recessive so it doesn't compete with the card or navigation.
- **Stat tiles:** White/dark-800 background with a subtle border and shadow — consistent with other card surfaces in the app.
- **No new data fetched:** Both values already come from the `$sessionStats` derived store; this is a pure presentation change.
- **Extensible:** The tile layout makes it easy to add a third stat (e.g. duration) later without restructuring.

## Out of Scope

- Adding a duration or streak tile — deferred; not requested and would require deciding on formatting.
- Changes to the Stats page or any all-time accuracy display.
