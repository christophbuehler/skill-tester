import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowDown, ArrowUp, ArrowUpRight, Info, Check, ChevronRight, Circle, Copy, FileText, Layers, Menu, Paperclip, Plus, Search, ShieldCheck, Square, X, RotateCcw, LoaderCircle, PanelLeftClose } from 'lucide-react';
import { useChat, formatBytes, type Attachment } from '../shared/chat';

function Mark({ small = false }: { small?: boolean }) { return <span className={`folio-mark ${small ? 'small' : ''}`} aria-hidden="true"><span /><span /><span /></span>; }
function FileChip({ file, remove }: { file: Attachment; remove?: () => void }) {
  return <div className="file-chip"><span className="file-icon"><FileText size={18} /></span><span className="file-detail"><strong>{file.name}</strong><span>{formatBytes(file.size)} · {file.name.split('.').pop()?.toUpperCase()}</span></span>{remove && <button type="button" className="icon-button remove" aria-label={`Remove ${file.name}`} onClick={remove}><X size={15} /></button>}</div>;
}
export default function App() {
  const chat = useChat();
  const [navOpen, setNavOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileHelp, setFileHelp] = useState(false);
  const [moreBelow, setMoreBelow] = useState(false);
  const [copied, setCopied] = useState<Record<string, string>>({});
  const input = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  const nearBottom = useRef(true);
  const dragDepth = useRef(0);
  const empty = chat.messages.length === 0;
  useEffect(() => { if (textarea.current) { textarea.current.style.height = 'auto'; textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 160)}px`; } }, [chat.draft]);
  useEffect(() => { if (scroller.current && nearBottom.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [chat.messages, chat.tools]);
  useEffect(() => { nearBottom.current = true; if (scroller.current) scroller.current.scrollTop = 0; }, [chat.activeId]);
  useEffect(() => {
    const el = scroller.current; if (!el) return;
    const update = () => setMoreBelow(el.scrollHeight - el.scrollTop - el.clientHeight > 90);
    const observer = new ResizeObserver(update);
    observer.observe(el); if (el.firstElementChild) observer.observe(el.firstElementChild);
    update(); return () => observer.disconnect();
  }, [chat.messages, chat.activeId]);
  useEffect(() => {
    if (!navOpen) return;
    const first = nav.current?.querySelector<HTMLButtonElement>('button'); first?.focus();
    function key(event: KeyboardEvent) {
      if (event.key === 'Escape') { setNavOpen(false); menuButton.current?.focus(); }
      if (event.key === 'Tab') {
        const buttons = Array.from(nav.current?.querySelectorAll<HTMLButtonElement>('button') || []).filter(button => button.offsetParent !== null);
        const start = buttons[0], end = buttons.at(-1);
        if (event.shiftKey && document.activeElement === start) { event.preventDefault(); end?.focus(); }
        else if (!event.shiftKey && document.activeElement === end) { event.preventDefault(); start?.focus(); }
      }
    }
    document.addEventListener('keydown', key); return () => document.removeEventListener('keydown', key);
  }, [navOpen]);
  function choose(id?: string) { id ? chat.selectChat(id) : chat.newChat(); setNavOpen(false); textarea.current?.focus(); }
  async function copy(id: string, content: string) {
    try { await navigator.clipboard.writeText(content); setCopied(c => ({ ...c, [id]: 'Copied' })); }
    catch { setCopied(c => ({ ...c, [id]: 'Copy failed' })); }
    setTimeout(() => setCopied(c => ({ ...c, [id]: '' })), 2500);
  }
  function send() { if (!chat.busy) { nearBottom.current = true; chat.send(); textarea.current?.focus(); } }
  return <div className="app-shell" onDragOver={e => e.preventDefault()} onDrop={e => e.preventDefault()}>
    {navOpen && <div className="nav-backdrop" onClick={() => { setNavOpen(false); menuButton.current?.focus(); }} />}
    <aside ref={nav} className={`sidebar ${navOpen ? 'is-open' : ''}`} aria-label="Conversations">
      <div className="brand-row"><a className="brand" href="#" onClick={e => { e.preventDefault(); choose(); }} tabIndex={navOpen ? -1 : 0}><Mark />folio<span className="brand-period">.</span></a><button className="icon-button mobile-close" aria-label="Close conversations" onClick={() => { setNavOpen(false); menuButton.current?.focus(); }}><PanelLeftClose size={19} /></button></div>
      <button className="new-chat" aria-label="New chat" onClick={() => choose()}><Plus size={18} /> New conversation <span>↗</span></button>
      <div className="nav-label">YOUR WORKSPACE</div>
      <div className="conversation-heading"><span>Conversations</span><span>{chat.conversations.length.toString().padStart(2, '0')}</span></div>
      <nav className="conversation-list">{chat.conversations.map(c => <button key={c.id} aria-label={c.title} aria-current={c.id === chat.activeId ? 'page' : undefined} className={`conversation ${c.id === chat.activeId ? 'selected' : ''}`} onClick={() => choose(c.id)}><span className="conversation-dot" /><span>{c.title}</span>{c.id === chat.activeId && <ChevronRight size={14} />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="profile"><span className="avatar">JD</span><div><strong>Personal workspace</strong><span>Local session</span></div><span className="online-dot" /></div></div>
    </aside>
    <main inert={navOpen} className="main" data-testid="drop-zone" onDragEnter={e => { e.preventDefault(); dragDepth.current++; if (e.dataTransfer.types.includes('Files')) setDragging(true); }} onDragLeave={e => { e.preventDefault(); dragDepth.current--; if (dragDepth.current <= 0) setDragging(false); }} onDrop={e => { e.preventDefault(); dragDepth.current = 0; setDragging(false); chat.addFiles(e.dataTransfer.files); }}>
      <header className="topbar"><div className="breadcrumb"><button ref={menuButton} className="icon-button mobile-menu" aria-label="Open conversations" aria-expanded={navOpen} onClick={() => setNavOpen(true)}><Menu size={20} /></button><span className="workspace-breadcrumb">Workspace <ChevronRight size={13} /></span><span className="current-title">{chat.active.title}</span></div><div className="demo-badge"><span /> Research preview</div></header>
      <div className={`reading-area ${empty ? 'is-empty' : ''}`} ref={scroller} onScroll={() => { const el = scroller.current; if (el) { nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90; setMoreBelow(!nearBottom.current); } }}>
        {empty ? <section className="welcome"><div className="welcome-eyebrow"><span /> SPACE FOR YOUR NEXT IDEA</div><h1>Good questions.<br /><em>Clearer thinking.</em></h1><p className="welcome-description">Bring your documents, questions, and loose ends.<br className="desktop-break" /> Let’s make something useful of them.</p><div className="suggestion-label">A PLACE TO START <span /></div><div className="suggestions">{chat.suggestions.map((suggestion, i) => { const Icon = [FileText, Search, Layers][i]; return <button key={suggestion} onClick={() => { chat.setDraft(suggestion); textarea.current?.focus(); }}><Icon size={20} strokeWidth={1.5} /><span>{suggestion}</span><ArrowUpRight className="suggestion-arrow" size={17} /></button>; })}</div><div className="welcome-footnote"><Paperclip size={14} /> More context makes for better conversations.</div></section> : null}
        <div data-testid="messages" className="messages" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions text">{chat.messages.map((message, index) => <article key={message.id} className={`message ${message.role}`}>
          <div className="message-identity">{message.role === 'assistant' ? <Mark small /> : <span className="user-avatar">JD</span>}<span>{message.role === 'assistant' ? 'Folio' : 'You'}</span>{message.role === 'assistant' && <span className="identity-caption">RESEARCH ASSISTANT</span>}</div>
          <div className="message-body">
            {message.attachments?.length ? <div className="sent-files">{message.attachments.map(f => <FileChip key={f.id} file={f} />)}</div> : null}
            {message.role === 'assistant' && index === chat.messages.length - 1 && chat.tools.length > 0 && <div className="tool-activity" data-testid="tool-activity"><div className="activity-heading"><span>{chat.busy ? 'Working through your question' : message.status === 'stopped' || message.status === 'error' ? 'Work paused' : 'Research complete'}</span><span>{chat.tools.filter(t => t.status === 'complete').length}/{chat.tools.length}</span></div><div className="tool-steps">{chat.tools.map(tool => <div className={`tool-step ${tool.status}`} key={tool.id}>{tool.status === 'complete' ? <Check size={14} /> : tool.status === 'running' && chat.busy ? <LoaderCircle size={14} className="spin" /> : <Circle size={12} />}<span>{tool.label}</span><span className="tool-status">{tool.status === 'running' && !chat.busy ? 'Paused' : tool.status}</span></div>)}</div></div>}
            <div className="markdown">{message.role === 'user' ? <p className="user-text">{message.content}</p> : <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{ table: ({ children }) => <div className="table-wrap" tabIndex={0}><table>{children}</table></div> }}>{message.content}</ReactMarkdown>}</div>
            {message.role === 'assistant' && !message.content && chat.busy && <div className="thinking">Finding the useful connections<span>...</span></div>}
            {message.role === 'assistant' && <div className="message-actions">{message.content && <button onClick={() => copy(message.id, message.content)} aria-label="Copy response">{copied[message.id] === 'Copied' ? <Check size={14} /> : <Copy size={14} />}<span aria-live="polite">{copied[message.id] || 'Copy response'}</span></button>}{message.status === 'stopped' && <span className="stopped-label">Response stopped · Your progress is saved</span>}</div>}
          </div>
        </article>)}</div>
      </div>
      <div className={`composer-section ${empty ? 'welcome-composer' : ''}`}>
        {!empty && moreBelow && <button className="latest-button" onClick={() => { nearBottom.current = true; if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }}><ArrowDown size={14} /> Latest response</button>}
        {chat.error && <div role="alert" className="feedback error-feedback">{chat.error}</div>}
        {chat.canRetry && <button className="retry-button" aria-label="Retry response" onClick={chat.retry}><RotateCcw size={15} /> Retry response</button>}
        <form className="composer" onSubmit={e => { e.preventDefault(); send(); }}>
          {chat.pending.length > 0 && <div data-testid="pending-attachments" className="pending-files">{chat.pending.map(f => <FileChip key={f.id} file={f} remove={() => chat.removeFile(f.id)} />)}</div>}
          <textarea ref={textarea} aria-label="Message" placeholder={empty ? 'What would you like to explore?' : 'Ask a follow-up, or bring in a document…'} value={chat.draft} rows={2} onChange={e => chat.setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
          <div className="composer-toolbar"><div className="composer-left"><button type="button" className="attach-button" aria-label="Attach files" onClick={() => input.current?.click()}><Paperclip size={17} /><span>Attach documents</span></button><button type="button" className="icon-button file-help-button" aria-label="File requirements" aria-expanded={fileHelp} aria-controls="file-help" onClick={() => setFileHelp(v => !v)}><Info size={15} /></button></div><div className="send-controls"><span className="key-hint">Shift + Enter for a new line</span>{chat.busy ? <button className="send-button stop-button" type="button" aria-label="Stop response" onClick={chat.stop}><Square size={15} fill="currentColor" /></button> : <button className="send-button" type="submit" aria-label="Send message" disabled={!chat.draft.trim() && !chat.pending.length}><ArrowUp size={20} /></button>}</div></div>
          <input ref={input} type="file" className="sr-only" tabIndex={-1} aria-label="Upload files" accept=".txt,.md,.pdf,.png,.jpg,.jpeg" multiple onChange={e => { if (e.target.files) chat.addFiles(e.target.files); e.target.value = ''; }} />
        </form>
        {fileHelp && <p id="file-help" className="file-help">PDF, TXT, MD, PNG, JPG · Up to 5 files, 10 MB each. Select files or drop them into the conversation. Files stay in your browser.</p>}
        {chat.notice && <div role="alert" className="feedback">{chat.notice}</div>}
        <div className="composer-footer"><span><ShieldCheck size={13} /> Files stay in your browser. Responses are simulated.</span><span className="file-limits">PDF, TXT, MD, PNG, JPG · 10 MB each · Up to 5 files</span></div>
      </div>
      {dragging && <div className="drop-overlay"><div><Paperclip size={34} /><h2>A little more context.</h2><p>Drop your documents to add them to this conversation.</p><span>Up to 5 files · 10 MB each</span></div></div>}
    </main>
  </div>;
}
