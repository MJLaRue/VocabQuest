<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { push } from "svelte-spa-router";
  import { auth, user, gamification } from "$lib/stores/auth";
  import { progress } from "$lib/stores/progress";
  import Header from "$lib/components/layout/Header.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import Container from "$lib/components/layout/Container.svelte";
  import StatsOverview from "$lib/components/stats/StatsOverview.svelte";
  import VocabularyProgress from "$lib/components/stats/VocabularyProgress.svelte";
  import StudyActivity from "$lib/components/stats/StudyActivity.svelte";
  import AchievementGrid from "$lib/components/stats/AchievementGrid.svelte";
  import Leaderboard from "$lib/components/stats/Leaderboard.svelte";

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
    weakWords: [] as Array<{
      word: string;
      vocab_id: number;
      accuracy: number;
    }>,
  };

  let achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    type:
      | "vocab_builder"
      | "streak_warrior"
      | "perfectionist"
      | "xp_enthusiast"
      | "one_off";
    level?: number;
    currentProgress?: number;
    targetProgress?: number;
    nextLevelReward?: number;
    description_next?: string;
    unlockedAt?: string;
  }> = [];

  let leaderboard: Array<{
    rank: number;
    email: string;
    totalXp: number;
    level: number;
  }> = [];

  let unsubscribe: (() => void) | undefined;

  onMount(async () => {
    const sessionUser = await auth.checkSession();
    if (!sessionUser) {
      push("/login");
      return;
    }

    // Load stats, achievements, and leaderboard
    await Promise.all([
      progress.loadStats(),
      progress.loadAchievements(),
      progress.loadLeaderboard(),
    ]);

    // Update local state from stores - store unsubscribe function for cleanup
    unsubscribe = progress.subscribe((state) => {
      if (state.stats) {
        const apiStats = state.stats;
        stats = {
          totalWords: apiStats.progress.totalWords,
          learnedWords: apiStats.progress.wordsLearned,
          inProgressWords: apiStats.progress.inProgressWords || 0,
          notStartedWords:
            apiStats.progress.totalWords -
            (apiStats.progress.wordsLearned +
              (apiStats.progress.inProgressWords || 0)),
          totalSessions: apiStats.activity.totalSessions,
          totalStudyTime: apiStats.activity.totalStudyTime,
          averageSessionTime: apiStats.activity.avgSessionTime,
          averageAccuracy: apiStats.progress.accuracy,
          lastStudyDate: apiStats.activity.lastStudy || undefined,
          weakWords: state.difficultWords,
        };
      }
      achievements = state.achievements;
      leaderboard = state.leaderboard;
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
        currentXP={$gamification?.totalXp || 0}
        streak={$gamification?.dailyStreak || 0}
        totalWords={stats.totalWords}
        learnedWords={stats.learnedWords}
        lastStudyDate={stats.lastStudyDate}
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

      <!-- Leaderboard -->
      <Leaderboard {leaderboard} />

      <!-- Achievements -->
      <AchievementGrid {achievements} />
    </div>
  </Container>

  <Footer />
</div>
