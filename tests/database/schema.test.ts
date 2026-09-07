import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "../..");

async function readRepositoryFile(relativePath: string) {
  return readFile(resolve(repositoryRoot, relativePath), "utf8");
}

describe("CRM database contract", () => {
  it("defines the complete MVP schema and requested indexes", async () => {
    const schema = await readRepositoryFile(
      "supabase/migrations/20260907120000_initial_crm_schema.sql",
    );

    for (const enumName of [
      "user_role",
      "treatment",
      "lead_source",
      "lead_status",
      "note_type",
    ]) {
      expect(schema).toContain(`create type public.${enumName} as enum`);
    }

    for (const tableName of [
      "clinics",
      "profiles",
      "user_clinics",
      "leads",
      "notes",
      "audit_log",
    ]) {
      expect(schema).toContain(`create table public.${tableName}`);
    }

    for (const indexName of [
      "leads_clinic_id_idx",
      "leads_status_idx",
      "leads_treatment_idx",
      "leads_source_idx",
      "leads_phone_normalized_idx",
      "leads_created_at_idx",
      "notes_lead_id_idx",
      "user_clinics_user_id_idx",
      "user_clinics_clinic_id_idx",
    ]) {
      expect(schema).toContain(`create index ${indexName}`);
    }
  });

  it("keeps soft-delete and append-only invariants in the database layer", async () => {
    const schema = await readRepositoryFile(
      "supabase/migrations/20260907120000_initial_crm_schema.sql",
    );
    const policies = await readRepositoryFile(
      "supabase/migrations/20260907120100_rls_policies.sql",
    );

    expect(schema).toContain("create trigger leads_prevent_hard_delete");
    expect(schema).toContain("create trigger notes_prevent_update");
    expect(schema).toContain("create trigger notes_prevent_delete");
    expect(policies).toContain("deleted_at is null");
    expect(policies).toContain("create policy leads_no_physical_delete");
    expect(policies).toContain("create policy notes_no_update");
    expect(policies).toContain("create policy notes_no_delete");
  });

  it("seeds exactly the three structural Vitalis clinics", async () => {
    const seed = await readRepositoryFile("supabase/seed.sql");

    expect(seed).toContain("('Clínica Dental Vitalis Madrid', 'Madrid', 'madrid', '#2563EB', true)");
    expect(seed).toContain("('Clínica Dental Vitalis Valencia', 'Valencia', 'valencia', '#059669', true)");
    expect(seed).toContain("('Clínica Dental Vitalis Sevilla', 'Sevilla', 'sevilla', '#D97706', true)");
    expect(seed).toContain("on conflict (slug) do update");
    expect(seed).not.toContain("insert into public.leads");
    expect(seed).not.toContain("insert into auth.users");
  });

  it("keeps AI note and generated audit in one database operation", async () => {
    const aiPersistence = await readRepositoryFile(
      "supabase/migrations/20260907120200_ai_followup_persistence.sql",
    );

    expect(aiPersistence).toContain("create or replace function public.persist_ai_followup");
    expect(aiPersistence).toContain("returns public.notes");
    expect(aiPersistence).toContain("security invoker");
    expect(aiPersistence).toContain("insert into public.notes");
    expect(aiPersistence).toContain("insert into public.audit_log");
    expect(aiPersistence).toContain("'AI_FOLLOWUP_GENERATED'");
    expect(aiPersistence).toContain("grant execute on function public.persist_ai_followup");
  });
});
