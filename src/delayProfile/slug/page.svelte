<script>
  import Seo from '@shared/ui/seo.svelte';
  import { router } from 'tinro';
  import { getSeoData } from '@shared/constants/seoData';
  import { setNavigationItems, clearNavigation } from '@shared/stores/navigation';
  import { onDestroy } from 'svelte';
  import { findEntryByTypeAndSlug, getEntrySlugFromPath } from '@shared/utils/contentDatabase';
  import { selectedDatabaseId } from '@shared/stores/database';
  import { Clock, Gauge, Timer, CheckCircle, XCircle } from 'lucide-svelte';

  $: currentPath = $router.path;
  $: databaseId = $selectedDatabaseId;
  $: slug = getEntrySlugFromPath(currentPath, 'delay-profile');
  $: profileEntry = slug && slug !== 'delay-profile'
    ? findEntryByTypeAndSlug('delay-profile', slug, databaseId)
    : null;
  $: profile = profileEntry?.data || {};
  $: rows = profileEntry ? buildRows(profile).filter((row) => row.show !== false) : [];
  $: seo = {
    title: profileEntry?.title || getSeoData('/delay-profile').title,
    description: profileEntry?.description || getSeoData('/delay-profile').description
  };

  $: if (profileEntry) {
    setNavigationItems(['Overview', 'Settings'], currentPath);
  }

  onDestroy(() => {
    clearNavigation();
  });

  function protocolLabel(value) {
    return value?.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Unknown';
  }

  function minutes(value) {
    if (value === null || value === undefined) return 'Not used';
    return `${value} minute${value === 1 ? '' : 's'}`;
  }

  function score(value) {
    if (value === null || value === undefined) return 'Not used';
    return String(value);
  }

  function boolLabel(value) {
    return value ? 'Enabled' : 'Disabled';
  }

  function boolClasses(value) {
    return value
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }

  function buildRows(profileData) {
    return [
      {
        label: 'Preferred Protocol',
        value: protocolLabel(profileData.preferred_protocol),
        icon: Timer,
        tone: 'text-orange-600 dark:text-orange-400'
      },
      {
        label: 'Usenet Delay',
        value: minutes(profileData.usenet_delay),
        icon: Clock,
        tone: 'text-neutral-500 dark:text-neutral-400'
      },
      {
        label: 'Torrent Delay',
        value: minutes(profileData.torrent_delay),
        icon: Clock,
        tone: 'text-neutral-500 dark:text-neutral-400'
      },
      {
        label: 'Bypass If Highest Quality',
        value: boolLabel(profileData.bypass_if_highest_quality),
        status: boolClasses(profileData.bypass_if_highest_quality),
        icon: profileData.bypass_if_highest_quality ? CheckCircle : XCircle,
        tone: profileData.bypass_if_highest_quality
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'
      },
      {
        label: 'Bypass Above Custom Format Score',
        value: boolLabel(profileData.bypass_if_above_custom_format_score),
        status: boolClasses(profileData.bypass_if_above_custom_format_score),
        icon: profileData.bypass_if_above_custom_format_score ? CheckCircle : XCircle,
        tone: profileData.bypass_if_above_custom_format_score
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'
      },
      {
        label: 'Minimum Custom Format Score',
        value: score(profileData.minimum_custom_format_score),
        show: profileData.bypass_if_above_custom_format_score,
        icon: Gauge,
        tone: 'text-blue-600 dark:text-blue-400'
      }
    ];
  }
</script>

<Seo title={seo.title} description={seo.description} image={null} url={$router.path} />

{#if profileEntry}
  <div>
    <section id="overview" class="mb-12">
      <div class="flex flex-col md:flex-row md:items-start gap-4">
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-white md:w-1/2">
          {profileEntry.title}
        </h1>

        <div class="flex flex-wrap gap-2 md:w-1/2 md:justify-end">
          <span class="px-3 py-1 bg-white dark:bg-neutral-900
                       border border-neutral-300/70 dark:border-neutral-700/50
                       rounded-full text-xs font-medium flex items-center gap-1.5">
            <Clock class="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span class="text-neutral-700 dark:text-neutral-300">{protocolLabel(profile.preferred_protocol)}</span>
          </span>
        </div>
      </div>
      <div class="mt-6 border-t border-neutral-200 dark:border-neutral-700/60"></div>
    </section>

    <section id="settings" class="mb-12 pb-12">
      <div class="flex flex-col md:flex-row md:items-start gap-4 mb-4">
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-white md:w-1/4">Settings</h2>
      </div>

      <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-neutral-200 dark:border-neutral-700">
              <th class="text-left px-4 py-3 text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Setting</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Value</th>
            </tr>
          </thead>
          <tbody>
            {#each rows as row}
              <tr class="border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <svelte:component this={row.icon} class="w-4 h-4 {row.tone}" />
                    <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{row.label}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  {#if row.status}
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium {row.status}">
                      {row.value}
                    </span>
                  {:else}
                    <span class="text-sm text-neutral-900 dark:text-neutral-100">{row.value}</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  </div>
{:else if slug && slug !== 'delay-profile'}
  <div>
    <p>No delay profile found for slug: {slug}</p>
  </div>
{:else}
  <div>
    <p>Loading...</p>
  </div>
{/if}
