import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { normalizePhone } from "../lib/leads/normalize-phone";

const environmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const seedKey = "vitalis-demo-v1";

const demoLeads = [
  {
    key: "madrid-ana",
    name: "Ana Torres",
    phone: "+34 600 000 101",
    clinic: "madrid",
    treatment: "implantes",
    source: "instagram",
    status: "nuevo",
    note: "Solicito informacion sobre implantes y primera valoracion.",
  },
  {
    key: "madrid-bruno",
    name: "Bruno Vega",
    phone: "600000102",
    clinic: "madrid",
    treatment: "ortodoncia",
    source: "web",
    status: "contactado",
    note: "Se realizo una primera llamada y queda pendiente responder.",
  },
  {
    key: "madrid-clara",
    name: "Clara Ruiz",
    phone: "600000103",
    clinic: "madrid",
    treatment: "estetica",
    source: "llamada",
    status: "cita_agendada",
    note: "Ha confirmado interes y solicita informacion de la cita.",
  },
  {
    key: "madrid-diego",
    name: "Diego Leon",
    phone: "600000104",
    clinic: "madrid",
    treatment: "revision",
    source: "web",
    status: "cliente",
    note: "Seguimiento de una consulta comercial ya convertida.",
  },
  {
    key: "madrid-elena",
    name: "Elena Soto",
    phone: "600000105",
    clinic: "madrid",
    treatment: "implantes",
    source: "instagram",
    status: "no_interesado",
    note: "Prefiere retomar el contacto mas adelante.",
  },
  {
    key: "valencia-alba",
    name: "Alba Marin",
    phone: "+34 600 000 101",
    clinic: "valencia",
    treatment: "implantes",
    source: "web",
    status: "nuevo",
    duplicateOf: "madrid-ana",
    note: "Telefono coincidente con otro lead: revisar antes de contactar.",
  },
  {
    key: "valencia-bruno",
    name: "Bruno Campos",
    phone: "600000202",
    clinic: "valencia",
    treatment: "ortodoncia",
    source: "instagram",
    status: "contactado",
    note: "Se envio informacion inicial y espera respuesta.",
  },
  {
    key: "valencia-carla",
    name: "Carla Navas",
    phone: "600000203",
    clinic: "valencia",
    treatment: "estetica",
    source: "llamada",
    status: "cita_agendada",
    note: "Cita comercial pendiente de confirmacion final.",
  },
  {
    key: "valencia-dario",
    name: "Dario Mena",
    phone: "600000204",
    clinic: "valencia",
    treatment: "revision",
    source: "web",
    status: "cliente",
    note: "Lead convertido despues de la primera consulta.",
  },
  {
    key: "valencia-ines",
    name: "Ines Vidal",
    phone: "600000205",
    clinic: "valencia",
    treatment: "implantes",
    source: "instagram",
    status: "nuevo",
    note: "Pregunta por opciones de implantes.",
  },
  {
    key: "sevilla-adrian",
    name: "Adrian Lara",
    phone: "600000301",
    clinic: "sevilla",
    treatment: "implantes",
    source: "web",
    status: "nuevo",
    note: "Ha dejado sus datos para conocer el tratamiento.",
  },
  {
    key: "sevilla-bea",
    name: "Bea Rios",
    phone: "600000302",
    clinic: "sevilla",
    treatment: "ortodoncia",
    source: "instagram",
    status: "contactado",
    note: "Se intento contacto y queda una llamada pendiente.",
  },
  {
    key: "sevilla-celia",
    name: "Celia Mora",
    phone: "600000303",
    clinic: "sevilla",
    treatment: "estetica",
    source: "llamada",
    status: "cita_agendada",
    note: "Ha solicitado una cita para valorar estetica dental.",
  },
  {
    key: "sevilla-david",
    name: "David Cano",
    phone: "600000304",
    clinic: "sevilla",
    treatment: "revision",
    source: "web",
    status: "cliente",
    note: "Seguimiento de lead convertido.",
  },
  {
    key: "sevilla-eva",
    name: "Eva Soler",
    phone: "600000305",
    clinic: "sevilla",
    treatment: "implantes",
    source: "instagram",
    status: "no_interesado",
    note: "No desea continuar por ahora.",
  },
] as const;

const env = environmentSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

type DemoLead = (typeof demoLeads)[number];

function fail(message: string): never {
  throw new Error(message);
}

async function getClinics() {
  const slugs = [...new Set(demoLeads.map((lead) => lead.clinic))];
  const { data, error } = await supabase
    .from("clinics")
    .select("id, slug")
    .in("slug", slugs);

  if (error) {
    fail(`No se pudieron consultar las clinicas: ${error.message}`);
  }

  const clinics = new Map((data ?? []).map((clinic) => [clinic.slug, clinic.id]));
  const missing = slugs.filter((slug) => !clinics.has(slug));
  if (missing.length > 0) {
    fail(`Faltan clinicas estructurales: ${missing.join(", ")}`);
  }

  return clinics;
}

async function getAdminId() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "ADMIN")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    fail(`No se pudo consultar un perfil ADMIN: ${error.message}`);
  }
  if (!data) {
    fail("No existe un perfil ADMIN activo. Ejecuta primero npm run demo:users.");
  }

  return data.id;
}

async function getExistingLeads() {
  const names = demoLeads.map((lead) => lead.name);
  const { data, error } = await supabase
    .from("leads")
    .select("id, name, phone_normalized, clinic_id")
    .in("name", names);

  if (error) {
    fail(`No se pudieron consultar los leads demo: ${error.message}`);
  }

  return new Map((data ?? []).map((lead) => [lead.name, lead]));
}

async function ensureLead(
  lead: DemoLead,
  clinicId: string,
  adminId: string,
  existingLeads: Awaited<ReturnType<typeof getExistingLeads>>,
) {
  const normalizedPhone = normalizePhone(lead.phone);
  const existing = existingLeads.get(lead.name);

  if (existing) {
    if (
      existing.phone_normalized !== normalizedPhone ||
      existing.clinic_id !== clinicId
    ) {
      fail(`El lead demo ${lead.name} existe con datos incompatibles.`);
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: lead.name,
      phone: lead.phone,
      phone_normalized: normalizedPhone,
      clinic_id: clinicId,
      original_clinic_id: clinicId,
      treatment: lead.treatment,
      source: lead.source,
      status: lead.status,
      created_by: adminId,
      updated_by: adminId,
    })
    .select("id")
    .single();

  if (error || !data) {
    fail(`No se pudo crear el lead demo ${lead.name}: ${error?.message ?? "sin respuesta"}`);
  }

  return data.id;
}

async function ensureDuplicateLinks(leadIds: Map<string, string>) {
  for (const lead of demoLeads) {
    const duplicateOf = "duplicateOf" in lead ? lead.duplicateOf : undefined;
    if (!duplicateOf) {
      continue;
    }

    const targetId = leadIds.get(duplicateOf);
    const duplicateId = leadIds.get(lead.key);
    if (!targetId || !duplicateId) {
      fail(`No se pudo resolver el duplicado demo ${lead.key}.`);
    }

    const { error } = await supabase
      .from("leads")
      .update({ duplicate_of: targetId })
      .eq("id", duplicateId);

    if (error) {
      fail(`No se pudo enlazar el duplicado demo ${lead.key}: ${error.message}`);
    }
  }
}

async function ensureNotes(
  leadIds: Map<string, string>,
  adminId: string,
) {
  const { data, error } = await supabase
    .from("notes")
    .select("metadata")
    .eq("metadata->>seed_key", seedKey);

  if (error) {
    fail(`No se pudieron consultar las notas demo: ${error.message}`);
  }

  const existingKeys = new Set(
    (data ?? [])
      .map((note) => note.metadata as { lead_key?: string })
      .map((metadata) => metadata.lead_key)
      .filter((key): key is string => Boolean(key)),
  );

  const notesToInsert = demoLeads
    .filter((lead) => !existingKeys.has(lead.key))
    .map((lead) => ({
      lead_id: leadIds.get(lead.key) as string,
      text: lead.note,
      type: "llamada" as const,
      created_by: adminId,
      metadata: { seed_key: seedKey, lead_key: lead.key },
    }));

  if (notesToInsert.length === 0) {
    return 0;
  }

  const { error: insertError } = await supabase.from("notes").insert(notesToInsert);
  if (insertError) {
    fail(`No se pudieron crear las notas demo: ${insertError.message}`);
  }

  return notesToInsert.length;
}

async function main() {
  const clinics = await getClinics();
  const adminId = await getAdminId();
  const existingLeads = await getExistingLeads();
  const leadIds = new Map<string, string>();
  let createdLeads = 0;

  for (const lead of demoLeads) {
    const leadId = await ensureLead(
      lead,
      clinics.get(lead.clinic) as string,
      adminId,
      existingLeads,
    );
    leadIds.set(lead.key, leadId);
    if (!existingLeads.has(lead.name)) {
      createdLeads += 1;
    }
  }

  await ensureDuplicateLinks(leadIds);
  const createdNotes = await ensureNotes(leadIds, adminId);

  console.log(
    `Dataset demo preparado: ${createdLeads} leads nuevos y ${createdNotes} notas nuevas.`,
  );
  console.log("Incluye 15 leads demo, cinco por clinica, y un duplicado intencionado.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Error al preparar los datos demo.");
  process.exitCode = 1;
});