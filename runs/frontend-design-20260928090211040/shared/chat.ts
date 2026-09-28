import { useEffect, useRef, useState } from 'react';
import { initialConversations, streamMock, validateFiles, suggestions, type Scenario, type Conversation, type Attachment, type ToolStep } from './engine';
export * from './engine';
const scenarios = ['welcome','research','files','error'];
export function parseScenario(value: string | null): Scenario { return scenarios.includes(value || '') ? value as Scenario : 'welcome'; }
export function useChat() {
 const initial = parseScenario(new URLSearchParams(location.search).get('scenario'));
 const [conversations,setConversations] = useState<Conversation[]>(() => initialConversations(initial));
 const [activeId,setActiveId] = useState(initial === 'research' || initial === 'files' ? initial : initial === 'error' ? 'error' : 'welcome');
 const [draft,setDraft] = useState(''); const [pending,setPending] = useState<Attachment[]>([]); const [notice,setNotice] = useState('');
 const [busy,setBusy] = useState(false); const [tools,setTools] = useState<ToolStep[]>([]); const [error,setError] = useState('');
 const cancel = useRef<null | (()=>void)>(null); const running = useRef(false); const sequence = useRef(0); const failNext = useRef(initial === 'error');
 const id = () => `m${++sequence.current}`;
 const active = conversations.find(c=>c.id===activeId)!;
 const last = active.messages.at(-1);
 const canRetry = !busy && !!last && ['error','stopped'].includes(last.status || '');
 function finishStream() { cancel.current?.(); cancel.current=null; running.current=false; setBusy(false); }
 function stop() { finishStream(); setConversations(cs=>cs.map(c=>({...c,messages:c.messages.map(m=>m.status==='streaming'?{...m,status:'stopped'}:m)}))); }
 function reset(scenario: Scenario = 'welcome') {
  finishStream(); setConversations(initialConversations(scenario)); setActiveId(scenario === 'research' || scenario === 'files' ? scenario : scenario === 'error' ? 'error' : 'welcome');
  setDraft(''); setPending([]); setNotice(''); setTools([]); setError(''); failNext.current=scenario==='error';
 }
 useEffect(()=> {
  const receive = (event: MessageEvent) => {
   if(event.origin!==location.origin || event.source!==window.parent || event.data?.type!=='skill-tester:reset') return;
   reset(parseScenario(event.data.scenario));
  };
  window.addEventListener('message',receive);
  return ()=>{window.removeEventListener('message',receive);cancel.current?.();};
 },[]);
 function selectChat(cid: string) { if(!conversations.some(c=>c.id===cid)) return; stop();setActiveId(cid);setPending([]);setDraft('');setNotice('');setTools([]);setError(''); }
 function newChat() { stop();const cid=id();setConversations(cs=>[{id:cid,title:'New conversation',messages:[]},...cs]);setActiveId(cid);setDraft('');setPending([]);setNotice('');setTools([]);setError(''); }
 function begin(assistantId: string) {
  running.current=true;setBusy(true);setError('');setNotice(''); const cid=activeId; const fail=failNext.current;failNext.current=false;
  cancel.current=streamMock(
   content=>setConversations(cs=>cs.map(c=>c.id!==cid?c:{...c,messages:c.messages.map(m=>m.id===assistantId?{...m,content}:m)})),
   setTools,
   ()=>{finishStream();setConversations(cs=>cs.map(c=>c.id!==cid?c:{...c,messages:c.messages.map(m=>m.id===assistantId?{...m,status:'complete'}:m)}));},
   ()=>{finishStream();setError('The simulated connection was interrupted. Retry to continue.');setConversations(cs=>cs.map(c=>c.id!==cid?c:{...c,messages:c.messages.map(m=>m.id===assistantId?{...m,status:'error'}:m)}));},fail);
 }
 function send() {
  if(running.current || (!draft.trim() && !pending.length)) return;
  const text=draft.trim() || 'Please review the attached files.';const aid=id(); const uid=id();
  setConversations(cs=>cs.map(c=>c.id!==activeId?c:{...c,title:c.messages.length?c.title:text.slice(0,32),messages:[...c.messages,{id:uid,role:'user',content:text,attachments:pending},{id:aid,role:'assistant',content:'',status:'streaming'}]}));
  setDraft('');setPending([]);begin(aid);
 }
 function retry() { if(!canRetry || running.current || !last) return;setConversations(cs=>cs.map(c=>c.id!==activeId?c:{...c,messages:c.messages.map(m=>m.id===last.id?{...m,content:'',status:'streaming'}:m)}));begin(last.id); }
 function addFiles(files: FileList | File[]) {
  const result=validateFiles(Array.from(files),pending.length);
  setPending(ps=>[...ps,...result.accepted.map(f=>({id:id(),name:f.name,size:f.size,type:f.type}))]);setNotice(result.errors.join(' '));
 }
 return {conversations,activeId,active,messages:active.messages,draft,setDraft,pending,notice,busy,tools,error,canRetry,send,stop,retry,newChat,selectChat,addFiles,removeFile:(fid:string)=>setPending(ps=>ps.filter(f=>f.id!==fid)),reset,suggestions};
}
