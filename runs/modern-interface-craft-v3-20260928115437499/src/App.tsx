import { forwardRef, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion, useIsPresent, type HTMLMotionProps } from 'motion/react';
import { ArrowUp, ArrowUpRight, Check, ChevronDown, Copy, FileText, LoaderCircle, Plus, Search, Square, X, RotateCcw, MessageSquare, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat, formatBytes } from '../shared/chat';
import '@fontsource-variable/manrope';
import '@fontsource-variable/geist';

const PresenceSurface = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>((props, ref) => {
  const present = useIsPresent();
  return <motion.div {...props} ref={ref} inert={!present} />;
});

export default function App() {
  const chat = useChat();
  const [history, setHistory] = useState(false);
  const [query, setQuery] = useState('');
  const [dragging, setDragging] = useState(false);
  const [expandedTools, setExpandedTools] = useState<boolean | null>(null);
  const [copied, setCopied] = useState<Record<string, string>>({});
  const input = useRef<HTMLTextAreaElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const historyBox = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const follow = useRef(false);
  const reduced = useReducedMotion();
  const toolsOpen = expandedTools ?? chat.busy;
  const working = chat.messages.length > 0;
  const closeHistory = () => { setHistory(false); trigger.current?.focus(); };
  useEffect(() => {
    if (!history) return;
    search.current?.focus();
    const dismiss = (event: PointerEvent) => { if (!historyBox.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setHistory(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') closeHistory(); };
    document.addEventListener('pointerdown', dismiss); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [history]);
  useEffect(() => {
    const guard = (event: DragEvent) => { event.preventDefault(); };
    window.addEventListener('dragover', guard); window.addEventListener('drop', guard);
    return () => { window.removeEventListener('dragover', guard); window.removeEventListener('drop', guard); };
  }, []);
  useEffect(() => { const el = input.current; if (el) { el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 180)}px`; } }, [chat.draft, working]);
  useEffect(() => { if (scroll.current && follow.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [chat.messages, chat.tools]);
  useEffect(() => { follow.current = false; setExpandedTools(null); if (scroll.current) scroll.current.scrollTop = 0; }, [chat.activeId]);
  const send = () => { if (!chat.busy) { follow.current = true; setExpandedTools(null); chat.send(); input.current?.focus(); } };
  const copy = async (id: string, content: string) => { try { await navigator.clipboard.writeText(content); setCopied(s => ({ ...s, [id]: 'Copied' })); } catch { setCopied(s => ({ ...s, [id]: 'Copy failed' })); } window.setTimeout(() => setCopied(s => ({ ...s, [id]: '' })), 2200); };
  return <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 420, damping: 38 }}>
    <div className={`app ${working ? 'is-working' : 'is-welcome'}`}>
      <header className="topbar flex items-center justify-between">
        <a className="wordmark" href="#" onClick={e => { e.preventDefault(); chat.newChat(); }}>folio</a>
        <div className="navigation">
          <button ref={trigger} className={`conversation-trigger ${history ? 'selected' : ''}`} aria-label="Open conversations" aria-expanded={history} aria-controls="conversation-history" onClick={() => { setHistory(!history); setQuery(''); }}><span>{working ? chat.active.title : 'Your workspace'}</span><ChevronDown size={16} className={history ? 'rotated' : ''}/></button>
          <AnimatePresence>{history && <PresenceSurface ref={historyBox} id="conversation-history" className="history" role="region" aria-label="Conversations" initial={{ opacity: 0, y: reduced ? 0 : -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -6 }} transition={{ duration: .16 }}>
            <div className="search"><Search size={17}/><input ref={search} aria-label="Search conversations" placeholder="Find a conversation" value={query} onChange={e => setQuery(e.target.value)}/></div>
            <button className="history-new" aria-label="Create conversation" onClick={() => { chat.newChat(); closeHistory(); input.current?.focus(); }}><Plus size={18}/> New conversation</button>
            <div className="history-label">Conversations</div>
            <div className="history-list">{chat.conversations.filter(c => c.title.toLowerCase().includes(query.toLowerCase())).map(c => <button className={`history-item ${c.id === chat.activeId ? 'active' : ''}`} key={c.id} aria-label={c.title} aria-current={c.id === chat.activeId ? 'page' : undefined} onClick={() => { chat.selectChat(c.id); closeHistory(); }}><MessageSquare size={17}/><span>{c.title}</span>{c.id === chat.activeId && <Check size={16}/>}</button>)}{!chat.conversations.some(c => c.title.toLowerCase().includes(query.toLowerCase())) && <p className="no-results">No conversations found.</p>}</div>
          </PresenceSurface>}</AnimatePresence>
        </div>
        <button className="new-button" aria-label="New chat" onClick={() => { chat.newChat(); input.current?.focus(); }}><Plus size={18}/><span>New chat</span></button>
      </header>
      <main className="workspace">
        {!working && <div className="intro"><div className="eyebrow">ROOM TO THINK</div><h1>Good questions.<br/><span>Clearer perspectives.</span></h1><p>Bring your documents. Follow your curiosity.</p></div>}
        <div className={`conversation-scroll ${working ? '' : 'empty'}`} ref={scroll} onScroll={() => { const el = scroll.current; if (el && chat.busy) follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100; }}>
          <div data-testid="messages" className="messages" aria-label="Conversation" aria-busy={chat.busy}>
            {chat.messages.map((message, index) => <article key={message.id} className={`message ${message.role}`}>
              <div className="message-label">{message.role === 'user' ? 'You' : 'Folio'}</div>
              {!!message.attachments?.length && <div className="sent-files">{message.attachments.map(file => <div className="sent-file" key={file.id}><FileText size={19}/><div><span>{file.name}</span><small>{formatBytes(file.size)}</small></div></div>)}</div>}
              {message.role === 'user' ? <>{index === 0 ? <h1 className="user-text">{message.content}</h1> : <p className="user-text">{message.content}</p>}</> : <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: ({ children }) => <pre tabIndex={0} aria-label="Code example">{children}</pre>, table: ({ children }) => <div className="table-scroll" tabIndex={0} role="region" aria-label="Response table"><table>{children}</table></div> }}>{message.content}</ReactMarkdown></div>}
              {message.role === 'assistant' && <>

                {message.content && <button className="copy-button" aria-label="Copy response" onClick={() => copy(message.id, message.content)}>{copied[message.id] === 'Copied' ? <Check size={14}/> : <Copy size={14}/>}<span aria-live="polite">{copied[message.id] || 'Copy response'}</span></button>}
                {message.status === 'stopped' && <p className="paused">Response stopped. Continue when you’re ready.</p>}
              </>}
            </article>)}
            {chat.error && <p className="error" role="alert">{chat.error}</p>}
            {chat.canRetry && <button className="retry" aria-label="Retry response" onClick={() => { follow.current = true; setExpandedTools(null); chat.retry(); }}><RotateCcw size={16}/> Retry response</button>}
          </div>
        </div>
        <motion.div layout={reduced ? false : 'position'} className="composer-area" key="composer">
          <motion.form layout={reduced ? false : true} className={`composer ${dragging ? 'dragging' : ''}`} data-testid="drop-zone" onSubmit={e => { e.preventDefault(); send(); }} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }} onDrop={e => { e.preventDefault(); setDragging(false); chat.addFiles(e.dataTransfer.files); }}>
            {working && !!chat.tools.length && <motion.div layout="position" className="tool-activity" data-testid="tool-activity">
              <button type="button" className="tool-summary" aria-expanded={toolsOpen} aria-controls="research-steps" onClick={() => setExpandedTools(!toolsOpen)}>
                {chat.busy ? <LoaderCircle size={16} className="spin"/> : chat.canRetry ? <Square size={14}/> : <Check size={16}/>}
                <span>{chat.busy ? 'Working through your question' : chat.canRetry ? 'Work paused' : 'Research steps complete'}</span><ChevronDown size={16}/>
              </button>
              <div id="research-steps" className={`tool-steps ${toolsOpen ? 'expanded' : ''}`} inert={!toolsOpen}><div className="tool-track">
                {chat.tools.map(tool => <div className="tool-step" data-status={tool.status} key={tool.id}>
                  {tool.status === 'complete' ? <Check size={14}/> : tool.status === 'running' && chat.busy ? <LoaderCircle size={14} className="spin"/> : <span className="step-dot"/>}
                  <span>{tool.label}</span><small>{tool.status === 'running' && !chat.busy ? 'paused' : tool.status}</small>
                </div>)}
              </div></div>
            </motion.div>}
            <AnimatePresence initial={false}>{chat.pending.length > 0 && <motion.div layout="position" className="pending-files" data-testid="pending-attachments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AnimatePresence initial={false}>{chat.pending.map(file => <PresenceSurface layout="position" className="pending-file" key={file.id} initial={{ opacity: 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><FileText size={20}/><div><span>{file.name}</span><small>{formatBytes(file.size)}</small></div><button type="button" aria-label={`Remove ${file.name}`} onClick={() => chat.removeFile(file.id)}><X size={15}/></button></PresenceSurface>)}</AnimatePresence></motion.div>}</AnimatePresence>
            <motion.textarea layout="position" ref={input} aria-label="Message" placeholder={dragging ? 'Drop your documents here' : working ? 'Keep the conversation going…' : 'What would you like to understand?'} value={chat.draft} rows={working ? 1 : 2} onChange={e => chat.setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}/>
            <motion.div layout="position" className="composer-controls"><div className="attachment-controls"><button type="button" className="attach-button" aria-label="Attach files" title="Attach files" onClick={() => upload.current?.click()}><Paperclip size={21}/></button><span>{working ? 'Add context' : 'Add documents for context'}</span></div><motion.button whileTap={reduced ? {} : { scale: .92 }} type={chat.busy ? 'button' : 'submit'} className="send-button" aria-label={chat.busy ? 'Stop response' : 'Send message'} disabled={!chat.busy && !chat.draft.trim() && !chat.pending.length} onClick={chat.busy ? chat.stop : undefined}>{chat.busy ? <Square size={18} fill="currentColor"/> : <ArrowUp size={25}/>}</motion.button></motion.div>
            <input ref={upload} className="sr-only" type="file" tabIndex={-1} aria-label="Upload files" multiple accept=".txt,.md,.pdf,.png,.jpg,.jpeg" onChange={e => { if (e.target.files) chat.addFiles(e.target.files); e.target.value = ''; }}/>
          </motion.form>
          {chat.notice && <div className="error notice" role="alert">{chat.notice}</div>}
          <div className="privacy">Files stay in your browser. Responses are simulated.<span className="file-limits"> PDF, text & images · Up to 5 files, 10 MB each</span></div>
        </motion.div>
        {!working && <div className="suggestions"><span className="suggestion-label">A place to start</span><div className="suggestion-options">{chat.suggestions.map((suggestion, i) => <button key={suggestion} onClick={() => { chat.setDraft(suggestion); input.current?.focus(); }}><span className="suggestion-number">0{i + 1}</span><span>{suggestion}</span><ArrowUpRight size={17}/></button>)}</div></div>}
      </main>
    </div>
  </MotionConfig>;
}
