---
name: motion-storytelling
description: Design and build short animated explanations with a clear causal story, consistent visual identity, meaningful transitions, timed narration and captions. Use for educational motion pieces, product explainers and animated walkthroughs; ordinary UI feedback does not require a narrated film.
---

# Motion Storytelling

Help an audience understand one idea through a visual transformation. Treat motion as explanation: the viewer should see what changes, why it changes, and what follows. Use the available model, tools and rendering stack; no particular assistant, vendor, logo, mascot or framework is required.

## Establish the learning target

Identify the topic, audience, central idea and desired deliverable from the request. Reduce the explanation to one accurate cause-and-effect relationship. Distinguish a useful visual analogy from the underlying mechanism; do not let the analogy imply something false.

For an otherwise unspecified short educational film, 75–90 seconds is a useful starting range. Adapt length to the idea and audience rather than padding a small explanation or rushing a complex one. Use the user's requested duration, aspect ratio, style and output format when supplied. Ask only for missing information that materially changes the result; state reasonable assumptions for the rest.

## Choose one visual system

Specify composition, type, palette, materials, depth, camera behavior and the role of recurring objects. Give objects stable visual identities across scenes so viewers can follow them without repeated labels. If a guide character helps, define its silhouette, scale and expressions; omit it when it distracts from the mechanism. Never invent an assistant-branded character by default.

The [brief template and optional handcrafted preset](references/brief-template.md) provide a reusable starting point. Torn paper, dry paint, pencil marks and tactile shadows are one possible visual language, not mandatory decoration. A clean product explanation may need only typography, restrained shapes and a few meaningful movements. Preserve the supplied brand and interface direction.

## Construct a causal sequence

A useful narrative progression is: attract attention with a question, establish familiar conditions, introduce a change, reveal the mechanism, show the discovery, demonstrate its consequence, and return to the central idea. These are story functions, not a requirement for exactly seven scenes. Every scene must add understanding.

Keep one primary visual idea in each shot. Let important transformations settle long enough to be read. Remove a secondary motion if it competes with the thing the audience needs to notice.

For each scene, record:

- Start/end time and the specific understanding it adds.
- Composition, objects, brief labels and camera behavior.
- Entrance, principal action, response and exit, including what remains continuous.
- Final narration, where speech is requested; estimate timing at roughly 125–145 words per minute, then verify against actual delivery and pauses.
- Sound cues and their synchronization, where audio is in scope.
- The object, position or relationship that connects it to the next scene.

Prefer a meaningful handoff over a generic transition. A line can become a route, a set of particles can form a structure, or one retained object can reveal a new relationship. Do not morph unrelated objects just to avoid a cut. A deliberate cut is valid for a real change of time, place or concept; explain its purpose. Camera movement should expose information, not merely keep the screen busy.

## Coordinate words, sound and motion

Use concrete, precise narration before introducing technical terminology. On-screen labels identify what the viewer needs to inspect; they should not duplicate a paragraph of speech. Captions are the accessibility exception: preserve the spoken meaning with readable timing and placement, without covering the mechanism.

Use sound to acknowledge an event or clarify a physical relationship. Avoid continuous decorative effects or music that obscures speech. Use supplied, original or appropriately licensed assets and record their provenance. Do not require sound or voice for a silent interactive walkthrough.

## Deliver the requested artifact

For planning requests, provide the concept, visual rules, timestamped storyboard, narration, transition map, sound plan and implementation approach as applicable. A character sheet is needed only if there is a recurring character.

When asked to build the animation, implement and render the complete requested piece rather than stopping at a mood board or isolated frame. In the absence of delivery specifications, 1920 × 1080 at 24 fps is a reasonable video default; adapt for mobile, portrait, web or the user's target. Keep editable source and explain how to reproduce the export. Clearly distinguish completed output from a storyboard or preview if rendering or audio tools are unavailable; never claim an export or viewing pass that did not happen.

Review the whole sequence at normal speed and sample key transitions. Check factual accuracy, continuity, narration fit, caption readability, silent comprehension where relevant, missing assets and the actual export duration/dimensions. For interactive work, additionally check interruption, keyboard/touch operation and reduced motion. Under reduced motion, convey the same relationships with immediate state changes, restrained local emphasis or a static sequence.

## Transfer to interface motion without turning the UI into a film

For product microinteractions, use only the relevant principles: one clear state change, stable object identity, understandable cause and effect, and a transition connected to its origin. Match timing to interaction frequency; do not delay a frequent action to finish a narrative beat. Keep state updates immediate, preserve focus and reading position, and make transitions interruptible.

Do not import the film duration, scene count, narration, soundtrack, texture animation or character into a normal application. In a clean Folio interface, a control appearing when useful or an attachment settling into place can carry the entire visual story. The active product design skill owns typography, color and geometry; this skill adds temporal clarity without replacing that direction.

## Origin

Adapted from the motion-design guide supplied in the user's screenshot. The educational-storytelling structure is retained in model-independent language; branded framing and the particular paper/mascot aesthetic are not prerequisites.
