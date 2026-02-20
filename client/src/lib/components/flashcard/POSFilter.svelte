<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Chip from '$lib/components/ui/Chip.svelte';

  export let selectedPos: string | null = null;

  const dispatch = createEventDispatcher<{
    select: { pos: string | null };
  }>();

  const partsOfSpeech = [
    { value: 'n.', label: 'Noun' },
    { value: 'v.', label: 'Verb' },
    { value: 'adj.', label: 'Adjective' },
    { value: 'adv.', label: 'Adverb' },
  ];

  function handleSelect(pos: string | null) {
    selectedPos = pos;
    dispatch('select', { pos });
  }

</script>

<div class="flex flex-wrap justify-center gap-3">
  <Chip
    active={selectedPos === null}
    on:click={() => handleSelect(null)}
  >
    All
  </Chip>
  {#each partsOfSpeech as pos}
    <Chip
      active={selectedPos === pos.value}
      on:click={() => handleSelect(pos.value)}
    >
      {pos.label}
    </Chip>
  {/each}
</div>
