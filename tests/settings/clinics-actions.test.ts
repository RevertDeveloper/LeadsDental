import { describe, expect, it } from "vitest";

import { normalizeClinicPayload } from "@/app/(protected)/settings/clinics/actions";

describe("normalizeClinicPayload", () => {
  it("normalizes and trims the clinic payload", async () => {
    await expect(
      normalizeClinicPayload({
        name: "  Clínica Dental Vitalis  ",
        city: "  Valencia  ",
        slug: "  clinica-dental-vitalis  ",
        color: "#ff0000",
      }),
    ).resolves.toEqual({
      name: "Clínica Dental Vitalis",
      city: "Valencia",
      slug: "clinica-dental-vitalis",
      color: "#FF0000",
    });
  });

  it("rejects invalid hex colors", async () => {
    await expect(
      normalizeClinicPayload({
        name: "Clínica A",
        city: "Madrid",
        slug: "clinica-a",
        color: "blue",
      }),
    ).rejects.toThrow("color");
  });
});
