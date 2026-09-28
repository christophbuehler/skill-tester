import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { ArrowUp, Plus, PanelLeft, Pause, X, FileText, Check, Copy, Square, RotateCcw, ArrowUpRight, LoaderCircle, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '@fontsource-variable/geist';
import { useChat, formatBytes, type Attachment } from '../shared/chat';

function FileObject({ file, remove }: { file: Attachment; remove?: () => void }) {
  const present = useIsPresent();
  return <motion.div layout layoutId={`document-${file.id}`} initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .94 }} className="file-object" inert={!present} aria-hidden={!present || undefined}>
    <span className="file-icon"><FileText size={20} /></span><span className="file-info"><strong>{file.name}</strong><small>{formatBytes(file.size)}</small></span>
    {remove && <button type="button" className="icon-button remove" aria-label={`Remove ${file.name}`} onClick={remove}><X size={15} /></button>}
  </motion.div>;
}
function History({ children, close }: { children: React.ReactNode; close: () => void }) {
  const present = useIsPresent();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.querySelector<HTMLButtonElement>('button')?.focus(); }, []);
  return <motion.div ref={ref} className="history material" role="dialog" aria-modal={present ? true : undefined} aria-label="Conversations" inert={!present} aria-hidden={!present || undefined}
    initial={{ opacity: 0, scale: .92, y: -12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .94, y: -8 }} style={{ pointerEvents: present ? 'auto' : 'none' }}
    onKeyDown={e => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'Tab') {
        const buttons = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button') || []);
        const first = buttons[0], last = buttons.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }}>{children}</motion.div>;
}
export default function App() {
  const chat = useChat();
  const reduced = useReducedMotion();
  const [history, setHistory] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState<Record<string, string>>({});
  const input = useRef<HTMLTextAreaElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const historyTrigger = useRef<HTMLButtonElement>(null);
  const reader = useRef<HTMLDivElement>(null);
  const positions = useRef<Record<string, number>>({});
  const drafts = useRef<Record<string, string>>({});
  const follow = useRef(true);
  const empty = chat.messages.length === 0;
  useLayoutEffect(() => {
    if (input.current) { input.current.style.height = '0px'; input.current.style.height = `${Math.min(180, Math.max(empty ? 56 : 44, input.current.scrollHeight))}px`; }
  }, [chat.draft, empty]);
  useLayoutEffect(() => { if (reader.current) reader.current.scrollTop = positions.current[chat.activeId] || 0; follow.current = true; }, [chat.activeId]);
  useEffect(() => { if (chat.busy && follow.current && reader.current) reader.current.scrollTop = reader.current.scrollHeight; }, [chat.messages, chat.busy]);
  function closeHistory() { setHistory(false); historyTrigger.current?.focus(); }
  function navigate(id?: string) {
    drafts.current[chat.activeId] = chat.draft;
    if (id) { chat.selectChat(id); chat.setDraft(drafts.current[id] || ''); } else chat.newChat();
    closeHistory();
  }
  async function copy(id: string, content: string) {
    try { await navigator.clipboard.writeText(content); setCopied(s => ({ ...s, [id]: 'Copied' })); }
    catch { setCopied(s => ({ ...s, [id]: 'Copy failed' })); }
    window.setTimeout(() => setCopied(s => ({ ...s, [id]: '' })), 2200);
  }
  return <MotionConfig reducedMotion="user" transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 36 }}>
    <main className={`app ${empty ? 'is-welcome' : 'is-conversation'}`} data-testid="drop-zone"
      onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
      onDrop={e => { e.preventDefault(); setDragging(false); chat.addFiles(e.dataTransfer.files); }}>
      <header className="topbar">
        <div className="toolbar material">
          <button ref={historyTrigger} className="icon-button" aria-label="Open conversations" aria-expanded={history} onClick={() => history ? closeHistory() : setHistory(true)}><PanelLeft size={19} /></button>
          <span className="toolbar-divider" /><span className="wordmark">folio<span>.</span></span><span className="toolbar-divider" />
          <button className="icon-button" aria-label="New chat" onClick={() => navigate()}><Plus size={21} /></button>
        </div>
        {!empty && <div className="conversation-title">{chat.active.title}</div>}
        <span className="workspace-label">Your research workspace</span>
      </header>
      <AnimatePresence>{history && <><motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, pointerEvents: 'none' }} onClick={closeHistory} /><History close={closeHistory}>
        <div className="history-heading"><h2>Conversations</h2><button className="icon-button" aria-label="Close conversations" onClick={closeHistory}><X size={18} /></button></div>
        <p className="history-caption">Pick up where you left off.</p>
        <div className="conversation-list">{chat.conversations.map(c => <button key={c.id} aria-label={c.title} className={`conversation-item ${c.id === chat.activeId ? 'selected' : ''}`} onClick={() => navigate(c.id)}><MessageSquare size={18} /><span>{c.title}<small>{c.messages.length ? `${c.messages.length} messages` : 'Ready for a new question'}</small></span>{c.id === chat.activeId && <Check size={16} />}</button>)}</div>
      </History></>}</AnimatePresence>
      <div className="reader" ref={reader} onScroll={() => { if (reader.current) { const el = reader.current; positions.current[chat.activeId] = el.scrollTop; follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100; } }}>
        <div className="reading-column" data-testid="messages">
          {!empty && chat.messages.map((m, index) => <article key={m.id} className={`message ${m.role}`}>
            {m.role === 'user' ? <><div className="message-label">You</div>{index === 0 ? <h1 className="question">{m.content}</h1> : <h2 className="question">{m.content}</h2>}{!!m.attachments?.length && <div className="sent-files">{m.attachments.map(f => <FileObject key={f.id} file={f} />)}</div>}</> : <>
              <div className="answer-heading"><span className="answer-wordmark">folio<span>.</span></span><span>{m.status === 'streaming' ? 'Working on your question' : m.status === 'stopped' ? 'Response stopped' : m.status === 'error' ? 'Response interrupted' : 'Response'}</span></div>
              {index === chat.messages.length - 1 && chat.tools.length > 0 && <div className="tool-activity" data-testid="tool-activity"><div className="activity-summary" role="status">{chat.busy ? <LoaderCircle size={15} className="spinning" /> : m.status === 'complete' ? <Check size={15} /> : <Pause size={15} />}<span>{chat.busy ? 'Research in progress' : m.status === 'complete' ? 'Research complete' : 'Research paused'}</span><span className="activity-count">{chat.tools.filter(t => t.status === 'complete').length} / {chat.tools.length}</span></div><div className="tool-steps">{chat.tools.map(t => <span key={t.id} className={`tool-step ${t.status}`}>{t.status === 'complete' ? <Check size={13} /> : t.status === 'running' ? <LoaderCircle size={13} className={chat.busy ? "spinning" : undefined} /> : <span className="step-dot" />}{t.label}</span>)}</div></div>}
              <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: ({ children }) => <pre tabIndex={0} aria-label="Code example">{children}</pre> }}>{m.content}</ReactMarkdown></div>
              {m.content && m.status !== 'streaming' && <button className="copy-button" aria-label="Copy response" onClick={() => copy(m.id, m.content)}>{copied[m.id] === 'Copied' ? <Check size={15} /> : <Copy size={15} />}<span aria-live="polite">{copied[m.id] || 'Copy response'}</span></button>}
            </>}
          </article>)}
          {chat.error && <div role="alert" className="error-notice">{chat.error}</div>}
          {chat.canRetry && <button className="retry-button" aria-label="Retry response" onClick={chat.retry}><RotateCcw size={16} />Retry response</button>}
        </div>
      </div>
      <div className="compose-position">
        {empty && <div className="welcome"><h1>A little clarity starts here.</h1><p>Ask a question. Bring your documents.<br />Make room for your next idea.</p></div>}
        <motion.form layout className={`composer material ${dragging ? 'dragging' : ''}`} onSubmit={e => { e.preventDefault(); if (!chat.busy) chat.send(); }}>
          <motion.div layout className="pending-files" data-testid={chat.pending.length ? "pending-attachments" : undefined} style={{ paddingBottom: chat.pending.length ? 14 : 0 }}><AnimatePresence initial={false}>{chat.pending.map(f => <FileObject key={f.id} file={f} remove={() => chat.removeFile(f.id)} />)}</AnimatePresence></motion.div>
          <motion.textarea layout="position" ref={input} aria-label="Message" placeholder={empty ? 'What would you like to explore?' : 'Ask a follow-up question…'} value={chat.draft} onChange={e => chat.setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); if (!chat.busy) chat.send(); } }} />
          <motion.button layout="position" type="button" className="attach-button" aria-label="Attach files" title="TXT, MD, PDF, PNG or JPG · Up to 5 files, 10 MB each" onClick={() => upload.current?.click()}><Plus size={20} /><span>Attach files</span></motion.button><span className="input-hint">{chat.busy ? 'You can keep writing' : 'Shift + Enter for a new line'}</span>
            {chat.busy ? <motion.button layout="position" type="button" className="send-button stop" aria-label="Stop response" onClick={chat.stop}><Square size={16} fill="currentColor" /></motion.button> : <motion.button layout="position" type="submit" className="send-button" aria-label="Send message" disabled={!chat.draft.trim() && !chat.pending.length}><ArrowUp size={21} /></motion.button>}
          <input ref={upload} className="sr-only" type="file" multiple accept=".txt,.md,.pdf,.png,.jpg,.jpeg" aria-label="Upload files" onChange={e => { if (e.target.files) chat.addFiles(e.target.files); e.target.value = ''; }} />
        </motion.form>
        {chat.notice && <div role="alert" className="validation-notice">{chat.notice}</div>}
        {empty && <div className="suggestions"><span>A place to start</span>{chat.suggestions.map(s => <button key={s} onClick={() => { chat.setDraft(s); input.current?.focus(); }}>{s}<ArrowUpRight size={15} /></button>)}</div>}
        <p className="privacy-note">Files stay in your browser. Responses are simulated.</p>
      </div>
      {dragging && <div className="drop-overlay"><FileText size={32} /><strong>Bring your documents into the conversation</strong><span>Drop up to 5 files · 10 MB each</span></div>}
    </main>
  </MotionConfig>;
}
