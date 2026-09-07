import { Bot, MessageCircle, PhoneCall, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NoteRecord } from "@/types/notes";

const presentation = {
  llamada: {
    label: "Llamada",
    Icon: PhoneCall,
    className: "border-blue-200 bg-blue-50 text-blue-700",
    markerClassName: "bg-blue-500 ring-blue-100",
  },
  mensaje: {
    label: "Mensaje",
    Icon: MessageCircle,
    className: "border-sky-200 bg-sky-50 text-sky-700",
    markerClassName: "bg-sky-500 ring-sky-100",
  },
  mensaje_generado_ia: {
    label: "Mensaje generado por IA",
    Icon: Sparkles,
    className: "border-violet-200 bg-violet-50 text-violet-700",
    markerClassName: "bg-violet-500 ring-violet-100",
  },
} as const;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function NoteItem({ note }: { note: NoteRecord }) {
  const notePresentation = presentation[note.type];
  const Icon = notePresentation.Icon;
  const isAiNote = note.type === "mensaje_generado_ia";

  return (
    <article className="relative pl-11 sm:pl-14">
      <span
        className={cn(
          "absolute left-0 top-1 grid size-8 place-items-center rounded-full text-white ring-4",
          notePresentation.markerClassName,
        )}
        aria-hidden="true"
      >
        <Icon className="size-3.5" />
      </span>
      <div
        className={cn(
          "rounded-2xl border bg-card p-4 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.5)] sm:p-5",
          isAiNote ? "border-violet-200/90 bg-violet-50/35" : "border-border",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className={notePresentation.className}>
            {isAiNote ? <Bot className="size-3.5" aria-hidden="true" /> : null}
            {notePresentation.label}
          </Badge>
          <time
            dateTime={note.created_at}
            className="text-xs font-medium text-muted-foreground"
          >
            {formatDate(note.created_at)}
          </time>
        </div>
        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-foreground">
          {note.text}
        </p>
      </div>
    </article>
  );
}
