"use client";

import { useEffect, useState } from "react";
import { Bot, Check, ClipboardCheck, Send, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GeneratedMessage({ message }: { message: string }) {
  const [draft, setDraft] = useState(message);

  useEffect(() => {
    setDraft(message);
  }, [message]);

  return (
    <Card className="overflow-hidden border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-sky-50 shadow-[0_18px_40px_-28px_rgba(109,92,231,0.45)]">
      <CardHeader className="border-b border-violet-200/70 bg-white/65 px-6 pb-4 pt-5">
        <div className="flex flex-col gap-3">
          <p className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-violet-700 uppercase">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Borrador generado
          </p>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold tracking-[-0.03em] text-violet-950">
            <Bot className="size-5" aria-hidden="true" />
            Mensaje de seguimiento
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-violet-700 uppercase">
            Respuesta preparada
          </span>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label="Mensaje de seguimiento generado por IA"
            className="min-h-[170px] w-full resize-y rounded-2xl border border-violet-200/80 bg-white/85 px-4 py-3 text-base leading-7 text-violet-950 shadow-inner shadow-violet-100/80 outline-none transition-all duration-200 placeholder:text-violet-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-200/60"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-sm text-violet-800">
            <ClipboardCheck className="size-4" aria-hidden="true" />
            Revísalo antes de enviarlo al lead. No se envía automáticamente.
          </p>

          <button
            type="button"
            className={buttonVariants({
              size: "lg",
              className:
                "min-h-11 rounded-2xl bg-gradient-to-r from-primary via-primary to-sky-500 px-4 text-sm font-semibold text-primary-foreground shadow-[0_12px_24px_-12px_rgba(37,99,235,0.9)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgba(37,99,235,1)]",
            })}
          >
            <Send className="size-4" aria-hidden="true" />
            Enviar respuesta
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
