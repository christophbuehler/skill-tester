# Folio v2 evaluation

V2 tests an outcome-based brief and a revised Modern Interface Craft skill. It preserves all v1 runs and pins. The v2 baseline and skill run receive identical prompts, starter, model/reasoning, implementation budget, browser evidence coverage, refinement budget, and one objective repair maximum. Only the selected skill differs within this pair.

Changes from v1 include removing prescribed navigation/attachment presentation, allowing disclosed navigation in acceptance tests, making starting suggestions optional, and adding a browser-informed refinement stage. Comparing v1 with v2 therefore measures multiple changes and does not isolate the skill revision.

## Functional evidence

Acceptance covers sending/streaming, stop/retry, conversation switching, attachment handling, Markdown/code, and responsive rendering. The full repository suite also checks drag/drop, keyboard composition, local-only requests, gallery behavior, and provenance. Accessibility findings remain separate and visible rather than being interpreted as an aesthetic score.

The host captures eight views before and after refinement: welcome and populated research at 1440×1000, 900×900, and 390×844, plus mobile attachment and active-tool states. It reports overflow, runtime errors, cancellation/retry availability, and reduced-motion composer visibility. Images are attached to the refinement model input. This verifies rendered states and provides visual feedback; it does not give the model live browser control or prove the quality of motion.

## Human design review

Review both runs on the same scenario and viewport, preferably without reading the profile label first. Use a short explanation rather than a pseudo-precise numerical score:

- Does the primary action dominate the empty state appropriately?
- Which elements compete unnecessarily with reading and writing?
- Does the populated state retain a coherent visual identity?
- Are attachments, tool progress, cancellation, and recovery easy to follow?
- Does navigation fit the task rather than merely repeat a standard shell?
- Does mobile composition preserve reachability and reading comfort?
- During live use, do transitions clarify cause and effect without delay or distraction?

Record concrete strengths and remaining problems. Passing tests is a functional result. Aesthetic preference requires human review, and one pair cannot establish a statistically reliable ranking.

## Initial pair

- Baseline: `baseline-v2-20260928110710085`; passed; one refinement; zero repairs.
- Modern Interface Craft: `modern-interface-craft-v2-20260928111429537`; passed; one refinement; zero repairs.
- Both prompt hashes: `345942eeb41f76f2c92c96f8448a7beae6093d1a35817eeb9c55c18ab8334937`.
- Both starter hashes: `612e9a78a9b37bcf32f30c3bfab89afa21edbbac32ffcb12c8a60bc4939c1437`.

The baseline retained warm green surfaces, serif display type, uppercase section labels, and a card-based empty state. The skill version uses a mostly neutral surface, sans-serif hierarchy, sentence-case labels, an earlier composer, and simple suggestion rows. Its refinement removed introductory ornament and sidebar footer copy, shortened the welcome heading, and restored the question and opening answer when entering an existing conversation. Both still chose a permanent desktop conversation rail. This is a noticeable change in restraint and emphasis, not a radically different interaction model or proof of cutting-edge motion.

Final automated findings: baseline has contrast findings (16 desktop elements, 6 mobile), missing top-level heading in the populated scenario, and a mobile scrollable-region keyboard finding. The skill run has one desktop contrast finding and the missing top-level heading in both populated captures. No mobile contrast violation was reported for the skill run. Node counts are diagnostic observations, not quality scores.

The paired Skill Creator review artifact is generated locally at `.local/modern-interface-craft-workspace/folio-v2-review.html`; the public gallery provides the live comparison and all before/after capture links in Run details.
