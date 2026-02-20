<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Card from "$lib/components/ui/Card.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import { X, Lock, Check, AlertCircle } from "lucide-svelte";
    import { authApi } from "$lib/api/auth";

    export let show = false;

    const dispatch = createEventDispatcher<{
        close: void;
    }>();

    let currentPassword = "";
    let newPassword = "";
    let isLoading = false;
    let error = "";
    let successMessage = "";

    function handleClose() {
        // Reset state on close
        currentPassword = "";
        newPassword = "";
        error = "";
        successMessage = "";
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

    async function handleSubmit() {
        if (!currentPassword || !newPassword) {
            error = "All fields are required";
            return;
        }

        if (newPassword.length < 8) {
            error = "New password must be at least 8 characters";
            return;
        }

        isLoading = true;
        error = "";
        successMessage = "";

        try {
            const response = await authApi.changePassword({
                currentPassword,
                newPassword,
            });

            successMessage = "Password updated successfully";
            currentPassword = "";
            newPassword = "";
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err: any) {
            error = err.message || "Failed to update password";
        } finally {
            isLoading = false;
        }
    }
</script>

{#if show}
    <div
        class="modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        role="presentation"
        on:click={handleClickOutside}
        on:keydown={handleKeydown}
    >
        <Card class="max-w-md w-full">
            <div class="p-6 space-y-6">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <h2
                        class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"
                    >
                        <Lock
                            class="w-5 h-5 text-teal-600 dark:text-teal-400"
                        />
                        Change Password
                    </h2>
                    <button
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        on:click={handleClose}
                        aria-label="Close"
                    >
                        <X class="w-6 h-6" />
                    </button>
                </div>

                {#if successMessage}
                    <div
                        class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300"
                    >
                        <Check class="w-4 h-4" />
                        <span class="text-sm font-medium">{successMessage}</span
                        >
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

                <form class="space-y-4" on:submit|preventDefault={handleSubmit}>
                    <div>
                        <label
                            for="current-password"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Current Password
                        </label>
                        <Input
                            id="current-password"
                            type="password"
                            bind:value={currentPassword}
                            placeholder="Enter current password"
                            required
                            disabled={isLoading || !!successMessage}
                        />
                    </div>

                    <div>
                        <label
                            for="new-password"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            New Password
                        </label>
                        <Input
                            id="new-password"
                            type="password"
                            bind:value={newPassword}
                            placeholder="Enter new password (min. 8 chars)"
                            required
                            disabled={isLoading || !!successMessage}
                        />
                    </div>

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
                            type="submit"
                            variant="primary"
                            class="flex-1"
                            disabled={isLoading || !!successMessage}
                        >
                            {isLoading ? "Updating..." : "Update Password"}
                        </Button>
                    </div>
                </form>
            </div>
        </Card>
    </div>
{/if}
