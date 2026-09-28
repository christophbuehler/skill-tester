import fs from "node:fs";
import { loadContinuation } from "./continuation.mjs";
import { auditPresentation } from "./audit-presentation.mjs";
import { captureReview } from "./capture-review.mjs";
import path from "node:path";
import os from "node:os";
import { execFileSync, spawn } from "node:child_process";
import { root, registry } from "./profiles.mjs";
import {
  hash,
  files,
  snapshot,
  protectedChanges,
  extractSkills,
  assertIsolated,
  safeRunDir,
  validateSkillResources,
  validateProfilePins,
} from "./runner-lib.mjs";
const [profileId, ...args] = process.argv.slice(2);
if (!profileId || !/^[a-z0-9][a-z0-9-]*$/.test(profileId))
  throw Error("Usage: pnpm generate <profile-id> [--preflight]");
const profileDir = path.join(root, "profiles", profileId);
const profile = JSON.parse(
  fs.readFileSync(path.join(profileDir, "profile.json"), "utf8"),
);
const reg = registry();
for (const id of profile.skills) {
  if (reg[id]?.blockedReason) throw Error(`Skill ${id} is unavailable for generation: ${reg[id].blockedReason}`);
  if (reg[id]?.aliasOf) throw Error(`Unresolved skill alias: ${id}. Register a new expanded profile.`);
  for (const dependency of reg[id]?.dependencies || [])
    if (!profile.skills.includes(dependency)) throw Error(`Missing skill dependency: ${id} requires ${dependency}`);
}
const config = JSON.parse(
  fs.readFileSync(path.join(root, "benchmark/config.json"), "utf8"),
);
const parentId = args.includes('--continue') ? args[args.indexOf('--continue') + 1] : null;
const notesFile = args.includes('--review-notes') ? args[args.indexOf('--review-notes') + 1] : null;
if ((args.includes('--continue') && (!parentId || parentId.startsWith('--'))) || (args.includes('--review-notes') && (!notesFile || notesFile.startsWith('--')))) throw Error('Missing continuation argument.');
if (Boolean(parentId) !== Boolean(notesFile)) throw Error('--continue and --review-notes must be supplied together.');
const continuation = parentId ? loadContinuation(root, parentId, profileId, config.id) : null;
const reviewInstruction = notesFile ? fs.readFileSync(path.resolve(root, notesFile), 'utf8') : null;
if (continuation && !reviewInstruction?.trim()) throw Error('A curated continuation needs recorded review instructions.');
if (continuation && (continuation.metadata.model !== config.model || continuation.metadata.reasoning !== config.reasoning || JSON.stringify(continuation.metadata.skills.map(s => [s.id,s.repo,s.path,s.commit])) !== JSON.stringify(profile.skills.map(id => [id,reg[id].repo,reg[id].path,reg[id].commit])))) throw Error('Continuation model/settings/skill revisions must match its parent.');
// Reject overlapping runs: the identical acceptance fixture uses one local port.
fs.mkdirSync(path.join(root, ".local"), { recursive: true });
const lock = path.join(root, ".local/generation.lock");
if (fs.existsSync(lock)) {
  const pid = Number(fs.readFileSync(lock, "utf8"));
  let live = true;
  try {
    process.kill(pid, 0);
  } catch {
    live = false;
  }
  if (live)
    throw Error("Another generation is running. Run profiles sequentially.");
  fs.rmSync(lock);
}
fs.writeFileSync(lock, String(process.pid), { flag: "wx" });
process.on("exit", () => {
  if (
    fs.existsSync(lock) &&
    fs.readFileSync(lock, "utf8") === String(process.pid)
  )
    fs.rmSync(lock);
});
const runId = `${profileId}-${new Date()
  .toISOString()
  .replace(/[^0-9]/g, "")
  .slice(0, 17)}`;
const dest = safeRunDir(root, runId);
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "skill-tester-"));
const work = path.join(scratch, "work");
const home = path.join(scratch, "codex");
fs.mkdirSync(work);
fs.mkdirSync(home, { mode: 0o700 });
const logDir = path.join(root, ".local", runId);
fs.mkdirSync(logDir, { recursive: true });
const exec = (cmd, argv, cwd = work, options = {}) =>
  execFileSync(cmd, argv, {
    cwd,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    ...options,
  });
const cp = (a, b) => fs.cpSync(a, b, { recursive: true });
const auth = path.join(
  process.env.CODEX_HOME || path.join(os.homedir(), ".codex"),
  "auth.json",
);
if (fs.existsSync(auth)) fs.symlinkSync(auth, path.join(home, "auth.json"));
let activeChild;
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    if (activeChild?.pid) {
      try {
        process.kill(-activeChild.pid, "SIGTERM");
      } catch {}
    }
    fs.rmSync(path.join(home, "auth.json"), { force: true });
    process.exit(130);
  });
const env = { ...process.env, CODEX_HOME: home };
delete env.CODEX_THREAD_ID;
delete env.CODEX_INTERNAL_ORIGINATOR_OVERRIDE;
const features = [
  "memories",
  "plugins",
  "apps",
  "chronicle",
  "multi_agent",
  "multi_agent_v2",
  "skill_search",
  "browser_use",
  "browser_use_external",
  "computer_use",
  "image_generation",
  "remote_plugin",
  "hooks",
  "tool_suggest",
];
const flags = features.flatMap((f) => ["--disable", f]);
try {
  cp(path.join(root, "starter"), work);
  cp(path.join(root, "packages/mock-agent"), path.join(work, "shared"));
  cp(path.join(root, "benchmark/prompt.md"), path.join(work, "PROMPT.md"));
  cp(path.join(root, "benchmark/CONTRACT.md"), path.join(work, "CONTRACT.md"));
  cp(path.join(root, "benchmark/CAPABILITIES.md"), path.join(work, "CAPABILITIES.md"));
  cp(path.join(root, "pnpm-lock.yaml"), path.join(work, "pnpm-lock.yaml"));
  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8"),
  );
  pkg.scripts = {
    dev: "vite --host 127.0.0.1",
    build: "vite build",
    typecheck: "tsc --noEmit",
    "test:e2e": "BENCHMARK_ISOLATED=1 playwright test",
  };
  fs.writeFileSync(
    path.join(work, "package.json"),
    JSON.stringify(pkg, null, 2),
  );
  fs.writeFileSync(
    path.join(work, "index.html"),
    fs
      .readFileSync(path.join(root, "index.html"), "utf8")
      .replace("Skill Tester — a frontend experiment", "Folio"),
  );
  fs.writeFileSync(
    path.join(work, "vite.config.ts"),
    fs
      .readFileSync(path.join(root, "vite.config.ts"), "utf8")
      .replace("base: '/skill-tester/'", "base: './'"),
  );
  const ts = JSON.parse(
    fs.readFileSync(path.join(root, "tsconfig.json"), "utf8"),
  );
  ts.include = ["src", "shared", "vite.config.ts"];
  fs.writeFileSync(
    path.join(work, "tsconfig.json"),
    JSON.stringify(ts, null, 2),
  );
  fs.mkdirSync(path.join(work, "tests"));
  cp(
    path.join(root, "tests/variants.spec.ts"),
    path.join(work, "tests/variants.spec.ts"),
  );
  cp(path.join(root, "tests/interactions.spec.ts"), path.join(work, "tests/interactions.spec.ts"));
  fs.writeFileSync(
    path.join(work, "playwright.config.ts"),
    fs
      .readFileSync(path.join(root, "playwright.config.ts"), "utf8")
      .replace("4173", "4183")
      .replaceAll("4173", "4183")
      .replace("/skill-tester/", "/"),
  );
  fs.symlinkSync(
    path.join(root, "node_modules"),
    path.join(work, "node_modules"),
    "dir",
  );
  cp(path.join(profileDir, "apm.yml"), path.join(work, "apm.yml"));
  if (!fs.existsSync(path.join(profileDir, "apm.lock.yaml")))
    exec("apm", ["lock"], profileDir);
  cp(path.join(profileDir, "apm.lock.yaml"), path.join(work, "apm.lock.yaml"));
  validateProfilePins(
    profile,
    reg,
    fs.readFileSync(path.join(work, "apm.yml"), "utf8"),
    fs.readFileSync(path.join(work, "apm.lock.yaml"), "utf8"),
  );
  exec("apm", ["install", "--frozen"], work);
  const discovered = files(path.join(work, ".agents/skills")).filter((f) =>
    f.endsWith("/SKILL.md"),
  );
  const selected = profile.skills.map((id) =>
    discovered.find(
      (f) => path.basename(path.dirname(f)) === path.basename(reg[id].path),
    ),
  );
  if (selected.some((f) => !f) || discovered.length !== selected.length)
    throw Error(
      "Selected skill missing or unexpected transitive skills installed.",
    );
  if (selected.length !== profile.skills.length)
    throw Error(
      `APM installed ${selected.length} skills for ${profile.skills.length} selections.`,
    );
  for (const [i, f] of selected.entries())
    validateSkillResources(f, reg[profile.skills[i]].requiredResources);
  // Only the benchmark's own neutral instructions become repository instructions.
  for (const f of ["AGENTS.md", "CLAUDE.md"])
    if (fs.existsSync(path.join(work, f))) fs.rmSync(path.join(work, f));
  exec("git", ["init", "-q", "-b", "main"]);
  const prompt = fs.readFileSync(
    path.join(root, "benchmark/prompt.md"),
    "utf8",
  );
  const profileInstruction = (selected.length
    ? `Selected design skills (read every entrypoint before implementing):\n${selected.map((f) => "- " + path.relative(work, f)).join("\n")}\nApply all of them. The shared benchmark brief takes precedence. No additional skills.`
    : "No design skills are selected. Use only the shared benchmark brief and contract.") + (profile.profileInstructions?.length ? "\nProfile modes:\n" + profile.profileInstructions.join("\n") : "");
  fs.writeFileSync(path.join(work, "AGENTS.md"), profileInstruction + "\n");
  const baseConfig = `model = ${JSON.stringify(config.model)}\nmodel_reasoning_effort = ${JSON.stringify(config.reasoning)}\napproval_policy = "never"\nsandbox_mode = "workspace-write"\nweb_search = "disabled"\n[sandbox_workspace_write]\nnetwork_access = false\n`;
  fs.writeFileSync(path.join(home, "config.toml"), baseConfig);
  const preview = () =>
    JSON.parse(
      exec("codex", ["debug", "prompt-input", ...flags, prompt], work, { env }),
    );
  const initial = preview();
  const forbidden = extractSkills(initial).filter(
    (f) =>
      !selected.map((s) => fs.realpathSync(s)).includes(fs.realpathSync(f)),
  );
  fs.appendFileSync(
    path.join(home, "config.toml"),
    forbidden
      .map(
        (f) =>
          `\n[[skills.config]]\npath = ${JSON.stringify(f)}\nenabled = false\n`,
      )
      .join(""),
  );
  const clean = preview();
  const isolation = assertIsolated(clean, selected);
  fs.writeFileSync(
    path.join(logDir, "prompt-input.json"),
    JSON.stringify(clean, null, 2),
  );
  const protectedBefore = snapshot(work);
  const starterHash = hash(
    JSON.stringify(
      Object.entries(protectedBefore)
        .filter(
          ([f]) =>
            !f.startsWith(".agents/") &&
            !f.startsWith("apm_modules/") &&
            !["apm.yml", "apm.lock.yaml", "AGENTS.md", ".gitignore"].includes(
              f,
            ),
        )
        .sort(),
    ),
  );
  if (continuation) {
    // Seed presentation only; all protected behavior, fixtures and dependencies remain fresh.
    for (const entry of fs.readdirSync(path.join(continuation.dir, 'src'))) {
      if (entry !== 'main.tsx') cp(path.join(continuation.dir, 'src', entry), path.join(work, 'src', entry));
    }
    cp(path.join(continuation.dir, 'DESIGN.md'), path.join(work, 'DESIGN.md'));
  }
  const metadata = {
    id: runId,
    profile: profileId,
    requestedSkills: profile.requestedSkills || profile.skills,
    label: continuation ? `${profile.label} / Reviewed` : profile.label,
    ...(continuation ? {mode: "curated-followup", parentRunId: parentId, parentSourceHash: continuation.metadata.sourceHash, reviewInstruction, reviewInstructionHash: hash(reviewInstruction)} : {}),
    skills: profile.skills.map((id) => ({ id, ...reg[id] })),
    createdAt: new Date().toISOString(),
    benchmark: config.id,
    model: config.model,
    reasoning: config.reasoning,
    promptHash: hash(prompt),
    starterHash,
    profileInstruction,
    apmVersion: exec("apm", ["--version"]).trim(),
    cliVersion: exec("codex", ["--version"]).trim(),
    isolation,
    repairCount: 0,
    refinementCount: 0,
    refinementRounds: continuation ? 1 : config.refinementRounds,
    taskPrompt: prompt,
    refinementPrompt: fs.readFileSync(path.join(root, "benchmark/refinement.md"), "utf8"),
    refinementTimeoutMs: config.refinementTimeoutMs,
    status: "failed",
    elapsedMs: 0,
    tokenUsage: [],
    loadedSkills: [],
    validation: [],
    validationAttempts: [],
    failure: null,
  };
  if (args.includes("--preflight")) {
    console.log(
      JSON.stringify(
        { profile: profileId, isolation, skills: profile.skills, work },
        null,
        2,
      ),
    );
    process.exitCode = 0;
  } else {
    const started = Date.now();
    async function invoke(text, timeout, phase, images = []) {
      const log = fs.openSync(path.join(logDir, `${phase}.jsonl`), "w");
      const err = fs.openSync(path.join(logDir, `${phase}.stderr`), "w");
      const child = spawn(
        "codex",
        [
          "exec",
          ...images.flatMap(file => ["--image", file]),
          ...flags,
          "--ephemeral",
          "--json",
          "--color",
          "never",
          "-m",
          config.model,
          "-",
        ],
        { cwd: work, env, stdio: ["pipe", log, err], detached: true },
      );
      activeChild = child;
      child.stdin.end(text);
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        try {
          process.kill(-child.pid, "SIGTERM");
        } catch {}
        setTimeout(() => {
          try {
            process.kill(-child.pid, "SIGKILL");
          } catch {}
        }, 2000).unref();
      }, timeout);
      const code = await new Promise((resolve, reject) => {
        child.on("error", reject);
        child.on("close", resolve);
      });
      clearTimeout(timer);
      activeChild = null;
      fs.closeSync(log);
      fs.closeSync(err);
      const lines = fs
        .readFileSync(path.join(logDir, `${phase}.jsonl`), "utf8")
        .split("\n")
        .filter(Boolean);
      const events = lines.map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return {};
        }
      });
      metadata.tokenUsage.push(
        ...events
          .filter((e) => e.type === "turn.completed")
          .map((e) => e.usage),
      );
      for (const f of selected) {
        const rel = path.relative(work, f);
        if (
          events.some(
            (e) =>
              e.type === "item.completed" &&
              e.item?.type === "command_execution" &&
              e.item.exit_code === 0 &&
              e.item.command?.includes(rel) &&
              e.item.aggregated_output?.includes("description:"),
          )
        )
          if (!metadata.loadedSkills.includes(rel))
            metadata.loadedSkills.push(rel);
      }
      if (timedOut) {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {}
        throw Error(`${phase} timed out`);
      }
      if (code !== 0) throw Error(`${phase} exited ${code}. See local logs.`);
    }
    function check() {
      const changes = protectedChanges(protectedBefore, snapshot(work));
      if (changes.length)
        throw Error(`Protected files changed: ${changes.join(", ")}`);
      const results = [];
      for (const task of ["typecheck", "build", "test:e2e"]) {
        try {
          const output = exec("pnpm", [task], work, {
            env: { ...env, BENCHMARK_ISOLATED: "1" },
          });
          results.push({ task, passed: true });
          fs.writeFileSync(
            path.join(logDir, `${task.replace(":", "-")}.log`),
            output,
          );
        } catch (e) {
          results.push({
            task,
            passed: false,
            output: (e.stdout || "") + "\n" + (e.stderr || ""),
          });
        }
      }
      if (config.id === 'folio-v4') {
        const findings = auditPresentation(work);
        results.push({ task: 'semantic-colors', passed: findings.length === 0, output: findings.join('\n') });
      }
      metadata.validation = results.map(({ task, passed }) => ({
        task,
        passed,
      }));
      metadata.validationAttempts.push(
        results.map(({ task, passed, output }) => ({
          task,
          passed,
          ...(!passed
            ? {
                failure: output
                  .replaceAll(work, "<workspace>")
                  .replaceAll(root, "<repository>")
                  .slice(0, 20000),
              }
            : {}),
        })),
      );
      return results.filter((r) => !r.passed);
    }
    try {
      console.log(`Generating ${runId}; local logs: ${logDir}`);
      if (!continuation) await invoke(prompt, config.generationTimeoutMs, "generation");
      async function validateWithRepair() {
        let failures = check();
        if (failures.length && metadata.repairCount === 0) {
          metadata.repairCount = 1;
          await invoke(`${prompt}\n\nRepair only these objective validation failures. Preserve your design and protected files.\n${JSON.stringify(failures).slice(0,24000)}`, config.repairTimeoutMs, "repair");
          failures = check();
        }
        if (failures.length) throw Error("Acceptance checks failed after the permitted repair.");
      }
      await validateWithRepair();
      let phase = 'review-before';
      let review = await captureReview(work, path.join(logDir,phase));
      metadata.browserReview = {before: review};
      for (let round=1; round<=metadata.refinementRounds; round++) {
        metadata.refinementCount = round;
        await invoke(`${prompt}\n\nDesign refinement ${round} of ${metadata.refinementRounds}.\n${metadata.refinementPrompt}${continuation ? `\nRecorded coordinator review (curated follow-up, not a fresh benchmark generation):\n${reviewInstruction}` : ""}\nBrowser observations:\n${JSON.stringify(review)}`, config.refinementTimeoutMs, `refinement-${round}`, review.captures.map(file => path.join(logDir,phase,file)));
        await validateWithRepair();
        phase = round===metadata.refinementRounds ? 'review-after' : `review-round-${round}`;
        review = await captureReview(work,path.join(logDir,phase));
        metadata.browserReview[round===metadata.refinementRounds ? 'after' : `round${round}`] = review;
      }
      if (metadata.loadedSkills.length !== selected.length)
        throw Error("Missing successful skill entrypoint read evidence.");
      metadata.status = "passed";
    } catch (e) {
      metadata.failure = e.message;
      console.error(e.message);
    }
    metadata.elapsedMs = Date.now() - started;
    fs.mkdirSync(dest);
    if (fs.existsSync(path.join(work, "src")))
      cp(path.join(work, "src"), path.join(dest, "src"));
    cp(path.join(root, "packages/mock-agent"), path.join(dest, "shared"));
    if (fs.existsSync(path.join(work, "index.html")))
      cp(path.join(work, "index.html"), path.join(dest, "index.html"));
    if (fs.existsSync(path.join(work, "DESIGN.md")))
      cp(path.join(work, "DESIGN.md"), path.join(dest, "DESIGN.md"));
    const evidence = path.join(dest, "evidence");
    fs.mkdirSync(evidence);
    for (const f of files(path.join(work, "test-results")).filter((f) =>
      /\/(desktop|mobile)\.png$/.test(f),
    ))
      cp(f, path.join(evidence, path.basename(f)));
    const report = path.join(work, "test-results/report.json");
    if (fs.existsSync(report)) {
      const r = JSON.parse(fs.readFileSync(report, "utf8"));
      const violations = [];
      const collect = (suites) => {
        for (const s of suites) {
          for (const spec of s.specs || [])
            for (const t of spec.tests || [])
              for (const result of t.results || [])
                for (const a of result.attachments || [])
                  if (a.name.endsWith("-accessibility") && a.body)
                    violations.push({
                      viewport: a.name,
                      findings: JSON.parse(
                        Buffer.from(a.body, "base64").toString(),
                      ),
                    });
          collect(s.suites || []);
        }
      };
      collect(r.suites || []);
      metadata.accessibility = violations;
    }
    for (const phase of ['review-before', ...Array.from({length: metadata.refinementRounds-1}, (_,i)=>`review-round-${i+1}`), 'review-after']) {
      if (fs.existsSync(path.join(logDir,phase))) cp(path.join(logDir,phase),path.join(evidence,phase));
    }
    metadata.sourceHash = hash(JSON.stringify(snapshot(dest)));
    fs.writeFileSync(
      path.join(dest, "metadata.json"),
      JSON.stringify(metadata, null, 2) + "\n",
    );
    console.log(
      JSON.stringify({
        id: runId,
        status: metadata.status,
        elapsedMs: metadata.elapsedMs,
      }),
    );
    if (metadata.status !== "passed") process.exitCode = 1;
  }
} finally {
  fs.rmSync(path.join(home, "auth.json"), { force: true });
  fs.rmSync(scratch, { recursive: true, force: true });
}
