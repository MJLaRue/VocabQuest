<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { VocabularyWord } from "$lib/api/vocab";
  import type { StudyMode } from "$lib/api/progress";
  import { vocab } from "$lib/stores/vocab";
  import { Eye, EyeOff, Lightbulb, Volume2 } from "lucide-svelte";
  import { cn } from "$lib/utils/cn";
  import { generateHint } from "$lib/utils/hints";
  import { confettiPresets } from "$lib/utils/confetti";
  import {
    fisherYatesShuffle,
    generateQuizOptions,
    generateContextOptions,
    blankOutWord,
    generateMatchData,
    type MatchData,
  } from "$lib/utils/flashcardLogic";
  import Input from "$lib/components/ui/Input.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import AnswerOverlay from "./AnswerOverlay.svelte";

  export let word: VocabularyWord | null = null;
  export let disabled = false;
  export let mode: StudyMode = "practice";
  export let advanced = false;

  const dispatch = createEventDispatcher<{
    flip: void;
    answer: { correct: boolean };
  }>();

  let isFlipped = false;
  let typedAnswer = "";
  let quizAnswer: number | null = null;
  let contextAnswer: number | null = null;
  let matchAnswer: number | null = null;
  let showResult = false;
  let hintLevel = 0;
  let showOverlay = false;
  let overlayIsCorrect = false;

  // Distractor pool for context and match modes (fetched async from full DB)
  let distractorPool: VocabularyWord[] = [];

  // Match mode: synonym vs antonym (decided once per word)
  let matchType: "synonym" | "antonym" = "synonym";

  // ─── Reset state when word changes ───────────────────────────────────────
  $: {
    if (word) {
      isFlipped = false;
      typedAnswer = "";
      quizAnswer = null;
      contextAnswer = null;
      matchAnswer = null;
      showResult = false;
      hintLevel = 0;
      showOverlay = false;
      distractorPool = [];

      // Decide synonym vs antonym randomly for match mode
      const hasSynonyms = (word.synonyms?.length ?? 0) > 0;
      const hasAntonyms = (word.antonyms?.length ?? 0) > 0;
      if (hasSynonyms && hasAntonyms) {
        matchType = Math.random() < 0.5 ? "synonym" : "antonym";
      } else if (hasSynonyms) {
        matchType = "synonym";
      } else {
        matchType = "antonym";
      }

      // Pre-fetch distractors for quiz/context/relate modes
      if (mode === "quiz" || mode === "context" || mode === "relate") {
        vocab.loadDistractors(word.part_of_speech, word.id).then((d) => {
          distractorPool = d;
        });
      }
    }
  }

  // Also fetch distractors when mode switches to quiz/context/relate
  $: if (word && (mode === "quiz" || mode === "context" || mode === "relate") && distractorPool.length === 0) {
    vocab.loadDistractors(word.part_of_speech, word.id).then((d) => {
      distractorPool = d;
    });
  }

  $: hintText = word && hintLevel > 0 ? generateHint(word.word, hintLevel) : "";

  function showHint() {
    if (hintLevel < 3) hintLevel++;
  }

  // ─── Pronunciation ────────────────────────────────────────────────────────
  function pronounceWord(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }

  // ─── Quiz Mode options ────────────────────────────────────────────────────
  $: quizOptions = word ? generateQuizOptions(word, distractorPool) : [];

  // ─── Context Mode options ─────────────────────────────────────────────────
  $: contextOptions =
    word && mode === "context" && distractorPool.length > 0
      ? generateContextOptions(word, distractorPool)
      : [];

  $: contextFallback = word && mode === "context" && !word.example_sentence;

  $: contextSentenceWithBlank =
    word && word.example_sentence
      ? blankOutWord(word.example_sentence, word.word)
      : null;

  // ─── Relate Mode data ─────────────────────────────────────────────────────
  $: matchData =
    word && mode === "relate" && distractorPool.length > 0
      ? generateMatchData(word, distractorPool, matchType)
      : null;

  $: matchFallback =
    word &&
    mode === "relate" &&
    (word.synonyms?.length ?? 0) === 0 &&
    (word.antonyms?.length ?? 0) === 0;

  // ─── Answer checking ──────────────────────────────────────────────────────
  function checkTypedAnswer() {
    if (!word) return;
    const isCorrect = typedAnswer.toLowerCase().trim() === word.word.toLowerCase();
    showResult = true;
    overlayIsCorrect = isCorrect;
    showOverlay = true;

    if (isCorrect) {
      confettiPresets.fireworks();
      confettiPresets.explosion();
      isFlipped = true;
      dispatch("flip");
      setTimeout(() => dispatch("answer", { correct: true }), 1500);
    } else {
      setTimeout(() => {
        showResult = false;
        typedAnswer = "";
      }, 1200);
    }
  }

  function checkQuizAnswer(index: number) {
    if (!word || showResult) return;
    quizAnswer = index;
    const isCorrect = quizOptions[index] === word.definition;
    showResult = true;
    overlayIsCorrect = isCorrect;
    showOverlay = true;

    if (isCorrect) {
      confettiPresets.fireworks();
      confettiPresets.explosion();
      isFlipped = true;
      dispatch("flip");
      setTimeout(() => dispatch("answer", { correct: true }), 1500);
    } else {
      setTimeout(() => {
        showResult = false;
        quizAnswer = null;
      }, 1500);
    }
  }

  function checkContextAnswer(index: number) {
    if (!word || showResult) return;
    contextAnswer = index;
    const isCorrect = contextOptions[index] === word.word;
    showResult = true;
    overlayIsCorrect = isCorrect;
    showOverlay = true;

    if (isCorrect) {
      confettiPresets.fireworks();
      confettiPresets.explosion();
      isFlipped = true;
      dispatch("flip");
      setTimeout(() => dispatch("answer", { correct: true }), 1500);
    } else {
      setTimeout(() => {
        showResult = false;
        contextAnswer = null;
      }, 1500);
    }
  }

  function checkRelateTypedAnswer() {
    if (!word) return;
    const validAnswers = matchType === "synonym"
      ? (word.synonyms ?? [])
      : (word.antonyms ?? []);
    const isCorrect = validAnswers.some(
      (a) => a.toLowerCase() === typedAnswer.toLowerCase().trim()
    );
    showResult = true;
    overlayIsCorrect = isCorrect;
    showOverlay = true;

    if (isCorrect) {
      confettiPresets.fireworks();
      confettiPresets.explosion();
      isFlipped = true;
      dispatch("flip");
      setTimeout(() => dispatch("answer", { correct: true }), 1500);
    } else {
      setTimeout(() => {
        showResult = false;
        typedAnswer = "";
      }, 1200);
    }
  }

  function checkMatchAnswer(index: number) {
    if (!matchData || showResult) return;
    matchAnswer = index;
    const isCorrect = matchData.options[index] === matchData.correctAnswer;
    showResult = true;
    overlayIsCorrect = isCorrect;
    showOverlay = true;

    if (isCorrect) {
      confettiPresets.fireworks();
      confettiPresets.explosion();
      isFlipped = true;
      dispatch("flip");
      setTimeout(() => dispatch("answer", { correct: true }), 1500);
    } else {
      setTimeout(() => {
        showResult = false;
        matchAnswer = null;
      }, 1500);
    }
  }

  function handleOverlayClose() {
    showOverlay = false;
  }

  function handleFlip() {
    if (disabled) return;
    isFlipped = !isFlipped;
    dispatch("flip");
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleFlip();
    }
  }

  // Shared CSS helper for multiple-choice option buttons
  function optionClass(
    index: number,
    isCorrectOption: boolean,
    selectedIndex: number | null,
  ): string {
    if (!showResult || selectedIndex !== index) {
      return "border-teal-200 dark:border-teal-700 hover:border-teal-400 dark:hover:border-teal-500 bg-white dark:bg-gray-800";
    }
    return isCorrectOption
      ? "border-green-500 bg-green-100 dark:bg-green-900/30"
      : "border-red-500 bg-red-100 dark:bg-red-900/30";
  }
</script>

{#if showOverlay}
  <AnswerOverlay isCorrect={overlayIsCorrect} onClose={handleOverlayClose} />
{/if}

<div class="relative w-full max-w-2xl mx-auto perspective-1000">

  <!-- ─── Typing Mode ─────────────────────────────────────────────────────── -->
  {#if mode === "typing"}
    <div class="flashcard-face w-full">
      <div
        class="flex flex-col items-center justify-center gap-6 p-6 md:p-8 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 rounded-3xl shadow-xl border border-rose-200 dark:border-rose-800"
      >
        {#if word}
          <div class="text-center space-y-3 w-full max-w-md">
            <p class="text-sm text-rose-600 dark:text-rose-400 uppercase tracking-wide">
              {word.part_of_speech}
            </p>
            <h2 class="text-3xl font-bold text-rose-900 dark:text-rose-50">
              {word.definition}
            </h2>

            {#if hintLevel > 0}
              <div class="p-3 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p class="text-xs text-rose-600 dark:text-rose-400 mb-1">💡 Hint {hintLevel}/3:</p>
                <p class="text-2xl font-mono tracking-wider text-rose-700 dark:text-rose-300">{hintText}</p>
              </div>
            {/if}

            <div class="space-y-4 w-full">
              <input
                type="text"
                value={typedAnswer}
                placeholder="Type the word..."
                {disabled}
                class="flex h-11 w-full rounded-lg border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-center text-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                on:input={(e) => { typedAnswer = e.currentTarget.value; }}
                on:keydown={(e) => {
                  if (e.key === "Enter" && typedAnswer.trim() && !disabled && !showResult) {
                    e.preventDefault();
                    checkTypedAnswer();
                  }
                }}
              />

              <div class="flex gap-2">
                {#if !showResult}
                  <Button on:click={checkTypedAnswer} disabled={!typedAnswer.trim() || disabled} class="flex-1">
                    Check Answer
                  </Button>
                {/if}
                <Button on:click={showHint} disabled={hintLevel >= 3 || disabled || showResult} variant="secondary">
                  <Lightbulb class="w-4 h-4 mr-2" />
                  {hintLevel === 0 ? "Hint" : `${hintLevel}/3`}
                </Button>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>

  <!-- ─── Quiz Mode ──────────────────────────────────────────────────────── -->
  {:else if mode === "quiz"}
    <div class="flashcard-face w-full">
      <div
        class="flex flex-col items-center justify-center gap-4 md:gap-6 p-6 md:p-8 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 rounded-3xl shadow-xl border border-sky-200 dark:border-sky-800"
      >
        {#if word}
          <div class="text-center space-y-4 w-full max-w-md">
            <p class="text-sm text-sky-600 dark:text-sky-400 uppercase tracking-wide">
              {word.part_of_speech}
            </p>
            <div class="flex items-center justify-center gap-3">
              <h2 class="text-4xl font-bold text-sky-900 dark:text-sky-50 mb-6">
                {word.word}
              </h2>
              <button
                on:click={() => word && pronounceWord(word.word)}
                class="text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-200 transition-colors -mt-4"
                title="Hear the word pronounced"
                aria-label="Pronounce word"
              >
                <Volume2 class="w-5 h-5" />
              </button>
            </div>

            <p class="text-base text-sky-700 dark:text-sky-300 mb-6">
              Choose the correct definition:
            </p>

            <div class="space-y-3">
              {#each quizOptions as option, index}
                <button
                  on:click={() => checkQuizAnswer(index)}
                  disabled={disabled || showResult}
                  class={cn(
                    "w-full p-4 rounded-xl text-left transition-all border-2",
                    optionClass(index, option === word.definition, quizAnswer),
                  )}
                >
                  <p class="text-sm text-gray-800 dark:text-gray-200">{option}</p>
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>

  <!-- ─── Context Mode ───────────────────────────────────────────────────── -->
  {:else if mode === "context"}
    <div class="flashcard-face w-full">
      <div
        class="flex flex-col items-center justify-center gap-4 md:gap-6 p-6 md:p-8 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-3xl shadow-xl border border-purple-200 dark:border-purple-800"
      >
        {#if word}
          <div class="text-center space-y-4 w-full max-w-md">
            <p class="text-sm text-purple-600 dark:text-purple-400 uppercase tracking-wide">
              {word.part_of_speech} · Sentence Context{advanced ? " · Advanced" : ""}
            </p>

            {#if contextFallback || !contextSentenceWithBlank}
              <!-- Fallback: no example sentence -->
              <div class="p-3 bg-purple-100/50 dark:bg-purple-900/20 rounded-lg">
                <p class="text-xs text-purple-600 dark:text-purple-400 italic mb-2">
                  {advanced ? "Type the word that matches this definition:" : "Choose the word that matches this definition:"}
                </p>
                <h2 class="text-2xl font-bold text-purple-900 dark:text-purple-50">
                  {word.definition}
                </h2>
              </div>
            {:else}
              <!-- Sentence with blank -->
              <div class="p-4 bg-white/60 dark:bg-black/20 rounded-xl">
                <p class="text-xl leading-relaxed text-purple-900 dark:text-purple-100 font-medium">
                  {contextSentenceWithBlank}
                </p>
              </div>
              <p class="text-sm text-purple-700 dark:text-purple-300">
                {advanced ? "Type the word that belongs in the blank:" : "Which word belongs in the blank?"}
              </p>
            {/if}

            {#if advanced}
              <!-- Advanced: typing input -->
              <div class="space-y-3 w-full">
                <input
                  type="text"
                  value={typedAnswer}
                  placeholder="Type the word…"
                  {disabled}
                  class="flex h-11 w-full rounded-lg border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-800 px-4 py-2 text-center text-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50 transition-colors"
                  on:input={(e) => { typedAnswer = e.currentTarget.value; }}
                  on:keydown={(e) => {
                    if (e.key === "Enter" && typedAnswer.trim() && !disabled && !showResult) {
                      e.preventDefault();
                      checkTypedAnswer();
                    }
                  }}
                />
                <div class="flex gap-2">
                  {#if !showResult}
                    <Button on:click={checkTypedAnswer} disabled={!typedAnswer.trim() || disabled} class="flex-1">
                      Check Answer
                    </Button>
                  {/if}
                  <Button on:click={showHint} disabled={hintLevel >= 3 || disabled || showResult} variant="secondary">
                    <Lightbulb class="w-4 h-4 mr-2" />
                    {hintLevel === 0 ? "Hint" : `${hintLevel}/3`}
                  </Button>
                </div>
              </div>
            {:else if contextOptions.length > 0}
              <div class="space-y-3">
                {#each contextOptions as option, index}
                  <button
                    on:click={() => checkContextAnswer(index)}
                    disabled={disabled || showResult}
                    class={cn(
                      "w-full p-3 rounded-xl text-left transition-all border-2 font-medium",
                      optionClass(index, option === word.word, contextAnswer),
                    )}
                  >
                    <p class="text-base text-gray-800 dark:text-gray-200">{option}</p>
                  </button>
                {/each}
              </div>
            {:else}
              <div class="py-4 text-purple-500 dark:text-purple-400 text-sm animate-pulse">
                Loading options…
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>

  <!-- ─── Relate Mode ────────────────────────────────────────────────────── -->
  {:else if mode === "relate"}
    <div class="flashcard-face w-full">
      <div
        class="flex flex-col items-center justify-center gap-4 md:gap-6 p-6 md:p-8 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-3xl shadow-xl border border-orange-200 dark:border-orange-800"
      >
        {#if word}
          <div class="text-center space-y-4 w-full max-w-md">
            <p class="text-sm text-orange-600 dark:text-orange-400 uppercase tracking-wide">
              {word.part_of_speech} · Synonym / Antonym{advanced ? " · Advanced" : ""}
            </p>
            <div class="flex items-center justify-center gap-3">
              <h2 class="text-4xl font-bold text-orange-900 dark:text-orange-50">
                {word.word}
              </h2>
              <button
                on:click={() => word && pronounceWord(word.word)}
                class="text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-200 transition-colors"
                title="Hear the word pronounced"
                aria-label="Pronounce word"
              >
                <Volume2 class="w-5 h-5" />
              </button>
            </div>

            {#if matchFallback}
              <!-- Fallback: no synonyms/antonyms — show as definition quiz -->
              <p class="text-base font-semibold text-orange-700 dark:text-orange-300">
                Choose the correct definition:
              </p>
              <div class="space-y-3">
                {#each quizOptions as option, index}
                  <button
                    on:click={() => checkQuizAnswer(index)}
                    disabled={disabled || showResult}
                    class={cn(
                      "w-full p-3 rounded-xl text-left transition-all border-2",
                      optionClass(index, option === word.definition, quizAnswer),
                    )}
                  >
                    <p class="text-sm text-gray-800 dark:text-gray-200">{option}</p>
                  </button>
                {/each}
              </div>
            {:else}
              <!-- Synonym / Antonym badge -->
              {#if matchType === "synonym"}
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600">
                  <span class="text-lg font-bold text-emerald-700 dark:text-emerald-300">≈</span>
                  <span class="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Find a Synonym</span>
                </div>
              {:else}
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 dark:bg-rose-900/40 border-2 border-rose-400 dark:border-rose-600">
                  <span class="text-lg font-bold text-rose-700 dark:text-rose-300">≠</span>
                  <span class="text-sm font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">Find an Antonym</span>
                </div>
              {/if}

              {#if advanced}
                <!-- Advanced: type a synonym/antonym -->
                <div class="space-y-3 w-full">
                  <input
                    type="text"
                    value={typedAnswer}
                    placeholder={matchType === "synonym" ? "Type a synonym…" : "Type an antonym…"}
                    {disabled}
                    class="flex h-11 w-full rounded-lg border-2 border-orange-300 dark:border-orange-600 bg-white dark:bg-slate-800 px-4 py-2 text-center text-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 transition-colors"
                    on:input={(e) => { typedAnswer = e.currentTarget.value; }}
                    on:keydown={(e) => {
                      if (e.key === "Enter" && typedAnswer.trim() && !disabled && !showResult) {
                        e.preventDefault();
                        checkRelateTypedAnswer();
                      }
                    }}
                  />
                  {#if !showResult}
                    <Button on:click={checkRelateTypedAnswer} disabled={!typedAnswer.trim() || disabled} class="w-full">
                      Check Answer
                    </Button>
                  {/if}
                </div>
              {:else if matchData}
                <div class="space-y-3">
                  {#each matchData.options as option, index}
                    <button
                      on:click={() => checkMatchAnswer(index)}
                      disabled={disabled || showResult}
                      class={cn(
                        "w-full p-3 rounded-xl text-left transition-all border-2 font-medium",
                        optionClass(
                          index,
                          option === matchData.correctAnswer,
                          matchAnswer,
                        ),
                      )}
                    >
                      <p class="text-base text-gray-800 dark:text-gray-200">{option}</p>
                    </button>
                  {/each}
                </div>
              {:else}
                <div class="py-4 text-orange-500 dark:text-orange-400 text-sm animate-pulse">
                  Loading options…
                </div>
              {/if}
            {/if}
          </div>
        {/if}
      </div>
    </div>

  <!-- ─── Practice Mode (Flip Card) ─────────────────────────────────────── -->
  {:else}
    <button
      class={cn(
        "flashcard relative w-full min-h-[400px] md:aspect-[3/2] cursor-pointer",
        "transform-style-3d transition-transform duration-500",
        isFlipped && "rotate-y-180",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      on:click={handleFlip}
      on:keypress={handleKeyPress}
      {disabled}
    >
      <!-- Front: word -->
      <div class="flashcard-face absolute inset-0 backface-hidden">
        <div
          class="h-full flex flex-col items-center justify-center gap-4 p-8 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950 rounded-3xl shadow-xl border border-teal-200 dark:border-teal-800"
        >
          {#if word}
            <div class="text-center space-y-2">
              <div class="flex items-center justify-center gap-3">
                <h2 class="text-3xl md:text-5xl font-bold text-teal-900 dark:text-teal-50 break-words">
                  {word.word}
                </h2>
                <button
                  on:click|stopPropagation={() => word && pronounceWord(word.word)}
                  class="text-teal-500 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-200 transition-colors"
                  title="Hear the word pronounced"
                  aria-label="Pronounce word"
                >
                  <Volume2 class="w-5 h-5" />
                </button>
              </div>
              <p class="text-sm text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                {word.part_of_speech}
              </p>
            </div>

            <div class="absolute bottom-6 flex items-center gap-2 text-teal-500 dark:text-teal-400">
              <Eye class="w-4 h-4" />
              <span class="text-sm">Click or press space to reveal</span>
            </div>
          {:else}
            <div class="text-center text-teal-500 dark:text-teal-400">
              <p>No words to study</p>
            </div>
          {/if}
        </div>
      </div>

      <!-- Back: definition + example + synonyms -->
      <div class="flashcard-face absolute inset-0 backface-hidden rotate-y-180">
        <div
          class="h-full flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-3xl shadow-xl border border-emerald-200 dark:border-emerald-800"
        >
          {#if word}
            <div class="text-center space-y-2">
              <h2 class="text-3xl md:text-4xl font-bold text-emerald-900 dark:text-emerald-50 break-words">
                {word.word}
              </h2>
              <p class="text-sm text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                {word.part_of_speech}
              </p>
            </div>

            <div class="space-y-4 max-w-xl">
              <div class="p-4 bg-white/50 dark:bg-black/20 rounded-xl">
                <p class="text-lg text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  {word.definition}
                </p>
              </div>

              {#if word.example_sentence}
                <div class="p-4 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <p class="text-sm text-emerald-700 dark:text-emerald-300 italic">
                    "{word.example_sentence}"
                  </p>
                </div>
              {/if}

              {#if word.synonyms && word.synonyms.length > 0}
                <div class="flex flex-wrap justify-center gap-2">
                  {#each word.synonyms as syn}
                    <span class="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                      ≈ {syn}
                    </span>
                  {/each}
                </div>
              {/if}
            </div>

            <div class="absolute bottom-6 flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
              <EyeOff class="w-4 h-4" />
              <span class="text-sm">Click to return</span>
            </div>
          {/if}
        </div>
      </div>
    </button>
  {/if}
</div>

<style>
  .perspective-1000 {
    perspective: 1000px;
  }

  .transform-style-3d {
    transform-style: preserve-3d;
  }

  .backface-hidden {
    backface-visibility: hidden;
  }

  .rotate-y-180 {
    transform: rotateY(180deg);
  }

  .flashcard-face {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
</style>
