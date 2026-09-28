import path from 'node:path';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

export async function recordInteractions(browser, output, name, viewport) {
 const context=await browser.newContext({viewport,recordVideo:{dir:output,size:viewport}});
 await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4184/')?r.continue():r.abort());
 const page=await context.newPage();
 const events=[];
 let started;
 const note=label=>events.push({label,ms:Date.now()-started});
 try {
  await page.goto('http://127.0.0.1:4184/?scenario=welcome');
  await page.getByRole('textbox',{name:'Message',exact:true}).waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(700);
  started=Date.now();
  const open=page.getByRole('button',{name:'Open conversations',exact:true});
  if(await open.isVisible()) {
   note('Open history'); await open.click(); await page.waitForTimeout(700);
   note('Dismiss history with Escape'); await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  } else {note('Conversation navigation already exposed');}
  const upload=page.getByLabel('Upload files',{exact:true});
  note('Add local document');
  await upload.setInputFiles({name:'research-notes.txt',mimeType:'text/plain',buffer:Buffer.from('Local fixture')});
  await page.waitForTimeout(600);
  note('Remove document');
  await page.getByRole('button',{name:'Remove research-notes.txt',exact:true}).click();
  await page.waitForTimeout(600);
  await page.getByRole('textbox',{name:'Message',exact:true}).fill('Summarize the launch brief');
  note('Send first message');await page.getByRole('button',{name:'Send message',exact:true}).click();
  await page.getByRole('button',{name:'Stop response',exact:true}).waitFor();
  await page.waitForTimeout(400);
  note('Stop');await page.getByRole('button',{name:'Stop response',exact:true}).click();
  await page.getByRole('button',{name:'Retry response',exact:true}).waitFor();
  await page.waitForTimeout(450);
  note('Retry');await page.getByRole('button',{name:'Retry response',exact:true}).click();
  await page.getByRole('button',{name:'Stop response',exact:true}).waitFor({state:'hidden'});
  await page.waitForTimeout(700);
  note('Completed');
 } finally {await context.close();}
 const video=path.join(output,`interaction-${name}.webm`);
 await page.video().saveAs(video);
 const raw=await page.video().path();
 if(raw!==video) fs.rmSync(raw,{force:true});
 const sheet=`interaction-${name}.png`;
 // Sample the full recording uniformly into a compact chronological contact sheet.
 const duration=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',video],{encoding:'utf8'}).trim());
 execFileSync('ffmpeg',['-v','error','-y','-i',video,'-vf',`fps=${16/Math.max(duration,1)},scale=360:-1,tile=4x4:padding=4:margin=4:color=white`,'-frames:v','1',path.join(output,sheet)]);
 return {video:path.basename(video),sheet,events,durationSeconds:duration,notes:'Contact sheet reads left-to-right, top-to-bottom across the complete recording. Event offsets start after initial page/font settling. Video starts before navigation settles. Frames describe sampled states, not an aesthetic score.'};
}
