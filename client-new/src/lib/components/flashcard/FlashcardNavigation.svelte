<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';

  export let hasPrev = false;
  export let hasNext = false;
  export let remaining = 0;
  export let disabled = false;

  const dispatch = createEventDispatcher<{
    prev: void;
    next: void;
  }>();
</script>

<div class="flex items-center justify-between w-full max-w-2xl mx-auto">
  <Button
    variant="ghost"
    size="sm"
    on:click={() => dispatch('prev')}
    disabled={!hasPrev || disabled}
  >
    <ChevronLeft class="w-5 h-5 mr-1" />
    Previous
  </Button>

  <span class="text-sm text-teal-600 dark:text-teal-400 font-medium">
    {remaining} {remaining === 1 ? 'card' : 'cards'} remaining
  </span>

  <Button
    variant="ghost"
    size="sm"
    on:click={() => dispatch('next')}
    disabled={!hasNext || disabled}
  >
    Next
    <ChevronRight class="w-5 h-5 ml-1" />
  </Button>
</div>
