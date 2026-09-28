import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUp, ArrowUpRight, Check, ChevronDown, Circle, Copy, FileText, LoaderCircle, MessageSquare, Paperclip, Plus, RotateCcw, Square, X, PanelLeft, ArrowDown } from 'lucide-react';
import { useChat, formatBytes, type Attachment } from '../shared/chat';

function FolioMark({ small = false }: { small?: boolean }) { return <span className={`folio-mark ${small ? 'small' : ''}`} aria-hidden="true"><span/><span/><span/></span>; }
function FileItem({ file, remove }: { file: Attachment; remove?: () => void }) { return <div className="file-item"><span className="file-icon"><FileText size={18}/></span><span className="file-info"><span title={file.name}>{file.name}</span><small>{formatBytes(file.size)} · {file.name.split('.').pop()?.toUpperCase()}</small></span>{remove && <button type="button" className="icon-button" aria-label={`Remove ${file.name}`} onClick={remove}><X size={15}/></button>}</div>; }

export default function App() {
 const chat = useChat();
 const [navOpen, setNavOpen] = useState(false);
 const [dragging, setDragging] = useState(false);
 const [copied, setCopied] = useState<Record<string, string>>({});
 const [atBottom, setAtBottom] = useState(true);
 const input = useRef<HTMLInputElement>(null);
 const textarea = useRef<HTMLTextAreaElement>(null);
 const scroll = useRef<HTMLDivElement>(null);
 const navTrigger = useRef<HTMLButtonElement>(null);
 const follow = useRef(true);
 const positions = useRef<Record<string, number>>({});
 const navigation = useRef<HTMLElement>(null);
 const dragDepth = useRef(0);
 const empty = chat.messages.length === 0;
 useEffect(() => { if (textarea.current) { textarea.current.style.height = 'auto'; textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 180)}px`; } }, [chat.draft]);
 useLayoutEffect(() => {
  const node = scroll.current;
  if (node) { node.scrollTop = positions.current[chat.activeId] ?? 0; follow.current = node.scrollHeight - node.scrollTop - node.clientHeight < 100; setAtBottom(follow.current); }
 }, [chat.activeId]);
 useLayoutEffect(() => { if (chat.busy && follow.current && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [chat.messages, chat.tools, chat.busy]);
 useEffect(() => { if (navOpen) navigation.current?.querySelector<HTMLButtonElement>('.new-chat')?.focus(); }, [navOpen]);
 useEffect(() => {
  if (!navOpen) return;
  const closeOutside = (event: PointerEvent) => { if (!navigation.current?.contains(event.target as Node) && !navTrigger.current?.contains(event.target as Node)) setNavOpen(false); };
  document.addEventListener('pointerdown', closeOutside);
  return () => document.removeEventListener('pointerdown', closeOutside);
 }, [navOpen]);
 function send() { if (!chat.busy) { follow.current = true; chat.send(); } }
 function navigate(id?: string) { if (id) chat.selectChat(id); else chat.newChat(); setNavOpen(false); textarea.current?.focus(); }
 async function copy(id: string, text: string) { try { await navigator.clipboard.writeText(text); setCopied(c => ({ ...c, [id]: 'Copied' })); } catch { setCopied(c => ({ ...c, [id]: 'Copy failed' })); } }
 const composer = <div className="composer-area">
   <form className={`composer ${dragging ? 'dragging' : ''}`} onSubmit={event => { event.preventDefault(); send(); }}>
    {chat.pending.length > 0 && <div data-testid="pending-attachments" className="attachment-list">{chat.pending.map(file => <FileItem key={file.id} file={file} remove={() => chat.removeFile(file.id)}/>)}</div>}
    <textarea ref={textarea} aria-label="Message" placeholder={empty ? 'Ask a question, or bring a document…' : 'Ask a follow-up…'} value={chat.draft} onChange={event => chat.setDraft(event.target.value)} rows={2} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }}/>
    <div className="composer-controls"><button type="button" className="attach-button" aria-label="Attach files" onClick={() => input.current?.click()}><Paperclip size={18}/><span>Attach files</span></button><span className="keyboard-hint">Shift + Enter for a new line</span>{chat.busy ? <button type="button" className="send-button stop" aria-label="Stop response" onClick={chat.stop}><Square size={16} fill="currentColor"/></button> : <button className="send-button" type="submit" aria-label="Send message" disabled={!chat.draft.trim() && !chat.pending.length}><ArrowUp size={21}/></button>}</div>
   </form>
   <input ref={input} className="sr-only" tabIndex={-1} type="file" multiple aria-label="Upload files" accept=".txt,.md,.pdf,.png,.jpg,.jpeg" onChange={event => { if (event.target.files) chat.addFiles(event.target.files); event.target.value = ''; }}/>
   {chat.notice && <p className="notice" role="alert">{chat.notice}</p>}
   <p className="composer-note">Files stay in your browser. Responses are simulated.</p>
 </div>;
 return <div className="app-shell">
  <aside ref={navigation} className={`sidebar ${navOpen ? 'is-open' : ''}`} id="conversation-navigation" aria-label="Conversations" onKeyDown={event => { if (event.key === 'Escape') { setNavOpen(false); navTrigger.current?.focus(); } }}>
   <a className="brand" href="#" onClick={event => { event.preventDefault(); navigate(); }} aria-label="Folio home"><FolioMark/><span>folio<span className="brand-period">.</span></span></a>
   <button className="new-chat" aria-label="New chat" onClick={() => navigate()}><Plus size={18}/><span>New conversation</span></button>
   <div className="nav-heading">Your conversations <span>{chat.conversations.length}</span></div>
   <nav>{chat.conversations.map(conversation => <button key={conversation.id} aria-label={conversation.title} aria-current={chat.activeId === conversation.id ? 'page' : undefined} className={`conversation-link ${chat.activeId === conversation.id ? 'selected' : ''}`} onClick={() => navigate(conversation.id)}><MessageSquare size={16}/><span>{conversation.title}</span>{chat.activeId === conversation.id && <span className="selected-dot"/>}</button>)}</nav>
   <button className="close-navigation" onClick={() => { setNavOpen(false); navTrigger.current?.focus(); }}><X size={16}/>Close conversations</button>
  </aside>
  <main className="main" data-testid="drop-zone" onDragEnter={event => { event.preventDefault(); if (event.dataTransfer.types.includes('Files')) { dragDepth.current++; setDragging(true); } }} onDragOver={event => event.preventDefault()} onDragLeave={event => { event.preventDefault(); dragDepth.current--; if (dragDepth.current <= 0) setDragging(false); }} onDrop={event => { event.preventDefault(); dragDepth.current = 0; setDragging(false); chat.addFiles(event.dataTransfer.files); }}>
   <header className="topbar"><div className="topbar-left"><button ref={navTrigger} className="icon-button nav-toggle" aria-label="Open conversations" aria-expanded={navOpen} aria-controls="conversation-navigation" onClick={() => setNavOpen(!navOpen)}><PanelLeft size={20}/></button><span className="mobile-brand">folio.</span><span className="page-title">{empty ? 'Research assistant' : chat.active.title}</span></div><span className="demo-label"><span/>Interactive demo</span></header>
   <div className={`scroll-region ${empty ? 'empty' : ''}`} ref={scroll} onScroll={() => { const node = scroll.current; if (node) { positions.current[chat.activeId] = node.scrollTop; follow.current = node.scrollHeight - node.scrollTop - node.clientHeight < 100; setAtBottom(follow.current); } }}>
    {empty ? <div className="welcome"><h1>What are you looking into?</h1><p className="welcome-intro">Ask a question. Bring your documents into the conversation.</p>{composer}<div className="suggestions"><p>A place to start</p>{chat.suggestions.map((suggestion, index) => <button key={suggestion} onClick={() => { chat.setDraft(suggestion); textarea.current?.focus(); }}><span className="suggestion-number">0{index + 1}</span><span>{suggestion}</span><ArrowUpRight size={17}/></button>)}</div><div className="file-guidance"><Paperclip size={14}/><span>Drop documents anywhere to add context.<br/><span>PDF, TXT, MD, PNG or JPG · Up to 5 files, 10 MB each</span></span></div></div> : <div className="reading-column" data-testid="messages">
    {chat.messages.map((message, index) => <article key={message.id} className={`message ${message.role}`}>
      <div className="message-author">{message.role === 'assistant' ? <FolioMark small/> : <span className="user-mark">Y</span>}<span>{message.role === 'assistant' ? 'Folio' : 'You'}</span>{message.status === 'streaming' && <span className="stream-label">{message.content ? 'Writing' : 'Researching'}<span className="writing-dot"/></span>}</div>
      {message.attachments && message.attachments.length > 0 && <div className="attachment-list sent-files">{message.attachments.map(file => <FileItem key={file.id} file={file}/>)}</div>}
      {message.role === 'assistant' && index === chat.messages.length - 1 && chat.tools.length > 0 && <details className="activity" open={message.status !== 'complete'} data-testid="tool-activity"><summary><span>{chat.busy ? <LoaderCircle className="spin" size={15}/> : message.status === 'complete' ? <Check size={15}/> : <Square size={13}/>} {chat.busy ? 'Working through your question' : message.status === 'complete' ? 'Research complete' : 'Work paused'}</span><ChevronDown size={15}/></summary><div className="tool-steps">{chat.tools.map(tool => <div key={tool.id} className={`tool-step ${tool.status}`}>{tool.status === 'complete' ? <Check size={13}/> : tool.status === 'running' && chat.busy ? <LoaderCircle className="spin" size={13}/> : <Circle size={11}/>}<span>{tool.label}</span><small>{tool.status}</small></div>)}</div></details>}
      {message.role === 'assistant' ? <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{ table: ({ children }) => <div className="table-scroll" tabIndex={0} role="region" aria-label="Response table"><table>{children}</table></div>, pre: ({ children }) => <pre tabIndex={0} aria-label="Code example">{children}</pre> }}>{message.content}</ReactMarkdown></div> : <p className="user-content">{message.content}</p>}
      {message.role === 'assistant' && <div className="response-actions">{message.content && <button className="copy-button" aria-label="Copy response" onClick={() => copy(message.id, message.content)}>{copied[message.id] === 'Copied' ? <Check size={14}/> : <Copy size={14}/>}<span aria-live="polite">{copied[message.id] || 'Copy response'}</span></button>}{message.status === 'stopped' && <span className="paused-label">Stopped · Your partial response is saved</span>}</div>}
    </article>)}
    {chat.error && <p role="alert" className="notice response-error">{chat.error}</p>}
    {chat.canRetry && <button className="retry-button" aria-label="Retry response" onClick={() => { follow.current = true; chat.retry(); }}><RotateCcw size={15}/>Retry response</button>}
    </div>}
    {empty && <div data-testid="messages"/>}
   </div>
   {!empty && <div className="bottom-composer">{!atBottom && <button className="latest-button" onClick={() => { follow.current = true; scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: 'instant' }); }}><ArrowDown size={14}/>Latest response</button>}{composer}</div>}
   <span className="sr-only" role="status">{chat.busy ? 'Folio is working on your response.' : chat.canRetry ? 'Response interrupted. You can retry.' : ''}</span>
   {dragging && <div className="drop-overlay"><Paperclip size={30}/><strong>Add a little context</strong><span>Drop your documents here</span></div>}
  </main>
 </div>;
}
