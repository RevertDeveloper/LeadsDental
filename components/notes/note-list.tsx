import { Activity } from "lucide-react";

import { NoteItem } from "@/components/notes/note-item";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NoteRecord } from "@/types/notes";

export function NoteList({ notes }: { notes: NoteRecord[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">
            Seguimiento
          </p>
          <CardTitle className="mt-2 flex items-center gap-2 text-lg">
            <Activity className="size-5 text-primary" aria-hidden="true" />
            Actividad del lead
          </CardTitle>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {notes.length} {notes.length === 1 ? "registro" : "registros"}
        </span>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <FeedbackState
            variant="empty"
            title="Todavía no hay actividad"
            description="Añade la primera llamada o mensaje para que el equipo tenga el contexto completo."
            className="min-h-40 bg-muted/20"
          />
        ) : (
          <div className="relative space-y-5 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-px before:bg-border sm:before:left-5">
            {notes.map((note) => (
              <NoteItem key={note.id} note={note} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
