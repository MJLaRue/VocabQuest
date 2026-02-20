<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { AlertCircle, TrendingDown } from 'lucide-svelte';

  export let weakWords: Array<{
    word: string;
    vocab_id: number;
    accuracy: number;
  }> = [];

  $: safeWeakWords = weakWords || [];

  function getAccuracyVariant(
    accuracy: number
  ): 'primary' | 'success' | 'warning' | 'error' {
    if (accuracy >= 75) return 'success';
    if (accuracy >= 50) return 'warning';
    return 'error';
  }
</script>

<Card>
  <div class="p-6 space-y-4">
    <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
      <AlertCircle class="w-5 h-5 text-amber-600 dark:text-amber-400" />
      Words to Focus On
    </h3>

    {#if safeWeakWords.length === 0}
      <div
        class="py-8 text-center text-gray-500 dark:text-gray-400"
      >
        <TrendingDown class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p class="text-sm">Great job! No weak words to review.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        {#each safeWeakWords as word, index}
          <div
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span
                class="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400"
              >
                {index + 1}
              </span>
              <span class="font-medium text-gray-900 dark:text-gray-100">
                {word.word}
              </span>
            </div>
            <Badge variant={getAccuracyVariant(word.accuracy)}>
              {word.accuracy}% accuracy
            </Badge>
          </div>
        {/each}
      </div>

      <div
        class="pt-4 border-t border-gray-200 dark:border-gray-700 text-center"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Review these {safeWeakWords.length} words to improve your mastery
        </p>
      </div>
    {/if}
  </div>
</Card>
