<script lang="ts">
  import { onMount } from 'svelte';
  import { adminApi } from '$lib/api/admin';

  let registrationOpen = true;
  let announcementText = '';
  let leaderboardVisible = true;
  let allowEduRegistration = true;
  let defaultCardsPerSession = 20;
  let maintenanceMode = false;

  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      const { settings } = await adminApi.getSettings();
      registrationOpen = settings.registrationOpen !== 'false';
      announcementText = settings.announcementText ?? '';
      leaderboardVisible = settings.leaderboardVisible !== 'false';
      allowEduRegistration = settings.allowEduRegistration !== 'false';
      defaultCardsPerSession = parseInt(settings.defaultCardsPerSession, 10) || 20;
      maintenanceMode = settings.maintenanceMode === 'true';
    } catch {
      error = 'Failed to load settings.';
    } finally {
      loading = false;
    }
  });

  async function toggle(key: string, current: boolean, setter: (v: boolean) => void) {
    const next = !current;
    setter(next);
    error = '';
    try {
      await adminApi.updateSetting(key, String(next));
    } catch {
      setter(current); // revert
      error = 'Failed to save setting. Please try again.';
    }
  }

  async function handleRegistrationToggle() {
    await toggle('registrationOpen', registrationOpen, (v) => (registrationOpen = v));
  }

  async function handleLeaderboardToggle() {
    await toggle('leaderboardVisible', leaderboardVisible, (v) => (leaderboardVisible = v));
  }

  async function handleEduToggle() {
    if (!registrationOpen) return;
    await toggle('allowEduRegistration', allowEduRegistration, (v) => (allowEduRegistration = v));
  }

  async function handleMaintenanceToggle() {
    await toggle('maintenanceMode', maintenanceMode, (v) => (maintenanceMode = v));
  }

  async function handleAnnouncementBlur() {
    error = '';
    try {
      await adminApi.updateSetting('announcementText', announcementText);
    } catch {
      error = 'Failed to save announcement. Please try again.';
    }
  }

  async function handleCardsChange() {
    const prev = defaultCardsPerSession;
    const clamped = Math.min(50, Math.max(5, defaultCardsPerSession || 20));
    defaultCardsPerSession = clamped;
    error = '';
    try {
      await adminApi.updateSetting('defaultCardsPerSession', String(clamped));
    } catch {
      defaultCardsPerSession = prev;
      error = 'Failed to save setting. Please try again.';
    }
  }
</script>

{#if loading}
  <div class="flex items-center justify-center py-12">
    <p class="text-gray-500 dark:text-gray-400">Loading settings...</p>
  </div>
{:else}
  <div class="max-w-2xl">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Settings</h2>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">

      <!-- Registration open toggle -->
      <div class="flex items-center justify-between px-6 py-5">
        <div>
          <p class="font-semibold text-gray-900 dark:text-gray-100">Allow new registrations</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            When off, only existing users can log in. Pre-registered users can still complete setup.
          </p>
        </div>
        <button
          type="button"
          on:click={handleRegistrationToggle}
          role="switch"
          aria-checked={registrationOpen}
          class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 {registrationOpen ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'}"
        >
          <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform {registrationOpen ? 'translate-x-6' : 'translate-x-1'}" />
        </button>
      </div>

      <!-- Allow .edu self-registration -->
      <div class="flex items-center justify-between px-6 py-5">
        <div>
          <p class="font-semibold text-gray-900 dark:text-gray-100">Allow .edu self-registration</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {#if !registrationOpen}
              N/A — registration is closed.
            {:else}
              When off, .edu emails must be pre-registered by an admin.
            {/if}
          </p>
        </div>
        <button
          type="button"
          on:click={handleEduToggle}
          role="switch"
          aria-checked={allowEduRegistration}
          disabled={!registrationOpen}
          class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
            {!registrationOpen ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            {allowEduRegistration && registrationOpen ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'}"
        >
          <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform {allowEduRegistration && registrationOpen ? 'translate-x-6' : 'translate-x-1'}" />
        </button>
      </div>

      <!-- Announcement banner -->
      <div class="px-6 py-5">
        <p class="font-semibold text-gray-900 dark:text-gray-100 mb-1">Announcement banner</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Shown to all users above every page. Leave empty to hide.
        </p>
        <textarea
          bind:value={announcementText}
          on:blur={handleAnnouncementBlur}
          rows="2"
          placeholder="e.g. Scheduled maintenance Sunday 2–4 PM EST."
          class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      <!-- Leaderboard visibility -->
      <div class="flex items-center justify-between px-6 py-5">
        <div>
          <p class="font-semibold text-gray-900 dark:text-gray-100">Show leaderboard</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            When off, the leaderboard is hidden on the Stats page for all users.
          </p>
        </div>
        <button
          type="button"
          on:click={handleLeaderboardToggle}
          role="switch"
          aria-checked={leaderboardVisible}
          class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 {leaderboardVisible ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'}"
        >
          <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform {leaderboardVisible ? 'translate-x-6' : 'translate-x-1'}" />
        </button>
      </div>

      <!-- Default cards per session -->
      <div class="flex items-center justify-between px-6 py-5">
        <div>
          <p class="font-semibold text-gray-900 dark:text-gray-100">Default cards per session</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            How many flashcards load at the start of each session (5–50).
          </p>
        </div>
        <input
          type="number"
          bind:value={defaultCardsPerSession}
          on:change={handleCardsChange}
          min="5"
          max="50"
          step="5"
          class="w-20 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <!-- Maintenance mode -->
      <div class="flex items-center justify-between px-6 py-5">
        <div>
          <p class="font-semibold text-gray-900 dark:text-gray-100">Maintenance mode</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            When on, non-admin users see a maintenance page. Admins are unaffected.
          </p>
        </div>
        <button
          type="button"
          on:click={handleMaintenanceToggle}
          role="switch"
          aria-checked={maintenanceMode}
          class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 {maintenanceMode ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'}"
        >
          <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform {maintenanceMode ? 'translate-x-6' : 'translate-x-1'}" />
        </button>
      </div>

    </div>

    {#if error}
      <p class="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
    {/if}
  </div>
{/if}
