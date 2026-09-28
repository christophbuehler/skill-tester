# Research and provenance

## Scope

Original skill by the Skill Tester project, created 2026-09-28 for a preference for very modern, clean, creative, responsive interfaces with purposeful motion and microinteractions. It is not affiliated with or endorsed by Designeer or any listed creator.

The [Designeer directory](https://designeer.xyz/) exposed 422 resources across 17 sections. We also followed its separate [Components](https://designeer.xyz/components), [Build](https://designeer.xyz/build), [Visuals](https://designeer.xyz/visuals), [Utilities](https://designeer.xyz/utilities), and [Design Engineers](https://designeer.xyz/designers) pages. The deduplicated outbound inventory contained **555 URLs**, including designer homepages and the sponsor. Social footer and internal legal/navigation links were excluded.

Every inventoried URL was requested: **454 yielded readable text, 64 only limited client-rendered shells, and 37 were blocked or unavailable**. This is a breadth-of-research audit, not 555 visual usability reviews. Access status describes this research session, not whether a site works for everyone. Full per-URL status and original notes are in `source-audit.json`. Raw HTML and long extracts remain local and are not distributed.

Most coverage was direct HTTP text inspection. It can reveal component taxonomies, documentation, interface labels, and stated design intent; it cannot prove appearance, touch usability, animation quality, or performance. We did not sign in, bypass paywalls, recursively crawl every gallery entry, install listed tools, or copy their designs/assets.

## Rendered spot checks

The following were additionally inspected in the Codex browser:

- **Designeer:** rendered directory structure and full accessibility inventory; its read-only WebMCP section inventory confirmed the 17 sections and counts.
- **[Details](https://www.details.so/inspo):** inspected category and reference structure. Several embedded media examples could not play; no conclusions about their animation quality were drawn.
- **[Appllama loading buttons](https://loader-buttons.appllama.io/):** inspected the rendered compact two-column collection and its status labels; activated Pause motion and observed the control become Play motion. This supports providing motion controls; it does not establish reduced-motion conformance or loader performance.
- **[UI Labs](https://www.uilabs.dev/):** inspected its restrained dark experiment layout and opened the two-step popover. A contextual menu appeared and focus moved to its first action. No approval or other consequential action was submitted. Its accompanying warning about unstable tag positions informed the spatial-stability guidance.
- **[UI Playbook motion](https://uiplaybook.dev/play/motion):** read the actual motion article, including purpose, continuity, CSS versus spring tradeoffs, and preference-aware motion. The skill's sample timings are original starting values, not measurements of these sites.

These are spot checks at the available browser size, not a responsive certification of the reference sites.

## What became guidance, and why

| Research thread | Sources inspected | Original synthesis used in the skill |
| --- | --- | --- |
| Whole pages versus task flows | [Mobbin](https://mobbin.com/), [SaaSFrame](https://www.saasframe.io/), [Navbar Gallery](https://navbar.gallery/), [Sections](https://sections.wtf/) | Choose references at the same granularity as the problem; a hero image does not specify an application's error or recovery state. |
| Visual hierarchy and typography | [Refactoring UI](https://refactoringui.com/), [Practical Typography](https://practicaltypography.com/), [Interfaces](https://interfaces.dev/), [Utopia](https://utopia.fyi/) | Start with grouping, actual text and optical balance; use fluid constraints and a small token vocabulary rather than a mandatory typeface or palette. |
| Motion as state communication | [UI Playbook](https://uiplaybook.dev/play/motion), [UI Labs](https://www.uilabs.dev/), [60fps](https://60fps.design/), [Learn UI](https://learn-ui.com/) | Name the trigger, relation, settled state and interruption behavior. Preserve target position and task continuity; an attractive experiment still needs usability checks. |
| Small details and feedback | [Detail](https://detail.design/), [Design Spells](https://designspells.com/), [Appllama](https://loader-buttons.appllama.io/), [NumberFlow](https://number-flow.barvian.me/) | Keep labels and geometry stable during updates; acknowledge real completion, provide sensory alternatives, and avoid invented progress. |
| Accessible behavior underneath style | [Inclusive Components](https://inclusive-components.design/), [Base UI](https://base-ui.com/), [Radix](https://www.radix-ui.com/), [web.dev](https://web.dev/) | Semantics, focus, input modality and component state belong in the design itself. A library or visual reference does not prove the final implementation is accessible. |
| Creative composition | [Minimal Gallery](https://minimal.gallery/), [Hover States](https://hoverstat.es/), [Codrops](https://tympanus.net/codrops/), [Folios](https://folios.gallery/) | Build a coherent identity around one content-relevant idea; distinguish exploratory expression from frequent operational controls. |
| AI interaction and user agency | [Shape of AI](https://www.shapeof.ai/), [GoodUI](https://goodui.org/) | Make progress, context, interruption and recovery clear. Separate preference from measured outcomes; do not claim a design improves conversion or usability without relevant evidence. |

This table is interpretive synthesis, not a statement that every source endorses every instruction. Directory entries outside the UI-design scope were visited for coverage but did not become mandatory tools or runtime dependencies. No single site's brand, layout, proprietary code, or paid teaching material is bundled.

## Skill creation method

Used the user-requested [Anthropic Skill Creator](https://github.com/anthropics/claude-plugins-official/blob/fa59bc9037741ecfa131aa27938272605710d7b2/plugins/skill-creator/skills/skill-creator/SKILL.md), revision `fa59bc9037741ecfa131aa27938272605710d7b2`: intent → research → concise draft with progressive references → two representative task prompts → paired with/without-skill prototypes → objective checks and its supplied review viewer. Evaluation artifacts are kept outside the installed skill package, with a committed summary when available. No claim of statistically reliable quality improvement is made from this small sample. Description optimization is optional and was not run.

The evaluation uses fresh Codex subagents, not Claude's CLI. These authoring checks are separate from the rigorously isolated Folio benchmark runner and must not be presented as Folio results.

## Attribution and reuse

The skill and its original prose/code examples use the included MIT license. Linked sources retain their owners' rights and licenses. Links and concise paraphrased observations provide attribution; they do not license copying a reference site's artwork, branding, or implementation. The source audit is a dated snapshot and should be refreshed if its findings are used as claims about a source's current behavior.
