import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUp, ArrowUpRight, Check, ChevronRight, Circle, Copy, FileText, Layers, Menu, MessageSquare, Paperclip, Plus, Search, ShieldCheck, Square, X, RotateCcw, LoaderCircle, PanelLeftClose, BookOpen, AlertCircle } from 'lucide-react';
import { useChat, formatBytes, type Attachment } from '../shared/chat';

function Mark({ small = false }: { small?: boolean }) {
  return <span className={`folio-mark ${small ? 'small' : ''}`} aria-hidden="true"><span /><span /><span /></span>;
}
function FileChip({ file, remove }: { file: Attachment; remove?: () => void }) {
  return <div className="file-chip"><span className="file-icon"><FileText size={17} /></span><span className="file-meta"><strong title={file.name}>{file.name}</strong><span>{formatBytes(file.size)}</span></span>{remove && <button type="button" className="icon-button" aria-label={`Remove ${file.name}`} onClick={remove}><X size={15} /></button>}</div>;
}
function CopyResponse({ content }: { content: string }) {
  const [state, setState] = useState('');
  async function copy() { try { await navigator.clipboard.writeText(content); setState('Copied'); } catch { setState('Could not copy'); } }
  return <button className="copy-button" onClick={copy} aria-label="Copy response">{state === 'Copied' ? <Check size={14} /> : <Copy size={14} />}<span aria-live="polite">{state || 'Copy response'}</span></button>;
}
export default function App() {
  const chat = useChat();
  const [navOpen, setNavOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const scrollArea = useRef<HTMLDivElement>(null);
  const navClose = useRef<HTMLButtonElement>(null);
  const navTrigger = useRef<HTMLButtonElement>(null);
  const follow = useRef(true);
  const dragDepth = useRef(0);
  const empty = chat.messages.length === 0;
  useEffect(() => { if (follow.current && scrollArea.current) scrollArea.current.scrollTop = scrollArea.current.scrollHeight; }, [chat.messages, chat.tools]);
  useEffect(() => { follow.current = true; if (scrollArea.current) scrollArea.current.scrollTop = 0; }, [chat.activeId]);
  useEffect(() => { if (navOpen) navClose.current?.focus(); }, [navOpen]);
  function closeNav() { setNavOpen(false); navTrigger.current?.focus(); }
  function submit() { if (!chat.busy) { follow.current = true; chat.send(); composer.current?.focus(); } }
  return <div className="app-shell">
    {navOpen && <div className="nav-backdrop" onClick={closeNav} />}
    <aside className={`sidebar ${navOpen ? 'is-open' : ''}`} aria-label="Conversations" onKeyDown={e => { if (e.key === 'Escape') closeNav(); if (e.key === 'Tab' && navOpen) { const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button')); const first = buttons[0]; const last = buttons[buttons.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } } }}>
      <div className="brand"><div className="brand-name"><Mark /><span>folio<span className="brand-dot">.</span></span></div><button ref={navClose} className="icon-button mobile-only" onClick={closeNav} aria-label="Close conversations"><PanelLeftClose size={20} /></button><span className="edition">WORKSPACE</span></div>
      <button className="new-chat" aria-label="New chat" onClick={() => { chat.newChat(); setNavOpen(false); composer.current?.focus(); }}><Plus size={18} />New chat<span className="new-chat-plus">↗</span></button>
      <div className="nav-label">YOUR CONVERSATIONS <span>{chat.conversations.length.toString().padStart(2, '0')}</span></div>
      <nav className="conversation-list">{chat.conversations.map(c => <button key={c.id} aria-label={c.title} aria-current={chat.activeId === c.id ? 'page' : undefined} className={`conversation ${chat.activeId === c.id ? 'selected' : ''}`} onClick={() => { chat.selectChat(c.id); setNavOpen(false); composer.current?.focus(); }}><MessageSquare size={16} /><span>{c.title}</span>{chat.activeId === c.id && <span className="active-dot" />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="local-note"><span className="local-note-icon"><ShieldCheck size={19} /></span><strong>A little room to think.</strong><p>Your files stay in your browser.<br />Your next idea starts here.</p><span className="local-badge"><span />LOCAL WORKSPACE</span></div><div className="profile"><div className="avatar">YO</div><div><strong>Your workspace</strong><span>Personal · Preview</span></div><span className="profile-dot" /></div></div>
    </aside>
    <main className="workspace" inert={navOpen ? true : undefined}>
      <header className="topbar"><div className="breadcrumb"><button ref={navTrigger} className="icon-button mobile-only" aria-label="Open conversations" onClick={() => setNavOpen(true)}><Menu size={21} /></button><span className="breadcrumb-root">Workspace</span><ChevronRight size={14} /><span className="current-title">{chat.active.title}</span></div><span className="preview-badge"><span /> Research preview</span></header>
      <div className="workspace-body" data-testid="drop-zone" onDragEnter={e => { e.preventDefault(); dragDepth.current++; if (e.dataTransfer.types.includes('Files')) setDragging(true); }} onDragOver={e => { e.preventDefault(); }} onDragLeave={e => { e.preventDefault(); dragDepth.current--; if (dragDepth.current <= 0) setDragging(false); }} onDrop={e => { e.preventDefault(); dragDepth.current = 0; setDragging(false); chat.addFiles(e.dataTransfer.files); }}>
        {dragging && <div className="drop-overlay"><Paperclip size={32} /><strong>Bring your documents into the conversation</strong><span>Drop up to 5 files · 10 MB each</span></div>}
        <div className={`message-scroll ${empty ? 'is-empty' : ''}`} ref={scrollArea} onScroll={e => { const el = e.currentTarget; follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100; }}>
          {empty ? <section className="welcome">
            <div className="welcome-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><span className="art-dot" /><div className="paper paper-back" /><div className="paper paper-front"><Mark small /><div className="paper-line long" /><div className="paper-line" /><div className="paper-line medium" /><div className="paper-highlight" /><div className="paper-line" /></div><span className="art-spark">✳</span></div>
            <div className="eyebrow">A CLEARER PICTURE STARTS HERE</div><h1>Make room for<br /><em>your next idea.</em></h1><p className="welcome-description">Bring your documents, questions, and half-formed thoughts.<br className="desktop-break" /> Let’s turn them into something useful.</p>
            <div className="suggestions">{chat.suggestions.map((suggestion, i) => { const Icon = [FileText, Layers, BookOpen][i]; return <button key={suggestion} onClick={() => { chat.setDraft(suggestion); composer.current?.focus(); }}><span className={`suggestion-icon icon-${i}`}><Icon size={20} /></span><span className="suggestion-category">{['GET THE ESSENTIALS', 'CONNECT THE DOTS', 'MOVE THINGS FORWARD'][i]}</span><span className="suggestion-title">{suggestion}<ArrowUpRight size={17} /></span></button>; })}</div>
            <div className="welcome-hint"><Paperclip size={14} /> A document makes a great starting point.</div>
          </section> : null}
          <div className="messages" data-testid="messages" aria-label="Conversation messages">{chat.messages.map((message, index) => <article key={message.id} className={`message ${message.role}`}>
            <div className="message-heading">{message.role === 'assistant' ? <span className="assistant-avatar"><Mark small /></span> : <span className="user-avatar">Y</span>}<strong>{message.role === 'assistant' ? 'Folio' : 'You'}</strong><span>{message.role === 'assistant' ? 'Research assistant' : ''}</span>{message.status === 'streaming' && <span className="streaming-label">Writing<span className="writing-dot" /></span>}</div>
            <div className="message-body">{message.attachments?.length ? <div className="sent-files">{message.attachments.map(file => <FileChip file={file} key={file.id} />)}</div> : null}
            {message.role === 'assistant' && index === chat.messages.length - 1 && chat.tools.length > 0 && <div className="tool-activity" data-testid="tool-activity"><div className="activity-heading"><Search size={14} /><span>{chat.busy ? 'Working on your question' : message.status === 'stopped' ? 'Activity paused' : message.status === 'error' ? 'Activity interrupted' : 'Research activity'}</span></div><ol>{chat.tools.map(tool => <li key={tool.id} className={tool.status}>{tool.status === 'complete' ? <Check size={14} /> : tool.status === 'running' && chat.busy ? <LoaderCircle size={14} className="spin" /> : <Circle size={12} />}<span>{tool.label}</span><span className="tool-status">{tool.status === 'complete' ? 'Completed' : tool.status === 'running' ? chat.busy ? 'Running' : 'Paused' : 'Pending'}</span></li>)}</ol></div>}
            {message.role === 'assistant' ? <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{ table: ({ children }) => <div className="table-scroll"><table>{children}</table></div>, a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer">{children}</a> }}>{message.content}</ReactMarkdown>{!message.content && message.status === 'streaming' && <span className="thinking">Gathering the essentials…</span>}</div> : <p className="user-content">{message.content}</p>}
            {message.role === 'assistant' && message.content && <div className="response-footer"><CopyResponse content={message.content} />{message.status === 'stopped' && <span>Response stopped · partial answer saved</span>}{message.status === 'complete' && <span className="simulated-label">Simulated response</span>}</div>}
            </div>
          </article>)}</div>
        </div>
        <div className="composer-area">
          {chat.error && <div className="feedback error" role="alert"><AlertCircle size={16} />{chat.error}</div>}
          {chat.canRetry && <div className="retry-row"><span>{chat.error ? 'Let’s give that another try.' : 'You stopped this response.'}</span><button onClick={chat.retry}><RotateCcw size={14} />Retry response</button></div>}
          {chat.notice && <div className="feedback" role="alert"><AlertCircle size={16} />{chat.notice}</div>}
          <form className="composer" onSubmit={e => { e.preventDefault(); submit(); }}>
            <div className={chat.pending.length ? 'pending-files' : undefined} data-testid="pending-attachments">{chat.pending.map(file => <FileChip key={file.id} file={file} remove={() => chat.removeFile(file.id)} />)}</div>
            <textarea ref={composer} aria-label="Message" placeholder="Ask a question, or bring a document…" value={chat.draft} onChange={e => chat.setDraft(e.target.value)} rows={2} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }} />
            <div className="composer-toolbar"><div className="composer-options"><button type="button" className="attach-button" aria-label="Attach files" onClick={() => input.current?.click()}><Paperclip size={18} /><span>Attach files</span></button><span className="toolbar-divider" /><span className="context-label"><span />{chat.pending.length ? `${chat.pending.length} / 5 files` : 'Ready when you are'}</span></div><div className="send-options"><span className="keyboard-hint">Shift + Enter for a new line</span>{chat.busy ? <button type="button" className="send-button stop-button" aria-label="Stop response" onClick={chat.stop}><Square size={15} fill="currentColor" /></button> : <button type="submit" className="send-button" aria-label="Send message" disabled={!chat.draft.trim() && !chat.pending.length}><ArrowUp size={20} /></button>}</div></div>
            <input className="sr-only" type="file" tabIndex={-1} ref={input} aria-label="Upload files" accept=".txt,.md,.pdf,.png,.jpg,.jpeg" multiple onChange={e => { if (e.target.files) chat.addFiles(e.target.files); e.target.value = ''; }} />
          </form>
          <div className="composer-disclosure"><span><ShieldCheck size={12} />Files stay local. Agent responses are simulated.</span><span>TXT, MD, PDF, PNG, JPG · 10 MB each · 5 files</span></div>
        </div>
      </div>
    </main>
  </div>;
}
