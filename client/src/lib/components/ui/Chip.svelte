<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type $$Props = HTMLButtonAttributes & {
    active?: boolean;
    variant?: 'default' | 'primary' | 'success' | 'warning';
    class?: string;
  };

  export let active: $$Props['active'] = false;
  export let variant: $$Props['variant'] = 'default';
  let className: $$Props['class'] = '';
  export { className as class };

  $: variantClass = {
    default: active
      ? 'bg-teal-600 text-white border-teal-600'
      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-teal-400 hover:text-teal-600 dark:hover:border-teal-500 dark:hover:text-teal-400',
    primary: active
      ? 'bg-teal-600 text-white border-teal-600'
      : 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700 hover:bg-teal-200 dark:hover:bg-teal-800',
    success: active
      ? 'bg-green-500 text-white border-green-500'
      : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800',
    warning: active
      ? 'bg-amber-500 text-white border-amber-500'
      : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800',
  }[variant ?? 'default'];
</script>

<button
  class={cn(
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
    variantClass,
    className
  )}
  type="button"
  {...$$restProps}
  on:click
>
  <slot />
</button>
