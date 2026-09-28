import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react';
import { ArrowUp, Check, ChevronDown, Copy, FileText, History, LoaderCircle, Plus, Square, X, ArrowUpRight, RotateCcw, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat, formatBytes, type Attachment } from '../shared/chat';
import '@fontsource-variable/geist';

export default function App() {
 const chat = useChat();
 const reduced = useReducedMotion();
 const [history, setHistory] = useState(false);
 const [dragging, setDragging] = useState(false);
 const [copied, setCopied] = useState<Record<string,string>>({});
 const textarea = useRef<HTMLTextAreaElement>(null);
 const upload = useRef<HTMLInputElement>(null);
 const opener = useRef<HTMLButtonElement>(null);
 const panel = useRef<HTMLDivElement>(null);
 const scroller = useRef<HTMLDivElement>(null);
 const drafts = useRef<Record<string,string>>({});
 const offsets = useRef<Record<string,number>>({});
 const follow = useRef(true);
 const empty = chat.messages.length === 0;
 useLayoutEffect(() => { const el = textarea.current; if(el) { el.style.height = '0px'; el.style.height = `${Math.min(180, Math.max(empty ? 88 : 44,el.scrollHeight))}px`; } }, [chat.draft, empty]);
 useLayoutEffect(() => { if(scroller.current) scroller.current.scrollTop = offsets.current[chat.activeId] || 0; follow.current = true; }, [chat.activeId]);
 useLayoutEffect(() => { if(chat.busy && follow.current && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [chat.messages, chat.busy]);
 useEffect(() => { if(history) panel.current?.querySelector<HTMLButtonElement>('button')?.focus(); }, [history]);
 function closeHistory() { setHistory(false); opener.current?.focus(); }
 function navigate(id?: string) {
  drafts.current[chat.activeId] = chat.draft;
  offsets.current[chat.activeId] = scroller.current?.scrollTop || 0;
  if(id) { chat.selectChat(id); chat.setDraft(drafts.current[id] || ''); } else chat.newChat();
  closeHistory();
 }
 async function copy(id:string, content:string) {
  try { await navigator.clipboard.writeText(content); setCopied(p=>({...p,[id]:'Copied'})); }
  catch { setCopied(p=>({...p,[id]:'Copy failed'})); }
  window.setTimeout(()=>setCopied(p=>({...p,[id]:''})),2200);
 }
 function attachment(file:Attachment, pending = false) {
  return <motion.div layout layoutId={`file-${file.id}`} initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.95}} className="file-object" key={file.id}>
   <span className="file-icon"><FileText size={19}/></span><span className="file-info"><strong>{file.name}</strong><small>{formatBytes(file.size)}</small></span>
   {pending && <button type="button" className="remove-file" aria-label={`Remove ${file.name}`} onClick={()=>chat.removeFile(file.id)}><X size={15}/></button>}
  </motion.div>;
 }
 return <MotionConfig reducedMotion="user" transition={{type:'spring',stiffness:360,damping:36}}>
  <div className="app" data-testid="drop-zone" onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setDragging(false);}} onDrop={e=>{e.preventDefault();setDragging(false);chat.addFiles(e.dataTransfer.files);}}>
   <header className="topbar">
    <div className="brand">folio<span className="brand-dot">.</span></div>
    <nav className="nav-pill" aria-label="Workspace">
     <button ref={opener} className={history?'nav-history selected':'nav-history'} aria-label="Open conversations" aria-expanded={history} onClick={()=>history?closeHistory():setHistory(true)}><History size={19}/><span>Conversations</span><ChevronDown size={14}/></button>
     <span className="nav-divider"/><button className="icon-button" aria-label="Start a conversation" title="Start a conversation" onClick={()=>navigate()}><Plus size={21}/></button>
    </nav>
    <div className="workspace-label">Your research workspace</div>
   </header>
   <AnimatePresence>
    {history && <><motion.div className="scrim" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={closeHistory}/>
     <motion.div ref={panel} role="dialog" aria-modal="true" aria-label="Conversations" className="history-panel" initial={{opacity:0,y:"var(--history-enter-y)",scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:"var(--history-enter-y)",scale:.96}} onKeyDown={e=>{
      if(e.key==='Escape'){e.preventDefault();closeHistory();}
      if(e.key==='Tab'){const items=panel.current?.querySelectorAll<HTMLButtonElement>('button');if(items?.length){const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}
     }}>
      <div className="panel-heading"><h2>Conversations</h2><button className="icon-button" aria-label="Close conversations" onClick={closeHistory}><X size={18}/></button></div>
      <button className="new-conversation" aria-label="New chat" onClick={()=>navigate()}><Plus size={18}/> Start a conversation</button>
      <div className="panel-label">YOUR WORKSPACE</div>
      {chat.conversations.map(c=><button key={c.id} className={`conversation-option ${c.id===chat.activeId?'active':''}`} aria-label={c.title} onClick={()=>navigate(c.id)}><MessageSquare size={18}/><span>{c.title}</span>{c.id===chat.activeId&&<Check size={16}/>}</button>)}
     </motion.div></>}
   </AnimatePresence>
   <main className={`main ${empty?'is-empty':'is-working'}`}>
    {!empty && <div className="conversation-heading"><span>CONVERSATION</span><h1>{chat.active.title}</h1></div>}
    <div className="reading-scroll" ref={scroller} tabIndex={empty ? -1 : 0} aria-label="Reading area" onScroll={()=>{const el=scroller.current;if(el){follow.current=el.scrollHeight-el.scrollTop-el.clientHeight<100;offsets.current[chat.activeId]=el.scrollTop;}}}>
     {empty && <section className="welcome"><div className="eyebrow">YOUR RESEARCH WORKSPACE</div><h1>Space for your next question.</h1><p>Bring a document. Follow a thought.<br/>Let’s find what matters.</p></section>}
     <div data-testid="messages" className="reading-column messages" aria-label="Conversation messages" aria-busy={chat.busy}>
      {chat.messages.map((m,index)=><article key={m.id} className={`message ${m.role}`}>
       <div className="message-label">{m.role==='user'?'You':'Folio'}{m.role==='assistant'&&<span>Research assistant</span>}</div>
       {!!m.attachments?.length&&<div className="attachment-list">{m.attachments.map(f=>attachment(f))}</div>}
       {m.role==='assistant' && index===chat.messages.length-1 && chat.tools.length>0 && <div data-testid="tool-activity" className="tool-activity"><div className="activity-heading">{chat.busy?<LoaderCircle size={15} className="spin"/>:<Check size={15}/>}<span>{chat.busy?'Working through your question':m.status==='complete'?'Research complete':'Work paused'}</span></div><div className="tool-steps">{chat.tools.map((t,i)=><div key={t.id} className={`tool-step ${t.status}`}><span className="step-marker">{t.status==='complete'?<Check size={12}/>:<span>{i+1}</span>}</span><span>{t.label}</span></div>)}</div></div>}
       <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{pre: ({children}) => <pre tabIndex={0} aria-label="Code example">{children}</pre>, table: ({children}) => <div className="table-scroll" tabIndex={0} role="region" aria-label="Response table"><table>{children}</table></div>}}>{m.content}</ReactMarkdown></div>
       {m.role==='assistant'&&m.content&&m.status!=='streaming'&&<div className="response-actions"><button onClick={()=>copy(m.id,m.content)} aria-label="Copy response">{copied[m.id]==='Copied'?<Check size={15}/>:<Copy size={15}/>}<span aria-live="polite">{copied[m.id]||'Copy response'}</span></button>{m.status==='stopped'&&<span>Response stopped</span>}</div>}
      </article>)}
      {chat.error&&<div className="error" role="alert">{chat.error}</div>}
      {chat.canRetry&&<button className="retry" aria-label="Retry response" onClick={chat.retry}><RotateCcw size={16}/>Retry response</button>}
     </div>
    </div>
    <motion.div layout="position" transition={reduced?{duration:0}:undefined} className="composer-area">
     <motion.form layout className={`composer ${dragging?'dragging':''}`} onSubmit={e=>{e.preventDefault();if(!chat.busy)chat.send();}}>
      <AnimatePresence initial={false}>{chat.pending.length>0&&<motion.div layout className="attachment-list pending" data-testid="pending-attachments" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}><AnimatePresence initial={false}>{chat.pending.map(f=>attachment(f,true))}</AnimatePresence></motion.div>}</AnimatePresence>
      <motion.button layout="position" type="button" className="compact-attach" aria-label="Attach files" title="Attach files · up to 5 files, 10 MB each" onClick={()=>upload.current?.click()}><Plus size={21}/></motion.button>
      <motion.textarea layout="position" ref={textarea} aria-label="Message" placeholder={empty?'What would you like to understand?':'Ask a follow-up question…'} value={chat.draft} onChange={e=>chat.setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();if(!chat.busy)chat.send();}}}/>
      <motion.div layout="position" className="composer-controls">
       {chat.busy?<button type="button" className="send-button stop" aria-label="Stop response" onClick={chat.stop}><Square size={16} fill="currentColor"/></button>:<button type="submit" className="send-button" aria-label="Send message" disabled={!chat.draft.trim()&&!chat.pending.length}><ArrowUp size={22}/></button>}
      </motion.div>
      <input ref={upload} type="file" multiple accept=".txt,.md,.pdf,.png,.jpg,.jpeg" aria-label="Upload files" className="sr-only" onChange={e=>{if(e.target.files)chat.addFiles(e.target.files);e.target.value='';}}/>
     </motion.form>
     {chat.notice&&<div role="alert" className="notice">{chat.notice}</div>}
     {empty&&<div className="suggestions"><span>Or start here</span>{chat.suggestions.map(s=><button key={s} onClick={()=>{chat.setDraft(s);textarea.current?.focus();}}>{s}<ArrowUpRight size={14}/></button>)}</div>}
     <p className="privacy">Files stay in your browser. Responses are simulated.<span className="file-limits"> PDF, text & images · 10 MB each</span></p>
    </motion.div>
   </main>
   {dragging&&<div className="drop-overlay"><FileText size={32}/><strong>Bring your documents into the conversation</strong><span>Drop up to 5 files here</span></div>}
  </div>
 </MotionConfig>;
}
