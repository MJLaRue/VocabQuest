<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { VocabularyWord } from "$lib/api/vocab";
  import { vocab, allAvailableWords } from "$lib/stores/vocab";
  import { Eye, EyeOff, Lightbulb } from "lucide-svelte";
  import { cn } from "$lib/utils/cn";
  import { generateHint } from "$lib/utils/hints";
  import { confettiPresets } from "$lib/utils/confetti";
  import Input from "$lib/components/ui/Input.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import AnswerOverlay from "./AnswerOverlay.svelte";

  export let word: VocabularyWord | null = null;
  export let disabled = false;
  export let mode: "practice" | "quiz" | "typing" = "practice";

  const dispatch = createEventDispatcher<{
    flip: void;
    answer: { correct: boolean };
  }>();

  let isFlipped = false;
  let typedAnswer = "";
  let quizAnswer: number | null = null;
  let showResult = false;
  let hintLevel = 0; // 0 = no hint, 1-3 = progressive hints
  let showOverlay = false;
  let overlayIsCorrect = false;

  $: {
    // Reset state when word changes
    if (word) {
      isFlipped = false;
      typedAnswer = "";
      quizAnswer = null;
      showResult = false;
      hintLevel = 0;
      showOverlay = false;
    }
  }

  $: hintText = word && hintLevel > 0 ? generateHint(word.word, hintLevel) : "";

  function showHint() {
    if (hintLevel < 3) {
      hintLevel++;
    }
  }

  // Generate quiz options (for quiz mode)
  $: quizOptions = word ? generateQuizOptions(word, $allAvailableWords) : [];

  function generateQuizOptions(
    correctWord: VocabularyWord,
    allWords: VocabularyWord[],
  ): string[] {
    // Filter out the current word and get other words
    const otherWords = allWords.filter((w) => w.id !== correctWord.id);

    // If we don't have enough other words, use placeholders
    if (otherWords.length < 3) {
      return [
        correctWord.definition,
        "A different meaning (placeholder)",
        "Another definition (placeholder)",
        "Yet another option (placeholder)",
      ].sort(() => Math.random() - 0.5);
    }

    // Randomly select 3 other definitions
    const wrongOptions: string[] = [];
    const shuffled = [...otherWords].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 3 && i < shuffled.length; i++) {
      wrongOptions.push(shuffled[i].definition);
    }

    // Combine correct answer with wrong options and shuffle
    const options = [correctWord.definition, ...wrongOptions];
    return options.sort(() => Math.random() - 0.5);
  }

  function checkTypedAnswer() {
    if (!word) return;
    const isCorrect =
      typedAnswer.toLowerCase().trim() === word.word.toLowerCase();
    showResult = true;

    // Show overlay with animation
    overlayIsCorrect = isCorrect;
    showOverlay = true;

    if (isCorrect) {
      // Trigger fireworks effect
      confettiPresets.fireworks();
      confettiPresets.explosion();

      isFlipped = true;
      dispatch("flip");
      // Delay before dispatching answer (overlay closes after 1s)
      setTimeout(() => {
        dispatch("answer", { correct: true });
      }, 1500);
    } else {
      // Auto-reset after overlay closes to allow immediate retry
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

    // Show overlay with animation
    overlayIsCorrect = isCorrect;
    showOverlay = true;

    if (isCorrect) {
      // Trigger fireworks effect
      confettiPresets.fireworks();
      confettiPresets.explosion();

      isFlipped = true;
      dispatch("flip");
      // Delay before dispatching answer (overlay closes after 1s)
      setTimeout(() => {
        dispatch("answer", { correct: true });
      }, 1500);
    } else {
      // Allow retry - don't auto-advance (overlay closes after 1s)
      setTimeout(() => {
        showResult = false;
        quizAnswer = null;
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
</script>

{#if showOverlay}
  <AnswerOverlay isCorrect={overlayIsCorrect} onClose={handleOverlayClose} />
{/if}

<div class="relative w-full max-w-2xl mx-auto perspective-1000">
  {#if mode === "typing"}
    <!-- Typing Mode -->
    <div class="flashcard-face w-full">
      <div
        class="flex flex-col items-center justify-center gap-6 p-6 md:p-8 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950 rounded-3xl shadow-xl border border-teal-200 dark:border-teal-800"
      >
        {#if word}
          <div class="text-center space-y-3 w-full max-w-md">
            <p
              class="text-sm text-teal-600 dark:text-teal-400 uppercase tracking-wide"
            >
              {word.part_of_speech}
            </p>
            <h2 class="text-3xl font-bold text-teal-900 dark:text-teal-50">
              {word.definition}
            </h2>

            {#if hintLevel > 0}
              <div
                class="p-3 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
              >
                <p class="text-xs text-teal-600 dark:text-teal-400 mb-1">
                  💡 Hint {hintLevel}/3:
                </p>
                <p
                  class="text-2xl font-mono tracking-wider text-teal-700 dark:text-teal-300"
                >
                  {hintText}
                </p>
              </div>
            {/if}

            <div class="space-y-4 w-full">
              <input
                type="text"
                value={typedAnswer}
                placeholder="Type the word..."
                {disabled}
                class="flex h-11 w-full rounded-lg border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-center text-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                on:input={(e) => {
                  typedAnswer = e.currentTarget.value;
                }}
                on:keydown={(e) => {
                  if (
                    e.key === "Enter" &&
                    typedAnswer.trim() &&
                    !disabled &&
                    !showResult
                  ) {
                    e.preventDefault();
                    checkTypedAnswer();
                  }
                }}
              />

              <div class="flex gap-2">
                {#if !showResult}
                  <Button
                    on:click={checkTypedAnswer}
                    disabled={!typedAnswer.trim() || disabled}
                    class="flex-1"
                  >
                    Check Answer
                  </Button>
                {/if}
                <Button
                  on:click={showHint}
                  disabled={hintLevel >= 3 || disabled || showResult}
                  variant="secondary"
                >
                  <Lightbulb class="w-4 h-4 mr-2" />
                  {hintLevel === 0 ? "Hint" : `${hintLevel}/3`}
                </Button>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {:else if mode === "quiz"}
    <!-- Quiz Mode -->
    <div class="flashcard-face w-full">
      <div
        class="flex flex-col items-center justify-center gap-4 md:gap-6 p-6 md:p-8 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950 rounded-3xl shadow-xl border border-teal-200 dark:border-teal-800"
      >
        {#if word}
          <div class="text-center space-y-4 w-full max-w-md">
            <p
              class="text-sm text-teal-600 dark:text-teal-400 uppercase tracking-wide"
            >
              {word.part_of_speech}
            </p>
            <h2 class="text-4xl font-bold text-teal-900 dark:text-teal-50 mb-6">
              {word.word}
            </h2>

            <p class="text-base text-teal-700 dark:text-teal-300 mb-6">
              Choose the correct definition:
            </p>

            <div class="space-y-3">
              {#each quizOptions as option, index}
                <button
                  on:click={() => checkQuizAnswer(index)}
                  disabled={disabled || showResult}
                  class={cn(
                    "w-full p-4 rounded-xl text-left transition-all",
                    "border-2",
                    showResult && quizAnswer === index
                      ? option === word.definition
                        ? "border-green-500 bg-green-100 dark:bg-green-900/30"
                        : "border-red-500 bg-red-100 dark:bg-red-900/30"
                      : "border-teal-200 dark:border-teal-700 hover:border-teal-400 dark:hover:border-teal-500 bg-white dark:bg-gray-800",
                  )}
                >
                  <p class="text-sm text-gray-800 dark:text-gray-200">
                    {option}
                  </p>
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Practice Mode (Flip Card) -->
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
      <!-- Front of card (word) -->
      <div class="flashcard-face absolute inset-0 backface-hidden">
        <div
          class="h-full flex flex-col items-center justify-center gap-4 p-8 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950 rounded-3xl shadow-xl border border-teal-200 dark:border-teal-800"
        >
          {#if word}
            <div class="text-center space-y-2">
              <h2
                class="text-3xl md:text-5xl font-bold text-teal-900 dark:text-teal-50 break-words"
              >
                {word.word}
              </h2>
              <p
                class="text-sm text-teal-600 dark:text-teal-400 uppercase tracking-wide"
              >
                {word.part_of_speech}
              </p>
            </div>

            <div
              class="absolute bottom-6 flex items-center gap-2 text-teal-500 dark:text-teal-400"
            >
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

      <!-- Back of card (definition + example) -->
      <div class="flashcard-face absolute inset-0 backface-hidden rotate-y-180">
        <div
          class="h-full flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-3xl shadow-xl border border-emerald-200 dark:border-emerald-800"
        >
          {#if word}
            <div class="text-center space-y-2">
              <h2
                class="text-3xl md:text-4xl font-bold text-emerald-900 dark:text-emerald-50 break-words"
              >
                {word.word}
              </h2>
              <p
                class="text-sm text-emerald-600 dark:text-emerald-400 uppercase tracking-wide"
              >
                {word.part_of_speech}
              </p>
            </div>

            <div class="space-y-4 max-w-xl">
              <div class="p-4 bg-white/50 dark:bg-black/20 rounded-xl">
                <p
                  class="text-lg text-emerald-800 dark:text-emerald-200 leading-relaxed"
                >
                  {word.definition}
                </p>
              </div>

              {#if word.example_sentence}
                <div
                  class="p-4 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800"
                >
                  <p
                    class="text-sm text-emerald-700 dark:text-emerald-300 italic"
                  >
                    "{word.example_sentence}"
                  </p>
                </div>
              {/if}
            </div>

            <div
              class="absolute bottom-6 flex items-center gap-2 text-emerald-500 dark:text-emerald-400"
            >
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
