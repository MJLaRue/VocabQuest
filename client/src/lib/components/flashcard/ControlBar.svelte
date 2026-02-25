<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Toggle from '$lib/components/ui/Toggle.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { Search, Zap } from 'lucide-svelte';
  import type { StudyMode } from '$lib/api/progress';

  export let mode: StudyMode = 'practice';
  export let advanced = false;
  export let searchQuery = '';
  export let selectedPos: string | null = null;

  const dispatch = createEventDispatcher<{
    modeChange: { mode: StudyMode };
    toggleAdvanced: void;
    search: { query: string };
    posSelect: { pos: string | null };
  }>();

  const partsOfSpeech = [
    { value: '', label: 'All Parts of Speech', short: 'All POS' },
    { value: 'n.', label: 'Nouns Only', short: 'Nouns' },
    { value: 'v.', label: 'Verbs Only', short: 'Verbs' },
    { value: 'adj.', label: 'Adjectives Only', short: 'Adj.' },
    { value: 'adv.', label: 'Adverbs Only', short: 'Adv.' },
  ];

  const modes: { value: StudyMode; label: string }[] = [
    { value: 'practice', label: 'Practice' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'typing', label: 'Typing' },
    { value: 'context', label: 'Context' },
    { value: 'relate', label: 'Relate' },
  ];

  function handleModeChange(newMode: StudyMode) {
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

  function handleModeDropdownChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    handleModeChange(target.value as StudyMode);
  }

  const modeActiveClass: Record<StudyMode, string> = {
    practice: 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300',
    quiz:     'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300',
    typing:   'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300',
    context:  'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
    relate:   'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
  };

  $: modeButtonClass = (m: StudyMode) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      mode === m
        ? modeActiveClass[m]
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;

  // Advanced only applies to context and relate
  $: advancedApplies = mode === 'context' || mode === 'relate';
</script>

<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
  <div class="container mx-auto px-4 py-3">
    <!-- Desktop Layout (3 columns) -->
    <div class="hidden md:grid md:grid-cols-3 items-center gap-4">
      <!-- Mode Selector (Left) -->
      <div class="flex items-center gap-1 justify-start flex-wrap">
        {#each modes as { value, label }}
          <button
            class={modeButtonClass(value)}
            on:click={() => handleModeChange(value)}
          >
            {label}
          </button>
        {/each}
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

      <!-- Advanced Toggle (Right) -->
      <div class="flex items-center gap-3 justify-end">
        <div
          class="flex items-center gap-2 transition-opacity {advancedApplies ? '' : 'opacity-40'}"
          title={advancedApplies
            ? 'Type the answer instead of selecting from options'
            : 'Advanced mode applies to Context and Relate modes'}
        >
          <Zap class="w-4 h-4 text-amber-500" />
          <Toggle
            checked={advanced}
            onCheckedChange={() => dispatch('toggleAdvanced')}
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">Advanced</span>
        </div>
      </div>
    </div>

    <!-- Mobile Layout (stacked) -->
    <div class="md:hidden space-y-3">
      <!-- Row 1: Mode Dropdown + Advanced Toggle -->
      <div class="flex items-center gap-2">
        <select
          value={mode}
          on:change={handleModeDropdownChange}
          class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
        >
          {#each modes as { value, label }}
            <option {value}>{label}</option>
          {/each}
        </select>

        <div
          class="flex items-center gap-1.5 transition-opacity {advancedApplies ? '' : 'opacity-40'}"
          title="Advanced (typing instead of multiple choice)"
        >
          <Zap class="w-4 h-4 text-amber-500" />
          <Toggle
            checked={advanced}
            onCheckedChange={() => dispatch('toggleAdvanced')}
          />
        </div>
      </div>

      <!-- Row 2: Search & POS Filter -->
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            on:input={handleSearch}
            class="pl-10 w-full"
          />
        </div>

        <select
          value={selectedPos || ''}
          on:change={handlePosChange}
          class="px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
        >
          {#each partsOfSpeech as pos}
            <option value={pos.value}>{pos.short}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
</div>
