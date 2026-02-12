<script lang="ts">
  import { push } from "svelte-spa-router";
  import { auth } from "$lib/stores/auth";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { Sparkles } from "lucide-svelte";

  let email = "";
  let password = "";
  let confirmPassword = "";
  let error = "";
  let isLoading = false;

  async function handleRegister(event: Event) {
    event.preventDefault();
    error = "";

    // Validation
    if (password !== confirmPassword) {
      error = "Passwords do not match";
      return;
    }

    if (password.length < 6) {
      error = "Password must be at least 6 characters";
      return;
    }

    isLoading = true;

    try {
      const result = await auth.register(email, password);
      if (result.success) {
        push("/");
      } else {
        error = result.error || "Registration failed";
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
      class="w-[800px] h-auto -rotate-12"
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
            src="/assets/mascot/greeting_adventurous.png"
            alt="Adventurous explorer fox welcomes you"
            class="w-64 h-auto mix-blend-multiply dark:mix-blend-normal"
          />
          <div class="mt-6 text-center">
            <h2 class="text-2xl font-bold text-teal-700 dark:text-teal-300">
              Join the Expedition!
            </h2>
            <p class="text-sm text-teal-600/80 dark:text-teal-400/80 mt-1">
              Start your vocabulary adventure today.
            </p>
          </div>
        </div>

        <div class="md:w-1/2 p-8 space-y-6 bg-white dark:bg-slate-800">
          <!-- Header -->
          <div class="text-center md:text-left">
            <div
              class="flex flex-col items-center justify-center md:items-start gap-1 mb-2"
            >
              <h1
                class="text-3xl font-cinzel font-black tracking-wide bg-gradient-to-r from-amber-900 to-orange-500 bg-clip-text text-transparent"
              >
                VocabQuest
              </h1>
              <h2 class="text-xl font-bold text-gray-700 dark:text-gray-300">
                Create Account
              </h2>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Join the journey of vocabulary mastery
            </p>
          </div>

          <!-- Register Form -->
          <form on:submit={handleRegister} class="space-y-4">
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
                placeholder="Create a password"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                for="confirmPassword"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                bind:value={confirmPassword}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
            </div>

            {#if error}
              <div
                class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            {/if}

            <Button
              type="submit"
              variant="primary"
              class="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <!-- Login Link -->
          <div class="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?
            <a
              href="#/login"
              class="text-teal-600 dark:text-teal-400 hover:underline font-medium"
            >
              Log In
            </a>
          </div>
        </div>
      </div></Card
    >
  </div>

  <style>
    @keyframes float {
      0%,
      100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
  </style>

  <Footer />
</div>
