<script>
  import Seo from '@shared/ui/seo.svelte';
  import { router } from 'tinro';
  import { getSeoData } from '@shared/constants/seoData';
  import { onMount, onDestroy } from 'svelte';
  import { setNavigationItems, clearNavigation } from '@shared/stores/navigation';
  import { getCurrentDatabaseIdFromPath, getEntriesByType, getEntryPath } from '@shared/utils/contentDatabase';
  import { FileText, BarChart3, Settings } from 'lucide-svelte';

  const seo = getSeoData('/media-management');

  $: databaseId = getCurrentDatabaseIdFromPath($router.path);
  $: mediaManagementEntries = getEntriesByType('media-management', databaseId)
    .sort((a, b) => a.title.localeCompare(b.title));

  $: groups = [
    {
      id: 'naming',
      title: 'Naming',
      icon: FileText,
      color: 'blue',
      entries: mediaManagementEntries.filter(entry => entry.data?.subtype === 'naming' || entry.slug === 'naming')
    },
    {
      id: 'quality-definitions',
      title: 'Quality Definitions',
      icon: BarChart3,
      color: 'orange',
      entries: mediaManagementEntries.filter(entry => entry.data?.subtype === 'quality-definitions' || entry.slug === 'qualitydefinitions')
    },
    {
      id: 'media-settings',
      title: 'Media Settings',
      icon: Settings,
      color: 'green',
      entries: mediaManagementEntries.filter(entry => entry.data?.subtype === 'media-settings' || entry.slug === 'misc')
    }
  ];

  onMount(() => {
    setNavigationItems([
      {
        title: 'Overview',
        children: groups.map(group => group.title)
      }
    ]);
  });

  onDestroy(() => {
    clearNavigation();
  });

  function colorPalette(color) {
    const classes = {
      blue: {
        iconWrap: 'bg-blue-100 dark:bg-blue-900/30',
        icon: 'text-blue-600 dark:text-blue-400',
        heading: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
        card: 'hover:border-blue-400 dark:hover:border-blue-600'
      },
      orange: {
        iconWrap: 'bg-orange-100 dark:bg-orange-900/30',
        icon: 'text-orange-600 dark:text-orange-400',
        heading: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
        card: 'hover:border-orange-400 dark:hover:border-orange-600'
      },
      green: {
        iconWrap: 'bg-green-100 dark:bg-green-900/30',
        icon: 'text-green-600 dark:text-green-400',
        heading: 'group-hover:text-green-600 dark:group-hover:text-green-400',
        card: 'hover:border-green-400 dark:hover:border-green-600'
      }
    };
    return classes[color] || classes.blue;
  }
</script>

<Seo title={seo.title} description={seo.description} image={seo.image} url={$router.path} />

<div>
  <div class="mb-8">
    <h1 id="overview" class="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Media Management</h1>
    <p class="text-neutral-600 dark:text-neutral-400">
      Naming, quality definitions, and general media settings that can be synced alongside profiles and custom formats.
    </p>
  </div>

  <div class="space-y-8">
    {#each groups as group}
      <section id={group.id}>
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 rounded-lg {colorPalette(group.color).iconWrap}">
            <svelte:component this={group.icon} class="w-5 h-5 {colorPalette(group.color).icon}" />
          </div>
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">{group.title}</h2>
        </div>

        {#if group.entries.length > 0}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            {#each group.entries as entry}
              <a
                href={getEntryPath(entry, databaseId)}
                class="block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 {colorPalette(group.color).card} transition-colors group"
              >
                <h3 class="text-sm font-medium text-neutral-900 dark:text-white mb-2 {colorPalette(group.color).heading}">
                  {entry.title}
                </h3>
                {#if entry.description}
                  <p class="text-sm text-neutral-600 dark:text-neutral-400">{entry.description}</p>
                {/if}
              </a>
            {/each}
          </div>
        {:else}
          <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">No {group.title.toLowerCase()} configs found.</p>
          </div>
        {/if}
      </section>
    {/each}
  </div>
</div>
