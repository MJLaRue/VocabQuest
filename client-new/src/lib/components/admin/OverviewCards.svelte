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
    variant="primary"
  />

  <StatCard
    icon={BookOpen}
    label="Vocabulary Words"
    value={totalWords.toString()}
    variant="success"
  />

  <StatCard
    icon={Calendar}
    label="Study Sessions"
    value={totalSessions.toString()}
    variant="warning"
  />

  <StatCard
    icon={TrendingUp}
    label="Active Today"
    value={activeToday.toString()}
    variant="primary"
  />
</div>
