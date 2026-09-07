import { describe, expect, it } from "vitest";

import { createLead } from "@/lib/leads/create-lead";
import { deleteLead } from "@/lib/leads/delete-lead";
import { updateLead } from "@/lib/leads/update-lead";
import { updateLeadStatus } from "@/lib/leads/update-lead-status";
import { createNote } from "@/lib/notes/create-note";
import { AuthorizationError } from "@/lib/permissions";
import type { CurrentUser } from "@/types/auth";
import type { LeadRecord } from "@/types/leads";
import type { NoteRecord } from "@/types/notes";

const userId = "11111111-1111-4111-8111-111111111111";
const madridId = "22222222-2222-4222-8222-222222222222";
const valenciaId = "33333333-3333-4333-8333-333333333333";

type TableName = "leads" | "notes";
type Row = LeadRecord | NoteRecord;

type Query = {
  select: () => Query;
  eq: (column: string, value: unknown) => Query;
  is: (column: string, value: unknown) => Query;
  neq: (column: string, value: unknown) => Query;
  order: (column: string, options: { ascending: boolean }) => Query;
  limit: (count: number) => Query;
  insert: (payload: Record<string, unknown>) => Query;
  update: (payload: Record<string, unknown>) => Query;
  maybeSingle: () => Promise<{ data: Row | null; error: Error | null }>;
  single: () => Promise<{ data: Row | null; error: Error | null }>;
  then: Promise<Row[]>["then"];
};

class InMemoryCrm {
  readonly leads = new Map<string, LeadRecord>();
  readonly notes = new Map<string, NoteRecord>();
  private sequence = 0;

  from(table: TableName): Query {
    const filters: Array<(row: Row) => boolean> = [];
    let operation: "select" | "insert" | "update" = "select";
    let payload: Record<string, unknown> | undefined;
    let orderBy: { column: string; ascending: boolean } | undefined;
    let limit: number | undefined;

    const rows = () => [...(table === "leads" ? this.leads.values() : this.notes.values())];
    const matches = (row: Row) => filters.every((filter) => filter(row));
    const execute = () => {
      if (operation === "insert") {
        const row = this.insert(table, payload ?? {});
        return [row];
      }

      let result = rows().filter(matches);
      if (orderBy) {
        const { column, ascending } = orderBy;
        result.sort((left, right) => {
          const leftValue = String(left[column as keyof Row] ?? "");
          const rightValue = String(right[column as keyof Row] ?? "");
          return ascending
            ? leftValue.localeCompare(rightValue)
            : rightValue.localeCompare(leftValue);
        });
      }
      if (limit !== undefined) {
        result = result.slice(0, limit);
      }
      const updatePayload = payload;
      if (operation === "update" && updatePayload) {
        result = result.map((row) => this.update(table, row, updatePayload));
      }
      return result;
    };
    const then: Query["then"] = (onFulfilled, onRejected) =>
      Promise.resolve(execute()).then(onFulfilled, onRejected);
    const query = {} as Query;
    Object.assign(query, {
      select: () => query,
      eq: (column: string, value: unknown) => {
        filters.push((row) => row[column as keyof Row] === value);
        return query;
      },
      is: (column: string, value: unknown) => {
        filters.push((row) => row[column as keyof Row] === value);
        return query;
      },
      neq: (column: string, value: unknown) => {
        filters.push((row) => row[column as keyof Row] !== value);
        return query;
      },
      order: (column: string, options: { ascending: boolean }) => {
        orderBy = { column, ascending: options.ascending };
        return query;
      },
      limit: (count: number) => {
        limit = count;
        return query;
      },
      insert: (nextPayload: Record<string, unknown>) => {
        operation = "insert";
        payload = nextPayload;
        return query;
      },
      update: (nextPayload: Record<string, unknown>) => {
        operation = "update";
        payload = nextPayload;
        return query;
      },
      maybeSingle: async () => ({ data: execute()[0] ?? null, error: null }),
      single: async () => {
        const result = execute()[0];
        return result
          ? { data: result, error: null }
          : { data: null, error: new Error("Expected one row") };
      },
      then,
    } satisfies Query);

    return query;
  }

  private insert(table: TableName, payload: Record<string, unknown>): Row {
    this.sequence += 1;
    const id = `00000000-0000-4000-8000-${String(this.sequence).padStart(12, "0")}`;
    const now = `2026-09-07T12:${String(this.sequence).padStart(2, "0")}:00.000Z`;

    if (table === "leads") {
      const lead = {
        ...payload,
        id,
        phone_normalized: "612345678",
        original_clinic_id: payload.original_clinic_id ?? payload.clinic_id,
        duplicate_of: payload.duplicate_of ?? null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
        deleted_by: null,
      } as LeadRecord;
      this.leads.set(id, lead);
      return lead;
    }

    const note = {
      ...payload,
      id,
      created_at: now,
    } as NoteRecord;
    this.notes.set(id, note);
    return note;
  }

  private update(table: TableName, row: Row, payload: Record<string, unknown>): Row {
    const updated = { ...row, ...payload, updated_at: "2026-09-07T12:30:00.000Z" } as Row;
    if (table === "leads") {
      this.leads.set(updated.id, updated as LeadRecord);
    } else {
      this.notes.set(updated.id, updated as NoteRecord);
    }
    return updated;
  }
}

function audit() {
  return async () => ({ ok: true as const, entry: {} as never });
}

describe("CRM persistence lifecycle", () => {
  it("keeps lead, note, status, clinic and soft-delete operations consistent", async () => {
    const db = new InMemoryCrm();
    const authorizedUser: CurrentUser = {
      id: userId,
      email: "manager@vitalis.demo",
      fullName: "Manager de integración",
      role: "CLINIC_MANAGER",
      active: true,
      clinics: [
        {
          id: madridId,
          name: "Vitalis Madrid",
          city: "Madrid",
          slug: "madrid",
          color: "#2563EB",
          active: true,
        },
        {
          id: valenciaId,
          name: "Vitalis Valencia",
          city: "Valencia",
          slug: "valencia",
          color: "#059669",
          active: true,
        },
      ],
    };
    const authorize = async (clinicId: string) => {
      if (![madridId, valenciaId].includes(clinicId)) {
        throw new AuthorizationError("FORBIDDEN");
      }
      return authorizedUser;
    };
    const getSupabase = async () => db as never;

    const created = await createLead(
      {
        name: "Ana García",
        phone: "+34 612 345 678",
        clinic_id: madridId,
        treatment: "implantes",
        source: "web",
        status: "nuevo",
      },
      { authorize, getSupabase, createAuditEntry: audit() },
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const note = await createNote(
      {
        lead_id: created.lead.id,
        text: "Ha solicitado una llamada por la tarde.",
        type: "llamada",
        metadata: { channel: "phone" },
      },
      { authorize, getSupabase, createAuditEntry: audit() },
    );
    expect(note).toMatchObject({ ok: true, note: { lead_id: created.lead.id } });

    const status = await updateLeadStatus(
      { lead_id: created.lead.id, status: "contactado" },
      { authorize, getSupabase, createAuditEntry: audit() },
    );
    expect(status).toMatchObject({ ok: true, lead: { status: "contactado" } });

    const moved = await updateLead(
      {
        id: created.lead.id,
        name: "Ana García",
        phone: "+34 612 345 678",
        clinic_id: valenciaId,
        treatment: "implantes",
        source: "web",
        status: "contactado",
      },
      { authorize, getSupabase, createAuditEntry: audit() },
    );
    expect(moved).toMatchObject({
      ok: true,
      lead: { clinic_id: valenciaId, original_clinic_id: madridId },
    });

    const deleted = await deleteLead(created.lead.id, {
      authorize,
      getSupabase,
      createAuditEntry: audit(),
    });
    expect(deleted).toEqual({ ok: true, leadId: created.lead.id });
    expect(db.leads.get(created.lead.id)).toMatchObject({
      deleted_by: userId,
      clinic_id: valenciaId,
    });
    expect(db.notes.size).toBe(1);
  });

  it("rejects a write outside the actor's clinic scope", async () => {
    const db = new InMemoryCrm();
    const authorize = async () => {
      throw new AuthorizationError("FORBIDDEN");
    };

    await expect(
      createLead(
        {
          name: "Fuera de alcance",
          phone: "+34 600 000 001",
          clinic_id: madridId,
          treatment: "revision",
          source: "web",
          status: "nuevo",
        },
        {
          authorize,
          getSupabase: async () => db as never,
          createAuditEntry: audit(),
        },
      ),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.leads.size).toBe(0);
  });
});
