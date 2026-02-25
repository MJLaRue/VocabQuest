<script lang="ts">
  import { onMount } from "svelte";
  import { adminApi } from "$lib/api/admin";
  import { ClipboardList, Target, Star, TrendingUp } from "lucide-svelte";

  let isLoading = true;
  let error = "";
  let days = 30;

  let data: Awaited<ReturnType<typeof adminApi.getTestAnalytics>> | null = null;

  onMount(() => loadData());

  async function loadData() {
    isLoading = true;
    error = "";
    try {
      data = await adminApi.getTestAnalytics(days);
    } catch (err: any) {
      error = err?.message ?? "Failed to load test analytics";
    } finally {
      isLoading = false;
    }
  }

  function formatDate(str: string) {
    return new Date(str).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const modeColors: Record<string, string> = {
    quiz: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    typing: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    context: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    relate: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  };

  const modeBarColors: Record<string, string> = {
    quiz: "bg-purple-500",
    typing: "bg-blue-500",
    context: "bg-emerald-500",
    relate: "bg-orange-500",
  };
</script>

<div class="space-y-6">
  <!-- Header + days filter -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
        <ClipboardList class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Test Analytics</h2>
    </div>
    <div class="flex items-center gap-2">
      <label for="days-select" class="text-sm text-gray-600 dark:text-gray-400">Last</label>
      <select
        id="days-select"
        bind:value={days}
        on:change={loadData}
        class="text-sm border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300"
      >
        <option value={7}>7 days</option>
        <option value={30}>30 days</option>
        <option value={90}>90 days</option>
      </select>
    </div>
  </div>

  {#if isLoading}
    <div class="flex items-center justify-center py-16">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
    </div>

  {:else if error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
    </div>

  {:else if data}
    <!-- Summary cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3 mb-2">
          <ClipboardList class="w-5 h-5 text-indigo-500" />
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Tests Taken</span>
        </div>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">{data.totalAttempts}</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3 mb-2">
          <Target class="w-5 h-5 text-teal-500" />
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Accuracy</span>
        </div>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">{data.overallAccuracy}%</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3 mb-2">
          <Star class="w-5 h-5 text-amber-500" />
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total XP Awarded</span>
        </div>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">{data.totalXpAwarded.toLocaleString()}</p>
      </div>
    </div>

    <!-- Per-mode stats -->
    {#if Object.keys(data.modeStats).length > 0}
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp class="w-4 h-4 text-gray-500" />
          Accuracy by Mode
        </h3>
        <div class="space-y-4">
          {#each Object.entries(data.modeStats) as [mode, stats]}
            {@const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full {modeColors[mode] ?? 'bg-gray-100 text-gray-700'}">
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </span>
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  {stats.correct}/{stats.total} ({accuracy}%)
                </span>
              </div>
              <div class="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full {modeBarColors[mode] ?? 'bg-indigo-500'}"
                  style="width: {accuracy}%"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Recent attempts table -->
    {#if data.recentAttempts.length > 0}
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Recent Test Attempts</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modes</th>
                <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Q's</th>
                <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Accuracy</th>
                <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">XP</th>
                <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              {#each data.recentAttempts as attempt}
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td class="px-6 py-3 text-gray-900 dark:text-white font-medium">{attempt.username}</td>
                  <td class="px-6 py-3">
                    <div class="flex flex-wrap gap-1">
                      {#each (attempt.modes ?? []) as mode}
                        <span class="text-xs px-1.5 py-0.5 rounded {modeColors[mode] ?? 'bg-gray-100 text-gray-700'}">
                          {mode}
                        </span>
                      {/each}
                    </div>
                  </td>
                  <td class="px-6 py-3 text-right text-gray-700 dark:text-gray-300">{attempt.questionCount ?? "—"}</td>
                  <td class="px-6 py-3 text-right font-medium {(attempt.accuracy ?? 0) >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}">
                    {attempt.accuracy != null ? `${attempt.accuracy}%` : "—"}
                  </td>
                  <td class="px-6 py-3 text-right text-amber-600 dark:text-amber-400 font-medium">+{attempt.xpEarned}</td>
                  <td class="px-6 py-3 text-right text-gray-500 dark:text-gray-400">{formatDate(attempt.completedAt)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {:else}
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <ClipboardList class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">No test attempts in the last {days} days.</p>
      </div>
    {/if}
  {/if}
</div>
