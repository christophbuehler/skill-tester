# Folio refinement review

No design skills were selected. Reviewed CONTRACT.md, shared/chat.ts, shared/engine.ts, the existing implementation, and the eight supplied captures. Preserved the paper and forest-green palette, serif headline, fixed fixture content, and hook-owned chat state.

## Observations from supplied evidence

- All eight reported states had no horizontal page overflow, and the report listed no runtime errors.
- Cancellation exposed retry. The reduced-motion check confirmed the composer was visible; neither that check nor static captures establishes motion quality.
- The mobile research capture used substantial vertical space for the user question and separator before the answer. The table continued past the reading viewport, with little indication of more content.
- The intermediate sidebar slogan wrapped into three lines and repeated the welcome message without helping navigation.
- Attachment, removal, and send controls were visually small. At 390px the file-limit footer disappeared. Source review also showed that phones slightly wider than 390px reverted to three cramped suggestion columns.

## Changes

- Reduced spacing around the user-message separator and composer to give responses more room. Retained multiline input and increased mobile textarea text to 16px.
- Added a Latest response control when content remains below the reading viewport. It scrolls the existing message region and resumes following streamed content.
- Removed the decorative sidebar slogan and composer tagline. Conversation navigation can scroll independently as conversations accumulate.
- Extended single-column suggestion rows through 560px, with slightly larger labels and consistent phone margins.
- Enlarged send, attachment, file removal, copy, and mobile navigation controls. Increased file-name and tool-status type sizes.
- Added an accessible File requirements toggle next to Attach documents, exposing supported types, size/count limits, and local-file handling on every screen size.
- Bounded pending-attachment height, added safe-area bottom spacing, and removed the phone shell's fixed minimum height to improve accommodation of short viewports.
- Made background content inert while mobile navigation is open; focus trapping ignores hidden buttons. Retained Escape dismissal, visible focus, reduced-motion rules, Markdown/GFM rendering with HTML disabled, and existing stop/retry/copy behavior.

## Verification and limits

- `pnpm typecheck`: passed.
- `pnpm build`: blocked by EPERM when Vite attempted to write its temporary bundled config into node_modules/.vite-temp.
- `pnpm test:e2e`: blocked by the same Vite temporary-config permission error before browser checks started.
- No sandbox workaround attempted. No interactive browsing performed. The changes have not received fresh browser captures or interaction checks in this session.
- The latest-response control, file-help disclosure, mobile keyboard sizing, menu focus behavior, updated spacing, and new breakpoint need browser confirmation. Motion quality remains unverified and requires interactive human review; no animation-quality conclusions are drawn from the supplied static evidence.
