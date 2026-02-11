<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { Award, Lock, Star, Flame, Book, Trophy } from 'lucide-svelte';
  import type { ComponentType } from 'svelte';

  const iconMap: Record<string, ComponentType> = {
    star: Star,
    flame: Flame,
    book: Book,
    trophy: Trophy,
  };

  export let achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
  }> = [];

  $: unlockedCount = achievements.filter((a) => a.unlocked).length;
  $: totalCount = achievements.length;
</script>

<Card>
  <div class="p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Award class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        Achievements
      </h3>
      <Badge variant="primary">
        {unlockedCount} / {totalCount}
      </Badge>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {#each achievements as achievement}
        <div
          class="p-4 rounded-xl border-2 transition-all {achievement.unlocked
            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'}"
        >
          <div class="text-center">
            <div
              class="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center {achievement.unlocked
                ? 'bg-yellow-100 dark:bg-yellow-900/40'
                : 'bg-gray-200 dark:bg-gray-700'}"
            >
              {#if achievement.unlocked}
                <svelte:component this={iconMap[achievement.icon] || Star} class="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              {:else}
                <Lock class="w-6 h-6 text-gray-400" />
              {/if}
            </div>
            <p
              class="font-medium text-sm {achievement.unlocked
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-500 dark:text-gray-400'}"
            >
              {achievement.name}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {achievement.description}
            </p>
            {#if achievement.unlocked && achievement.unlockedAt}
              <p class="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</Card>
