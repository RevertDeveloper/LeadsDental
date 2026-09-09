"use client";

import { useActionState, useState } from "react";
import { Check } from "lucide-react";

import { createClinicAction, type ClinicAdminState } from "@/app/(protected)/settings/clinics/actions";
import { CLINIC_COLOR_PALETTE } from "@/lib/clinics/colors";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";

const initialState: ClinicAdminState = {};

export function CreateClinicForm() {
  const [state, formAction, pending] = useActionState(createClinicAction, initialState);
  const [selectedColor, setSelectedColor] = useState(CLINIC_COLOR_PALETTE[0]);

  return (
    <form action={formAction} className="grid gap-5 p-6 lg:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium">
        Nombre de la clínica
        <input
          name="name"
          required
          maxLength={120}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Ciudad
        <input
          name="city"
          required
          maxLength={120}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Slug
        <input
          name="slug"
          required
          maxLength={80}
          placeholder="ej. clinica-vitalis"
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </label>

      <div className="grid gap-2 text-sm font-medium">
        <span>Color</span>
        <div className="flex flex-wrap gap-2 rounded-xl border border-input bg-background p-2">
          {CLINIC_COLOR_PALETTE.map((color) => {
            const isSelected = selectedColor === color;

            return (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                aria-label={`Seleccionar color ${color}`}
                className={`flex size-8 items-center justify-center rounded-full border-2 transition-all ${
                  isSelected ? "scale-110 border-foreground shadow-sm" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              >
                {isSelected ? <Check className="size-3.5 text-white" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="color" value={selectedColor} />
        <span className="text-xs text-muted-foreground">Color seleccionado: {selectedColor}</span>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium">
        <input type="checkbox" name="active" defaultChecked className="accent-primary" />
        Activar clínica al crearla
      </label>

      <div className="flex items-center gap-4 lg:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creando clínica…" : "Crear clínica"}
        </Button>
      </div>

      {state.message ? (
        <ActionFeedback
          variant={state.success ? "success" : "error"}
          className="lg:col-span-2"
        >
          {state.message}
        </ActionFeedback>
      ) : null}
    </form>
  );
}
