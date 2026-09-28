# Folio

A quiet editorial workspace: warm paper, botanical green, a layered-page mark, and a serif opening give research a considered, human character. The conversation is the primary object; suggested starting points make the empty view useful, then give way to a readable response column.

The interface uses the shared hook as the sole owner of chat and attachment state. Tool activity stays next to the current response with explicit status labels. Copy confirms its outcome, interrupted text remains readable, and retry has a direct recovery control. Following streamed content stops when the reader scrolls away. A native dialog provides mobile navigation with Escape handling and focus restoration. Reduced motion removes spatial transitions and rotation.

The desktop conversation rail becomes a mobile drawer; suggested cards become compact rows. Tables and code scroll within the reading column. File selection and drag-and-drop converge on the same local attachment workflow, with metadata, removal, and nearby validation.

Only system typography and locally authored graphics are used. No skill conflicts were encountered; the shared brief and presentation contract take precedence.

Verification: `pnpm typecheck` and `pnpm build --configLoader native` passed. The native loader avoids a sandbox-protected Vite temporary directory without changing configuration. End-to-end and screenshot verification were attempted but blocked: the sandbox denies a listening local server and Chromium's required process registration. Responsive, keyboard, and state behavior received a source review; live browser checks remain unverified.
