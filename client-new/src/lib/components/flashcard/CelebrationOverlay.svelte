<script lang="ts">
  import { onMount } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  import { Trophy, Award, Star, Flame, Book } from 'lucide-svelte';
  
  export let type: 'levelUp' | 'setComplete' | 'achievement';
  export let level: number = 1;
  export let xpBonus: number = 50;
  export let achievementName: string = '';
  export let achievementId: string = '';
  export let onClose: () => void;
  
  onMount(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Longer duration for celebration messages
    
    return () => clearTimeout(timer);
  });
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
  transition:fade={{ duration: 300 }}
  on:click={onClose}
  on:keydown={(e) => e.key === 'Escape' && onClose()}
  role="button"
  tabindex="0"
>
  <div 
    class="flex flex-col items-center gap-8 p-12 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md mx-4"
    transition:scale={{ duration: 600, easing: elasticOut, start: 0.5 }}
  >
    {#if type === 'levelUp'}
      <!-- Level Up Celebration -->
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
        <div class="relative bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full p-8 shadow-xl">
          <Trophy class="w-20 h-20 text-white drop-shadow-lg" />
        </div>
      </div>
      
      <div class="text-center space-y-4">
        <h2 class="text-5xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent animate-pulse">
          Level Up!
        </h2>
        <div class="space-y-2">
          <p class="text-6xl font-black text-gray-900 dark:text-white">
            Level {level}
          </p>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Amazing progress! Keep crushing it! 🎉
          </p>
        </div>
      </div>
    {:else if type === 'setComplete'}
      <!-- Set Complete Celebration -->
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
        <div class="relative bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full p-8 shadow-xl">
          <Award class="w-20 h-20 text-white drop-shadow-lg" />
        </div>
      </div>
      
      <div class="text-center space-y-4">
        <h2 class="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent animate-pulse">
          Set Complete!
        </h2>
        <div class="space-y-2">
          <div class="flex items-center justify-center gap-3">
            <span class="text-4xl">🏆</span>
            <p class="text-5xl font-black text-gray-900 dark:text-white">
              +{xpBonus} XP
            </p>
          </div>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            You mastered all the cards! 🌟
          </p>
        </div>
      </div>
    {:else if type === 'achievement'}
      <!-- Achievement Unlocked Celebration -->
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
        <div class="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-8 shadow-xl">
          {#if achievementId === 'first_correct'}
            <Star class="w-20 h-20 text-white drop-shadow-lg" />
          {:else if achievementId === 'streak_7'}
            <Flame class="w-20 h-20 text-white drop-shadow-lg" />
          {:else if achievementId === 'words_50'}
            <Book class="w-20 h-20 text-white drop-shadow-lg" />
          {:else}
            <Trophy class="w-20 h-20 text-white drop-shadow-lg" />
          {/if}
        </div>
      </div>
      
      <div class="text-center space-y-4">
        <h2 class="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-pulse">
          Achievement Unlocked!
        </h2>
        <div class="space-y-2">
          <p class="text-4xl font-black text-gray-900 dark:text-white">
            {achievementName}
          </p>
          <div class="flex items-center justify-center gap-3">
            <span class="text-3xl">✨</span>
            <p class="text-4xl font-black text-purple-600 dark:text-purple-400">
              +{xpBonus} XP
            </p>
          </div>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            You're on fire! Keep it up! 🔥
          </p>
        </div>
      </div>
    {/if}
    
    <p class="text-sm text-gray-500 dark:text-gray-500 text-center">
      Tap anywhere to continue
    </p>
  </div>
</div>

<style>
  @keyframes pulse {
    0%, 100% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.8;
    }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>
