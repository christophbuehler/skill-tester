# Folio design exploration

## Three structural concepts

1. **Reading room — selected.** An uninterrupted bright canvas, a compact floating navigation pill, and a centered reading column. The generous composer begins beside the welcome invitation and settles into a bottom working dock. History unfolds from the top control; mobile turns it into a sheet. This gives questions and documents the greatest visual priority.
2. **Document desk.** A two-pane document/context workspace with conversation in a narrower adjoining column and the composer attached to that column. Strong for inspecting source documents, but the supplied capabilities do not include a document viewer: that structure would promise unsupported work.
3. **Conversation atlas.** A full-screen collection of conversations with an expanding selected conversation and inline question entry. Strong for revisiting a large library, but adds a navigation step before the primary task and makes a small conversation collection overly prominent.

## Concrete skill decisions

The apple-design skill selects the reading room, removes the permanent sidebar, and reserves material and shadows for floating controls. The reading canvas is opaque and unframed. Near-black system/Geist typography, restrained action blue, generous 28px control curves, and a carefully spaced wordmark establish hierarchy. Suggestions are simple text actions rather than dashboard cards. A spring-driven composer position, measured textarea expansion, attachment presence/layout, and an origin-anchored history reveal make state changes spatially understandable. Send becomes stop in the same circular location. Completed tool activity retains its labels in place; copy feedback uses the same control.

## Behavior and accessibility

One shared useChat instance owns conversations, messages, attachments, and work. Markdown uses GFM. Navigation remembers reading offsets and restores text drafts via the hook setter; the hook's attachment reset behavior remains intact. History supports Escape, focus entry/return, and a focus trap. Controls have contract labels, visible keyboard focus, touch-sized targets, and reduced motion/transparency/contrast alternatives. Local-only files and simulated responses are disclosed.

## Verification

Implementation will be checked with TypeScript and a production build. Browser capture and the two browser-informed refinement sessions are runner-provided; no local browser workaround is attempted.

Verification result: `pnpm typecheck` passed. `pnpm build` was attempted but Vite could not write its temporary bundled configuration into the sandbox-protected `node_modules/.vite-temp` directory (EPERM), before application compilation. No package/configuration changes or sandbox workaround were made. Browser captures and refinement evidence have not yet been supplied, so visual and interaction verification remains pending the runner.


## Refinement 1 — supplied browser evidence

I reviewed the supplied settled desktop, intermediate, and mobile screenshots, interaction contact sheets, and browser observations, then re-read the skill, its design-language reference, the contract, shared hook/engine, and presentation source. I did not launch or interact with a browser. The contact sheets show samples of motion, not enough evidence to claim smooth playback; partially transparent transition frames are not treated as settled contrast failures.

### Shortcomings

- The entry view was mostly a large centered invitation. Its typography and spacing felt closer to a landing page than the populated reading room.
- The working input retained its entire welcome height even when empty. On mobile and intermediate screens this spent too much of the viewport on unused input space while the answer and table were out of view.
- Conversation identity scrolled out with the response. The title and oversized top spacing also delayed access to the actual exchange.
- Mobile table cells split “Onboarding” and “Owner” into fragments. Code could scroll but was not keyboard focusable.
- Secondary labels were too small and low contrast. The report confirmed actual contrast failures on settled material backgrounds.

### Implemented decisions

The welcome is now an aligned introduction to the same reading column, with a compact 36–42px title, direct workspace language, and readable text suggestions. It retains the expansive content plane without the centered promotional headline. Suggestions remain simple actions with 44px targets.

The composer is now an adaptive control: the welcome surface provides a generous writing area and labeled attachment action; entering a conversation draws it into a compact bottom capsule with attachment, expanding text, and send/stop aligned on one row. The shell uses layout motion, while the textarea and control group use position-only layout to avoid stretching their contents. The same textarea remains mounted. Pending attachments occupy an expanding upper shelf, and file objects have shared layout identities between draft and sent message. Curves and control insets are related, with optional continuous-corner enhancement and a normal radius fallback.

A compact conversation heading stays above the single scrolling reading region. The working composer recovers roughly 80px of vertical reading space before text expansion. Body text is now 16px; supporting labels are larger. Tables use a keyboard-focusable horizontal region and a readable minimum width, rather than breaking short labels. Code blocks and the reading area accept keyboard focus. Muted text uses a darker slate consistently, and removal/copy/navigation targets have been enlarged.

Tool activity keeps its allocated space and labels as it resolves; the three steps use a stable grid so status changes do not rearrange them. Existing focus management, reduced-motion handling, opaque material alternatives, interruption/retry, and scroll-context restoration remain. The shared hook, fixtures, protected entrypoint, dependencies, and configuration are untouched.

### Verification and remaining uncertainty

`pnpm typecheck` passed after the structural changes. `pnpm build` again stopped before application compilation because the sandbox denies Vite writing its bundled config to `node_modules/.vite-temp` (EPERM). No sandbox workaround was attempted. The supplied observations reported no runtime errors or page overflow and confirmed retry/reduced-motion availability for the earlier version; these are not claimed as verification of this revision.

The next runner session should inspect the compact composer's welcome-to-work movement, file-object transfer, viewport/keyboard resizing, new mobile table scrolling, and settled contrast. The source changes address the reported findings, but a new browser accessibility run is still needed to confirm them. Continuous-corner rendering varies by browser, so the design must also be assessed with its radius fallback.

## Refinement 2 — a persistent writing instrument

Reviewed the second supplied desktop, intermediate, and mobile captures, both temporal contact sheets, and the accompanying observations. Re-read the selected skill and its reference, presentation source, contract, capabilities, and shared implementation. This was source and supplied-image inspection, not interactive browsing or video playback. The new report found no runtime errors, page overflow, or automated accessibility findings at any of its three widths; cancellation exposed retry and reduced motion retained the composer.

### Critique and changes

The reading plane and on-demand navigation already express the selected direction. The main unresolved structural problem was the input: welcome used a full-width text field above a labeled button row, while work substituted a different attachment button and a three-column capsule. Sampled transitions exposed this change of structure. The control now uses one persistent three-column composition in both states: attachment, multiline draft, and send/stop. Welcome grants the text more vertical room; work contracts it to one line until the draft grows. The same attachment button stays mounted, with its accessible label and file-limit tooltip. Attachments occupy an expanding full-width shelf above the writing row. This makes the primary action a single adaptable instrument and recovers some entry-view height on mobile.

The optional squircle rendering produced flatter-looking shells than the intended generous rounded silhouette in the supplied captures. Main input, history, file objects, and user messages now use explicit round corners, with 33–36px input radii around 44px circular actions. The bright content plane, restrained typography, and limited material remain deliberate; no new dashboard regions or decorative surfaces were added.

Work activity previously read as a tight row of tiny checkmarks, especially on mobile. Its three stages now have fixed numbered markers that become checks in place. Mobile places labels below their markers in three stable columns; desktop keeps them beside the markers. Space remains allocated through running, paused, and completed states. This supports readable progress without animating Markdown paragraphs. The mobile history sheet now enters from below its bottom anchor rather than inheriting the desktop popover's upward offset. Dismissal reverses the same animation, with existing reduced-motion and focus handling retained.

### Verification and limits

`pnpm typecheck` passed. `pnpm build` remains blocked before compilation by EPERM when Vite writes its temporary config into the protected `node_modules/.vite-temp` directory. No dependencies, configuration, hook, fixtures, tests, or protected entrypoint were changed, and no sandbox workaround was attempted.

The supplied clean accessibility/overflow report describes the incoming version, not this final revision. Final geometry, mobile placeholder wrapping, attachment transfer, and motion continuity still require runner verification. Contact sheets establish sampled states only; they do not establish smoothness or reveal all intermediate frames. The final input intentionally uses an icon-only attachment action with an exact accessible name and tooltip; this trades the prior visible label for persistent geometry across welcome and work.
