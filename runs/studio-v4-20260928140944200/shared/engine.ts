export type Scenario = 'welcome' | 'research' | 'files' | 'error';
export type Attachment = { id: string; name: string; size: number; type: string };
export type Message = { id: string; role: 'user' | 'assistant'; content: string; attachments?: Attachment[]; status?: 'streaming' | 'complete' | 'stopped' | 'error' };
export type Conversation = { id: string; title: string; messages: Message[] };
export type ToolStep = { id: string; label: string; status: 'pending' | 'running' | 'complete' };
export const suggestions = ['Summarize the launch brief', 'Compare our research findings', 'Draft a project update'];
export const response = `## A clearer path to launch\n\nThe research points to **three priorities** for the Folio launch:\n\n- Make the first conversation useful within a minute.\n- Keep document context visible and easy to verify.\n- Show progress while the assistant works.\n\n| Priority | Next step | Owner |\n| --- | --- | --- |\n| Onboarding | Test the welcome flow | Maya |\n| Documents | Validate attachment states | Alex |\n| Trust | Review tool activity labels | Sam |\n\n### A small implementation example\n\n\`\`\`typescript\nconst priorities = ["clarity", "context", "trust"];\nconsole.log(priorities.join(", "));\n\`\`\`\n\n**Recommendation:** start with the document workflow, then validate it with five research participants.\n\n_This is a simulated response using the shared benchmark fixture._`;
export function initialConversations(scenario: Scenario): Conversation[] {
 const research: Conversation = { id: 'research', title: 'Launch research', messages: [{ id: 'r1', role: 'user', content: 'What should we prioritize for the launch?' }, { id: 'r2', role: 'assistant', content: response, status: 'complete' }] };
 const files: Conversation = { id: 'files', title: 'Document review', messages: [{id:'f1',role:'user',content:'Summarize this launch brief.',attachments:[{id:'fixture',name:'launch-brief.pdf',size:245760,type:'application/pdf'}]}, {id:'f2',role:'assistant',content:'The brief outlines a **document-first research assistant**. The key milestones are discovery, prototype testing, and a small pilot.\n\nWould you like a project update or a comparison of the findings?',status:'complete'}] };
 const welcome: Conversation = { id:'welcome', title:'New conversation', messages:[] };
 const error: Conversation = { id:'error', title:'Connection check', messages:[] };
 return [scenario === 'error' ? error : welcome, research, files];
}
export const toolFixture = (): ToolStep[] => [{id:'documents',label:'Review documents',status:'running'},{id:'research',label:'Compare findings',status:'pending'},{id:'compose',label:'Prepare response',status:'pending'}];
export function validateFiles(files: Pick<File,'name'|'size'|'type'>[], count: number) {
 const accepted: Pick<File,'name'|'size'|'type'>[] = []; const errors: string[] = [];
 for (const file of files) {
  if (!/\.(txt|md|pdf|png|jpe?g)$/i.test(file.name)) { errors.push(`${file.name}: unsupported file type.`); continue; }
  if (file.size > 10 * 1024 * 1024) { errors.push(`${file.name}: maximum size is 10 MB.`); continue; }
  if (count + accepted.length >= 5) { errors.push('A maximum of 5 attachments is allowed.'); continue; }
  accepted.push(file);
 }
 return {accepted, errors};
}
export function formatBytes(size: number) { return size < 1024 ? `${size} B` : size < 1048576 ? `${Math.round(size/1024)} KB` : `${(size/1048576).toFixed(1)} MB`; }
export function streamMock(onChunk: (text: string) => void, onTools: (tools: ToolStep[]) => void, onDone: () => void, onError: () => void, fail = false, interval = 55) {
 let tick = 0; let stopped = false;
 onTools(toolFixture());
 const timer = setInterval(() => {
  if (stopped) return;
  tick++;
  onTools(toolFixture().map((t,i) => ({...t,status: tick > (i+1)*4 ? 'complete' : tick > i*4 ? 'running' : 'pending'})));
  if (fail && tick === 8) { clearInterval(timer); onError(); return; }
  if (tick > 5) onChunk(response.slice(0,(tick-5)*22));
  if ((tick-5)*22 >= response.length) { clearInterval(timer); onDone(); }
 }, interval);
 return () => { stopped = true; clearInterval(timer); };
}
