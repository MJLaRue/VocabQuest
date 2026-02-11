<script lang="ts">
  import StatCard from '$lib/components/common/StatCard.svelte';
  import { Users, BookOpen, Calendar, TrendingUp } from 'lucide-svelte';

  export let totalUsers = 0;
  export let totalWords = 0;
  export let totalSessions = 0;
  export let activeToday = 0;
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard
    icon={Users}
    label="Total Users"
    value={totalUsers.toString()}
    iconBgColor="bg-blue-100 dark:bg-blue-900"
    iconColor="text-blue-500"
  />

  <StatCard
    icon={BookOpen}
    label="Vocabulary Words"
    value={totalWords.toString()}
    iconBgColor="bg-green-100 dark:bg-green-900"
    iconColor="text-green-500"
  />

  <StatCard
    icon={Calendar}
    label="Study Sessions"
    value={totalSessions.toString()}
    iconBgColor="bg-amber-100 dark:bg-amber-900"
    iconColor="text-amber-500"
  />

  <StatCard
    icon={TrendingUp}
    label="Active Today"
    value={activeToday.toString()}
    iconBgColor="bg-teal-100 dark:bg-teal-900"
    iconColor="text-teal-500"
  />
</div>
