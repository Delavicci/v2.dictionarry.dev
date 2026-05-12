<script>
  import { setNavigationItems, clearNavigation } from '@shared/stores/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { BookOpen, Download, FlaskConical, RefreshCw, Repeat2, SlidersHorizontal, Sliders, TestTube2, WandSparkles } from 'lucide-svelte';
  import Seo from '@shared/ui/seo.svelte';
  import { router } from 'tinro';
  import { getSeoData } from '@shared/constants/seoData';

  const seo = getSeoData($router.path);

  const featureCards = [
    {
      title: 'Different people want different libraries',
      icon: Sliders,
      text: 'Connect databases built around different preferences, then make local tweaks on top instead of pretending one profile set can fit everyone.',
      color: 'violet'
    },
    {
      title: 'Manual Arr setup gets messy',
      icon: Repeat2,
      text: 'Sync selected profiles, formats, naming, and quality definitions into Radarr or Sonarr, and keep that setup repeatable.',
      color: 'blue'
    },
    {
      title: 'Old downloads do not improve themselves',
      icon: RefreshCw,
      text: 'Use upgrade filters to work through your existing library over time and ask your Arr to search for better releases.',
      color: 'green'
    },
    {
      title: "It's hard to know if configs actually work",
      icon: TestTube2,
      text: 'Use tests and previews to check regex patterns, custom formats, and profile behavior before syncing changes into your Arrs.',
      color: 'orange'
    }
  ];

  const nextSteps = [
    {
      title: 'Install Profilarr',
      description: 'Docker, Unraid, and CasaOS setup notes.',
      href: '/profilarr-setup/installation',
      icon: Download,
      color: 'green'
    },
    {
      title: 'Quality profiles',
      description: 'Browse the profile docs and compare the approaches.',
      href: '/quality-profile',
      icon: WandSparkles,
      color: 'blue'
    },
    {
      title: 'Media management',
      description: 'Naming, quality definitions, and related Arr settings.',
      href: '/media-management',
      icon: SlidersHorizontal,
      color: 'teal'
    },
    {
      title: 'Wiki',
      description: 'Longer explanations for media automation concepts.',
      href: '/wiki',
      icon: BookOpen,
      color: 'purple'
    },
    {
      title: 'Devlogs',
      description: 'The more detailed story of what changed and why.',
      href: '/devlogs',
      icon: FlaskConical,
      color: 'orange'
    }
  ];

  const borderClasses = {
    green: 'group-hover:border-green-500 dark:group-hover:border-green-400',
    blue: 'group-hover:border-blue-500 dark:group-hover:border-blue-400',
    violet: 'group-hover:border-violet-500 dark:group-hover:border-violet-400',
    teal: 'group-hover:border-teal-500 dark:group-hover:border-teal-400',
    purple: 'group-hover:border-purple-500 dark:group-hover:border-purple-400',
    orange: 'group-hover:border-orange-500 dark:group-hover:border-orange-400'
  };

  const iconClasses = {
    green: 'bg-green-100 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-600 dark:text-blue-400',
    violet: 'bg-violet-100 text-violet-600 dark:text-violet-400',
    teal: 'bg-teal-100 text-teal-600 dark:text-teal-400',
    purple: 'bg-purple-100 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:text-orange-400'
  };

  onMount(() => {
    setNavigationItems([
      'Before You Start',
      'Getting Started'
    ], '/');
  });

  onDestroy(() => {
    clearNavigation();
  });
</script>

<Seo
  title={seo.title}
  description={seo.description}
  image={seo.image}
  url={$router.path}
/>

<div class="max-w-4xl">
  <section class="mb-10">
    <h1 class="header-font mb-6 max-w-3xl text-2xl font-semibold leading-tight text-neutral-950 dark:text-white md:text-3xl">
      Less config wrestling, more watching things.
    </h1>
    <div class="space-y-4 text-base leading-7 text-neutral-700 dark:text-neutral-300">
      <p>
        Good Arr setups are mostly accumulated knowledge: which groups are worth trusting, which releases should be avoided, how scores interact, which regex catches the thing you meant without catching five things you did not. Profilarr exists so that knowledge can be maintained by people who enjoy building it, shared as databases, and reused by everyone else. It achieves this by focusing on these four practical problems.
      </p>
    </div>
  </section>

  <section id="what-profilarr-does" class="mb-10">
    <div class="grid gap-4 md:grid-cols-2">
      {#each featureCards as card}
        <article class="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <div class="mb-3 flex items-center gap-3">
            <span class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md {iconClasses[card.color]} dark:bg-neutral-800">
              <svelte:component this={card.icon} class="h-5 w-5" />
            </span>
            <h3 class="font-semibold text-neutral-900 dark:text-white">{card.title}</h3>
          </div>
          <p class="text-sm leading-6 text-neutral-600 dark:text-neutral-400">{card.text}</p>
        </article>
      {/each}
    </div>
  </section>

  <section id="before-you-start" class="mb-10 rounded-r-lg border-l-4 border-l-amber-500 bg-neutral-50 p-4 dark:border-l-amber-500 dark:bg-neutral-900/60">
    <div class="mb-2 flex items-center gap-2">
      <span>⚠️</span>
      <h2 class="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Before You Start</h2>
    </div>
    <div class="space-y-3 text-sm leading-6 text-neutral-700 dark:text-neutral-200">
      <p>
        Profilarr v2 replaces v1, but it is not an upgrade you can apply to an existing v1 setup. The app has changed enough that there is no migration path, so start with a fresh install instead of reusing old appdata or configuration.
      </p>
      <p>
        If you are still using v1, use the v1 docs linked <a href="https://v1.dictionarry.dev" class="text-blue-600 hover:underline dark:text-blue-400">here</a>.
      </p>
    </div>
  </section>

  <section id="getting-started" class="mb-8">
    <h2 class="mb-4 text-2xl font-semibold text-neutral-900 dark:text-white">🚀 Getting Started</h2>
    <div class="grid gap-4 md:grid-cols-2">
      {#each nextSteps as step}
        <a
          href={step.href}
          class="group block rounded-lg border border-neutral-200 bg-white p-5 transition-colors hover:bg-neutral-50 {borderClasses[step.color]} dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800/70"
        >
          <div class="mb-3 flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-md {iconClasses[step.color]} dark:bg-neutral-800">
              <svelte:component this={step.icon} class="h-5 w-5" />
            </span>
            <h3 class="font-semibold text-neutral-900 dark:text-white">{step.title}</h3>
          </div>
          <p class="text-sm leading-6 text-neutral-600 dark:text-neutral-400">{step.description}</p>
        </a>
      {/each}
    </div>
  </section>
</div>
