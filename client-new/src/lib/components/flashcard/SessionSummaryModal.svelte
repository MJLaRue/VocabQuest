<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { X, Trophy, Target, Zap, Clock } from 'lucide-svelte';
  import { confetti } from '$lib/utils/confetti';

  export let show = false;
  export let cardsReviewed = 0;
  export let correctAnswers = 0;
  export let xpEarned = 0;
  export let duration = 0; // in seconds
  export let levelUp = false;
  export let newLevel = 1;

  const dispatch = createEventDispatcher<{
    close: void;
    continue: void;
  }>();

  $: accuracy =
    cardsReviewed > 0 ? Math.round((correctAnswers / cardsReviewed) * 100) : 0;
  $: minutes = Math.floor(duration / 60);
  $: seconds = duration % 60;

  function handleClose() {
    dispatch('close');
  }

  function handleContinue() {
    dispatch('continue');
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      handleClose();
    }
  }

  // Trigger confetti on level up
  $: if (show && levelUp) {
    setTimeout(() => confetti(), 300);
  }
</script>

{#if show}
  <div
    class="modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    on:click={handleClickOutside}
  >
    <Card class="max-w-lg w-full">
      <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {levelUp ? '🎉 Level Up!' : 'Study Session Complete'}
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

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="flex items-center gap-2 mb-1">
              <Target class="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span class="text-xs text-gray-600 dark:text-gray-400">Cards Reviewed</span>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {cardsReviewed}
            </p>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="flex items-center gap-2 mb-1">
              <Trophy class="w-4 h-4 text-green-600 dark:text-green-400" />
              <span class="text-xs text-gray-600 dark:text-gray-400">Accuracy</span>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {accuracy}%
            </p>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="flex items-center gap-2 mb-1">
              <Zap class="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span class="text-xs text-gray-600 dark:text-gray-400">XP Earned</span>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              +{xpEarned}
            </p>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="flex items-center gap-2 mb-1">
              <Clock class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span class="text-xs text-gray-600 dark:text-gray-400">Duration</span>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {minutes}:{seconds.toString().padStart(2, '0')}
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

        <!-- Actions -->
        <div class="flex gap-3">
          <Button variant="outline" on:click={handleClose} class="flex-1">
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
