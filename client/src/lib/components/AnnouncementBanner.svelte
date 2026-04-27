<script lang="ts">
  export let text: string = '';
</script>

{#if text}
  <div
    role="alert"
    aria-live="polite"
    class="bg-teal-600 text-white text-sm text-center py-2 px-4 font-medium"
  >
    {text}
  </div>
{/if}
