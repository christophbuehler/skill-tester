---
name: modern-interface-craft
description: Build contemporary, minimal product interfaces with considered typography, inventive composition, fluid state changes, and responsive interaction design. Use when creating or redesigning web apps and interactive tools where clean visual craft and an excellent working experience matter. Not for backend work or preserving an existing visual design exactly.
---

# Modern Interface Craft

Build a product someone wants to use, with character coming from how clearly and gracefully it works. This skill favors contemporary minimalism: strong proportions, precise typography, restrained surfaces, and controls that appear where they are useful. Minimal means fewer decisions and distractions for the user, not fewer capabilities or faint text.

## Start with the work

Identify the primary task and the content people spend time with. Decide what deserves permanent space and what is occasional. Choose the composition from those frequencies; a conventional sidebar or dashboard shell is an option, not a starting requirement. Compare two genuinely different arrangements before implementing one. Do not make novelty itself a goal: an unfamiliar navigation mechanism must repay its learning cost.

A working product should open onto its useful action. Avoid filling its first screen with a marketing headline, slogan, decorative illustration, and a grid of prompts while pushing that action to the bottom. Empty space should establish hierarchy or give content room, not merely separate ornamental sections.

Keep supplied behavior, content, contracts, and dependencies intact. Use the host's available tools and assets. Read `references/interaction-recipes.md` for asynchronous states, overlays, or responsive transitions. `references/research.md` and `source-audit.json` document inspiration provenance; they are not templates or evidence of measured design performance.

## Give the composition a point of view

Choose a relationship that makes the product recognizable: the balance of content and controls, a distinctive reading rhythm, a contextual transition, or the way an object expands into its working state. Make this useful in populated states, not just impressive in an empty screenshot. A new palette or display font alone is not a design concept.

Work in this order: content hierarchy, proportions, type, spacing, then surfaces and color. First see whether proximity and alignment establish groups. Add a border only where an edge explains interaction or separates otherwise ambiguous regions. The same goes for shadow and tinted panels. If every element is outlined, none is meaningfully emphasized.

Typography should carry the hierarchy without announcing itself. Use comfortable text sizes, deliberate weight and line height, and readable contrast. Sentence case is the default for interface language. Tiny widely tracked uppercase labels often add ceremonial structure without information; remove them unless the context makes them useful. Display typography belongs where reading and meaning benefit, not automatically on every empty state.

Use neutral space confidently and accent color selectively. Avoid washing the entire application in a brand tint. A warm editorial aesthetic is one possible direction, not a shortcut to sophistication. Keep essential secondary text readable; muted is a role, not a license for low contrast.

Write concise, concrete interface copy. Do not invent account tiers, avatars, workspace breadcrumbs, security badges, statistics, or pseudo-navigation to make a demo look complete. Explain real limitations once, at the relevant point, rather than repeating reassuring footer copy around the screen.

## Make interactions feel designed

For every action, connect intent, feedback, and result. Selecting an object should make its context clear. A document should remain recognizable when moving from pending selection into a sent message. Assistant activity should resolve into the response without a competing permanent status dashboard. A canceled action preserves useful work and provides a clear next step.

Motion communicates these relationships. Plan it around actual transitions between states: composing to sending, opening and closing context, adding or removing an item, switching tasks. A hover color change is useful feedback, but does not by itself constitute motion design. Avoid gratuitous card lifts, bouncing icons, rotating decorations, and entrance choreography for every row. Repeated interactions need to remain fast.

Keep targets stable, transitions interruptible, and content readable during changes. Prefer modest transform/opacity transitions where appropriate; tune timing to distance and frequency rather than pasting one easing everywhere. Reduced motion retains state feedback without spatial travel. Do not delay real work so an animation can finish.

Reveal occasional controls in context while preserving discoverability, touch use, keyboard operation, and visible focus. Essential actions cannot exist only on hover. A clean screenshot is not worth an obscure workflow.

## Compose for the available space

Design the narrow view as a first-class working surface. Reconsider hierarchy and disclosure rather than shrinking desktop panels. Keep the primary task within reach, let content establish the reading order, and preserve state and focus when a surface opens, closes, or reflows. Account for short viewports and the on-screen keyboard. Contain wide code and tables without creating horizontal page scrolling.

Do not add a navigation drawer simply because the screen is narrow; decide whether the chosen navigation needs one. When an overlay is appropriate, implement its keyboard and focus behavior completely.

## Critique the rendered product

Use actual browser evidence at wide, intermediate, and narrow sizes, including populated and interrupted states. If captures are supplied by a runner, inspect those and distinguish them from interactions you personally exercised. Never infer successful motion from a still image.

Ask concrete questions:
- What attracts the eye first, and is it the thing the person needs?
- Which labels, frames, badges, and repeated explanations can be removed without losing understanding?
- Does the populated product retain its character, or was the design only an empty-state treatment?
- Is there continuity from action to result, including loading, failure, retry, and cancellation?
- Can a keyboard or touch user find the same capabilities without hunting?
- Does the small screen feel intentionally composed, and can the person still reach the main action?

Refine the biggest problems visible in that evidence. Remove ornament before adding effects. Preserve accessible contrast and focus through the final pass. Report functional verification separately from subjective design judgment and identify anything the available tools did not let you observe.
