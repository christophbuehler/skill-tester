import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { DragEvent, FormEvent, RefObject } from 'react';
import { ArrowDown, ArrowUp, ArrowUpLeft, Check, ChevronRight, Circle, Copy, FileText, FolderOpen, Layers2, Menu, MessageSquare, Paperclip, Plus, RotateCcw, Square, X, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '@fontsource-variable/geist';
import '@fontsource-variable/manrope';
import { useChat, formatBytes } from '../shared/chat';
import type { Attachment, Conversation, Message, ToolStep } from '../shared/chat';

function FolioMark({ small = false }: { small?: boolean }) {
  return <span className={`folio-mark ${small ? 'folio-mark--small' : ''}`} aria-hidden="true"><span /><span /><span /></span>;
}

function ConversationIndex({ conversations, activeId, onSelect, onNew, close }: {
  conversations: Conversation[]; activeId: string; onSelect: (id: string) => void; onNew: () => void; close?: () => void;
}) {
  return <div className="index-content flex h-full flex-col">
    <div className="flex items-center justify-between px-6 pb-8 pt-8">
      <div className="flex items-center gap-3"><FolioMark /><span className="wordmark">folio</span></div>
      {close && <button className="icon-button" type="button" aria-label="Close conversations" onClick={close}><X size={20} /></button>}
    </div>
    <div className="px-5">
      <button className="new-chat pressable flex w-full items-center gap-3 rounded-[10px] border border-line-strong bg-surface px-4 text-sm font-medium" type="button" aria-label="New chat" onClick={onNew}>
        <Plus size={18} aria-hidden="true" />New chat
      </button>
    </div>
    <div className="flex items-center justify-between px-7 pb-3 pt-9 text-xs font-medium text-secondary"><span>Conversations</span><span className="tabular-nums">{conversations.length}</span></div>
    <nav className="min-h-0 flex-1 overflow-y-auto px-3" aria-label="Conversations">
      <ul className="space-y-1">
        {conversations.map(conversation => {
          const hasFiles = conversation.messages.some(message => message.attachments?.length);
          const preview = conversation.messages.find(message => message.role === 'user')?.content;
          return <li key={conversation.id}>
            <button type="button" className={`conversation-item flex w-full gap-3 rounded-xl px-3 py-4 text-left ${conversation.id === activeId ? 'is-current' : ''}`} aria-label={conversation.title} aria-current={conversation.id === activeId ? 'page' : undefined} onClick={() => onSelect(conversation.id)}>
              {hasFiles ? <FileText size={17} className="mt-0.5 shrink-0" aria-hidden="true" /> : <MessageSquare size={17} className="mt-0.5 shrink-0" aria-hidden="true" />}
              <span className="min-w-0"><span className="block truncate text-[13px] font-semibold">{conversation.title}</span><span className="mt-1 block truncate text-xs font-normal text-secondary">{preview || 'No messages yet'}</span></span>
            </button>
          </li>;
        })}
      </ul>
    </nav>
    <div className="mx-6 mb-6 mt-8 border-t border-line pt-5 text-xs leading-relaxed text-secondary">
      <div className="mb-1 flex items-center gap-2 font-medium text-ink"><span className="session-dot" />This session</div>
      Conversations reset when you reload.
    </div>
  </div>;
}

function FileTile({ file, onRemove }: { file: Attachment; onRemove?: () => void }) {
  return <div className="file-tile flex min-w-0 items-center gap-3 border border-line bg-surface">
    <span className="file-symbol flex shrink-0 items-center justify-center bg-action-soft text-action"><FileText size={19} aria-hidden="true" /></span>
    <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-ink" title={file.name}>{file.name}</span><span className="mt-0.5 block text-[11px] text-secondary">{formatBytes(file.size)}</span></span>
    {onRemove && <button type="button" className="icon-button file-remove shrink-0" aria-label={`Remove ${file.name}`} onClick={onRemove}><X size={16} aria-hidden="true" /></button>}
  </div>;
}

function CopyResponse({ content }: { content: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(content);
      setState('copied');
      timer.current = setTimeout(() => setState('idle'), 2600);
    } catch { setState('failed'); }
  }
  return <div className="flex flex-wrap items-center gap-2">
    <button className="text-button pressable" type="button" onClick={copy} aria-label={state === 'copied' ? 'Copied' : 'Copy response'}>
      {state === 'copied' ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      <span>{state === 'copied' ? 'Copied' : 'Copy response'}</span>
    </button>
    <span role="status" className={state === 'failed' ? 'text-xs text-danger' : 'sr-only'}>{state === 'copied' ? 'Response copied to clipboard.' : state === 'failed' ? 'Copy failed. Select the response text to copy it.' : ''}</span>
  </div>;
}

function ToolActivity({ tools, busy }: { tools: ToolStep[]; busy: boolean }) {
  return <div data-testid="tool-activity" className="tool-activity rounded-xl border border-line bg-canvas px-4 py-3" role="group" aria-label="Tool activity">
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {tools.map(tool => <li key={tool.id} className={`flex items-center gap-2 text-[11px] leading-5 ${tool.status === 'running' && busy ? 'font-medium text-action' : 'text-secondary'}`}>
        {tool.status === 'complete' ? <Check size={13} aria-hidden="true" /> : tool.status === 'running' && busy ? <span className="activity-spinner" aria-hidden="true" /> : <Circle size={11} aria-hidden="true" />}
        <span>{tool.label}</span><span className="sr-only">: {tool.status === 'running' && !busy ? 'paused' : tool.status}</span>
      </li>)}
    </ul>
  </div>;
}

function MessageView({ message, tools, busy, error, retry }: { message: Message; tools?: ToolStep[]; busy: boolean; error?: string; retry?: () => void }) {
  if (message.role === 'user') return <article className="question-block" aria-label="Your message">
    <div className="mb-2 text-xs font-medium text-secondary">You</div>
    <p className="whitespace-pre-wrap break-words text-[16px] font-medium leading-relaxed text-ink">{message.content}</p>
    {!!message.attachments?.length && <div className="mt-4 flex flex-wrap gap-2">{message.attachments.map(file => <FileTile key={file.id} file={file} />)}</div>}
  </article>;

  return <article className="answer-block" aria-label="Folio response">
    <div className="mb-5 flex items-center gap-2.5"><FolioMark small /><span className="text-sm font-semibold">Folio</span>{message.status === 'streaming' && <span className="ml-1 text-xs text-secondary">Working on it…</span>}</div>
    {!!tools?.length && <ToolActivity tools={tools} busy={busy} />}
    {message.content ? <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
        table: ({ children }) => <div className="table-scroll" role="region" aria-label="Response table" tabIndex={0}><table>{children}</table></div>,
        pre: ({ children }) => <pre tabIndex={0}>{children}</pre>,
        img: ({ alt }) => <span>{alt}</span>,
      }}>{message.content}</ReactMarkdown>
    </div> : <p className="py-3 text-sm text-secondary">{message.status === 'streaming' ? 'Reviewing the context for your question…' : 'No response text yet.'}</p>}
    {error && <div role="alert" className="response-error mt-5 flex items-start gap-2.5 rounded-xl border border-danger-line bg-danger-soft p-4 text-sm leading-relaxed text-danger"><AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" /><span>{error}</span></div>}
    {message.status === 'stopped' && <p className="mt-4 text-xs text-secondary">Response stopped. Retry to generate the answer again.</p>}
    {message.status !== 'streaming' && <div className="mt-4 flex flex-wrap items-center gap-3">
      {message.content && <CopyResponse content={message.content} />}
      {retry && <button type="button" className="text-button pressable text-action" aria-label="Retry response" onClick={retry}><RotateCcw size={15} aria-hidden="true" />Retry response</button>}
    </div>}
  </article>;
}

function fitTextarea(ref: RefObject<HTMLTextAreaElement | null>) {
  if (!ref.current) return;
  ref.current.style.height = 'auto';
  ref.current.style.height = `${Math.min(ref.current.scrollHeight, 200)}px`;
}

export default function App() {
  const chat = useChat();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const reader = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const follow = useRef(false);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [showLatest, setShowLatest] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const empty = chat.messages.length === 0;
  const attachedCount = chat.messages.reduce((count, message) => count + (message.attachments?.length || 0), 0);

  useEffect(() => {
    document.title = 'Folio — Research workspace';
    const guard = (event: globalThis.DragEvent) => event.preventDefault();
    window.addEventListener('dragover', guard);
    window.addEventListener('drop', guard);
    return () => { window.removeEventListener('dragover', guard); window.removeEventListener('drop', guard); };
  }, []);

  useLayoutEffect(() => { fitTextarea(textarea); }, [chat.draft, empty]);
  useLayoutEffect(() => {
    follow.current = false;
    setShowLatest(false);
    if (reader.current) reader.current.scrollTop = 0;
  }, [chat.activeId]);
  useLayoutEffect(() => {
    if (reader.current && follow.current) reader.current.scrollTop = reader.current.scrollHeight;
  }, [chat.messages, chat.tools, chat.busy]);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 900px)');
    const closeOnDesktop = () => { if (query.matches && dialog.current?.open) dialog.current.close(); };
    query.addEventListener('change', closeOnDesktop);
    return () => query.removeEventListener('change', closeOnDesktop);
  }, []);

  function closeIndex() { dialog.current?.close(); }
  function selectConversation(id: string) { chat.selectChat(id); closeIndex(); }
  function newConversation() { chat.newChat(); closeIndex(); requestAnimationFrame(() => textarea.current?.focus()); }
  function sendMessage() {
    if (chat.busy || (!chat.draft.trim() && !chat.pending.length)) return;
    follow.current = true;
    chat.send();
    textarea.current?.focus();
  }
  function submit(event: FormEvent) { event.preventDefault(); sendMessage(); }
  function drop(event: DragEvent) {
    event.preventDefault(); dragDepth.current = 0; setDragging(false);
    if (event.dataTransfer.files.length) { chat.addFiles(event.dataTransfer.files); textarea.current?.focus(); }
  }
  function latest() {
    follow.current = true;
    if (reader.current) reader.current.scrollTop = reader.current.scrollHeight;
    setShowLatest(false);
  }
  const indexProps = { conversations: chat.conversations, activeId: chat.activeId, onSelect: selectConversation, onNew: newConversation };
  const announcement = chat.busy ? (chat.tools.find(tool => tool.status === 'running')?.label || 'Writing response') : chat.messages.at(-1)?.status === 'complete' ? 'Response ready.' : chat.messages.at(-1)?.status === 'stopped' ? 'Response stopped.' : '';

  return <div className="app-shell flex h-dvh overflow-hidden bg-canvas text-ink">
    <a className="skip-link" href="#message">Skip to message</a>
    <aside className="desktop-index w-[264px] shrink-0 border-r border-line bg-index"><ConversationIndex {...indexProps} /></aside>
    <main className="flex min-w-0 flex-1 flex-col bg-surface">
      <header className="workspace-header flex shrink-0 items-center justify-between gap-3 border-b border-line px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" className="mobile-only icon-button" aria-label="Open conversations" aria-expanded={indexOpen} aria-haspopup="dialog" onClick={() => { setIndexOpen(true); dialog.current?.showModal(); }}><Menu size={20} aria-hidden="true" /></button>
          <span className="desktop-only text-xs text-secondary">Workspace</span><ChevronRight size={13} className="desktop-only shrink-0 text-secondary" aria-hidden="true" />
          <h1 className="truncate text-[13px] font-medium">{chat.active.title}</h1>
        </div>
        {attachedCount > 0 && <span className="header-context flex shrink-0 items-center gap-1.5 text-xs text-secondary"><Paperclip size={14} aria-hidden="true" />{attachedCount}<span className="context-label">{attachedCount === 1 ? 'document' : 'documents'}</span></span>}
        <button className="mobile-only icon-button" type="button" aria-label="New chat" onClick={newConversation}><Plus size={21} aria-hidden="true" /></button>
      </header>

      <div className={`stage relative flex min-h-0 flex-1 flex-col ${empty ? 'stage--empty' : ''}`} data-testid="drop-zone"
        onDragEnter={event => { event.preventDefault(); if (event.dataTransfer.types.includes('Files')) { dragDepth.current++; setDragging(true); } }}
        onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }}
        onDragLeave={event => { event.preventDefault(); if (--dragDepth.current <= 0) { dragDepth.current = 0; setDragging(false); } }} onDrop={drop}>
        <div className="reading-scroll min-h-0 flex-1 overflow-y-auto" ref={reader} onScroll={() => {
          if (!reader.current) return;
          const distance = reader.current.scrollHeight - reader.current.scrollTop - reader.current.clientHeight;
          follow.current = distance < 90;
          setShowLatest(distance > 200);
        }}>
          <div className="working-column mx-auto" data-testid="messages" role="region" aria-label="Messages">
            {empty ? <div className="welcome">
              <div className="welcome-symbol mb-7 inline-flex items-center justify-center rounded-2xl bg-action-soft text-action"><Layers2 size={25} strokeWidth={1.5} aria-hidden="true" /></div>
              <h2>What are you<br className="welcome-break" /> working through?</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-secondary">Ask a question, or bring a document into the conversation.</p>
            </div> : <div className="message-list">
              {chat.messages.map((message, index) => <MessageView key={message.id} message={message} tools={index === chat.messages.length - 1 ? chat.tools : undefined} busy={chat.busy} error={index === chat.messages.length - 1 ? chat.error : undefined} retry={index === chat.messages.length - 1 && chat.canRetry ? () => { follow.current = true; chat.retry(); } : undefined} />)}
            </div>}
          </div>
        </div>

        <div className="compose-wrap relative shrink-0">
          {!empty && showLatest && <button type="button" className="latest-button pressable absolute left-1/2 flex items-center gap-2 rounded-full border border-line bg-surface px-4 text-xs shadow-[var(--elevation-control)]" onClick={latest}><ArrowDown size={14} aria-hidden="true" />Latest response</button>}
          <div className="working-column mx-auto">
            <form className={`composer border border-line-strong bg-surface shadow-[var(--elevation-control)] ${dragging ? 'composer--dragging' : ''}`} onSubmit={submit}>
              {!!chat.pending.length && <div data-testid="pending-attachments" className="pending-files flex flex-wrap gap-2" role="group" aria-label="Pending attachments">{chat.pending.map(file => <FileTile key={file.id} file={file} onRemove={() => { chat.removeFile(file.id); textarea.current?.focus(); }} />)}</div>}
              <label className="sr-only" htmlFor="message">Message</label>
              <textarea id="message" ref={textarea} rows={empty ? 3 : 2} value={chat.draft} onChange={event => chat.setDraft(event.target.value)} placeholder={empty ? 'Ask anything about your work…' : 'Ask a follow-up question…'} aria-describedby="composer-help" onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); sendMessage(); }
              }} />
              <div className="composer-toolbar flex items-center justify-between gap-3">
                <button type="button" className="attach-button pressable flex items-center gap-2 text-xs font-medium text-secondary" aria-label="Attach files" onClick={() => fileInput.current?.click()}><Paperclip size={17} aria-hidden="true" /><span>Attach files</span></button>
                <input type="file" ref={fileInput} className="hidden" aria-label="Upload files" multiple accept=".txt,.md,.pdf,.png,.jpg,.jpeg" onChange={event => { if (event.target.files) chat.addFiles(event.target.files); event.target.value = ''; }} />
                {chat.busy ? <button type="button" className="send-button pressable flex items-center gap-2 bg-ink text-on-action" aria-label="Stop response" onClick={chat.stop}><Square size={13} fill="currentColor" aria-hidden="true" /><span>Stop</span></button> : <button type="submit" className="send-button pressable flex items-center gap-2 bg-action text-on-action disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-ink" aria-label="Send message" disabled={!chat.draft.trim() && !chat.pending.length}><span>Send</span><ArrowUp size={17} aria-hidden="true" /></button>}
              </div>
            </form>
            {chat.notice && <div role="alert" className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-danger"><AlertCircle size={15} className="mt-px shrink-0" aria-hidden="true" /><span>{chat.notice}</span></div>}
            <div id="composer-help" className="composer-help mt-2.5 flex flex-wrap justify-between gap-x-3 gap-y-1 px-1 text-[11px] leading-relaxed text-secondary"><span>PDF, TXT, MD, PNG or JPG. Up to 5 files, 10 MB each.</span><span className="keyboard-hint">Enter to send <span className="px-1 text-line-strong">/</span> Shift + Enter for a new line</span></div>
          </div>
        </div>

        {empty && <div className="suggestions working-column mx-auto">
          <h3 className="mb-2 text-xs font-medium text-secondary">A few starting points</h3>
          <div className="suggestion-list">
            {chat.suggestions.map((suggestion, index) => {
              const SuggestionIcon = [FileText, Layers2, MessageSquare][index % 3];
              return <button key={suggestion} type="button" className="suggestion-row flex w-full items-center gap-3 border-b border-line text-left text-[13px]" onClick={() => { chat.setDraft(suggestion); textarea.current?.focus(); }}><SuggestionIcon className="shrink-0 text-secondary" size={17} strokeWidth={1.5} aria-hidden="true" /><span className="flex-1">{suggestion}</span><ArrowUpLeft size={15} className="suggestion-arrow text-secondary" aria-hidden="true" /></button>;
            })}
          </div>
        </div>}
        {dragging && <div className="drop-overlay absolute inset-3 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-action bg-action-soft text-action"><FolderOpen size={36} strokeWidth={1.5} aria-hidden="true" /><span className="text-lg font-semibold">Drop files into this conversation</span><span className="text-sm">Up to 5 files, 10 MB each</span></div>}
      </div>
      <footer className="demo-footer shrink-0 px-4 pb-4 pt-3 text-center text-[11px] leading-relaxed text-secondary"><span className="font-medium">Demo workspace.</span> Files stay in your browser. Responses are simulated.</footer>
    </main>

    <dialog ref={dialog} className="conversation-dialog border border-line bg-index text-ink shadow-[var(--elevation-panel)]" aria-label="Conversations" onClose={() => setIndexOpen(false)} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeIndex(); } }}>
      <ConversationIndex {...indexProps} close={closeIndex} />
    </dialog>
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
  </div>;
}
