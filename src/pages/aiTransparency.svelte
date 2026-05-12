<script>
  import { onMount, onDestroy } from 'svelte';
  import { setNavigationItems, clearNavigation } from '@shared/stores/navigation';
  import Seo from '@shared/ui/seo.svelte';

  onMount(() => {
    setNavigationItems([
      'How I Use AI',
      'Accountability & Verification',
      'Why This Page Exists'
    ], '/ai-transparency');
  });

  onDestroy(() => {
    clearNavigation();
  });
</script>

<Seo
  title="AI Transparency"
  description="How AI is used during Profilarr development, and why accountability matters more than purity."
  url="/ai-transparency"
/>

<article class="max-w-3xl">
  <h1 class="mb-6 text-3xl font-semibold text-neutral-950 dark:text-white">AI Transparency</h1>

  <div class="space-y-5 text-neutral-700 dark:text-neutral-300 leading-7">
    <p>
      Conversations about AI in open source often fixate on one question: <em>was AI involved in writing the code?</em> I don't think that's the most useful question to ask.
    </p>

    <p>
      What users actually care about hasn't changed. Is the software secure? Does it behave as documented? Will it mishandle data, leak credentials, or break in unexpected ways? Is someone accountable when it does?
    </p>

    <p>Those are the same questions you'd ask of <em>any</em> tool, regardless of whether AI was involved.</p>

    <p>
      AI doesn't independently design systems, make architectural tradeoffs, or decide what should exist. It can accelerate implementation, research, and iteration, but the responsibility for what gets shipped still belongs to the developer using it.
    </p>

    <p>So the more useful questions are:</p>

    <ul class="list-disc space-y-2 pl-6">
      <li>Does the maintainer understand the system they built?</li>
      <li>Are the architecture and tradeoffs well reasoned?</li>
      <li>Is there accountability when something breaks?</li>
      <li>Can the claims being made be verified independently?</li>
    </ul>

    <p>
      For context: I recently finished a Bachelor of Computer Science with a major in cybersecurity. That background absolutely influences how I think about architecture, security, and operational transparency. At the same time, I don't think credentials, years of experience, or avoiding AI magically make software trustworthy. Software engineering is messy. Every developer, no matter how decorated or experienced, eventually ships bugs, security issues, and bad abstractions. It's a fact of life.
    </p>

    <p>
      What matters more to me is whether the reasoning is visible, whether claims can be verified independently, and whether someone is accountable when things go wrong.
    </p>

    <p>With that said: I use AI during the development of Profilarr.</p>

    <p>
      I think it's a useful tool when used deliberately and within clear constraints, but reasonable people disagree on that. Part of the implicit contract of open source is understanding what you're running, so I think transparency around tooling is fair.
    </p>
  </div>

  <section id="how-i-use-ai" class="mt-10">
    <h2 class="mb-4 text-2xl font-semibold text-neutral-900 dark:text-white">How I Use AI</h2>

    <div class="space-y-8 text-neutral-700 dark:text-neutral-300 leading-7">
      <div>
        <h3 class="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Research</h3>
        <p>
          When I'm learning an unfamiliar library, implementation pattern, protocol, or codebase, AI is often the first tool I reach for. Sometimes this means asking questions, sometimes it means having AI search through documentation or walk through an existing implementation with me.
        </p>
      </div>

      <div>
        <h3 class="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Discussion and Iteration</h3>
        <p>
          Most of the actual work in Profilarr happens before code is written.
        </p>
        <p class="mt-4">
          A large part of development is thinking through problems: architecture, tradeoffs, data flow, failure modes, and where complexity should live. Most of the devlogs exist because writing is how I reason about systems and keep myself accountable while designing them.
        </p>
        <p class="mt-4">
          I'll often use AI as a sounding board when evaluating approaches or reviewing code I've already written. Sometimes it points out edge cases or tradeoffs I missed. Sometimes it suggests abstractions or framings that help clarify a problem. Sometimes it's outright wrong.
        </p>
      </div>

      <div>
        <h3 class="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Implementation</h3>
        <p>
          Once those decisions are made, AI can be useful for implementation work. Sometimes that's generating a rough first draft, sometimes it's boilerplate, sometimes it's helping wire together repetitive UI or API code. Other times it looks more like pair programming: going back and forth on edge cases, abstractions, or implementation details.
        </p>
        <p class="mt-4">
          Some generated code survives mostly intact. A lot of it doesn't. AI regularly hallucinates dependencies, misunderstands specifications, suggests abstractions that don't fit the system, or produces implementations that are superficially correct but structurally wrong.
        </p>
      </div>
    </div>
  </section>

  <section id="accountability-verification" class="mt-10">
    <h2 class="mb-4 text-2xl font-semibold text-neutral-900 dark:text-white">Accountability &amp; Verification</h2>

    <div class="space-y-5 text-neutral-700 dark:text-neutral-300 leading-7">
      <p>
        As I alluded to earlier, AI-assisted or not, shipped code still needs to be understood, reviewed, tested, and maintained by the person responsible for the project.
      </p>

      <p>
        Everything that ships in Profilarr is <a href="https://github.com/Dictionarry-Hub/profilarr/pulls?q=is%3Apr+is%3Aclosed" class="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">reviewed</a> by me, <a href="https://github.com/Dictionarry-Hub/profilarr/tree/develop/tests" class="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">tested</a> by me, <a href="https://github.com/Dictionarry-Hub/profilarr/blob/develop/docs/ARCHITECTURE.md" class="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">documented</a> by me, and <a href="/devlogs" class="text-blue-600 hover:underline dark:text-blue-400">worked through publicly</a>, by me. It is ultimately my responsibility.
      </p>

      <p>
        If something is unclear, wrong, insecure, or poorly designed, people should be able to inspect it, question it, and criticise it publicly, even if I don't like it.
      </p>

      <p>
        Open source trust does not come from whether AI touched the code. It comes from whether the system, the reasoning behind it, and the people responsible for it are visible and accountable.
      </p>
    </div>
  </section>

  <aside id="why-this-page-exists" class="mt-10 rounded-r-lg border border-neutral-200 border-l-4 border-l-blue-500 bg-neutral-50 p-4 dark:border-neutral-700 dark:border-l-blue-400 dark:bg-neutral-900/60">
    <h2 class="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Why This Page Exists</h2>
    <div class="space-y-4 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
      <p>
        This page is not here because Profilarr is special. It is here because this conversation is going to become more common.
      </p>
      <p>
        AI is not going away, and it is going to keep getting better. More developers will use it, openly or quietly, in small ways and large ones. Some of that work will be careless. Some of it will be thoughtful. Some software touched by AI will be bad, insecure, or incoherent. Some will not be. The fact that AI was involved is not enough, by itself, to tell you which is which.
      </p>
      <p>
        I think open source needs better norms around this. Not panic, not marketing, and not pretending the tooling does not exist. Just clearer disclosure, better questions, and more visible accountability.
      </p>
      <p>
        If a project uses AI, I think it is reasonable for users to ask how. I also think maintainers should be able to answer without turning the conversation into a confession booth or a sales pitch. Likewise, thoughtful and responsible work should not be dismissed as slop just because AI was part of the process.
      </p>
      <p>
        That is the standard I am trying to hold myself to here, and I hope by writing about this and spotlighting it, I encourage you all to do so as well.
      </p>
    </div>
  </aside>
</article>
