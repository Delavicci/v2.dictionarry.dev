<script>
  import SidebarSection from './pageNavSection.svelte';
  import SidebarItem from './pageNavItem.svelte';
  import { getCurrentDatabaseIdFromPath, getDatabasePath, getDatabases, getEntriesByType, getEntryPath, getGlobalEntriesByCategory, stripDatabasePrefix } from '@shared/utils/contentDatabase';
  import { router } from 'tinro';
  
  // Get current path for active state
  $: currentPath = $router.path;
  $: databaseId = getCurrentDatabaseIdFromPath(currentPath);
  $: databases = getDatabases();
  $: cleanPath = stripDatabasePrefix(currentPath);
  $: isDatabaseRoute = /^\/(quality-profile|custom-format|regex-pattern|delay-profile|media-management)(\/|$)/.test(cleanPath);
  
  // Filter entries by category/type at build time
  const devLogEntries = getGlobalEntriesByCategory('devlogs')
    .sort((a, b) => {
      // Sort by date descending (newest first)
      const dateA = new Date(a.frontmatter?.created || 0);
      const dateB = new Date(b.frontmatter?.created || 0);
      return dateB - dateA;
    });
  
  const wikiEntries = getGlobalEntriesByCategory('wiki')
    .sort((a, b) => a.slug.localeCompare(b.slug));
  
  $: qualityProfileEntries = getEntriesByType('quality-profile', databaseId)
    .sort((a, b) => a.title.localeCompare(b.title));
  
  $: customFormatEntries = getEntriesByType('custom-format', databaseId)
    .sort((a, b) => a.title.localeCompare(b.title));
  
  $: regexPatternEntries = getEntriesByType('regex-pattern', databaseId)
    .sort((a, b) => a.title.localeCompare(b.title));

  $: delayProfileEntries = getEntriesByType('delay-profile', databaseId)
    .sort((a, b) => a.title.localeCompare(b.title));
  
  $: mediaManagementEntries = getEntriesByType('media-management', databaseId)
    .sort((a, b) => {
      // Custom sort order for media management
      const order = ['naming', 'quality-definitions', 'media-settings', 'qualitydefinitions', 'misc'];
      const aOrder = order.indexOf(a.data?.subtype || a.slug);
      const bOrder = order.indexOf(b.data?.subtype || b.slug);
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.title.localeCompare(b.title);
    });
</script>

<aside class="sticky top-16 w-full xl:w-80 h-[calc(100vh-4rem)] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto">
  <div class="p-4 pb-10">
    <!-- Getting Started Section -->
    <SidebarSection title="🚀 Getting Started" href="/" isActive={currentPath === "/"}>
      <SidebarItem href="/profilarr-setup/installation" label="Installation" isActive={currentPath === "/profilarr-setup/installation"} />
    </SidebarSection>

    {#if databases.length > 1 && isDatabaseRoute}
      <div class="px-3 py-3 mb-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
        <label for="database-select" class="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Database</label>
        <select
          id="database-select"
          value={databaseId}
          on:change={(event) => router.goto(getDatabasePath(cleanPath, event.currentTarget.value))}
          class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1.5 text-sm text-neutral-800 dark:text-neutral-100"
        >
          {#each databases as database}
            <option value={database.id}>{database.name}</option>
          {/each}
        </select>
      </div>
    {/if}
  
    <!-- Quality Profiles Section -->
    <SidebarSection title="⚡ Quality Profiles" href={getDatabasePath('/quality-profile', databaseId)} isActive={currentPath === getDatabasePath('/quality-profile', databaseId)} isOpen={false}>
      {#each qualityProfileEntries as entry}
        <SidebarItem 
          href={getEntryPath(entry, databaseId)} 
          label={entry.title}
          isActive={currentPath === getEntryPath(entry, databaseId)}
        />
      {/each}
    </SidebarSection>

    <!-- Development Log Section -->
    <SidebarSection title="📝 Development Log" href="/devlogs" isActive={currentPath === "/devlogs"} isOpen={false}>
      {#each devLogEntries as entry}
        <SidebarItem 
          href={getEntryPath(entry, databaseId)} 
          label={`${entry.title} (${new Date(entry.frontmatter?.created).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })})`}
          isActive={currentPath === entry.path}
        />
      {/each}
    </SidebarSection>
    
    <!-- Wiki Section -->
    <SidebarSection title="📚 Wiki" href="/wiki" isActive={currentPath === "/wiki"} isOpen={false}>
      {#each wikiEntries as entry}
        <SidebarItem 
          href={getEntryPath(entry, databaseId)} 
          label={entry.title}
          isActive={currentPath === getEntryPath(entry, databaseId)}
        />
      {/each}
    </SidebarSection>
    
    <!-- Custom Formats Section -->
    <SidebarSection title="🎨 Custom Formats" href={getDatabasePath('/custom-format', databaseId)} isActive={currentPath === getDatabasePath('/custom-format', databaseId)} isOpen={false}>
      {#each customFormatEntries as entry}
        <SidebarItem 
          href={getEntryPath(entry, databaseId)} 
          label={entry.title}
          isActive={currentPath === getEntryPath(entry, databaseId)}
        />
      {/each}
    </SidebarSection>
    
    <!-- Regex Patterns Section -->
    <SidebarSection title="🔍 Regex Patterns" href={getDatabasePath('/regex-pattern', databaseId)} isActive={currentPath === getDatabasePath('/regex-pattern', databaseId)} isOpen={false}>
      {#each regexPatternEntries as entry}
        <SidebarItem 
          href={getEntryPath(entry, databaseId)} 
          label={entry.title}
          isActive={currentPath === getEntryPath(entry, databaseId)}
        />
      {/each}
    </SidebarSection>

    <!-- Delay Profiles Section -->
    <SidebarSection title="⏱️ Delay Profiles" href={getDatabasePath('/delay-profile', databaseId)} isActive={currentPath === getDatabasePath('/delay-profile', databaseId)} isOpen={false}>
      {#each delayProfileEntries as entry}
        <SidebarItem 
          href={getEntryPath(entry, databaseId)} 
          label={entry.title}
          isActive={currentPath === getEntryPath(entry, databaseId)}
        />
      {/each}
    </SidebarSection>
    
    <!-- Media Management Section -->
    <SidebarSection title="📁 Media Management" href={getDatabasePath('/media-management', databaseId)} isActive={currentPath === getDatabasePath('/media-management', databaseId)} isOpen={false}>
      {#each mediaManagementEntries as entry}
        <SidebarItem 
          href={getEntryPath(entry, databaseId)} 
          label={entry.title}
          isActive={currentPath === getEntryPath(entry, databaseId)}
        />
      {/each}
    </SidebarSection>
  </div>
</aside>
