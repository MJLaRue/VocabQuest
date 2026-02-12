<script lang="ts">
    import { Trophy, Medal, User as UserIcon, Star } from "lucide-svelte";

    export let leaderboard: Array<{
        rank: number;
        email: string;
        totalXp: number;
        level: number;
    }> = [];

    // Helper to format email for privacy (e.g., user@example.com -> use***@example.com)
    function formatName(email: string) {
        const [local, domain] = email.split("@");
        if (local.length <= 3) return email;
        return `${local.substring(0, 3)}***@${domain}`;
    }

    function getRankColor(rank: number) {
        switch (rank) {
            case 1:
                return "text-yellow-400";
            case 2:
                return "text-gray-300";
            case 3:
                return "text-amber-600";
            default:
                return "text-gray-400";
        }
    }

    function getRankBadge(rank: number) {
        switch (rank) {
            case 1:
                return "from-yellow-400/20 to-yellow-600/20 border-yellow-400/30";
            case 2:
                return "from-gray-300/20 to-gray-500/20 border-gray-300/30";
            case 3:
                return "from-amber-600/20 to-amber-800/20 border-amber-600/30";
            default:
                return "from-teal-500/10 to-emerald-500/10 border-white/10";
        }
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

    <div class="p-2">
        {#if leaderboard.length === 0}
            <div class="py-12 text-center text-gray-500 dark:text-gray-400">
                <UserIcon class="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No rankings available yet.</p>
            </div>
        {:else}
            <div class="space-y-1">
                {#each leaderboard as entry}
                    <div
                        class="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 group"
                    >
                        <!-- Rank Indicator -->
                        <div
                            class="w-10 h-10 flex items-center justify-center shrink-0"
                        >
                            {#if entry.rank <= 3}
                                <div class="relative">
                                    <Medal
                                        class="w-8 h-8 {getRankColor(
                                            entry.rank,
                                        )}"
                                    />
                                    <span
                                        class="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white mt-1"
                                    >
                                        {entry.rank}
                                    </span>
                                </div>
                            {:else}
                                <span
                                    class="text-lg font-bold text-gray-400 group-hover:text-teal-500 transition-colors"
                                >
                                    {entry.rank}
                                </span>
                            {/if}
                        </div>

                        <!-- User Info -->
                        <div class="flex-grow flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-gradient-to-br {getRankBadge(
                                    entry.rank,
                                )} border flex items-center justify-center"
                            >
                                <UserIcon
                                    class="w-5 h-5 {entry.rank <= 3
                                        ? getRankColor(entry.rank)
                                        : 'text-teal-500'}"
                                />
                            </div>
                            <div class="flex flex-col">
                                <span
                                    class="font-bold text-gray-800 dark:text-gray-100"
                                >
                                    {formatName(entry.email)}
                                </span>
                                <span
                                    class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold"
                                >
                                    Student
                                </span>
                            </div>
                        </div>

                        <!-- Stats -->
                        <div class="flex items-center gap-6">
                            <div class="text-right">
                                <div
                                    class="flex items-center gap-1.5 justify-end"
                                >
                                    <Star
                                        class="w-4 h-4 text-yellow-500 fill-yellow-500"
                                    />
                                    <span
                                        class="font-bold text-gray-900 dark:text-white"
                                        >{entry.totalXp}</span
                                    >
                                </div>
                                <p
                                    class="text-[10px] text-gray-500 uppercase font-bold tracking-tighter"
                                >
                                    Total XP
                                </p>
                            </div>

                            <div class="w-12 text-center">
                                <div
                                    class="inline-flex items-center justify-center px-2 py-1 rounded bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-black ring-1 ring-inset ring-teal-500/20"
                                >
                                    Lvl {entry.level}
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    /* Optional: Highlight for current user if email matches (needs user store) */
</style>
