import fs from "node:fs";
import path from "node:path";
import { build } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { root } from "./profiles.mjs";
export function catalog() {
  return fs
    .readdirSync(path.join(root, "runs"))
    .filter((id) => fs.existsSync(path.join(root, "runs", id, "metadata.json")))
    .map((id) =>
      JSON.parse(
        fs.readFileSync(path.join(root, "runs", id, "metadata.json"), "utf8"),
      ),
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
const runs = catalog();
fs.mkdirSync(path.join(root, "src/generated"), { recursive: true });
fs.writeFileSync(
  path.join(root, "src/generated/catalog.json"),
  JSON.stringify(runs, null, 2),
);
fs.writeFileSync(
  path.join(root, "src/generated/prompt.json"),
  JSON.stringify(
    fs.readFileSync(path.join(root, "benchmark/prompt.md"), "utf8"),
  ),
);
await build({ root });
for (const run of runs) {
  const dest = path.join(root, "dist", "variants", run.id);
  if (run.status === "passed")
    await build({
      configFile: false,
      root: path.join(root, "runs", run.id),
      plugins: [react(), tailwind()],
      base: `/skill-tester/variants/${run.id}/`,
      build: { outDir: dest, emptyOutDir: true },
    });
  const evidence = path.join(root, "runs", run.id, "evidence");
  if (fs.existsSync(evidence))
    fs.cpSync(evidence, path.join(root, "dist/evidence", run.id), {
      recursive: true,
    });
}
