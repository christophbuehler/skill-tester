# A light workspace that behaves like an instrument

Use this reference when designing a text-led creative or research workspace. It develops the skill's art direction without prescribing fixture text, a component tree, or a universal layout for every product.

## Give attention a useful place to land

Build around the active work and its next action. A short left-aligned invitation, the real input, and a few genuine recent items can make a complete welcome. If there is no history, leave that space open. Avoid manufacturing a populated studio from imaginary projects or treating empty-state copy as a marketing hero.

The content column should hold both the input and the principal reading edge. Modest asymmetry can give it character: a compact identity near the top and a current-work control near the reading area create a recognizable composition without filling the sides. Keep the invitation subordinate to the work once work exists. Do not duplicate the current thread name in a breadcrumb, heading, and status strip.

## Design the input in all its shapes

Think of one input with three content conditions, not three components:

| Condition | Shape and behavior |
| --- | --- |
| Short draft | A low rounded instrument with embedded attachment and send controls; no empty toolbar below it. |
| Multiline draft | The writing region grows to a sensible viewport-relative maximum. Controls stay aligned to a predictable edge, and the draft scrolls internally only when necessary. |
| Attached objects | Real file items gain a compact band inside the same surface. Text and controls retain room; filenames wrap or truncate with an accessible full name. |

A CSS grid can keep fixed control footprints beside a flexible `min-width: 0` writing region. Use a real textarea with content-driven height, reset its measurement before recalculating, and account for padding and line height. Attachment content should determine additional height, rather than preallocating a large vacant rectangle. Preserve the stable textarea node across welcome-to-work changes; wrapper motion should not recreate the input or rescale glyphs.

Relocation should preserve the input's identity and spatial relationship to the reading column. A persistent dock can be sticky in the work layout or otherwise positioned with measured content clearance. Reserve its actual expanded height in the reading area. A fixed bottom offset that only fits the empty row will hide content after attachments or a multiline draft arrive.

## Geometry is about visible edges

Consider a single-row surface containing painted 44px circles. A 22px control radius plus a measured 10px inset gives a 32px surrounding radius; the corresponding equal-inset row is 64px tall. This is a worked relationship, not a size mandate. A larger invisible hit target does not change the painted radius.

Measure from the outer painted boundary to the inner painted control. Borders participate: a 1px outer border plus 9px content padding may provide the intended 10px edge distance, while 10px padding inside that border gives 11px. CSS can clamp radii to fit short edges. Inspect the computed result rather than trusting a token name. Expanded content usually needs a rounded rectangle instead of a full-height pill; relate its corner to the nearby controls and attachment insets instead of increasing the radius with total height.

When Nested Geometry is selected, defer the detailed math and verification to it. The art-direction criterion is an even, deliberate visible relationship between curves, controls, and space. Apply it where objects nest; unboxed prose needs no corner system.

## Give real objects continuity

An attachment should retain its stable identifier and filename from the draft into the submitted work, where the application supports that relationship. Animate a meaningful handoff or a modest local reflow; do not invent a document preview or pretend a metadata-only attachment has been parsed. Logical state changes immediately. An exiting visual is inert and cannot remain a duplicate keyboard target.

Progress belongs close to the work it explains. Keep its label and footprint stable while status changes; if it reveals steps, collapse them with controlled reflow after completion rather than replacing the whole response region. Preserve the reader's position when content arrives. Copy success changes the local action label or icon briefly with an accessible confirmation, without a distant toast competing for attention.

## Make contextual navigation dependable

Place history's origin at the current-work control. A desktop popover can expand into available space; on mobile, a bounded anchored surface may use more width while keeping its origin legible. Size it for long labels and a scrollable list rather than allowing it to cover the input indefinitely.

Choose semantics according to behavior. A nonmodal disclosure leaves the work available and dismisses on Escape and appropriate outside interaction. A genuinely modal surface manages focus and background interaction as a dialog. Avoid mixing modal focus trapping with supposedly available background controls. Closing removes interactive descendants from the active navigation path immediately, even if a visual exit remains. If reopened during that exit, retarget the current presentation without flashing the closed state. Return focus to the trigger on dismissal; selection may instead move focus intentionally into the selected task.

Apple Design, when selected, supplies the mechanics of interruptibility and spatial motion. Here the design decision is the relationship: navigation belongs to its initiating control, and returning to work should feel immediate.

## Adapt to real input methods

Keep frequent actions visible on touch. Pointer hover can add labels or secondary emphasis, but keyboard focus also exposes any necessary secondary controls without moving them under the user. Press styling acknowledges pointer-down while the action retains the control's normal activation semantics; do not execute twice or commit a cancelled press.

At small widths, reduce peripheral spacing before shrinking reading text or touch targets. Let the dock respond to multiline content, safe-area insets, and the visible viewport with the keyboard open. Verify that the last response, attachment removal, and stop action remain reachable. A tall history surface should dismiss predictably and return the user to the same working context. Reduced motion removes travel while preserving the same object and state relationships.

## Interpretation note

These recommendations are original composition and implementation guidance for the project's revised light direction. The earlier research archive supplies context, not evidence that this particular layout has been validated by its linked creators. Upstream Apple Design is a separate, unofficial synthesis; neither it nor the specialist geometry, shadow, or accessibility skills endorse this exact composition. Review generated interfaces in use before claiming the direction improves outcomes.
