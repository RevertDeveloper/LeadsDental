import { describe, expect, it } from "vitest";

import {
  leadCreateSchema,
  leadUpdateSchema,
} from "@/lib/validation/lead-schemas";

const clinicId = "11111111-1111-4111-8111-111111111111";

const validLead = {
  name: "  Ana García  ",
  phone: " +34 612 345 678 ",
  clinic_id: clinicId,
  treatment: "implantes",
  source: "web",
  status: "nuevo",
} as const;

describe("lead schemas", () => {
  it("accepts valid values and normalizes surrounding whitespace", () => {
    expect(leadCreateSchema.parse(validLead)).toMatchObject({
      name: "Ana García",
      phone: "+34 612 345 678",
    });
  });

  it("rejects invalid enums, clinic ids, and field lengths", () => {
    expect(() =>
      leadCreateSchema.parse({ ...validLead, treatment: "blanqueamiento" }),
    ).toThrow();
    expect(() =>
      leadCreateSchema.parse({ ...validLead, clinic_id: "madrid" }),
    ).toThrow();
    expect(() =>
      leadCreateSchema.parse({ ...validLead, name: "A" }),
    ).toThrow();
    expect(() =>
      leadCreateSchema.parse({ ...validLead, phone: "123456" }),
    ).toThrow();
  });

  it("requires the lead id for updates", () => {
    expect(() => leadUpdateSchema.parse(validLead)).toThrow();
    expect(
      leadUpdateSchema.parse({ ...validLead, id: clinicId }).id,
    ).toBe(clinicId);
    expect(
      leadUpdateSchema.parse({
        ...validLead,
        id: clinicId,
        duplicate_of: "22222222-2222-4222-8222-222222222222",
      }).duplicate_of,
    ).toBe("22222222-2222-4222-8222-222222222222");
  });
});
