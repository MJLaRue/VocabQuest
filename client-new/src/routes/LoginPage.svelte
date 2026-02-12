<script lang="ts">
  import { push, querystring } from "svelte-spa-router";
  import { auth } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { Sparkles, Clock } from "lucide-svelte";

  let email = "";
  let password = "";
  let error = "";
  let infoMessage = "";
  let isLoading = false;

  onMount(() => {
    const params = new URLSearchParams($querystring);
    if (params.get("message") === "session_timeout") {
      infoMessage =
        "Your session has timed out due to inactivity. Please log in again.";
    }
  });

  async function handleLogin(event: Event) {
    event.preventDefault();
    error = "";
    infoMessage = "";
    isLoading = true;

    try {
      const result = await auth.login(email, password);
      if (result.success) {
        push("/");
      } else {
        error = result.error || "Login failed";
      }
    } catch (err) {
      error = "An unexpected error occurred";
      console.error(err);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <link
    href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div
  class="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100 dark:from-gray-900 dark:via-teal-950 dark:to-gray-900 relative overflow-hidden"
>
  <!-- Background Watermark -->
  <div
    class="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] flex items-center justify-center grayscale"
  >
    <img
      src="/assets/mascot/base.png"
      alt=""
      class="w-[800px] h-auto rotate-12"
    />
  </div>

  <div class="flex-1 flex items-center justify-center p-4 relative z-10">
    <Card class="w-full max-w-4xl overflow-hidden">
      <div class="flex flex-col md:flex-row shadow-2xl">
        <!-- Mascot Side (Desktop) / Header (Mobile) -->
        <div
          class="md:w-1/2 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-teal-100 dark:border-teal-900/30"
        >
          <img
            src="/assets/mascot/packing_adventurous.png"
            alt="Explorer fox packing for a new expedition"
            class="w-64 h-auto mix-blend-multiply dark:mix-blend-normal"
          />
          <div class="mt-6 text-center">
            <h2 class="text-2xl font-bold text-teal-700 dark:text-teal-300">
              New Expedition?
            </h2>
            <p class="text-sm text-teal-600/80 dark:text-teal-400/80 mt-1">
              Pack your brain and get started!
            </p>
          </div>
        </div>

        <div class="md:w-1/2 p-8 space-y-6 bg-white dark:bg-slate-800">
          <!-- Header -->
          <div class="text-center md:text-left">
            <div
              class="flex items-center justify-center md:justify-start gap-3 mb-2"
            >
              <h1
                class="text-3xl font-cinzel font-black tracking-wide bg-gradient-to-r from-amber-900 to-orange-500 bg-clip-text text-transparent"
              >
                VocabQuest
              </h1>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Log in to continue your adventure
            </p>
          </div>

          <!-- Login Form -->
          <form on:submit={handleLogin} class="space-y-4">
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                bind:value={email}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                aria-required="true"
                aria-label="Email address"
                autocomplete="email"
              />
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                bind:value={password}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                aria-required="true"
                aria-label="Password"
                autocomplete="current-password"
              />
            </div>

            {#if infoMessage}
              <div
                class="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg flex items-center gap-3"
                role="status"
              >
                <Clock
                  class="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0"
                />
                <p class="text-sm text-teal-700 dark:text-teal-400 font-medium">
                  {infoMessage}
                </p>
              </div>
            {/if}

            {#if error}
              <div
                class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                role="alert"
                aria-live="polite"
              >
                <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            {/if}

            <Button
              type="submit"
              variant="primary"
              class="w-full"
              disabled={isLoading}
              aria-label={isLoading
                ? "Logging in..."
                : "Log in to your account"}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <!-- Register Link -->
          <div class="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?
            <a
              href="#/register"
              class="text-teal-600 dark:text-teal-400 hover:underline font-medium"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </Card>
  </div>

  <Footer />
</div>
