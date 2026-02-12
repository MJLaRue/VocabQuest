<script lang="ts">
  import { Trophy, Flame, Target, Calendar } from "lucide-svelte";
  import { getLevelProgress } from "$lib/utils/gamification";

  export let currentXP = 0;
  export let streak = 0;
  export let totalWords = 0;
  export let learnedWords = 0;
  export let lastStudyDate: string | undefined = undefined;

  $: levelInfo = getLevelProgress(currentXP);
  $: level = levelInfo.level;
  $: progress = levelInfo.progress;
  $: xpIntoLevel = levelInfo.xpIntoLevel;
  $: xpNeededForLevel = levelInfo.xpNeededForNextLevel;
  $: masteryPercentage =
    totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

  function formatLastStudy(dateString: string | undefined) {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    const isToday = now.toDateString() === date.toDateString();
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    }

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  }
</script>

<div
  class="bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 text-white rounded-2xl p-8 shadow-xl"
>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <!-- Left Column: Level and Progress Bars -->
    <div class="flex flex-col gap-6">
      <!-- Level Circle -->
      <div class="flex justify-center">
        <div
          class="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex flex-col items-center justify-center border-4 border-white/30"
        >
          <Trophy class="w-12 h-12 mb-1" />
          <p class="text-3xl font-bold">{level}</p>
          <p class="text-xs opacity-90">Level</p>
        </div>
      </div>

      <!-- XP Progress -->
      <div class="space-y-4">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Level Progress</span>
            <span class="text-sm">{xpIntoLevel} / {xpNeededForLevel} XP</span>
          </div>
          <div class="h-3 w-full bg-white/20 rounded-full overflow-hidden">
            <div
              class="h-full bg-white rounded-full transition-all duration-500"
              style="width: {progress}%"
            />
          </div>
          <div
            class="flex items-center justify-between mt-1 text-xs opacity-80"
          >
            <span>Total: {currentXP} XP</span>
            <span
              >{levelInfo.xpAtNextLevel - currentXP} to Level {level + 1}</span
            >
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Vocabulary Mastery</span>
            <span class="text-sm">{learnedWords} / {totalWords} words</span>
          </div>
          <div class="h-3 w-full bg-white/20 rounded-full overflow-hidden">
            <div
              class="h-full bg-yellow-300 rounded-full transition-all duration-500"
              style="width: {masteryPercentage}%"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Stats Grid -->
    <div class="flex items-center justify-center">
      <div class="grid grid-cols-2 gap-x-12 gap-y-8">
        <div class="text-center">
          <div
            class="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 mx-auto"
          >
            <Flame class="w-10 h-10 text-yellow-300" />
          </div>
          <p class="text-3xl font-bold">{streak}</p>
          <p class="text-sm opacity-90 font-medium">Day Streak</p>
        </div>

        <div class="text-center">
          <div
            class="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 mx-auto"
          >
            <Target class="w-10 h-10" />
          </div>
          <p class="text-3xl font-bold">{masteryPercentage}%</p>
          <p class="text-sm opacity-90 font-medium">Mastery</p>
        </div>

        <div class="text-center col-span-2">
          <div
            class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 mx-auto"
          >
            <Calendar class="w-6 h-6" />
          </div>
          <p class="text-lg font-bold">{formatLastStudy(lastStudyDate)}</p>
          <p class="text-xs opacity-80 uppercase tracking-widest font-bold">
            Last Studied
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
