<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { HTMLAttributes } from 'svelte/elements';
  import { tv } from 'tailwind-variants';

  type $$Props = HTMLAttributes<HTMLSpanElement> & {
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'accent';
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  };

  export let variant: $$Props['variant'] = 'primary';
  export let size: $$Props['size'] = 'md';
  let className: $$Props['class'] = '';
  export { className as class };

  const badge = tv({
    base: 'inline-flex items-center justify-center gap-1.5 font-medium rounded-full',
    variants: {
      variant: {
        primary:
          'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
        success:
          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        warning:
          'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
        error:
          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        neutral:
          'bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
        accent:
          'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  });
</script>

<span class={cn(badge({ variant, size }), className)} {...$$restProps}>
  <slot />
</span>
