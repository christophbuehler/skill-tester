# Presentation contract

Import `{ useChat, formatBytes }` from `../shared/chat` and types as needed. Call `useChat()` once in App. It owns every state transition; do not duplicate its message or attachment state.

Return values:
- `conversations: { id, title, messages }[]`, `activeId`, `active` (current conversation), `messages` (current messages)
- `draft`, `setDraft(text)`, `pending` (Attachment[]), `notice` (validation feedback)
- `busy`, `canRetry`, `tools` (current ToolStep[]), `error`
- `send()`, `stop()`, `retry()`, `newChat()`, `selectChat(id)`, `addFiles(FileList | File[])`, `removeFile(id)`, `reset(scenario?)`
- `suggestions: string[]`; suggestion click should setDraft(text).

Message: `{id, role: 'user'|'assistant', content, attachments?: Attachment[], status?: 'streaming'|'complete'|'stopped'|'error'}`.
Attachment: `{id, name, size, type}`. ToolStep: `{id, label, status: 'pending'|'running'|'complete'}`.

Required accessible controls (exact labels): `Message` textarea, `Send message`, `New chat`, `Attach files`, `Stop response` while busy, `Retry response` when canRetry, `Remove <filename>` for pending attachments, `Open conversations` on mobile if sidebar hidden. File input must have aria-label `Upload files`. Conversation buttons' accessible names must equal conversation titles. Use `data-testid="messages"` for the message region, `data-testid="drop-zone"` on the file drop target, `data-testid="pending-attachments"` for pending chips, and `data-testid="tool-activity"` for visible steps. Render validation notice and response error with role="alert". Keep tool labels in the DOM as they update.

Guard drag/drop default behavior. Only call send once per user action and prevent default form submission. If busy, disable sending. Retry calls hook.retry; do not re-add the previous user message. Copy buttons use navigator.clipboard with visible feedback on success/failure.

The hook reads `?scenario=welcome|research|files|error`. It also listens for the comparison shell's typed scenario/reset messages and validates source/origin. No need to implement embedding logic. Runs are stateless across page reloads and independent from each other.
