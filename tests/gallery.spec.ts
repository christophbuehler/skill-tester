import { test, expect } from "@playwright/test";
import fs from "node:fs";
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
