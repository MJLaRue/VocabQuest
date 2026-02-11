<script lang="ts">
  import { onMount } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  
  export let isCorrect: boolean;
  export let onClose: () => void;
  
  onMount(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1000);
    
    return () => clearTimeout(timer);
  });
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
  transition:fade={{ duration: 200 }}
  on:click={onClose}
  on:keydown={(e) => e.key === 'Escape' && onClose()}
  role="button"
  tabindex="0"
>
  <div class="flex flex-col items-center gap-6">
    <!-- Text above the icon -->
    <div
      class="text-6xl font-bold drop-shadow-2xl animate-pop-in"
      class:text-green-500={isCorrect}
      class:text-red-500={!isCorrect}
    >
      {isCorrect ? 'Correct!' : 'Try Again!'}
    </div>
    
    <!-- Icon -->
    <div
      transition:scale={{ duration: 500, easing: elasticOut, start: 0.5 }}
      class="relative"
    >
      {#if isCorrect}
        <!-- Big Check Mark -->
        <svg
          class="w-64 h-64 drop-shadow-2xl animate-pulse-slow"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="#10b981"
            class="animate-scale-in"
          />
          <path
            d="M25 50 L42 67 L75 34"
            stroke="white"
            stroke-width="8"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="animate-draw-check"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-6xl font-bold text-white drop-shadow-lg animate-bounce-in">
            ✓
          </div>
        </div>
      {:else}
        <!-- Big X Mark -->
        <svg
          class="w-64 h-64 drop-shadow-2xl animate-shake"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="#ef4444"
            class="animate-scale-in"
          />
          <path
            d="M30 30 L70 70 M70 30 L30 70"
            stroke="white"
            stroke-width="8"
            stroke-linecap="round"
            class="animate-draw-x"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-6xl font-bold text-white drop-shadow-lg animate-bounce-in">
            ✗
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  @keyframes scale-in {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes draw-check {
    from {
      stroke-dasharray: 100;
      stroke-dashoffset: 100;
    }
    to {
      stroke-dasharray: 100;
      stroke-dashoffset: 0;
    }
  }

  @keyframes draw-x {
    from {
      stroke-dasharray: 100;
      stroke-dashoffset: 100;
    }
    to {
      stroke-dasharray: 100;
      stroke-dashoffset: 0;
    }
  }

  @keyframes bounce-in {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
@keyframes pop-in {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    60% {
      transform: scale(1.15);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }

  @keyframes pulse-slow {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .animate-scale-in {
    animation: scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .animate-draw-check {
    animation: draw-check 0.6s ease-out 0.2s forwards;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
  }

  .animate-draw-x {
    animation: draw-x 0.5s ease-out 0.2s forwards;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
  }

  .animate-pop-in {
    animation: pop-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
  }

  .animate-bounce-in {
    animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s forwards;
    opacity: 0;
    animation-fill-mode: forwards;
  }

  .animate-shake {
    animation: shake 0.5s ease-in-out 0.2s;
  }

  .animate-pulse-slow {
    animation: pulse-slow 2s ease-in-out infinite;
  }
</style>
