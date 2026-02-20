<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { HTMLAttributes } from 'svelte/elements';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  type $$Props = HTMLAttributes<HTMLDivElement> & {
    value: number;
    max?: number;
    variant?: 'linear' | 'circular';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    animated?: boolean;
    class?: string;
  };

  export let value: $$Props['value'];
  export let max: $$Props['max'] = 100;
  export let variant: $$Props['variant'] = 'linear';
  export let size: $$Props['size'] = 'md';
  export let showLabel: $$Props['showLabel'] = false;
  export let animated: $$Props['animated'] = true;
  let className: $$Props['class'] = '';
  export { className as class };

  const progress = tweened(0, {
    duration: animated ? 800 : 0,
    easing: cubicOut,
  });

  $: progress.set((value / (max ?? 100)) * 100);
  $: percentage = Math.round($progress);

  const sizeMap = {
    sm: variant === 'circular' ? 64 : 'h-2',
    md: variant === 'circular' ? 96 : 'h-3',
    lg: variant === 'circular' ? 128 : 'h-4',
  };
</script>

{#if variant === 'linear'}
  <div class={cn('w-full', className)}>
    <div
      class={cn(
        'relative w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700',
        sizeMap[size ?? 'md']
      )}
    >
      <div
        class="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300 ease-out"
        style="width: {percentage}%"
      >
        {#if animated}
          <div class="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        {/if}
      </div>
    </div>
    {#if showLabel}
      <div class="mt-1 text-xs text-gray-600 dark:text-slate-400 text-center">
        {value} / {max}
      </div>
    {/if}
  </div>
{:else}
  <div class={cn('relative inline-flex items-center justify-center', className)}>
    <svg
      class="transform -rotate-90"
      width={sizeMap[size ?? 'md']}
      height={sizeMap[size ?? 'md']}
      viewBox="0 0 100 100"
    >
      <!-- Background circle -->
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="rgb(209 213 219)"
        stroke-width="8"
        class="dark:stroke-slate-700"
      />
      <!-- Progress circle -->
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="rgb(20 184 166)"
        stroke-width="8"
        stroke-linecap="round"
        stroke-dasharray={`${(percentage / 100) * 283} 283`}
        class="transition-all duration-500 ease-out"
      />
    </svg>
    {#if showLabel}
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-lg font-bold text-gray-900 dark:text-white">
          {percentage}%
        </span>
        <slot />
      </div>
    {/if}
  </div>
{/if}
