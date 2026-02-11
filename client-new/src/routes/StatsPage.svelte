<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { auth, user, gamification } from '$lib/stores/auth';
  import { progress } from '$lib/stores/progress';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Container from '$lib/components/layout/Container.svelte';
  import StatsOverview from '$lib/components/stats/StatsOverview.svelte';
  import VocabularyProgress from '$lib/components/stats/VocabularyProgress.svelte';
  import StudyActivity from '$lib/components/stats/StudyActivity.svelte';
  import WordsToFocusOn from '$lib/components/stats/WordsToFocusOn.svelte';
  import AchievementGrid from '$lib/components/stats/AchievementGrid.svelte';

  let stats = {
    totalWords: 0,
    learnedWords: 0,
    inProgressWords: 0,
    notStartedWords: 0,
    totalSessions: 0,
    totalStudyTime: 0,
    averageSessionTime: 0,
    averageAccuracy: 0,
    lastStudyDate: undefined as string | undefined,
    weakWords: [] as Array<{ word: string; vocab_id: number; accuracy: number }>,
  };

  let achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
  }> = [];

  let unsubscribe: (() => void) | undefined;

  onMount(async () => {
    const user = await auth.checkSession();
    if (!user) {
      push('/login');
      return;
    }

    // Load stats and achievements
    await Promise.all([
      progress.loadStats(),
      progress.loadAchievements(),
      progress.loadDifficultWords(10),
    ]);

    // Update local state from stores - store unsubscribe function for cleanup
    unsubscribe = progress.subscribe((state) => {
      if (state.stats) {
        const apiStats = state.stats;
        stats = {
          totalWords: apiStats.progress.totalWords,
          learnedWords: apiStats.progress.wordsLearned,
          inProgressWords: Math.floor(apiStats.progress.totalWords * 0.3), // Mock data
          notStartedWords: apiStats.progress.totalWords - apiStats.progress.wordsLearned,
          totalSessions: apiStats.activity.totalSessions,
          totalStudyTime: apiStats.activity.totalStudyTime,
          averageSessionTime: apiStats.activity.avgSessionTime,
          averageAccuracy: apiStats.progress.accuracy,
          lastStudyDate: apiStats.activity.lastStudy || undefined,
          weakWords: state.difficultWords,
        };
      }
      achievements = state.achievements;
    });
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
</script>

<div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header user={$user} />

  <Container>
    <div class="py-8 space-y-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
        My Progress
      </h1>

      <!-- Overview Hero -->
      <StatsOverview
          level={$gamification?.level || 1}
          currentXP={$gamification?.totalXp || 0}
          xpToNextLevel={($gamification?.level || 1) * 100}
          streak={$gamification?.dailyStreak || 0}
          totalWords={stats.totalWords}
          learnedWords={stats.learnedWords}
        />

      <!-- Study Activity -->
      <StudyActivity
          totalSessions={stats.totalSessions}
          totalStudyTime={stats.totalStudyTime}
          averageSessionTime={stats.averageSessionTime}
          averageAccuracy={stats.averageAccuracy}
          lastStudyDate={stats.lastStudyDate}
        />

      <!-- Vocabulary Progress -->
      <VocabularyProgress
          totalWords={stats.totalWords}
          learnedWords={stats.learnedWords}
          inProgressWords={stats.inProgressWords}
          notStartedWords={stats.notStartedWords}
        />

      <!-- Words to Focus On -->
      <WordsToFocusOn weakWords={stats.weakWords} />

      <!-- Achievements -->
      <AchievementGrid {achievements} />
    </div>
  </Container>
  
  <Footer />
</div>
