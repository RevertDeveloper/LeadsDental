"use client";

import { CheckCircle2, MapPin, Palette, Power, XCircle } from "lucide-react";

import { toggleClinicStatusAction } from "@/app/(protected)/settings/clinics/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackState } from "@/components/ui/feedback-state";
import type { AuthClinic } from "@/types/auth";

export function ClinicList({ clinics }: { clinics: AuthClinic[] }) {
  if (clinics.length === 0) {
    return (
      <FeedbackState
        variant="empty"
        title="No hay clínicas configuradas"
        description="Todavía no se ha añadido ningún centro al CRM."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {clinics.map((clinic) => (
        <Card key={clinic.id} className="overflow-hidden">
          <div className="h-2" style={{ backgroundColor: clinic.color }} />
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold tracking-[-0.02em]">{clinic.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {clinic.city}
                </p>
              </div>
              <span
                className="grid size-10 place-items-center rounded-2xl border border-white shadow-sm"
                style={{ backgroundColor: `${clinic.color}18`, color: clinic.color }}
                title={`Color corporativo ${clinic.color}`}
              >
                <Palette className="size-4" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 text-xs">
              <span className="font-mono text-muted-foreground">{clinic.color}</span>
              <span className={clinic.active ? "inline-flex items-center gap-1.5 font-semibold text-emerald-700" : "inline-flex items-center gap-1.5 font-semibold text-muted-foreground"}>
                {clinic.active ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : <XCircle className="size-3.5" aria-hidden="true" />}
                {clinic.active ? "Activa" : "Inactiva"}
              </span>
            </div>
            <div className="mt-4">
              <ClinicStatusToggle clinic={clinic} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ClinicStatusToggle({ clinic }: { clinic: AuthClinic }) {
  const isActive = clinic.active;

  return (
    <form action={toggleClinicStatusAction} className="w-full">
      <input type="hidden" name="clinic_id" value={clinic.id} />
      <input type="hidden" name="active" value={String(!isActive)} />
      <Button
        type="submit"
        variant={isActive ? "ghost" : "secondary"}
        size="sm"
        className={isActive ? "w-full justify-center text-muted-foreground hover:text-destructive" : "w-full justify-center"}
      >
        <Power className="size-3.5" aria-hidden="true" />
        {isActive ? "Desactivar" : "Reactivar"}
      </Button>
    </form>
  );
}
