import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUp, ArrowUpRight, Check, ChevronRight, Circle, Copy, FileText, Files, Menu, MessageSquare, Paperclip, Plus, RotateCcw, ShieldCheck, Square, X, LoaderCircle, PanelsTopLeft } from 'lucide-react';
import { useChat, formatBytes, type Attachment } from '../shared/chat';

function FolioMark({ small = false }: { small?: boolean }) {
  return <span className={small ? 'folio-mark small' : 'folio-mark'} aria-hidden="true"><svg viewBox="0 0 64 72" fill="none"><path d="M12 5h27l14 15v45H12z" fill="currentColor" opacity=".16"/><path d="M10 4h28v19h17v43H10z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/><path d="m38 4 17 19H38V4ZM21 35h22M21 44h22M21 53h13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>;
}
function AttachmentChip({ file, onRemove }: { file: Attachment; onRemove?: () => void }) {
  return <div className="attachment"><FileText size={18} aria-hidden="true"/><span><span className="filename">{file.name}</span><small>{formatBytes(file.size)}</small></span>{onRemove && <button type="button" className="icon-button" aria-label={`Remove ${file.name}`} onClick={onRemove}><X size={15}/></button>}</div>;
}
export default function App() {
  const chat = useChat();
  const [navOpen, setNavOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copyStatus, setCopyStatus] = useState<{ id: string; text: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const scrollArea = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const dragDepth = useRef(0);
  useEffect(() => {
    const el = scrollArea.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 260) el.scrollTop = el.scrollHeight;
  }, [chat.messages, chat.tools]);
  useEffect(() => { if (textarea.current) { textarea.current.style.height = 'auto'; textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 160)}px`; } }, [chat.draft]);
  useEffect(() => {
    if (!navOpen) return;
    sidebar.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setNavOpen(false); menu.current?.focus(); }
      if (event.key === 'Tab') {
        const buttons = sidebar.current?.querySelectorAll<HTMLButtonElement>('button');
        if (!buttons?.length) return;
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [navOpen]);
  const closeNav = () => { setNavOpen(false); menu.current?.focus(); };
  const copy = async (id: string, content: string) => {
    try { await navigator.clipboard.writeText(content); setCopyStatus({ id, text: 'Copied' }); }
    catch { setCopyStatus({ id, text: 'Could not copy. Try again.' }); }
  };
  const empty = chat.messages.length === 0;
  return <div className="app-shell" data-testid="drop-zone" onDragEnter={e => { e.preventDefault(); dragDepth.current++; if (e.dataTransfer.types.includes('Files')) setDragging(true); }} onDragOver={e => e.preventDefault()} onDragLeave={e => { e.preventDefault(); if (--dragDepth.current <= 0) setDragging(false); }} onDrop={e => { e.preventDefault(); dragDepth.current = 0; setDragging(false); chat.addFiles(e.dataTransfer.files); }}>
    {navOpen && <div className="nav-backdrop" onClick={closeNav}/>}
    <aside ref={sidebar} className={`sidebar ${navOpen ? 'is-open' : ''}`} aria-label="Conversations">
      <div className="brand"><FolioMark small/><span>folio</span><button className="icon-button mobile-close" aria-label="Close conversations" onClick={closeNav}><X size={20}/></button></div>
      <button className="new-chat" aria-label="New chat" onClick={() => { chat.newChat(); setNavOpen(false); textarea.current?.focus(); }}><Plus size={18}/>New chat<span className="new-chat-symbol">+</span></button>
      <div className="conversation-heading">Your conversations <span>{chat.conversations.length}</span></div>
      <nav className="conversation-list">{chat.conversations.map(c => <button key={c.id} className={`conversation ${chat.activeId === c.id ? 'selected' : ''}`} aria-label={c.title} aria-current={chat.activeId === c.id ? 'page' : undefined} onClick={() => { chat.selectChat(c.id); setNavOpen(false); textarea.current?.focus(); }}><MessageSquare size={17}/><span>{c.title}</span>{chat.activeId === c.id && <span className="active-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="local-note"><ShieldCheck size={19}/><div><strong>A private place to think</strong><p>Your files stay in this browser.<br/>Responses are simulated.</p></div></div><div className="workspace"><span className="avatar">F</span><div><strong>Personal workspace</strong><small>Folio preview</small></div><span className="preview-dot" title="Local preview"/></div></div>
    </aside>
    <main className="main" inert={navOpen ? true : undefined}>
      <header className="topbar"><div className="header-title"><button ref={menu} className="icon-button mobile-menu" aria-label="Open conversations" onClick={() => setNavOpen(true)}><Menu size={21}/></button><PanelsTopLeft className="desktop-header-icon" size={18}/><span>{chat.active.title}</span></div><span className="simulation-badge"><span/>Simulated assistant</span></header>
      <div ref={scrollArea} className={`reading-area ${empty ? 'is-empty' : ''}`}>
        {empty ? <section className="welcome"><div className="welcome-art"><FolioMark/><span className="paper-tab"/></div><h1>Good questions.<br/>Clearer thinking.</h1><p className="welcome-description">Bring your documents, your questions, your next big idea.<br className="desktop-break"/> Find a way forward with Folio.</p><div className="suggestions"><p>A few places to start</p>{chat.suggestions.map((suggestion, i) => { const Icon = [FileText, Files, PanelsTopLeft][i]; return <button key={suggestion} onClick={() => { chat.setDraft(suggestion); textarea.current?.focus(); }}><span className="suggestion-icon"><Icon size={19}/></span><span>{suggestion}</span><ArrowUpRight size={17}/></button>; })}</div></section> : null}
        <div className="messages" data-testid="messages" aria-label="Conversation messages">{chat.messages.map((message, index) => <article key={message.id} className={`message ${message.role}`}>
          <div className="message-heading">{message.role === 'assistant' ? <FolioMark small/> : <span className="user-avatar">Y</span>}<strong>{message.role === 'assistant' ? 'Folio' : 'You'}</strong>{message.status === 'streaming' && <span className="message-status">Working on it</span>}</div>
          {message.attachments && message.attachments.length > 0 && <div className="attachments sent-attachments">{message.attachments.map(file => <AttachmentChip key={file.id} file={file}/>)}</div>}
          {message.role === 'assistant' && index === chat.messages.length - 1 && chat.tools.length > 0 && <div className="tool-activity" data-testid="tool-activity"><div className="activity-heading"><span>Agent activity</span><small>{chat.busy ? 'In progress' : message.status === 'complete' ? 'Complete' : 'Paused'}</small></div>{chat.tools.map(tool => <div className={`tool-step ${tool.status}`} key={tool.id}>{tool.status === 'complete' ? <Check size={14}/> : tool.status === 'running' ? <LoaderCircle size={14} className={chat.busy ? 'spin' : ''}/> : <Circle size={12}/>}<span>{tool.label}</span><small>{tool.status === 'complete' ? 'Completed' : tool.status === 'running' ? 'Running' : 'Pending'}</small></div>)}</div>}
          {message.role === 'assistant' ? <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{message.content}</ReactMarkdown>{!message.content && message.status === 'streaming' && <p className="thinking">Preparing your response…</p>}</div> : <p className="user-content">{message.content}</p>}
          {message.status === 'stopped' && <p className="stopped-note">Response stopped. Your partial response is saved.</p>}
          {message.role === 'assistant' && message.content && <button className="copy-button" onClick={() => copy(message.id, message.content)} aria-label="Copy response">{copyStatus?.id === message.id && copyStatus.text === 'Copied' ? <Check size={14}/> : <Copy size={14}/>}<span role="status">{copyStatus?.id === message.id ? copyStatus.text : 'Copy response'}</span></button>}
        </article>)}</div>
      </div>
      <div className="composer-area"><div className="composer-width">
        {chat.error && <div role="alert" className="error-notice">{chat.error}</div>}
        {chat.canRetry && <button className="retry-button" aria-label="Retry response" onClick={chat.retry}><RotateCcw size={15}/>Retry response</button>}
        {chat.notice && <div role="alert" className="error-notice">{chat.notice}</div>}
        <form className="composer" onSubmit={e => { e.preventDefault(); if (!chat.busy) chat.send(); }}>
          <div className={chat.pending.length > 0 ? 'attachments' : undefined} data-testid="pending-attachments">{chat.pending.map(file => <AttachmentChip key={file.id} file={file} onRemove={() => chat.removeFile(file.id)}/>)}</div>
          <textarea ref={textarea} aria-label="Message" placeholder="Ask a question, or bring a document…" value={chat.draft} rows={2} onChange={e => chat.setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); if (!chat.busy) chat.send(); } }}/>
          <div className="composer-toolbar"><div className="attach-group"><button className="attach-button" type="button" aria-label="Attach files" onClick={() => input.current?.click()}><Paperclip size={18}/><span>Attach files</span></button><span className="drop-hint">or drop them here</span></div><div className="send-group"><span className="keyboard-hint">Shift + Enter for a new line</span>{chat.busy ? <button className="send-button stop" type="button" aria-label="Stop response" onClick={chat.stop}><Square size={15} fill="currentColor"/></button> : <button className="send-button" type="submit" aria-label="Send message" disabled={!chat.draft.trim() && !chat.pending.length}><ArrowUp size={20}/></button>}</div></div>
          <input ref={input} type="file" aria-label="Upload files" multiple accept=".txt,.md,.pdf,.png,.jpg,.jpeg" className="file-input" onChange={e => { if (e.target.files) chat.addFiles(e.target.files); e.target.value = ''; }}/>
        </form>
        <p className="file-guidance">TXT, MD, PDF, PNG, JPG <span>·</span> Up to 10 MB each <span>·</span> 5 files per message</p>
        <p className="mobile-privacy">Files stay local. Responses are simulated.</p>
      </div></div>
    </main>
    {dragging && <div className="drop-overlay"><div><Files size={36}/><h2>Bring your documents into focus</h2><p>Drop up to 5 files here. Each file can be up to 10 MB.</p></div></div>}
  </div>;
}
