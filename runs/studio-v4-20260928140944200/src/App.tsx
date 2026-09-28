import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowRight, ArrowUp, Check, ChevronDown, Circle, Copy, FileText, History, LoaderCircle, MessageSquare, Paperclip, Plus, RotateCcw, Square, X } from 'lucide-react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '@fontsource-variable/manrope';
import { useChat, formatBytes, type Attachment, type Message, type ToolStep } from '../shared/chat';

type Chat = ReturnType<typeof useChat>;
const spring = { type: 'spring' as const, bounce: 0, duration: 0.3 };
// Stable renderers keep a focused scroll region mounted as Markdown streams.
const markdownComponents: Components = {
  table: ({ children }) => <div className="table-scroll" role="region" aria-label="Response table" tabIndex={0}><table>{children}</table></div>,
  pre: ({ children }) => <pre role="region" aria-label="Code example" tabIndex={0}>{children}</pre>,
  a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer">{children}</a>,
};

function FileItem({ file, onRemove }: { file: Attachment; onRemove?: () => void }) {
  return <div className={`file-item flex min-w-0 items-center gap-3 ${onRemove ? 'bg-surface shadow-[var(--shadow-object)]' : 'bg-context'}`}>
    <span className="flex size-9 shrink-0 items-center justify-center text-accent"><FileText size={21} strokeWidth={1.6} aria-hidden="true" /></span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[13px] font-semibold" title={file.name}>{file.name}</span>
      <span className="block text-xs text-muted">{formatBytes(file.size)}</span>
    </span>
    {onRemove && <button type="button" className="icon-button size-11 shrink-0 rounded-[var(--file-control-radius)] text-muted hover:bg-context hover:text-foreground" aria-label={`Remove ${file.name}`} onClick={onRemove}><X size={17} aria-hidden="true" /></button>}
  </div>;
}

const PendingFile = forwardRef<HTMLDivElement, { file: Attachment; remove: () => void }>(function PendingFile({ file, remove }, ref) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  return <motion.div ref={ref} layout="position" inert={!present} aria-hidden={!present} initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : spring} className="min-w-0">
    <FileItem file={file} onRemove={remove} />
  </motion.div>;
});

function PendingFiles({ files, onRemove }: { files: Attachment[]; onRemove: (file: Attachment) => void }) {
  const list = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const element = list.current;
    if (!element) return;
    const measure = () => {
      const limit = Number.parseFloat(getComputedStyle(element.parentElement!).maxHeight);
      setHeight(files.length ? Math.min(element.offsetHeight, limit) : 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, [files.length]);
  // Keep presence alive even when empty. Animate measured space, never glyph scale;
  // the existing inner inset leaves room for active remove-button focus rings.
  return <motion.div initial={false} animate={{ height }} transition={reduced ? { duration: 0 } : spring} className="pending-files-viewport">
    <div ref={list} className="pending-files" data-testid="pending-attachments">
      <AnimatePresence initial={false} mode="popLayout">
        {files.map(file => <PendingFile key={file.id} file={file} remove={() => onRemove(file)} />)}
      </AnimatePresence>
    </div>
  </motion.div>;
}

function CopyResponse({ content }: { content: string }) {
  const [feedback, setFeedback] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  async function copy() {
    try { await navigator.clipboard.writeText(content); setFeedback('copied'); }
    catch { setFeedback('failed'); }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFeedback('idle'), 3500);
  }
  return <span className="relative inline-flex flex-wrap items-center gap-2">
    <button type="button" aria-label="Copy response" onClick={copy} className="text-action rounded-xl text-muted hover:bg-context hover:text-foreground">
      {feedback === 'copied' ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      <span>{feedback === 'copied' ? 'Copied' : feedback === 'failed' ? 'Try copying again' : 'Copy response'}</span>
    </button>
    <span role="status" className={feedback === 'failed' ? 'text-xs text-error' : 'sr-only'}>{feedback === 'copied' ? 'Response copied to clipboard.' : feedback === 'failed' ? 'Clipboard unavailable. Select the answer to copy it.' : ''}</span>
  </span>;
}

function ToolActivity({ steps, busy, status }: { steps: ToolStep[]; busy: boolean; status?: Message['status'] }) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const complete = steps.every(step => step.status === 'complete');
  const label = busy ? complete ? 'Writing response' : steps.find(step => step.status === 'running')?.label || 'Preparing response' : status === 'error' ? 'Research interrupted' : status === 'stopped' ? 'Research paused' : 'Steps complete';
  return <div className="tool-activity mb-5" data-testid="tool-activity">
    <div className="response-attribution flex min-h-11 items-center gap-3">
      <h2 className="shrink-0 text-[13px] font-bold tracking-[0.01em] text-accent">Folio</h2>
      <span className="h-px min-w-2 flex-1 bg-line" aria-hidden="true" />
      <button type="button" className="activity-disclosure flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-2 text-left text-xs text-muted hover:bg-context hover:text-foreground" aria-expanded={expanded} aria-controls={detailsId} onClick={() => setExpanded(value => !value)}>
        {busy ? <LoaderCircle size={15} className="activity-spinner shrink-0 text-accent" aria-hidden="true" /> : complete ? <Check size={15} className="shrink-0 text-accent" aria-hidden="true" /> : <Circle size={13} className="shrink-0" aria-hidden="true" />}
        <span>{label}</span>
        <span className="tabular-nums">{steps.filter(step => step.status === 'complete').length}/{steps.length}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
    </div>
    <ol id={detailsId} hidden={!expanded} className="activity-details mt-2 space-y-3 rounded-2xl border border-line bg-context px-4 py-3.5">
      {steps.map(step => <li key={step.id} className="flex items-center gap-2.5 text-[13px] text-muted">
        {step.status === 'complete' ? <Check size={15} className="text-accent" aria-hidden="true" /> : step.status === 'running' && busy ? <LoaderCircle size={15} className="activity-spinner text-accent" aria-hidden="true" /> : <Circle size={13} aria-hidden="true" />}
        <span className="flex-1">{step.label}</span><span className="text-xs">{step.status === 'complete' ? 'Done' : busy ? step.status === 'running' ? 'In progress' : 'Queued' : 'Incomplete'}</span>
      </li>)}
    </ol>
  </div>;
}

function Answer({ message, chat, last, onRetry }: { message: Message; chat: Chat; last: boolean; onRetry: () => void }) {
  const hasTools = last && chat.tools.length > 0;
  return <article className="answer min-w-0" aria-label="Folio response">
    {hasTools ? <ToolActivity steps={chat.tools} busy={chat.busy} status={message.status} /> : <div className="response-attribution mb-5 flex min-h-6 items-center gap-3">
      <h2 className="text-[13px] font-bold tracking-[0.01em] text-accent">Folio</h2>
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
      {message.status === 'streaming' && <span className="text-xs text-muted">{message.content ? 'Writing response' : 'Preparing response'}</span>}
      {message.status === 'stopped' && <span className="text-xs text-muted">Stopped</span>}
    </div>}
    {message.content ? <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{message.content}</ReactMarkdown></div> : message.status !== 'streaming' && <p className="py-1 text-[15px] text-muted">{message.status === 'stopped' ? 'The response was stopped before any text was written.' : 'The response could not be completed.'}</p>}
    {last && chat.error && <p role="alert" className="mt-5 rounded-xl border border-error-line bg-error-surface px-4 py-3 text-sm leading-relaxed text-error">{chat.error}</p>}
    {message.status !== 'streaming' && <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
      {message.content && <CopyResponse content={message.content} />}
      {last && chat.canRetry && <button type="button" className="text-action rounded-xl text-accent hover:bg-accent-soft" aria-label="Retry response" onClick={onRetry}><RotateCcw size={15} aria-hidden="true" />Retry response</button>}
    </div>}
  </article>;
}

function ConversationNavigation({ chat, onSelect }: { chat: Chat; onSelect: (id?: string) => void }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (container.current && !container.current.contains(event.target as Node)) {
        const focusWasInside = container.current.contains(document.activeElement);
        setOpen(false);
        if (focusWasInside) trigger.current?.focus();
      }
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  function select(id?: string) {
    setOpen(false);
    onSelect(id);
  }
  return <div ref={container} className="conversation-navigation relative min-w-0" onBlur={event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
  }}>
    <button ref={trigger} type="button" aria-label="Open conversations" aria-expanded={open} aria-controls="conversation-list" className={`current-conversation flex min-h-11 max-w-full items-center gap-2.5 rounded-2xl px-3 text-sm text-muted hover:bg-context hover:text-foreground ${open ? 'bg-context text-foreground' : ''}`} onClick={() => setOpen(value => !value)}>
      <History size={17} strokeWidth={1.7} className="shrink-0" aria-hidden="true" />
      <span className="truncate">{chat.active.title}</span>
      <ChevronDown size={15} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
    </button>
    <motion.nav id="conversation-list" aria-label="Conversations" aria-hidden={!open} inert={!open} initial={false} animate={{ opacity: open ? 1 : 0, y: open || reduced ? 0 : -7, scale: open || reduced ? 1 : 0.98 }} transition={reduced ? { duration: 0 } : spring} className={`history-panel absolute right-0 top-[calc(100%+10px)] z-40 border border-line bg-surface p-[7px] shadow-[var(--shadow-navigation)] ${open ? '' : 'pointer-events-none'}`}>
      <h2 className="px-3 pb-2 pt-3 text-xs font-semibold text-muted">Conversations</h2>
      <button type="button" onClick={() => select()} className="history-row mb-2 flex min-h-12 w-full items-center gap-3 bg-accent-soft px-3 text-left text-sm font-semibold text-accent hover:bg-accent-hover"><Plus size={18} aria-hidden="true" />New chat</button>
      <div className="history-list overflow-y-auto">
        {chat.conversations.map(conversation => <button type="button" key={conversation.id} aria-label={conversation.title} aria-current={conversation.id === chat.activeId ? 'page' : undefined} onClick={() => select(conversation.id)} className={`history-row flex min-h-14 w-full items-center gap-3 px-3 py-3 text-left hover:bg-context ${conversation.id === chat.activeId ? 'bg-context' : ''}`}>
          <MessageSquare size={17} strokeWidth={1.6} className="shrink-0 text-muted" aria-hidden="true" />
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{conversation.title}</span><span className="mt-0.5 block text-xs text-muted">{conversation.messages.length ? `${conversation.messages.filter(message => message.role === 'user').length} ${conversation.messages.filter(message => message.role === 'user').length === 1 ? 'question' : 'questions'}` : 'Ready for a question'}</span></span>
          {conversation.id === chat.activeId && <Check size={16} className="shrink-0 text-accent" aria-hidden="true" />}
        </button>)}
      </div>
    </motion.nav>
  </div>;
}

export default function App() {
  const chat = useChat();
  const reduced = useReducedMotion();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const messagePane = useRef<HTMLDivElement>(null);
  const readingContent = useRef<HTMLElement>(null);
  const readingControl = useRef<HTMLButtonElement>(null);
  const selectionFocus = useRef<'reading' | 'writing' | null>(null);
  const following = useRef(false);
  // Only viewport state is retained here. Conversation content stays in useChat.
  const scrollPositions = useRef(new Map<string, number>());
  const restoringScrollTop = useRef<number | null>(null);
  const previousScrollTop = useRef(0);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState({ overflow: false, atEnd: true });
  const [fileFeedback, setFileFeedback] = useState('');
  const welcome = chat.messages.length === 0;
  const recent = chat.conversations.filter(conversation => conversation.messages.length > 0).slice(0, 3);
  const lastMessage = chat.messages.at(-1);

  function focusComposer() { textarea.current?.focus({ preventScroll: true }); }
  function selectConversation(id?: string) {
    scrollPositions.current.set(chat.activeId, scroller.current?.scrollTop || 0);
    const hasMessages = chat.conversations.some(conversation => conversation.id === id && conversation.messages.length > 0);
    selectionFocus.current = hasMessages ? 'reading' : 'writing';
    if (id) chat.selectChat(id); else chat.newChat();
  }
  // Focus after the selected thread's accessible name and content have updated.
  useLayoutEffect(() => {
    if (selectionFocus.current === 'reading') scroller.current?.focus({ preventScroll: true });
    if (selectionFocus.current === 'writing') focusComposer();
    selectionFocus.current = null;
  }, [chat.active]);
  function resizeTextarea() {
    const element = textarea.current;
    if (!element) return;
    element.style.height = '0px';
    element.style.height = `${Math.max(44, Math.min(element.scrollHeight, Math.min(220, window.innerHeight * 0.25)))}px`;
  }
  useLayoutEffect(resizeTextarea, [chat.draft]);
  useEffect(() => {
    window.addEventListener('resize', resizeTextarea);
    const guard = (event: DragEvent) => { if (event.dataTransfer?.types.includes('Files')) event.preventDefault(); };
    window.addEventListener('dragover', guard);
    window.addEventListener('drop', guard);
    return () => { window.removeEventListener('resize', resizeTextarea); window.removeEventListener('dragover', guard); window.removeEventListener('drop', guard); };
  }, []);
  function measureReading() {
    const element = scroller.current;
    const pane = messagePane.current;
    const content = readingContent.current;
    if (!element || !pane || !content) return;
    // Compare with the entire pane, including the control row. Measuring only
    // the shortened scroller would make the row create its own overflow.
    const overflow = !welcome && content.scrollHeight > pane.clientHeight + 1;
    const atEnd = element.scrollHeight - element.scrollTop - element.clientHeight < 4;
    if (!overflow && document.activeElement === readingControl.current) element.focus({ preventScroll: true });
    setReading(previous => previous.overflow === overflow && previous.atEnd === atEnd ? previous : { overflow, atEnd });
    return overflow;
  }
  function followResponse() {
    const element = scroller.current;
    if (following.current && element && !welcome) {
      element.scrollTop = element.scrollHeight;
      previousScrollTop.current = element.scrollTop;
    }
    measureReading();
  }
  useLayoutEffect(() => {
    following.current = false;
    restoringScrollTop.current = scrollPositions.current.get(chat.activeId) || 0;
    measureReading();
  }, [chat.activeId]);
  useLayoutEffect(() => {
    const element = scroller.current;
    // Restore after the continuation row has reached its required layout;
    // otherwise an old, taller viewport can prematurely clamp the saved offset.
    if (element && restoringScrollTop.current !== null && measureReading() === reading.overflow) {
      element.scrollTop = restoringScrollTop.current;
      previousScrollTop.current = element.scrollTop;
      restoringScrollTop.current = null;
      measureReading();
    }
  }, [chat.activeId, reading.overflow]);
  // Completion may add Copy/Retry. Keep those actions in view only if the reader
  // was already following; never pull someone away from an earlier paragraph.
  useLayoutEffect(followResponse, [lastMessage?.content, lastMessage?.status, chat.busy, chat.messages.length]);
  useEffect(() => {
    const observer = new ResizeObserver(followResponse);
    if (scroller.current) observer.observe(scroller.current);
    if (readingContent.current) observer.observe(readingContent.current);
    return () => observer.disconnect();
  }, [welcome]);

  function handleReadingScroll() {
    const element = scroller.current;
    if (!element) return;
    const movedUp = element.scrollTop < previousScrollTop.current - 1;
    const movedDown = element.scrollTop > previousScrollTop.current + 1;
    if (movedUp) following.current = false;
    else if (movedDown && element.scrollHeight - element.scrollTop - element.clientHeight < 4) following.current = true;
    previousScrollTop.current = element.scrollTop;
    scrollPositions.current.set(chat.activeId, element.scrollTop);
    measureReading();
  }
  function navigateReading() {
    const element = scroller.current;
    if (!element) return;
    following.current = !reading.atEnd && chat.busy;
    const top = reading.atEnd ? 0 : chat.busy ? element.scrollHeight : element.scrollTop + element.clientHeight * 0.8;
    element.scrollTo({ top, behavior: reduced || chat.busy ? 'instant' : 'smooth' });
  }

  function send() {
    if (chat.busy || (!chat.draft.trim() && !chat.pending.length)) return;
    following.current = true;
    chat.send();
    focusComposer();
  }
  function retry() {
    following.current = true;
    chat.retry();
    // Retry disappears while streaming; leave focus on a persistent reading target.
    scroller.current?.focus({ preventScroll: true });
  }
  function stop() {
    chat.stop();
    scroller.current?.focus({ preventScroll: true });
  }
  function addFiles(files: FileList | File[]) { chat.addFiles(files); setFileFeedback('File selection updated.'); }
  const status = chat.busy ? chat.tools.length > 0 && chat.tools.every(step => step.status === 'complete') ? 'Writing response.' : chat.tools.find(step => step.status === 'running')?.label || 'Preparing response.' : lastMessage?.status === 'complete' ? 'Response complete.' : lastMessage?.status === 'stopped' ? 'Response stopped. Retry is available.' : '';

  return <MotionConfig reducedMotion="user">
    <div className="app-shell bg-canvas text-foreground">
      <a href="#main-content" className="skip-link rounded-xl bg-action px-4 py-3 text-action-foreground">Skip to conversation</a>
      <header className="app-header flex items-center justify-between gap-6">
        <span className="wordmark select-none text-foreground">folio<span className="text-accent">.</span></span>
        <ConversationNavigation chat={chat} onSelect={selectConversation} />
      </header>
      <main id="main-content" tabIndex={-1} className={`workspace min-h-0 ${welcome ? 'is-welcome' : 'is-working'}`} data-testid="drop-zone"
        onDragEnter={event => { event.preventDefault(); if (event.dataTransfer.types.includes('Files')) { dragDepth.current++; setDragging(true); } }}
        onDragOver={event => { event.preventDefault(); if (event.dataTransfer.types.includes('Files')) event.dataTransfer.dropEffect = 'copy'; }}
        onDragLeave={event => { event.preventDefault(); dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setDragging(false); }}
        onDrop={event => { event.preventDefault(); dragDepth.current = 0; setDragging(false); if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files); }}>
        <div ref={messagePane} className="message-pane relative min-h-0">
          <div ref={scroller} id="conversation-reader" className="message-scroll" role={welcome ? undefined : 'region'} aria-label={welcome ? undefined : 'Conversation'} tabIndex={welcome ? -1 : 0} onScroll={handleReadingScroll}
            onWheel={event => { if (event.deltaY < 0) following.current = false; }}
            onPointerDown={() => { following.current = false; }}
            onFocusCapture={event => { if (event.target !== event.currentTarget) following.current = false; }}
            onKeyDown={event => { if (['ArrowUp', 'PageUp', 'Home'].includes(event.key)) following.current = false; }}>
            <section ref={readingContent} data-testid="messages" className="reading-column">
              {welcome ? <div className="welcome-heading">
                <h1>What are you working on?</h1>
                <p className="mt-4 text-base leading-relaxed text-muted">Start with a question. Bring a document if it helps.</p>
              </div> : <div className="thread">
                <h1 className="sr-only">{chat.active.title}</h1>
                {chat.messages.map((message, index) => message.role === 'user' ? <article key={message.id} className="question" aria-label="Your question">
                  <h2 className="question-attribution mb-3 text-[13px] font-semibold text-muted">You</h2>
                  <p className="question-text whitespace-pre-wrap break-words">{message.content}</p>
                  {!!message.attachments?.length && <div className="mt-4 flex flex-wrap gap-2">{message.attachments.map(file => <FileItem key={file.id} file={file} />)}</div>}
                </article> : <Answer key={message.id} message={message} chat={chat} last={index === chat.messages.length - 1} onRetry={retry} />)}
              </div>}
            </section>
          </div>
          {!welcome && reading.overflow && <div className="reading-controls reading-column flex shrink-0 justify-end border-t border-line">
            <button ref={readingControl} type="button" aria-controls="conversation-reader" className="reading-control flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-medium text-muted hover:bg-context hover:text-foreground" onClick={navigateReading}>
              {reading.atEnd ? 'Back to top' : chat.busy ? 'Latest response' : 'Continue reading'}
              {reading.atEnd ? <ArrowUp size={15} aria-hidden="true" /> : <ArrowDown size={15} aria-hidden="true" />}
            </button>
          </div>}
        </div>
        <div className="composer-area reading-column">
          <form className={`composer relative border bg-surface shadow-[var(--shadow-instrument)] ${dragging ? 'border-accent' : 'border-control-line'}`} onSubmit={event => { event.preventDefault(); send(); }}>
            <input ref={fileInput} type="file" className="sr-only" tabIndex={-1} aria-label="Upload files" multiple accept=".txt,.md,.pdf,.png,.jpg,.jpeg" onChange={event => { if (event.target.files) addFiles(event.target.files); event.target.value = ''; }} />
            <PendingFiles files={chat.pending} onRemove={file => { chat.removeFile(file.id); setFileFeedback(`${file.name} removed.`); focusComposer(); }} />
            <div className="composer-row grid min-w-0 grid-cols-[44px_minmax(0,1fr)_44px] items-end gap-2">
              <button type="button" className="icon-button size-11 rounded-full text-muted hover:bg-context hover:text-accent" aria-label="Attach files" aria-describedby="file-guidance" title="Attach files · PDF, TXT, MD, PNG or JPG · 10 MB each" onClick={() => fileInput.current?.click()}><Paperclip size={21} strokeWidth={1.7} aria-hidden="true" /></button>
              <label htmlFor="message" className="sr-only">Message</label>
              <textarea ref={textarea} id="message" aria-label="Message" aria-describedby="keyboard-guidance" rows={1} placeholder={welcome ? 'Ask a question…' : 'Ask a follow-up…'} value={chat.draft} onChange={event => chat.setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }} className="message-input block min-w-0 w-full resize-none bg-surface text-base text-foreground placeholder:text-placeholder" />
              {chat.busy ? <button type="button" className="icon-button send-control size-11 rounded-full bg-action text-action-foreground hover:bg-action-hover" aria-label="Stop response" title="Stop response" onClick={stop}><Square size={15} fill="currentColor" aria-hidden="true" /></button> : <button type="submit" className="icon-button send-control size-11 rounded-full bg-action text-action-foreground hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-disabled-surface disabled:text-disabled-foreground" aria-label="Send message" title="Send message" disabled={!chat.draft.trim() && !chat.pending.length}><ArrowUp size={22} strokeWidth={1.8} aria-hidden="true" /></button>}
            </div>
            {dragging && <div className="drop-indicator pointer-events-none absolute inset-0 flex items-center justify-center gap-3 rounded-[inherit] border-2 border-dashed border-accent bg-accent-soft text-sm font-semibold text-accent"><Paperclip size={20} aria-hidden="true" />Drop files into this conversation</div>}
          </form>
          {chat.notice && <p role="alert" className="mt-3 rounded-xl border border-error-line bg-error-surface px-4 py-3 text-sm text-error">{chat.notice}</p>}
          <div className="composer-guidance mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 text-xs leading-relaxed text-muted">
            <p id="file-guidance">PDF, TXT, MD, PNG, JPG · 10 MB each · 5 files</p>
            <p id="keyboard-guidance" className="keyboard-guidance">Enter to send<span className="mx-2 text-line-strong">/</span>Shift + Enter for a new line</p>
          </div>
        </div>
        {welcome && recent.length > 0 && <section className="recent-work reading-column" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="mb-3 text-[13px] font-semibold text-muted">Pick up where you left off</h2>
          <div className="divide-y divide-line">
            {recent.map(conversation => <button type="button" key={conversation.id} aria-label={conversation.title} className="recent-row group flex min-h-20 w-full items-center gap-4 py-4 text-left" onClick={() => selectConversation(conversation.id)}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-muted group-hover:border-accent group-hover:text-accent">{conversation.messages.some(message => message.attachments?.length) ? <FileText size={18} strokeWidth={1.6} aria-hidden="true" /> : <MessageSquare size={18} strokeWidth={1.6} aria-hidden="true" />}</span>
              <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">{conversation.title}</span><span className="mt-1 block truncate text-[13px] text-muted">{conversation.messages.find(message => message.role === 'user')?.content}</span></span>
              <ArrowRight size={17} className="mr-1 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" aria-hidden="true" />
            </button>)}
          </div>
        </section>}
      </main>
      <footer className="app-footer text-center text-xs leading-relaxed text-muted"><span className="font-semibold">Local demo</span><span className="mx-2" aria-hidden="true">·</span>Files stay in your browser. Responses are simulated.</footer>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{status}</div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{fileFeedback}</div>
    </div>
  </MotionConfig>;
}
