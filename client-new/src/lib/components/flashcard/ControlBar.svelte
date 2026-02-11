<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Toggle from '$lib/components/ui/Toggle.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { Search, Shuffle } from 'lucide-svelte';

  export let mode: 'practice' | 'quiz' | 'typing' = 'practice';
  export let randomMode = false;
  export let searchQuery = '';
  export let selectedPos: string | null = null;

  const dispatch = createEventDispatcher<{
    modeChange: { mode: 'practice' | 'quiz' | 'typing' };
    toggleRandom: void;
    search: { query: string };
    posSelect: { pos: string | null };
  }>();

  const partsOfSpeech = [
    { value: '', label: 'All Parts of Speech' },
    { value: 'n.', label: 'Nouns Only' },
    { value: 'v.', label: 'Verbs Only' },
    { value: 'adj.', label: 'Adjectives Only' },
    { value: 'adv.', label: 'Adverbs Only' },
  ];

  function handleModeChange(newMode: 'practice' | 'quiz' | 'typing') {
    mode = newMode;
    dispatch('modeChange', { mode: newMode });
  }

  function handleSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;
    dispatch('search', { query: searchQuery });
  }

  function handlePosChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const pos = target.value || null;
    selectedPos = pos;
    dispatch('posSelect', { pos });
  }
</script>

<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
  <div class="container mx-auto px-4 py-3">
    <div class="grid grid-cols-3 items-center gap-4">
      <!-- Mode Selector (Left) -->
      <div class="flex items-center gap-2 justify-start">
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {mode ===
          'practice'
            ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
          on:click={() => handleModeChange('practice')}
        >
          Practice
        </button>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {mode ===
          'quiz'
            ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
          on:click={() => handleModeChange('quiz')}
        >
          Quiz
        </button>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {mode ===
          'typing'
            ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
          on:click={() => handleModeChange('typing')}
        >
          Typing
        </button>
      </div>

      <!-- Search & POS Filter (Center) -->
      <div class="flex items-center justify-center gap-2">
        <div class="relative flex-1 max-w-xs">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Search words..."
            value={searchQuery}
            on:input={handleSearch}
            class="pl-10"
          />
        </div>

        <!-- POS Filter -->
        <select
          value={selectedPos || ''}
          on:change={handlePosChange}
          class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
        >
          {#each partsOfSpeech as pos}
            <option value={pos.value}>{pos.label}</option>
          {/each}
        </select>
      </div>

      <!-- Random Toggle (Right) -->
      <div class="flex items-center gap-4 justify-end">
        <div class="flex items-center gap-2">
          <Shuffle class="w-4 h-4 text-gray-500" />
          <Toggle
            checked={randomMode}
            onCheckedChange={() => dispatch('toggleRandom')}
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">Random</span>
        </div>
      </div>
    </div>
  </div>
</div>
