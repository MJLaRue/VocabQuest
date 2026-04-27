<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { X, HelpCircle } from 'lucide-svelte';

  export let show = false;

  const dispatch = createEventDispatcher<{ close: void }>();

  let closeBtn: HTMLButtonElement;
  let prevFocus: Element | null = null;

  $: if (show) {
    prevFocus = document.activeElement;
    tick().then(() => closeBtn?.focus());
  } else if (!show && prevFocus instanceof HTMLElement) {
    prevFocus.focus();
  }

  function close() {
    localStorage.setItem('vocabquest-quickstart-seen', '1');
    dispatch('close');
  }

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  function goToTest() {
    close();
    push('/test');
  }
</script>

{#if show}
  <svelte:window on:keydown={handleKeydown}/>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    on:click={handleBackdrop}
  >
    <div
      class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qs-title"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 p-6 pb-4">
        <div class="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <HelpCircle class="w-5 h-5 text-white" />
        </div>
        <div class="flex-1">
          <h2 id="qs-title" class="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">Welcome to VocabQuest!</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Here's how to level up your vocabulary</p>
        </div>
        <button
          bind:this={closeBtn}
          on:click={close}
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="px-6 pb-6 space-y-5">
        <!-- Mode grid -->
        <div>
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Study Modes</p>
          <div class="grid grid-cols-2 gap-2.5">
            <!-- Practice -->
            <div class="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-bold text-teal-700 dark:text-teal-300">Practice</span>
                <span class="text-xs font-semibold px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full">10 XP</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Flip cards — mark Known or Not Yet. Best for first exposure.</p>
            </div>

            <!-- Quiz -->
            <div class="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-bold text-sky-700 dark:text-sky-300">Quiz</span>
                <span class="text-xs font-semibold px-1.5 py-0.5 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-full">15 XP</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Pick the correct definition from 4 choices.</p>
            </div>

            <!-- Context -->
            <div class="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-bold text-purple-700 dark:text-purple-300">Context</span>
                <span class="text-xs font-semibold px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">15 XP</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Fill in the blank in a real sentence.</p>
            </div>

            <!-- Relate -->
            <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-bold text-amber-700 dark:text-amber-300">Relate</span>
                <span class="text-xs font-semibold px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full">15 XP</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Find synonyms and antonyms.</p>
            </div>

            <!-- Typing — full width -->
            <div class="col-span-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-bold text-rose-700 dark:text-rose-300">Typing</span>
                <span class="text-xs font-semibold px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-full">20 XP</span>
                <span class="ml-auto text-xs font-bold px-2 py-0.5 bg-rose-600 text-white rounded-full uppercase tracking-wide">Hardest</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">See the definition — spell the word from memory. Save this for last.</p>
            </div>
          </div>
        </div>

        <!-- Suggested progression -->
        <div class="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Suggested Progression</p>
          <div class="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span class="px-2.5 py-1 bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-full">Practice</span>
            <span class="text-gray-400">→</span>
            <span class="px-2.5 py-1 bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 rounded-full">Quiz</span>
            <span class="text-gray-400">→</span>
            <span class="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-full">Context</span>
            <span class="text-gray-400">→</span>
            <span class="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-full">Relate</span>
            <span class="text-gray-400">→</span>
            <span class="px-2.5 py-1 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-full">Typing</span>
          </div>
        </div>

        <!-- Tests callout -->
        <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
          <span class="text-xl mt-0.5">📋</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              After studying a set of words, take a <strong class="font-semibold">Test</strong> to lock in your learning — and earn bonus XP.
            </p>
            <button
              on:click={goToTest}
              class="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Go to Tests →
            </button>
          </div>
        </div>

        <!-- Footer CTA -->
        <div class="flex justify-end pt-1">
          <button
            on:click={close}
            class="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
          >
            Start Studying →
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
