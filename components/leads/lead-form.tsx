"use client";

import { useActionState, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AuthClinic } from "@/types/auth";
import type { LeadFormState } from "@/lib/leads/form-state";
import {
  leadSourceSchema,
  leadStatusSchema,
  treatmentSchema,
} from "@/lib/validation/lead-schemas";
import type { LeadWithClinic } from "@/types/leads";

type LeadFormAction = (
  previousState: LeadFormState,
  formData: FormData,
) => Promise<LeadFormState>;

type LeadFormProps = {
  action: LeadFormAction;
  clinics: AuthClinic[];
  lead?: LeadWithClinic;
};

const labels = {
  status: {
    nuevo: "Nuevo",
    contactado: "Contactado",
    cita_agendada: "Cita agendada",
    no_interesado: "No interesado",
    cliente: "Cliente",
  },
  treatment: {
    implantes: "Implantes",
    ortodoncia: "Ortodoncia",
    estetica: "Estética dental",
    revision: "Revisión",
  },
  source: {
    instagram: "Instagram",
    web: "Web",
    llamada: "Llamada",
  },
} as const;

export function LeadForm({ action, clinics, lead }: LeadFormProps) {
  const [state, formAction, pending] = useActionState<LeadFormState, FormData>(
    action,
    {},
  );
  const [duplicateId, setDuplicateId] = useState(lead?.duplicate_of ?? "");
  const [duplicateSelectionError, setDuplicateSelectionError] = useState(false);
  const fieldErrors = state.fieldErrors ?? {};
  const hasDuplicates = Boolean(state.duplicates?.length);
  const initial = {
    name: lead?.name ?? "",
    phone: lead?.phone ?? "",
    clinic_id: lead?.clinic_id ?? clinics[0]?.id ?? "",
    treatment: lead?.treatment ?? "",
    source: lead?.source ?? "",
    status: lead?.status ?? "nuevo",
  };

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (hasDuplicates && !duplicateId) {
          event.preventDefault();
          setDuplicateSelectionError(true);
        }
      }}
      className="space-y-6"
    >
      {lead ? <input type="hidden" name="id" value={lead.id} /> : null}
      <input type="hidden" name="duplicate_of" value={duplicateId} />

      <Card>
        <CardHeader>
          <CardTitle>{lead ? "Datos del lead" : "Nuevo lead"}</CardTitle>
          <CardDescription>
            Añade la información mínima para que el equipo pueda continuar el seguimiento.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field
            id="name"
            name="name"
            label="Nombre completo"
            defaultValue={initial.name}
            error={fieldErrors.name}
            placeholder="Ej. Ana García"
            required
          />
          <Field
            id="phone"
            name="phone"
            label="Teléfono"
            type="tel"
            defaultValue={initial.phone}
            error={fieldErrors.phone}
            placeholder="Ej. +34 612 345 678"
            required
          />
          <SelectField
            id="clinic_id"
            name="clinic_id"
            label="Clínica"
            defaultValue={initial.clinic_id}
            error={fieldErrors.clinic_id}
            required
          >
            <option value="" disabled>
              Selecciona una clínica
            </option>
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="treatment"
            name="treatment"
            label="Tratamiento de interés"
            defaultValue={initial.treatment}
            error={fieldErrors.treatment}
            required
          >
            <option value="" disabled>
              Selecciona un tratamiento
            </option>
            {treatmentSchema.options.map((treatment) => (
              <option key={treatment} value={treatment}>
                {labels.treatment[treatment]}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="source"
            name="source"
            label="Fuente del lead"
            defaultValue={initial.source}
            error={fieldErrors.source}
            required
          >
            <option value="" disabled>
              Selecciona una fuente
            </option>
            {leadSourceSchema.options.map((source) => (
              <option key={source} value={source}>
                {labels.source[source]}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="status"
            name="status"
            label="Estado"
            defaultValue={initial.status}
            error={fieldErrors.status}
            required
          >
            {leadStatusSchema.options.map((status) => (
              <option key={status} value={status}>
                {labels.status[status]}
              </option>
            ))}
          </SelectField>
        </CardContent>
      </Card>

      {hasDuplicates ? (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-950">Posible duplicado</CardTitle>
            <CardDescription className="text-amber-900/75">
              Hemos encontrado leads con el mismo teléfono. Selecciona el registro relacionado
              si quieres continuar; no se fusionará ningún dato automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.duplicates?.map((duplicate) => {
              const clinic = clinics.find((candidate) => candidate.id === duplicate.clinic_id);
              const selected = duplicateId === duplicate.id;

              return (
                <button
                  key={duplicate.id}
                  type="button"
                  onClick={() => {
                    setDuplicateId(duplicate.id);
                    setDuplicateSelectionError(false);
                  }}
                  className={`flex w-full items-center justify-between gap-4 rounded-xl border p-3 text-left transition ${selected ? "border-amber-500 bg-white shadow-sm" : "border-amber-200 bg-white/70 hover:border-amber-400"}`}
                  aria-pressed={selected}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-amber-950">
                      {duplicate.name}
                    </span>
                    <span className="mt-1 block text-xs text-amber-900/70">
                      {duplicate.phone} · {clinic?.name ?? "Otra clínica"}
                    </span>
                  </span>
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${selected ? "border-amber-600 bg-amber-600" : "border-amber-300"}`}
                    aria-hidden="true"
                  >
                    {selected ? <span className="size-2 rounded-full bg-white" /> : null}
                  </span>
                </button>
              );
            })}
            {duplicateSelectionError ? (
              <p className="text-sm font-medium text-amber-900" role="alert">
                Selecciona el posible duplicado para continuar.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {state.message && !hasDuplicates ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <a href="/leads" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Cancelar
        </a>
        <button
          type="submit"
          disabled={pending || clinics.length === 0}
          className={buttonVariants({ size: "lg" })}
        >
          {pending ? "Guardando…" : lead ? "Guardar cambios" : "Crear lead"}
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  defaultValue,
  error,
  placeholder,
  required,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  defaultValue: string;
  error?: string[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error?.length)}
        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground/65 focus:border-primary focus:ring-3 focus:ring-ring/30 aria-invalid:border-red-400 aria-invalid:ring-3 aria-invalid:ring-red-200"
      />
      <FieldError messages={error} />
    </label>
  );
}

function SelectField({
  id,
  name,
  label,
  defaultValue,
  error,
  required,
  children,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  error?: string[];
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={Boolean(error?.length)}
        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-ring/30 aria-invalid:border-red-400 aria-invalid:ring-3 aria-invalid:ring-red-200"
      >
        {children}
      </select>
      <FieldError messages={error} />
    </label>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.length ? (
    <span className="mt-1.5 block text-xs font-medium text-red-700">{messages[0]}</span>
  ) : null;
}
