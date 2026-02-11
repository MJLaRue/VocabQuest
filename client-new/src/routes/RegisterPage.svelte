<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { auth } from '$lib/stores/auth';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import { Sparkles } from 'lucide-svelte';

  let email = '';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let isLoading = false;

  async function handleRegister(event: Event) {
    event.preventDefault();
    error = '';

    // Validation
    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }

    if (password.length < 6) {
      error = 'Password must be at least 6 characters';
      return;
    }

    isLoading = true;

    try {
      const result = await auth.register(email, password);
      if (result.success) {
        push('/');
      } else {
        error = result.error || 'Registration failed';
      }
    } catch (err) {
      error = 'An unexpected error occurred';
      console.error(err);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100 dark:from-gray-900 dark:via-teal-950 dark:to-gray-900">
  <div class="flex-1 flex items-center justify-center p-4">
  <Card class="w-full max-w-md">
    <div class="p-8 space-y-6">
      <!-- Logo/Header -->
      <div class="text-center">
        <div class="flex items-center justify-center gap-3 mb-4">
          <Sparkles class="w-10 h-10 text-teal-600 dark:text-teal-400" />
          <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Create Account
          </h1>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Start your vocabulary journey
        </p>
      </div>

      <!-- Register Form -->
      <form on:submit={handleRegister} class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
          <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        {/if}

        <Button
          type="submit"
          variant="primary"
          class="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
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
  </Card>
  </div>
  
  <Footer />
</div>
