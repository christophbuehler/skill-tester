---
name: nested-geometry
description: Design and audit coherent nested corners, insets, borders, and circular controls in product interfaces. Use when building rounded cards, composers, menus, dialogs, or controls whose child curves should follow their container, or when spacing and radii look arbitrary. Complements an art direction; does not prescribe a palette or layout.
---

# Nested geometry

A radius is a relationship to nearby edges, not a decoration picked independently for every component. Establish the silhouette, then derive nested shapes from the actual inset. Read the geometry in the rendered browser, because CSS may clamp radii when a box is too small.

## Work from visible edges

For a circular corner on a parent border box with used outer radius R, a child whose border box is inset equally by d from the parent's **outer** edge has concentric radius `max(0, R - d)`. In ordinary border-box layout, `d = parent border width + parent padding + child margin` (include any additional actual offset). Do not subtract the child's border width when calculating its outer radius. Its own inner edge subtracts its own border afterward.

Example: parent radius 32px, border 1px, padding 11px, child margin 0 gives child outer radius 20px. Repeating `rounded-3xl` on both creates an uneven channel. Express the relationship in custom properties, e.g. `--radius-inner: max(0px, calc(var(--radius-outer) - var(--border-width) - var(--inset)))`, and use it through Tailwind arbitrary-value utilities or semantic radius utilities. Derive responsive radii from responsive inset tokens; don't keep an old child radius after changing padding.

For an elliptical corner, subtract the horizontal and vertical edge offsets from the corresponding radius components separately. The `Rx-dx / Ry-dy` construction follows CSS inner-corner logic; it is **not** a mathematically exact constant-distance offset of an ellipse. If the inset consumes the radius, let the inner corner become square rather than forcing a negative value. Unequal offsets may require unequal corner radii; changing the padding can often produce a simpler design.

## Circles, capsules, and hit targets

A circular control at a rounded container corner is concentric only when `parent used radius = circle radius + actual outer-edge inset` on both axes. A 44px circle inset 10px wants a 32px parent corner. If the main container has a 24px corner, that circle has a different center: either change the geometry or deliberately move the control away from the corner. Avoid claiming every unrelated icon button must inherit its container's radius.

Separate visible geometry from target size. A smaller visible icon/control can sit within a larger transparent hit target; calculate from the **painted** edges while preserving adequate keyboard focus and touch area. Capsule radii are limited by half the short dimension. `9999px` is not the used radius: measure the box. Long pill inputs changing height need this recomputation.

## Audit before adding polish

1. Pick a small family of outer shapes appropriate to the design. Derive related inner shapes; unrelated elements may use their own family.
2. Annotate the key relationships in source with the outer radius, border, actual inset, and expected child radius. Avoid duplicating magic numbers.
3. Check empty, multiline, attached-file, busy, and small-screen states. Border width changes, inner wrappers, transform scaling, or overflow clipping can break the relationship.
4. Verify constant-looking channels at 100% and zoomed screenshots. Focus rings should follow their control, remain visible, and not be clipped by the parent. Shadows do not change border-box geometry.
5. Document intentional exceptions (e.g. a round icon centered in a rectangular toolbar), not excuses for random radii. Coherent shape alone does not make an interface well designed.

Run `node scripts/geometry.mjs <outerRadius> <border> <padding> [margin]` for the arithmetic. The helper calculates circular corner relationships only; it does not inspect layout or certify visual quality.

Source: [CSS Backgrounds and Borders Level 3, corner shaping and overlap](https://www.w3.org/TR/css-backgrounds-3/#corner-shaping). The formulas here apply those principles to nested independent elements; this is an original implementation guide, not a copied standards document.
