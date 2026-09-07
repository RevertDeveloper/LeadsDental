import { describe, expect, it } from "vitest";

import {
  FOLLOWUP_SYSTEM_PROMPT,
  buildFollowupPrompt,
} from "@/lib/ai/prompts/followup";

const context = {
  name: "Ana García",
  clinicName: "Vitalis Madrid",
  treatment: "implantes",
  status: "contactado",
  lastInteraction: "La lead pidió que le escribiéramos por WhatsApp.",
  recentNotes: [
    {
      type: "mensaje",
      text: "Prefiere recibir información por la tarde.",
      createdAt: "2026-09-07T12:00:00.000Z",
    },
  ],
};

describe("follow-up prompt contract", () => {
  it("versions a Spanish, commercial-only prompt", () => {
    const prompt = buildFollowupPrompt(context);

    expect(prompt.version).toBe("1.0");
    expect(prompt.instructions).toBe(FOLLOWUP_SYSTEM_PROMPT);
    expect(prompt.instructions).toContain("cercano y profesional");
    expect(prompt.instructions).toContain("No hagas diagnósticos");
    expect(prompt.instructions).toContain("No inventes descuentos");
    expect(prompt.instructions).toContain("No afirmes que existe una cita reservada");
  });

  it("serializes only the approved CRM context", () => {
    const prompt = buildFollowupPrompt(context);

    expect(prompt.input).toContain("Ana García");
    expect(prompt.input).toContain("Vitalis Madrid");
    expect(prompt.input).toContain("Prefiere recibir información por la tarde.");
    expect(prompt.input).not.toContain("phone");
    expect(prompt.input).not.toContain("created_by");
    expect(prompt.input).toContain("<contexto_crm>");
  });
});
