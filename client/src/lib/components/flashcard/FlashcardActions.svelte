<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { Check, X } from 'lucide-svelte';

  export let disabled = false;
  export let loading = false;

  const dispatch = createEventDispatcher<{
    know: void;
    notYet: void;
  }>();
</script>

<div class="flex items-center justify-center gap-4">
  <Button
    variant="ghost"
    size="lg"
    on:click={() => dispatch('notYet')}
    disabled={disabled || loading}
    class="min-w-[160px] border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
  >
    <X class="w-5 h-5 mr-2" />
    Not Yet
  </Button>

  <Button
    variant="primary"
    size="lg"
    on:click={() => dispatch('know')}
    disabled={disabled || loading}
    class="min-w-[160px] bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
  >
    <Check class="w-5 h-5 mr-2" />
    I Know It!
  </Button>
</div>
