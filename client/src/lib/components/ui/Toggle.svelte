<script lang="ts">
  import { cn } from "$lib/utils/cn";

  type $$Props = {
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    description?: string;
    class?: string;
    onCheckedChange?: (checked: boolean) => void;
  };

  export let checked: $$Props["checked"] = false;
  export let disabled: $$Props["disabled"] = false;
  export let label: $$Props["label"] = "";
  export let description: $$Props["description"] = "";
  export let onCheckedChange: $$Props["onCheckedChange"] = undefined;
  let className: $$Props["class"] = "";
  export { className as class };

  function handleClick() {
    if (disabled) return;
    const next = !checked;
    checked = next;
    onCheckedChange?.(next);
  }
</script>

<div class={cn("flex items-center gap-3", className)}>
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    {disabled}
    on:click={handleClick}
    class={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
      checked ? "bg-teal-500" : "bg-gray-300 dark:bg-slate-600",
      disabled && "opacity-50 cursor-not-allowed",
    )}
  >
    <span
      class={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md",
        checked ? "translate-x-6" : "translate-x-1",
      )}
    />
  </button>
  <input type="checkbox" {checked} class="hidden" aria-hidden="true" />

  {#if label || $$slots.default}
    <div class="flex flex-col gap-0.5">
      {#if label}
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </span>
      {/if}
      {#if description}
        <span class="text-xs text-gray-600 dark:text-slate-400">
          {description}
        </span>
      {/if}
      <slot />
    </div>
  {/if}
</div>
