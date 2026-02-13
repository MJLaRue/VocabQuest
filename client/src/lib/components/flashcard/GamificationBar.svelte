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
  <div
    class="container mx-auto flex flex-wrap items-center justify-between gap-4"
  >
    <!-- Level -->
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
      >
        <Trophy class="w-5 h-5" />
      </div>
      <div class="leading-tight">
        <p class="text-xs opacity-90 font-medium">Level</p>
        <p class="text-2xl font-bold">{actualLevel}</p>
      </div>
    </div>

    <!-- XP Progress -->
    <div class="flex-1 min-w-[200px] max-w-md">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-sm opacity-90 font-medium">XP Progress</span>
        <span class="text-sm font-semibold"
          >{xpIntoLevel} / {xpNeededForLevel}</span
        >
      </div>
      <div class="h-3 w-full bg-white/20 rounded-full overflow-hidden">
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

    <!-- Streak -->
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-full bg-yellow-500/20 backdrop-blur-sm flex items-center justify-center"
      >
        <Flame class="w-5 h-5 text-yellow-300" />
      </div>
      <div class="leading-tight">
        <p class="text-xs opacity-90 font-medium">Streak</p>
        <p class="text-2xl font-bold">
          {streak}<span class="text-base">d</span>
        </p>
      </div>
    </div>

    <!-- Correct Streak Bonus -->
    <Badge
      variant="warning"
      class="flex items-center gap-1.5 text-sm px-3 py-1.5"
    >
      <Zap class="w-4 h-4" />
      +{correctStreakBonus} XP
    </Badge>
  </div>
</div>
