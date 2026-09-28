import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUp, ArrowUpRight, Plus, PanelLeft, X, MessageSquare, FileText, Paperclip, Check, Copy, Square, RotateCcw, ShieldCheck, ChevronRight, BookOpen, Layers, PenLine, LoaderCircle, Circle, Sparkles } from 'lucide-react';
import { useChat, formatBytes, type Attachment } from '../shared/chat';

function Mark({ small = false }: { small?: boolean }) {
  return <span className={`folio-mark ${small ? 'small' : ''}`} aria-hidden="true"><span/><span/><span/></span>;
}
function FileChip({ file, remove }: { file: Attachment; remove?: () => void }) {
  return <div className="file-chip"><FileText size={19} aria-hidden="true"/><span className="min-w-0"><strong title={file.name}>{file.name}</strong><small>{formatBytes(file.size)}</small></span>{remove && <button type="button" className="icon-button" aria-label={`Remove ${file.name}`} onClick={remove}><X size={15}/></button>}</div>;
}
function CopyResponse({ content }: { content: string }) {
  const [state, setState] = useState('');
  return <button className="copy-button" type="button" aria-label="Copy response" onClick={async () => {
    try { await navigator.clipboard.writeText(content); setState('Copied'); }
    catch { setState('Copy failed. Please select the text.'); }
  }}>{state === 'Copied' ? <Check size={14}/> : <Copy size={14}/>}<span role="status">{state || 'Copy response'}</span></button>;
}
export default function App() {
  const chat = useChat();
  const [navOpen, setNavOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const follow = useRef(true);
  const dragDepth = useRef(0);
  const restoreComposer = useRef(false);
  const empty = chat.messages.length === 0;
  useEffect(() => {
    if (follow.current && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [chat.messages, chat.tools, chat.error]);
  useEffect(() => { follow.current = true; if (scroll.current) scroll.current.scrollTop = 0; }, [chat.activeId]);
  useEffect(() => {
    if (!textarea.current) return;
    textarea.current.style.height = 'auto';
    textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 160)}px`;
  }, [chat.draft]);
  useEffect(() => {
    if (!navOpen) { if (restoreComposer.current) { textarea.current?.focus(); restoreComposer.current = false; } return; }
    const first = sidebar.current?.querySelector<HTMLButtonElement>('button');
    first?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setNavOpen(false); opener.current?.focus(); }
      if (e.key === 'Tab') {
        const buttons = Array.from(sidebar.current?.querySelectorAll<HTMLButtonElement>('button') || []);
        const first = buttons[0], last = buttons.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [navOpen]);
  const navigate = (action: () => void) => { action(); restoreComposer.current = navOpen; setNavOpen(false); if (!navOpen) textarea.current?.focus(); };
  const submit = () => { if (!chat.busy) { follow.current = true; chat.send(); textarea.current?.focus(); } };
  const suggestionIcons = [BookOpen, Layers, PenLine];
  return <div className="app-shell">
    <a className="skip-link" href="#message">Skip to message</a>
    {navOpen && <div className="nav-backdrop" onClick={() => { setNavOpen(false); opener.current?.focus(); }} />}
    <aside ref={sidebar} className={`sidebar ${navOpen ? 'is-open' : ''}`} aria-label="Conversations" role={navOpen ? 'dialog' : undefined} aria-modal={navOpen || undefined}>
      <div className="brand"><Mark/><span>folio<span className="brand-period">.</span></span><button className="icon-button close-nav" aria-label="Close conversations" onClick={() => { setNavOpen(false); opener.current?.focus(); }}><X size={20}/></button></div>
      <div className="workspace-label">YOUR RESEARCH, CONNECTED</div>
      <button className="new-chat" aria-label="New chat" onClick={() => navigate(chat.newChat)}><Plus size={18}/><span>New chat</span><span className="new-chat-plus">↗</span></button>
      <div className="nav-heading">Conversations <span>{chat.conversations.length.toString().padStart(2, '0')}</span></div>
      <nav className="conversation-list">{chat.conversations.map(c => <button key={c.id} aria-label={c.title} aria-current={c.id === chat.activeId ? 'page' : undefined} className={`conversation ${c.id === chat.activeId ? 'selected' : ''}`} onClick={() => navigate(() => chat.selectChat(c.id))}><MessageSquare size={17} aria-hidden="true"/><span>{c.title}</span>{c.id === chat.activeId && <span className="active-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="local-note"><ShieldCheck size={19}/><div><strong>A little space to think.</strong><p>Your files stay in your browser.<br/>Your curiosity can go further.</p></div></div><div className="workspace-profile"><span className="profile-avatar">P</span><div><strong>Personal workspace</strong><small>Folio preview</small></div><span className="preview-dot"/></div></div>
    </aside>
    <main className="main-panel" inert={navOpen ? true : undefined} data-testid="drop-zone" onDragEnter={e => { e.preventDefault(); dragDepth.current++; if (e.dataTransfer.types.includes('Files')) setDragging(true); }} onDragOver={e => e.preventDefault()} onDragLeave={e => { e.preventDefault(); dragDepth.current--; if (dragDepth.current <= 0) setDragging(false); }} onDrop={e => { e.preventDefault(); dragDepth.current = 0; setDragging(false); chat.addFiles(e.dataTransfer.files); }}>
      <header className="topbar"><div className="flex items-center gap-3 min-w-0"><button ref={opener} className="icon-button open-nav" aria-label="Open conversations" aria-expanded={navOpen} onClick={() => setNavOpen(true)}><PanelLeft size={20}/></button><span className="header-section">Workspace</span><ChevronRight className="header-chevron" size={14}/><span className="header-title">{chat.active.title}</span></div><span className="preview-badge"><span/> Preview</span></header>
      <div ref={scroll} className={`scroll-area ${empty ? 'is-empty' : ''}`} onScroll={() => { if (scroll.current) follow.current = scroll.current.scrollHeight - scroll.current.scrollTop - scroll.current.clientHeight < 100; }}>
        {empty && <section className="welcome"><div className="welcome-emblem"><Mark/><span className="emblem-spark"><Sparkles size={14}/></span></div><div className="eyebrow">A CLEARER WAY TO THINK</div><h1>Good questions.<br/><em>Brighter ideas.</em></h1><p className="welcome-description">Bring your documents and your curiosity.<br/>Let’s turn information into understanding.</p><div className="suggestion-heading"><span>A place to start</span><span className="suggestion-line"/></div><div className="suggestions">{chat.suggestions.map((s, i) => { const Icon = suggestionIcons[i]; return <button key={s} className="suggestion" onClick={() => { chat.setDraft(s); textarea.current?.focus(); }}><Icon size={21} aria-hidden="true"/><span>{s}</span><ArrowUpRight size={16} className="suggestion-arrow" aria-hidden="true"/></button>; })}</div></section>}
        <section className="messages" data-testid="messages" aria-label="Conversation messages">
          {chat.messages.map((m, i) => <article key={m.id} className={`message ${m.role}`}><div className="message-author">{m.role === 'assistant' ? <Mark small/> : <span className="user-avatar">Y</span>}<span>{m.role === 'assistant' ? 'Folio' : 'You'}</span><span className="message-caption">{m.role === 'assistant' ? 'Research assistant' : ''}</span></div><div className="message-content">{m.attachments && m.attachments.length > 0 && <div className="sent-files">{m.attachments.map(f => <FileChip key={f.id} file={f}/>)}</div>}
            {m.role === 'assistant' && i === chat.messages.length - 1 && chat.tools.length > 0 && <div className="tool-activity" data-testid="tool-activity"><div className="activity-heading"><span>{chat.busy ? 'Working on your question' : m.status === 'stopped' ? 'Activity paused' : m.status === 'error' ? 'Activity interrupted' : 'Research activity'}</span><small>{chat.tools.filter(t => t.status === 'complete').length}/{chat.tools.length} steps</small></div><ol>{chat.tools.map(t => <li key={t.id} className={t.status}>{t.status === 'complete' ? <Check size={14}/> : t.status === 'running' && chat.busy ? <LoaderCircle className="spin" size={14}/> : <Circle size={12}/>}<span>{t.label}</span><small>{t.status === 'complete' ? 'Completed' : t.status === 'running' ? (chat.busy ? 'Running' : 'Paused') : 'Pending'}</small></li>)}</ol></div>}
            {m.role === 'assistant' ? <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{table: ({children}) => <div className="table-scroll" tabIndex={0} role="region" aria-label="Response table"><table>{children}</table></div>, a: ({children, href}) => <a href={href} target="_blank" rel="noreferrer">{children}</a>}}>{m.content}</ReactMarkdown>{!m.content && m.status === 'streaming' && <span className="thinking">Reading, connecting, making sense…</span>}</div> : <div className="user-text">{m.content}</div>}
            {m.status === 'stopped' && <p className="stopped-note">Response stopped. Your partial response is preserved.</p>}
            {m.role === 'assistant' && m.content && <CopyResponse content={m.content}/>}</div></article>)}
          {chat.error && <div className="error-notice" role="alert">{chat.error}</div>}
          {chat.canRetry && <button className="retry-button" aria-label="Retry response" onClick={() => { follow.current = true; chat.retry(); }}><RotateCcw size={16}/>Retry response</button>}
        </section>
      </div>
      <div className="sr-only" role="status">{chat.busy ? 'Folio is preparing a response.' : chat.canRetry ? 'Response interrupted. Retry is available.' : chat.messages.at(-1)?.role === 'assistant' ? 'Response complete.' : 'Ready for your question.'}</div><div className="composer-dock"><form className="composer" onSubmit={e => { e.preventDefault(); submit(); }}><label htmlFor="message" className="composer-label">{empty ? 'What’s on your mind?' : 'Continue the conversation'}</label><textarea id="message" ref={textarea} aria-label="Message" aria-describedby="file-guidance keyboard-guidance" placeholder="Ask a question, or explore a document…" value={chat.draft} rows={2} onChange={e => chat.setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }}/>
        <div className="pending-files" data-testid="pending-attachments">{chat.pending.map(f => <FileChip key={f.id} file={f} remove={() => chat.removeFile(f.id)}/>)}</div>
        {chat.notice && <p className="validation-notice" role="alert">{chat.notice}</p>}
        <div className="composer-toolbar"><button type="button" className="attach-button" aria-label="Attach files" onClick={() => input.current?.click()}><Paperclip size={18}/><span>Attach files</span></button><input ref={input} className="sr-only" tabIndex={-1} type="file" multiple aria-label="Upload files" accept=".txt,.md,.pdf,.png,.jpg,.jpeg" onChange={e => { if(e.target.files) chat.addFiles(e.target.files); e.target.value = ''; }}/><span className="keyboard-hint" id="keyboard-guidance">Enter to send <span>·</span> Shift + Enter for a new line</span>{chat.busy ? <button type="button" className="send-button stop-button" aria-label="Stop response" onClick={chat.stop}><Square size={17} fill="currentColor"/></button> : <button type="submit" className="send-button" aria-label="Send message" disabled={!chat.draft.trim() && !chat.pending.length}><ArrowUp size={21}/></button>}</div></form><div id="file-guidance" className="file-guidance">TXT, MD, PDF, PNG, JPG <span>·</span> 10 MB per file <span>·</span> Up to 5 files</div><div className="privacy-footer"><ShieldCheck size={13}/><span>Files stay local. Agent responses are simulated.</span></div></div>
      {dragging && <div className="drop-overlay"><div><Paperclip size={36}/><h2>A little more context.</h2><p>Drop your files to add them to this conversation.</p><small>Up to 5 files · 10 MB each</small></div></div>}
    </main>
  </div>;
}
