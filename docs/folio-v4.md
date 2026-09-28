# Folio v4: source selection and design judgment

This round responds to a concrete failure of the earlier results: similar shells, generic copy, arbitrary corner relationships and little useful interaction craft. The new shared brief is layout-free, light by default, and requires semantic Tailwind color tokens and an honest design decision ledger. The model is still gpt-6-astra, with xhigh reasoning; old medium-reasoning runs are different experiments.

## Source and workflow changes

The [skill catalog](skill-catalog.md) and [source audit](skill-source-audit.json) distinguish current upstream entrypoints from directory descriptions, aliases and unavailable workflows. Eight new upstream individual profiles have exact APM lockfiles and verified resources. The subsequent light revision and Studio combination are also locked; all 24 profile manifest/lock pairs were checked against the registry. Better Interface requires seven explicit skill bundles. Adapt is an Impeccable mode. Superfuture Design Review is blocked because the audited source includes silent telemetry and optional remote review uploads; none was executed. Shadcn is blocked for the current bare offline starter because its real component/registry tooling is absent.

The new geometry skill uses actual border-box offsets and clamped used radii; its [paired authoring checks](nested-geometry-evaluation.md) did not show an arithmetic advantage over baseline. The comparison chooser lists every enabled skill, including dependencies, supports keyboard/mobile selection, and aligns both preview canvases even when one skill list is longer. Color literals in the comparison shell are centralized in semantic tokens.

## First candidate: Considered

Run `considered-v4-20260928130912761` selected Frontend Design, Emil Design Engineering, Beautiful Shadows, Accessibility, and Nested Geometry. It read every selected entrypoint and used a fresh isolated workspace. One objective repair corrected a focusable skip link that obstructed the mobile history control. Its final completed typecheck, build, browser acceptance and semantic-color checks passed.

The initial render still used a tinted permanent sidebar, a framed top strip and a large empty textarea with a separate toolbar. Geometry and implementation detail improved, but this did not satisfy the requested product direction. More generic design guidance was not enough to change the silhouette. The coordinator stopped the first refinement process after reviewing the real screen rather than spend two full refinement sessions on the weaker direction. The runner imported the interrupted run as failed with its source and captured evidence intact. `refinementCount: 1` records a started session, not a completed refinement. The process exit in metadata is the deliberate interruption, not an unexplained application failure.

A separate, editable `reviews/assessments.json` explains this curation decision in the gallery without altering the immutable run record. This attempt was not silently deleted, hand-polished, or rerolled under the same ID.

## Second candidate: Studio

The revised Modern Interface Craft / Light skill owns composition: one open work surface, useful left alignment, contextual history, a compact expanding primary input, and typographic identity without an arbitrary document logo. The actual upstream Apple Design skill owns spatial continuity and interruption. Beautiful Shadows, Accessibility and Nested Geometry retain their narrower roles. This is a five-skill combination, not an activation of every audited skill.

Studio starts again from the identical blank starter and common v4 brief, without the first candidate, this conversation or the coordinator's review in its context. The changed direction is supplied by the pinned skill profile, which is recorded separately from the task prompt. Its same-generation refinements receive their own source and browser evidence. The earlier dark custom skill remains available at its historical commit.

The two candidates have the same intended budgets, but the first was deliberately stopped early. They are not a controlled completed-run comparison, and changing both lead skills cannot isolate either skill's causal contribution. This remains a qualitative showcase. Generation has no live browser inside its sandbox: the runner supplies settled screenshots, contact sheets and objective observations, followed by coordinator interaction review. No automated test certifies exceptional taste or physical-device keyboard behavior.


### Observed refinement, not just a rationale

The initial Studio source passed typecheck/build but failed the shared mobile-width assertion: the research view could widen a 390px viewport to 433px. Its single objective repair set the outer grid column to `minmax(0, 1fr)`, preserving local content scrolling instead of hiding overflow. The host then passed all five isolated interaction tests.

The first browser-informed refinement changed concrete behavior: resuming a populated conversation focuses the reading region rather than the input; the textarea focus indicator follows the composer boundary; scrolling code blocks are named keyboard targets; Markdown renderer identity stays stable during streaming; retry restores focus to a persistent region. It also replaced the all-caps question label and reduced mobile supporting chrome. The second capture pass reports no runtime errors, no horizontal overflow in its eight settled states, and no axe findings at desktop, intermediate or mobile widths. These are bounded observations, not full accessibility conformance or an aesthetic score. The final refinement produced further source improvements but exceeded its ten-minute session limit; the immutable run is failed with `refinement-2 timed out`. Its completed build is not represented as a successful run.


## Curated follow-up and remaining review findings

The coordinator's live 390 × 844 review found a defect outside the horizontal-overflow checks: a visually hidden copy-status label extended the outer document to about 1154px, allowing the entire app to scroll as well as the transcript. Short mobile table words also broke unnecessarily, and source inspection found the final pending attachment unmounted its presence manager before the exit finished.

A **curated follow-up** uses the same fresh-context isolation, exact profile, protected shared behavior and validation, but starts with the imported Studio presentation. It has a new run ID, records its parent source hash and the [exact coordinator review](../reviews/studio-followup.md), and receives one additional ten-minute review session. This is deliberately not a fresh blank-starter benchmark or an equal-budget skill comparison. Both earlier attempts remain immutable and visible. The comparison labels the follow-up and exposes its instructions. Parent integrity/profile/benchmark checks reject changed evidence or unrelated inputs.


### Published candidate: Folio / Studio / Reviewed

Run `studio-v4-20260928140944200` passed all host validation (typecheck, production build, shared browser acceptance and semantic-color audit). Its one curated review took 381,215ms and used no objective repair. All five selected skill entrypoints have successful read evidence, with isolation preflight passing. The final captured desktop/intermediate/mobile states report no axe findings, horizontal overflow or runtime errors.

Live coordinator review confirmed a 390 × 844 viewport now has an 844px document, and Continue reading moves only the transcript (`window.scrollY` stays zero). Short table headers and identifiers remain intact. Switching away and back restores the prior reading position and focuses the conversation. The final attachment's presence manager remains mounted; removed controls become inert immediately and focus returns to the persistent input. The composer measures 64px high with 32px outer corners, a 44px circular control and exactly 10px right/bottom insets. That arithmetic also has a browser regression check.

The design decision ledger identifies where guidance changed the result and where it merely confirmed an existing choice. The important qualitative lesson from this round is that stacking broad skills did not establish a strong composition. One explicit visual lead plus narrower interaction, accessibility, shadow and geometry roles produced a more coherent direction, and rendered review found problems the general guidance and basic tests missed. This is an observation from these attempts, not a causal skill ranking or proof of exceptional taste. Physical-device keyboard behavior and full accessibility conformance remain unverified.


## Quiet composer follow-up

The `quiet-v4` profile replaces Studio's earlier lead skill with Modern Interface Craft / Quiet and adds Motion Storytelling. Apple Design (Emil), Accessibility and Nested Geometry remain; Beautiful Shadows is omitted for this flat tonal direction. Both new skill sources are pinned at `046ff46b275cb8aa8414741ad938f912098df872`.

The blank-starter attempt `quiet-v4-20260928145250608` used one objective repair to move the focused skip link clear of navigation. All five initial host acceptance tests then passed. Its first refinement implemented mobile table fitting, readable thread titles and reading/recovery focus changes, but exceeded the ten-minute limit. It remains failed, immutable and visible.

The curated follow-up `quiet-v4-20260928151936526` preserves that parent and records [the coordinator review](../reviews/quiet-followup.md). It passed typecheck, build, shared acceptance and semantic-color checks with one additional refinement and no repair. Total follow-up time was 261,571ms. All five skill entrypoints have recorded read evidence. Final host captures report no horizontal overflow, runtime errors or axe findings at the three tested widths. This is a curated result, not an equal-budget fresh benchmark.

The resulting input has a soft gray surface on white, a stronger placeholder without an ellipsis, no idle send/attach controls, and a 20px parent radius with 12px controls at an 8px inset. Focus reveals attachment access; a valid submission reveals Send. The follow-up removed persistent file-help copy, deferred reading focus until conversation rendering, and retained scroll-following through completion and composer resizing. Real-device mobile keyboard behavior remains unverified.

Coordinator browser checks at 1440 × 1000 and 390 × 844 confirmed that idle Attach/Send are hidden, keyboard focus reveals Attach, Tab reaches it without collapsing the composer, a draft reveals Send, and selecting existing work focuses the reading region. Document dimensions matched each viewport with no outer-page overflow.
