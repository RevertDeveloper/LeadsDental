import { describe, expect, it } from "vitest";

import { requiresAttention } from "@/lib/leads/priority";

describe("requiresAttention", () => {
  it("prioritizes new implant leads", () => {
    expect(
      requiresAttention({ treatment: "implantes", status: "nuevo" }),
    ).toBe(true);
  });

  it.each([
    { treatment: "implantes", status: "contactado" },
    { treatment: "ortodoncia", status: "nuevo" },
    { treatment: "estetica", status: "cita_agendada" },
    { treatment: "revision", status: "cliente" },
  ] as const)("does not prioritize $treatment + $status", (lead) => {
    expect(requiresAttention(lead)).toBe(false);
  });
});
