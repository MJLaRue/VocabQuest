<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { push } from "svelte-spa-router";
  import { X, AlertTriangle } from "lucide-svelte";
  import Header from "$lib/components/layout/Header.svelte";
  import FlashCard from "$lib/components/flashcard/FlashCard.svelte";
  import { user } from "$lib/stores/auth";
  import { testStore, currentQuestion, testProgress, isTestComplete } from "$lib/stores/test";
  import { testApi } from "$lib/api/test";
  import type { VocabularyWord } from "$lib/api/vocab";
  import type { StudyMode } from "$lib/api/progress";

  let isCompleting = false;
  let showAbortConfirm = false;

  // Timer
  let startTime = Date.now();
  let elapsedSeconds = 0;
  let timerInterval: ReturnType<typeof setInterval>;

  onMount(async () => {
    startTime = Date.now();
    timerInterval = setInterval(() => {
      elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    }, 1000);

    if (!$testStore.activeTest) {
      // Tier 1: fast path — localStorage key set when test started
      const savedId = localStorage.getItem("vocab_active_test_id");
      if (savedId) {
        const resumed = await testStore.resumeTest(Number(savedId));
        if (!resumed) push("/test");
        return;
      }

      // Tier 2: server fallback — handles cases where localStorage was never
      // set (test started before this build) or was cleared by the browser
      try {
        const data = await testApi.getHistory();
        const inProgress = data.attempts.find(a => a.status === "in_progress");
        if (inProgress) {
          const resumed = await testStore.resumeTest(inProgress.id);
          if (!resumed) push("/test");
        } else {
          push("/test");
        }
      } catch {
        push("/test");
      }
    }
  });

  onDestroy(() => {
    clearInterval(timerInterval);
  });

  // Auto-complete when all questions answered
  $: if ($isTestComplete && $testStore.activeTest !== null && !isCompleting) {
    handleComplete();
  }

  // Build a VocabularyWord-compatible object from the current question
  $: wordForCard = $currentQuestion
    ? ({
        id: $currentQuestion.vocabId,
        word: $currentQuestion.word,
        part_of_speech: $currentQuestion.partOfSpeech,
        definition: $currentQuestion.definition,
        example_sentence: $currentQuestion.exampleSentence,
        synonyms: $currentQuestion.synonyms,
        antonyms: $currentQuestion.antonyms,
      } as VocabularyWord)
    : null;

  $: cardMode = ($currentQuestion?.mode ?? "quiz") as StudyMode;

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function handleAnswer(event: CustomEvent<{ correct: boolean }>) {
    await testStore.answerQuestion(event.detail.correct);
    // isTestComplete reactive will fire handleComplete if done
  }

  async function handleComplete() {
    if (isCompleting) return;
    isCompleting = true;
    clearInterval(timerInterval);
    try {
      const results = await testStore.completeTest();
      const testId = $testStore.activeTest?.id;
      push(`/test/results/${testId}`);
    } catch (err) {
      console.error("Failed to complete test:", err);
      isCompleting = false;
    }
  }

  function confirmAbort() {
    showAbortConfirm = true;
  }

  function cancelAbort() {
    showAbortConfirm = false;
  }

  function doAbort() {
    clearInterval(timerInterval);
    testStore.clearActiveTest();
    push("/test");
  }

  // Mode label colors
  const modeColors: Record<string, string> = {
    quiz: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    typing: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    context: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    match: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  };
</script>

<div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header user={$user} showNav={false} />

  <main id="main-content" class="flex-1 flex flex-col container mx-auto px-4 py-4 max-w-3xl">

    <!-- Test header bar -->
    <div class="flex items-center justify-between mb-4">
      <!-- Left: abort -->
      <button
        type="button"
        on:click={confirmAbort}
        class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        aria-label="End test"
      >
        <X class="w-4 h-4" />
        End Test
      </button>

      <!-- Center: progress -->
      <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {$testProgress.answered} / {$testProgress.total}
      </div>

      <!-- Right: timer -->
      <div class="text-sm tabular-nums text-gray-500 dark:text-gray-400">
        {formatTime(elapsedSeconds)}
      </div>
    </div>

    <!-- Progress bar -->
    <div class="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full mb-6 overflow-hidden">
      <div
        class="h-full bg-indigo-500 rounded-full transition-all duration-500"
        style="width: {$testProgress.percent}%"
        role="progressbar"
        aria-valuenow={$testProgress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Test progress"
      ></div>
    </div>

    <!-- Mode badge -->
    {#if $currentQuestion}
      <div class="flex items-center justify-center mb-4">
        <span class="text-xs font-semibold px-3 py-1 rounded-full {modeColors[$currentQuestion.mode] ?? ''}">
          {$currentQuestion.mode.charAt(0).toUpperCase() + $currentQuestion.mode.slice(1)} Mode
        </span>
      </div>
    {/if}

    <!-- Flash card -->
    <div class="flex-1 flex flex-col items-center justify-start">
      {#if isCompleting}
        <div class="flex flex-col items-center justify-center py-20 gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p class="text-gray-600 dark:text-gray-400 font-medium">Calculating results…</p>
        </div>
      {:else if wordForCard && $currentQuestion}
        <div class="w-full">
          <FlashCard
            word={wordForCard}
            mode={cardMode}
            disabled={false}
            testMode={true}
            on:answer={handleAnswer}
          />
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center py-20 gap-4">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading…</p>
        </div>
      {/if}
    </div>

  </main>

  <!-- Abort confirmation dialog -->
  {#if showAbortConfirm}
    <div
      class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="End test confirmation"
    >
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <AlertTriangle class="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">End the test?</h2>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Your progress will be lost and no XP will be awarded. Are you sure?
        </p>
        <div class="flex gap-3">
          <button
            type="button"
            on:click={cancelAbort}
            class="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            Keep going
          </button>
          <button
            type="button"
            on:click={doAbort}
            class="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            End Test
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
