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
