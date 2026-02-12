<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import { BookOpen, Check, Clock } from 'lucide-svelte';

  export let totalWords = 0;
  export let learnedWords = 0;
  export let inProgressWords = 0;
  export let notStartedWords = 0;

  $: learnedPercentage =
    totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
  $: inProgressPercentage =
    totalWords > 0 ? Math.round((inProgressWords / totalWords) * 100) : 0;
  $: notStartedPercentage =
    totalWords > 0 ? Math.round((notStartedWords / totalWords) * 100) : 0;

  $: segments = [
    {
      label: 'Learned',
      value: learnedWords,
      percentage: learnedPercentage,
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400',
      icon: Check
    },
    {
      label: 'In Progress',
      value: inProgressWords,
      percentage: inProgressPercentage,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      icon: Clock
    },
    {
      label: 'Not Started',
      value: notStartedWords,
      percentage: notStartedPercentage,
      color: 'bg-gray-400',
      textColor: 'text-gray-500 dark:text-gray-400',
      icon: BookOpen
    }
  ];
</script>

<Card>
  <div class="p-6 space-y-6">
    <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
      <BookOpen class="w-5 h-5 text-teal-600 dark:text-teal-400" />
      Vocabulary Progress
    </h3>

    <!-- Stacked Bar Chart -->
    <div class="space-y-4">
      <div class="relative h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
        {#each segments as segment}
          {#if segment.percentage > 0}
            <div
              class="{segment.color} flex items-center justify-center transition-all duration-500"
              style="width: {segment.percentage}%"
            >
              {#if segment.percentage > 10}
                <span class="text-white text-sm font-semibold">
                  {segment.percentage}%
                </span>
              {/if}
            </div>
          {/if}
        {/each}
      </div>

      <!-- Legend -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each segments as segment}
          <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="w-4 h-4 {segment.color} rounded-full" />
            <div class="flex items-center gap-2 flex-1">
              <svelte:component this={segment.icon} class="w-4 h-4 {segment.textColor}" />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {segment.label}
              </span>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold {segment.textColor}">
                {segment.value}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {segment.percentage}%
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Summary -->
    <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
          Total Vocabulary
        </span>
        <span class="text-lg font-bold text-gray-900 dark:text-gray-100">
          {totalWords} words
        </span>
      </div>
    </div>
  </div>
</Card>
