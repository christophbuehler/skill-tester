# Folio v3: distinct art direction

V1 prescribed parts of the layout. V2 removed those prescriptions but the custom skill remained broad advice and the model still chose a conventional chat shell. V3 makes the profiles responsible for concrete composition, type, geometry, materials, primary input, and interaction choreography.

## Controlled resources

The three profiles are baseline-v3, modern-interface-craft-v3, and apple-design-v3. Model/reasoning remain gpt-6-astra/medium. All receive the same blank starter, hook, fixtures, neutral task, offline font options, Motion dependency, three-concept exploration requirement, 30-minute implementation budget, two 10-minute refinements, and one 10-minute objective repair total. Older runs and exact skill pins remain unchanged. New variables distinguish this batch from v2; cross-version changes do not isolate any one cause.

## Different visual hypotheses

Modern Interface Craft commits to an ink-dark, generously rounded creative instrument with a top-level history switcher, prominent Manrope/Geist typography, a restrained sharp accent, and a composer that retains its identity between entry and working states. Apple Design is an independent interpretation of Apple's public guidance: a light content plane, system-oriented type, floating rounded controls, anchored sheets, limited translucent functional material, and related spatial transitions. Neither skill bundles a finished Folio component; the models write the presentation.

## Evidence and judgment

Every capture waits for fonts and a 650ms settling interval; live recordings separately preserve intermediate states. Two recordings per capture phase exercise navigation, attachment addition/removal, sending, stop, retry, and completion. Full recordings are for human review; generating models receive sampled chronological contact sheets plus settled views and targeted automated accessibility observations. A contact sheet cannot establish frame pacing or tactile quality. The capture probe was exercised on an existing app before the batch.

Functional tests are a prerequisite, not the acceptance criterion for exceptional design. Review the actual product for:

- A recognizable silhouette and primary control, not just a changed color.
- Considered type hierarchy, proportions, curved geometry, and spacing at real reading sizes.
- A restrained, intentional identity rather than a decorative stock logo.
- Continuity between entry, attached document, active work, interruption, and completion.
- Discoverable history with complete keyboard/touch behavior and focus restoration.
- Useful mobile composition, readable material, and a complete reduced-motion path.

The author's observations and any remaining weaknesses should be reported with the results. A model's self-critique or an automated pass is not a certification of exceptional design. No run is silently rerolled or hand-polished.

## Observed results

The no-skill run (`baseline-v3-20260928114406138`) independently returned to a tinted, bordered left sidebar, editorial serif headings, uppercase metadata, and an outlined rectangular composer. It received the same blank starter and resources as the skills. This sample supports the practical diagnosis that removing layout prescriptions alone does not reliably overcome the model's familiar chat template; it does not establish a statistical result.

Modern Interface Craft (`modern-interface-craft-v3-20260928115437499`) changes the silhouette: a continuous graphite canvas, searchable top history, substantial 34px composer curves, Manrope headlines, a compact horizontal working dock, and a concentrated citron action. The second refinement moves running tool activity into the dock and collapses it after completion. The temporal captures show history disclosure, document reflow, send/stop/retry, and completion. Live browser review confirmed history search, conversation selection, dismissal, and focus restoration. It retains an uppercase “Room to think” eyebrow and familiar welcome copy despite the skill's sentence-case and compact-copy guidance. That is a visible instruction-following shortcoming, not an intended shared benchmark constraint.

Both runs completed two refinements with zero objective repairs. Their final sampled desktop/mobile accessibility scans reported no automated findings; that does not establish full accessibility conformance. Functional passes and the model's own design notes are evidence of implementation, not a visual-quality rating.

The initial Apple run (`apple-design-v3-20260928120519676`) used its one repair to disambiguate duplicate “New chat” controls. It then completed both design refinements but failed the final navigation check: an exiting history panel still advertised its New chat button, and the button detached while the test tried to activate it. The failed run and all captured evidence remain intact. No final refinement capture was produced after that failure, so its most recent full review images describe the first refinement, not the final source.

That finding led to a new skill revision pinned at `98691cb47275bdd60d850bc9864ec8b0effaddba`, registered as `apple-design-refined` with profile `apple-design-refined-v3`. It explicitly requires exiting controls to become inert and leave the accessibility tree immediately, and it gives clearer sentence-case and welcome-copy direction. The new run uses the unchanged v3 benchmark; the original Apple result is not reclassified or silently rerolled. Any comparison with the new revision is exploratory and includes this additional authoring feedback.

The refined Apple result (`apple-design-refined-v3-20260928122009613`) passed with two refinements and zero repairs. It uses a compact floating toolbar containing history, wordmark, and new-conversation controls, a light reading canvas, and a rounded working input with integrated circular controls. Its three-step activity surface stays in the reading flow, whereas Modern puts activity into its dark working dock. The final temporal review corrected composer-control distortion and separated surrounding text from the moving form. The final desktop/intermediate/mobile review reported no runtime errors, overflow, or automated accessibility findings. Sentence-case labels replace the previous uppercase eyebrows. Its wordmark and opening copy remain conventional; it is a calmer, differentiated product interpretation, not a certified exceptional design.

| Profile | Outcome | Refinements | Repairs | Elapsed |
| --- | --- | --- | --- | --- |
| No design skill v3 | Passed | 2 | 0 | 10.5 min |
| Modern Interface Craft v3 | Passed | 2 | 0 | 10.7 min |
| Apple Design, initial | Failed navigation check | 2 | 1 | 11.5 min |
| Apple Design, refined | Passed | 2 | 0 | 10.1 min |

All four records share the same task/starter hashes and model/reasoning settings. Each passing result publishes settled screens, two temporal contact sheets, and desktop/mobile recordings for all three review stages. The local Skill Creator paired reports compare each final skill with the same baseline; that reused baseline is explicitly identified. Their functional pass rates are non-discriminating and are not presented as design scores. No generated presentation source was manually edited after import.

During live publication review, the embedded browser crashed when starting either a WebM recording or an H.264 copy, while automated Chromium playback passed. Run details therefore shows temporal previews and downloadable H.264/MP4 files, plus the original WebM downloads, without an embedded video player. These compressed distribution copies preserve the recorded interaction sequence; generation inputs and original evidence remain unchanged. Tests verify downloads, decode the MP4 files with ffmpeg, and play a browser-supported recording format in an independent test player, not just load media metadata.
