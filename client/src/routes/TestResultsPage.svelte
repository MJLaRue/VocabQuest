<script lang="ts">
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";
  import {
    Trophy,
    Star,
    Target,
    TrendingUp,
    ArrowLeft,
    RefreshCw,
    Zap,
    ChevronDown,
  } from "lucide-svelte";
  import Header from "$lib/components/layout/Header.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { user } from "$lib/stores/auth";
  import { testStore } from "$lib/stores/test";
  import type { TestAttempt } from "$lib/api/test";

  export let params: { id?: string } = {};

  let attempt: TestAttempt | null = null;
  let isLoading = true;
  let didLevelUp = false;
  let newAchievements: { id: string; name: string; level: number; xp: number }[] = [];
  let reviewOpen = false;

  onMount(async () => {
    const testId = parseInt(params.id ?? "0");

    // Check if we just completed this test (results in store)
    const storeState = $testStore;

    if (
      storeState.activeTest?.id === testId &&
      storeState.activeTest.status === "completed"
    ) {
      // Use cached data from store
      attempt = storeState.activeTest;
      didLevelUp = storeState.lastGamification?.didLevelUp ?? false;
      newAchievements = storeState.lastGamification?.newAchievements ?? [];
      isLoading = false;
    } else if (testId > 0) {
      // Load from API (viewing historical result)
      attempt = await testStore.loadAttempt(testId);
      isLoading = false;
    } else {
      push("/test");
    }
  });

  $: results = attempt?.results;
  $: accuracy = results?.accuracy ?? 0;
  $: xpEarned = results?.xpEarned ?? 0;
  $: lengthBonus = results?.lengthBonus ?? 1;
  $: byMode = results?.byMode ?? {};
  $: reviewQuestions = attempt?.questions ?? [];
  $: questionsWithWordData = reviewQuestions.filter(q => q.word);
  $: hasQuestionData = questionsWithWordData.length > 0;
  $: score = results?.score ?? 0;
  $: total = results?.total ?? 0;

  $: grade = (() => {
    if (accuracy >= 90) return { label: "Excellent!", color: "text-emerald-600 dark:text-emerald-400" };
    if (accuracy >= 75) return { label: "Great Job!", color: "text-teal-600 dark:text-teal-400" };
    if (accuracy >= 60) return { label: "Good Effort!", color: "text-blue-600 dark:text-blue-400" };
    if (accuracy >= 40) return { label: "Keep Practicing", color: "text-amber-600 dark:text-amber-400" };
    return { label: "Keep Trying!", color: "text-red-600 dark:text-red-400" };
  })();

  const modeColors: Record<string, string> = {
    quiz: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    typing: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    context: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    relate: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  };

  const modeBarColors: Record<string, string> = {
    quiz: "bg-purple-500",
    typing: "bg-blue-500",
    context: "bg-emerald-500",
    relate: "bg-orange-500",
  };

  function formatDuration(ms?: number) {
    if (!ms) return "—";
    const s = Math.round(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  }

  function retakeTest() {
    // Pre-fill the same config
    push("/test");
  }
</script>

<div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header user={$user} />

  <main id="main-content" class="flex-1 container mx-auto px-4 py-8 max-w-2xl">

    {#if isLoading}
      <div class="flex flex-col items-center justify-center py-20 gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading results…</p>
      </div>

    {:else if attempt && results}
      <!-- Level-up banner -->
      {#if didLevelUp}
        <div class="mb-6 p-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl shadow-lg flex items-center gap-3">
          <Zap class="w-6 h-6 flex-shrink-0" />
          <div>
            <p class="font-bold text-lg">Level Up! 🎉</p>
            <p class="text-sm opacity-90">You reached a new level!</p>
          </div>
        </div>
      {/if}

      <!-- Achievement banners -->
      {#each newAchievements as achievement}
        <div class="mb-3 p-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl shadow flex items-center gap-3">
          <Trophy class="w-5 h-5 flex-shrink-0" />
          <div>
            <p class="font-bold text-sm">Achievement Unlocked!</p>
            <p class="font-semibold">
              {achievement.name}
              {#if achievement.level > 1}
                <span class="text-xs opacity-80 ml-1">Level {achievement.level}</span>
              {/if}
            </p>
            <p class="text-xs opacity-80">+{achievement.xp} XP</p>
          </div>
        </div>
      {/each}

      <!-- Hero score -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center mb-6">
        <div class="flex items-center justify-center mb-2">
          <Trophy class="w-10 h-10 text-amber-500" />
        </div>
        <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">
          {score}/{total}
        </h1>
        <p class="text-2xl font-bold {grade.color} mb-4">
          {grade.label}
        </p>

        <!-- Accuracy ring placeholder (CSS-only) -->
        <div class="relative inline-flex items-center justify-center w-28 h-28 mb-4">
          <svg class="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="currentColor"
              stroke-width="10"
              class="text-gray-100 dark:text-slate-700"
            />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="currentColor"
              stroke-width="10"
              stroke-linecap="round"
              stroke-dasharray="{2 * Math.PI * 42}"
              stroke-dashoffset="{2 * Math.PI * 42 * (1 - accuracy / 100)}"
              class="text-indigo-500 transition-all duration-1000"
            />
          </svg>
          <div class="absolute text-center">
            <p class="text-2xl font-extrabold text-gray-900 dark:text-white">{accuracy}%</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">accuracy</p>
          </div>
        </div>

        <!-- XP earned -->
        <div class="flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-6 py-3 inline-flex mx-auto">
          <Star class="w-5 h-5 text-amber-500" />
          <span class="text-lg font-bold text-amber-700 dark:text-amber-300">+{xpEarned} XP earned</span>
          {#if lengthBonus > 1}
            <span class="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full font-semibold">
              {lengthBonus.toFixed(2)}× bonus
            </span>
          {/if}
        </div>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 text-center">
          <Target class="w-5 h-5 text-indigo-500 mx-auto mb-1" />
          <p class="text-xl font-bold text-gray-900 dark:text-white">{accuracy}%</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Accuracy</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 text-center">
          <TrendingUp class="w-5 h-5 text-teal-500 mx-auto mb-1" />
          <p class="text-xl font-bold text-gray-900 dark:text-white">{total}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Questions</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 text-center">
          <Star class="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p class="text-xl font-bold text-gray-900 dark:text-white">{formatDuration(results.duration)}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Duration</p>
        </div>
      </div>

      <!-- Per-mode breakdown -->
      {#if Object.keys(byMode).length > 1}
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Mode Breakdown</h2>
          <div class="space-y-4">
            {#each Object.entries(byMode) as [mode, stat]}
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full border {modeColors[mode] ?? ''}">
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </span>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stat.correct}/{stat.total} ({stat.accuracy}%)
                  </span>
                </div>
                <div class="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all {modeBarColors[mode] ?? 'bg-indigo-500'}"
                    style="width: {stat.accuracy}%"
                  ></div>
                </div>
                <p class="text-xs text-amber-600 dark:text-amber-400 mt-0.5">+{stat.xpEarned} XP</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Collapsible Question Review -->
      {#if hasQuestionData}
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mb-6">
          <button
            type="button"
            on:click={() => (reviewOpen = !reviewOpen)}
            class="w-full flex items-center justify-between px-6 py-4
                   hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            aria-expanded={reviewOpen}
          >
            <span class="text-base font-semibold text-gray-900 dark:text-white">
              {reviewOpen ? "Hide" : "Show"} {questionsWithWordData.length} Questions
            </span>
            <ChevronDown
              class="w-5 h-5 text-gray-500 transition-transform duration-200 {reviewOpen ? 'rotate-180' : ''}"
            />
          </button>

          {#if reviewOpen}
            <div class="border-t border-gray-100 dark:border-slate-700 p-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {#each questionsWithWordData as q}
                  <div
                    class="flex items-start gap-3 p-3 rounded-lg
                           bg-gray-50 dark:bg-slate-700/50 border
                           {q.correct
                             ? 'border-emerald-200 dark:border-emerald-800'
                             : 'border-red-200 dark:border-red-800'}"
                  >
                    <!-- ✓ / ✗ icon -->
                    <div class="flex-shrink-0 mt-0.5">
                      {#if q.correct}
                        <div
                          class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40
                                 flex items-center justify-center"
                        >
                          <svg
                            class="w-3 h-3 text-emerald-600 dark:text-emerald-400"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                      {:else}
                        <div
                          class="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40
                                 flex items-center justify-center"
                        >
                          <svg
                            class="w-3 h-3 text-red-600 dark:text-red-400"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M3 3l6 6M9 3l-6 6"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                            />
                          </svg>
                        </div>
                      {/if}
                    </div>

                    <!-- Word + mode badge + definition -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap mb-1">
                        <span class="font-bold text-sm text-gray-900 dark:text-white">
                          {q.word}
                        </span>
                        <span
                          class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border
                                 {modeColors[q.mode] ?? ''}"
                        >
                          {q.mode}
                        </span>
                      </div>
                      <p class="text-xs text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">
                        {q.definition}
                      </p>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          type="button"
          on:click={() => push("/test")}
          class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
        >
          <ArrowLeft class="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          on:click={retakeTest}
          class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-sm"
        >
          <RefreshCw class="w-4 h-4" />
          New Test
        </button>
      </div>

    {:else}
      <div class="text-center py-20">
        <p class="text-gray-500 dark:text-gray-400">Test results not found.</p>
        <button
          type="button"
          on:click={() => push("/test")}
          class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Start a New Test
        </button>
      </div>
    {/if}

  </main>

  <Footer />
</div>
