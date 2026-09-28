import fs from 'node:fs';
import path from 'node:path';
import {hash, snapshot} from './runner-lib.mjs';
export function loadContinuation(root, id, profile, benchmark) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw Error('Invalid parent run ID.');
  const dir=path.join(root,'runs',id);
  const metadata=JSON.parse(fs.readFileSync(path.join(dir,'metadata.json'),'utf8'));
  if (metadata.id!==id || metadata.profile!==profile || metadata.benchmark!==benchmark || !['passed','failed'].includes(metadata.status)) throw Error('Continuation requires an imported parent with the same profile and benchmark.');
  const contents=snapshot(dir); delete contents['metadata.json'];
  if(hash(JSON.stringify(contents))!==metadata.sourceHash) throw Error('Parent evidence has changed.');
  return {dir, metadata};
}
