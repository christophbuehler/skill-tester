import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const runs = fs
  .readdirSync("runs")
  .filter((id) => fs.existsSync(`runs/${id}/metadata.json`))
  .map((id) => JSON.parse(fs.readFileSync(`runs/${id}/metadata.json`, "utf8")));
const passed = runs.filter((r) => r.status === "passed");
test("gallery exposes every result and shared prompt", async ({ page }) => {
  await page.goto("/skill-tester/");
  await expect(page.locator("article.variant-card")).toHaveCount(runs.length);
  await page.getByRole("button", { name: "The brief", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Folio");
  await page.getByRole("button", { name: "Close dialog" }).click();
});
test("comparison URL, viewports, isolation, scenarios and reset", async ({
  page,
}) => {
  test.skip(passed.length < 2, "Need two passing runs");
  await page.goto("/skill-tester/");
  await page.getByRole("button", { name: "Compare side by side" }).click();
  await expect(page).toHaveURL(/#compare\?left=/);
  await expect(page.locator("iframe")).toHaveCount(2);
  await page.getByRole("button", { name: "Mobile", exact: true }).click();
  await expect(page.locator("iframe").first()).toHaveCSS("width", "390px");
  await page.getByLabel("Scenario", { exact: true }).selectOption("welcome");
  const left = page.frameLocator("iframe").nth(0),
    right = page.frameLocator("iframe").nth(1);
  await left
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Only on left");
  await expect(
    right.getByRole("textbox", { name: "Message", exact: true }),
  ).toHaveValue("");
  await page.getByRole("button", { name: "Reset both" }).click();
  await expect(
    left.getByRole("textbox", { name: "Message", exact: true }),
  ).toHaveValue("");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Mobile", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("mobile gallery fits viewport and local assets load", async ({ page }) => {
  const failed: string[] = [];
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(r.url());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/skill-tester/");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForLoadState("networkidle");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(failed).toEqual([]);
});

test("gallery and run dialog have no automated accessibility violations", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.goto("/skill-tester/");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Run details" }).first().click();
  expect(
    (await new AxeBuilder({ page }).include('[role="dialog"]').analyze())
      .violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test('versioned briefs and comparisons preserve benchmark provenance',async({page})=>{
 await page.goto('/skill-tester/');
 await page.getByRole('button',{name:'The brief',exact:true}).click();
 const dialog=page.getByRole('dialog');
 await expect(dialog).toContainText('folio-v1');
 await expect(dialog).toContainText('folio-v2');
 await expect(dialog).toContainText('folio-v3');
 const v1=passed.find(r=>r.benchmark==='folio-v1');
 const v2=passed.find(r=>r.benchmark==='folio-v2');
 if(v1 && v2) {
  await page.goto(`/skill-tester/#compare?left=${v1.id}&right=${v2.id}`);
  await expect(page.getByText('These runs use different inputs or settings. Check run details before comparing.')).toBeVisible();
 }
});

test('v3 recordings download from the Pages base path and decode', async ({page, context}, info) => {
  const run = passed.find(r => r.benchmark === 'folio-v3');
  test.skip(!run, 'Need a completed v3 run');
  await page.goto(`/skill-tester/#compare?left=${run.id}&right=${run.id}`);
  await page.getByRole('button', {name: 'Details', exact: true}).first().click();
  const links = page.getByRole('dialog').locator('a[download][href$=".mp4"]');
  await expect(links).toHaveCount(6);
  await expect(page.getByRole('dialog').locator('video')).toHaveCount(0);
  const player = await context.newPage();
  await player.goto('/skill-tester/');
  for (const [index, link] of (await links.all()).entries()) {
    const href = await link.getAttribute('href');
    const source = new URL(href!, page.url()).href;
    const response = await page.request.get(source);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('video/mp4');
    const downloaded = info.outputPath(`recording-${index}.mp4`);
    fs.writeFileSync(downloaded, await response.body());
    execFileSync('ffmpeg', ['-v', 'error', '-i', downloaded, '-f', 'null', '-'], {stdio:'pipe'});
    // Decode the downloadable file in a separate test player. The gallery itself
    // avoids native video controls because some embedded browsers crash on play.
    await player.setContent('<video muted playsinline></video>');
    const video = player.locator('video');
    const supportsMP4 = await video.evaluate((element: HTMLVideoElement) => !!element.canPlayType('video/mp4; codecs="avc1.4D401F"'));
    const original = await page.getByRole('dialog').locator('a[download][href$=".webm"]').nth(index).getAttribute('href');
    const browserSource = supportsMP4 ? source : new URL(original!, page.url()).href;
    await video.evaluate((element: HTMLVideoElement, url) => { element.src = url; }, browserSource);
    await video.evaluate(async (element: HTMLVideoElement) => {
      element.muted = true;
      element.load();
      await element.play();
    });
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => ({
      ready: element.readyState >= 2 && element.currentTime > 0.15 && element.videoWidth > 0,
      error: element.error?.message ?? null,
    }))).toEqual({ready: true, error: null});
    await video.evaluate((element: HTMLVideoElement) => element.pause());
  }
  await player.close();
});

test('failed runs retain their outcome and review evidence', async ({page}) => {
  const run = runs.find(r => r.status === 'failed');
  test.skip(!run, 'No failed runs in this catalog');
  await page.goto('/skill-tester/');
  const card = page.locator('article.variant-card').filter({
    has: page.getByRole('heading', {name: run.label, exact: true}),
  });
  await expect(card.getByText('Generation did not pass')).toBeVisible();
  await expect(card.getByRole('checkbox')).toBeDisabled();
  await card.getByRole('button', {name: 'Run details'}).click();
  await expect(page.getByRole('dialog')).toContainText(run.id);
  await expect(page.getByRole('dialog')).toContainText('failed;');
  const recordingCount = Object.values(run.browserReview ?? {}).reduce((sum: number, phase: any) => sum + (phase.recordings?.length ?? 0), 0);
  await expect(page.getByRole('dialog').locator('a[download][href$=".mp4"]')).toHaveCount(recordingCount);
});

test('variant chooser lists every activated skill and preserves comparison state', async ({page}) => {
  test.skip(passed.length < 2, 'Need two passing runs');
  await page.goto(`/skill-tester/#compare?left=${passed[0].id}&right=${passed[1].id}&viewport=mobile&scenario=welcome`);
  const trigger = page.getByRole('button', {name: /^Left variant:/});
  await trigger.click();
  const list = page.getByRole('listbox', {name: 'Left variant', exact: true});
  await expect(list.getByRole('option')).toHaveCount(passed.length);
  for (const run of passed) {
    const option = list.getByRole('option').filter({has: page.getByText(run.id, {exact: true})});
    await expect(option).toContainText(run.benchmark);
    await expect(option).toContainText('Passed');
    for (const skill of run.skills) await expect(option.locator(".chooser-skills").getByText(skill.name, {exact: true})).toBeVisible();
    if (!run.skills.length) await expect(option).toContainText('Baseline · No design skills activated');
  }
  for (const run of runs.filter(r => r.status !== 'passed')) await expect(list.getByText(run.id, {exact: true})).toHaveCount(0);
  const choice = passed.find(r => r.skills.length > 1 && r.id !== passed[0].id) ?? passed[1];
  await list.getByRole('option').filter({has: page.getByText(choice.id, {exact: true})}).click();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('left')).toBe(choice.id);
  await expect(page).toHaveURL(/viewport=mobile&scenario=welcome/);
  for (const skill of choice.skills) await expect(trigger.locator(".chooser-skills").getByText(skill.name, {exact: true})).toBeVisible();
  await expect(page.locator('iframe').first()).toHaveAttribute('src', new RegExp(`${choice.id}/\\?scenario=welcome`));
  await page.reload();
  await expect(trigger).toContainText(choice.label);
});

test('variant chooser supports keyboard, dismissal, and accessible light presentation', async ({page}) => {
  await page.goto('/skill-tester/#compare');
  const trigger = page.getByRole('button', {name: /^Left variant:/});
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  const list = page.getByRole('listbox', {name: 'Left variant', exact: true});
  await expect(list.getByRole('option', {selected: true})).toBeFocused();
  await page.keyboard.press('End');
  await expect(list.getByRole('option').last()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(list.getByRole('option').first()).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(list.getByRole('option').last()).toBeFocused();
  await page.keyboard.press('Home');
  await expect(list.getByRole('option').first()).toBeFocused();
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  expect((await new AxeBuilder({page}).include('.variant-chooser').analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(list).toHaveCount(0);
  await trigger.click();
  await page.keyboard.press('End');
  const selectedLabel = await list.getByRole('option').last().locator('strong').innerText();
  await page.keyboard.press('Enter');
  await expect(trigger).toContainText(selectedLabel);
  await trigger.click();
  await page.keyboard.press('Tab');
  await expect(list).toHaveCount(0);
  await trigger.click();
  await page.getByRole('heading', {name: 'See the difference.'}).click();
  await expect(list).toHaveCount(0);
  await page.emulateMedia({colorScheme: 'dark'});
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
  await page.setViewportSize({width: 390, height: 844});
  await trigger.click();
  await expect(list).toBeVisible();
  const menuBounds = await page.locator(".chooser-popover").boundingBox();
  expect(menuBounds!.y + menuBounds!.height).toBeLessThanOrEqual(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('combined and single-skill headers keep desktop canvases aligned', async ({ page }) => {
  const combined = runs.find(run => run.status === 'passed' && run.skills.length > 1);
  const single = runs.find(run => run.status === 'passed' && run.skills.length === 1);
  test.skip(!combined || !single, 'No committed combination yet');
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`/skill-tester/#compare?left=${combined!.id}&right=${single!.id}&viewport=desktop&scenario=welcome`);
  const viewports = page.locator('.viewport-container');
  await expect(viewports).toHaveCount(2);
  const first = await viewports.nth(0).boundingBox();
  const second = await viewports.nth(1).boundingBox();
  expect(Math.abs(first!.y-second!.y)).toBeLessThan(1);
});

test('curation notes distinguish a stopped design from failed functional checks', async ({ page }) => {
  const assessments = JSON.parse(fs.readFileSync('reviews/assessments.json','utf8'));
  const id = Object.keys(assessments)[0];
  const run = runs.find(r=>r.id === id);
  test.skip(!run, 'Curated attempt not imported');
  await page.goto('/skill-tester/');
  const card = page.locator('article.variant-card').filter({has: page.getByRole('heading',{name:run.label,exact:true})});
  await expect(card.getByText(assessments[id].label,{exact:true})).toBeVisible();
  await expect(card.getByRole('checkbox')).toBeDisabled();
  await card.getByRole('button',{name:'Run details'}).click();
  await expect(page.getByRole('dialog')).toContainText(assessments[id].reason);
  await expect(page.getByRole('dialog')).toContainText(run.failure);
});

test('curated follow-up exposes its parent and additional review instructions',async({page})=>{
 const run=runs.find(r=>r.mode==='curated-followup');
 test.skip(!run,'No curated follow-up imported');
 await page.goto('/skill-tester/');
 const card=page.locator('article.variant-card').filter({has:page.getByRole('heading',{name:run.label,exact:true})});
 await card.getByRole('button',{name:'Run details'}).click();
 await expect(page.getByRole('dialog')).toContainText('Curated follow-up (extra review, not a fresh benchmark run)');
 await expect(page.getByRole('dialog')).toContainText(run.parentRunId);
 await expect(page.getByRole('dialog')).toContainText('Outer page scrolling is broken.');
});
