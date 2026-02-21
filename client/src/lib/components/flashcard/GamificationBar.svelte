<script lang="ts">
  import { Trophy, Flame, Zap } from "lucide-svelte";
  import Badge from "$lib/components/ui/Badge.svelte";
  import { getLevelProgress } from "$lib/utils/gamification";

  export let currentXP = 0;
  export let streak = 0;
  export let correctStreakBonus = 0;

  $: levelInfo = getLevelProgress(currentXP);
  $: actualLevel = levelInfo.level;
  $: progress = levelInfo.progress;
  $: xpIntoLevel = levelInfo.xpIntoLevel;
  $: xpNeededForLevel = levelInfo.xpNeededForNextLevel;
  $: xpRemaining = levelInfo.xpAtNextLevel - currentXP;
</script>

<div
  class="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-3 shadow-md"
>
  <div class="container mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
    <!-- Left group: Level + Streak + Bonus (always together) -->
    <div class="flex items-center justify-between sm:justify-start gap-4 sm:gap-5">
      <!-- Level -->
      <div class="flex items-center gap-2 sm:gap-3">
        <div
          class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <Trophy class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div class="leading-tight">
          <p class="text-xs opacity-90 font-medium">Level</p>
          <p class="text-xl sm:text-2xl font-bold">{actualLevel}</p>
        </div>
      </div>

      <!-- Streak -->
      <div class="flex items-center gap-2 sm:gap-3">
        <div
          class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-500/20 backdrop-blur-sm flex items-center justify-center"
        >
          <Flame class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
        </div>
        <div class="leading-tight">
          <p class="text-xs opacity-90 font-medium">Streak</p>
          <p class="text-xl sm:text-2xl font-bold">
            {streak}<span class="text-base">d</span>
          </p>
        </div>
      </div>

      <!-- Correct Streak Bonus -->
      <Badge
        variant="warning"
        class="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
      >
        <Zap class="w-3 h-3 sm:w-4 sm:h-4" />
        +{correctStreakBonus} XP
      </Badge>
    </div>

    <!-- XP Progress: full width on mobile, right-aligned on sm+ with max width -->
    <div class="w-full sm:w-auto sm:min-w-[220px] sm:max-w-xs">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs sm:text-sm opacity-90 font-medium">XP Progress</span>
        <span class="text-xs sm:text-sm font-semibold"
          >{xpIntoLevel} / {xpNeededForLevel}</span
        >
      </div>
      <div class="h-2.5 sm:h-3 w-full bg-white/20 rounded-full overflow-hidden">
        <div
          class="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
          style="width: {progress}%"
        />
      </div>
      <div class="flex items-center justify-between mt-1">
        <span class="text-xs opacity-75">Total: {currentXP} XP</span>
        <span class="text-xs opacity-75"
          >{xpRemaining} to level {actualLevel + 1}</span
        >
      </div>
    </div>
  </div>
</div>
