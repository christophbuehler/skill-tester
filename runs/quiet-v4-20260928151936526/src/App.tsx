import { useEffect, useLayoutEffect, useRef, useState, type DragEvent } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowUp, ArrowUpRight, Check, ChevronDown, Copy, FileText, Info, Paperclip, Plus, RotateCcw, Square, X, Circle, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '@fontsource-variable/manrope';
import { useChat, formatBytes, type Attachment, type Message, type ToolStep } from '../shared/chat';

type Chat = ReturnType<typeof useChat>;
const spring = { type: 'spring' as const, bounce: 0, duration: 0.28 };

function FileItem({ file, onRemove, submitted = false }: { file: Attachment; onRemove?: () => void; submitted?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      layout={reduce ? false : 'position'}
      initial={reduce || submitted ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className={`file-item ${submitted ? 'file-submitted' : ''}`}
    >
      <FileText aria-hidden="true" className="size-5 shrink-0 text-secondary" strokeWidth={1.6} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold" title={file.name}>{file.name}</p>
        <p className="mt-0.5 text-xs text-secondary">{formatBytes(file.size)}</p>
      </div>
      {onRemove && <button type="button" aria-label={`Remove ${file.name}`} onClick={onRemove} className="file-remove press" title={`Remove ${file.name}`}><X aria-hidden="true" size={16} /></button>}
    </motion.div>
  );
}

function CopyButton({ content }: { content: string }) {
  const [state, setState] = useState<'ready' | 'copied' | 'failed'>('ready');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(content);
      setState('copied');
    } catch {
      setState('failed');
    }
    timer.current = setTimeout(() => setState('ready'), 3500);
  }
  return <button type="button" onClick={copy} className="response-action press" aria-label={state === 'copied' ? 'Copied response' : 'Copy response'}>
    {state === 'copied' ? <Check aria-hidden="true" size={15} /> : <Copy aria-hidden="true" size={15} />}
    <span aria-live="polite">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Couldn’t copy · try again' : 'Copy'}</span>
  </button>;
}

function ToolActivity({ tools, busy, interrupted }: { tools: ToolStep[]; busy: boolean; interrupted: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const current = tools.find(t => t.status === 'running');
  const complete = tools.filter(t => t.status === 'complete').length;
  return <section data-testid="tool-activity" aria-label="Tool activity" className="tool-activity">
    <button className="tool-summary press" type="button" aria-expanded={expanded} onClick={() => setExpanded(v => !v)}>
      {busy ? <span className="activity-mark" aria-hidden="true" /> : interrupted ? <Square size={13} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
      <span className="min-w-0 text-left">{busy ? current?.label ?? 'Preparing response' : interrupted ? 'Research stopped' : 'Research complete'}</span>
      <span className="tool-count" aria-label={`${complete} of ${tools.length} steps complete`}>{complete}/{tools.length}</span>
      <ChevronDown size={14} className={expanded ? 'rotate-180' : ''} aria-hidden="true" />
    </button>
    <div hidden={!expanded}>
      <ol className="tool-steps">
        {tools.map(tool => <li key={tool.id} className="flex min-w-0 items-center gap-2.5 py-2 text-[13px]">
          {tool.status === 'complete' ? <Check aria-hidden="true" size={15} className="shrink-0 text-accent" /> : tool.status === 'running' && interrupted ? <Square size={13} aria-hidden="true" className="shrink-0" /> : tool.status === 'running' ? <span className="activity-mark shrink-0" aria-hidden="true" /> : <Circle aria-hidden="true" size={12} className="shrink-0 text-secondary" />}
          <span>{tool.label}</span><span className="sr-only"> — {tool.status === 'running' && interrupted ? 'stopped' : tool.status}</span>
        </li>)}
      </ol>
    </div>
  </section>;
}

function Answer({ message, chat, latest, onRetry }: { message: Message; chat: Chat; latest: boolean; onRetry: () => void }) {
  const interrupted = message.status === 'stopped' || message.status === 'error';
  return <article className="answer" aria-label="Folio response">
    <div className="answer-byline"><span className="font-bold tracking-[-0.035em]">folio</span><span className="byline-rule" /></div>
    {latest && chat.tools.length > 0 && <ToolActivity tools={chat.tools} busy={chat.busy} interrupted={interrupted} />}
    {message.content ? <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{
      table: ({ children }) => <div className="table-scroll" tabIndex={0} role="region" aria-label="Response table"><table>{children}</table></div>,
      pre: ({ children }) => <pre tabIndex={0} role="region" aria-label="Code example">{children}</pre>,
      a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer">{children}</a>,
    }}>{message.content}</ReactMarkdown></div> : <p className="text-sm leading-7 text-secondary">{chat.busy && latest ? 'Working through your question' : 'No response content yet.'}</p>}
    {latest && chat.error && <div role="alert" className="response-error"><AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" /><p>{chat.error}</p></div>}
    <div className="mt-3 flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1">
      {message.content && message.status !== 'streaming' && <CopyButton content={message.content} />}
      {latest && chat.canRetry && <button type="button" onClick={onRetry} className="response-action text-accent press" aria-label="Retry response"><RotateCcw size={15} aria-hidden="true" />Retry response</button>}
      {message.status === 'stopped' && <span className="text-xs text-secondary">Response stopped</span>}
    </div>
  </article>;
}

function Header({ chat, onSelect, onNew }: { chat: Chat; onSelect: (id: string) => void; onNew: () => void }) {
  const [open, setOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const demoRoot = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const demoTrigger = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
      if (!demoRoot.current?.contains(event.target as Node)) setDemoOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (open) { setOpen(false); trigger.current?.focus(); }
      if (demoOpen) { setDemoOpen(false); demoTrigger.current?.focus(); }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open, demoOpen]);
  function select(id?: string) {
    setOpen(false);
    if (id) onSelect(id); else onNew();
  }
  return <header className="app-header">
    <a href="#workspace" className="skip-link">Skip to workspace</a>
    <div className="wordmark">folio<span className="text-accent">.</span></div>
    <div className="thread-nav" ref={root} onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
      <button ref={trigger} type="button" className="thread-trigger press" aria-label="Open conversations" aria-expanded={open} aria-controls="conversation-history" onClick={() => { setOpen(v => !v); setDemoOpen(false); }}>
        <span className="min-w-0 truncate" title={chat.active.title}>{chat.active.title}</span>
        <ChevronDown aria-hidden="true" size={15} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <motion.div
        id="conversation-history" role="region" aria-label="Conversations" aria-hidden={!open} inert={!open}
        initial={false}
        animate={{ opacity: open ? 1 : 0, y: open || reduce ? 0 : -7, scale: open || reduce ? 1 : 0.985 }}
        transition={reduce ? { duration: 0 } : spring}
        className={`history-panel ${open ? '' : 'pointer-events-none'}`}
      >
        <button type="button" onClick={() => select()} className="new-chat press" aria-label="New chat"><Plus size={18} aria-hidden="true" />New chat</button>
        <div className="mx-3 mb-2 mt-4 text-xs font-semibold text-secondary">Conversations</div>
        <nav aria-label="Conversation history" className="history-list">
          {chat.conversations.map(conversation => <button type="button" key={conversation.id} onClick={() => select(conversation.id)} aria-label={conversation.title} aria-current={chat.activeId === conversation.id ? 'page' : undefined} className="history-row press">
            <span className="min-w-0 flex-1 truncate">{conversation.title}</span>
            {chat.activeId === conversation.id && <Check size={16} aria-hidden="true" className="shrink-0 text-accent" />}
          </button>)}
        </nav>
      </motion.div>
    </div>
    <div className="demo-nav" ref={demoRoot} onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setDemoOpen(false); }}>
      <button ref={demoTrigger} className="demo-trigger press" type="button" onClick={() => { setDemoOpen(v => !v); setOpen(false); }} aria-expanded={demoOpen} aria-controls="demo-information"><Info size={14} aria-hidden="true" /><span>Demo</span></button>
      {demoOpen && <section id="demo-information" className="demo-panel" aria-label="About this demo">
        <div className="mb-2 flex items-center justify-between gap-3"><h2 className="font-semibold">A local demo</h2><button type="button" className="small-icon press" aria-label="Close demo information" onClick={() => { setDemoOpen(false); demoTrigger.current?.focus(); }}><X size={16} aria-hidden="true" /></button></div>
        <p>Responses and tool activity are simulated. Files stay in your browser; nothing is uploaded.</p>
        <p className="mt-3">Conversations last for this session and reset when you reload.</p>
      </section>}
    </div>
  </header>;
}

export default function App() {
  const chat = useChat();
  const empty = chat.messages.length === 0;
  const [engaged, setEngaged] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [awayFromBottom, setAwayFromBottom] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const composer = useRef<HTMLFormElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const reading = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const follow = useRef(empty);
  const focusReadingAfterNavigation = useRef(false);
  const restoreComposerFocus = useRef(false);
  const dragDepth = useRef(0);
  const previous = useRef({ activeId: chat.activeId, length: chat.messages.length });
  const reduce = useReducedMotion();
  const hasSubmission = Boolean(chat.draft.trim() || chat.pending.length);
  const showControls = engaged || hasSubmission || chat.busy || dragging;
  const last = chat.messages.at(-1);
  const currentTool = chat.tools.find(tool => tool.status === 'running');
  const recent = chat.conversations.filter(c => c.messages.length > 0 && c.id !== chat.activeId).slice(0, 3);

  useEffect(() => { document.title = 'Folio — Research workspace'; }, []);
  useLayoutEffect(() => {
    // Stop may disappear on natural completion while it owns keyboard focus.
    if (!chat.busy && restoreComposerFocus.current) {
      restoreComposerFocus.current = false;
      textarea.current?.focus({ preventScroll: true });
    }
  }, [chat.busy]);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const resize = () => {
      // Follow the on-screen keyboard, while leaving pinch zoom under user control.
      if (viewport.scale === 1) document.documentElement.style.setProperty('--viewport-height', `${viewport.height}px`);
    };
    resize();
    viewport.addEventListener('resize', resize);
    return () => {
      viewport.removeEventListener('resize', resize);
      document.documentElement.style.removeProperty('--viewport-height');
    };
  }, []);
  useLayoutEffect(() => {
    const input = textarea.current;
    if (!input) return;
    const resize = () => {
      input.style.height = '0px';
      input.style.height = `${Math.min(input.scrollHeight, Math.max(90, Math.min(220, (window.visualViewport?.height ?? window.innerHeight) * 0.23)))}px`;
    };
    resize();
    const observer = new ResizeObserver(resize);
    if (dock.current) observer.observe(dock.current);
    window.addEventListener('resize', resize);
    return () => { observer.disconnect(); window.removeEventListener('resize', resize); };
  }, [chat.draft, empty]);

  useLayoutEffect(() => {
    const changed = previous.current.activeId !== chat.activeId;
    const newMessage = previous.current.length !== chat.messages.length;
    if (changed) {
      follow.current = empty;
      setAwayFromBottom(false);
      if (scroller.current) scroller.current.scrollTop = 0;
    } else if (newMessage) {
      follow.current = true;
      if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
    }
    previous.current = { activeId: chat.activeId, length: chat.messages.length };
  }, [chat.activeId, chat.messages.length, empty]);

  useLayoutEffect(() => {
    // The welcome reading region is collapsed until the selected thread renders.
    if (!focusReadingAfterNavigation.current) return;
    focusReadingAfterNavigation.current = false;
    follow.current = false;
    setAwayFromBottom(false);
    if (scroller.current) scroller.current.scrollTop = 0;
    reading.current?.focus({ preventScroll: true });
  });

  useEffect(() => {
    if (!reading.current || !scroller.current) return;
    const observer = new ResizeObserver(() => {
      // Retain the end through completion and dock/keyboard resizing, without
      // pulling someone away from earlier text or a newly selected conversation.
      if (follow.current && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
    });
    observer.observe(reading.current);
    observer.observe(scroller.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const guard = (event: globalThis.DragEvent) => { event.preventDefault(); };
    window.addEventListener('dragover', guard);
    window.addEventListener('drop', guard);
    return () => { window.removeEventListener('dragover', guard); window.removeEventListener('drop', guard); };
  }, []);

  function focusInput() { textarea.current?.focus({ preventScroll: true }); }
  function selectConversation(id: string) {
    const populated = chat.conversations.find(conversation => conversation.id === id)?.messages.length;
    focusReadingAfterNavigation.current = Boolean(populated);
    chat.selectChat(id);
    setEngaged(false);
    // Resume in the reading region; only an empty conversation needs the keyboard.
    if (!populated) focusInput();
  }
  function newConversation() { chat.newChat(); focusInput(); }
  function send() { if (!chat.busy && hasSubmission) { chat.send(); focusInput(); } }
  function stop() { chat.stop(); focusInput(); }
  function retry() { chat.retry(); follow.current = true; focusInput(); }
  function leaveComposer(target: EventTarget) {
    // Completion does not collapse a surface in use. The next deliberate outside
    // action returns it to rest after activation, so a pointer-down cannot move
    // the Copy/Retry target before the click is committed.
    if (!chat.busy && !composer.current?.contains(target as Node) && !composer.current?.contains(document.activeElement)) setEngaged(false);
  }
  function drop(event: DragEvent) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (event.dataTransfer.files.length) chat.addFiles(event.dataTransfer.files);
    focusInput();
  }
  function scrollToLatest() {
    follow.current = true;
    setAwayFromBottom(false);
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: reduce ? 'instant' : 'smooth' });
  }

  return <MotionConfig reducedMotion="user">
    <div className={`folio-app ${empty ? 'is-empty' : 'has-messages'}`} onClick={event => leaveComposer(event.target)} onKeyUp={event => { if (event.key === 'Tab') leaveComposer(event.target); }}>
      <Header chat={chat} onSelect={selectConversation} onNew={newConversation} />
      <main id="workspace" tabIndex={-1} className="workspace" data-testid="drop-zone"
        onDragEnter={event => { event.preventDefault(); if (event.dataTransfer.types.includes('Files')) { dragDepth.current++; setDragging(true); } }}
        onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }}
        onDragLeave={event => { event.preventDefault(); dragDepth.current = Math.max(0, dragDepth.current - 1); if (dragDepth.current === 0) setDragging(false); }}
        onDrop={drop}>
        <h1 className="sr-only">{empty ? 'Folio research workspace' : chat.active.title}</h1>
        <div className="message-scroll" ref={scroller} onScroll={event => {
          const element = event.currentTarget;
          const away = element.scrollHeight - element.scrollTop - element.clientHeight > 100;
          follow.current = !away;
          setAwayFromBottom(away);
        }}>
          <div className="work-column messages" data-testid="messages" ref={reading} tabIndex={-1} role="region" aria-label="Conversation messages">
            {chat.messages.map((message, index) => message.role === 'user' ? <article className="question" key={message.id} aria-label="Your question">
              <p className="eyebrow">You</p>
              <p className="question-text">{message.content}</p>
              {!!message.attachments?.length && <div className="submitted-files">{message.attachments.map(file => <FileItem key={file.id} file={file} submitted />)}</div>}
            </article> : <Answer key={message.id} message={message} chat={chat} latest={index === chat.messages.length - 1} onRetry={retry} />)}
          </div>
        </div>
        <div className="composer-dock" ref={dock}>
          <div className="work-column relative">
            {!empty && awayFromBottom && <button type="button" className="latest-button press" onClick={scrollToLatest}><ArrowDown size={14} aria-hidden="true" />Latest response</button>}
            <form ref={composer} className={`composer ${engaged ? 'composer-engaged' : ''} ${dragging ? 'composer-dragging' : ''}`} onSubmit={event => { event.preventDefault(); send(); }}
              onFocus={() => setEngaged(true)}>
              {!!chat.pending.length && <div className="pending-files" data-testid="pending-attachments" aria-label="Pending attachments">
                {chat.pending.map(file => <FileItem key={file.id} file={file} onRemove={() => { chat.removeFile(file.id); focusInput(); }} />)}
              </div>}
              <label className="sr-only" htmlFor="message">Message</label>
              <textarea id="message" ref={textarea} value={chat.draft} rows={1} placeholder={empty ? 'What are you working through?' : 'Ask a follow-up'}
                className="message-input" onChange={event => chat.setDraft(event.target.value)}
                aria-describedby="message-keyboard-help"
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); }
                }} />
              <span id="message-keyboard-help" className="sr-only">Enter to send. Shift and Enter for a new line. Focus the message field to reveal attachment controls.</span>
              <input ref={upload} type="file" multiple className="sr-only" tabIndex={-1} aria-label="Upload files" accept=".txt,.md,.pdf,.png,.jpg,.jpeg" onChange={event => { if (event.target.files) chat.addFiles(event.target.files); event.target.value = ''; focusInput(); }} />
              {showControls && <div className="composer-controls">
                <button type="button" className="attach-button press" aria-label="Attach files" title="Attach files: PDF, TXT, MD, PNG or JPG. Up to 5 files, 10 MB each." onClick={() => upload.current?.click()}><Paperclip size={18} aria-hidden="true" /><span>Attach files</span></button>
                <span className="flex-1" />
                {chat.busy ? <button type="button" className="send-button press" aria-label="Stop response" title="Stop response" onClick={stop} onFocus={() => { restoreComposerFocus.current = true; }} onBlur={() => { restoreComposerFocus.current = false; }}><Square size={17} aria-hidden="true" fill="currentColor" /></button> : hasSubmission ? <button type="submit" disabled={chat.busy} className="send-button press" aria-label="Send message" title="Send message"><ArrowUp size={21} aria-hidden="true" /></button> : null}
              </div>}
            </form>
            {chat.notice && <p className="validation-notice" role="alert"><AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />{chat.notice}</p>}
          </div>
        </div>
        {empty && recent.length > 0 && <section className="recent-work work-column" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="mb-4 text-xs font-semibold tracking-[0.02em] text-secondary">Pick up a conversation</h2>
          <div>{recent.map(conversation => <button type="button" key={conversation.id} className="recent-row group press" aria-label={conversation.title} onClick={() => selectConversation(conversation.id)}>
            <div className="min-w-0"><span className="block text-sm font-semibold">{conversation.title}</span><span className="mt-1 block truncate text-[13px] text-secondary">{conversation.messages[0]?.attachments?.[0]?.name ?? conversation.messages[0]?.content}</span></div>
            <ArrowUpRight size={18} aria-hidden="true" className="shrink-0 text-secondary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>)}</div>
        </section>}
        <AnimatePresence>{dragging && <motion.div className="drop-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.12 }} aria-hidden="true"><div><Paperclip size={28} /><p>Drop documents into this conversation</p></div></motion.div>}</AnimatePresence>
      </main>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{chat.busy ? currentTool?.label ?? 'Preparing response' : last?.status === 'complete' ? 'Response complete. Ready to read or copy.' : last?.status === 'stopped' ? 'Response stopped. Retry is available.' : ''}</div>
    </div>
  </MotionConfig>;
}
