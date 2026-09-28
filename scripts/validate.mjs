import { execFileSync } from "node:child_process";
for (const task of ["test", "typecheck", "build", "test:e2e"])
  execFileSync("pnpm", [task], { stdio: "inherit" });
