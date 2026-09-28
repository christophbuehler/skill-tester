---
name: modern-interface-craft
description: Art-direct clean, expressive product interfaces around a light work surface, confident typography, a distinctive primary input, task-led navigation, and meaningful microinteractions. Use for a designer-led direction for creative, research, and conversational tools; not for preserving an existing visual system exactly.
---

# Modern Interface Craft

Build a useful creative instrument with a recognizable silhouette: an open light canvas, precise typography, and a quiet primary input that becomes expressive through use. Character comes from proportion, alignment, and how real objects respond. Commit to this direction unless the user's branding or task specifies another one.

This skill owns **art direction**. When selected together, Apple Design supplies fluid, interruptible spatial behavior; Nested Geometry supplies radius/inset calculations; Beautiful Shadows supplies elevation; Accessibility supplies interaction and contrast detail. Use those skills to realize this composition without importing a second visual shell. Record material conflicts and the chosen interpretation in the project's design note. This skill also works alone: preserve focus, semantics, reduced motion, and immediate state updates using the project's available primitives.

## One work surface

Default to a pure-white canvas with dark text for this light direction. Use a soft neutral-gray input surface to establish hierarchy without an outlined container; retain another canvas color when the user or an existing brand requires it. Keep most of it unboxed. Reserve material, rounding, and elevation for things people manipulate: the input, a contextual history surface, an attached object. Prefer a small typographic identity to an arbitrary initial, stacked-document mark, or decorative sparkle. The identity and the current-work control need not become a full-width framed header.

Give useful content a shared left edge within a comfortable reading column. The column may sit centrally in the viewport; its text and controls should feel aligned for work. Avoid stacked centered greetings, slogans, breadcrumbs, session labels, and repeated product descriptions above the task. Let the input itself provide the invitation. Omit greetings and introductory copy when a useful placeholder already explains the next action. Actual recent work can offer a way back in; invented previews, projects, counts, and document contents cannot.

Choose navigation by frequency and scale, not by how empty the canvas looks. For Folio, conversation switching is a primary repeated task: show a persistent desktop sidebar with direct, one-click access to past conversations and a clear new-conversation action. Let a long history scroll independently; provide a lightweight search/filter over real conversation titles for histories that may grow to hundreds. Do not fabricate history to make the layout look busy. Distinguish the current item through restrained tone and semantics rather than another font style. The rail can share the white canvas and use spacing instead of automatically adding both a tinted background and a divider. On narrow screens, reveal history from an accessible control and return to the selected conversation. Disclosure is appropriate when space requires it, not as an automatic definition of minimalism.

## The primary input is the instrument

Design the empty, unfocused input as a quiet surface whose only visible content can be a clear placeholder. Do not display unavailable send actions or attachment controls merely to make the field look like a chat composer. Reveal capabilities through deliberate focus, touch, a draft, or attached content; keep every action discoverable and keyboard-accessible. Stop and recovery controls remain explicit when needed. Read the state guidance in [Light workspace](references/light-workspace.md).

Favor a softly filled, moderately rounded rectangle over a fully rounded capsule. Let surface contrast and generous internal space identify the input before adding a border or shadow. Use a larger, somewhat stronger placeholder as the invitation, without an ellipsis or repeated nearby instructions. It still needs a persistent accessible name and sufficient contrast. The desired quality is reduced visual demand, not a fixed pixel size or a copy of one screenshot. Grow naturally for multiline text and real attachments; avoid an empty toolbar or a vacant large textarea.
Keep this same input alive as work begins. Its wrapper can become the working dock while the draft, caret, focus, and file identities remain intact. The welcome and working states share one object; they should not read as unrelated templates. Prefer a modest relocation with clear continuity over theatrical travel across the screen.

For implementation, read [Light workspace](references/light-workspace.md). It covers the expanded input, real attachment continuity, navigation dismissal, and mobile layout. Use [Interaction recipes](references/interaction-recipes.md) for additional state-preservation details when implementing these transitions; interpret its entry surface through this compact light direction.

## Typography, geometry, material

Use one well-made font family and a deliberately small type system across the entire application. For this Folio direction, ordinary interface text shares one readable size and one medium weight (for example, 16px/500); use the same size, weight, line height and tracking for an item title and its description. Make secondary descriptions a readable gray instead of smaller or lighter. Apply this consistently to conversation rows, controls, file metadata, tool activity, status text, empty states and disclosures. Avoid light weights, all-caps micro-labels and one-off size/weight tweaks. Meaningful document headings, code and semantic emphasis may retain a small intentional hierarchy, rather than flattening Markdown or turning every label into a heading. The composer invitation may use one larger size but should share the normal interface weight. Prefer an available variable face such as Manrope, or the project's established family; load the real font. Use spacing, alignment and restrained tone before adding another type style. Audit the full interface, not just a sample row.

Choose the parent shape for the product first, then derive nested geometry. This light direction favors measured, moderate corners rather than full pills or circular end buttons. For an equally inset rounded-rectangle action, derive its painted corner from the parent corner minus the actual border-box inset, clamped at zero. Geometry is a consistency tool, not a reason to choose a capsule. Border thickness, unequal insets, and expanded content affect the calculation; use Nested Geometry when selected. Invisible touch targets can be larger than the painted controls.
Use a small semantic palette: light canvas, readable foreground, quiet secondary content, and one deliberate accent for a meaningful action or state. When a valid draft makes sending relevant, a restrained send control can supply the necessary emphasis; an empty field does not need a disabled visual anchor. Prefer tone to a permanent border and reserve a clear focus treatment for interaction. Shadow guidance is optional: omit elevation when a flat tonal surface already works; content paragraphs and every history row do not each need a border, fill, and shadow. If dark mode is requested, use an OLED-black canvas and adapt contrast and surfaces intentionally.

## Microinteractions carry the work

Choose a few connected relationships and finish them:

- **Navigation:** desktop history remains directly available. Selection updates immediately and moves focus into the chosen work without summoning the keyboard. Where mobile disclosure is needed, its open/close/reopen transition is interruptible and dismissal restores sensible focus.
- **Documents:** real attachments retain their filename and identity as they enter, reorder, leave, or become part of the submitted work. Neighbors reflow without stretching text. Removal updates state immediately.
- **Progress:** tool activity occupies a stable place near its result, then resolves into an inspectable summary without jolting the reading position. Send and stop share a footprint. Retry preserves existing work.
- **Feedback:** press response begins immediately; copy confirmation stays on the copied object's action. Hover can reveal polish for a pointer, while touch and keyboard retain explicit controls and visible focus.

Let motion follow current on-screen state and user intent; it never gates sending, stopping, deleting, or reopening. Preserve opaque readable content during streaming. Reduced motion keeps the same information and actions with immediate placement or gentle local feedback. Avoid token-by-token animation, ornamental perpetual motion, and layout changes that move a target while it is being used.

## Review the instrument in use

Before implementation, state the content alignment, primary-control silhouette, navigation access cost, small type scale, and one important object transition. A sidebar is useful when it reduces repeated work. Remove centered slogans, redundant suggestion grids and outlined containers that do not earn their space; do not remove useful navigation merely to achieve a sparse screenshot.

Inspect settled welcome and populated views at desktop and mobile, plus the actual add/remove, open/close/reopen, send/stop/retry, and copy sequences. Check draft/focus continuity, readable intermediate frames, expanded input geometry, long content, and a dock that leaves the final content and actions reachable. On mobile, adapt controls and height to the available viewport and keyboard; do not let a floating surface conceal the work. Report verified behavior separately from aesthetic judgment.

## Sources and interpretation

This is original project art direction, not an official Apple design system or a claim of measured usability improvement. The light composition incorporates the Folio v4 user feedback: remove redundant copy and idle controls, favor white canvas and soft gray input tone, and use deliberate moderate corners. The later typography/navigation feedback favors uniform medium-weight interface text and direct desktop history access; this supersedes the earlier popover-only navigation direction. These are preferences for this direction, not universal rules for every product. The feedback refines the earlier light and dark directions. Existing [research notes](references/research.md) and [source audit](references/source-audit.json) document the earlier research and its limits; this revision adds no new source inspection claims. The separately selected upstream Apple Design skill is an independent interpretation of public Apple material. Its motion principles inform implementation; the light workspace composition and examples here are this project's choices.
