<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Deck } from '$lib/api/vocab';
  import { ChevronDown, BookOpen } from 'lucide-svelte';

  export let decks: Deck[] = [];
  export let selectedDeck: string | null = null;

  const dispatch = createEventDispatcher<{
    select: { deck: string | null };
  }>();

  let isOpen = false;

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function selectDeck(deckName: string | null) {
    selectedDeck = deckName;
    isOpen = false;
    dispatch('select', { deck: deckName });
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.deck-selector')) {
      isOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="deck-selector relative">
  <button
    class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    on:click|stopPropagation={toggleDropdown}
  >
    <BookOpen class="w-4 h-4 text-teal-600 dark:text-teal-400" />
    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {selectedDeck || 'All Decks'}
    </span>
    {#if selectedDeck}
      <span class="text-xs text-gray-500 dark:text-gray-400">
        ({decks.find((d) => d.name === selectedDeck)?.count || 0} words)
      </span>
    {/if}
    <ChevronDown
      class="w-4 h-4 text-gray-500 transition-transform {isOpen
        ? 'rotate-180'
        : ''}"
    />
  </button>

  {#if isOpen}
    <div
      class="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
    >
      <button
        class="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 {selectedDeck ===
        null
          ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
          : 'text-gray-700 dark:text-gray-300'}"
        on:click={() => selectDeck(null)}
      >
        <div class="flex items-center justify-between">
          <span class="font-medium">All Decks</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {decks.reduce((sum, d) => sum + d.count, 0)} words
          </span>
        </div>
      </button>

      {#each decks as deck}
        <button
          class="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors {selectedDeck ===
          deck.name
            ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
            : 'text-gray-700 dark:text-gray-300'}"
          on:click={() => selectDeck(deck.name)}
        >
          <div class="flex items-center justify-between">
            <span class="font-medium">{deck.name}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {deck.count} words
            </span>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>
