# Sources and interpretation

Reviewed 2026-09-28. Original synthesis; links support principles, not a claim of official endorsement. The skill's pixel ranges, web layout defaults, and implementation recipes are our art direction rather than Apple's specifications.

Apple's [Materials guidance](https://developer.apple.com/design/human-interface-guidelines/materials) places Liquid Glass in a functional layer for controls/navigation, differentiates that from the content layer, and cautions against excessive use. This skill applies that separation with a small number of legible floating web surfaces; blur alone is not an implementation of native Liquid Glass.

[Meet Liquid Glass, WWDC25](https://developer.apple.com/videos/play/wwdc2025/219/) explains rounded floating geometry, adaptation to underlying content, related control shapes, and continuity as a control opens into a larger surface. It also covers reduced transparency, contrast, and motion accommodations. The web translation here emphasizes anchored reveals and readable fallback surfaces rather than simulating all optical effects.

Apple's [Motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion) treats motion as feedback and a way to communicate status. Our recipes use bounded, interruptible state transitions, not perpetual ornamental motion.

Apple's [Layout guidance](https://developer.apple.com/design/human-interface-guidelines/layout) and [Typography guidance](https://developer.apple.com/design/human-interface-guidelines/typography) are reference entry points. Direct static retrieval returned JavaScript shells for some HIG pages; the Materials/Motion indexed content and the full WWDC transcript were readable. No assertion is based on unseen screenshots. For platform font context see [Fonts](https://developer.apple.com/documentation/technologyoverviews/fonts).

For React implementation use the installed [Motion layout APIs](https://motion.dev/docs/react-layout-animations) and [accessibility controls](https://motion.dev/docs/react-accessibility), or equivalent CSS/WAAPI. Those tools support the direction; the presence of an animation library is not evidence of good design.

Do not redistribute Apple font or SF Symbols downloads as web assets. Use platform system fonts, licensed local fallback fonts, and the supplied general-purpose icons. No Apple branding or proprietary assets are bundled with this skill.
