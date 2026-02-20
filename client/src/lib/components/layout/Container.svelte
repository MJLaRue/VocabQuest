<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { HTMLAttributes } from 'svelte/elements';

  type $$Props = HTMLAttributes<HTMLDivElement> & {
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    class?: string;
  };

  export let maxWidth: $$Props['maxWidth'] = 'xl';
  let className: $$Props['class'] = '';
  export { className as class };

  const maxWidths = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };
</script>

<div class={cn('container mx-auto px-4 py-8', maxWidths[maxWidth ?? 'xl'], className)} {...$$restProps}>
  <slot />
</div>
