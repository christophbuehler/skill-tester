# Folio design record

## Before implementation

The task is to help a professional work through a question with documents, read an answer, and return to that work. I read all five selected skill entrypoints, the supplied accessibility patterns, CONTRACT.md, CAPABILITIES.md, the hook, and the fixtures before making the choices below. The benchmark brief takes precedence. This is the implementation session; browser-informed refinement has not happened yet.

### Approaches actually considered

1. **Document desk:** a persistent document list, a central document preview, and a narrow conversation. This would make evidence prominent, but the hook provides file metadata, not previews or citation-level retrieval. A preview would imply an unsupported capability and narrow the useful answer.

   ```text
   [documents] [document preview] [conversation]
   ```

2. **Conversation canvas:** a small top bar with a conversation picker and a centered, full-height chat. This gives writing maximum room, but hides the existing research and document-review conversations. Revisit is a core action here.

   ```text
   [Folio] [conversation picker]          [new]
                 question
                 answer
                 composer
   ```

3. **Working folio — selected:** a compact index beside a generous, left-aligned reading column. On an empty conversation the question field sits directly after the heading; in a populated conversation it occupies a stable footer. The index shows actual conversation content, not invented folders, time stamps, or projects. Mobile gets a native conversation dialog.

   ```text
   [Folio      ] [current conversation                ]
   [New chat   ]
   [index      ]       question / reading column
   [           ]       answer / visible tool progress
   [           ]       composer
                         demo disclosure
   ```

### Compact design system

- Core colors, declared only in `src/styles.css`: canvas `#f8f9fb`, surface `#ffffff`, index `#eef1f6`, ink `#252c3c`, secondary ink `#606979`, action `#344ebc`. Other semantic tokens cover active selection, borders, status, focus, and neutral shadow layers.
- Type: locally bundled Manrope for the wordmark and headings; locally bundled Geist for controls and reading. A moderate, compact heading scale contrasts with 15–16px reading text. No remote assets.
- Composition: 264px desktop index, 760px maximum working column, shared left alignment for welcome text, composer, and suggested questions. At small widths, preserve the answer's reading space and use a modal index.
- Identity: a folded-page F, a clear ink-blue action, and paper-like surfaces. Boldness is concentrated in the welcome heading and folded mark, not distributed through decorative cards.
- Geometry: composer outer radius 20px, 1px border, 9px inner padding yields 10px inner controls. A file tile's 10px radius, 1px border, and 7px padding yields a 2px icon surface radius. The dialog uses a separate 24px shell; its navigation rows sit away from the outer corners, so their 12px radii are independent rather than claimed concentric.

### Plan review before writing presentation code

The sidebar/center-column outline is familiar, but serves actual history navigation. To avoid making it a generic dashboard, omit accounts, search, settings, model pickers, project groups, invented activity counts, and decorative dashboard metrics. There is no hero illustration: the working question field is the focal object. Suggested questions are a small typographic list, not a grid of interchangeable feature cards. The populated conversation must be as considered as the welcome state.

## Decision ledger

| Decision / alternative considered | Guidance actually used | Product reason | Implementation |
| --- | --- | --- | --- |
| Visible conversation index instead of a top-only picker | Frontend design: “Visual structure is information”; ground design in real content | Returning to research is as important as starting. Show real titles and excerpts. | `src/App.tsx`, `ConversationIndex` |
| Working question field instead of marketing hero | Frontend design: “Open with the most characteristic thing in the subject's world”; copy should help someone act | A question and its documents are Folio's material. | `src/App.tsx`, empty state and composer |
| Manrope headings + Geist reading instead of system-only type | Frontend design: one or two typefaces, clearly distinct roles, line lengths under 80 characters | Geometric headings establish identity while reading stays quiet. | Font imports; heading and reading styles |
| Answer shown as a reading document instead of a message bubble/card | Frontend design: structural devices should encode content; restrained boldness | Tables, lists, and code need width and hierarchy. User questions receive a subdued inset treatment for role distinction. | Message rendering and `.markdown` |
| Small neutral elevation on the composer; medium on modal | Beautiful shadows: compact controls use Beautiful sm; panels/popovers use Beautiful md; do not use shadows instead of clear borders | Lift identifies the editable surface and modal without boxing each answer. | Central shadow tokens; Tailwind arbitrary shadow utilities |
| Derived nested corners instead of the same radius everywhere | Nested geometry: `max(0, R - border - padding)`; distinguish target and painted geometry | Inner composer controls follow the same corner centers, while every hit area remains usable. | Geometry custom properties and source comments |
| Immediate navigation and content updates; small pointer press feedback | Emil: frequency-based animation decision; never animate keyboard actions; 100–160ms button press feedback; only transform/opacity | Repeated reading/writing should feel immediate. Pointer feedback confirms input. | Scoped pointer `:active`, no route/message entrance choreography |
| Native modal index instead of custom overlay focus trapping | Accessibility entrypoint and `references/A11Y-PATTERNS.md`: prefer native dialog; visible focus; target size; skip link | Keeps mobile conversation selection keyboard-operable and returns focus. | `<dialog>`, named controls, skip link, focus CSS |
| Separate concise status announcements instead of live-announcing every streamed token | Accessibility: polite live regions; robust accessible names | Continuous token announcements interrupt reading. Announce response and tool states while Markdown remains navigable. | Stable status region, tool text, error alerts |
| Honest context instead of a document preview or sources panel | Contract: hook owns data; metadata only; no fake features | Show files where attached and preserve fixture contents. | Attachment tiles, `useChat()` called once |

### Reconciliations and limits

- Beautiful shadows asks for exact literal Tailwind shadow utilities. The benchmark prohibits color literals outside centralized token declarations. Preserve its exact numeric shadow recipe and neutral colors in central tokens, and refer to those tokens from arbitrary Tailwind utilities. The benchmark wins the syntax conflict.
- Emil's initial greeting-only rule applies when invoked without a specific question. This is a specific implementation request, so work proceeds. Its general stagger suggestion is superseded by its frequency/purpose framework and frontend design's motion restraint: no stagger for routine conversations.
- Accessibility prefers live browser audits. The runner supplies browser evidence outside the sandbox; no browser restriction will be bypassed. Type/build verification is local; rendered accessibility and interaction claims await evidence.
- Nested geometry complements the chosen layout; it did not determine the palette or information architecture. Beautiful shadows did not determine the typography. No claim of causal improvement is made from this single implementation.
- The fixture's own simulation sentence stays intact even though there is also a single persistent demo/privacy disclosure. Preserving the supplied answer wins over removing that duplication.

## Implementation review (source evidence, not browser evidence)

| Before | After | Why |
| --- | --- | --- |
| Planned visible send text “Ask Folio” | “Send”, accessible name “Send message” | The visible verb belongs in the required accessible name, including for speech input. |
| Shared unlayered `font: inherit` on all controls | Tailwind/preflight control typography | The shorthand would override the explicitly chosen Tailwind type sizes and weights. |
| A mobile-only rule with lower priority than the icon-button display rule | A selector targeting `.mobile-only.icon-button` | Ensures desktop does not expose duplicate New chat controls. |
| Proposed derivation between dialog radius and all navigation rows | Independent row radius documented | Those rows are not equally inset from the shell's corners. The composer and file tile have the actual concentric relationships. |
| Copy button always named “Copy response” | Name matches visible “Copied” during success | Preserve visible/accessibility-label agreement while a separate status announces success. |

Implemented: one `useChat()` call; unchanged shared fixtures; existing conversation navigation; stable multiline textarea; Enter/Shift+Enter with IME guard; native file picker and guarded drop; removable pending files and validation alerts; GFM tables, lists, code, and streaming; explicit tool steps; stop and retry; clipboard success/failure feedback; native mobile dialog; reduced-motion handling; scroll following that stops when the reader scrolls away; a single persistent demo/privacy notice.

## Verification record

- `pnpm typecheck`: passed.
- `pnpm build --configLoader runner`: passed. Vite emitted a Node `module.register()` deprecation warning; no build errors.
- Supplied geometry helper: composer 20 / 1 / 9 gives inner radius 10. File tile arithmetic is documented in source.
- Supplied geometry helper also confirms file tile 10 / 1 / 7 gives inner radius 2.
- Static token contrast calculations: primary ink on surface 13.96:1, secondary ink on surface 5.53:1 and index 4.89:1, action on surface 7.09:1 and action-soft 6.24:1, inverse text on action 7.09:1, error text on error surface 6.23:1. These calculations do not replace rendered auditing.
- Browser screenshots, live interaction checks, and automated accessibility results have not been supplied in this implementation session. No browser launch or restriction bypass attempted. The two browser-informed refinement sessions remain available to the runner; no rendered WCAG-conformance claim is made.
- No dependency, configuration, shared hook, fixture, test, or protected entrypoint changes; no commits or publication.

## Objective repair: focused skip link blocks mobile navigation

The supplied runner report passed four interaction tests and timed out in the responsive/accessibility test: after Tab focused “Skip to message,” the link intercepted the click on “Open conversations.” This is interaction evidence, not a new visual refinement session.

| Before | After | Why |
| --- | --- | --- |
| Focused skip link at the header's left edge, over the mobile conversation button | Centered skip link with the same focus reveal, native link behavior, colors, and dimensions | Leaves the header's edge controls available when switching from keyboard to pointer input. Implemented only in `.skip-link` and `.skip-link:focus` in `src/styles.css`. |

Alternative considered: disable pointer events on the skip link. Rejected because a visible link should remain clickable. The accessibility skill's “Skip links (2.4.1)” and supplied `references/A11Y-PATTERNS.md#skip-link` guide retaining the native focus-revealed shortcut; its “Focus not obscured (2.4.11)” guidance supports avoiding control overlap. Emil's “Never animate keyboard-initiated actions” supports retaining the immediate reveal. The other three selected skill entrypoints were reviewed and did not change this narrow repair: existing visual identity, shadows, and nested geometry remain intact. No new skill conflict arises.

Repair verification: `pnpm typecheck` and `pnpm build --configLoader runner` both passed. Attempted the affected test with `pnpm test:e2e --grep 'responsive screenshots and accessibility report'`; the configured preview server failed before browser execution because the sandbox denied writing Vite's temporary config in `node_modules/.vite-temp` (`EPERM`). No restriction bypass attempted; the external runner must confirm the browser result. Protected source, configuration, fixtures, dependencies, and tests were not edited.
