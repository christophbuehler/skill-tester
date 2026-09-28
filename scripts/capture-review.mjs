import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';
import {pathToFileURL} from 'node:url';

// Host-side capture: fixed fixtures only, no model-selected URLs or commands.
export async function captureReview(work, output) {
 fs.mkdirSync(output,{recursive:true});
 const server=spawn('pnpm',['exec','vite','preview','--host','127.0.0.1','--port','4184','--strictPort'],{cwd:work,stdio:'ignore',detached:true});
 let browser;
 try {
  for(let i=0;i<100;i++) {
   if(server.exitCode!==null) throw Error('Review preview exited; port 4184 must be free.');
   try {if((await fetch('http://127.0.0.1:4184/')).ok) break;} catch {}
   if(i===99) throw Error('Review preview did not start.');
   await new Promise(r=>setTimeout(r,100));
  }
  browser=await chromium.launch();
  const context=await browser.newContext();
  await context.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:4184/') ? route.continue() : route.abort());
  const page=await context.newPage();
  const report={captures:[],observations:[],runtimeErrors:[],motion:'Static captures and reduced-motion state check; motion quality requires interactive human review.'};
  page.on('pageerror',e=>report.runtimeErrors.push(e.message));
  async function shot(name) {
   await page.screenshot({path:path.join(output,name+'.png'),fullPage:true});
   report.captures.push(name+'.png');
   report.observations.push({state:name,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)});
  }
  for(const [name,width,height] of [['desktop',1440,1000],['intermediate',900,900],['mobile',390,844]]) {
   await page.setViewportSize({width,height});
   await page.goto('http://127.0.0.1:4184/?scenario=welcome');
   await page.getByRole('textbox',{name:'Message',exact:true}).waitFor();
   await shot(`${name}-welcome`);
   await page.goto('http://127.0.0.1:4184/?scenario=research');
   await page.getByTestId('messages').getByText('A clearer path',{exact:false}).first().waitFor();
   await shot(`${name}-research`);
  }
  await page.goto('http://127.0.0.1:4184/?scenario=welcome');
  await page.getByLabel('Upload files',{exact:true}).setInputFiles({name:'research-notes.txt',mimeType:'text/plain',buffer:Buffer.from('Local fixture')});
  await shot('mobile-attachment');
  await page.getByRole('textbox',{name:'Message',exact:true}).fill('Summarize the launch brief');
  await page.getByRole('button',{name:'Send message',exact:true}).click();
  await page.getByTestId('tool-activity').waitFor();
  await shot('mobile-activity');
  await page.getByRole('button',{name:'Stop response',exact:true}).click();
  await page.getByRole('button',{name:'Retry response',exact:true}).waitFor();
  report.observations.push({state:'cancellation',retryVisible:true});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload();
  await page.getByRole('textbox',{name:'Message',exact:true}).waitFor();
  report.observations.push({state:'reduced-motion',composerVisible:true});
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  return report;
 } finally {
  await browser?.close();
  try {process.kill(-server.pid,'SIGTERM');} catch {}
 }
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
 await captureReview(path.resolve(process.argv[2]),path.resolve(process.argv[3]));
}
