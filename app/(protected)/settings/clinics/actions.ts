"use server";

import { revalidatePath } from "next/cache";

import { AuthorizationError, requireRole } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ClinicAdminState = {
  success?: boolean;
  message?: string;
};

type ClinicPayloadInput = {
  name: FormDataEntryValue | string | null;
  city: FormDataEntryValue | string | null;
  slug: FormDataEntryValue | string | null;
  color: FormDataEntryValue | string | null;
};

function normalizeText(value: FormDataEntryValue | string | null, fieldLabel: string) {
  const rawValue = typeof value === "string" ? value : "";
  const normalized = rawValue.trim().replace(/\s+/g, " ");

  if (normalized.length === 0) {
    throw new Error(`El campo ${fieldLabel} es obligatorio.`);
  }

  return normalized;
}

function normalizeSlug(value: FormDataEntryValue | string | null) {
  const rawValue = normalizeText(value, "slug");
  const normalized = rawValue
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (normalized.length < 2) {
    throw new Error("El campo slug debe tener al menos dos caracteres válidos.");
  }

  return normalized;
}

function normalizeColor(value: FormDataEntryValue | string | null) {
  const rawValue = normalizeText(value, "color").toUpperCase();

  if (!/^#[0-9A-F]{6}$/.test(rawValue)) {
    throw new Error("El campo color debe ser un valor hexadecimal válido (por ejemplo #3B82F6).");
  }

  return rawValue;
}

export async function normalizeClinicPayload(input: ClinicPayloadInput) {
  return {
    name: normalizeText(input.name, "nombre"),
    city: normalizeText(input.city, "ciudad"),
    slug: normalizeSlug(input.slug),
    color: normalizeColor(input.color),
  };
}

export async function createClinicAction(
  _previousState: ClinicAdminState,
  formData: FormData,
): Promise<ClinicAdminState> {
  try {
    await requireRole("ADMIN");

    const payload = normalizeClinicPayload({
      name: formData.get("name"),
      city: formData.get("city"),
      slug: formData.get("slug"),
      color: formData.get("color"),
    });

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("clinics").insert({
      ...payload,
      active: formData.get("active") === "on",
    });

    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          message: "Ya existe una clínica con ese slug. Prueba con otro identificador.",
        };
      }

      throw error;
    }

    revalidatePath("/settings/clinics");

    return {
      success: true,
      message: "Clínica creada correctamente.",
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, message: error.message };
    }

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return {
      success: false,
      message: "No se pudo crear la clínica. Revisa los datos e inténtalo de nuevo.",
    };
  }
}

export async function toggleClinicStatusAction(formData: FormData) {
  try {
    await requireRole("ADMIN");

    const clinicId = formData.get("clinic_id");
    const active = formData.get("active") === "true";

    if (typeof clinicId !== "string" || clinicId.trim().length === 0) {
      return;
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("clinics").update({ active }).eq("id", clinicId);

    if (error) {
      throw error;
    }

    revalidatePath("/settings/clinics");
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
  }
}
