# Equal implementation resources

Every profile, including baseline, receives the same locked dependencies and a blank presentation starter. No colors, components, theme, or default layout are supplied.

- React, TypeScript, Vite, Tailwind, lucide-react, react-markdown and remark-gfm.
- `motion` 13.4.4, importing from `motion/react`: motion elements, AnimatePresence, layout/layoutId, MotionConfig, useReducedMotion. CSS/WAAPI are also available. Use standard public APIs, not paid Motion+ APIs. Preserve semantic controls and stable input nodes.
- Local variable fonts `@fontsource-variable/geist` and `@fontsource-variable/manrope`, both 5.3.0. For example import `@fontsource-variable/manrope` in App.tsx and set font-family: 'Manrope Variable', sans-serif. Import only the faces you actually use. The CSS/font files bundle locally; no remote font calls. Platform system fonts remain available.
- CSS/SVG authored within src. No proprietary Apple font/SF Symbols assets are supplied.

Fonts use the SIL Open Font License. The repository publishes their licenses at /skill-tester/font-licenses.txt. Do not change or remove package files, fixtures, or lockfiles.

The runner captures resting screenshots after fonts and finite animations settle. It separately records live transition sequences with timestamps and contact sheets. Do not interpret intermediate animation opacity as a resting-state contrast defect; read the timeline and resting state together. Runtime errors, overflow, and automated accessibility findings accompany the refinement evidence.
