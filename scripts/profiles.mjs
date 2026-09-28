import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const registry = () =>
  JSON.parse(
    fs.readFileSync(path.join(root, "profiles/registry.json"), "utf8"),
  );
export function register(id, skills, label = id) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id))
    throw Error("Profile ID must be lowercase letters, digits, and hyphens.");
  if (new Set(skills).size !== skills.length) throw Error("Duplicate skills.");
  const entries = registry();
  for (const s of skills) if (!entries[s]) throw Error(`Unknown skill: ${s}`);
  const dir = path.join(root, "profiles", id);
  if (fs.existsSync(dir))
    throw Error(
      "Profile already exists; create a new profile to preserve provenance.",
    );
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "profile.json"),
    JSON.stringify({ id, label, skills }, null, 2) + "\n",
  );
  const deps = skills
    .map(
      (s) => `    - ${entries[s].repo}/${entries[s].path}#${entries[s].commit}`,
    )
    .join("\n");
  fs.writeFileSync(
    path.join(dir, "apm.yml"),
    `name: ${id}\nversion: 1.0.0\ndescription: Skill Tester profile ${id}\ntargets:\n  - codex\ndependencies:\n  apm:${skills.length ? "\n" + deps : " []"}\n`,
  );
  return dir;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [action, id, ...skills] = process.argv.slice(2);
  if (action === "add") {
    console.log(register(id, skills));
  } else if (action === "install") {
    execFileSync("apm", ["install", "--frozen"], {
      cwd: path.join(root, "profiles", id),
      stdio: "inherit",
    });
  } else {
    console.log(
      "pnpm run profile add <profile-id> [skill-id ...]\npnpm run profile install <profile-id>",
    );
  }
}
