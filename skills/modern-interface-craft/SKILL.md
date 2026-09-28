---
name: modern-interface-craft
description: Art-direct and build expressive contemporary product interfaces with bold typography, generous rounded geometry, a distinctive composer or control surface, and choreographed microinteractions. Use for an opinionated, designer-led alternative to conventional SaaS dashboards, especially modern web apps and research or creative tools. Not for preserving an existing visual system exactly.
---

# Modern Interface Craft

This is an opinionated art direction, not a checklist of agreeable design advice. Build a tactile creative instrument: an expansive ink-dark canvas, luminous typography, soft substantial controls, and a restrained sharp accent. Its identity should be recognizable with the logo hidden. User-specified branding overrides this direction; otherwise actually commit to it.

## Composition: a studio, not office furniture

Use a single continuous canvas. Put the work in the center and occasional navigation in a compact top-level conversation/project switcher which expands into a searchable or grouped history surface. Do not default to a permanent left sidebar, a divided header/body/footer shell, or multiple framed panels. A switcher is a real navigable control with focus management, dismissal, and selected state, not merely a decorative pill.

Give the interface one strong compositional relationship: a generous entry surface becomes a compact working dock when a task starts; a selected object opens in the same spatial location; an activity capsule resolves into the result. Keep that relationship intact on mobile. The empty state and working state should feel like two states of one instrument, not separate landing page and chat templates.

Make the composer a designed object. For text tools, use a broad rounded well (roughly 28–36px corners), generous interior spacing, integrated circular attachment/action controls, and auto-growing input. On welcome, place it where attention already is; while working, preserve access through a compact dock. Do not repeat the generic rectangle with an outlined textarea above a horizontal toolbar and a permanent keyboard-help footer. File previews join this object without squeezing the input or scattering actions elsewhere.

## The visual voice

- Default to near-black graphite, warm off-white text, and a concentrated citron or similarly sharp accent. Use the accent for an active state or decisive action, not every edge. No sage-paper editorial theme, decorative gradients, starbursts, noise, or glass wallpaper.
- Prefer **Manrope Variable** for the expressive type hierarchy and **Geist Variable** for compact controls if the supplied environment includes them. One family is also valid. Load real local fonts rather than naming unavailable fonts in CSS. Make body text approximately 16–17px with a comfortable reading measure; use deliberate 450/550/650 weights and a confident 40–64px short opening title where it helps. Do not fake sophistication by shrinking metadata to 10px or applying extreme negative tracking.
- Let substantial rounded silhouettes carry character: outer surface 28–36px, inner items 16–22px, circular or capsule controls. Relate nested radii to inset spacing. Large rounding should appear on the main working object, not just a few tiny buttons.
- Separate regions with space, tone, and alignment. Choose one surface-defining treatment, not a fill plus an outline plus a shadow on every element. Thin borders may explain a specific interactive state; they are not the default grouping mechanism.
- Use sentence case and compact factual copy. Prefer a precisely spaced typographic wordmark to an improvised logo. Do not manufacture overlapping document rectangles, a colored dot after the name, or a generic sparkle as a brand identity. Use one custom mark only when its geometry is strong at 16px and belongs to the concept.

These are deliberate preferences of this skill, not universal design laws. When another selected skill has conflicting art direction, make one coherent interpretation and explain the choice in DESIGN.md.

## Interaction is part of the identity

Read `references/interaction-recipes.md` and implement a small set of connected transitions, not dozens of hover effects. The following relationships are central to this direction:

1. **Entry to work:** the primary entry surface changes size/position continuously as the first message creates the working view. Preserve input focus and the identity of the composer; avoid remounting a focused textarea. A shared-layout transition or measured FLIP is preferable to unrelated fade-ins.
2. **Context on demand:** history expands from its trigger's vicinity; selected state travels with the chosen item. Opening, selection, dismissal, Escape, and focus restoration all work. An interrupted close/reopen should reverse naturally.
3. **Objects entering/leaving:** file previews appear and leave while neighbors reflow, retaining the filename and identity when sent. Removal must update immediately even if the exiting visual remains briefly.
4. **Progress to result:** compact tool activity changes from pending to running to complete, then contracts to an inspectable summary. A send action becomes stop in the same control footprint. Retry preserves the existing message. No animation on every token and no perpetually bouncing decorative shapes.
5. **Direct feedback:** pressed controls compress subtly; copy becomes a brief confirmed state; tooltips or labels work on keyboard focus too. Hover is supplementary, never the only designed interaction.

Use `motion/react` when available, with restrained springs (for example stiffness around 380–500 and damping 32–40) and short direct-feedback transitions. These are starting points for this art direction, not measured universal constants. Set reduced-motion behavior for both JS and CSS. Animate layout without stretching paragraph glyphs, and keep interaction targets stable. Keep whole-message containers opaque while only a small activity indicator moves.

## The finish standard

Before coding, describe the silhouette, type/geometry relationship, composer transformation, and navigation reveal. If the concept still reads as a tinted sidebar, display headline, suggestion cards, and outlined bottom box, replace the concept rather than polishing its CSS.

Inspect settled empty and populated views at desktop and mobile, plus actual interaction recordings. Check the point where a document is added, history closes, work starts, stop is pressed, and retry begins. Treat mid-transition frames as temporal evidence, not as faded final text. Do not remove an intentional transition to improve a screenshot taken before it settles.

The final product should have a recognizable silhouette, a cared-for primary control, legible hierarchy, and continuity through the main flow. Remove any borrowed-looking icon cluster, stock slogan, redundant status badge, or panel that weakens that idea. Confirm the real task stays accessible by touch and keyboard, with adequate contrast and a complete reduced-motion path. Report what the browser actually verified and what still needs a human design judgment.

Research provenance remains in `references/research.md` and `references/source-audit.json`; those resources informed earlier work, not a claim that these choices reproduce any particular reference site.
