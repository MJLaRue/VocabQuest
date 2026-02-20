<script lang="ts">
  import Card from "$lib/components/ui/Card.svelte";
  import Badge from "$lib/components/ui/Badge.svelte";
  import { Award, Lock, Star, Flame, Book, Trophy } from "lucide-svelte";
  import type { ComponentType } from "svelte";

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
    type:
      | "vocab_builder"
      | "streak_warrior"
      | "perfectionist"
      | "xp_enthusiast"
      | "one_off";
    level?: number;
    totalTiers?: number;
    currentValue?: number;
    nextThreshold?: number;
    currentThreshold?: number;
    unlockedAt?: string;
  }> = [];

  $: unlockedCount = achievements.filter((a) => a.unlocked).length;
  $: totalCount = achievements.length;

  function getProgressWidth(achievement: any) {
    if (!achievement.nextThreshold) return 100;
    const current = achievement.currentValue || 0;
    const next = achievement.nextThreshold;
    const start = achievement.currentThreshold || 0;
    return Math.min(
      100,
      Math.max(0, ((current - start) / (next - start)) * 100),
    );
  }
</script>

<Card>
  <div class="p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h3
        class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"
      >
        <Award class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        Achievements
      </h3>
      <Badge variant="primary">
        {unlockedCount} / {totalCount}
      </Badge>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each achievements as achievement}
        <div
          class="p-4 rounded-xl border-2 transition-all relative overflow-hidden {achievement.unlocked
            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-80'}"
        >
          {#if achievement.level && achievement.level > 1}
            <div class="absolute top-2 right-2">
              <span
                class="px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-black rounded-full shadow-sm"
              >
                LVL {achievement.level}
              </span>
            </div>
          {/if}

          <div class="flex items-start gap-4">
            <div
              class="w-16 h-16 shrink-0 rounded-full flex items-center justify-center {achievement.unlocked
                ? 'bg-yellow-100 dark:bg-yellow-900/40'
                : 'bg-gray-200 dark:bg-gray-700'}"
            >
              {#if achievement.unlocked}
                <svelte:component
                  this={iconMap[achievement.icon] || Star}
                  class="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                />
              {:else}
                <Lock class="w-6 h-6 text-gray-400" />
              {/if}
            </div>

            <div class="flex-1 min-w-0">
              <p
                class="font-bold text-base truncate {achievement.unlocked
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400'}"
              >
                {achievement.name}
              </p>
              <p
                class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2"
              >
                {achievement.description}
              </p>

              {#if achievement.type !== "one_off" && achievement.nextThreshold}
                <div class="mt-3 space-y-1.5">
                  <div
                    class="flex items-center justify-between text-[10px] text-gray-500 font-medium uppercase tracking-wider"
                  >
                    <span
                      >{achievement.currentValue} / {achievement.nextThreshold}</span
                    >
                    <span>{Math.round(getProgressWidth(achievement))}%</span>
                  </div>
                  <div
                    class="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500 ease-out"
                      style="width: {getProgressWidth(achievement)}%"
                    ></div>
                  </div>
                </div>
              {:else if achievement.unlocked && achievement.unlockedAt}
                <p
                  class="text-[10px] text-yellow-600 dark:text-yellow-400 mt-2 font-medium uppercase tracking-widest"
                >
                  Unlocked {new Date(
                    achievement.unlockedAt,
                  ).toLocaleDateString()}
                </p>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</Card>
