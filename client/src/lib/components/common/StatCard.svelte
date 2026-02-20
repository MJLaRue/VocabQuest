<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import type { ComponentType } from 'svelte';

  export let icon: ComponentType;
  export let label: string;
  export let value: string | number;
  export let description: string = '';
  // Reserved for future use - trend indicators
  export const trend: 'up' | 'down' | 'neutral' = 'neutral';
  export let iconBgColor: string = 'bg-primary-100 dark:bg-primary-900';
  export let iconColor: string = 'text-primary-500';
</script>

<Card hover class="h-full">
  <div class="flex items-center justify-between">
    <div class="flex-1">
      <p class="text-sm text-gray-600 dark:text-slate-400 mb-1">{label}</p>
      <p class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      {#if description}
        <p class="text-xs text-gray-500 dark:text-slate-500">{description}</p>
      {/if}
    </div>
    <div class={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
      <svelte:component this={icon} class={`w-6 h-6 ${iconColor}`} />
    </div>
  </div>
</Card>
