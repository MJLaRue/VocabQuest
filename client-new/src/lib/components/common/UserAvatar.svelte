<script lang="ts">
  export let initials: string;
  export let size: 'sm' | 'md' | 'lg' = 'md';

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };
</script>

<div
  class={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold`}
>
  {initials.charAt(0).toUpperCase()}
</div>
