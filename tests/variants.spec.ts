import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
const isolated = process.env.BENCHMARK_ISOLATED==='1';
const runs: {id:string}[] = isolated ? [{id:'isolated'}] : fs.readdirSync('runs').filter(id=>fs.existsSync(`runs/${id}/metadata.json`) && JSON.parse(fs.readFileSync(`runs/${id}/metadata.json`,'utf8')).status==='passed').map(id=>({id}));
for(const run of runs) {
 const route=isolated ? '/' : `/skill-tester/variants/${run.id}/`;
 test(`${run.id}: chat, streaming, stop, retry, switch`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(route);await page.getByRole('textbox',{name:'Message',exact:true}).fill('Summarize the launch brief');await page.getByRole('button',{name:'Send message',exact:true}).click();
  await expect(page.getByTestId('tool-activity')).toContainText('Review documents');
  await expect(page.getByTestId('messages')).toContainText('A clearer path');
  await page.getByRole('button',{name:'Stop response',exact:true}).click();await page.getByRole('button',{name:'Retry response',exact:true}).click();
  await expect(page.getByTestId('messages').locator('table')).toBeVisible();await expect(page.getByRole('button',{name:'Stop response',exact:true})).toHaveCount(0);
  await expect(page.getByTestId('messages').locator('pre')).toBeVisible();
  await page.getByRole('button',{name:'Document review',exact:true}).click();await expect(page.getByTestId('messages')).toContainText('launch-brief.pdf');
  await page.getByRole('button',{name:'New chat',exact:true}).click();await expect(page.getByTestId('messages')).not.toContainText('launch-brief.pdf');expect(errors).toEqual([]);
 });
 test(`${run.id}: attachments, invalid files, send`,async({page})=>{
  await page.goto(route);await page.getByLabel('Upload files',{exact:true}).setInputFiles({name:'notes.txt',mimeType:'text/plain',buffer:Buffer.from('Research notes')});
  await expect(page.getByTestId('pending-attachments')).toContainText('notes.txt');await page.getByRole('button',{name:'Remove notes.txt',exact:true}).click();
  await expect(page.getByTestId('pending-attachments')).not.toContainText('notes.txt');
  await page.getByLabel('Upload files',{exact:true}).setInputFiles({name:'bad.exe',mimeType:'application/octet-stream',buffer:Buffer.from('x')});await expect(page.getByRole('alert')).toContainText('unsupported');
  await page.getByLabel('Upload files',{exact:true}).setInputFiles({name:'brief.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF fixture')});await page.getByRole('button',{name:'Send message',exact:true}).click();await expect(page.getByTestId('messages')).toContainText('brief.pdf');
 });
 test(`${run.id}: deterministic error recovery`,async({page})=>{
  await page.goto(`${route}?scenario=error`);await page.getByRole('textbox',{name:'Message',exact:true}).fill('Hello');await page.getByRole('button',{name:'Send message',exact:true}).click();await expect(page.getByRole('alert')).toContainText('interrupted');await page.getByRole('button',{name:'Retry response',exact:true}).click();await expect(page.getByTestId('messages').locator('table')).toBeVisible();
 });
 test(`${run.id}: responsive screenshots and accessibility report`,async({page},info)=>{
  for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]] as const) {
   await page.setViewportSize({width,height});await page.goto(`${route}?scenario=research`);await expect(page.getByTestId('messages')).toContainText('A clearer path');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
   await page.screenshot({path:info.outputPath(`${name}.png`),fullPage:true});
   if(process.env.CAPTURE_DIR) {fs.mkdirSync(path.join(process.env.CAPTURE_DIR,run.id),{recursive:true});await page.screenshot({path:path.join(process.env.CAPTURE_DIR,run.id,`${name}.png`),fullPage:true});}
   const a11y=await new AxeBuilder({page}).analyze();await info.attach(`${name}-accessibility`,{body:JSON.stringify(a11y.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.length})),null,2),contentType:'application/json'});
   await page.keyboard.press('Tab');expect(await page.evaluate(()=>document.activeElement!==document.body)).toBe(true);
   if(name==='mobile') {const open=page.getByRole('button',{name:'Open conversations',exact:true});if(await open.isVisible())await open.click();await page.getByRole('button',{name:'Document review',exact:true}).click();await expect(page.getByTestId('messages')).toContainText('launch-brief.pdf');}
  }
 });
}
