# Nested Geometry authoring checks

The skill was authored with the Skill Creator workflow and evaluated in two fresh agents, one with the skill and one without. Each agent answered the same two prompts from `skills/nested-geometry/evals/evals.json` without seeing the other answers. There was one response per prompt per configuration; no rerolls.

| Check | With skill | Without skill |
|---|---|---|
| 32px outer, 1px border, 11px padding produces 20px child outer and 18px child inner with a 2px child border | Pass | Pass |
| CSS derives child geometry from changing border/inset tokens | Pass | Pass |
| 44px circular button inset 12px has center 34px from both edges, not concentric with a 28px parent corner | Pass | Pass |
| Negative inner radius clamps to zero | Pass | Pass |
| 40px-high horizontal pill declared at 9999px uses a 20px radius when width is at least 40px | Pass | Pass |

Both configurations passed all five checks. This is a nondiscriminating arithmetic test, not evidence of improved design quality. The with-skill response additionally discussed painted versus hit-target geometry and repeated-state inspection, while the baseline also understood CSS radius clamping. The intended value is a reusable implementation/audit discipline; the generated application's source and rendered geometry must still be inspected.

Answers were graded from their actual arithmetic/CSS, supplemented by a deterministic pattern check; the helper has unit coverage for border/inset arithmetic, clamping, margins and invalid lengths. Exact elapsed time and token counts were not supplied by the agent interface and are unavailable, not zero. A local Skill Creator review was generated at `.local/nested-geometry-review.html`; its generic aggregation template defaults for missing timings are not measurements. No aesthetic score is asserted.
