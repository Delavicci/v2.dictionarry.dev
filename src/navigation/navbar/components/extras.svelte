<script>
  import ThemeToggle from '@ui/themeToggle.svelte';
  import Dropdown from '@ui/dropdown.svelte';
  import DropdownRow from '@ui/dropdownRow.svelte';
  import DatabasePicker from './databasePicker.svelte';
  import { siGithub, siDiscord, siBuymeacoffee } from 'simple-icons';
  import { MoreHorizontal, GitBranch } from 'lucide-svelte';
  import { clickOutside } from '@shared/utils/clickOutside.js';
  import { contentDatabase } from '@db';
  import { selectedDatabase } from '@shared/stores/database';
  
  let isDropdownOpen = false;
  
  // Format database metadata for display
  $: dbInfo = (() => {
    if (!contentDatabase.metadata || !$selectedDatabase) return null;
    
    const meta = contentDatabase.metadata;
    const date = new Date(meta.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    const source = $selectedDatabase.repo === 'local'
      ? 'Local'
      : $selectedDatabase.repo.split('/').pop() || $selectedDatabase.repo;
    
    // Build GitHub URL if it's from a repository
    let repoUrl = null;
    if ($selectedDatabase.repo !== 'local' && $selectedDatabase.repo.includes('github.com')) {
      repoUrl = `${$selectedDatabase.repo}/tree/${$selectedDatabase.branch}`;
    } else if ($selectedDatabase.repo !== 'local') {
      // Assume it's a GitHub repo shorthand like "user/repo"
      repoUrl = `https://github.com/${$selectedDatabase.repo}/tree/${$selectedDatabase.branch}`;
    }
    
    return {
      name: $selectedDatabase.name,
      source,
      branch: $selectedDatabase.branch,
      date: formattedDate,
      entries: contentDatabase.entries.filter((entry) => entry.databaseId === $selectedDatabase.id).length,
      url: repoUrl
    };
  })();
</script>


<!-- Desktop view -->
<div class="hidden xl:flex items-center space-x-2">
  <ThemeToggle />
  
  <a href="https://github.com/Dictionarry-Hub" class="social-icon" target="_blank" rel="noopener noreferrer">
    <span class="sr-only">GitHub</span>
    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d={siGithub.path} />
    </svg>
  </a>
  
  <a href="https://discord.gg/XGdTJP5G8a" class="social-icon" target="_blank" rel="noopener noreferrer">
    <span class="sr-only">Discord</span>
    <svg class="w-5.5 h-5.5" viewBox="0 0 24 24" fill="currentColor">
      <path d={siDiscord.path} />
    </svg>
  </a>
  
  <a href="https://buymeacoffee.com/santiagosayshey" class="social-icon" target="_blank" rel="noopener noreferrer">
    <span class="sr-only">Buy Me A Coffee</span>
    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d={siBuymeacoffee.path} />
    </svg>
  </a>
  
  {#if dbInfo}
    <div class="relative group">
      {#if dbInfo.url}
        <a href={dbInfo.url} class="social-icon" target="_blank" rel="noopener noreferrer" aria-label="View source repository">
          <GitBranch class="w-5 h-5" />
        </a>
      {:else}
        <button class="social-icon" aria-label="Database info (local)">
          <GitBranch class="w-5 h-5" />
        </button>
      {/if}
      <div class="absolute right-0 top-full mt-2 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
        <div class="text-xs space-y-1">
          <div class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Database Info</div>
          <div class="text-neutral-600 dark:text-neutral-400">
            <span class="font-medium">Name:</span> {dbInfo.name}
          </div>
          <div class="text-neutral-600 dark:text-neutral-400">
            <span class="font-medium">Source:</span> {dbInfo.source}
          </div>
          <div class="text-neutral-600 dark:text-neutral-400">
            <span class="font-medium">Branch:</span> {dbInfo.branch}
          </div>
          <div class="text-neutral-600 dark:text-neutral-400">
            <span class="font-medium">Generated:</span> {dbInfo.date}
          </div>
          <div class="text-neutral-600 dark:text-neutral-400">
            <span class="font-medium">Entries:</span> {dbInfo.entries}
          </div>
          {#if dbInfo.url}
            <div class="pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-700">
              <a href={dbInfo.url} target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">
                View on GitHub
              </a>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <DatabasePicker />
</div>

<!-- Mobile view -->
<div 
  class="xl:hidden relative"
  role="button"
  tabindex="0"
  on:mouseenter={() => isDropdownOpen = true}
  on:mouseleave={() => isDropdownOpen = false}
  use:clickOutside={() => isDropdownOpen = false}
>
  <button 
    class="social-icon"
    on:click={() => isDropdownOpen = !isDropdownOpen}
  >
    <span class="sr-only">Menu</span>
    <MoreHorizontal class="w-5 h-5 transition-all duration-200 {isDropdownOpen ? 'scale-110' : ''}" />
  </button>
  
  <Dropdown bind:isOpen={isDropdownOpen} position="right">
    {#if dbInfo}
      <!-- Database info row -->
      <DropdownRow>
        <div class="flex flex-col gap-1 flex-1">
          <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Database</span>
          <div class="text-xs text-neutral-500 dark:text-neutral-400 space-y-0.5">
            <div>{dbInfo.name}</div>
            <div>{dbInfo.source} • {dbInfo.branch}</div>
            <div>{dbInfo.date} • {dbInfo.entries} entries</div>
          </div>
        </div>
        <GitBranch class="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
      </DropdownRow>
    {/if}

    <DropdownRow>
      <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Source</span>
      <DatabasePicker />
    </DropdownRow>
    
    <!-- Appearance row -->
    <DropdownRow>
      <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Appearance</span>
      <ThemeToggle />
    </DropdownRow>
    
    <!-- Links row -->
    <DropdownRow showBorder={false}>
      <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Links</span>
      <div class="flex items-center space-x-2">
        <a href="https://github.com/Dictionarry-Hub" class="social-icon" target="_blank" rel="noopener noreferrer">
          <span class="sr-only">GitHub</span>
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d={siGithub.path} />
          </svg>
        </a>
        
        <a href="https://discord.gg/XGdTJP5G8a" class="social-icon" target="_blank" rel="noopener noreferrer">
          <span class="sr-only">Discord</span>
          <svg class="w-5.5 h-5.5" viewBox="0 0 24 24" fill="currentColor">
            <path d={siDiscord.path} />
          </svg>
        </a>
        
        <a href="https://buymeacoffee.com/santiagosayshey" class="social-icon" target="_blank" rel="noopener noreferrer">
          <span class="sr-only">Buy Me A Coffee</span>
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d={siBuymeacoffee.path} />
          </svg>
        </a>
      </div>
    </DropdownRow>
  </Dropdown>
</div>
