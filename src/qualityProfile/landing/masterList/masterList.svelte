<script>
  import Table from "@shared/ui/table.svelte";
  import { getEntriesByType, getEntryPath } from "@shared/utils/contentDatabase";
  import { parseMarkdown } from "@shared/utils/markdown";

  export let databaseId = undefined;

  // Get all quality profiles from the database
  $: qualityProfiles = getEntriesByType("quality-profile", databaseId);

  // Transform profiles for table data
  $: profileData = qualityProfiles.map((profile) => {
    // Parse full markdown description to HTML
    const parsedDescription = parseMarkdown(profile.data.description);

    return {
      name: profile.data.name,
      description: parsedDescription,
      url: getEntryPath(profile, databaseId),
    };
  });

  // Define table headers
  const headers = [
    {
      key: "name",
      label: "Profile",
      type: "string",
      render: (row) => `
        <a href="${row.url}" class="block -mx-6 -my-4 px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:underline transition-colors">
          ${row.name}
        </a>
      `,
    },
    {
      key: "description",
      label: "Description",
      type: "string",
      render: (row) => `
        <div class="text-neutral-600 dark:text-neutral-300 leading-relaxed">
          ${row.description}
        </div>
      `,
    },
  ];
</script>

<div class="pt-6">
  <h2 class="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Master List</h2>

  <Table {headers} data={profileData} defaultSort="name" defaultDirection="asc" />
</div>
