<script lang="ts">
  import { onMount } from 'svelte';
  import { adminApi } from '$lib/api/admin';

  let registrationOpen = true;
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      const { settings } = await adminApi.getSettings();
      registrationOpen = settings.registrationOpen !== 'false';
    } catch {
      error = 'Failed to load settings.';
    } finally {
      loading = false;
    }
  });

  async function handleToggle() {
    const prev = registrationOpen;
    registrationOpen = !registrationOpen;
    error = '';
    try {
      await adminApi.updateSetting('registrationOpen', String(registrationOpen));
    } catch {
      registrationOpen = prev;
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
      <div class="flex items-center justify-between px-6 py-5">
        <div>
          <p class="font-semibold text-gray-900 dark:text-gray-100">Allow new registrations</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            When off, only existing users can log in. Pre-registered users can still complete their setup.
          </p>
        </div>
        <button
          type="button"
          on:click={handleToggle}
          role="switch"
          aria-checked={registrationOpen}
          class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 {registrationOpen ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'}"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform {registrationOpen ? 'translate-x-6' : 'translate-x-1'}"
          />
        </button>
      </div>
    </div>

    {#if error}
      <p class="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
    {/if}
  </div>
{/if}
