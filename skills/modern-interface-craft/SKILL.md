---
name: modern-interface-craft
description: Design and build exceptionally clean, contemporary interfaces with distinctive composition, responsive layouts, purposeful motion, and satisfying microinteractions. Use when creating or substantially redesigning web apps, dashboards, interactive tools, product pages, or polished React/Tailwind interfaces, especially requests for modern, refined, creative, fluid, or tactile UI. Also use for improving interaction states and mobile UX. Do not apply to backend-only work, content-only edits, or requests to preserve an existing appearance exactly.
---

# Modern Interface Craft

Make the interface feel clear at first glance, useful during real work, and rewarding in its smallest details. Give it a recognizable idea without making the user learn a novel control language.

This is an original synthesis informed by the Designeer directory. It is a design decision process, not a template, component collection, or fixed palette. Read `references/interaction-recipes.md` when implementing motion, overlays, asynchronous actions, or responsive state changes. Read `references/research.md` only when tracing the research or choosing further references; browsing is not required to use this skill.

## 1. Understand the work before choosing the look

Read the task, existing interface, stack, and constraints. Identify the user's main job, the primary object they manipulate, the most frequent action, and the cost of an error. Infer sensible details from the brief; ask only when an unanswered question changes the product.

Write a compact internal design contract:

- **Job:** what the person needs to finish, and where they start.
- **Hierarchy:** primary content/action, supporting context, occasional controls.
- **Character:** two or three specific qualities expressed through composition, typography, materials, and behavior.
- **Signature:** one coherent visual or interaction idea that fits this product.
- **States:** the important empty, populated, loading, success, error, disabled, and interrupted cases.
- **Small screen:** what reflows, what becomes a disclosure, and how the primary task stays reachable.

User requirements and repository rules take precedence. Keep supplied logic, data, accessibility contracts, copy, tests, and dependency limits intact. When combined with other skills, reconcile choices into one design direction rather than stacking every suggested effect. Do not add runtime dependencies, fetch assets, or change protected files just because a reference uses them.

## 2. Choose a direction, then make it specific

Consider two plausible compositions mentally and choose the one that best supports the job. A research tool might emphasize a legible reading plane with quiet contextual controls; a planning tool might center a time axis and an adaptive inspector; a discovery page might use an expressive typographic opening followed by a rigorous comparison grid. These are examples, not mandatory layouts.

Give the design one memorable decision: an unusually confident type scale, a crisp information rail, a carefully proportioned split, a distinctive selection treatment, or a contextual control that changes purpose in place. Carry that decision into spacing, states, and motion. Avoid adding unrelated decoration to manufacture personality.

Use real task content to judge the design. A strong hero is appropriate to a marketing page; a working app should get to the work quickly. Do not turn every product into a landing page, bento grid, pill collection, or glass dashboard.

## 3. Build a clean visual system with visible hierarchy

Define a small local set of tokens for surfaces, text, emphasis, borders, spacing, radii, and motion. Keep roles consistent even when colors change. Choose light, dark, warm, cool, or saturated treatments for the content and brand; there is no default required palette.

- Establish hierarchy through type size, weight, contrast, placement, and whitespace before adding boxes. Group related controls more tightly than unrelated regions.
- Use a readable body face and a deliberate display treatment only where it adds character. Prefer available local/system fonts under offline or dependency constraints. Keep long text comfortable to read and code horizontally scrollable within its own container.
- Align text, icons, and control edges optically, not merely mathematically. Make icon stroke weight and size coherent. Icon-only controls still need accessible names.
- Use fewer competing emphasis signals. Reserve the strongest treatment for the next meaningful action; selected, hovered, focused, and disabled are different states.
- Create depth when it explains layers. A menu can have elevation; every section does not need a shadow. Check borders and secondary text on the actual surface instead of assuming a muted color remains readable.
- Prefer precise spacing and useful content to decorative noise. An accent, illustration, gradient, texture, or 3D element earns its place by supporting the chosen direction; it is neither compulsory nor forbidden.

## 4. Design behavior as carefully as the resting screenshot

Map each interactive element to a real action and all states needed to complete it. Use semantic controls and established keyboard conventions. Surface errors near the action with a recovery path. Preserve user input during failures or cancellation when the contract allows it.

Keep context near the object: disclose an item's details in a stable adjacent region when practical, rather than repeatedly sending the person elsewhere. Make progressive disclosure discoverable. Important actions cannot depend on hover alone.

For asynchronous work, communicate what is happening, what has completed, and what the user can do next. Prefer honest indeterminate status to fabricated percentages. Preserve useful partial output. Avoid moving the user's reading position or auto-scrolling them away from inspected history.

Microinteractions should close a feedback loop: a press acknowledges input, a pending state prevents accidental duplicates, a completed state confirms the result, an error offers retry. They should not delay the operation for theatrical timing. Read the recipes before inventing a new mechanism.

## 5. Add purposeful motion

Assign each transition a job: acknowledge input, connect cause and effect, reveal structure, maintain spatial continuity, or celebrate a meaningful completion. Repeated actions deserve restraint; a delightful effect becomes friction if replayed every time.

Choose a few shared timing/easing tokens. As starting points, try roughly 100–160ms for immediate feedback and 180–280ms for a small surface transition; tune for distance, frequency, and the interface's character. These are starting values, not laws or measured values from the reference sites.

Prefer opacity and transforms for small transitions. Keep interaction targets stable while surrounding content changes. Interrupt or reverse motion naturally when the user acts again. Avoid `transition: all`, unrelated infinite movement, animation on every streamed token, scroll hijacking, and entrance sequences that postpone access to content.

Reduced motion is a complete alternate behavior: remove spatial travel, scaling, spring overshoot, and smooth scrolling while retaining immediate state feedback. Apply the preference to CSS and JavaScript motion. Keep the underlying UI usable if animation support or an optional effect fails.

## 6. Make responsiveness a change of composition

Design for available space and input modality, not a scaled-down desktop picture.

- Keep the primary task visible at narrow widths. Move occasional navigation into a clearly labeled disclosure; preserve access to it and restore focus when it closes.
- Reflow multi-column content into a meaningful reading order. Let toolbars wrap or simplify without hiding essential actions. Avoid making every panel a fixed-height nested scroller.
- Use fluid widths, sensible max widths, `min-width: 0` where needed, and wrapping for long labels. Contain wide code/tables rather than clipping the page.
- Size touch targets generously, leave separation between destructive and common actions, and provide focus equivalents for hover feedback.
- Account for viewport height, safe areas, and the on-screen keyboard when using bottom composers or sticky actions. Check that sticky elements do not obscure focused fields or final content.
- Preserve selection, drafts, and task state when changing breakpoints; layout changes should not silently reset the user's work.

## 7. Finish with evidence

Use available browser tools to inspect the real interface. Check a wide view, a narrow view, and an intermediate width where the composition changes. Exercise keyboard navigation and the main task, including loading, error/recovery, interruption, long content, and reduced motion. Check readable contrast, visible focus, accessible names, overflow, and console errors.

If browser tools are unavailable, inspect the code and state transitions and say exactly what remains unverified. Never claim tested motion or responsive behavior from a static screenshot.

Make a focused refinement pass: fix the largest hierarchy issue, the most awkward interaction, and the least convincing small-screen region. Remove any effect that does not contribute. Do not erase useful behavior to get a cleaner screenshot.

Deliver working source in the requested format. Briefly explain the design idea, meaningful interaction choices, and verification or remaining limits. Keep implementation commentary out of the product UI unless users need it to make a decision.
