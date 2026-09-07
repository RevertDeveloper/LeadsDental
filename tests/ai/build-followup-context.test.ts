import { describe, expect, it } from "vitest";

import {
  buildFollowupContext,
  MAX_FOLLOWUP_NOTE_LENGTH,
  MAX_FOLLOWUP_NOTES,
} from "@/lib/ai/build-followup-context";

const lead = {
  name: "Ana García",
  treatment: "implantes" as const,
  status: "contactado" as const,
  clinic: { name: "Vitalis Madrid" },
};

function note(index: number, createdAt: string) {
  return {
    id: `${index}`,
    lead_id: "22222222-2222-4222-8222-222222222222",
    type: "mensaje" as const,
    text: `Nota ${index}`,
    created_at: createdAt,
    created_by: null,
    metadata: {},
  };
}

describe("buildFollowupContext", () => {
  it("keeps only approved lead fields and recent notes", () => {
    const result = buildFollowupContext(lead, [
      note(1, "2026-09-01T12:00:00.000Z"),
      note(2, "2026-09-03T12:00:00.000Z"),
      note(3, "2026-09-02T12:00:00.000Z"),
      note(4, "2026-09-04T12:00:00.000Z"),
    ]);

    expect(result).toEqual({
      name: "Ana García",
      clinicName: "Vitalis Madrid",
      treatment: "implantes",
      status: "contactado",
      lastInteraction: "Nota 4",
      recentNotes: [
        { type: "mensaje", text: "Nota 4", createdAt: "2026-09-04T12:00:00.000Z" },
        { type: "mensaje", text: "Nota 2", createdAt: "2026-09-03T12:00:00.000Z" },
        { type: "mensaje", text: "Nota 3", createdAt: "2026-09-02T12:00:00.000Z" },
      ],
    });
    expect(result.recentNotes).toHaveLength(MAX_FOLLOWUP_NOTES);
    expect(result).not.toHaveProperty("phone");
    expect(result).not.toHaveProperty("id");
  });

  it("trims and bounds note content, with no interaction fallback", () => {
    const result = buildFollowupContext(lead, [
      {
        ...note(1, "2026-09-01T12:00:00.000Z"),
        text: `  ${"x".repeat(MAX_FOLLOWUP_NOTE_LENGTH + 50)}  `,
      },
      { ...note(2, "2026-09-02T12:00:00.000Z"), text: "   " },
    ]);

    expect(result.lastInteraction).toHaveLength(MAX_FOLLOWUP_NOTE_LENGTH);
    expect(result.recentNotes).toHaveLength(1);
    expect(buildFollowupContext(lead, []).lastInteraction).toBeNull();
  });
});
