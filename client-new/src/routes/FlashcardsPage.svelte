<script lang="ts">
  import { onMount } from 'svelte';
  import { push, location } from 'svelte-spa-router';
  import { get } from 'svelte/store';
  import { auth, user, gamification } from '$lib/stores/auth';
  import { vocab, currentWord, progress as vocabProgress, hasNext, hasPrev } from '$lib/stores/vocab';
  import { progress, sessionStats, hasActiveSession } from '$lib/stores/progress';
  import { ui } from '$lib/stores/ui';
  import Header from '$lib/components/layout/Header.svelte';
  import Container from '$lib/components/layout/Container.svelte';
  import ControlBar from '$lib/components/flashcard/ControlBar.svelte';
  import GamificationBar from '$lib/components/flashcard/GamificationBar.svelte';
  import DeckSelector from '$lib/components/flashcard/DeckSelector.svelte';
  import FlashCard from '$lib/components/flashcard/FlashCard.svelte';
  import FlashcardActions from '$lib/components/flashcard/FlashcardActions.svelte';
  import FlashcardNavigation from '$lib/components/flashcard/FlashcardNavigation.svelte';
  import SessionSummaryModal from '$lib/components/flashcard/SessionSummaryModal.svelte';
  import { confetti } from '$lib/utils/confetti';

  // Determine mode from URL path
  function getModeFromPath(path: string): 'practice' | 'quiz' | 'typing' {
    if (path === '/quiz') return 'quiz';
    if (path === '/typing') return 'typing';
    return 'practice';
  }

  let mode: 'practice' | 'quiz' | 'typing' = getModeFromPath($location);
  let randomMode = typeof window !== 'undefined' 
    ? localStorage.getItem('vocabquest-random-mode') === 'true' 
    : false;
  let isLoading = false;

  // Update mode when location changes
  $: mode = getModeFromPath($location);

  onMount(async () => {
    const user = await auth.checkSession();
    if (!user) {
      push('/login');
      return;
    }

    // Load initial data
    await Promise.all([
      vocab.loadDecks(),
      randomMode ? vocab.loadRandomWords() : vocab.loadWords(),
      progress.loadProgress(),
    ]);

    // Check for active session and resume or start new based on 30-minute rule
    const sessionId = await progress.checkAndResumeSession(mode);
    
    // If resumed session mode differs from URL mode, update the mode
    const progressState = get(progress);
    if (progressState.currentSession.mode && progressState.currentSession.mode !== mode) {
      progress.updateSessionMode(mode);
    }
  });

  async function handleModeChange(newMode: 'practice' | 'quiz' | 'typing') {
    // Update URL to match mode
    const pathMap = {
      practice: '/practice',
      quiz: '/quiz',
      typing: '/typing'
    };
    push(pathMap[newMode]);
    
    // Update session mode in store
    progress.updateSessionMode(newMode);
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
      
      if (result.levelUp) {
        confetti();
        ui.showLevelUp();
      }

      if (result.newAchievements.length > 0) {
        result.newAchievements.forEach((achievement) => {
          ui.showAchievement(achievement);
        });
      }

      // Remove the card from the current set
      const { setCompleted } = vocab.removeCurrentCard();
      
      // Award set completion bonus
      if (setCompleted) {
        confetti();
        progress.awardSetCompletionBonus();
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
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
      console.error('Failed to update progress:', error);
    } finally {
      isLoading = false;
    }
  }

  function handleToggleRandom() {
    randomMode = !randomMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('vocabquest-random-mode', String(randomMode));
    }
    vocab.setMode(randomMode ? 'random' : 'sequential');
  }

  function handleSearch({ detail }: CustomEvent<{ query: string }>) {
    vocab.setFilter('search', detail.query || null);
  }

  function handleDeckSelect({ detail }: CustomEvent<{ deck: string | null }>) {
    vocab.setFilter('deck', detail.deck);
  }

  function handlePOSSelect({ detail }: CustomEvent<{ pos: string | null }>) {
    vocab.setFilter('pos', detail.pos);
  }

  async function handleEndSession() {
    try {
      await progress.endSession();
      ui.openSessionSummary();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  function handleContinueSession() {
    ui.closeSessionSummary();
    progress.startSession(mode);
  }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header user={$user} />

  <main id="main-content">

  <GamificationBar
    level={$gamification?.level || 1}
    currentXP={$gamification?.totalXp || 0}
    xpToNextLevel={($gamification?.level || 1) * 100}
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
      {#if mode === 'practice'}
        <FlashcardActions
          disabled={!$currentWord}
          loading={isLoading}
          on:know={handleKnow}
          on:notYet={handleNotYet}
        />
      {/if}

      <!-- Session Stats -->
      <div class="flex justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <span class="font-medium">Cards:</span> {$sessionStats.cardsReviewed}
        </div>
        <div>
          <span class="font-medium">Accuracy:</span> {$sessionStats.accuracy}%
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
    newLevel={$gamification?.level || 1}
    on:close={() => ui.closeSessionSummary()}
    on:continue={handleContinueSession}
  />
</div>
