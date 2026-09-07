import { describe, expect, it, vi } from "vitest";

import {
  createAuditEntry,
  getLeadAuditValues,
  getLeadChangedFields,
} from "@/lib/audit/create-audit-entry";

const actorUserId = "11111111-1111-4111-8111-111111111111";
const leadId = "22222222-2222-4222-8222-222222222222";

function supabaseStub(result: { data: unknown; error: null | Error }) {
  const query = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  };

  return {
    from: vi.fn().mockReturnValue(query),
    query,
  };
}

describe("createAuditEntry", () => {
  it("rejects invalid identity and action before opening Supabase", async () => {
    const getSupabase = vi.fn();

    await expect(
      createAuditEntry(
        {
          actorUserId: "not-a-uuid",
          action: "LEAD_CREATED",
          entityType: "lead",
          entityId: leadId,
        },
        { getSupabase },
      ),
    ).resolves.toMatchObject({ ok: false, code: "VALIDATION_ERROR" });
    expect(getSupabase).not.toHaveBeenCalled();
  });

  it("stores the actor, entity and before/after values", async () => {
    const entry = {
      id: "33333333-3333-4333-8333-333333333333",
      actor_user_id: actorUserId,
      action: "LEAD_STATUS_CHANGED",
      entity_type: "lead",
      entity_id: leadId,
      old_values: { status: "nuevo" },
      new_values: { status: "contactado" },
      metadata: { changed_fields: ["status"] },
      created_at: "2026-09-07T12:00:00.000Z",
    };
    const supabase = supabaseStub({ data: entry, error: null });

    const result = await createAuditEntry(
      {
        actorUserId,
        action: "LEAD_STATUS_CHANGED",
        entityType: "lead",
        entityId: leadId,
        oldValues: entry.old_values,
        newValues: entry.new_values,
        metadata: entry.metadata,
      },
      { getSupabase: vi.fn().mockResolvedValue(supabase) },
    );

    expect(result).toEqual({ ok: true, entry });
    expect(supabase.query.insert).toHaveBeenCalledWith({
      actor_user_id: actorUserId,
      action: "LEAD_STATUS_CHANGED",
      entity_type: "lead",
      entity_id: leadId,
      old_values: entry.old_values,
      new_values: entry.new_values,
      metadata: entry.metadata,
    });
  });

  it("returns a generic database error without exposing internals", async () => {
    const supabase = supabaseStub({
      data: null,
      error: new Error("private database details"),
    });

    await expect(
      createAuditEntry(
        {
          actorUserId,
          action: "LEAD_CREATED",
          entityType: "lead",
          entityId: leadId,
        },
        { getSupabase: vi.fn().mockResolvedValue(supabase) },
      ),
    ).resolves.toEqual({
      ok: false,
      code: "DATABASE_ERROR",
      message: "No se pudo registrar la auditoría.",
    });
  });
});

describe("lead audit snapshots", () => {
  const lead = {
    id: leadId,
    name: "Ana García",
    phone: "+34 612 345 678",
    clinic_id: actorUserId,
    original_clinic_id: null,
    treatment: "implantes" as const,
    source: "web" as const,
    status: "nuevo" as const,
    duplicate_of: null,
  };

  it("excludes personal contact fields from snapshots", () => {
    expect(getLeadAuditValues(lead)).toEqual({
      clinic_id: actorUserId,
      original_clinic_id: null,
      treatment: "implantes",
      source: "web",
      status: "nuevo",
      duplicate_of: null,
    });
  });

  it("reports changed fields while keeping PII out of values", () => {
    expect(
      getLeadChangedFields(lead, {
        ...lead,
        name: "Ana María García",
        status: "contactado",
      }),
    ).toEqual(["name", "status"]);
  });
});
