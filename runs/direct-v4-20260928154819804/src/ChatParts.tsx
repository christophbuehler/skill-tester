import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUp, Check, ChevronDown, Circle, Copy, FileText, Paperclip, Plus, RotateCcw, Search, Square, X, AlertCircle } from 'lucide-react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat, formatBytes, type Attachment, type Conversation, type Message, type ToolStep } from '../shared/chat';

export type Chat = ReturnType<typeof useChat>;
export const spring = { type: 'spring' as const, stiffness: 420, damping: 42, mass: 1 };

export function ConversationList({ conversations, activeId, selectChat, newChat, mobile = false, searchRef }: {
  conversations: Conversation[];
  activeId: string;
  selectChat: (id: string) => void;
  newChat: () => void;
  mobile?: boolean;
  searchRef?: RefObject<HTMLInputElement | null>;
}) {
  const [filter, setFilter] = useState('');
  const localSearch = useRef<HTMLInputElement>(null);
  const fieldRef = searchRef || localSearch;
  const matches = conversations.filter(conversation => conversation.title.toLowerCase().includes(filter.trim().toLowerCase()));
  return <>
    <button className="new-chat button flex min-h-11 w-full items-center gap-3 rounded-xl bg-surface px-3 text-left hover:bg-surface-hover" onClick={() => { setFilter(''); newChat(); }} aria-label="New chat">
      <Plus size={19} aria-hidden="true" /> New chat
    </button>
    <div className="mt-8 flex min-h-0 flex-1 flex-col">
      {!mobile && <h2 className="mb-3 px-3 text-muted">Conversations</h2>}
      <div className="search-field mb-3 flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted focus-within:bg-surface">
        <Search size={18} aria-hidden="true" className="shrink-0" />
        <input ref={fieldRef} aria-label="Search conversations" placeholder="Find a conversation" value={filter} onChange={event => setFilter(event.target.value)} className="w-full min-w-0 bg-clear text-ink placeholder:text-muted" />
        {filter && <button className="icon-button -mr-2 shrink-0" onClick={() => { setFilter(''); fieldRef.current?.focus(); }} aria-label="Clear search"><X size={17} aria-hidden="true" /></button>}
      </div>
      <nav aria-label="Conversations" className="history-scroll min-h-0 flex-1 overflow-y-auto px-1 pb-2">
        <ul className="space-y-1">
          {matches.map(conversation => <li key={conversation.id}>
            <button onClick={() => selectChat(conversation.id)} aria-label={conversation.title} aria-current={conversation.id === activeId ? 'page' : undefined} className="conversation-row button relative flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-surface" title={conversation.title}>
              <span className="min-w-0 flex-1 break-words">{conversation.title}</span>
              {conversation.id === activeId && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />}
            </button>
          </li>)}
        </ul>
        {matches.length === 0 && <div className="px-3 py-4">
          <p className="text-muted" role="status">No matching conversations.</p>
          <button onClick={() => { setFilter(''); fieldRef.current?.focus(); }} className="button mt-2 min-h-11 text-accent underline decoration-rule underline-offset-4">Show all conversations</button>
        </div>}
      </nav>
    </div>
  </>;
}

export function FileItem({ file, onRemove }: { file: Attachment; onRemove?: () => void }) {
  const reduced = useReducedMotion();
  return <motion.li layout={reduced ? false : 'position'} initial={reduced ? false : { y: 5 }} animate={{ y: 0 }} transition={spring} className={`file-item flex min-w-0 items-center gap-3 ${onRemove ? 'pending-file bg-canvas' : 'submitted-file bg-surface'}`}>
    <FileText size={21} aria-hidden="true" className="shrink-0 text-muted" />
    <div className="min-w-0 flex-1">
      <p className="truncate" title={file.name}>{file.name}</p>
      <p className="text-muted">{formatBytes(file.size)}</p>
    </div>
    {onRemove && <button type="button" className="icon-button shrink-0 hover:bg-surface" aria-label={`Remove ${file.name}`} onClick={onRemove}><X size={18} aria-hidden="true" /></button>}
  </motion.li>;
}

function ToolActivity({ steps, busy, status }: { steps: ToolStep[]; busy: boolean; status?: Message['status'] }) {
  const [expanded, setExpanded] = useState(true);
  const complete = steps.filter(step => step.status === 'complete').length;
  const summary = busy ? 'Research activity' : status === 'stopped' ? 'Activity stopped' : status === 'error' ? 'Activity interrupted' : 'Research complete';
  return <div className="activity mb-6" data-testid="tool-activity">
    <button className="button flex min-h-11 w-full items-center gap-2 py-2 text-left" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="activity-steps">
      <span className={`activity-indicator ${busy ? 'is-busy' : ''}`} aria-hidden="true">{!busy && complete === steps.length ? <Check size={15} /> : <span />}</span>
      <span>{summary}</span>
      <ChevronDown size={17} aria-hidden="true" className={`ml-auto shrink-0 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
    </button>
    {/* Labels stay mounted through every supplied update and disclosure state. */}
    <div id="activity-steps" hidden={!expanded} className="activity-steps ml-2 border-l border-rule pb-2 pl-5">
      <ol className="space-y-2 py-2">
        {steps.map(step => <li key={step.id} className="flex items-start gap-3">
          {step.status === 'complete' ? <Check size={17} aria-hidden="true" className="mt-1 shrink-0 text-accent" /> : <Circle size={15} aria-hidden="true" className={`mt-1 shrink-0 ${step.status === 'running' ? 'text-accent' : 'text-muted'}`} />}
          <span className="min-w-0 flex-1">{step.label}</span>
          <span className="text-muted">{step.status === 'complete' ? 'Done' : !busy ? 'Paused' : step.status === 'running' ? 'Working' : 'Waiting'}</span>
        </li>)}
      </ol>
    </div>
  </div>;
}

function CopyResponse({ content }: { content: string }) {
  const [feedback, setFeedback] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try { await navigator.clipboard.writeText(content); setFeedback('copied'); }
    catch { setFeedback('failed'); }
    timer.current = setTimeout(() => setFeedback('idle'), 2800);
  }
  return <button onClick={copy} className={`button flex min-h-11 items-center gap-2 rounded-lg px-2 hover:bg-surface ${feedback === 'failed' ? 'text-danger' : feedback === 'copied' ? 'text-accent' : 'text-muted'}`}>
    {feedback === 'copied' ? <Check size={17} aria-hidden="true" /> : feedback === 'failed' ? <AlertCircle size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
    <span aria-live="polite">{feedback === 'copied' ? 'Copied' : feedback === 'failed' ? 'Copy failed. Try again' : 'Copy response'}</span>
  </button>;
}

function ScrollableContent({ kind, children }: { kind: 'table' | 'code'; children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const [edges, setEdges] = useState({ left: false, right: false });
  function measure() {
    const element = scrollRef.current;
    if (!element) return;
    const left = element.scrollLeft > 1;
    const right = element.scrollWidth - element.clientWidth - element.scrollLeft > 1;
    setEdges(current => current.left === left && current.right === right ? current : { left, right });
  }
  useLayoutEffect(measure, [children]);
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    return () => observer.disconnect();
  }, []);
  const overflowing = edges.left || edges.right;
  function scroll(direction: number) {
    const element = scrollRef.current;
    if (element) element.scrollBy({ left: direction * element.clientWidth * 0.75, behavior: 'instant' });
  }
  return <div className={`overflow-content overflow-${kind}`}>
    <div ref={scrollRef} className="content-scroll" tabIndex={0} role="region" aria-label={kind === 'table' ? 'Response table' : 'Code example'} aria-describedby={overflowing ? hintId : undefined} onScroll={measure}>
      {children}
    </div>
    {overflowing && <div className="overflow-controls flex items-center justify-between gap-3 text-muted">
      <p id={hintId}>{kind === 'table' ? 'Scroll for all columns' : 'Scroll to read the code'}</p>
      <div className="flex shrink-0 gap-1">
        <button className="icon-button" type="button" aria-disabled={!edges.left} aria-label={`Scroll ${kind} left`} onClick={() => { if (edges.left) scroll(-1); }}><ArrowLeft size={18} aria-hidden="true" /></button>
        <button className="icon-button" type="button" aria-disabled={!edges.right} aria-label={`Scroll ${kind} right`} onClick={() => { if (edges.right) scroll(1); }}><ArrowRight size={18} aria-hidden="true" /></button>
      </div>
    </div>}
  </div>;
}

// Stable renderer identities preserve horizontal scroll and focus as Markdown streams.
const markdownComponents: Components = {
  table: ({ children }) => <ScrollableContent kind="table"><table>{children}</table></ScrollableContent>,
  pre: ({ children }) => <ScrollableContent kind="code"><pre>{children}</pre></ScrollableContent>,
  img: ({ alt }) => <span>{alt}</span>,
};

export function Answer({ message, steps, busy, error, canRetry, retry }: {
  message: Message; steps: ToolStep[]; busy: boolean; error: string; canRetry: boolean; retry: () => void;
}) {
  return <article className="answer" aria-label="Folio response">
    <p className="mb-4 text-accent">Folio</p>
    {steps.length > 0 && <ToolActivity steps={steps} busy={busy} status={message.status} />}
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{message.content}</ReactMarkdown>
    </div>
    {error && <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl bg-danger-surface p-4 text-danger"><AlertCircle size={19} aria-hidden="true" className="mt-0.5 shrink-0" />{error}</p>}
    {message.status === 'stopped' && <p className="mt-4 text-muted">Response stopped. You can retry when you’re ready.</p>}
    <div className="response-actions -ml-2 mt-4 flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1">
      {!!message.content && message.status !== 'streaming' && <CopyResponse content={message.content} />}
      {message.status === 'streaming' && <p className="px-2 text-muted">{message.content ? 'Writing response' : 'Preparing response'}</p>}
      {canRetry && <button className="button flex min-h-11 items-center gap-2 rounded-lg px-2 text-accent hover:bg-accent-surface" aria-label="Retry response" onClick={retry}><RotateCcw size={17} aria-hidden="true" />Retry response</button>}
    </div>
  </article>;
}

export function Composer({ chat, textareaRef, hasMessages, onSend, onStop }: { chat: Chat; textareaRef: RefObject<HTMLTextAreaElement | null>; hasMessages: boolean; onSend: () => void; onStop: () => void }) {
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const valid = !!chat.draft.trim() || chat.pending.length > 0;
  // Once work begins, focus changes must not resize the adjacent reading area.
  const engaged = hasMessages || focused || valid || chat.busy || chat.canRetry || dragging;

  useLayoutEffect(() => {
    const field = textareaRef.current;
    if (!field) return;
    const resize = () => {
      field.style.height = '0px';
      const max = Math.max(80, Math.min(200, (window.visualViewport?.height || window.innerHeight) * 0.25));
      field.style.height = `${Math.min(Math.max(field.scrollHeight, hasMessages ? 44 : 64), max)}px`;
    };
    resize();
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    let live = true;
    document.fonts.ready.then(() => { if (live) resize(); });
    return () => { live = false; window.removeEventListener('resize', resize); window.visualViewport?.removeEventListener('resize', resize); };
  }, [chat.draft, hasMessages, textareaRef]);

  // Keep the input node, but dock it immediately: a travelling control covered
  // the new response during the previous welcome-to-work layout animation.
  return <div className="composer-position reading-width">
    {chat.notice && <p id="attachment-notice" role="alert" className="mb-3 flex items-start gap-2 rounded-xl bg-danger-surface p-3 text-danger"><AlertCircle size={19} className="mt-0.5 shrink-0" aria-hidden="true" />{chat.notice}</p>}
    <form className={`composer ${hasMessages ? 'is-working' : ''} ${engaged ? 'is-engaged' : ''} ${dragging ? 'is-dragging' : ''}`} data-testid="drop-zone"
      onSubmit={event => { event.preventDefault(); if (!chat.busy && valid) onSend(); }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
      onDragEnter={event => { event.preventDefault(); if (event.dataTransfer.types.includes('Files')) { dragDepth.current++; setDragging(true); } }}
      onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }}
      onDragLeave={event => { event.preventDefault(); dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setDragging(false); }}
      onDrop={event => { event.preventDefault(); dragDepth.current = 0; setDragging(false); chat.addFiles(event.dataTransfer.files); textareaRef.current?.focus({ preventScroll: true }); }}>
      <input ref={fileInput} type="file" aria-label="Upload files" accept=".txt,.md,.pdf,.png,.jpg,.jpeg" multiple className="hidden" onChange={event => { if (event.target.files) chat.addFiles(event.target.files); event.target.value = ''; textareaRef.current?.focus({ preventScroll: true }); }} />
      {dragging && <p className="drop-hint px-3 py-2 text-accent" role="status">Drop to attach</p>}
      {chat.pending.length > 0 && <ul className="pending-files mb-2 grid gap-2" data-testid="pending-attachments" aria-label="Attached files">
        {chat.pending.map(file => <FileItem key={file.id} file={file} onRemove={() => { chat.removeFile(file.id); textareaRef.current?.focus({ preventScroll: true }); }} />)}
      </ul>}
      <textarea ref={textareaRef} aria-label="Message" rows={1} value={chat.draft} onChange={event => chat.setDraft(event.target.value)} placeholder={hasMessages ? 'Ask a follow-up' : 'Ask a question'} aria-describedby={chat.notice ? 'attachment-notice' : undefined}
        className={`message-input ${hasMessages ? '' : 'invitation'}`}
        onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!chat.busy && valid) onSend(); } }} />
      {engaged && <div className="composer-tools mt-1 flex items-center justify-between gap-2">
        <button type="button" className="button attach-button flex min-h-11 items-center gap-2 px-3 text-muted hover:bg-surface-hover hover:text-ink" aria-label="Attach files" aria-describedby="file-limits" title="Attach files: PDF, text, Markdown or images. Up to 5 files, 10 MB each." onClick={() => fileInput.current?.click()}>
          <Paperclip size={19} aria-hidden="true" /><span className={hasMessages ? 'sr-only' : undefined}>Attach files</span>
        </button>
        <span className="composer-action flex h-11 w-11 shrink-0">
          {chat.busy ? <button type="button" className="send-button button flex h-11 w-11 shrink-0 items-center justify-center bg-ink text-on-accent hover:bg-ink-hover" aria-label="Stop response" title="Stop response" onClick={onStop}><Square size={17} fill="currentColor" aria-hidden="true" /></button>
            : valid && <button type="submit" className="send-button button flex h-11 w-11 shrink-0 items-center justify-center bg-accent text-on-accent hover:bg-accent-hover" aria-label="Send message" title="Send message"><ArrowUp size={21} aria-hidden="true" /></button>}
        </span>
      </div>}
    </form>
    <p id="file-limits" className="sr-only">PDF, text, Markdown or images. Up to 5 files, 10 MB each.</p>
  </div>;
}

export function DemoInfo({ dialogRef }: { dialogRef: RefObject<HTMLDialogElement | null> }) {
  return <dialog ref={dialogRef} aria-labelledby="demo-title" className="demo-dialog rounded-[20px] bg-canvas p-2 text-ink" onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
    <div className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id="demo-title" className="dialog-title">About this demo</h2>
        <button className="icon-button -mr-3" aria-label="Close demo information" onClick={() => dialogRef.current?.close()} autoFocus><X size={20} aria-hidden="true" /></button>
      </div>
      <p>Folio is a fictional research tool. Responses and tool activity are simulated.</p>
      <p className="mt-4 text-muted">Files stay in your browser. This demo uses file names and sizes, not document contents. Conversations reset when you reload.</p>
      <p className="mt-4 text-muted">Attach PDF, text, Markdown, PNG or JPEG files. Up to 5 files per question, 10 MB each.</p>
      <button className="button mt-6 min-h-11 rounded-xl bg-surface px-4 hover:bg-surface-hover" onClick={() => dialogRef.current?.close()}>Back to work</button>
    </div>
  </dialog>;
}
