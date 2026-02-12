<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { HTMLAttributes } from 'svelte/elements';

  type $$Props = HTMLAttributes<HTMLDivElement> & {
    class?: string;
    hover?: boolean;
  };

  let className: $$Props['class'] = '';
  export { className as class };
  export let hover: $$Props['hover'] = false;
</script>

<div
  class={cn(
    'rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-md p-6',
    hover && 'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
    className
  )}
  {...$$restProps}
>
  <slot />
</div>
