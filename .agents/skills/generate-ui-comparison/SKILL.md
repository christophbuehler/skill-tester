---
name: generate-ui-comparison
description: Generate and validate comparable Folio chatbot interfaces using registered APM design skill profiles. Use for a new single-skill variant, comparisons of skills individually, or one version with multiple skills activated together. Not for styling the comparison website itself.
---

# Generate UI comparisons

Use the repository runner; do not generate variants directly in the main checkout or inherit this conversation's design instructions.

1. Read `README.md`, `benchmark/config.json`, and `profiles/registry.json` at the repository root. Resolve the requested skills against the registry. If a requested skill is missing, obtain its exact repository/subdirectory and immutable commit, check its license and runtime resources, then register it. Never silently substitute another skill.
For historical folio-v3 profiles, an unqualified request for Modern Interface Craft uses `modern-interface-craft-v3`, Apple Design uses `apple-design-refined-v3`, and the no-skill profile is `baseline-v3`. The first Apple profile `apple-design-v3` and unsuffixed Modern Interface Craft profile retain their historical pins and outcomes.

For folio-v4, the current single-skill defaults are `modern-interface-craft-light-v4` and `apple-design-emil-v4`. `studio-v4` is the explicitly combined light-direction profile. `considered-v4` preserves the earlier, interrupted five-skill candidate. `apple-design-emil` is the actual requested Emil upstream, distinct from the historical custom Apple interpretation. Read `docs/skill-catalog.md` for aliases, required sibling bundles, and blocked configurations. Do not claim all catalog entries were activated.

2. Interpret singular generation as one skill. “Compare A, B, C” means separate one-skill runs. “Together”, “combined”, or “all activated” means one profile containing all requested skills, in stated order. When ambiguous, ask whether the user wants individual runs or one combination. No-skill baseline uses an empty list.
3. Reuse an exact existing profile; otherwise run `pnpm run profile add <new-id> <skill-id> ...` and run `apm install` in its profile directory to create the lockfile. Profile IDs are immutable. Never install all registry skills in the repository's root context.
4. Run `pnpm generate <profile-id> --preflight`, then `pnpm generate <profile-id>`. For multiple profiles run sequentially because the local acceptance server uses a shared port. The runner starts fresh Codex sessions and records provenance, checks, and screenshots. For folio-v3/v4 it captures settled views, interaction recordings/contact sheets, and accessibility observations, and supplies two equally timed design refinement sessions to every profile. Let it enforce those phase limits and at most one objective repair total. Do not manually polish generated output or reroll a failed profile to make the comparison look better.
5. Run `pnpm validate`. Review the desktop/mobile screenshots and gallery. Failed runs remain visible. Any new attempt gets a fresh run ID; never overwrite a prior run. Preserve benchmark inputs across a comparison batch.
6. Report the run IDs, skill lists, pass/fail status, refinement and repair counts, and any limitations. Commit/push/deploy only when the user's request authorizes publication. When publishing, wait for CI on the pushed SHA and verify the live Pages site.

The shared brief wins over conflicting design guidance. All selected skill entrypoints must be read. APM dependencies, global skills, memory, and the coordinator's aesthetic preferences must not leak into other runs. If preflight fails, fix the runner isolation before generation, not the generated interface. Do not bypass the inventory check.

For an explicitly requested best-result/curated iteration, the runner also supports `pnpm generate <same-profile> --continue <imported-run-id> --review-notes <committed-markdown-path>`. This preserves the parent, verifies its source hash and exact skill/model settings, seeds only presentation source, and performs one additional fresh ten-minute review. Both passed and failed imported parents are allowed; the seeded source must pass host checks. Record concrete review findings, keep the new result labelled `curated-followup`, and never describe it as a new equal-budget benchmark or silently bypass the normal two-round cap. It receives a new immutable ID and its own evidence.
