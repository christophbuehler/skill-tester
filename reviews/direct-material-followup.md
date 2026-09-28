# User-directed composer motion and sidebar restraint

Apply this explicit user feedback to `direct-v4-20260928154819804`. These instructions supersede conflicting profile advice about history search, a placeholder-only resting composer, or an outlined focus treatment. Keep the shared behavior, exact fixtures, medium-weight typography, desktop sidebar and semantic colors unchanged.

## Composer

The user wants the input to respond like a physical material on focus, not acquire an outline. Remove the composer outline/ring, including the current spread-only box shadow. Use a clearly perceptible tonal surface change as a non-outline keyboard focus cue; reduced motion must retain that cue. Preserve normal visible keyboard focus for the individual controls.

At rest, show an operable plus button left of the placeholder, generous horizontal padding on both sides, and a more rounded but not capsule-shaped surface. The placeholder's text edge must align with the chat prose edge, not the outer edge of the composer. This alignment must remain fixed through focus/reveal; inset motion must not shift or scale the glyphs or caret.

On focus or plus activation, gracefully increase the material's height, reduce its horizontal padding and corner radius together, fade out the plus and reveal descriptive controls such as Attach files below the input. Keep Send absent until there is a valid submission. The plus should meaningfully expand/focus the composer, and must not vanish between pointer-down and click in a way that cancels its own action. Do not leave a hidden plus as a tab stop or drop keyboard focus to body when it disappears.

Use one persistent textarea, a coherent interruptible transition and measured geometry. Prefer animating the surrounding material and reserved control area independently from the stable text/content layout. Keep sibling text, reading position and pointer targets stable; no full-composer scale or long travel across messages. Derive child corners from the actual inset at each state. Make reversing focus halfway through, typing during expansion, multiline drafting, attachment addition/removal, stop/retry and mobile touch usable. Controls should remain present while focus is within the composer, while an interaction needs them, or while content/busy/error state requires them. Outside activation should not shift its target during the click. Preserve space for the expanded material so it does not cover response content. Apply the treatment in welcome and working views; preserve the user's restrained body typography.

## Sidebar

Remove search entirely, including its label and empty-search/reset UI; do not replace it with another search icon or command. History remains directly visible and independently scrollable.

The selected conversation uses its background tone as the sole decorative selection indicator. Remove the left stripe and trailing dot. Retain aria-current and appropriate keyboard focus feedback.

New chat is transparent at rest. Give it a restrained fill only on hover/press (and accessible keyboard focus feedback). Avoid adding any replacement ornaments.

## Review

Keep the scope to these changes. Record a concise design note explaining state geometry, stable text alignment and actual verification. Finish within this review session so the host can capture and test the result. Source checks are not motion verification; do not claim live browser inspection inside the sandbox. No new broad redesign, duplicate helper text or extra features.
