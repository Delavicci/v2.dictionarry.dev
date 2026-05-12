<script>
  const storageKey = 'dictionarry:v1-docs-banner:v2';

  let isVisible = typeof localStorage === 'undefined' || localStorage.getItem(storageKey) !== 'dismissed';

  function dismiss() {
    localStorage.setItem(storageKey, 'dismissed');
    isVisible = false;
  }
</script>

{#if isVisible}
  <div class="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
    <div class="universal-padding-x flex flex-col gap-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p class="text-neutral-700 dark:text-neutral-300">
        <span class="font-medium text-neutral-900 dark:text-neutral-100">This site documents Profilarr v2.</span>
        For Profilarr v1 guidance, use the v1 docs.
      </p>
      <div class="flex items-center gap-2">
        <a
          href="https://v1.dictionarry.dev"
          class="inline-flex items-center justify-center rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-400 hover:bg-white dark:border-neutral-600 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
        >
          Open v1 docs
        </a>
        <button
          type="button"
          class="rounded-md px-2 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          on:click={dismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
{/if}
