<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { auth, user, isAdmin } from '$lib/stores/auth';
  import { adminApi, type AdminStats, type TopStudent, type UserManagement } from '$lib/api/admin';
  import Header from '$lib/components/layout/Header.svelte';
  import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';
  import OverviewCards from '$lib/components/admin/OverviewCards.svelte';
  import TopStudents from '$lib/components/admin/TopStudents.svelte';
  import UserTable from '$lib/components/admin/UserTable.svelte';
  import VocabTable from '$lib/components/admin/VocabTable.svelte';

  type AdminView = 'overview' | 'users' | 'vocabulary' | 'analytics';
  let currentView: AdminView = 'overview';
  let stats: AdminStats = {
    totalUsers: 0,
    totalWords: 0,
    totalSessions: 0,
    activeToday: 0,
  };
  let topStudents: TopStudent[] = [];
  let users: UserManagement[] = [];
  let vocabulary: any[] = [];
  let isLoading = true;

  onMount(async () => {
    const user = await auth.checkSession();
    if (!user) {
      push('/login');
      return;
    }

    if (!$isAdmin) {
      push('/');
      return;
    }

    await loadData();
  });

  async function loadData() {
    try {
      isLoading = true;
      const [statsData, studentsData, usersData, vocabData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getTopStudents(10),
        adminApi.getUsers(),
        adminApi.getVocabulary({ limit: 50 }),
      ]);

      stats = statsData;
      topStudents = studentsData.students;
      users = usersData.users;
      vocabulary = vocabData.words;
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      isLoading = false;
    }
  }

  async function handleToggleAdmin({ detail }: CustomEvent<{ userId: number; role: 'student' | 'admin' }>) {
    try {
      await adminApi.updateUserAdmin(detail.userId, detail.role);
      await loadData();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }

  async function handleDeleteUser({ detail }: CustomEvent<{ userId: number }>) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await adminApi.deleteUser(detail.userId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  }

  async function handleSearchUsers({ detail }: CustomEvent<{ query: string }>) {
    try {
      const { users: searchResults } = await adminApi.getUsers({
        search: detail.query,
      });
      users = searchResults;
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  }

  async function handleDeleteWord({ detail }: CustomEvent<{ wordId: number }>) {
    if (!confirm('Are you sure you want to delete this word?')) return;

    try {
      await adminApi.deleteWord(detail.wordId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete word:', error);
    }
  }

  async function handleSearchVocab({ detail }: CustomEvent<{ query: string }>) {
    try {
      const { words: searchResults } = await adminApi.getVocabulary({
        search: detail.query,
        limit: 50,
      });
      vocabulary = searchResults;
    } catch (error) {
      console.error('Failed to search vocabulary:', error);
    }
  }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header user={$user} />

  <div class="flex">
    <AdminSidebar currentPath="/admin/{currentView}" on:navigate={({ detail }) => currentView = detail.view} />

    <main class="flex-1 p-8">
      <div class="max-w-7xl mx-auto space-y-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Admin Dashboard
        </h1>

        {#if isLoading}
          <div class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p class="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        {:else}
          {#if currentView === 'overview'}
            <!-- Overview Cards -->
            <OverviewCards
              totalUsers={stats.totalUsers}
              totalWords={stats.totalWords}
              totalSessions={stats.totalSessions}
              activeToday={stats.activeToday}
            />

            <!-- Top Students -->
            <TopStudents students={topStudents} />
          {:else if currentView === 'users'}
            <!-- User Management -->
            <UserTable
              {users}
              on:toggleAdmin={handleToggleAdmin}
              on:deleteUser={handleDeleteUser}
              on:search={handleSearchUsers}
            />
          {:else if currentView === 'vocabulary'}
            <!-- Vocabulary Management -->
            <VocabTable
              words={vocabulary}
              on:delete={handleDeleteWord}
              on:search={handleSearchVocab}
              on:add={() => alert('Add word modal coming soon!')}
              on:edit={() => alert('Edit word modal coming soon!')}
            />
          {:else if currentView === 'analytics'}
            <!-- Analytics Section -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Analytics</h2>
              <p class="text-gray-600 dark:text-gray-400">Analytics dashboard coming soon!</p>
            </div>
          {/if}
        {/if}
      </div>
    </main>
  </div>
</div>
