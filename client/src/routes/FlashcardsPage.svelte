<script lang="ts">
  import { onMount } from "svelte";
  import { push, location } from "svelte-spa-router";
  import { get } from "svelte/store";
  import { auth, user, gamification } from "$lib/stores/auth";
  import {
    vocab,
    currentWord,
    progress as vocabProgress,
    hasNext,
    hasPrev,
  } from "$lib/stores/vocab";
  import {
    progress,
    sessionStats,
    hasActiveSession,
  } from "$lib/stores/progress";
  import { ui } from "$lib/stores/ui";
  import Header from "$lib/components/layout/Header.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import Container from "$lib/components/layout/Container.svelte";
  import ControlBar from "$lib/components/flashcard/ControlBar.svelte";
  import GamificationBar from "$lib/components/flashcard/GamificationBar.svelte";
  import DeckSelector from "$lib/components/flashcard/DeckSelector.svelte";
  import FlashCard from "$lib/components/flashcard/FlashCard.svelte";
  import FlashcardActions from "$lib/components/flashcard/FlashcardActions.svelte";
  import FlashcardNavigation from "$lib/components/flashcard/FlashcardNavigation.svelte";
  import SessionSummaryModal from "$lib/components/flashcard/SessionSummaryModal.svelte";
  import CelebrationOverlay from "$lib/components/flashcard/CelebrationOverlay.svelte";
  import { confetti, confettiPresets } from "$lib/utils/confetti";

  // Determine mode from URL path
  function getModeFromPath(path: string): "practice" | "quiz" | "typing" {
    if (path === "/quiz") return "quiz";
    if (path === "/typing") return "typing";
    return "practice";
  }

  let mode: "practice" | "quiz" | "typing" = getModeFromPath($location);
  let randomMode =
    typeof window !== "undefined"
      ? localStorage.getItem("vocabquest-random-mode") !== "false"
      : true;
  let isLoading = false;

  // Celebration queue system
  type Celebration = {
    type: "levelUp" | "setComplete" | "achievement";
    level?: number;
    xpBonus?: number;
    achievementName?: string;
    achievementId?: string;
  };
  let celebrationQueue: Celebration[] = [];
  let currentCelebration: Celebration | null = null;

  // Achievement helpers
  function getAchievementInfo(id: string) {
    const config: Record<string, { name: string; xp: number }> = {
      first_correct: { name: "First Step", xp: 50 },
      words: { name: "Vocab Builder", xp: 150 },
      streak: { name: "Streak Warrior", xp: 100 },
      perfect: { name: "Perfectionist", xp: 100 },
      xp: { name: "XP Enthusiast", xp: 100 },
    };

    if (id === "first_correct") return { ...config.first_correct, level: 1 };

    // Handle tiered IDs like words_50, streak_7, perfect_5, xp_1k
    const [type, value] = id.split("_");
    const base = config[type] || { name: id, xp: 50 };

    const levelMap: Record<string, Record<string, number>> = {
      words: {
        "50": 1,
        "100": 2,
        "200": 3,
        "350": 4,
        "550": 5,
        "800": 6,
        "1100": 7,
        "1450": 8,
        "1850": 9,
        "2300": 10,
      },
      streak: {
        "3": 1,
        "7": 2,
        "14": 3,
        "21": 4,
        "30": 5,
        "50": 6,
        "75": 7,
        "100": 8,
        "180": 9,
        "365": 10,
      },
      perfect: {
        "1": 1,
        "5": 2,
        "10": 3,
        "25": 4,
        "50": 5,
        "100": 6,
        "200": 7,
        "500": 8,
      },
      xp: {
        "1k": 1,
        "5k": 2,
        "15k": 3,
        "40k": 4,
        "100k": 5,
        "250k": 6,
        "500k": 7,
        "1m": 8,
      },
    };

    return {
      name: base.name,
      xp: base.xp,
      level: levelMap[type]?.[value] || 1,
    };
  }

  function queueCelebration(celebration: Celebration) {
    celebrationQueue = [...celebrationQueue, celebration];
    if (!currentCelebration) {
      showNextCelebration();
    }
  }

  function showNextCelebration() {
    if (celebrationQueue.length === 0) {
      currentCelebration = null;
      return;
    }
    currentCelebration = celebrationQueue[0];
    celebrationQueue = celebrationQueue.slice(1);
  }

  function handleCloseCelebration() {
    showNextCelebration();
  }

  // Update mode when location changes
  $: mode = getModeFromPath($location);

  onMount(async () => {
    // Rely on global checkSession from App.svelte
    // Just verify we have a user, if not push to login
    if (!$user && !$auth.isLoading) {
      push("/login");
      return;
    }

    // Load initial data
    await vocab.loadDecks();
    await progress.loadProgress();

    // Only load words if we don't have any stored (from localStorage)
    const vocabState = get(vocab);
    if (vocabState.words.length === 0) {
      await (randomMode ? vocab.loadRandomWords() : vocab.loadWords());
    }

    // Check for active session and resume or start new based on 30-minute rule
    const sessionId = await progress.checkAndResumeSession(mode);

    // If resumed session mode differs from URL mode, update the mode
    const progressState = get(progress);
    if (
      progressState.currentSession.mode &&
      progressState.currentSession.mode !== mode
    ) {
      progress.updateSessionMode(mode);
    }
  });

  async function handleModeChange(newMode: "practice" | "quiz" | "typing") {
    // Update URL to match mode
    const pathMap = {
      practice: "/practice",
      quiz: "/quiz",
      typing: "/typing",
    };
    push(pathMap[newMode]);

    // Update session mode in store
    progress.updateSessionMode(newMode);

    // Advance to a new word so the user can't preview a card in one mode
    // and then trivially answer it after switching modes.
    // nextCard() is synchronous and has no effect on session stats.
    vocab.nextCard();
  }

  async function handleAnswer(event: CustomEvent<{ correct: boolean }>) {
    if (event.detail.correct) {
      await handleKnow();
    } else {
      await handleNotYet();
    }
  }

  async function handleKnow() {
    if (!$currentWord || isLoading) return;
    isLoading = true;

    try {
      // Show confetti for correct answer
      confetti();

      const result = await progress.updateProgress($currentWord.id, true);

      // Queue level up celebration if leveled up
      if (result.levelUp) {
        confettiPresets.levelUp();
        confettiPresets.explosion();
        queueCelebration({
          type: "levelUp",
          level: result.newLevel,
        });
      }

      // Queue achievement celebrations
      if (result.newAchievements.length > 0) {
        result.newAchievements.forEach((achievementId) => {
          const info = getAchievementInfo(achievementId);
          confettiPresets.fireworks();
          queueCelebration({
            type: "achievement",
            achievementName: info.name,
            achievementId: achievementId,
            level: info.level,
            xpBonus: info.xp,
          });
          ui.showAchievement(achievementId);
        });
      }

      // Remove the card from the current set
      const { setCompleted } = vocab.removeCurrentCard();

      // Award set completion bonus
      if (setCompleted) {
        // Epic set completion celebration!
        confettiPresets.fireworks();
        setTimeout(() => confettiPresets.explosion(), 400);
        const bonus = progress.awardSetCompletionBonus();
        queueCelebration({
          type: "setComplete",
          xpBonus: bonus,
        });
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    } finally {
      isLoading = false;
    }
  }

  async function handleNotYet() {
    if (!$currentWord || isLoading) return;
    isLoading = true;

    try {
      await progress.updateProgress($currentWord.id, false);
      vocab.nextCard();
    } catch (error) {
      console.error("Failed to update progress:", error);
    } finally {
      isLoading = false;
    }
  }

  function handleToggleRandom() {
    randomMode = !randomMode;
    if (typeof window !== "undefined") {
      localStorage.setItem("vocabquest-random-mode", String(randomMode));
    }
    vocab.setMode(randomMode ? "random" : "sequential");
  }

  function handleSearch({ detail }: CustomEvent<{ query: string }>) {
    vocab.setFilter("search", detail.query || null);
  }

  function handleDeckSelect({ detail }: CustomEvent<{ deck: string | null }>) {
    vocab.setFilter("deck", detail.deck);
  }

  function handlePOSSelect({ detail }: CustomEvent<{ pos: string | null }>) {
    vocab.setFilter("pos", detail.pos);
  }

  async function handleEndSession() {
    try {
      if ($hasActiveSession) {
        await progress.endSession();
      }
      ui.openSessionSummary();
    } catch (error) {
      console.error("Failed to end session:", error);
    }
  }

  function handleContinueSession() {
    ui.closeSessionSummary();
    progress.startSession(mode);
  }
</script>

<div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header user={$user} />

  <main id="main-content">
    <GamificationBar
      currentXP={$gamification?.totalXp || 0}
      streak={$gamification?.dailyStreak || 0}
      correctStreakBonus={$progress.currentSession.correctStreakBonus}
    />

    <ControlBar
      {mode}
      {randomMode}
      selectedPos={$vocab.filters.pos}
      on:modeChange={({ detail }) => handleModeChange(detail.mode)}
      on:toggleRandom={handleToggleRandom}
      on:search={handleSearch}
      on:posSelect={handlePOSSelect}
    />

    <Container>
      <div class="py-8 space-y-6">
        <!-- Filters -->
        {#if $vocab.decks.length > 1}
          <div class="flex flex-wrap items-center justify-center gap-4">
            <DeckSelector
              decks={$vocab.decks}
              selectedDeck={$vocab.filters.deck}
              on:select={handleDeckSelect}
            />
          </div>
        {/if}

        <!-- Flashcard -->
        <FlashCard
          word={$currentWord}
          {mode}
          disabled={isLoading}
          on:answer={handleAnswer}
        />

        <!-- Navigation -->
        <FlashcardNavigation
          hasPrev={$hasPrev}
          hasNext={$hasNext}
          remaining={$vocabProgress.remaining}
          disabled={isLoading}
          on:prev={() => vocab.prevCard()}
          on:next={() => vocab.nextCard()}
        />

        <!-- Actions (Practice mode only) -->
        {#if mode === "practice"}
          <FlashcardActions
            disabled={!$currentWord}
            loading={isLoading}
            on:know={handleKnow}
            on:notYet={handleNotYet}
          />
        {/if}

        <!-- Session Stats -->
        <div
          class="flex justify-center gap-8 text-sm text-gray-600 dark:text-gray-400"
        >
          <div>
            <span class="font-medium">Cards:</span>
            {$sessionStats.cardsReviewed}
          </div>
          <div>
            <span class="font-medium">Accuracy:</span>
            {$sessionStats.accuracy}%
          </div>
        </div>

        <!-- End Session Button -->
        <div class="flex justify-center">
          <button
            class="text-sm text-teal-600 dark:text-teal-400 hover:underline"
            on:click={handleEndSession}
            aria-label="End current study session"
          >
            End Session
          </button>
        </div>
      </div>
    </Container>
  </main>

  <SessionSummaryModal
    show={$ui.showSessionSummary}
    cardsReviewed={$progress.lastSessionSummary?.cardsReviewed || 0}
    correctAnswers={$progress.lastSessionSummary?.correctAnswers || 0}
    xpEarned={$progress.lastSessionSummary?.xpEarned || 0}
    duration={$progress.lastSessionSummary?.duration || 0}
    completedSets={$progress.lastSessionSummary?.completedSets || 0}
    levelUp={$progress.lastSessionSummary?.levelUp || false}
    newLevel={Math.floor(Math.sqrt(($gamification?.totalXp || 0) / 100)) + 1}
    on:close={() => ui.closeSessionSummary()}
    on:continue={handleContinueSession}
  />

  {#if currentCelebration}
    <CelebrationOverlay
      type={currentCelebration.type}
      level={currentCelebration.level || 1}
      xpBonus={currentCelebration.xpBonus || 50}
      achievementName={currentCelebration.achievementName || ""}
      achievementId={currentCelebration.achievementId || ""}
      onClose={handleCloseCelebration}
    />
  {/if}

  <Footer />
</div>
