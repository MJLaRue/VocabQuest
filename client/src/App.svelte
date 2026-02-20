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

  const routes = {
    "/": FlashcardsPage,
    "/practice": FlashcardsPage,
    "/quiz": FlashcardsPage,
    "/typing": FlashcardsPage,
    "/stats": StatsPage,
    "/guide": UserGuidePage,
    "/admin": AdminPage,
    "/admin/users": AdminPage,
    "/admin/vocabulary": AdminPage,
    "/admin/analytics": AdminPage,
    "/login": LoginPage,
    "/register": RegisterPage,
  };

  // Protected routes that require authentication
  const protectedRoutes = [
    "/",
    "/practice",
    "/quiz",
    "/typing",
    "/stats",
    "/guide",
  ];
  const adminRoutes = [
    "/admin",
    "/admin/users",
    "/admin/vocabulary",
    "/admin/analytics",
  ];
  const publicRoutes = ["/login", "/register"];

  // Reactive auth guard
  $: {
    if (!$auth.isLoading && $location) {
      const currentPath = $location;

      // Check if user is trying to access a protected route without auth
      if (
        protectedRoutes.includes(currentPath) ||
        adminRoutes.includes(currentPath)
      ) {
        if (!$auth.user) {
          replace("/login");
        } else if (
          adminRoutes.includes(currentPath) &&
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
