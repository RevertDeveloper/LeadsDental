import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const databaseUrl = process.env.SUPABASE_DB_URL;
const psqlAvailable = Boolean(spawnSync("psql", ["--version"], { stdio: "ignore" }).status === 0);
const rlsScript = resolve(process.cwd(), "supabase/tests/rls.sql");

describe("Supabase RLS integration", () => {
  it.skipIf(!databaseUrl || !psqlAvailable || !existsSync(rlsScript))(
    "executes the real RLS contract against the configured database",
    () => {
      expect(() =>
        execFileSync(
          "psql",
          [databaseUrl!, "-v", "ON_ERROR_STOP=1", "-f", rlsScript],
          { stdio: "pipe", encoding: "utf8" },
        ),
      ).not.toThrow();
    },
  );
});
