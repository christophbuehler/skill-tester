import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { snapshot, hash } from "../scripts/runner-lib.mjs";
const ids = fs
  .readdirSync("runs")
  .filter((id) => fs.existsSync(`runs/${id}/metadata.json`));
for (const id of ids)
  test(`${id}: immutable evidence and common mock`, () => {
    const dir = path.join("runs", id);
    const metadata = JSON.parse(
      fs.readFileSync(path.join(dir, "metadata.json"), "utf8"),
    );
    const observed = snapshot(dir);
    delete observed["metadata.json"];
    assert.equal(
      hash(JSON.stringify(observed)),
      metadata.sourceHash,
      "Generated evidence changed after import",
    );
    for (const file of ["chat.ts", "engine.ts"])
      assert.equal(
        fs.readFileSync(path.join(dir, "shared", file), "utf8"),
        fs.readFileSync(path.join("packages/mock-agent", file), "utf8"),
      );
    if (metadata.status === "passed") {
      assert.equal(metadata.skills.length, metadata.loadedSkills.length);
      assert.ok(
        metadata.validation.every((c: { passed: boolean }) => c.passed),
      );
    }
  });
test("all launch runs share prompt and starter", () => {
  const records = ids
    .map((id) =>
      JSON.parse(fs.readFileSync(`runs/${id}/metadata.json`, "utf8")),
    )
    .filter((r) => r.benchmark === "folio-v1");
  assert.ok(new Set(records.map((r) => r.promptHash)).size <= 1);
  assert.ok(new Set(records.map((r) => r.starterHash)).size <= 1);
});
