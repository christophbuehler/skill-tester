import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialConversations, validateFiles, streamMock, response } from '../packages/mock-agent/engine.ts';
test('fixtures are fresh, contain documents and Markdown',()=> {const a=initialConversations('research');a[0].messages.push({id:'x',role:'user',content:'x'});assert.equal(initialConversations('research')[0].messages.length,0);assert.match(response,/```typescript/);assert.equal(a[2].messages[0].attachments?.[0].name,'launch-brief.pdf');});
test('file constraints preserve valid files and reject unsupported, oversized, and excess files',()=> {const f=(name:string,size=4)=>({name,size,type:'text/plain'});const r=validateFiles([f('good.txt'),f('bad.exe'),f('large.pdf',11*1024*1024),f('extra.md')],4);assert.deepEqual(r.accepted.map(f=>f.name),['good.txt']);assert.equal(r.errors.length,3);});
test('stream completes with exact fixture',async()=> {let output='';await new Promise<void>(resolve=>streamMock(t=>output=t,()=>{},resolve,()=>assert.fail('unexpected error'),false,1));assert.equal(output,response);});
test('cancellation halts callbacks',async()=>{let calls=0;const stop=streamMock(()=>calls++,()=>{},()=>assert.fail('completed'),()=>{},false,1);await new Promise(r=>setTimeout(r,12));stop();const atStop=calls;await new Promise(r=>setTimeout(r,20));assert.equal(calls,atStop);});
test('failure calls error instead of completion',async()=>{await new Promise<void>(resolve=>streamMock(()=>{},()=>{},()=>assert.fail('completed'),resolve,true,1));});
