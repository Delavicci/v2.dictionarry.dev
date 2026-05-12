<script>
  import DiscordStatus from './components/discordStatus.svelte';
  import GithubStatus from './components/githubStatus.svelte';
  import RssButton from './components/rssButton.svelte';
  import { MessagesSquare } from 'lucide-svelte';
</script>

<footer class="w-full bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-600">
  <div class="universal-padding-x py-2 sm:py-3">
    <div class="flex justify-between items-center">
      <p class="text-xs text-neutral-500 dark:text-neutral-500">
        Free forever, for everyone.
      </p>
      <div class="flex items-center gap-1.5 sm:gap-2">
        <a
          href="/ai-transparency"
          class="inline-flex items-center gap-1 px-1.5 py-0.5 border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
          title="AI Transparency"
        >
          <MessagesSquare class="w-3 h-3 text-blue-500" />
          <span class="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400 hidden sm:inline">AI</span>
        </a>
        <RssButton />
        <GithubStatus />
        <DiscordStatus />
      </div>
    </div>
  </div>
</footer>
