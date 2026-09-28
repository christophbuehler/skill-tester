import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight, Check, ChevronRight, Copy, FileText, LoaderCircle, Menu, Paperclip, Plus, RotateCcw, Square, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MotionConfig, motion } from 'motion/react';
import '@fontsource-variable/geist';
import { useChat, formatBytes } from '../shared/chat';

export default function App() {
  const chat = useChat();
  const input = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const [dragging, setDragging] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [copied, setCopied] = useState<Record<string, string>>({});
  const empty = chat.messages.length === 0;
  useEffect(() => { const el = textarea.current; if (el) { el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 180)}px`; } }, [chat.draft, empty]);
  useEffect(() => { follow.current = true; if (scroll.current) scroll.current.scrollTop = 0; }, [chat.activeId]);
  useEffect(() => { if (chat.busy && follow.current && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [chat.messages, chat.tools, chat.busy]);
  useEffect(() => {
    const el = scroll.current;
    if (!el) return;
    const measure = () => setHasMore(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [chat.messages, chat.tools, empty]);
  const latest = () => { const el = scroll.current; if (el) { el.scrollTop = el.scrollHeight; follow.current = true; setHasMore(false); } };
  const choose = (id: string) => { chat.selectChat(id); drawer.current?.close(); };
  const create = () => { chat.newChat(); drawer.current?.close(); textarea.current?.focus(); };
  const send = () => { if (!chat.busy) { follow.current = true; chat.send(); } };
  async function copy(id: string, content: string) { try { await navigator.clipboard.writeText(content); setCopied(s => ({ ...s, [id]: 'Copied' })); } catch { setCopied(s => ({ ...s, [id]: 'Could not copy' })); } }
  const navigation = <>
    <div className="brand-row"><a className="wordmark" href="#" onClick={e => { e.preventDefault(); create(); }}>folio<span>.</span></a><span className="edition">WORKSPACE</span></div>
    <button className="new-chat" aria-label="New chat" onClick={create}><Plus size={17} /> New conversation <span className="new-mark">↗</span></button>
    <div className="index-label">YOUR CONVERSATIONS <span>{String(chat.conversations.length).padStart(2, '0')}</span></div>
    <nav aria-label="Conversations" className="conversation-list">{chat.conversations.map(c => <button key={c.id} aria-label={c.title} aria-current={chat.activeId === c.id ? 'page' : undefined} className={chat.activeId === c.id ? 'conversation active' : 'conversation'} onClick={() => choose(c.id)}><span className="conversation-dot" /><span>{c.title}</span><ChevronRight size={14} /></button>)}</nav>
    <div className="sidebar-bottom"><div className="local-label"><span /> A little room for big ideas.</div><p>Your files stay in this browser.<br />A demo workspace, made for exploring.</p><div className="profile"><div className="avatar">YO</div><div>Your workspace<small>Personal research</small></div></div></div>
  </>;
  return <MotionConfig reducedMotion="user"><div className="app-shell">
    <aside className="sidebar">{navigation}</aside>
    <dialog ref={drawer} aria-label="Conversations" className="nav-dialog" onClick={e => { if (e.target === drawer.current) drawer.current?.close(); }}><div className="drawer-inner"><button className="drawer-close icon-button" aria-label="Close conversations" onClick={() => drawer.current?.close()}><X size={20} /></button>{navigation}</div></dialog>
    <main className="main-panel" data-testid="drop-zone" onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }} onDrop={e => { e.preventDefault(); setDragging(false); chat.addFiles(e.dataTransfer.files); }}>
      <header className="topbar"><div className="breadcrumb"><button className="mobile-menu icon-button" aria-label="Open conversations" onClick={() => drawer.current?.showModal()}><Menu size={20} /></button><span className="breadcrumb-root">Workspace</span><span className="slash">/</span><span className="conversation-title">{empty ? chat.active.title : <h1>{chat.active.title}</h1>}</span></div><span className="demo-badge"><span /> DEMO</span></header>
      <div ref={scroll} className={`reading-scroll ${empty ? 'is-empty' : ''}`} onScroll={e => { const el = e.currentTarget; follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100; setHasMore(el.scrollHeight - el.scrollTop - el.clientHeight > 80); }}>
        {empty && <motion.section key={chat.activeId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }} className="welcome"><div className="eyebrow"><span className="small-rule" /> SPACE TO THINK</div><h1>Good questions.<br /><em>Clearer thinking.</em></h1><p>Bring your documents, untangle an idea,<br className="desktop-break" /> and find your next step.</p></motion.section>}
        <div className="messages" data-testid="messages" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions text">
          {chat.messages.map(m => <article key={m.id} className={`message ${m.role}`}>
            <div className="message-byline"><span className={m.role === 'assistant' ? 'folio-avatar' : 'you-avatar'}>{m.role === 'assistant' ? 'f.' : 'Y'}</span><span>{m.role === 'assistant' ? 'Folio' : 'You'}</span><span className="message-kind">{m.role === 'assistant' ? 'RESEARCH ASSISTANT' : 'QUESTION'}</span></div>
            {m.attachments && <div className="sent-files">{m.attachments.map(f => <div className="file-item" key={f.id}><FileText size={18} /><div><strong>{f.name}</strong><small>{formatBytes(f.size)}</small></div></div>)}</div>}

            {m.role === 'user' ? <p className="question-text">{m.content}</p> : <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>{m.status === 'streaming' && !m.content && <div className="thinking">Connecting the dots<span>•••</span></div>}</div>}
            {m.role === 'assistant' && m.content && m.status !== 'streaming' && <div className="answer-footer"><button className="copy-button" aria-label="Copy response" onClick={() => copy(m.id, m.content)}>{copied[m.id] === 'Copied' ? <Check size={14} /> : <Copy size={14} />}<span role="status">{copied[m.id] || 'Copy response'}</span></button>{m.status === 'stopped' && <span className="paused-label">Response stopped</span>}</div>}
          </article>)}
        </div>
      </div>
      <motion.div layout="position" transition={{ duration: .28, ease: [0.22, 1, 0.36, 1] }} className={`writing-area ${empty ? 'welcome-writing' : ''}`}>
        {!empty && <div className="dock-heading"><span>{chat.busy ? 'RESEARCH IN PROGRESS' : chat.canRetry ? 'RESEARCH PAUSED' : 'CONTINUE THE CONVERSATION'}</span>{hasMore && <button className="latest-button" onClick={latest}>Latest text <ArrowUp size={13} /></button>}</div>}
            {chat.tools.length > 0 && <div className={`tool-activity ${!chat.busy && !chat.canRetry ? 'finished' : ''}`} data-testid="tool-activity"><div className="activity-heading">{chat.busy ? 'Working through your question' : !chat.canRetry ? 'Research complete' : 'Work paused'}</div><div className="tool-steps">{chat.tools.map(t => <div className={`tool-step ${t.status}`} key={t.id}>{t.status === 'complete' ? <Check size={13} /> : t.status === 'running' && chat.busy ? <LoaderCircle className="spin" size={13} /> : <span className="step-dot" />}<span>{t.label}</span></div>)}</div></div>}
        {(chat.error || chat.canRetry) && <div className="retry-bar">{chat.error ? <span role="alert">{chat.error}</span> : <span>Paused here. Continue when you’re ready.</span>}<button aria-label="Retry response" onClick={chat.retry}><RotateCcw size={15} /> Retry response</button></div>}
        <form className={`composer ${chat.busy ? 'working' : ''}`} onSubmit={e => { e.preventDefault(); send(); }}>
          {empty && <div className="writing-label">YOUR QUESTION</div>}
          {chat.pending.length > 0 && <div className="pending-files" data-testid="pending-attachments">{chat.pending.map(f => <div className="file-item" key={f.id}><FileText size={18} /><div><strong>{f.name}</strong><small>{formatBytes(f.size)}</small></div><button type="button" className="icon-button" aria-label={`Remove ${f.name}`} onClick={() => chat.removeFile(f.id)}><X size={15} /></button></div>)}</div>}
          <textarea ref={textarea} aria-label="Message" rows={1} placeholder={empty ? 'What would you like to explore?' : 'Ask a follow-up question…'} value={chat.draft} onChange={e => chat.setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
          <div className="composer-toolbar"><button type="button" className="attach-button" aria-label="Attach files" onClick={() => input.current?.click()} title="Add up to 5 files · 10 MB each · TXT, MD, PDF, PNG, JPG"><Paperclip size={17} /><span>Attach documents</span></button><div className="send-group"><span className="keyboard-hint">{chat.busy ? 'Folio is working' : 'Shift + Enter for a new line'}</span>{chat.busy ? <button type="button" className="send-button stop-button" aria-label="Stop response" onClick={chat.stop}><Square size={12} fill="currentColor" /><span>Stop</span></button> : <button type="submit" className="send-button" aria-label="Send message" disabled={!chat.draft.trim() && !chat.pending.length}><span>Ask Folio</span><ArrowUp size={17} /></button>}</div></div>
          <input ref={input} className="sr-only" tabIndex={-1} type="file" multiple accept=".txt,.md,.pdf,.png,.jpg,.jpeg" aria-label="Upload files" onChange={e => { if (e.target.files) chat.addFiles(e.target.files); e.target.value = ''; }} />
        </form>
        {chat.notice && <p role="alert" className="notice">{chat.notice}</p>}
        {empty && <div className="suggestions"><div className="suggestions-label">A PLACE TO START</div>{chat.suggestions.map((s, i) => <button key={s} onClick={() => { chat.setDraft(s); textarea.current?.focus(); }}><span className="suggestion-number">0{i + 1}</span><span>{s}</span><ArrowUpRight size={16} /></button>)}</div>}
        <div className="workspace-note"><span className="privacy-dot" /> Files stay in your browser <span className="note-separator">·</span> Responses are simulated</div>
      </motion.div>
      {dragging && <div className="drop-overlay"><Paperclip size={32} /><h2>Bring your context.</h2><p>Drop up to 5 documents here · 10 MB each</p><small>TXT, MD, PDF, PNG or JPG</small></div>}
    </main>
  </div></MotionConfig>;
}
