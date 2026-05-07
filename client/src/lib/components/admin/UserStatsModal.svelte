<script lang="ts">
  import { adminApi, type UserStatsResponse } from '$lib/api/admin';
  import { apiClient } from '$lib/api/client';
  import StatsOverview from '$lib/components/stats/StatsOverview.svelte';
  import StudyActivity from '$lib/components/stats/StudyActivity.svelte';
  import TestTrendChart from '$lib/components/stats/TestTrendChart.svelte';
  import VocabularyProgress from '$lib/components/stats/VocabularyProgress.svelte';
  import AchievementGrid from '$lib/components/stats/AchievementGrid.svelte';
  import Leaderboard from '$lib/components/stats/Leaderboard.svelte';
  import { X } from 'lucide-svelte';

  export let show = false;
  export let user: { id: number; username: string; email: string; role: string; level: number } | null = null;

  type Tab = 'overview' | 'tests' | 'vocabulary';

  let stats: UserStatsResponse | null = null;
  let leaderboard: Array<{
    rank: number; username: string; totalXp: number;
    level: number; streak: number; wordsLearned: number; accuracy: number;
  }> = [];
  let loading = false;
  let errorMsg = '';
  let activeTab: Tab = 'overview';

  // Load data whenever the modal opens for a user
  $: if (show && user) loadStats(user.id);

  async function loadStats(userId: number) {
    loading = true;
    errorMsg = '';
    stats = null;
    leaderboard = [];
    try {
      const [statsData, lbData] = await Promise.all([
        adminApi.getUserStats(userId),
        apiClient<{ leaderboard: typeof leaderboard }>('/progress/leaderboard'),
      ]);
      stats = statsData;
      leaderboard = lbData.leaderboard ?? [];
    } catch {
      errorMsg = 'Failed to load stats. Please try again.';
    } finally {
      loading = false;
    }
  }

  function close() {
    show = false;
    activeTab = 'overview';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    on:click|self={close}
    role="dialog"
    aria-modal="true"
    aria-label="{user?.username ?? 'User'} stats"
  >
    <!-- Modal -->
    <div class="relative w-full max-w-5xl h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">

      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 bg-gray-900 dark:bg-gray-950 text-white shrink-0">
        <div>
          <p class="text-lg font-bold leading-none">{user?.username ?? '—'}</p>
          <p class="text-sm text-gray-400 mt-0.5">{user?.email} · Level {user?.level} · {user?.role}</p>
        </div>
        <button
          class="text-gray-400 hover:text-white transition-colors"
          on:click={close}
          aria-label="Close"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 dark:border-gray-700 px-6 shrink-0 bg-white dark:bg-gray-900">
        {#each (['overview', 'tests', 'vocabulary'] as const) as tab}
          <button
            class="px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize
              {activeTab === tab
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
            on:click={() => (activeTab = tab)}
          >
            {tab === 'overview' ? 'Overview' : tab === 'tests' ? 'Tests' : 'Vocabulary'}
          </button>
        {/each}
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-800">
        {#if loading}
          <div class="flex items-center justify-center h-full">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        {:else if errorMsg}
          <div class="flex items-center justify-center h-full">
            <p class="text-red-500 dark:text-red-400">{errorMsg}</p>
          </div>
        {:else if stats}
          {#if activeTab === 'overview'}
            <div class="space-y-6">
              <StatsOverview
                currentXP={stats.gamification.totalXp}
                streak={stats.gamification.dailyStreak}
                totalWords={stats.progress.totalWords}
                learnedWords={stats.progress.wordsLearned}
                lastStudyDate={stats.activity.lastStudy ?? undefined}
              />
              <StudyActivity
                totalSessions={stats.activity.totalSessions}
                totalStudyTime={stats.activity.totalStudyTime}
                averageSessionTime={stats.activity.avgSessionTime}
                averageAccuracy={stats.progress.accuracy}
                lastStudyDate={stats.activity.lastStudy ?? undefined}
              />
            </div>
          {:else if activeTab === 'tests'}
            <TestTrendChart attempts={stats.testHistory} />
          {:else}
            <div class="space-y-6">
              <VocabularyProgress
                totalWords={stats.progress.totalWords}
                learnedWords={stats.progress.wordsLearned}
                inProgressWords={stats.progress.inProgressWords}
                notStartedWords={stats.progress.totalWords - stats.progress.wordsLearned - stats.progress.inProgressWords}
              />
              <Leaderboard {leaderboard} />
              <AchievementGrid achievements={stats.achievements} />
            </div>
          {/if}
        {/if}
      </div>

    </div>
  </div>
{/if}
