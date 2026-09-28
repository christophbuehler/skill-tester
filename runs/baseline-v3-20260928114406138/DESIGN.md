# Folio design exploration

No design skills are selected. These directions use only the shared brief and behavioral contract.

## Three structural concepts

1. **The reading room.** A permanent narrow conversation index sits beside a single reading column. The empty state is an editorial opening page with a large question and an integrated writing surface; during work, that surface docks below the transcript. Tool activity becomes a compact progress strip in the reading flow. A warm paper canvas, serif display type and precise sans-serif controls convey thoughtful research.
2. **The research desk.** A horizontal conversation switcher sits above a split workspace: documents and the composer on the left, answers on the right. Activity occupies the seam between the two panes. Strong document context, but dividing the screen reduces the space available for long Markdown and makes mobile adaptation less direct.
3. **The conversation ledger.** A full-width chronological notebook with an expandable table of contents, numbered questions, and inline composers between answer sections. A compact top navigation frees the entire screen for reading. Distinctive as an archive, but the location of the next question and active work is less predictable.

## Chosen: the reading room

The reading room best balances revisiting conversations, focused multiline writing, and long-form reading. The navigation is a 260px warm-gray index with an orange active marker, a custom typeset Folio wordmark, and simple conversation rows. The main canvas is ivory, with dark olive-black text. The opening uses a large system serif headline; locally bundled Geist handles all working text. The composer is a generous white writing surface with a fine border, an attachment shelf, and a solid ink send button. Prompt suggestions are ruled text rows, not cards.

In a conversation, the question becomes a compact editorial entry and answers retain a generous reading measure. The composer docks to the bottom without replacing its input node. Live work gets a status dot, explicit tool steps, and a stop control in the send position; interrupted work retains the partial answer and exposes retry. Copy provides visible confirmation. Motion is brief and directional, with reduced-motion support. On small screens the conversation index becomes an accessible modal drawer and the reading area uses the full width.

## Skill impact

None: no selected skills. Layout, typography, materials, navigation, and motion are original baseline choices, not inherited theme decisions.

## Verification

TypeScript check passed. Production build passed with `pnpm build --configLoader runner`; the default Vite loader could not write its temporary config inside the sandboxed node_modules location. No configuration changes were needed. Shared hook, fixtures, package versions and configuration remain untouched. Secondary text contrast was strengthened during source review. Browser launch is runner-owned; no browser evidence or refinement sessions were available during this implementation, so visual and interaction checks are not claimed.

## Refinement 1 — supplied browser evidence

Reviewed the supplied settled desktop, intermediate and mobile captures and both temporal contact sheets against the source, contract and shared package. No skills are selected. The reading-room concept remains the direction: its quiet index, serif opening and single reading column are coherent, but the first implementation treated the populated workspace as secondary to the welcome page.

Concrete shortcomings:
- Settled research captures began halfway through the answer at intermediate and mobile widths. The source unconditionally scrolled to the bottom on initial render and conversation changes, losing both the question and answer heading.
- The follow-up composer retained the empty-state height, reserving too much of a mobile viewport for blank input. Its attachment action and stop icon were small, and the toolbar lacked a clear relationship to the writing surface.
- Reading text, tool steps, file metadata and copy controls were too small. Several muted labels failed the runner's contrast check. Conversation states had no level-one heading.
- The composer changed location abruptly between entry and work. The contact sheets show useful streaming, pause and retry states; their partial Markdown and early opacity frames are temporal evidence, not settled defects.

Changes made:
- Conversations open at the top. Bottom following is restricted to active streaming and respects the existing user's scroll-position check.
- The same input and composer remain mounted. A position-only Motion layout transition carries the writing surface into its bottom dock, under the existing reduced-motion policy. Follow-up writing now starts with a compact single-row input and grows with multiline content. The welcome surface retains more writing space.
- A faint toolbar shelf distinguishes writing from actions. Send and Stop occupy the same action area; Stop has a visible label. Attachment, removal, copy and mobile navigation targets are larger.
- Increased response, table, metadata and control typography. Mobile activity uses three readable columns with wrapping labels. The existing paper/olive palette is retained with darker secondary text, including the reported edition, index, demo badge and attachment labels.
- The active conversation title is a semantic h1 in populated states, while the welcome retains its editorial h1. The user question has a larger serif treatment, linking the working page to the opening page.

Verification: `pnpm typecheck` and `pnpm build --configLoader runner` passed. Only presentation source and this design record were edited; shared behavior and fixture content remain intact. I did not launch a browser or view video playback. The supplied screenshots and contact sheets informed this refinement; new visual results, exact motion continuity and a fresh automated accessibility pass remain for the runner to verify. In particular, opening long conversations at the top deliberately prioritizes context, so the complete answer requires scrolling on mobile.

## Refinement 2 — the writing dock as the work surface

Re-read the presentation source, contract, capabilities, shared hook and fixtures, and prior design record. No skills are selected. Reviewed the ten supplied images, including settled desktop/intermediate/mobile states and temporal contact sheets. The supplied observations report no overflow, runtime errors or accessibility findings; cancellation exposes retry, and the reduced-motion composer remains visible. Those are results for the supplied prior build, not a fresh browser pass for these edits.

Critique: the reading-room silhouette, index navigation and serif/sans hierarchy are coherent across entry and research. The main remaining weakness is the relationship between work and writing. Tool activity lives inside the transcript and scrolls away, while Stop and Retry live at the bottom; understanding and controlling the same operation requires looking in two places. The response also cuts sharply against the dock in the settled research captures. The unlabeled writing rectangle and changing send/stop widths make the primary control feel less considered than the editorial opening. The contact sheets show valid partial Markdown during streaming, not damaged settled content; no motion was removed on that basis.

Concrete changes:
- Relocated the existing tool activity into the persistent writing dock, directly above interruption feedback and the composer. Running, paused and completed states now occupy the same location. Completed steps retain their labels in a compact row. This changes the working composition substantially while keeping one reading column and the shared hook as the sole behavior owner.
- Added a restrained dock heading that describes the working state. A `Latest text` button appears when the transcript has more content below the current view. It scrolls to the end and resumes following; ordinary reading still respects manual scrolling. A narrow paper fade softens the viewport boundary without covering controls.
- Reworked the composer as a labeled writing surface with a ruled, inset action edge. The empty-state label gives the input a purpose independent of its disappearing placeholder. `Ask Folio` and `Stop` use the same 44px-high, fixed-width action area, avoiding horizontal movement when work begins. The input node and position transition remain intact.
- Kept attached documents above the question and bounded the attachment shelf height so five files do not consume the whole mobile dock. Removal targets were enlarged. The welcome typography, navigation model, original palette and prompt rows remain the baseline's reading-room direction.

Tradeoffs and uncertainty: keeping activity visible uses more mobile height during work; completion reduces that footprint. The dock is intentionally more prominent than before because it owns both progress and control. Exact viewport balance and continuity of its position animation require the runner's next capture. I did not launch or interact with a browser or inspect video playback; supplied screenshots and sampled contact sheets informed the changes.

Verification: `pnpm typecheck` and `pnpm build --configLoader runner` passed. Changes are confined to presentation source and DESIGN.md; shared fixtures, hook logic, dependencies, protected entrypoint, configuration and tests were not edited. No commit or publication was performed.
