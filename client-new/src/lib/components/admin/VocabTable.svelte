<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { Search, Plus, Edit, Trash2 } from 'lucide-svelte';

  export let words: Array<{
    id: number;
    word: string;
    part_of_speech: string;
    definition: string;
    example_sentence?: string;
    deck_name?: string;
  }> = [];

  const dispatch = createEventDispatcher<{
    add: void;
    edit: { wordId: number };
    delete: { wordId: number };
    search: { query: string };
  }>();

  let searchQuery = '';

  function handleSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;
    dispatch('search', { query: searchQuery });
  }

  function getPOSColor(pos: string): 'primary' | 'success' | 'warning' | 'danger' {
    const lowerPos = pos.toLowerCase();
    if (lowerPos.includes('noun')) return 'primary';
    if (lowerPos.includes('verb')) return 'success';
    if (lowerPos.includes('adjective')) return 'warning';
    return 'default' as any;
  }
</script>

<Card>
  <div class="p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
        Vocabulary Management
      </h3>
      <div class="flex items-center gap-3">
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
        <Button variant="primary" on:click={() => dispatch('add')}>
          <Plus class="w-4 h-4 mr-2" />
          Add Word
        </Button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              Word
            </th>
            <th class="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              Part of Speech
            </th>
            <th class="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              Definition
            </th>
            <th class="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              Deck
            </th>
            <th class="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {#each words as word}
            <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="py-3 px-3">
                <span class="font-medium text-gray-900 dark:text-gray-100">
                  {word.word}
                </span>
              </td>
              <td class="py-3 px-3 text-center">
                <Badge variant={getPOSColor(word.part_of_speech)}>
                  {word.part_of_speech}
                </Badge>
              </td>
              <td class="py-3 px-3">
                <span class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {word.definition}
                </span>
              </td>
              <td class="py-3 px-3 text-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {word.deck_name || 'Default'}
                </span>
              </td>
              <td class="py-3 px-3">
                <div class="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    on:click={() => dispatch('edit', { wordId: word.id })}
                  >
                    <Edit class="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    on:click={() => dispatch('delete', { wordId: word.id })}
                    class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if words.length === 0}
      <div class="py-8 text-center text-gray-500 dark:text-gray-400">
        <p class="text-sm">No vocabulary words found.</p>
      </div>
    {/if}
  </div>
</Card>
