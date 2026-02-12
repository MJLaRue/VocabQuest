<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { LayoutDashboard, Users, BookOpen, BarChart3 } from 'lucide-svelte';
  import { cn } from '$lib/utils/cn';

  export let currentPath = '/admin';

  type AdminView = 'overview' | 'users' | 'vocabulary' | 'analytics';

  const navItems: Array<{ view: AdminView; label: string; icon: any; path: string }> = [
    { view: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { view: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { view: 'vocabulary', label: 'Vocabulary', icon: BookOpen, path: '/admin/vocabulary' },
    { view: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  ];

  function handleNavigate(path: string) {
    push(path);
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
        on:click={() => handleNavigate(item.path)}
        class={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
          currentPath === item.path
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
