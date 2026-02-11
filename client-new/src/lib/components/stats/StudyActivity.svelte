<script lang="ts">
  import StatCard from '$lib/components/common/StatCard.svelte';
  import { Calendar, Clock, Target, TrendingUp } from 'lucide-svelte';

  export let totalSessions = 0;
  export let totalStudyTime = 0; // in minutes
  export let averageSessionTime = 0; // in minutes
  export let averageAccuracy = 0; // percentage
  export let lastStudyDate: string | undefined = undefined;

  $: hours = Math.floor((totalStudyTime || 0) / 60);
  $: minutes = (totalStudyTime || 0) % 60;
  $: lastStudy = lastStudyDate
    ? new Date(lastStudyDate).toLocaleDateString()
    : 'Never';
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard
    icon={Calendar}
    label="Study Sessions"
    value={(totalSessions || 0).toString()}
    variant="primary"
  />

  <StatCard
    icon={Clock}
    label="Total Study Time"
    value="{hours}h {minutes}m"
    variant="success"
  />

  <StatCard
    icon={TrendingUp}
    label="Avg. Session"
    value="{averageSessionTime || 0} min"
    variant="warning"
  />

  <StatCard
    icon={Target}
    label="Avg. Accuracy"
    value="{averageAccuracy || 0}%"
    variant="primary"
  />
</div>

<div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
  <p class="text-sm text-gray-600 dark:text-gray-400">
    Last studied: <span class="font-medium text-gray-900 dark:text-gray-100">{lastStudy}</span>
  </p>
</div>
