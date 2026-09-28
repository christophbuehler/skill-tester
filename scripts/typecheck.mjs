import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { root } from "./profiles.mjs";
const passed = fs
  .readdirSync(path.join(root, "runs"))
  .filter(
    (id) =>
      fs.existsSync(path.join(root, "runs", id, "metadata.json")) &&
      JSON.parse(
        fs.readFileSync(path.join(root, "runs", id, "metadata.json"), "utf8"),
      ).status === "passed",
  );
fs.mkdirSync(path.join(root, ".local"), { recursive: true });
const config = JSON.parse(
  fs.readFileSync(path.join(root, "tsconfig.json"), "utf8"),
);
config.compilerOptions.baseUrl = root;
config.include = [
  ...config.include.filter((p) => !p.startsWith("runs/")),
  ...passed.flatMap((id) => [`runs/${id}/src`, `runs/${id}/shared`]),
].map((p) => path.join(root, p));
const target = path.join(root, ".local/typecheck.json");
fs.writeFileSync(target, JSON.stringify(config, null, 2));
execFileSync("pnpm", ["exec", "tsc", "--noEmit", "-p", target], {
  cwd: root,
  stdio: "inherit",
});
