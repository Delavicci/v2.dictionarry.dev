<script>
  import Seo from "@shared/ui/seo.svelte";
  import { getSeoData } from "@shared/constants/seoData";
  import { setNavigationItems, clearNavigation } from "@shared/stores/navigation";
  import { onMount, onDestroy } from "svelte";
  import { router } from "tinro";
  import CodeBlock from "@shared/ui/codeBlock.svelte";
  import DockerIcon from "@shared/icons/dockerIcon.svelte";
  import { Terminal } from "lucide-svelte";

  const seo = getSeoData($router.path);

  onMount(() => {
    setNavigationItems(["Overview", "Versions", "Docker", "Parser", "Unraid", "That's It"], "/profilarr-setup/installation");
  });

  onDestroy(() => {
    clearNavigation();
  });

  const dockerComposeCode = `services:
  profilarr:
    image: ghcr.io/dictionarry-hub/profilarr:latest
    container_name: profilarr
    restart: unless-stopped
    ports:
      - "6868:6868"
    volumes:
      - ./config:/config
    environment:
      - PUID=1000
      - PGID=1000
      - UMASK=022
      - TZ=Etc/UTC
      - PARSER_HOST=parser
      - PARSER_PORT=5000
    depends_on:
      parser:
        condition: service_healthy

  # Optional - only needed for CF/QP testing
  parser:
    image: ghcr.io/dictionarry-hub/profilarr-parser:latest
    container_name: profilarr-parser
    restart: unless-stopped
    expose:
      - "5000"`;

  const dockerCliCode = `docker run -d \\
  --name profilarr \\
  --restart unless-stopped \\
  -p 6868:6868 \\
  -v ./config:/config \\
  -e PUID=1000 \\
  -e PGID=1000 \\
  -e UMASK=022 \\
  -e TZ=Etc/UTC \\
  ghcr.io/dictionarry-hub/profilarr:latest`;

  const codeItems = [
    {
      title: "Docker Compose",
      code: dockerComposeCode,
      language: "yaml",
      icon: DockerIcon,
    },
    {
      title: "Docker CLI",
      code: dockerCliCode,
      language: "bash",
      icon: Terminal,
    },
  ];
</script>

<Seo title={seo.title} description={seo.description} image={seo.image} url={$router.path} />

<div>
  <h1 class="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Installation</h1>

  <h2 class="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mt-8 mb-4" id="overview">Overview</h2>
  <p class="text-neutral-700 dark:text-neutral-300 mt-6">
    Profilarr is currently only available through Docker, with native Windows support planned for the future.
  </p>

  <h2 class="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mt-8 mb-4" id="versions">Versions</h2>
  <p class="text-neutral-700 dark:text-neutral-300 mt-6">
    Use <code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">latest</code> unless you specifically want to test upcoming changes.
  </p>
  <p class="text-neutral-700 dark:text-neutral-300 mt-4">
    <code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">latest</code> is the stable release image. <code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">develop</code> is built from the testing branch and may include unfinished or untested changes. Tagged images, such as <code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">v2.3.0</code>, can be used if you want to pin to a specific release.
  </p>

  <h2 class="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mt-8 mb-4" id="docker">Docker</h2>
  <p class="text-neutral-700 dark:text-neutral-300 mt-6">
    To get started with Profilarr, you can use either Docker Compose or the Docker CLI. Choose the method that best fits
    your setup:
  </p>

  <div class="mt-4">
    <CodeBlock items={codeItems} />
  </div>

  <h2 class="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mt-8 mb-4" id="parser">Parser</h2>
  <p class="text-neutral-700 dark:text-neutral-300 mt-6">
    The Docker Compose example includes a second container called <code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">parser</code>. This service powers custom format and quality profile testing by using the same parsing logic as Radarr and Sonarr.
  </p>
  <p class="text-neutral-700 dark:text-neutral-300 mt-4">
    It is optional. Linking databases, syncing their configs, and running upgrades all work without it. It's primarily for database developers to test their configs. If you do not need testing, remove the <code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">parser</code> service, the <code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">PARSER_HOST</code>/<code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">PARSER_PORT</code> environment variables, and the <code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">depends_on</code> block.
  </p>

  <h2 class="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mt-8 mb-4" id="unraid">Unraid</h2>
  <p class="text-neutral-700 dark:text-neutral-300 mt-6">
    The easiest way to install Profilarr on Unraid is through the <strong>Community Applications</strong> plugin. Simply
    search for "Profilarr" and install the container.
  </p>

  <h2 class="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mt-8 mb-4" id="thats-it">That's It</h2>
  <p class="text-neutral-700 dark:text-neutral-300 mt-6">
    Once Profilarr is running, open the web UI and use the in-app onboarding to link your first database, connect Radarr or Sonarr, and configure sync. You can find it under <strong>Settings &gt; Onboarding</strong>.
  </p>
</div>
