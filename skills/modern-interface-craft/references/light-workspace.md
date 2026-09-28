# A light workspace that behaves like an instrument

Use this reference when designing a text-led creative or research workspace. It develops the skill's art direction without prescribing fixture text, a component tree, or a universal layout for every product.

## Give attention a useful place to land

Build around the active work and its next action. A clearly worded input can be the entire invitation. Add genuine recent items only when resuming work is useful; do not add a heading or explanatory paragraph just to fill the welcome view. If there is no history, leave that space open. Avoid manufacturing a populated studio from imaginary projects or treating empty-state copy as a marketing hero.

The content column should hold both the input and the principal reading edge. Modest asymmetry can give it character: a compact identity near the top and a current-work control near the reading area create a recognizable composition without filling the sides. Keep the input invitation subordinate to existing work. Do not duplicate the current thread name in a breadcrumb, heading, and status strip.

## Keep the type system small

Use a shared medium-weight body/control style throughout the UI. An item title and its supporting description use exactly the same font size, weight, line height and tracking; secondary tone supplies the distinction. Do not compensate for reduced type styles with excessive bold, uppercase metadata or pale text. Use the same principle for sidebar rows, attachments, activity summaries, buttons and disclosure content. Keep only a few justified exceptions for content headings, code and the input invitation. Preserve real Markdown semantics and readable hierarchy inside answers. A type-token inventory should reveal a small system, not a new style for every component.

## Design the input in all its shapes

Keep one input across these states:

| Condition | Shape and behavior |
| --- | --- |
| Empty and unfocused | A softly filled input with a clear placeholder; no idle send/attach icons or permanent instructions crowding it. |
| Engaged, still empty | Focus or touch reveals a discoverable attachment affordance. Keep send absent until a valid submission exists. |
| Valid draft | Reveal send in a stable location without moving the caret or causing the first line to jump. |
| Multiline draft | The writing region grows to a sensible viewport-relative maximum. Controls stay aligned to a predictable edge, and the draft scrolls internally only when necessary. |
| Attached objects | Real file items gain a compact band inside the same surface. Text and controls retain room; filenames wrap or truncate with an accessible full name. |

A CSS grid can allocate stable action space beside a flexible `min-width: 0` writing region. Keep latent action space modest; an empty state must not look like a toolbar with its icons erased. Revealed controls must not cover entered text. Use a real textarea with content-driven height, reset its measurement before recalculating, and account for padding and line height. Attachment content should determine additional height, rather than preallocating a large vacant rectangle. Preserve the stable textarea node across welcome-to-work changes; wrapper motion should not recreate the input or rescale glyphs.

Relocation should preserve the input's identity and spatial relationship to the reading column. A persistent dock can be sticky in the work layout or otherwise positioned with measured content clearance. Reserve its actual expanded height in the reading area. A fixed bottom offset that only fits the empty row will hide content after attachments or a multiline draft arrive.

## Geometry is about visible edges

Select a moderately rounded parent shape before calculating its children. A low input need not be a pill; a revealed send action need not be a circle. Derive a nested rounded rectangle's corner from the surrounding corner minus its actual painted inset, clamped at zero. This keeps a related family of shapes without turning “more rounding” into a goal.

Measure from the outer painted boundary to the inner painted control. Borders participate in that distance if present, but the input does not need a border to make the equation work. Distinguish the painted shape from its larger invisible touch target. CSS can clamp declared radii to fit short edges; inspect used geometry in empty, multiline, and attached states. Do not force an expanded rectangle into a full-height capsule.
When Nested Geometry is selected, defer the detailed math and verification to it. The art-direction criterion is an even, deliberate visible relationship between curves, controls, and space. Apply it where objects nest; unboxed prose needs no corner system.

## Give real objects continuity

An attachment should retain its stable identifier and filename from the draft into the submitted work, where the application supports that relationship. Animate a meaningful handoff or a modest local reflow; do not invent a document preview or pretend a metadata-only attachment has been parsed. Logical state changes immediately. An exiting visual is inert and cannot remain a duplicate keyboard target.

Progress belongs close to the work it explains. Keep its label and footprint stable while status changes; if it reveals steps, collapse them with controlled reflow after completion rather than replacing the whole response region. Preserve the reader's position when content arrives. Copy success changes the local action label or icon briefly with an accessible confirmation, without a distant toast competing for attention.

## Keep frequent navigation directly available

For Folio on desktop, use a persistent history rail: one activation opens a visible past conversation, without an intermediate menu. Let real history scroll in its own area and support filtering by title when the list grows. Keep the new-conversation action available independently of list scroll. Long names need an accessible full title. Preserve the selected item and keyboard focus when filtering; an empty filter result must offer an obvious way back. Do not add fake conversations to the shipped fixture set.

Use the same white canvas where practical, separating navigation and reading through space. A sidebar does not automatically need a colored panel, permanent border or section-label hierarchy. On narrow screens collapse history into an accessible disclosure with a scrollable list; the space-saving affordance should not govern desktop navigation.

Choose semantics according to behavior. A nonmodal disclosure leaves the work available and dismisses on Escape and appropriate outside interaction. A genuinely modal surface manages focus and background interaction as a dialog. Avoid mixing modal focus trapping with supposedly available background controls. Closing removes interactive descendants from the active navigation path immediately, even if a visual exit remains. If reopened during that exit, retarget the current presentation without flashing the closed state. Return focus to the trigger on dismissal; selection may instead move focus intentionally into the selected task.

Apple Design, when selected, supplies the mechanics of interruptibility and spatial motion. Here the design decision is direct access on desktop and predictable disclosure on small screens. Returning to work should feel immediate.

## Adapt to real input methods

Distinguish a quiet resting state from a usable engaged state. Tapping or keyboard-focusing the input must reveal the attachment action without requiring text first; moving focus to that action keeps the engaged state open. Pointer hover may supplement this route but must never be the only way to discover or use an action. Hidden controls are not invisible tab stops. Do not hide stop, retry, errors, or removal while they are relevant.

Remove standing file-type lists, keyboard hints and demo/privacy boilerplate from the composer surround. Present limits in the attachment interaction and show validation errors when they occur. Keep required demo/privacy information available through a clear, accessible disclosure or an appropriate one-time presentation; do not erase or misrepresent it. Preserve an accessible field label even when the placeholder is the only visible text. Avoid a row of new disclosure icons that simply recreates the clutter.

Use a meaningful placeholder with enough size, weight and contrast to carry the empty state; omit trailing ellipses and decorative copy. Pure white canvas, a quiet neutral-gray input fill, and restrained corners are the Folio preference, expressed through semantic color variables. A visible keyboard-focus treatment remains necessary even when the resting border disappears. Press styling acknowledges pointer-down while the action retains the control's normal activation semantics; do not execute twice or commit a cancelled press.

At small widths, reduce peripheral spacing before shrinking reading text or touch targets. Let the dock respond to multiline content, safe-area insets, and the visible viewport with the keyboard open. Verify that the last response, attachment removal, and stop action remain reachable. A tall history surface should dismiss predictably and return the user to the same working context. Reduced motion removes travel while preserving the same object and state relationships.

## Interpretation note

These recommendations are original composition and implementation guidance for the project's revised light direction. The earlier research archive supplies context, not evidence that this particular layout has been validated by its linked creators. Upstream Apple Design is a separate, unofficial synthesis; neither it nor the specialist geometry, shadow, or accessibility skills endorse this exact composition. Review generated interfaces in use before claiming the direction improves outcomes.
