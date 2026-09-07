import { Bot, ClipboardCheck, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GeneratedMessage({ message }: { message: string }) {
  return (
    <Card className="border-violet-200/80 bg-violet-50/45 shadow-none">
      <CardHeader className="pb-3">
        <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-violet-700 uppercase">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Borrador generado
        </p>
        <CardTitle className="mt-1 flex items-center gap-2 text-base text-violet-950">
          <Bot className="size-4" aria-hidden="true" />
          Mensaje de seguimiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <blockquote className="rounded-xl border border-violet-200/80 bg-white/70 px-4 py-3 text-sm leading-7 whitespace-pre-wrap text-violet-950">
          {message}
        </blockquote>
        <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-violet-800">
          <ClipboardCheck className="size-3.5" aria-hidden="true" />
          Revísalo antes de enviarlo al lead. No se envía automáticamente.
        </p>
      </CardContent>
    </Card>
  );
}
