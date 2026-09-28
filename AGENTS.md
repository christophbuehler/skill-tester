# Skill Tester

React/TypeScript/Tailwind static comparison gallery, generated Folio interfaces, and isolated Codex/APM benchmark runner.

- Read README.md for commands and methodology.
- Treat runs/<id> as immutable evidence. Never hand-edit generated UI to improve its score. New attempts receive new IDs. Shared benchmark changes require a new benchmark version and a new comparison batch.
- Keep raw logs, auth, installed dependencies, and local scratch state out of Git.
- Use generate-ui-comparison for generating variants. Default one design skill per profile; explicitly combined requests use one profile containing all requested skills.
- Validate with pnpm validate. Publish only after CI passes on the latest pushed commit and check the live Pages URLs.
