import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadContinuation} from '../scripts/continuation.mjs';
import {snapshot,hash} from '../scripts/runner-lib.mjs';
test('curated continuations require immutable imported parent and matching experiment',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'continuation-test-'));
 try {
  const dir=path.join(root,'runs','parent-1'); fs.mkdirSync(path.join(dir,'src'),{recursive:true});
  fs.writeFileSync(path.join(dir,'src','App.tsx'),'export default function App() { return null; }');
  const metadata={id:'parent-1',profile:'studio',benchmark:'test',status:'failed',sourceHash:hash(JSON.stringify(snapshot(dir)))};
  fs.writeFileSync(path.join(dir,'metadata.json'),JSON.stringify(metadata));
  assert.equal(loadContinuation(root,'parent-1','studio','test').metadata.status,'failed');
  assert.throws(()=>loadContinuation(root,'../parent-1','studio','test'),/Invalid parent/);
  assert.throws(()=>loadContinuation(root,'parent-1','other','test'),/same profile/);
  assert.throws(()=>loadContinuation(root,'parent-1','studio','other'),/same profile/);
  fs.appendFileSync(path.join(dir,'src','App.tsx'),'\n// changed');
  assert.throws(()=>loadContinuation(root,'parent-1','studio','test'),/evidence has changed/);
 } finally {fs.rmSync(root,{recursive:true,force:true});}
});
