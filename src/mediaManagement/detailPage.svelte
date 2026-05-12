<script>
  import Seo from '@shared/ui/seo.svelte';
  import { router } from 'tinro';
  import { getSeoData } from '@shared/constants/seoData';
  import { setNavigationItems, clearNavigation } from '@shared/stores/navigation';
  import { onDestroy } from 'svelte';
  import { findEntryByTypeAndSlug, getCurrentDatabaseIdFromPath, stripDatabasePrefix } from '@shared/utils/contentDatabase';
  import { Film, Tv, FolderOpen, FileText, Hash, Calendar, ToggleLeft } from 'lucide-svelte';
  import CodeBlock from '@shared/ui/codeBlock.svelte';
  import Table from '@shared/ui/table.svelte';

  $: currentPath = $router.path;
  $: databaseId = getCurrentDatabaseIdFromPath(currentPath);
  $: cleanPath = stripDatabasePrefix(currentPath).replace(/\/$/, '');
  $: slug = cleanPath.split('/').pop();
  $: mediaEntry = slug ? findEntryByTypeAndSlug('media-management', slug, databaseId) : null;
  $: mediaData = mediaEntry?.data || {};
  $: subtype = mediaData.subtype;
  $: service = mediaData.arrType || 'radarr';
  $: serviceTitle = service.charAt(0).toUpperCase() + service.slice(1);
  $: seo = {
    title: mediaEntry?.title || getSeoData('/media-management').title,
    description: mediaEntry?.description || getSeoData('/media-management').description
  };

  $: if (mediaEntry) {
    setNavigationItems([serviceTitle], currentPath);
  }

  onDestroy(() => {
    clearNavigation();
  });

  function formatFieldName(key) {
    const fieldNames = {
      rename: 'Automatic Rename',
      standardMovieFormat: 'Movie Format',
      movie_format: 'Movie Format',
      movieFolderFormat: 'Movie Folder',
      movie_folder_format: 'Movie Folder',
      colonReplacementFormat: 'Colon Replacement',
      colon_replacement_format: 'Colon Replacement',
      standardEpisodeFormat: 'Episode Format',
      standard_episode_format: 'Episode Format',
      seriesFolderFormat: 'Series Folder',
      series_folder_format: 'Series Folder',
      seasonFolderFormat: 'Season Folder',
      season_folder_format: 'Season Folder',
      dailyEpisodeFormat: 'Daily Episode',
      daily_episode_format: 'Daily Episode',
      animeEpisodeFormat: 'Anime Episode',
      anime_episode_format: 'Anime Episode',
      multiEpisodeStyle: 'Multi-Episode Style',
      multi_episode_style: 'Multi-Episode Style',
      replaceIllegalCharacters: 'Replace Illegal Characters',
      replace_illegal_characters: 'Replace Illegal Characters',
      customColonReplacementFormat: 'Custom Colon Replacement',
      custom_colon_replacement_format: 'Custom Colon Replacement'
    };
    return fieldNames[key] || key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  function getFieldIcon(key) {
    if (key === 'rename') return ToggleLeft;
    if (key.includes('Folder') || key.includes('folder')) return FolderOpen;
    if (key.includes('Episode') || key.includes('episode')) return Hash;
    if (key.includes('daily')) return Calendar;
    return FileText;
  }

  function mapColonReplacement(value, isRadarr = false) {
    if (isRadarr) {
      const radarrMap = {
        delete: 'Delete',
        dash: 'Replace with Dash',
        spaceDash: 'Replace with Space Dash',
        spaceDashSpace: 'Replace with Space Dash Space',
        smart: 'Smart Replace'
      };
      return radarrMap[value] || value;
    }

    const sonarrMap = {
      0: 'Delete',
      1: 'Replace with Dash',
      2: 'Replace with Space Dash',
      3: 'Replace with Space Dash Space',
      4: 'Smart Replace',
      5: 'Custom'
    };
    return sonarrMap[value] || value;
  }

  function mapMultiEpisodeStyle(value) {
    const styleMap = {
      0: 'Extend',
      1: 'Duplicate',
      2: 'Repeat',
      3: 'Scene',
      4: 'Range',
      5: 'Prefixed Range'
    };
    return styleMap[value] || value;
  }

  function formatValue(key, value, targetService = service) {
    if (typeof value === 'boolean') {
      return value ? 'Enabled' : 'Disabled';
    }

    if (key === 'colonReplacementFormat' || key === 'colon_replacement_format') {
      return mapColonReplacement(value, targetService === 'radarr');
    }

    if ((key === 'multiEpisodeStyle' || key === 'multi_episode_style') && targetService === 'sonarr') {
      return mapMultiEpisodeStyle(value);
    }

    return value;
  }

  function shouldShowNamingField(key, value, config) {
    const hiddenFields = ['subtype', 'arrType', 'name', 'created_at', 'updated_at'];
    if (hiddenFields.includes(key)) return false;
    if (value === '' || value === null || value === undefined) return false;
    if ((key === 'colonReplacementFormat' || key === 'customColonReplacementFormat') && config.replaceIllegalCharacters === false) return false;
    if ((key === 'colon_replacement_format' || key === 'custom_colon_replacement_format') && config.replace_illegal_characters === false) return false;
    return typeof value !== 'object';
  }

  function formatFileSize(mb) {
    if (mb >= 1000) {
      return `${(mb / 1000).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  }

  $: definitionRows = (mediaData.definitions || []).map((definition) => ({
    quality: definition.quality_name,
    min: definition.min_size,
    preferred: definition.preferred_size,
    max: definition.max_size
  }));

  const tableHeaders = [
    {
      key: 'quality',
      label: 'Quality',
      sortable: true
    },
    {
      key: 'min',
      label: 'Minimum',
      type: 'number',
      sortable: true,
      render: (row) => `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">${formatFileSize(row.min)}</span>`
    },
    {
      key: 'preferred',
      label: 'Preferred',
      type: 'number',
      sortable: true,
      render: (row) => `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">${formatFileSize(row.preferred)}</span>`
    },
    {
      key: 'max',
      label: 'Maximum',
      type: 'number',
      sortable: true,
      render: (row) => `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">${formatFileSize(row.max)}</span>`
    }
  ];

  function formatSettingName(key) {
    const settingNames = {
      propersRepacks: 'Prefer Propers & Repacks',
      propers_repacks: 'Prefer Propers & Repacks',
      enableMediaInfo: 'Analyze Video Files',
      enable_media_info: 'Analyze Video Files'
    };
    return settingNames[key] || key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  }

  function getSettingDescription(key) {
    const descriptions = {
      propersRepacks:
        'Uses Radarr/Sonarr logic to prefer releases marked as propers and repacks. This overwrites custom format scores and should typically be disabled.',
      propers_repacks:
        'Uses Radarr/Sonarr logic to prefer releases marked as propers and repacks. This overwrites custom format scores and should typically be disabled.',
      enableMediaInfo:
        'Required to analyze media files and extract information such as HDR, audio codecs, etc. for renaming purposes.',
      enable_media_info:
        'Required to analyze media files and extract information such as HDR, audio codecs, etc. for renaming purposes.'
    };
    return descriptions[key] || '';
  }

  function shouldShowSettingField(key, value) {
    const hiddenFields = ['subtype', 'arrType', 'name', 'created_at', 'updated_at'];
    if (hiddenFields.includes(key)) return false;
    if (value === '' || value === null || value === undefined) return false;
    return typeof value !== 'object';
  }
</script>

<Seo
  title={seo.title}
  description={seo.description}
  image={null}
  url={$router.path}
/>

{#if mediaEntry}
  <div>
    <section id="overview" class="mb-12">
      <div class="flex flex-col md:flex-row md:items-start gap-4">
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-white md:w-1/2">
          {mediaEntry.title}
        </h1>

        <div class="flex flex-wrap gap-2 md:w-1/2 md:justify-end">
          <span class="px-3 py-1 bg-white dark:bg-neutral-900
                       border border-neutral-300/70 dark:border-neutral-700/50
                       rounded-full text-xs font-medium flex items-center gap-1.5">
            {#if service.toLowerCase() === 'radarr'}
              <Film class="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
              <span class="text-neutral-700 dark:text-neutral-300">Movies</span>
            {:else}
              <Tv class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span class="text-neutral-700 dark:text-neutral-300">Series</span>
            {/if}
          </span>
        </div>
      </div>

      <div class="mt-6 border-t border-neutral-200 dark:border-neutral-700/60"></div>
    </section>

    <div class="mb-12">
      {#if subtype === 'quality-definitions'}
        <section id={service.toLowerCase()} class="mb-8">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-neutral-900 dark:text-white md:w-1/4">
              {serviceTitle}
            </h2>
          </div>

          <Table
            headers={tableHeaders}
            data={definitionRows}
            defaultSort="quality"
            defaultDirection="asc"
          />
        </section>
      {:else if subtype === 'media-settings'}
        <section id={service.toLowerCase()} class="mb-8">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-neutral-900 dark:text-white md:w-1/4">
              {serviceTitle}
            </h2>
          </div>

          <div class="space-y-4">
            {#each Object.entries(mediaData).filter(([key, value]) => shouldShowSettingField(key, value)) as [key, value]}
              <div
                class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <ToggleLeft class="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    <h3 class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {formatSettingName(key)}
                    </h3>
                  </div>
                  {#if typeof value === 'boolean'}
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium {value
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}"
                    >
                      {value ? 'Enabled' : 'Disabled'}
                    </span>
                  {:else}
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400"
                    >
                      {value}
                    </span>
                  {/if}
                </div>
                {#if getSettingDescription(key)}
                  <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {getSettingDescription(key)}
                  </p>
                {/if}
              </div>
            {/each}
          </div>
        </section>
      {:else}
        <section id={service.toLowerCase()} class="mb-8">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-neutral-900 dark:text-white md:w-1/4">
              {serviceTitle}
            </h2>
          </div>

          <div class="space-y-4">
            {#each Object.entries(mediaData).filter(([key, value]) => shouldShowNamingField(key, value, mediaData)) as [key, value]}
              <CodeBlock
                items={[{
                  title: formatFieldName(key),
                  code: formatValue(key, value, service.toLowerCase()),
                  language: 'text',
                  icon: getFieldIcon(key)
                }]}
                overflow="wrap"
              />
            {/each}
          </div>
        </section>
      {/if}
    </div>
  </div>
{:else if slug}
  <div>
    <p>No media management config found for slug: {slug}</p>
  </div>
{:else}
  <div>
    <p>Loading...</p>
  </div>
{/if}
