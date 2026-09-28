# Interaction recipes

Use these as decision aids, not components to copy. Keep the surrounding app's established behavior and the task's fixed contracts.

## Action with asynchronous feedback

Model idle → pending → success or error; allow cancellation where meaningful. The label explains the operation. Give pending state a stable footprint and an accessible status update. A text change plus a small indicator often communicates more than a spectacular loader. Prevent duplicate submissions without trapping keyboard focus. Error keeps the user's input and offers a concrete retry. Success can briefly acknowledge completion without holding up the next action. Reduced motion keeps the same states with no spatial animation.

## Contextual panel or mobile navigation

Tie the trigger visually and programmatically to the revealed surface. Choose a nonmodal region for parallel work; use modal semantics only if interaction with the rest of the interface is actually blocked. On opening a modal, place focus sensibly, keep it inside, support Escape, and restore the trigger on close. For a nonmodal disclosure, preserve normal keyboard traversal. Click outside is supplementary, not the only close method. Animate from the trigger's vicinity if it clarifies the relationship. Avoid scaling paragraphs or shifting the trigger beneath the pointer.

## Selection and filtering

Make the selected state persist independently of hover. Keep the item order stable during toggling unless reordering is the point. Preserve the current selection through filters or explain why it is no longer visible. Provide a useful no-results state and a clear reset. Don't animate all result items on every keystroke; users are scanning for a match. Use a consistent selection marker, not color alone.

## Streaming and multi-stage work

Separate user input, useful partial output, and current activity. The activity can expand for detail without dominating the result. Stop remains easy to reach; stopped and failed are different outcomes. Retry semantics follow the underlying logic. Announce concise status changes, not each token. Follow new output only while the user is already near the bottom; otherwise offer a way to return to the latest content. Do not imply a tool ran or a source was checked unless the underlying behavior actually reports it.

## Attachments and drag-and-drop

Provide a regular file picker alongside drop behavior. Highlight a valid drop region without blocking the composer or covering instructions. After selection, show name, relevant metadata, remove action, and validation feedback. Long names can wrap or truncate with a way to inspect them. Keep removal keyboard accessible and the layout stable. Never claim a file was uploaded when it only exists locally.

## Responsive inspector

A supporting inspector can sit beside primary content on a wide view, move below it at an intermediate width, and open as a reachable disclosure on a small screen. Preserve the selected object between these layouts. Avoid mounting duplicate stateful copies of the same control. If details are crucial to the main job, keep them in the reading flow rather than hiding them.

## Motion decisions

Specify the start and end states before choosing CSS. For a disclosure, preserve the trigger's position and connect the appearing surface to its context. For a pending item, acknowledge addition and removal without shifting unrelated controls. For asynchronous work, let progress resolve into its outcome rather than replaying an entrance animation on each update. Keep repeated actions immediate and make changes reversible when users act quickly.

Choose implementation and timing for that relationship. There is no default card-hover lift or decorative entrance snippet. Reduced motion should express the same semantic change without spatial animation. Check real interaction when browser access permits; screenshots only establish static states.

## Review prompts

- Can a first-time user identify the next useful action without hunting?
- What visibly changes after keyboard activation? Does focus remain intelligible?
- Does the empty state help someone start, and does the error state help them recover?
- Does the interface still look intentional with long content and one fewer column?
- Does motion explain a transition or merely announce that animation is available?
- Which single decision makes this interface feel particular to its content?
