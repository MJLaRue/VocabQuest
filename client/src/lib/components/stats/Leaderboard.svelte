<script lang="ts">
    import { Trophy, Flame, Target, BookOpen } from "lucide-svelte";
    import Badge from "$lib/components/ui/Badge.svelte";

    export let leaderboard: Array<{
        rank: number;
        username: string;
        totalXp: number;
        level: number;
        streak: number;
        wordsLearned: number;
        accuracy: number;
    }> = [];

    function getMedal(rank: number) {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return null;
    }
</script>

<div
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
>
    <div
        class="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex items-center justify-between"
    >
        <div class="flex items-center gap-3">
            <Trophy class="text-yellow-300 w-6 h-6" />
            <h2 class="text-xl font-bold text-white">Student Leaderboard</h2>
        </div>
        <span class="text-teal-100 text-sm font-medium">Top 10 Performers</span>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full">
            <thead>
                <tr
                    class="bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-700"
                >
                    <th
                        class="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16"
                        >Rank</th
                    >
                    <th
                        class="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                        >Student</th
                    >
                    <th
                        class="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                        >Level</th
                    >
                    <th
                        class="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                        >Words</th
                    >
                    <th
                        class="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                        >Accuracy</th
                    >
                    <th
                        class="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
                        >XP</th
                    >
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
                {#if leaderboard.length === 0}
                    <tr>
                        <td
                            colspan="6"
                            class="py-12 text-center text-gray-500 dark:text-gray-400"
                        >
                            <BookOpen
                                class="w-12 h-12 mx-auto mb-3 opacity-20"
                            />
                            <p>No rankings available yet.</p>
                        </td>
                    </tr>
                {:else}
                    {#each leaderboard as entry}
                        <tr
                            class="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors group"
                        >
                            <td class="py-4 px-4">
                                <div
                                    class="flex items-center justify-center w-8 h-8"
                                >
                                    {#if entry.rank <= 3}
                                        <span
                                            class="text-2xl"
                                            role="img"
                                            aria-label="Medal"
                                            >{getMedal(entry.rank)}</span
                                        >
                                    {:else}
                                        <span
                                            class="text-sm font-bold text-gray-400 group-hover:text-teal-500 transition-colors"
                                        >
                                            {entry.rank}
                                        </span>
                                    {/if}
                                </div>
                            </td>
                            <td class="py-4 px-4">
                                <div class="flex items-center gap-3">
                                    <div class="flex flex-col">
                                        <span
                                            class="font-bold text-gray-900 dark:text-gray-100"
                                        >
                                            {entry.username}
                                        </span>
                                        {#if entry.streak > 0}
                                            <div
                                                class="flex items-center gap-1 text-[10px] text-orange-500 font-bold uppercase tracking-wider"
                                            >
                                                <Flame
                                                    class="w-3 h-3 fill-orange-500"
                                                />
                                                {entry.streak} Day Streak
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 px-4 text-center">
                                <Badge variant="secondary" class="font-black"
                                    >Lvl {entry.level}</Badge
                                >
                            </td>
                            <td class="py-4 px-4 text-center">
                                <div class="flex flex-col items-center">
                                    <span
                                        class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                        >{entry.wordsLearned}</span
                                    >
                                    <span
                                        class="text-[9px] uppercase text-gray-500 font-medium"
                                        >Learned</span
                                    >
                                </div>
                            </td>
                            <td class="py-4 px-4 text-center">
                                <Badge
                                    variant={entry.accuracy >= 80
                                        ? "success"
                                        : "warning"}
                                    class="text-[10px] px-1.5 py-0.5"
                                >
                                    {entry.accuracy}%
                                </Badge>
                            </td>
                            <td class="py-4 px-4 text-right">
                                <div class="flex flex-col items-end">
                                    <span
                                        class="text-sm font-black text-teal-600 dark:text-teal-400"
                                    >
                                        {entry.totalXp.toLocaleString()}
                                    </span>
                                    <span
                                        class="text-[9px] uppercase text-gray-500 font-medium"
                                        >Total XP</span
                                    >
                                </div>
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
</div>
