import { describe, expect, it } from "vitest";

import {
  leadFilterSchema,
  parseLeadFilters,
} from "@/lib/leads/list-leads";

const madrid = "11111111-1111-4111-8111-111111111111";

describe("lead list filters", () => {
  it("combines supported filters and keeps the requested order", () => {
    expect(
      parseLeadFilters({
        search: "  Ana  ",
        clinic_id: madrid,
        status: "nuevo",
        treatment: "implantes",
        source: "web",
        sort: "activity",
      }),
    ).toEqual({
      search: "Ana",
      clinic_id: madrid,
      status: "nuevo",
      treatment: "implantes",
      source: "web",
      sort: "activity",
    });
  });

  it("keeps valid filters even when unused select values are sent as empty strings", () => {
    expect(
      parseLeadFilters({
        search: "Ana",
        clinic_id: madrid,
        status: "contactado",
        treatment: "",
        source: "",
        sort: "recent",
      }),
    ).toEqual({
      search: "Ana",
      clinic_id: madrid,
      status: "contactado",
      sort: "recent",
    });
  });

  it("falls back to a safe recent ordering for invalid URL values", () => {
    expect(parseLeadFilters({ status: "not-a-status", sort: "unknown" })).toEqual({
      sort: "recent",
    });
    expect(() =>
      leadFilterSchema.parse({ clinic_id: "not-a-clinic", sort: "recent" }),
    ).toThrow();
  });
});
