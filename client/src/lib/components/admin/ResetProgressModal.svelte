<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Card from "$lib/components/ui/Card.svelte";
    import { X, RotateCcw, Check, AlertCircle } from "lucide-svelte";
    import { adminApi } from "$lib/api/admin";

    export let show = false;
    export let userId: number | null = null;
    export let username: string = "";

    const dispatch = createEventDispatcher<{
        close: void;
        reset: void;
    }>();

    let isLoading = false;
    let error = "";
    let successMessage = "";

    function handleClose() {
        error = "";
        successMessage = "";
        userId = null;
        dispatch("close");
    }

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target.classList.contains("modal-backdrop")) {
            handleClose();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            handleClose();
        }
    }

    async function handleConfirm() {
        if (!userId) return;

        isLoading = true;
        error = "";
        successMessage = "";

        try {
            await adminApi.resetUserProgress(userId);
            successMessage = "Progress reset successfully";
            dispatch("reset");
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err: any) {
            error = err.message || "Failed to reset progress";
        } finally {
            isLoading = false;
        }
    }
</script>

{#if show && userId}
    <div
        class="modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        role="presentation"
        on:click={handleClickOutside}
        on:keydown={handleKeydown}
    >
        <Card class="max-w-md w-full">
            <div class="p-6 space-y-6">
                <div class="flex items-center justify-between">
                    <h2
                        class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"
                    >
                        <RotateCcw class="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        Reset Progress
                    </h2>
                    <button
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        on:click={handleClose}
                        aria-label="Close"
                    >
                        <X class="w-6 h-6" />
                    </button>
                </div>

                <p class="text-sm text-gray-600 dark:text-gray-400">
                    This will permanently delete all flashcard progress, study sessions, XP, levels, streaks, and achievements for <span class="font-medium text-gray-900 dark:text-white">{username}</span>. This cannot be undone.
                </p>

                {#if successMessage}
                    <div
                        class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300"
                    >
                        <Check class="w-4 h-4" />
                        <span class="text-sm font-medium">{successMessage}</span>
                    </div>
                {/if}

                {#if error}
                    <div
                        class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300"
                    >
                        <AlertCircle class="w-4 h-4" />
                        <span class="text-sm font-medium">{error}</span>
                    </div>
                {/if}

                <div class="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        class="flex-1"
                        on:click={handleClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="warning"
                        class="flex-1"
                        on:click={handleConfirm}
                        disabled={isLoading || !!successMessage}
                    >
                        {isLoading ? "Resetting..." : "Reset Progress"}
                    </Button>
                </div>
            </div>
        </Card>
    </div>
{/if}
