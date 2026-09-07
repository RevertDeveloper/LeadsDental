import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "../..");

describe("demo user provisioning contract", () => {
  it("provisions the required roles through Supabase Auth Admin", async () => {
    const script = await readFile(
      resolve(repositoryRoot, "scripts/seed-demo-users.ts"),
      "utf8",
    );

    for (const email of [
      "admin@vitalis.demo",
      "manager@vitalis.demo",
      "recepcion@vitalis.demo",
    ]) {
      expect(script).toContain(email);
    }

    expect(script).toContain("supabase.auth.admin.createUser");
    expect(script).toContain("supabase.auth.admin.updateUserById");
    expect(script).not.toContain("insert into auth.users");
  });
});
