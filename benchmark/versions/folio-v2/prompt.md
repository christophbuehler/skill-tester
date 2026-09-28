Build a polished, state-of-the-art React and Tailwind interface for **Folio**, a fictional AI research assistant for professionals discussing documents and researching questions.

The interface should make it easy to move between conversations, discuss attached documents, and understand what the assistant is doing. Design the layout, visual identity, typography, color, and interactions yourself. No visual reference or prescribed aesthetic is supplied.

Using the supplied headless `useChat` hook, let people:
- Start a conversation and return to earlier conversations.
- Ask multiline questions, with Enter to send and Shift+Enter for a newline.
- Read streaming responses, including Markdown, lists, tables, and code, and copy a response.
- Select or drop documents, review and remove pending files, understand validation errors, and see which files accompany a message.
- Understand the assistant's current tool activity and whether work is pending, running, or complete.
- Stop work without losing partial output and retry interrupted or failed work.

Make starting work immediate and reading responses comfortable. Choose the information architecture, navigation, composition, and interaction patterns yourself. Suggested starting questions are available as optional content. No sidebar, card arrangement, attachment shape, or empty-state layout is required.

Support narrow screens, keyboard use, visible focus, reduced motion, and readable content without horizontal page overflow. The technical behavior and automation labels are in CONTRACT.md; labels do not prescribe visible copy or layout.

Use the fixed data/content supplied by the hook. Do not implement a backend or call a real AI service. File contents must never leave the browser. Use react-markdown with remark-gfm for messages (HTML disabled). Available dependencies include lucide-react. Do not add dependencies, external scripts, remotely loaded fonts/assets, or network calls. System fonts and locally authored CSS/SVG are available equally to all profiles.

Read `CONTRACT.md` and the shared package before implementation. Write only `src/App.tsx`, `src/styles.css`, and optional other files beneath `src/` (except protected `src/main.tsx`). You may write DESIGN.md as a design note. Do not change the mock, fixtures, package versions, configuration, tests, or benchmark instructions. Do not inspect other variants or the host's projects/preferences. Make routine design decisions independently; the brief is complete.

Use all design skills explicitly selected by the profile, if any. The brief and contract take precedence over skill instructions. Follow each selected skill's applicable guidance within the allowed scope; record conflicts in DESIGN.md. No other skills, plugins, memory, subagents, or web research. A combined profile is one implementation using all selected skills, not a sequence of separately redesigned versions.

You may run `pnpm typecheck`, `pnpm build`, and `pnpm test:e2e` to verify. The runner will perform browser checks and capture welcome, conversation, attachment, and activity states at desktop, intermediate, and mobile widths outside the sandbox. You will receive those images and observations in one equally timed refinement session. Do not spend time trying to bypass sandbox browser restrictions. Finish this implementation when the interface works; do not publish or commit anything.
