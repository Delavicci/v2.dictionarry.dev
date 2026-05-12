<script>
  import Seo from '@shared/ui/seo.svelte';
  import { router } from 'tinro';
  import { getSeoData } from '@shared/constants/seoData';
  import { findEntryByTypeAndSlug, getCurrentDatabaseIdFromPath, getEntrySlugFromPath } from '@shared/utils/contentDatabase';
  import { setNavigationItems, clearNavigation } from '@shared/stores/navigation';
  import { onDestroy } from 'svelte';
  import Overview from './overview/overview.svelte';
  import Pattern from './pattern/pattern.svelte';
  import Tests from './tests/tests.svelte';
  import References from './references/references.svelte';
  import Utterances from '@shared/ui/utterances.svelte';
  import Changelog from '@shared/ui/changelog.svelte';
  
  let regexEntry = null;
  
  // Get current path and extract slug
  $: currentPath = $router.path;
  $: databaseId = getCurrentDatabaseIdFromPath(currentPath);
  $: slug = getEntrySlugFromPath(currentPath, 'regex-pattern');
  
  // Find regex pattern in content database
  $: regexEntry = slug && slug !== 'regex-pattern' 
    ? findEntryByTypeAndSlug('regex-pattern', slug, databaseId)
    : null;
  
  // Extract all data directly without nesting
  $: name = regexEntry?.data?.name || '';
  $: description = regexEntry?.data?.description || '';
  $: tags = regexEntry?.data?.tags || [];
  $: pattern = regexEntry?.data?.pattern || '';
  $: tests = regexEntry?.data?.tests || '';
  $: testResults = regexEntry?.data?.testResults || null;
  $: regex101 = regexEntry?.data?.regex101 || null;
  $: referencedBy = regexEntry?.data?.referencedBy || [];
  $: commitLog = regexEntry?.commitLog || null;

  $: seo = {
    title: name,
    description: getSeoData('/regex-pattern').description
  };
  
  // Set up navigation when regex pattern is loaded
  $: if (regexEntry) {
    const navItems = ['Overview', 'Pattern', 'Tests'];
    if (referencedBy.length > 0) {
      navItems.push('Referenced By');
    }
    if (commitLog) {
      navItems.push('Changelog');
    }
    navItems.push('Discussion');
    setNavigationItems(navItems, currentPath);
  }
  
  onDestroy(() => {
    clearNavigation();
  });
</script>

<Seo
  title={seo.title}
  description={seo.description}
  image={null}
  url={$router.path}
/>

<div>
  {#if regexEntry}
    <!-- Overview Section with full-width background -->
    <section id="overview">
      <Overview {name} {description} {tags} />
    </section>
    
    <!-- Rest of content with normal padding -->
    <div>
      <!-- Pattern Section -->
      <section id="pattern" class="mb-12">
        <Pattern {pattern} />
      </section>
      
      <!-- Tests Section -->
      <section id="tests" class="mb-12">
        <Tests {tests} {testResults} {regex101} />
      </section>
      
      <!-- Referenced By Section -->
      {#if referencedBy.length > 0}
        <section id="referenced-by" class="mb-12">
          <References {referencedBy} />
        </section>
      {/if}
      
      <!-- Changelog Section -->
      {#if commitLog}
        <section id="changelog" class="mb-12">
          <Changelog {commitLog} />
        </section>
      {/if}
      
      <!-- Discussion Section -->
      {#if name}
        <section id="discussion" class="mb-12 pb-12">
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Discussion</h2>
          {#key name}
            <Utterances issueTerm={`🔍 Regex Pattern: ${name}`} />
          {/key}
        </section>
      {/if}
    </div>
  {:else if slug && slug !== 'regex-pattern'}
    <div>
      <p>No regex pattern found for slug: {slug}</p>
    </div>
  {:else}
    <div>
      <p>Loading...</p>
    </div>
  {/if}
</div>
