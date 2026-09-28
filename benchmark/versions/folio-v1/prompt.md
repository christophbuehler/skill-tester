Build a polished, state-of-the-art React and Tailwind interface for **Folio**, a fictional AI research assistant for professionals discussing documents and researching questions.

The interface should make it easy to move between conversations, discuss attached documents, and understand what the assistant is doing. Design the layout, visual identity, typography, color, and interactions yourself. No visual reference or prescribed aesthetic is supplied.

Implement all of these capabilities using the supplied headless `useChat` hook:
- Conversation sidebar with existing conversations, switching, and New chat.
- Empty conversation with helpful suggested prompts; a multiline message composer; Enter sends and Shift+Enter adds a newline.
- Streaming assistant responses rendered as Markdown including lists, tables, and code; copy-response control.
- File selection and drag-and-drop; pending attachment chips, removal, filename/size display, validation feedback, and attachments visible on sent messages. Accept .txt, .md, .pdf, .png, .jpg/.jpeg, max 10 MB each and 5 pending attachments. Explain that files stay local and agent responses are simulated.
- Visible agent activity with pending/running/completed tool steps, not hidden chain-of-thought.
- Stop during generation and Retry after failure or cancellation. Preserve partial text on stop.
- Mobile conversation navigation, keyboard accessibility, visible focus, reduced-motion support, and no horizontal page overflow at 390px.

Use the fixed data/content supplied by the hook. Do not implement a backend or call a real AI service. File contents must never leave the browser. Use react-markdown with remark-gfm for messages (HTML disabled). Available dependencies include lucide-react. Do not add dependencies, external scripts, remotely loaded fonts/assets, or network calls. System fonts and locally authored CSS/SVG are available equally to all profiles.

Read `CONTRACT.md` and the shared package before implementation. Write only `src/App.tsx`, `src/styles.css`, and optional other files beneath `src/` (except protected `src/main.tsx`). You may write DESIGN.md as a design note. Do not change the mock, fixtures, package versions, configuration, tests, or benchmark instructions. Do not inspect other variants or the host's projects/preferences. Make routine design decisions independently; the brief is complete.

Use all design skills explicitly selected by the profile, if any. The brief and contract take precedence over skill instructions. Follow each selected skill's applicable guidance within the allowed scope; record conflicts in DESIGN.md. No other skills, plugins, memory, subagents, or web research. A combined profile is one implementation using all selected skills, not a sequence of separately redesigned versions.

You may run `pnpm typecheck`, `pnpm build`, and `pnpm test:e2e` to verify. Browser screenshots can be captured with the installed Playwright API. Finish when the complete interface works; do not publish or commit anything.
