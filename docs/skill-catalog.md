# Skill catalog and selection

Audited 28 September 2026. The [machine-readable audit](skill-source-audit.json) records immutable upstream commits, resource inventories, licenses, source links, and compatibility findings. Directory descriptions were checked against the actual source; no global `npx skills add` installations were used. The [ADHX post](https://adhx.com/kail_designs/status/2102265246325047711) was verified in the browser after the reader fetch failed; its visible text lists the same ten skills. Its video was not reviewed.

## First v4 candidate: Considered

**Folio / Considered** uses five skills in this order:

| Skill | Job in this combination | Concrete guidance worth testing |
|---|---|---|
| [Frontend Design](https://github.com/anthropics/skills/tree/33375500bcea98d610eb30ce10ac4e59b89c390d/skills/frontend-design) | Composition, typography, useful copy | Spend visual boldness in one place; remove labels that do not help someone act; choose a product-specific structure. |
| [Emil Design Engineering](https://github.com/emilkowalski/skills/tree/d16ebe60d09a5ba2afcb7054ede9d0a10c9f6128/skills/emil-design-eng) | Interaction decisions and implementation detail | Frequent keyboard actions should be immediate; occasional surfaces can animate from their trigger; transitions must survive interruption. |
| [Beautiful Shadows](https://github.com/MengTo/Skills/tree/798db0a3ee4429ac8ed6bc5f4a59b6d45e7a914d/agent-skills/web-design/beautiful-shadows) | Limited functional elevation | Layered neutral shadows separate floating controls without raising every transcript element. Move color constants into semantic tokens to honor the benchmark requirement. |
| [Accessibility](https://github.com/addyosmani/web-quality-skills/tree/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/accessibility) | Keyboard, focus, names/states, motion alternatives | A visually closed surface must stop owning focus and interaction. Automated findings supplement manual checks. Use WCAG's actual text-size thresholds, not the skill's px/pt typo. |
| [Nested Geometry](../skills/nested-geometry/SKILL.md) | Measurable shape relationships | Derive child curves from the parent radius minus the actual border-box inset. A circle tucked into a corner must share its center, or be deliberately separated. |

This is a fit judgment, not a measured ranking. A self-reported decision ledger is not causal proof. Each generated DESIGN.md records real alternatives and changes; screenshots, source and interaction recordings let readers check the claims.

## Selected next direction: Studio

The first candidate was stopped after its rendered review because it remained conventional; see [the recorded assessment](folio-v4.md). `studio-v4` replaces its two broad leads with **Modern Interface Craft / Light** and the actual **Apple Design (Emil Kowalski)** skill, retaining Beautiful Shadows, Accessibility and Nested Geometry. The custom light skill supplies a specific composition and compact input; Apple supplies spatial continuity. All five are pinned and explicitly loaded in a fresh workspace. The first candidate remains preserved as interrupted, not silently replaced.

## All requested skills

| Registry ID | Status and reason |
|---|---|
| `frontend-design` | Available; visual lead in the interrupted Considered candidate. Existing exact pin retained. |
| `apple-design-emil` | Available; the actual Emil Kowalski upstream. Selected for Studio spatial behavior; not combined with Emil Design Engineering to avoid overlapping motion frameworks. Distinct from the older independent `apple-design` skill. |
| `beautiful-shadows` | Available; selected for narrow surface craft. |
| `accessibility` | Available; selected for operability. |
| `design-review` | Catalogued, blocked from generation. Audited upstream instructs silent usage telemetry, home-directory identity storage, and optional license lookup/remote artifact uploads. None was executed. MIT declared by upstream, but no license file was found. Use local review instead. |
| `emil-design-eng` | Available; motion lead in the interrupted Considered candidate. |
| `shadcn` | Catalogued, blocked for this starter. It requires its real component/configuration/registry ecosystem and online CLI/docs. Reading the skill alone cannot supply that ecosystem; a dedicated shared starter is needed for a faithful experiment. |
| `adapt` | Supported alias/mode of current Impeccable. Registration resolves it to the unified skill and records the explicit Adapt reference instruction. It is not a separate upstream SKILL.md at this revision. |
| `better-interface` | Available with six explicit pinned sibling skills: accessibility, layout, writing, typography, colors, UI. Registration expands dependencies and the chooser displays them. An APM probe proved installing only the coordinator loses those references. Excluded here to avoid seven extra overlapping voices; useful for a dedicated review profile. |
| `interaction-design` | Available; excluded because Apple Design already supplies the Studio motion framework. Its examples need translation from framer-motion imports to the supplied motion/react package. |
| `web-design-engineer` | Available; excluded because its interactive approval/v0/Tweaks workflow and inline/CDN prototype assumptions do not fit this autonomous bundled app experiment. The brief would override those conflicting workflow choices. |
| `impeccable` | Available, includes Adapt. A credible alternative lead, rather than an extra layer atop Frontend Design. Its launcher has a documented reference fallback in this offline environment. |
| `ui-ux-pro-max` | Existing available profile retained. Not selected: the broad style database would add another art-direction source without a distinct job in this combination. |
| `modern-interface-craft-v3`, `apple-design-refined` | Historical custom directions retained without hidden influence. A newly pinned `modern-interface-craft-light` revision supplies the Studio direction. |

All upstream instructions remain at their original pinned source. APM fetches them for the requested profile. The repository does not silently rewrite unsafe or incompatible upstream skills and claim the original was used. Blocked packages fail registration/preflight with their reason. Registering a package is distinct from generating a sample.

## New common requirements

Folio v4 uses the same headless behavior, blank starter and offline dependencies, but a revised brief: light by default, semantic Tailwind color tokens, decision provenance, and no prescribed navigation/composer layout. Any optional dark canvas must be OLED black. The model remains `gpt-6-astra`; reasoning is raised from medium to xhigh. Implementation/refinement/repair time limits remain 30/10/10 minutes, with two refinements and at most one objective repair.

Every implementation and refinement is a fresh ephemeral CLI session in an isolated temporary workspace. It receives the brief, source from its own attempt, its selected skills and (for refinement) captured evidence. It receives no parent conversation, other variants, memory or unrelated plugins/skills. Human coordination and source research happen outside that workspace. Old runs are immutable and remain viewable. Cross-version comparisons change more than skill selection and are labelled accordingly.

## Commands

```sh
pnpm generate studio-v4 --preflight
pnpm generate studio-v4
pnpm generate apple-design-emil-v4
pnpm run profile add my-combination frontend-design apple-design-emil nested-geometry
(cd profiles/my-combination && apm install)
pnpm generate my-combination --preflight
pnpm generate my-combination
```

The eight new individual profiles have APM lockfiles and passed exact-pin, entrypoint-count and required-resource checks. This verifies installation completeness, not generated UI quality. Only requested combinations/samples are generated; adding a skill does not generate ten new interfaces automatically.

## Quiet direction and motion profile

- [Modern Interface Craft](../skills/modern-interface-craft/SKILL.md) now incorporates the user's quieter Folio preference: a placeholder-led resting state, contextual actions, pure-white canvas, soft neutral input tone and moderate related corners. Existing published profiles keep their historical pins; this update does not silently alter their output.
- [Motion Storytelling](../skills/motion-storytelling/SKILL.md) is a new original adaptation of the user-supplied motion-guide screenshot. It is model-independent, with causal scene planning, object continuity, narration/caption timing and complete-deliverable review. The handcrafted paper aesthetic is optional. Its [brief template](../skills/motion-storytelling/references/brief-template.md) is reusable outside this repository. For a UI combination, apply its interaction-continuity principles without importing a film, narrator or mascot.

The `quiet-v4` profile pins both sources at `046ff46b275cb8aa8414741ad938f912098df872`. It combines Modern Interface Craft / Quiet, Apple Design (Emil Kowalski), Accessibility, Nested Geometry and Motion Storytelling. Beautiful Shadows is omitted because this direction favors flat tonal surfaces. APM resource and fresh-session isolation preflight passed with exactly these five skills. Existing Studio runs retain their historical sources; generation outcomes are recorded separately in run metadata.


## Direct navigation and restrained typography

`direct-v4` retains the Quiet combination's four specialist pins and selects Modern Interface Craft / Direct at `2677ddd7d3b0fd7ccd4290909a0e4868bc1ef791`. It updates the visual lead in response to user review: normal UI titles/descriptions share size and medium weight, secondary tone carries the distinction, and repeated conversation switching gets a persistent desktop rail. Mobile history can collapse for space. The quiet composer and moderate geometry remain. Older profiles and outputs are unchanged.
