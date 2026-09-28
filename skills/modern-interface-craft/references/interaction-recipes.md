# Implementing continuous interaction

These are implementation decisions for the art direction, not finished components or a shared theme. Use the supplied hook as the only source of product state.

## One composer, two spatial states

Keep the input node stable while moving its wrapper between an entry position and a working dock. Use a layout-animated wrapper with layout-aware children to avoid scaling text. With Motion, a persistent `motion.div layout` can animate geometry; `layoutId` can connect equivalent surfaces, but two mounted input copies cause duplicate labels, focus loss, and state races. Avoid that duplication. Preserve the draft and focus across transition. Under reduced motion, place the surface immediately.

## Navigation reveal

Anchor history to the initiating control. Use a native dialog or a fully implemented nonmodal disclosure according to whether the rest of the app remains interactive. Give the opening surface an explicit role and name. Keep it mounted until exit finishes while removing it from interaction immediately on close. Focus must return to the trigger; Escape and keyboard selection work. Do not animate content from an unrelated edge just because a component library defaults to a drawer.

## File list reflow

Render pending items with stable IDs, layout-aware wrappers, and presence-aware entry/exit. Use a modest position transition rather than shrinking all text. Reserve sufficient room for the primary input. Removal changes hook state immediately; animation must not leave an invisible clickable target. Keep the filename, size, removal name, and error message accessible.

## Work status

Keep the send/stop control footprint constant. A small activity capsule can expand to reveal tool steps and contract after completion; maintain tool labels in the DOM if required by the contract. Use honest statuses. Keep a stopped partial answer readable and show retry next to the interrupted work. Do not put the whole response at reduced opacity while it is streaming.

## Feedback and preferences

A gentle press compression and focus outline complement an action. They do not replace the transition connecting the action to the outcome. Preserve semantic controls. Configure `MotionConfig reducedMotion="user"` and/or `useReducedMotion`, and CSS `prefers-reduced-motion`; remove travel, scale, overshoot, and smooth scrolling when requested. Never rely on animation completion to send, stop, or delete an item.

## Validate time, not only frames

Inspect the recorded sequence at normal speed and a few intermediate frames. Look for focus jumps, blank frames, glyph stretching, duplicate controls, jumping scroll positions, and snap-back on repeated input. Settled screenshots should wait for fonts and finite transitions. Compare both, and do not score an intentional intermediate state as a resting-state defect.

Technical references: [Motion layout](https://motion.dev/docs/react-layout-animations), [AnimatePresence](https://motion.dev/docs/react-animate-presence), [accessibility](https://motion.dev/docs/react-accessibility). Use only the installed version's public APIs; no paid Motion+ features are required.
