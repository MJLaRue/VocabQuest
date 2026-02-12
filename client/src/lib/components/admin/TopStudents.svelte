<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { Trophy, TrendingUp } from 'lucide-svelte';

  export let students: Array<{
    id: number;
    username: string;
    level: number;
    total_xp: number;
    words_learned: number;
    accuracy: number;
  }> = [];
</script>

<Card>
  <div class="p-6 space-y-4">
    <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
      <Trophy class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      Top Students
    </h3>

    {#if students.length === 0}
      <div class="py-8 text-center text-gray-500 dark:text-gray-400">
        <p class="text-sm">No student data available yet.</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                Rank
              </th>
              <th class="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                Student
              </th>
              <th class="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                Level
              </th>
              <th class="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                XP
              </th>
              <th class="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                Words
              </th>
              <th class="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                Accuracy
              </th>
            </tr>
          </thead>
          <tbody>
            {#each students as student, index}
              <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="py-3 px-3">
                  <div class="flex items-center gap-2">
                    {#if index === 0}
                      <span class="text-2xl">🥇</span>
                    {:else if index === 1}
                      <span class="text-2xl">🥈</span>
                    {:else if index === 2}
                      <span class="text-2xl">🥉</span>
                    {:else}
                      <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </span>
                    {/if}
                  </div>
                </td>
                <td class="py-3 px-3">
                  <span class="font-medium text-gray-900 dark:text-gray-100">
                    {student.username}
                  </span>
                </td>
                <td class="py-3 px-3 text-center">
                  <Badge variant="primary">{student.level}</Badge>
                </td>
                <td class="py-3 px-3 text-center">
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    {student.total_xp.toLocaleString()}
                  </span>
                </td>
                <td class="py-3 px-3 text-center">
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    {student.words_learned}
                  </span>
                </td>
                <td class="py-3 px-3 text-center">
                  <Badge variant={student.accuracy >= 80 ? 'success' : 'warning'}>
                    {student.accuracy}%
                  </Badge>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</Card>
