<script lang="ts">
  import {
    Sparkles,
    Moon,
    Sun,
    BarChart3,
    BookOpen,
    Layers,
    Shield,
    Menu,
    X,
    LogOut,
  } from "lucide-svelte";
  import { fade, fly } from "svelte/transition";
  import { push } from "svelte-spa-router";
  import { theme } from "$lib/stores/theme";
  import { auth, isAdmin } from "$lib/stores/auth";
  import {
    sessionStats,
    progress,
    hasActiveSession,
  } from "$lib/stores/progress";
  import { link } from "svelte-spa-router";

  export let user: {
    username: string;
    level?: number;
    totalXp?: number;
    dailyStreak?: number;
    role?: string;
  } | null = null;
  export let showNav = true;

  // Mobile menu state
  let mobileMenuOpen = false;

  // Check if user is admin from either the store or the prop
  $: userIsAdmin = $isAdmin || user?.role === "admin";

  // Dynamic mascot selection
  $: mascotSrc = (() => {
    if (!user) return "/assets/mascot/header_default.png";

    // Disappointed if accuracy drops below 80% during a session
    if ($sessionStats.cardsReviewed >= 5 && $sessionStats.accuracy < 80) {
      return "/assets/mascot/header_disappointed.png";
    }

    // Happy/Sunglasses for streaks, level ups, achievements, or completed sets
    if (
      (user.dailyStreak && user.dailyStreak >= 7) ||
      $progress.currentSession.didLevelUp ||
      $progress.currentSession.completedSets > 0
    ) {
      return "/assets/mascot/header_happy.png";
    }

    return "/assets/mascot/header_default.png";
  })();

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  async function handleLogout() {
    if ($hasActiveSession) {
      try {
        await progress.endSession();
      } catch (error) {
        console.error("Failed to end session during logout:", error);
      }
    }
    await auth.logout();
    push("/login");
  }

  // No design preview state needed anymore
</script>

<svelte:head>
  <link
    href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<header
  class="sticky top-0 z-50 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
>
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
      <a
        href="/"
        use:link
        class="flex items-center gap-3 hover:opacity-80 transition-opacity"
        aria-label="VocabQuest home"
      >
        <div class="flex items-center gap-3">
          <div
            class="relative w-12 h-12 flex-shrink-0 flex items-center justify-center"
          >
            <img
              src={mascotSrc}
              alt=""
              class="absolute -top-2 w-16 h-16 max-w-none object-contain"
            />
          </div>
          <div class="flex flex-col leading-none">
            <h1
              class="text-2xl md:text-3xl font-cinzel font-black tracking-wide bg-gradient-to-r from-amber-900 to-orange-500 bg-clip-text text-transparent"
            >
              VocabQuest
            </h1>
          </div>
        </div>
      </a>

      <!-- Navigation & User Info -->
      <div class="flex items-center gap-4">
        {#if user && showNav}
          <!-- Desktop Navigation -->
          <nav
            class="hidden lg:flex items-center gap-2"
            aria-label="Main navigation"
          >
            <a
              href="/"
              use:link
              class="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <Layers class="w-4 h-4" />
              Flashcards
            </a>
            <a
              href="/stats"
              use:link
              class="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <BarChart3 class="w-4 h-4" />
              My Stats
            </a>
            <a
              href="/guide"
              use:link
              class="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <BookOpen class="w-4 h-4" />
              Guide
            </a>
            {#if userIsAdmin}
              <a
                href="/admin"
                use:link
                class="px-4 py-2 rounded-lg text-sm font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors flex items-center gap-1"
              >
                <Shield class="w-4 h-4" />
                Admin
              </a>
            {/if}
          </nav>

          <!-- Mobile Menu Button -->
          <button
            on:click={toggleMobileMenu}
            class="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu
              class="w-6 h-6 text-gray-700 dark:text-slate-300"
              aria-hidden="true"
            />
          </button>
        {/if}

        <!-- Theme Toggle -->
        <button
          on:click={() => theme.toggle()}
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          aria-label={$theme === "light"
            ? "Switch to dark mode"
            : "Switch to light mode"}
        >
          {#if $theme === "light"}
            <Moon
              class="w-5 h-5 text-gray-700 dark:text-slate-300"
              aria-hidden="true"
            />
          {:else}
            <Sun
              class="w-5 h-5 text-gray-700 dark:text-slate-300"
              aria-hidden="true"
            />
          {/if}
        </button>

        {#if user}
          <!-- User Menu -->
          <div class="flex items-center gap-4">
            <div
              class="flex items-center gap-2"
              role="img"
              aria-label={`User: ${user.username}`}
            >
              <div
                class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm"
                aria-hidden="true"
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div
                class="hidden lg:block text-xs font-medium text-gray-600 dark:text-slate-400"
              >
                {user.username}
              </div>
            </div>

            <button
              on:click={handleLogout}
              class="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
              aria-label="Log out"
            >
              <LogOut class="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</header>

<!-- Mobile Menu Overlay -->
{#if mobileMenuOpen && user && showNav}
  <!-- Backdrop -->
  <div
    transition:fade={{ duration: 200 }}
    class="fixed inset-0 bg-black/50 z-40 lg:hidden"
    on:click={closeMobileMenu}
    on:keydown={(e) => e.key === "Escape" && closeMobileMenu()}
    role="button"
    tabindex="-1"
    aria-label="Close menu"
  ></div>

  <!-- Mobile Menu Panel -->
  <div
    transition:fly={{ x: 300, duration: 300 }}
    class="fixed top-0 right-0 bottom-0 w-64 bg-white dark:bg-slate-800 shadow-xl z-50 lg:hidden"
    role="dialog"
    aria-label="Mobile navigation menu"
  >
    <div class="flex flex-col h-full">
      <!-- Menu Header -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700"
      >
        <span class="text-lg font-semibold text-gray-900 dark:text-white"
          >Menu</span
        >
        <button
          on:click={closeMobileMenu}
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Close menu"
        >
          <X
            class="w-5 h-5 text-gray-700 dark:text-slate-300"
            aria-hidden="true"
          />
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 overflow-y-auto p-4" aria-label="Mobile navigation">
        <div class="space-y-2">
          <a
            href="/"
            use:link
            on:click={closeMobileMenu}
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Layers class="w-5 h-5" aria-hidden="true" />
            <span class="font-medium">Flashcards</span>
          </a>

          <a
            href="/stats"
            use:link
            on:click={closeMobileMenu}
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <BarChart3 class="w-5 h-5" aria-hidden="true" />
            <span class="font-medium">My Stats</span>
          </a>

          <a
            href="/guide"
            use:link
            on:click={closeMobileMenu}
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <BookOpen class="w-5 h-5" aria-hidden="true" />
            <span class="font-medium">Guide</span>
          </a>

          {#if userIsAdmin}
            <a
              href="/admin"
              use:link
              on:click={closeMobileMenu}
              class="flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
            >
              <Shield class="w-5 h-5" aria-hidden="true" />
              <span class="font-medium">Admin</span>
            </a>
          {/if}
        </div>
      </nav>

      <!-- User Info -->
      <div class="p-4 border-t border-gray-200 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold"
          >
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {user.username}
            </div>
            {#if user.level}
              <div class="text-xs text-gray-500 dark:text-gray-400">
                Level {user.level}
              </div>
            {/if}
          </div>
        </div>
        <button
          on:click={handleLogout}
          class="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-red-100 dark:border-red-900/30 font-medium"
        >
          <LogOut class="w-5 h-5" />
          Log out
        </button>
      </div>
    </div>
  </div>
{/if}
