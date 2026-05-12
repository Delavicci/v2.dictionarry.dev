<script>
  import Seo from '@shared/ui/seo.svelte';
  import { router } from 'tinro';
  import { getSeoData } from '@shared/constants/seoData';
  import { setNavigationItems, clearNavigation } from '@shared/stores/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { getCurrentDatabaseIdFromPath, getEntriesByType, getEntryPath } from '@shared/utils/contentDatabase';
  import { Clock, Timer, Gauge } from 'lucide-svelte';

  const seo = getSeoData('/delay-profile');

  $: databaseId = getCurrentDatabaseIdFromPath($router.path);
  $: delayProfiles = getEntriesByType('delay-profile', databaseId)
    .sort((a, b) => a.title.localeCompare(b.title));

  onMount(() => {
    setNavigationItems(['Profiles'], '/delay-profile');
  });

  onDestroy(() => {
    clearNavigation();
  });

  function protocolLabel(value) {
    return value?.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Unknown';
  }
</script>

<Seo title={seo.title} description={seo.description} image={seo.image} url={$router.path} />

<div>
  <section id="profiles" class="mb-12">
    <div class="flex flex-col md:flex-row md:items-start gap-4 mb-6">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white md:w-1/3">Delay Profiles</h1>

      <div class="flex flex-wrap gap-2 md:w-2/3 md:justify-end">
        <span class="px-3 py-1 bg-white dark:bg-neutral-900 border border-neutral-300/70 dark:border-neutral-700/50 rounded-full text-xs font-medium flex items-center gap-1.5">
          <Clock class="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
          <span class="text-neutral-700 dark:text-neutral-300">{delayProfiles.length} profile{delayProfiles.length === 1 ? '' : 's'}</span>
        </span>
      </div>
    </div>

    {#if delayProfiles.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each delayProfiles as profile}
          <a
            href={getEntryPath(profile, databaseId)}
            class="block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:border-orange-400 dark:hover:border-orange-600 transition-colors"
          >
            <h2 class="text-base font-semibold text-neutral-900 dark:text-white mb-3">{profile.title}</h2>
            <div class="flex flex-wrap gap-2">
              <span class="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Timer class="w-3 h-3 text-orange-600 dark:text-orange-400" />
                {protocolLabel(profile.data?.preferred_protocol)}
              </span>
              {#if profile.data?.minimum_custom_format_score !== null && profile.data?.minimum_custom_format_score !== undefined}
                <span class="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Gauge class="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  {profile.data.minimum_custom_format_score} minimum score
                </span>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    {:else}
      <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-8 text-center">
        <p class="text-neutral-500 dark:text-neutral-400">No delay profiles found.</p>
      </div>
    {/if}
  </section>
</div>
