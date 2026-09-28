import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
export const hash = (text) =>
  crypto.createHash("sha256").update(text).digest("hex");
export function files(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? files(path.join(dir, e.name))
        : [path.join(dir, e.name)],
    );
}
export function snapshot(dir) {
  const ignored = new Set([
    "node_modules",
    ".git",
    "dist",
    "test-results",
    "playwright-report",
    ".codex-home",
  ]);
  function walk(p) {
    return fs
      .readdirSync(p, { withFileTypes: true })
      .flatMap((e) =>
        ignored.has(e.name)
          ? []
          : e.isDirectory()
            ? walk(path.join(p, e.name))
            : [path.join(p, e.name)],
      );
  }
  return Object.fromEntries(
    walk(dir)
      .filter((f) => !fs.lstatSync(f).isSymbolicLink())
      .map((f) => [path.relative(dir, f), hash(fs.readFileSync(f))]),
  );
}
export const allowed = (file) =>
  file === "DESIGN.md" || (file.startsWith("src/") && file !== "src/main.tsx");
export function protectedChanges(before, after) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
    (f) => !allowed(f) && before[f] !== after[f],
  );
}
export function extractSkills(prompt) {
  const text = typeof prompt === "string" ? prompt : JSON.stringify(prompt);
  const normalized = text.replaceAll("\\n", "\n");
  const roots = {};
  for (const m of normalized.matchAll(/`(r\d+)` = `([^`]+)`/g))
    roots[m[1]] = m[2];
  return [...normalized.matchAll(/\(file: ([^)]+\/SKILL\.md)\)/g)].map((m) => {
    const [alias, ...rest] = m[1].split("/");
    return roots[alias] ? path.join(roots[alias], ...rest) : m[1];
  });
}
export function assertIsolated(prompt, permitted) {
  const actual = extractSkills(prompt).map((p) => fs.realpathSync(p));
  const wanted = permitted.map((p) => fs.realpathSync(p));
  if (
    actual.some((p) => !wanted.includes(p)) ||
    wanted.some((p) => !actual.includes(p))
  )
    throw Error(
      `Skill inventory mismatch. Expected ${wanted.length}, found ${actual.length}.`,
    );
  const text = JSON.stringify(prompt);
  if (
    text.includes("<oai-mem-citation>") ||
    text.includes("MEMORY_SUMMARY BEGINS")
  )
    throw Error("Memory contamination detected.");
  return { passed: true, skills: actual.length, promptHash: hash(text) };
}
export function safeRunDir(root, id) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw Error("Invalid run ID");
  const dest = path.join(root, "runs", id);
  if (fs.existsSync(dest))
    throw Error("Run already exists; outputs are immutable.");
  return dest;
}
export function validateSkillResources(entrypoint, required = ["SKILL.md"]) {
  if (!entrypoint || !fs.existsSync(entrypoint))
    throw Error("Selected skill entrypoint is missing.");
  if (fs.readFileSync(entrypoint, "utf8").length < 100)
    throw Error("Incomplete skill entrypoint");
  for (const relative of required)
    if (!fs.existsSync(path.join(path.dirname(entrypoint), relative)))
      throw Error(`Missing skill resource: ${relative}`);
}
export function validateProfilePins(profile, registry, manifest, lock) {
  const entries = manifest.split("\n").map((line) => line.trim());
  const blocks = lock
    .split(/(?=^- repo_url:)/m)
    .slice(1)
    .map((block) => {
      const value = (key) =>
        block
          .match(new RegExp(`^(?:- |  )${key}: ['\"]?([^'\"\\n]+)`, "m"))?.[1]
          ?.trim();
      return {
        repo: value("repo_url"),
        path: value("virtual_path"),
        commit: value("resolved_commit"),
      };
    });
  for (const id of profile.skills) {
    const skill = registry[id];
    if (!skill || !/^[a-f0-9]{40}$/.test(skill.commit))
      throw Error(`Invalid immutable skill revision: ${id}`);
    if (!entries.includes(`- ${skill.repo}/${skill.path}#${skill.commit}`))
      throw Error(
        `Profile manifest differs from registry: ${id}. Create a new profile for changed revisions.`,
      );
    if (
      !blocks.some(
        (b) =>
          b.repo === skill.repo &&
          b.path === skill.path &&
          b.commit === skill.commit,
      )
    )
      throw Error(`Lockfile revision differs from registry: ${id}`);
  }
}
