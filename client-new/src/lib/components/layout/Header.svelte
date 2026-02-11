<script lang="ts">
  import { Sparkles, Moon, Sun, BarChart3, BookOpen, Layers, Shield } from 'lucide-svelte';
  import { theme } from '$lib/stores/theme';
  import { isAdmin } from '$lib/stores/auth';
  import { link } from 'svelte-spa-router';

  export let user: { 
    username: string; 
    level?: number; 
    totalXp?: number; 
    dailyStreak?: number;
    role?: string;
  } | null = null;
  export let showNav = true;
  
  // Check if user is admin from either the store or the prop
  $: userIsAdmin = $isAdmin || user?.role === 'admin';
  
  // Debug: log isAdmin status
  $: console.log('Header - user:', user, 'isAdmin store:', $isAdmin, 'userIsAdmin:', userIsAdmin);
</script>

<header class="sticky top-0 z-50 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
  <!-- Skip to main content link for keyboard users -->
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded-lg focus:shadow-lg"
  >
    Skip to main content
  </a>
  
  <div class="container mx-auto px-4 py-4">
    <div class="flex items-center justify-between">
      <!-- Logo / Brand -->
      <a href="/" use:link class="flex items-center gap-3 hover:opacity-80 transition-opacity" aria-label="VocabQuest home">
        <Sparkles class="w-8 h-8 text-primary-500" aria-hidden="true" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">VocabQuest</h1>
      </a>

      <!-- Navigation & User Info -->
      <div class="flex items-center gap-4">
        {#if user && showNav}
          <nav class="hidden md:flex items-center gap-2" aria-label="Main navigation">
            <a href="/" use:link class="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1">
              <Layers class="w-4 h-4" />
              Flashcards
            </a>
            <a href="/stats" use:link class="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1">
              <BarChart3 class="w-4 h-4" />
              My Stats
            </a>
            <a href="/guide" use:link class="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1">
              <BookOpen class="w-4 h-4" />
              Guide
            </a>
            {#if userIsAdmin}
              <a href="/admin" use:link class="px-4 py-2 rounded-lg text-sm font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors flex items-center gap-1">
                <Shield class="w-4 h-4" />
                Admin
              </a>
            {/if}
          </nav>
        {/if}

        <!-- Theme Toggle -->
        <button
          on:click={() => theme.toggle()}
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          aria-label={$theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {#if $theme === 'light'}
            <Moon class="w-5 h-5 text-gray-700 dark:text-slate-300" aria-hidden="true" />
          {:else}
            <Sun class="w-5 h-5 text-gray-700 dark:text-slate-300" aria-hidden="true" />
          {/if}
        </button>

        {#if user}
          <!-- User Menu -->
          <div class="flex items-center gap-2" role="img" aria-label={`User: ${user.username}`}>
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm" aria-hidden="true">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</header>
