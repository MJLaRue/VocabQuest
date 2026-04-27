<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { push } from "svelte-spa-router";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Badge from "$lib/components/ui/Badge.svelte";
  import { X, Trophy, Target, Zap, Clock } from "lucide-svelte";
  import { confetti } from "$lib/utils/confetti";

  export let show = false;
  export let cardsReviewed = 0;
  export let correctAnswers = 0;
  export let xpEarned = 0;
  export let duration = 0; // in seconds
  export let completedSets = 0;
  export let levelUp = false;
  export let newLevel = 1;
  export let lastTestDate: string | null = null;

  const dispatch = createEventDispatcher<{
    close: void;
    continue: void;
  }>();

  $: daysSinceTest = lastTestDate
    ? Math.floor((Date.now() - new Date(lastTestDate).getTime()) / 86_400_000)
    : null;
  $: showTestNudge = daysSinceTest === null || daysSinceTest >= 3;

  $: accuracy =
    cardsReviewed > 0 ? Math.round((correctAnswers / cardsReviewed) * 100) : 0;
  $: minutes = Math.floor(duration / 60);
  $: seconds = duration % 60;

  function handleClose() {
    dispatch("close");
    push("/stats");
  }

  function handleContinue() {
    dispatch("continue");
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains("modal-backdrop")) {
      handleClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      handleClose();
    }
  }

  function goToTest() {
    dispatch("close");
    push("/test");
  }

  // Trigger confetti on level up
  $: if (show && levelUp) {
    setTimeout(() => confetti(), 300);
  }
</script>

{#if show}
  <div
    class="modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    role="presentation"
    on:click={handleClickOutside}
    on:keydown={handleKeydown}
  >
    <Card class="max-w-lg w-full">
      <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {levelUp ? "🎉 Level Up!" : "Study Session Complete"}
          </h2>
          <button
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            on:click={handleClose}
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        {#if levelUp}
          <div
            class="py-6 px-4 bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-xl text-center"
          >
            <Trophy class="w-16 h-16 mx-auto mb-3 text-yellow-500" />
            <p class="text-3xl font-bold text-teal-900 dark:text-teal-100">
              Level {newLevel}
            </p>
            <p class="text-sm text-teal-600 dark:text-teal-400 mt-1">
              Congratulations on your progress!
            </p>
          </div>
        {/if}

        <!-- Completed Sets Badge -->
        {#if completedSets > 0}
          <div
            class="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border-2 border-yellow-400 dark:border-yellow-600"
          >
            <Trophy class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <span
              class="text-sm font-semibold text-yellow-900 dark:text-yellow-100"
            >
              {completedSets}
              {completedSets === 1 ? "Set" : "Sets"} Completed! (+{completedSets *
                50} Bonus XP)
            </span>
          </div>
        {/if}

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="flex items-center gap-2 mb-1">
              <Target class="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >Cards Reviewed</span
              >
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {cardsReviewed}
            </p>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="flex items-center gap-2 mb-1">
              <Trophy class="w-4 h-4 text-green-600 dark:text-green-400" />
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >Accuracy</span
              >
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {accuracy}%
            </p>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="flex items-center gap-2 mb-1">
              <Zap class="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >XP Earned</span
              >
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              +{xpEarned}
            </p>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="flex items-center gap-2 mb-1">
              <Clock class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >Duration</span
              >
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </p>
          </div>
        </div>

        <!-- Encouragement -->
        <div class="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl text-center">
          <p class="text-sm text-teal-700 dark:text-teal-300">
            {#if accuracy >= 90}
              Outstanding work! You're mastering these words! 🌟
            {:else if accuracy >= 75}
              Great job! Keep up the excellent progress! 💪
            {:else if accuracy >= 60}
              Good effort! Practice makes perfect! 📚
            {:else}
              Don't give up! Every review helps you improve! 🚀
            {/if}
          </p>
        </div>

        <!-- Test Nudge -->
        {#if showTestNudge}
          <div class="mx-4 mb-4 p-3.5 rounded-xl bg-blue-950 border border-blue-800 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-blue-900 flex items-center justify-content-center flex-shrink-0 text-lg">📋</div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-blue-300">Ready to prove it?</p>
              <p class="text-xs text-gray-500 mt-0.5">
                {#if daysSinceTest === null}
                  You haven't taken a test yet. Lock in what you've learned.
                {:else}
                  You haven't taken a test in {daysSinceTest} days. Lock in what you've learned.
                {/if}
              </p>
            </div>
            <button
              on:click={goToTest}
              class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
            >
              Take Test →
            </button>
          </div>
        {/if}

        <!-- Actions -->
        <div class="flex gap-3">
          <Button variant="secondary" on:click={handleClose} class="flex-1">
            View Stats
          </Button>
          <Button variant="primary" on:click={handleContinue} class="flex-1">
            Continue Studying
          </Button>
        </div>
      </div>
    </Card>
  </div>
{/if}
