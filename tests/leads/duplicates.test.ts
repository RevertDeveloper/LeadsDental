import { describe, expect, it } from "vitest";

import { findDuplicateLeads } from "@/lib/leads/find-duplicates";
import { normalizePhone } from "@/lib/leads/normalize-phone";

describe("normalizePhone", () => {
  it("compares national and international Spanish formats", () => {
    expect(normalizePhone("+34 612 345 678")).toBe("612345678");
    expect(normalizePhone("0034 612 345 678")).toBe("612345678");
    expect(normalizePhone("612345678")).toBe("612345678");
  });

  it("removes presentation characters without changing other numbers", () => {
    expect(normalizePhone("+1 (202) 555-0100")).toBe("12025550100");
    expect(normalizePhone("  ")).toBe("");
  });
});

describe("findDuplicateLeads", () => {
  it("returns active candidates ordered by the persistence query", async () => {
    const candidate = {
      id: "22222222-2222-4222-8222-222222222222",
      name: "Ana García",
      phone: "+34 612 345 678",
      phone_normalized: "612345678",
      clinic_id: "33333333-3333-4333-8333-333333333333",
      treatment: "implantes" as const,
      source: "web" as const,
      status: "nuevo" as const,
      created_at: "2026-09-07T12:00:00.000Z",
    };
    const query = {
      select: () => query,
      eq: () => query,
      is: () => query,
      order: () => query,
      limit: () => Promise.resolve({ data: [candidate], error: null }),
    };

    await expect(
      findDuplicateLeads({ from: () => query } as never, "612 345 678"),
    ).resolves.toEqual([candidate]);
  });

  it("does not turn a duplicate lookup failure into an empty result", async () => {
    const query = {
      select: () => query,
      eq: () => query,
      is: () => query,
      order: () => query,
      limit: () => Promise.resolve({ data: null, error: new Error("database") }),
    };

    await expect(
      findDuplicateLeads({ from: () => query } as never, "+34 612 345 678"),
    ).rejects.toThrow("No se pudieron comprobar los posibles duplicados.");
  });

  it("queries normalized active leads and excludes the edited lead", async () => {
    const calls: string[] = [];
    const query = {
      select() {
        calls.push("select");
        return this;
      },
      eq() {
        calls.push("eq");
        return this;
      },
      is() {
        calls.push("is");
        return this;
      },
      order() {
        calls.push("order");
        return this;
      },
      limit() {
        calls.push("limit");
        return this;
      },
      neq(column: string, value: string) {
        calls.push(`${column}:${value}`);
        return Promise.resolve({ data: [], error: null });
      },
    };

    const supabase = {
      from() {
        return query;
      },
    };

    await expect(
      findDuplicateLeads(
        supabase as never,
        "+34 612 345 678",
        "11111111-1111-4111-8111-111111111111",
      ),
    ).resolves.toEqual([]);
    expect(calls).toEqual([
      "select",
      "eq",
      "is",
      "order",
      "limit",
      "id:11111111-1111-4111-8111-111111111111",
    ]);
  });
});
