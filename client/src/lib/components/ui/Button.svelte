<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { tv, type VariantProps } from 'tailwind-variants';

  type $$Props = HTMLButtonAttributes & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    class?: string;
  };

  export let variant: $$Props['variant'] = 'primary';
  export let size: $$Props['size'] = 'md';
  export let loading: $$Props['loading'] = false;
  let className: $$Props['class'] = '';
  export { className as class };

  const button = tv({
    base: 'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variants: {
      variant: {
        primary:
          'bg-primary-500 text-white hover:bg-primary-600 active:scale-95 shadow-md hover:shadow-lg',
        secondary:
          'bg-gray-200 text-gray-900 hover:bg-gray-300 active:scale-95 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600',
        ghost:
          'hover:bg-gray-100 text-gray-900 active:scale-95 dark:hover:bg-slate-800 dark:text-white',
        success:
          'bg-green-500 text-white hover:opacity-90 active:scale-95 shadow-md hover:shadow-lg',
        warning:
          'bg-amber-500 text-white hover:opacity-90 active:scale-95 shadow-md hover:shadow-lg',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  });
</script>

<button
  class={cn(button({ variant, size }), className)}
  disabled={loading || $$restProps.disabled}
  {...$$restProps}
  on:click
>
  {#if loading}
    <svg
      class="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  {/if}
  <slot />
</button>
