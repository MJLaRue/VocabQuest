<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { push } from "svelte-spa-router";
  import { ClipboardList, ChevronRight, Clock, Star, Zap } from "lucide-svelte";
  import Header from "$lib/components/layout/Header.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { user } from "$lib/stores/auth";
  import { testStore } from "$lib/stores/test";
  import type { TestMode } from "$lib/api/test";

  // Config state
  let questionCount = 25;
  let selectedModes: TestMode[] = ["context", "relate"];
  let advanced = false;
  let isStarting = false;
  let errorMsg = "";

  const QUESTION_PRESETS = [
    { count: 10,  label: "Quick",    time: "~4 min"  },
    { count: 25,  label: "Short",    time: "~10 min" },
    { count: 50,  label: "Standard", time: "~20 min" },
    { count: 75,  label: "Long",     time: "~30 min" },
    { count: 100, label: "Marathon", time: "~40 min" },
  ] as const;

  const ALL_MODES: { id: TestMode; label: string; description: string; color: string }[] = [
    {
      id: "quiz",
      label: "Quiz",
      description: "Choose the correct definition from 4 options",
      color: "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300",
    },
    {
      id: "typing",
      label: "Typing",
      description: "Type the word from its definition",
      color: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300",
    },
    {
      id: "context",
      label: "Context",
      description: "Identify the word in a sentence",
      color: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300",
    },
    {
      id: "relate",
      label: "Relate",
      description: "Match a synonym or antonym",
      color: "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300",
    },
  ];

  // History state (updated via explicit store subscription in onMount)
  let history: any[] = [];
  let historyLoaded = false;

  let unsubHistory: (() => void) | null = null;

  onMount(() => {
    // Synchronous subscription so Svelte can track it properly
    unsubHistory = testStore.subscribe(s => {
      history = s.history.slice(0, 5);
      historyLoaded = s.historyLoaded;
    });

    // Async load kicked off separately — errors handled gracefully
    testStore.loadHistory().catch(() => {
      historyLoaded = true;
    });
  });

  onDestroy(() => {
    unsubHistory?.();
  });

  function toggleMode(mode: TestMode) {
    if (selectedModes.includes(mode)) {
      if (selectedModes.length > 1) {
        selectedModes = selectedModes.filter(m => m !== mode);
      }
    } else {
      selectedModes = [...selectedModes, mode];
    }
  }

  // Length bonus preview
  $: lengthBonus = (1 + (Math.max(questionCount, 10) - 10) * 0.5 / 90).toFixed(2);

  // Estimated XP (rough calculation using approved rates)
  $: baseXpPerQ = selectedModes.reduce((sum, m) => {
    if (m === "typing") return sum + 15;
    if ((m === "context" || m === "relate") && advanced) return sum + 15;
    return sum + 10; // quiz, context std, relate std
  }, 0) / selectedModes.length;
  $: estimatedXp = Math.round(baseXpPerQ * questionCount * parseFloat(lengthBonus) * 0.7); // ~70% accuracy assumption

  // Estimated time
  $: estimatedMinutes = Math.round(questionCount * 0.4); // ~24 sec per question

  async function startTest() {
    if (selectedModes.length === 0) {
      errorMsg = "Please select at least one mode.";
      return;
    }
    if (questionCount < 10 || questionCount > 100) {
      errorMsg = "Question count must be between 10 and 100.";
      return;
    }
    errorMsg = "";
    isStarting = true;
    try {
      console.log("[Test] Starting test with", { questionCount, modes: selectedModes, advanced });
      await testStore.startTest({ questionCount, modes: selectedModes, advanced });
      console.log("[Test] startTest succeeded, activeTest:", $testStore.activeTest?.id);
      push("/test/active");
    } catch (err: any) {
      console.error("[Test] startTest failed:", err);
      errorMsg = err?.data?.error || err?.message || "Failed to start test.";
    } finally {
      isStarting = false;
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric"
    });
  }

  function getModeColor(mode: string) {
    const m = ALL_MODES.find(x => x.id === mode);
    return m?.color ?? "";
  }
</script>

<div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header user={$user} />

  <main id="main-content" class="flex-1 container mx-auto px-4 py-8 max-w-3xl">
    <!-- Page header -->
    <div class="flex items-center gap-3 mb-8">
      <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
        <ClipboardList class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Configure Test</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">Set up your vocabulary test</p>
      </div>
    </div>

    <div class="grid gap-6">
      <!-- Question Count -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-1">
          Number of Questions
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          More questions = more XP (up to 1.5× bonus at 100)
        </p>

        <div class="grid grid-cols-5 gap-2">
          {#each QUESTION_PRESETS as preset}
            {@const isSelected = questionCount === preset.count}
            <button
              type="button"
              on:click={() => (questionCount = preset.count)}
              aria-pressed={isSelected}
              class="flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 py-3 px-1
                     transition-all focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                     {isSelected
                       ? 'border-indigo-500 bg-indigo-600 text-white shadow-md'
                       : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:border-indigo-300 dark:hover:border-indigo-500'}"
            >
              <span class="text-2xl font-extrabold leading-none">{preset.count}</span>
              <span class="text-[10px] font-semibold uppercase tracking-wide
                           {isSelected ? 'text-indigo-100' : 'text-gray-400 dark:text-gray-400'}">
                {preset.label}
              </span>
              <span class="text-[10px]
                           {isSelected ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'}">
                {preset.time}
              </span>
            </button>
          {/each}
        </div>

        <!-- Stats preview -->
        <div class="grid grid-cols-3 gap-3 mt-4">
          <div class="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 text-center">
            <div class="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 mb-1">
              <Star class="w-3 h-3" />
              <span class="text-xs font-medium">XP Bonus</span>
            </div>
            <p class="text-lg font-bold text-gray-900 dark:text-white">{lengthBonus}×</p>
          </div>
          <div class="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 text-center">
            <div class="flex items-center justify-center gap-1 text-teal-600 dark:text-teal-400 mb-1">
              <Star class="w-3 h-3" />
              <span class="text-xs font-medium">Est. XP</span>
            </div>
            <p class="text-lg font-bold text-gray-900 dark:text-white">~{estimatedXp}</p>
          </div>
          <div class="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 text-center">
            <div class="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
              <Clock class="w-3 h-3" />
              <span class="text-xs font-medium">Est. Time</span>
            </div>
            <p class="text-lg font-bold text-gray-900 dark:text-white">~{estimatedMinutes}m</p>
          </div>
        </div>
      </div>

      <!-- Mode Selection -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-1">
          Study Modes
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Questions rotate through selected modes in order
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {#each ALL_MODES as m}
            {@const selected = selectedModes.includes(m.id)}
            <button
              type="button"
              on:click={() => toggleMode(m.id)}
              class="relative text-left p-4 rounded-xl border-2 transition-all {selected
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'}"
              aria-pressed={selected}
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold {m.color} border mb-2">
                    {m.label}
                  </span>
                  <p class="text-sm text-gray-600 dark:text-gray-300">{m.description}</p>
                </div>
                <div class="flex-shrink-0 w-5 h-5 rounded-full border-2 {selected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 dark:border-slate-500'} flex items-center justify-center">
                  {#if selected}
                    <svg class="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  {/if}
                </div>
              </div>
            </button>
          {/each}
        </div>

        {#if selectedModes.length > 1}
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Questions will rotate: {selectedModes.join(" → ")} → {selectedModes[0]} → …
          </p>
        {/if}
      </div>

      <!-- Advanced Mode Toggle -->
      {#if selectedModes.some(m => m === "context" || m === "relate")}
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Zap class="w-5 h-5 text-amber-500" />
              <div>
                <h2 class="text-base font-semibold text-gray-900 dark:text-white">Advanced Mode</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Context & Relate switch from multiple choice to typing
                </p>
              </div>
            </div>
            <button
              type="button"
              on:click={() => (advanced = !advanced)}
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 {advanced ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-600'}"
              role="switch"
              aria-checked={advanced}
            >
              <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform {advanced ? 'translate-x-6' : 'translate-x-1'}" />
            </button>
          </div>
          {#if advanced}
            <p class="mt-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
              Advanced Context & Relate earn <strong>15 XP</strong> per correct answer instead of 10.
            </p>
          {/if}
        </div>
      {/if}

      <!-- Error message -->
      {#if errorMsg}
        <p class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
          {errorMsg}
        </p>
      {/if}

      <!-- Start button -->
      <button
        type="button"
        on:click={startTest}
        disabled={isStarting || selectedModes.length === 0}
        class="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 text-white font-semibold rounded-xl shadow-md transition-colors text-lg"
      >
        {#if isStarting}
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Starting…
        {:else}
          Start Test
          <ChevronRight class="w-5 h-5" />
        {/if}
      </button>

      <!-- Recent History -->
      {#if historyLoaded && history.length > 0}
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent Tests</h2>
          <div class="space-y-3">
            {#each history as attempt}
              <button
                type="button"
                on:click={() => push(`/test/results/${attempt.id}`)}
                class="w-full text-left flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    {#each (attempt.config?.modes ?? []) as mode}
                      <span class="inline-block text-xs px-2 py-0.5 rounded-full border {getModeColor(mode)}">
                        {mode}
                      </span>
                    {/each}
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {attempt.config?.questionCount ?? "?"} questions · {formatDate(attempt.completedAt ?? attempt.startedAt)}
                  </p>
                </div>
                <div class="text-right ml-3 flex-shrink-0">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">
                    {attempt.results?.accuracy ?? "—"}%
                  </p>
                  <p class="text-xs text-amber-600 dark:text-amber-400">+{attempt.xpEarned} XP</p>
                </div>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </main>

  <Footer />
</div>
