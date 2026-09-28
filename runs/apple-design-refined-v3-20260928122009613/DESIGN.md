# Folio design exploration

## Three structural concepts

1. **The reading canvas.** A compact floating toolbar holds history and new conversation. A centered invitation and input form the welcome composition; the same input settles at the bottom during work. Conversation history opens from the toolbar. Answers occupy an unboxed, generously spaced reading column.
2. **The research desk.** A floating navigation island sits beside a document-oriented workspace. Conversation selection occupies the island, answers the main plane, and the question editor a horizontal shelf. This supports frequent switching but gives navigation too much weight for the available capabilities.
3. **The conversation sheet.** A full-width index is the starting screen. Selecting a conversation opens a large rounded foreground sheet with its own reading area and question field. This gives history strong hierarchy, but adds a navigation step before the primary action.

## Selected: the reading canvas

The Apple design skill changes the architecture, not just the colors: history is an anchored transient sheet instead of a permanent sidebar; the main reading plane has no card boundary; the composer is one continuous rounded floating object; the welcome-to-work transition moves that object into its persistent bottom position. System typography with a local Geist fallback, near-black text, a cool off-white canvas, restrained action blue, and translucent control surfaces keep the focus on document discussion.

The toolbar and history sheet share their origin and material. The composer grows with multiline text and documents. Files enter as small recognizable document objects and retain their identity in the sent message. Send and stop occupy one location. Tool steps stay visible through completion, copy feedback replaces its label in place, and conversation scroll positions are remembered. Reduced motion removes spatial animation; increased contrast and reduced transparency use opaque surfaces. This is a web interpretation, not native Liquid Glass.

## Behavior and verification

The shared useChat hook remains the sole owner of conversation, response, and attachment behavior. Plain Enter sends; Shift+Enter inserts a line break. The hook intentionally clears attachments on conversation changes; presentation preserves textual drafts between conversations through setDraft. No remote assets or services are used.

Verification: `pnpm typecheck` passed. The default build encountered a sandbox restriction writing Vite’s temporary config into the shared dependency directory; `pnpm build --configLoader runner` passed without configuration changes. Browser launch and the two browser-informed refinement sessions belong to the runner; no browser evidence is available in this implementation pass.


## Refinement 1 — supplied browser evidence

Reviewed the supplied settled desktop, intermediate, and mobile screenshots, the two temporal contact sheets, and the runner's observations. The initial canvas and floating history are consistent with the chosen direction, but the composer retained its large welcome form in the working view. On mobile it consumed scarce reading height. The work surface consequently felt less considered than the empty state. The composer wrapper also relied on an auto-margin change, which is not a reliable spatial transition. Small secondary text was too faint, and the activity panel's disclosure arrow suggested an interaction that did not exist.

Changes made:
- The same stable editor now has two functional postures: a generous welcome surface and a compact working dock. In work, attach and send/stop sit on opposing 44px circular controls with the expanding multiline field between them; documents occupy a full-width shelf above. This recovers reading height without losing attachment or interruption actions. Focus gains a clear continuous outline.
- Motion now measures the composer wrapper's position and the form's size. The textarea uses position-only layout correction to avoid stretching its text. The welcome and working states keep the same input node, with the existing reduced-motion preference honored. Existing history exit inertness and attachment presence transitions remain.
- Activity uses three legible progress segments and a completed-step count, driven solely by the supplied tool states. Removed the false disclosure affordance. Completion retains the same panel structure and footprint.
- Increased secondary-label contrast, slightly increased metadata sizes, retained a 16px mobile answer body, and enlarged suggested-prompt and attachment-removal targets. The first user question is now the visible h1; code blocks accept keyboard focus for horizontal scrolling. Short welcome viewports can scroll when the available height contracts.

Verification: `pnpm typecheck` passed. The standard `pnpm build` was blocked by the existing sandbox restriction on Vite's temporary config in node_modules; `pnpm build --configLoader runner` passed. Shared hook, fixtures, dependencies, configuration, and tests were not edited. No interactive browser was launched by this model. The supplied captures establish the original issues, not the success of the changed rendering; the next runner session should verify dock sizing, contrast, and spatial continuity. Partially transparent contact-sheet frames were treated as intermediate motion samples, not settled contrast failures. Full-video smoothness and actual software-keyboard behavior remain unverified.

## Refinement 2 — stable control geometry and reading hierarchy

Re-read the selected Apple skill, its design-language reference, the contract, capabilities, shared hook/fixtures, and presentation source. Reviewed all ten supplied images and the runner observations. The settled views show a coherent floating toolbar and an unboxed reading canvas; there is no reason to replace that navigation model. The important remaining defect is temporal: sampled send frames show a tall/narrow action and a disclosure crossing the activity region. Source inspection identifies nested wrapper/form layout transforms and a measured action wrapper changing to `display: contents`. These samples do not prove how every intervening frame looks, and partial opacity during history dismissal is not a settled contrast defect.

The primary control has been structurally revised. Both postures now use one three-column grid, with direct, individually position-corrected attach and send/stop controls. The welcome editor spans the grid above the actions; the working editor occupies the space between the same circular actions. Only the form measures its traveling geometry. The wrapper containing invitation, suggestions and privacy text no longer travels as one large object, removing that source of crossing content and compounded scale. The textarea stays mounted. Attachments have shared document layout identities between draft and message. Main curves use related 28–34px radii and consistent control insets.

The populated mobile hierarchy previously spent excessive vertical space on the question and response attribution. Tightened those sections while retaining comfortable answer line height, increased table text from 11px to 12px, and kept the reading region separate from the dock with a narrow edge fade. Tool stages now give each mobile icon and label a deliberate two-row alignment. Paused activity uses a pause symbol, and its unfinished step stops spinning. Status changes are announced politely. Copy, retry and document removal receive 44px targets. Reduced transparency also explicitly makes the composer opaque.

The runner reported no overflow, runtime errors or automated accessibility findings in the supplied version, and confirmed visible retry and reduced-motion composer states. Those results are evidence for the pre-refinement implementation only. This model did not launch or interact with a browser. `pnpm typecheck` passed after the final source edits. `pnpm build` encountered the existing sandbox restriction writing node_modules/.vite-temp; `pnpm build --configLoader runner` passed without configuration changes. No shared behavior, fixture, dependency, test or protected entrypoint was changed. Full-speed motion, software keyboard behavior, and the revised layout at real viewport sizes remain for runner verification; no visual score is claimed.
