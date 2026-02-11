<script lang="ts">
  import { Trophy, Flame, Zap } from 'lucide-svelte';
  import Badge from '$lib/components/ui/Badge.svelte';

  export let level = 1;
  export let currentXP = 0;
  export let xpToNextLevel = 100;
  export let streak = 0;

  $: progress = (currentXP / xpToNextLevel) * 100;
</script>

<div class="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-3 shadow-md">
  <div class="container mx-auto flex flex-wrap items-center justify-between gap-6">
    <!-- Level -->
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <Trophy class="w-5 h-5" />
      </div>
      <div class="leading-tight">
        <p class="text-xs opacity-90 font-medium">Level</p>
        <p class="text-2xl font-bold">{level}</p>
      </div>
    </div>

    <!-- XP Progress -->
    <div class="flex-1 min-w-[200px] max-w-md">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-sm opacity-90 font-medium">XP Progress</span>
        <span class="text-sm font-semibold">{currentXP} / {xpToNextLevel}</span>
      </div>
      <div class="h-3 w-full bg-white/20 rounded-full overflow-hidden">
        <div 
          class="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
          style="width: {progress}%"
        />
      </div>
    </div>

    <!-- Streak -->
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-yellow-500/20 backdrop-blur-sm flex items-center justify-center">
        <Flame class="w-5 h-5 text-yellow-300" />
      </div>
      <div class="leading-tight">
        <p class="text-xs opacity-90 font-medium">Streak</p>
        <p class="text-2xl font-bold">{streak}<span class="text-base">d</span></p>
      </div>
    </div>

    <!-- Quick XP Badge -->
    <Badge variant="warning" class="flex items-center gap-1.5 text-sm px-3 py-1.5">
      <Zap class="w-4 h-4" />
      +{Math.floor(Math.random() * 20) + 5} XP
    </Badge>
  </div>
</div>
