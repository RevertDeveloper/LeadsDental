import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const environmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DEMO_USER_PASSWORD: z.string().min(12),
});

const demoUsers = [
  {
    email: "admin@vitalis.demo",
    fullName: "Administración Vitalis",
    role: "ADMIN" as const,
    clinics: ["madrid", "valencia", "sevilla"],
  },
  {
    email: "manager@vitalis.demo",
    fullName: "Manager Vitalis",
    role: "CLINIC_MANAGER" as const,
    clinics: ["madrid", "valencia"],
  },
  {
    email: "recepcion@vitalis.demo",
    fullName: "Recepción Vitalis",
    role: "RECEPTIONIST" as const,
    clinics: ["madrid"],
  },
];

const env = environmentSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DEMO_USER_PASSWORD: process.env.DEMO_USER_PASSWORD,
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

async function getExistingUsers() {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(`No se pudieron consultar los usuarios demo: ${error.message}`);
  }

  return data.users;
}

async function ensureAuthUser(
  existingUsers: Awaited<ReturnType<typeof getExistingUsers>>,
  email: string,
) {
  const existingUser = existingUsers.find((user) => user.email === email);

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password: env.DEMO_USER_PASSWORD,
        email_confirm: true,
      },
    );

    if (error || !data.user) {
      throw new Error(`No se pudo actualizar ${email}.`);
    }

    return data.user.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: env.DEMO_USER_PASSWORD,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(`No se pudo crear ${email}.`);
  }

  return data.user.id;
}

async function getClinicIds() {
  const slugs = demoUsers.flatMap((user) => user.clinics);
  const { data, error } = await supabase
    .from("clinics")
    .select("id, slug")
    .in("slug", slugs);

  if (error) {
    throw new Error(`No se pudieron consultar las clínicas: ${error.message}`);
  }

  const clinics = new Map(
    (data ?? []).map((clinic) => [clinic.slug, clinic.id]),
  );
  const missingSlugs = [...new Set(slugs)].filter((slug) => !clinics.has(slug));

  if (missingSlugs.length > 0) {
    throw new Error(
      `Faltan clínicas estructurales. Ejecuta primero supabase/seed.sql: ${missingSlugs.join(", ")}`,
    );
  }

  return clinics;
}

async function provisionProfileAndClinics(
  userId: string,
  user: (typeof demoUsers)[number],
  clinicIds: Map<string, string>,
) {
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: user.fullName,
    role: user.role,
    active: true,
  });

  if (profileError) {
    throw new Error(`No se pudo guardar el perfil de ${user.email}.`);
  }

  const { error: deleteError } = await supabase
    .from("user_clinics")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(`No se pudieron actualizar las clínicas de ${user.email}.`);
  }

  const assignments = user.clinics.map((slug) => ({
    user_id: userId,
    clinic_id: clinicIds.get(slug) as string,
  }));
  const { error: assignmentError } = await supabase
    .from("user_clinics")
    .insert(assignments);

  if (assignmentError) {
    throw new Error(`No se pudieron asignar clínicas a ${user.email}.`);
  }
}

async function main() {
  const existingUsers = await getExistingUsers();
  const clinicIds = await getClinicIds();

  for (const user of demoUsers) {
    const userId = await ensureAuthUser(existingUsers, user.email);
    await provisionProfileAndClinics(userId, user, clinicIds);
    console.log(`Usuario demo preparado: ${user.email} (${user.role})`);
  }

  console.log("Provisionamiento demo completado. La contraseña no se ha mostrado ni almacenado.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Error de provisionamiento demo.");
  process.exitCode = 1;
});
