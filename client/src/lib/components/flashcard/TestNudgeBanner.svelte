<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { ClipboardList, X } from 'lucide-svelte';

  export let lastTestDate: string | null = null;

  let dismissed = false;

  onMount(() => {
    if (sessionStorage.getItem('vocabquest-test-banner-dismissed') === '1') {
      dismissed = true;
    }
  });

  $: daysSince = lastTestDate
    ? Math.floor((Date.now() - new Date(lastTestDate).getTime()) / 86_400_000)
    : null;

  $: shouldShow = daysSince === null || daysSince >= 3;

  $: message = daysSince === null
    ? "You haven't taken a test yet — ready to check your knowledge?"
    : `No test in ${daysSince} days — ready to check your progress?`;

  function dismiss() {
    sessionStorage.setItem('vocabquest-test-banner-dismissed', '1');
    dismissed = true;
  }

  function goToTest() {
    push('/test');
  }
</script>

{#if shouldShow && !dismissed}
  <div class="flex items-center gap-3 px-4 py-2.5 bg-blue-950 border-b border-blue-800 text-sm">
    <ClipboardList size={16} class="text-blue-400 flex-shrink-0" />
    <span class="flex-1 text-blue-200">{message}</span>
    <button
      on:click={goToTest}
      class="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
    >
      Go to Test
    </button>
    <button
      on:click={dismiss}
      class="p-1 rounded text-blue-400 hover:text-white hover:bg-blue-800 transition-colors"
      aria-label="Dismiss"
    >
      <X size={14} />
    </button>
  </div>
{/if}
