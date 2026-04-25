<script lang="ts">
  import { onMount } from "svelte";
  import Router, { location } from "svelte-spa-router";
  import { replace } from "svelte-spa-router";
  import { theme } from "$lib/stores/theme";
  import { auth } from "$lib/stores/auth";

  // Routes
  import LoginPage from "./routes/LoginPage.svelte";
  import RegisterPage from "./routes/RegisterPage.svelte";
  import FlashcardsPage from "./routes/FlashcardsPage.svelte";
  import StatsPage from "./routes/StatsPage.svelte";
  import UserGuidePage from "./routes/UserGuidePage.svelte";
  import AdminPage from "./routes/AdminPage.svelte";
  import TestConfigPage from "./routes/TestConfigPage.svelte";
  import TestPage from "./routes/TestPage.svelte";
  import TestResultsPage from "./routes/TestResultsPage.svelte";

  const routes = {
    "/": FlashcardsPage,
    "/practice": FlashcardsPage,
    "/quiz": FlashcardsPage,
    "/typing": FlashcardsPage,
    "/context": FlashcardsPage,
    "/relate": FlashcardsPage,
    "/stats": StatsPage,
    "/guide": UserGuidePage,
    "/admin": AdminPage,
    "/admin/users": AdminPage,
    "/admin/vocabulary": AdminPage,
    "/admin/analytics": AdminPage,
    "/admin/tests": AdminPage,
    "/admin/settings": AdminPage,
    "/test": TestConfigPage,
    "/test/active": TestPage,
    "/test/results/:id": TestResultsPage,
    "/login": LoginPage,
    "/register": RegisterPage,
  };

  // Protected routes that require authentication
  const protectedRoutes = [
    "/",
    "/practice",
    "/quiz",
    "/typing",
    "/context",
    "/match",
    "/stats",
    "/guide",
    "/test",
    "/test/active",
    "/test/results/:id",
  ];
  const adminRoutes = [
    "/admin",
    "/admin/users",
    "/admin/vocabulary",
    "/admin/analytics",
    "/admin/tests",
    "/admin/settings",
  ];
  const publicRoutes = ["/login", "/register"];

  // Helper: check if a path matches any route pattern (exact or prefix for dynamic segments)
  function matchesRoutes(path: string, routeList: string[]): boolean {
    return routeList.some(r => {
      if (r === path) return true;
      // Handle dynamic segments: /test/results/:id matches /test/results/7
      const pattern = r.replace(/:[^/]+/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(path);
    });
  }

  // Reactive auth guard
  $: {
    if (!$auth.isLoading && $location) {
      const currentPath = $location;

      // Check if user is trying to access a protected route without auth
      if (
        matchesRoutes(currentPath, protectedRoutes) ||
        matchesRoutes(currentPath, adminRoutes)
      ) {
        if (!$auth.user) {
          replace("/login");
        } else if (
          matchesRoutes(currentPath, adminRoutes) &&
          $auth.user.role !== "admin"
        ) {
          replace("/login");
        }
      }

      // Redirect authenticated users away from login/register
      if (publicRoutes.includes(currentPath) && $auth.user) {
        replace("/");
      }
    }
  }

  onMount(() => {
    theme.init();
    auth.checkSession();
  });
</script>

<Router {routes} />
