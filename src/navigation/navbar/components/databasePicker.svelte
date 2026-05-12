<script>
  import Dropdown from '@ui/dropdown.svelte';
  import DropdownRow from '@ui/dropdownRow.svelte';
  import { Database, Check } from 'lucide-svelte';
  import { router } from 'tinro';
  import { clickOutside } from '@shared/utils/clickOutside.js';
  import { getDatabasePath, getDatabase, getDatabases, stripDatabasePrefix } from '@shared/utils/contentDatabase';
  import { selectedDatabaseId } from '@shared/stores/database';

  let isOpen = false;

  $: currentPath = $router.path;
  $: databaseId = $selectedDatabaseId;
  $: databases = getDatabases();
  $: currentDatabase = getDatabase(databaseId);
  $: cleanPath = stripDatabasePrefix(currentPath);
  $: showPicker = databases.length > 1;

  function getSwitchPath(nextDatabaseId) {
    const match = cleanPath.match(/^\/(quality-profile|custom-format|regex-pattern|delay-profile|media-management)(?:\/|$)/);
    if (!match) return '/';
    return getDatabasePath(`/${match[1]}`, nextDatabaseId);
  }

  function switchDatabase(nextDatabaseId) {
    isOpen = false;
    selectedDatabaseId.select(nextDatabaseId);
    const nextPath = getSwitchPath(nextDatabaseId);
    if (nextPath !== '/') {
      router.goto(nextPath);
    }
  }
</script>

{#if showPicker}
  <div
    class="relative"
    role="button"
    tabindex="0"
    on:mouseenter={() => isOpen = true}
    on:mouseleave={() => isOpen = false}
    use:clickOutside={() => isOpen = false}
  >
    <button
      class="social-icon"
      on:click={() => isOpen = !isOpen}
      aria-label="Select database"
    >
      <Database class="w-5 h-5" />
    </button>

    <Dropdown bind:isOpen={isOpen} position="right" width="w-64">
      {#each databases as database, index}
        <DropdownRow
          showBorder={index < databases.length - 1}
          onclick={() => switchDatabase(database.id)}
        >
          <div class="flex items-center justify-between w-full gap-3">
            <div class="min-w-0">
              <div class="truncate text-sm font-medium text-neutral-700 dark:text-neutral-300">{database.name}</div>
              <div class="truncate text-xs text-neutral-500 dark:text-neutral-400">{database.branch}</div>
            </div>
            {#if database.id === databaseId}
              <div class="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check class="w-2.5 h-2.5 text-white" />
              </div>
            {/if}
          </div>
        </DropdownRow>
      {/each}
    </Dropdown>
  </div>
{/if}
