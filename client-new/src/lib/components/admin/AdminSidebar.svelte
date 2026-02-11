<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { LayoutDashboard, Users, BookOpen, BarChart3 } from 'lucide-svelte';
  import { cn } from '$lib/utils/cn';

  export let currentPath = '/admin';

  type AdminView = 'overview' | 'users' | 'vocabulary' | 'analytics';

  const dispatch = createEventDispatcher<{
    navigate: { view: AdminView };
  }>();

  const navItems: Array<{ view: AdminView; label: string; icon: any }> = [
    { view: 'overview', label: 'Overview', icon: LayoutDashboard },
    { view: 'users', label: 'Users', icon: Users },
    { view: 'vocabulary', label: 'Vocabulary', icon: BookOpen },
    { view: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  function handleNavigate(view: AdminView) {
    dispatch('navigate', { view });
  }
</script>

<aside
  class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen"
>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-teal-600 dark:text-teal-400">
      Admin Panel
    </h2>
  </div>

  <nav class="px-3 space-y-1">
    {#each navItems as item}
      <button
        type="button"
        on:click={() => handleNavigate(item.view)}
        class={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
          currentPath === `/admin/${item.view}` || (item.view === 'overview' && currentPath === '/admin')
            ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
      >
        <svelte:component this={item.icon} class="w-5 h-5" />
        {item.label}
      </button>
    {/each}
  </nav>
</aside>
