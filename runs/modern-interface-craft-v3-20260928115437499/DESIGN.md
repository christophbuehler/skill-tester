# Folio — design direction

## Three structural concepts

1. **Research studio.** A continuous graphite canvas with a compact conversation switcher at the top. A large opening question leads into one generous composer; that same object moves into a bottom dock as answers occupy the center. History unfolds directly beneath its trigger. The silhouette is a luminous headline above a substantial, soft control surface.
2. **Document light table.** Local documents occupy a horizontal central tray. Questions originate beneath the selected document, with answers growing vertically alongside its metadata. History becomes a top-level index. This places document context first, but gives document-free questions an unnecessarily indirect starting point.
3. **Conversation folio.** A full-width typographic conversation index opens into a single reading sheet. A floating circular question control expands into a writing surface in place. This makes revisiting work excellent, but hides the primary writing affordance and adds a step to starting research.

## Selected: Research studio

The skill materially changes the architecture: no permanent sidebar, no dashboard panels, no card grid of prompts. Navigation is a compact, searchable disclosure with selection and focus restoration. Manrope provides a confident 60px opening hierarchy; Geist provides 16px controls and readable answer text. Graphite, warm white, and one citron action establish the material. A 32px composer radius and circular integrated actions define the main object rather than decorative branding.

The composer remains mounted across entry and work. A position layout transition moves it into the dock without replacing the textarea. Files join the composer as named, removable objects. Send and stop share one circular footprint. Tool activity opens during work and contracts into an inspectable summary afterward; all step labels stay mounted. Copy confirms inline, interruptions retain their answer and expose retry. Reduced motion removes travel and scaling.

The entry view is intentionally spacious; populated work uses a narrower reading measure with generous bottom clearance. Mobile preserves the same top switcher, centered writing surface, and bottom dock rather than introducing a separate navigation model. All files remain local and all responses are simulated.

## Verification

Implementation verification will use the supplied TypeScript and production build commands. Browser capture and the two browser-informed refinement sessions belong to the runner; no browser observations are claimed before that evidence is supplied.

TypeScript validation passed. The production build passed using `pnpm build --configLoader runner`; the default config bundler was blocked from writing to the sandbox-protected dependency directory. Shared hook, engine, fixtures, configuration, and tests are unchanged. Browser interaction, accessibility, and visual verification remain pending runner evidence.

## Refinement 1 — supplied browser evidence

Reviewed the supplied desktop, intermediate, and mobile settled captures and the two temporal contact sheets, then reread the presentation source, contract, shared hook/fixtures, skill entrypoint, and interaction recipes. No interactive browser session or video playback was performed by the generating model. The runner reported no overflow or runtime errors, successful retry visibility after cancellation, and a visible composer under reduced motion. Those findings describe the prior implementation.

### Critique and changes

- The welcome silhouette already followed the studio direction, but the populated captures began halfway through the answer. Source inspection identified unconditional initial bottom scrolling. Saved conversations now open at the beginning; sending and retrying still follow new output, with manual scrolling able to stop following during work.
- The working composer was a smaller version of the same tall two-row box. It now becomes a compact horizontal dock: writing space and two integrated circular actions, with pending documents occupying a separate row within the same object. The broad entry well retains generous 34px geometry. The persistent wrapper animates position, the form animates geometry, and text/control children use position layout to avoid stretched glyphs. The textarea remains mounted, and its height recalculates when the mode changes. Reduced motion remains configured in both Motion and CSS.
- The desktop suggestions previously formed another full-width vertical block. They now form a small three-column typographic index beneath the primary well. Mobile retains numbered rows with at least 46px targets. This gives the entry view a more intentional broad silhouette without introducing cards or fictitious tools.
- The working question now serves as the page h1 with an expressive Manrope scale. Answer headings, full-width tables, and soft code surfaces establish a clearer reading hierarchy. Code and table overflow regions receive keyboard focus and visible focus rings, addressing the reported scrollable-region finding. This preserves every Markdown fixture string.
- Attachment removal targets are larger; the entry view can scroll when content grows. The inactive send action is quieter, reserving citron for an available decisive action. The work dock omits the redundant attachment caption while retaining its accessible label and tooltip.

### Verification and remaining judgment

`pnpm typecheck` and `pnpm build --configLoader runner` passed after refinement. The hook, fixture content, dependencies, configuration, tests, and protected entrypoint were not edited. The supplied temporal samples show the original entry/work transition and stop/retry states; partially transparent history/file frames are treated as transition samples, not settled contrast failures. The next runner capture must verify the new geometry transition, mobile dock wrapping, saved-conversation scroll position, and accessibility fixes in-browser. Spring continuity and overall balance still need that new visual evidence; no new browser pass or aesthetic score is claimed.

## Refinement 2 — the working instrument

Reread the selected skill, interaction recipes, actual presentation source, contract, capabilities, and shared hook/engine. Reviewed the supplied settled desktop/intermediate/mobile images and temporal contact sheets. The runner reports no overflow, runtime errors, or automated accessibility findings, plus successful cancellation/retry visibility and reduced-motion composer visibility. Those observations apply to the incoming version. I did not launch a browser or play the videos; sampled transparency is not treated as a settled-state defect.

The entry view has the strongest silhouette: broad writing well, expressive Manrope headline, quiet numbered suggestions, and a compact history switcher. The research view has a readable hierarchy, but its streaming interaction still resembled a conventional chat transcript. In particular, tool activity followed the expanding answer, making progress a moving target and separating it from Stop. On mobile the expanded vertical list consumed substantial reading space. The prior disclosure could not actually collapse during work because its state was always overridden by `busy`.

The main structural change places tool activity inside the persistent composer as an inset upper tray. Three parallel steps use the dock's width, with labels and honest statuses retained in the DOM. The question field and action controls sit immediately below. The tray opens automatically for a new send/retry, can be explicitly collapsed during work, and contracts to an inspectable summary at completion. Stop and progress now belong to the same instrument independently of answer length. Paused running steps say “paused”; retry still uses the unchanged hook and existing answer. The redundant inline “Thinking with you” label was removed. Graphite table/code materials bring the answer closer to the primary control's material without framing the whole transcript.

The mobile history contact sheet also suggests a displaced reveal. Source inspection found that CSS horizontal centering and Motion's vertical reveal both wrote `transform`. Horizontal centering now uses the independent `translate` property, leaving vertical travel to Motion. This is a source-supported correction; its visual result still needs runner confirmation. History and removed-file exit surfaces now become inert immediately while their short exit animations finish. Closing/reopening retains the existing presence transition. The stable textarea, keyboard controls, spring layout transition, and reduced-motion paths remain in place.

`pnpm typecheck` and `pnpm build --configLoader runner` passed. Only presentation source and this document were edited; shared logic, fixtures, protected entrypoint, dependency versions, configuration, and tests remain intact. The principal remaining uncertainty is the new tray's live expansion/contraction and mobile reading balance. Its implementation is checked by TypeScript/build, but this session has no post-change interactive browser verification or aesthetic score.
