import "server-only";

export const SYSTEM_PROMPT_VERSION = "1.0";

export const FOLLOWUP_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description: "Borrador breve de seguimiento para WhatsApp en español.",
    },
  },
  required: ["message"],
  additionalProperties: false,
} as const;
