---
name: apple-design
description: Design and implement polished Apple-inspired product interfaces with a content-first canvas, large continuous rounded forms, floating controls, precise system typography, adaptive materials, and fluid spatial transitions. Use for an opinionated Apple design direction in web apps or native-style interactive tools; not for adding Apple branding or a generic frosted-glass skin.
---

# Apple Design

Create an original product with the calm precision and physical continuity of an Apple interface. This is an independent web design skill informed by Apple's public Human Interface Guidelines and WWDC design guidance, not an official Apple skill. Read `references/design-language.md` before implementation; it distinguishes source principles from this skill's concrete web art direction.

## The composition

Begin with a bright, expansive content plane and one floating functional layer. Use an adaptive command bar, a quietly centered reading surface, and contextual sheets/popovers. For a conversation tool, default to a compact floating top toolbar for history/new conversation and a generously rounded bottom input capsule. At welcome, the capsule can sit nearer the opening action and settle into the working position when a conversation starts. Give the product a coherent three-dimensional relationship rather than boxing every region.

Do not build a permanently tinted, edge-to-edge sidebar separated by a line. Put occasional history in a rounded floating panel that is revealed on demand; let the reading canvas retain its width. A richer information architecture may justify persistent navigation, but it should be a deliberate floating component with a useful purpose, not the template's first column.

The primary content is opaque and comfortable to read. Translucency belongs to a limited set of controls and navigation surfaces over that content. A document, message, table, or whole app background is not a glass card. Avoid layers of glass on glass, decorative blobs, broad gradient wallpaper, and imitation macOS traffic-light controls.

## Shape, type, and material

- Use an off-white or very light cool canvas, near-black text, and a restrained blue accent for meaningful actions/selection. White content and a subtly translucent control layer create hierarchy. Do not tint every panel blue.
- Use `-apple-system`, `BlinkMacSystemFont`, and a well-chosen locally available sans fallback such as Geist. Aim for Apple-like typographic precision through weight, size, line height, alignment, and measured spacing, not by claiming an unavailable font. Body text around 16–17px, comfortably readable secondary labels, and compact 28–40px titles fit a working product. A brief welcome title may be larger; avoid oversized marketing copy.
- Use generous continuous-looking rounded geometry: roughly 24–32px for a main control surface/sheet, 16–20px for a nested group, and capsules/circles for small controls. Keep inner and outer curves concentric with their spacing. Use CSS `corner-shape` only as optional enhancement with a reliable border-radius fallback.
- Give material a subtle edge highlight and a soft, layered shadow only where it floats above content. Choose enough opacity to keep text readable over both light and dark content. An opaque fallback is better than illegible transparency. Do not frame the reading canvas with an unnecessary border.
- Prefer a restrained wordmark with careful spacing. If an app mark is useful, draw one simple intentional geometric glyph within a rounded tile; do not use the Apple logo, SF Symbols files, or a stack of generic document icons as branding. Use the supplied icon library consistently for controls.

## Motion is a spatial contract

Implement the following as real stateful behavior, not styling notes:

- A toolbar control opens a sheet/popover from the same spatial origin. The source and destination have related shape and material. Selection and dismissal close naturally; repeated input can interrupt/reverse the transition. Focus enters appropriately and returns on close.
- The input capsule expands as the draft gains lines or attachments. Neighboring controls stay aligned, the text remains unstretched, and the draft survives navigation or layout changes. The send action changes into stop in the same place while work is running.
- An attachment enters as a recognizable object, its neighbors make room, and removal closes the gap. The object remains identifiable once associated with the message.
- Activity resolves into a completed summary without a page jump. Copy feedback briefly replaces or supplements the control in place. Returning to an earlier conversation restores useful reading context rather than forcing a scroll to the bottom.

Use Motion layout/presence animation or equivalent measured transitions. Prefer damped, controlled spring movement over wobbling or exaggerated bounce. Use the same physical character across related controls; quick feedback and larger surface movement need different timing. Do not fade whole paragraphs or animate streamed tokens. Design for keyboard, pointer, and touch; the interface should not depend on cursor-following effects.

## Adapt and finish

On small screens, keep the content plane and rounded controls. A popover can become a bottom sheet with clear dismissal, safe-area spacing, and full keyboard support. Account for the on-screen keyboard and avoid nesting several fixed-height scrollers. Keep the essential action reachable without overlapping the final content.

Provide complete reduced-motion and reduced-transparency/increased-contrast alternatives. MotionConfig/useReducedMotion and CSS preferences need to agree. Functional state changes remain immediate even when animation is removed. Native Liquid Glass rendering is not available through CSS; describe this implementation honestly as a web interpretation, not a native reproduction.

Judge the actual settled screens and recorded transitions: Are control surfaces visually related? Are curves and insets consistent? Does the interaction maintain object identity? Does the design still feel precise in a populated conversation? Are text and focus legible on real material backgrounds? Correct awkward geometry and temporal discontinuity before adding any new effect. Testing can establish function and accessibility findings; it cannot certify that a result is exceptional.
