import { test, expect } from "@playwright/test";
import fs from "node:fs";
const isolated = process.env.BENCHMARK_ISOLATED === "1";
const ids = isolated ? ["isolated"] : fs
  .readdirSync("runs")
  .filter(
    (id) =>
      fs.existsSync(`runs/${id}/metadata.json`) &&
      JSON.parse(fs.readFileSync(`runs/${id}/metadata.json`, "utf8")).status ===
        "passed",
  );
for (const id of ids)
  test(`${id}: drag and drop, keyboard composer, local-only requests`, async ({
    page,
  }) => {
    const external: string[] = [];
    page.on("request", (r) => {
      if (
        !r.url().startsWith(isolated ? "http://127.0.0.1:4183/" : "http://127.0.0.1:4173/") &&
        !r.url().startsWith("data:")
      )
        external.push(r.url());
    });
    await page.goto(isolated ? "/" : `/skill-tester/variants/${id}/`);
    const dt = await page.evaluateHandle(() => {
      const data = new DataTransfer();
      data.items.add(
        new File(["Research fixture"], "drop-notes.txt", {
          type: "text/plain",
        }),
      );
      return data;
    });
    await page
      .getByTestId("drop-zone")
      .dispatchEvent("drop", { dataTransfer: dt });
    await expect(page.getByTestId("pending-attachments")).toContainText(
      "drop-notes.txt",
    );
    const message = page.getByRole("textbox", { name: "Message", exact: true });
    await message.fill("Line one");
    await message.press("Shift+Enter");
    await message.press("L");
    await expect(message).toHaveValue("Line one\nL");
    await message.press("Enter");
    await expect(page.getByTestId("messages")).toContainText("drop-notes.txt");
    await expect(message).toHaveValue("");
    await expect(page.getByTestId("messages").locator("table")).toBeVisible();
    expect(external).toEqual([]);
  });
