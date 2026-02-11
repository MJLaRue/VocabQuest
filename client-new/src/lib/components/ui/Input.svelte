<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { HTMLInputAttributes } from 'svelte/elements';

  type $$Props = Omit<HTMLInputAttributes, 'value'> & {
    value?: string;
    class?: string;
  };

  export let value: string = '';
  let className: $$Props['class'] = '';
  export { className as class };
</script>

<input
  bind:value
  class={cn(
    'flex h-11 w-full rounded-lg border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
    className
  )}
  {...$$restProps}
  on:input
  on:change
  on:focus
  on:blur
/>
