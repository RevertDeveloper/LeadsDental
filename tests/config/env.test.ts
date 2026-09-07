import { describe, expect, it } from "vitest";

import { getPublicEnv } from "@/lib/config/env";
import { getServerEnv } from "@/lib/config/server-env";

const publicValues = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

describe("environment contract", () => {
  it("accepts the public contract without reading server secrets", () => {
    expect(getPublicEnv(publicValues)).toEqual(publicValues);
  });

  it("applies the default model to a complete server contract", () => {
    expect(
      getServerEnv({
        ...publicValues,
        SUPABASE_SERVICE_ROLE_KEY: "server-role-key",
        OPENAI_API_KEY: "openai-key",
      }),
    ).toMatchObject({ OPENAI_MODEL: "gpt-5.6-luna" });
  });

  it("rejects an incomplete server contract", () => {
    expect(() => getServerEnv(publicValues)).toThrow();
  });
});
