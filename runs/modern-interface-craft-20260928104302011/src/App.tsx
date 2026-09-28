import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowDown, ArrowRight, ArrowUp, Check, ChevronRight, Circle, Copy, FileText, Layers, LoaderCircle, Menu, MessageSquare, Paperclip, Plus, RotateCcw, ShieldCheck, Square, X } from 'lucide-react';
import { useChat, formatBytes, type Attachment } from '../shared/chat';

function FolioMark({ small = false }: { small?: boolean }) {
  return <span className={`folio-mark ${small ? 'small' : ''}`} aria-hidden="true"><span /><span /><span /></span>;
}

function AttachmentChip({ file, remove }: { file: Attachment; remove?: () => void }) {
  return <div className="attachment"><span className="attachment-icon"><FileText size={18} /></span><span className="attachment-info"><span className="attachment-name" title={file.name}>{file.name}</span><span className="attachment-size">{formatBytes(file.size)} · Local file</span></span>{remove && <button className="icon-button remove-file" type="button" aria-label={`Remove ${file.name}`} onClick={remove}><X size={15} /></button>}</div>;
}

function CopyResponse({ content }: { content: string }) {
  const [feedback, setFeedback] = useState('');
  useEffect(() => { if (feedback) { const timer = setTimeout(() => setFeedback(''), 2500); return () => clearTimeout(timer); } }, [feedback]);
  return <button className="copy-button" type="button" aria-label="Copy response" onClick={async () => { try { await navigator.clipboard.writeText(content); setFeedback('Copied'); } catch { setFeedback('Could not copy'); } }}>{feedback === 'Copied' ? <Check size={14} /> : <Copy size={14} />}<span aria-live="polite">{feedback || 'Copy response'}</span></button>;
}

export default function App() {
  const chat = useChat();
  const [navOpen, setNavOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [away, setAway] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const followRef = useRef(true);
  const dragDepth = useRef(0);
  const empty = chat.messages.length === 0;

  useEffect(() => {
    if (navOpen) dialogRef.current?.showModal();
    else if (dialogRef.current?.open) { dialogRef.current.close(); menuRef.current?.focus(); }
  }, [navOpen]);
  useEffect(() => {
    if (followRef.current && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat.messages, chat.tools, chat.error]);
  useEffect(() => { followRef.current = true; setAway(false); if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [chat.activeId]);
  useEffect(() => { const el = textareaRef.current; if (el) { el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 160)}px`; } }, [chat.draft]);
  useEffect(() => {
    const prevent = (e: DragEvent) => { e.preventDefault(); };
    window.addEventListener('dragover', prevent); window.addEventListener('drop', prevent);
    return () => { window.removeEventListener('dragover', prevent); window.removeEventListener('drop', prevent); };
  }, []);

  function newChat() { chat.newChat(); setNavOpen(false); followRef.current = true; textareaRef.current?.focus(); }
  function submit() { if (chat.busy) return; followRef.current = true; setAway(false); chat.send(); }
  function navigation() {
    return <div className="sidebar-inner">
      <div className="brand-row"><a className="brand" href="#" aria-label="Folio home" onClick={e => { e.preventDefault(); chat.selectChat(chat.conversations.find(c => !c.messages.length)?.id || chat.activeId); setNavOpen(false); }}><FolioMark small /><span>folio<span className="brand-dot">.</span></span></a><button className="icon-button mobile-close" aria-label="Close conversations" onClick={() => setNavOpen(false)}><X size={20} /></button></div>
      <button className="new-chat" onClick={newChat} aria-label="New chat"><Plus size={18} /><span>New chat</span><span className="new-chat-plus">↗</span></button>
      <div className="nav-heading">YOUR CONVERSATIONS <span>{String(chat.conversations.length).padStart(2, '0')}</span></div>
      <nav className="conversation-list" aria-label="Conversations">{chat.conversations.map(c => <button key={c.id} className={`conversation ${c.id === chat.activeId ? 'selected' : ''}`} aria-current={c.id === chat.activeId ? 'page' : undefined} aria-label={c.title} onClick={() => { chat.selectChat(c.id); setNavOpen(false); }}><MessageSquare size={16} /><span>{c.title}</span>{c.id === chat.activeId && <span className="selected-dot" />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="private-note"><ShieldCheck size={19} /><div><strong>A little space to think.</strong><p>Your files stay in your browser.<br />Your ideas stay yours.</p></div></div><div className="workspace"><span className="avatar">Y</span><div><strong>Your workspace</strong><span>Personal · Local session</span></div><span className="workspace-dot" title="Local session" /></div></div>
    </div>;
  }

  return <div className="app-shell">
    <aside className="desktop-sidebar">{navigation()}</aside>
    <dialog className="mobile-dialog" ref={dialogRef} onCancel={() => setNavOpen(false)} onClick={e => { if (e.target === e.currentTarget) setNavOpen(false); }} aria-label="Conversations"><div className="mobile-sidebar">{navigation()}</div></dialog>
    <main className="main-panel" data-testid="drop-zone" onDragEnter={e => { e.preventDefault(); if (e.dataTransfer.types.includes('Files')) { dragDepth.current++; setDragging(true); } }} onDragOver={e => e.preventDefault()} onDragLeave={e => { e.preventDefault(); if (--dragDepth.current <= 0) { dragDepth.current = 0; setDragging(false); } }} onDrop={e => { e.preventDefault(); dragDepth.current = 0; setDragging(false); if (e.dataTransfer.files.length) chat.addFiles(e.dataTransfer.files); }}>
      <header className="topbar"><div className="flex min-w-0 items-center gap-3"><button ref={menuRef} className="icon-button menu-button" aria-label="Open conversations" aria-expanded={navOpen} onClick={() => setNavOpen(true)}><Menu size={21} /></button><span className="topbar-section">Workspace</span><ChevronRight size={13} className="breadcrumb-arrow" /><span className="conversation-title">{chat.active.title}</span></div><span className="demo-badge"><span />Simulated assistant</span></header>
      <div ref={scrollRef} className={`reading-area ${empty ? 'is-empty' : ''}`} onScroll={() => { const el = scrollRef.current!; const near = el.scrollHeight - el.scrollTop - el.clientHeight < 100; followRef.current = near; setAway(!near); }}>
        {empty ? <section className="welcome">
          <div className="welcome-symbol"><FolioMark /><span className="symbol-spark">✳</span></div>
          <p className="eyebrow">A LITTLE CONTEXT. A LOT OF CLARITY.</p>
          <h1>Good questions.<br /><span>Clearer thinking.</span></h1>
          <p className="welcome-description">Bring your documents, untangle an idea, or find your next step.<br className="desktop-break" /> A thoughtful research partner, right where you need one.</p>
          <div className="suggestions">{chat.suggestions.map((prompt, i) => { const Icon = [FileText, Layers, MessageSquare][i]; return <button key={prompt} className="suggestion" onClick={() => { chat.setDraft(prompt); textareaRef.current?.focus(); }}><div className="suggestion-top"><Icon size={19} /><span>0{i + 1}</span></div><span className="suggestion-label">{prompt}</span><ArrowRight size={16} className="suggestion-arrow" /></button>; })}</div>
          <p className="suggestion-hint">A starting point for your next good question.</p>
        </section> : <div className="messages" data-testid="messages">
          <div className="conversation-start"><span />THE CONVERSATION STARTS HERE<span /></div>
          {chat.messages.map((message, index) => <article className={`message ${message.role}`} key={message.id} aria-label={message.role === 'user' ? 'Your message' : 'Folio response'}>
            <div className="message-heading">{message.role === 'assistant' ? <FolioMark small /> : <span className="user-avatar">Y</span>}<strong>{message.role === 'assistant' ? 'Folio' : 'You'}</strong><span>{message.role === 'assistant' ? 'Research assistant' : ''}</span></div>
            <div className="message-body">
              {message.role === 'assistant' && index === chat.messages.length - 1 && chat.tools.length > 0 && <div className="tool-activity" data-testid="tool-activity"><div className="activity-heading"><span className="activity-line" /><strong>{chat.busy ? 'Working through your question' : message.status === 'stopped' ? 'Activity paused' : message.status === 'error' ? 'Activity interrupted' : 'Research activity'}</strong><span>{chat.tools.filter(t => t.status === 'complete').length}/{chat.tools.length}</span></div><div className="tool-steps">{chat.tools.map(tool => <div key={tool.id} className={`tool-step ${tool.status}`}>{tool.status === 'complete' ? <Check size={14} /> : tool.status === 'running' && chat.busy ? <LoaderCircle size={14} className="spinner" /> : <Circle size={12} />}<span>{tool.label}</span><span className="step-status">{tool.status === 'complete' ? 'Completed' : tool.status === 'running' && !chat.busy ? 'Paused' : tool.status === 'running' ? 'Running' : 'Pending'}</span></div>)}</div></div>}
              {message.attachments && message.attachments.length > 0 && <div className="sent-attachments">{message.attachments.map(file => <AttachmentChip key={file.id} file={file} />)}</div>}
              <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{ table: ({ children }) => <div className="table-scroll" tabIndex={0} role="region" aria-label="Response table"><table>{children}</table></div>, a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer">{children}</a> }}>{message.content}</ReactMarkdown></div>
              {message.status === 'streaming' && !message.content && <p className="thinking" role="status">Making room for a clearer answer<span>…</span></p>}
              {message.role === 'assistant' && message.content && <div className="response-actions"><CopyResponse content={message.content} />{message.status === 'stopped' && <span className="stopped-label">Response stopped · partial answer saved</span>}</div>}
            </div>
          </article>)}
          {chat.error && <div className="response-error" role="alert">{chat.error}</div>}
          {chat.canRetry && <button className="retry-button" aria-label="Retry response" onClick={chat.retry}><RotateCcw size={15} />Retry response</button>}
        </div>}
        {empty && <div data-testid="messages" />}
      </div>
      <div className="composer-dock">
        {away && <button className="jump-button" onClick={() => { followRef.current = true; scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); setAway(false); }}><ArrowDown size={14} />Latest response</button>}
        <form className={`composer ${dragging ? 'drag-active' : ''}`} onSubmit={e => { e.preventDefault(); submit(); }}>
          <div data-testid="pending-attachments" className={chat.pending.length > 0 ? 'pending-attachments' : undefined}>{chat.pending.map(file => <AttachmentChip key={file.id} file={file} remove={() => chat.removeFile(file.id)} />)}</div>
          <textarea ref={textareaRef} aria-label="Message" placeholder="Ask a question, or bring a document…" rows={2} value={chat.draft} onChange={e => chat.setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }} />
          <div className="composer-controls"><button className="attach-button" type="button" aria-label="Attach files" onClick={() => inputRef.current?.click()}><Paperclip size={17} /><span>Attach files</span></button><span className="composer-keyboard">Shift + Enter for a new line</span>{chat.busy ? <button className="send-button stop-button" type="button" aria-label="Stop response" onClick={chat.stop}><Square size={16} fill="currentColor" /></button> : <button className="send-button" type="submit" aria-label="Send message" disabled={!chat.draft.trim() && chat.pending.length === 0}><ArrowUp size={20} /></button>}</div>
          <input ref={inputRef} className="sr-only" type="file" tabIndex={-1} multiple accept=".txt,.md,.pdf,.png,.jpg,.jpeg" aria-label="Upload files" onChange={e => { if (e.target.files) chat.addFiles(e.target.files); e.target.value = ''; }} />
        </form>
        {chat.notice && <p className="validation-notice" role="alert">{chat.notice}</p>}
        <div className="composer-meta"><span>TXT, MD, PDF, PNG, JPG · 10 MB each · 5 files max</span><span><ShieldCheck size={12} /> Files stay local</span></div>
        <p className="simulation-note">A space to explore. AI responses are simulated.</p>
        <span className="sr-only" role="status">{chat.busy ? 'Generating response' : chat.canRetry ? 'Response interrupted. Retry is available.' : 'Ready'}</span>
      </div>
      {dragging && <div className="drop-indicator"><Paperclip size={25} /><strong>Bring your context.</strong><span>Drop files anywhere here to attach them</span></div>}
    </main>
  </div>;
}
