<script lang="ts">
  import { onMount } from 'svelte';
  import Router from 'svelte-spa-router';
  import { theme } from '$lib/stores/theme';
  import { auth } from '$lib/stores/auth';

  // Routes
  import LoginPage from './routes/LoginPage.svelte';
  import RegisterPage from './routes/RegisterPage.svelte';
  import FlashcardsPage from './routes/FlashcardsPage.svelte';
  import StatsPage from './routes/StatsPage.svelte';
  import UserGuidePage from './routes/UserGuidePage.svelte';
  import AdminPage from './routes/AdminPage.svelte';

  const routes = {
    '/': FlashcardsPage,
    '/practice': FlashcardsPage,
    '/quiz': FlashcardsPage,
    '/typing': FlashcardsPage,
    '/stats': StatsPage,
    '/guide': UserGuidePage,
    '/admin': AdminPage,
    '/admin/users': AdminPage,
    '/admin/vocabulary': AdminPage,
    '/admin/analytics': AdminPage,
    '/login': LoginPage,
    '/register': RegisterPage,
    '*': FlashcardsPage, // Wildcard catch-all fallback
  };

  onMount(() => {
    theme.init();
    auth.checkSession();
  });
</script>

<Router {routes} />
