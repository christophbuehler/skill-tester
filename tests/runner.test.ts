import { test } from "node:test";
import assert from "node:assert/strict";
import {
  protectedChanges,
  extractSkills,
  safeRunDir,
} from "../scripts/runner-lib.mjs";
test("only presentation and design notes may change", () => {
  assert.deepEqual(
    protectedChanges(
      { "shared/chat.ts": "a", "src/main.tsx": "a", "src/App.tsx": "a" },
      {
        "shared/chat.ts": "b",
        "src/main.tsx": "b",
        "src/App.tsx": "b",
        "src/styles.css": "c",
      },
    ),
    ["shared/chat.ts", "src/main.tsx"],
  );
});
test("skill catalog aliases resolve", () => {
  assert.deepEqual(
    extractSkills("- `r0` = `/tmp/skills`\n- example (file: r0/foo/SKILL.md)"),
    ["/tmp/skills/foo/SKILL.md"],
  );
});
test("run identifiers cannot escape output folder or overwrite", () => {
  assert.throws(() => safeRunDir(process.cwd(), "../x"));
  assert.throws(() => safeRunDir(process.cwd(), ".gitkeep"));
});
import { assertIsolated } from "../scripts/runner-lib.mjs";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
test("inventory rejects unselected skills and accepts every selected combination member", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "skill-inventory-"));
  try {
    const a = path.join(temp, "a", "SKILL.md"),
      b = path.join(temp, "b", "SKILL.md");
    for (const f of [a, b]) {
      fs.mkdirSync(path.dirname(f));
      fs.writeFileSync(f, "test");
    }
    const prompt = `(file: ${a})\n(file: ${b})`;
    assert.throws(() => assertIsolated(prompt, [a]), /mismatch/);
    assert.equal(assertIsolated(prompt, [a, b]).skills, 2);
    assert.throws(() => assertIsolated(`(file: ${a})`, [a, b]), /mismatch/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
test("an existing run cannot be overwritten", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "skill-run-"));
  try {
    fs.mkdirSync(path.join(tmp, "runs", "already-done"), { recursive: true });
    assert.throws(() => safeRunDir(tmp, "already-done"), /immutable/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
import { validateSkillResources } from "../scripts/runner-lib.mjs";
test("partial skill installations fail before generation", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "skill-resource-"));
  try {
    const entry = path.join(dir, "SKILL.md");
    fs.writeFileSync(entry, "x".repeat(120));
    assert.throws(
      () => validateSkillResources(entry, ["SKILL.md", "reference.md"]),
      /Missing skill resource/,
    );
    fs.writeFileSync(path.join(dir, "reference.md"), "data");
    assert.doesNotThrow(() =>
      validateSkillResources(entry, ["SKILL.md", "reference.md"]),
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
import { validateProfilePins } from "../scripts/runner-lib.mjs";
test("registry revisions must match both profile manifest and lockfile", () => {
  const registry = JSON.parse(
    fs.readFileSync("profiles/registry.json", "utf8"),
  );
  const profile = JSON.parse(
    fs.readFileSync("profiles/frontend-design/profile.json", "utf8"),
  );
  const manifest = fs.readFileSync("profiles/frontend-design/apm.yml", "utf8");
  const lock = fs.readFileSync(
    "profiles/frontend-design/apm.lock.yaml",
    "utf8",
  );
  assert.doesNotThrow(() =>
    validateProfilePins(profile, registry, manifest, lock),
  );
  const changed = structuredClone(registry);
  changed["frontend-design"].commit = "a".repeat(40);
  assert.throws(
    () => validateProfilePins(profile, changed, manifest, lock),
    /differs/,
  );
  assert.throws(
    () =>
      validateProfilePins(
        profile,
        registry,
        manifest,
        lock.replace(registry["frontend-design"].commit, "b".repeat(40)),
      ),
    /differs/,
  );
});
