import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const sensitiveNames = ["OPENAI_API_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
const serverOnlyImports = [
  "@/lib/config/server-env",
  "@/lib/supabase/admin",
  "@/lib/ai/openai-client",
  "@/lib/ai/generate-followup",
];

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

describe("secret exposure boundaries", () => {
  it("keeps server-only modules protected", () => {
    for (const relativePath of [
      "lib/config/server-env.ts",
      "lib/supabase/admin.ts",
      "lib/ai/openai-client.ts",
      "lib/ai/generate-followup.ts",
      "lib/users/index.ts",
    ]) {
      expect(readFileSync(join(projectRoot, relativePath), "utf8"), relativePath).toMatch(
        /^import ["']server-only["'];/m,
      );
    }
  });

  it("does not let client modules import secret-bearing code", () => {
    const clientFiles = [...collectSourceFiles(join(projectRoot, "app")), ...collectSourceFiles(join(projectRoot, "components"))]
      .filter((path) => readFileSync(path, "utf8").includes('"use client"'));

    const violations = clientFiles.flatMap((path) => {
      const source = readFileSync(path, "utf8");
      return [
        ...sensitiveNames.filter((name) => source.includes(name)),
        ...serverOnlyImports.filter((specifier) => source.includes(specifier)),
      ].map((violation) => `${path}: ${violation}`);
    });

    expect(violations).toEqual([]);
  });

  it("ignores local env files while keeping the example non-secret", () => {
    const gitignore = readFileSync(join(projectRoot, ".gitignore"), "utf8");
    const example = readFileSync(join(projectRoot, ".env.example"), "utf8");

    expect(gitignore).toMatch(/^\.env\*$/m);
    expect(example).toContain("replace-with-server-only-key");
    expect(example).not.toMatch(/sk-[A-Za-z0-9]/);
  });
});
