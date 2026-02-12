<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { Search, Shield, Trash2, Edit } from 'lucide-svelte';

  export let users: Array<{
    id: number;
    username: string;
    email: string;
    role: 'student' | 'admin';
    created_at: string;
    last_login?: string;
    level: number;
    total_xp: number;
  }> = [];

  const dispatch = createEventDispatcher<{
    toggleAdmin: { userId: number; role: 'student' | 'admin' };
    deleteUser: { userId: number };
    search: { query: string };
  }>();

  let searchQuery = '';

  function handleSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;
    dispatch('search', { query: searchQuery });
  }
</script>

<Card>
  <div class="p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
        User Management
      </h3>
      <div class="relative flex-1 max-w-xs">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        />
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          on:input={handleSearch}
          class="pl-10"
        />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              User
            </th>
            <th class="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              Email
            </th>
            <th class="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              Level / XP
            </th>
            <th class="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              Role
            </th>
            <th class="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              Joined
            </th>
            <th class="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {#each users as user}
            <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="py-3 px-3">
                <span class="font-medium text-gray-900 dark:text-gray-100">
                  {user.username}
                </span>
              </td>
              <td class="py-3 px-3">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </span>
              </td>
              <td class="py-3 px-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <Badge variant="primary">{user.level}</Badge>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {user.total_xp.toLocaleString()} XP
                  </span>
                </div>
              </td>
              <td class="py-3 px-3 text-center">
                {#if user.role === 'admin'}
                  <Badge variant="warning">
                    <Shield class="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                {:else}
                  <Badge variant="neutral">Student</Badge>
                {/if}
              </td>
              <td class="py-3 px-3 text-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </td>
              <td class="py-3 px-3">
                <div class="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    on:click={() =>
                      dispatch('toggleAdmin', {
                        userId: user.id,
                        role: user.role === 'admin' ? 'student' : 'admin',
                      })}
                  >
                    <Shield class="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    on:click={() => dispatch('deleteUser', { userId: user.id })}
                    class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if users.length === 0}
      <div class="py-8 text-center text-gray-500 dark:text-gray-400">
        <p class="text-sm">No users found.</p>
      </div>
    {/if}
  </div>
</Card>
