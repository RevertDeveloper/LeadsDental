import { z } from "zod";

export const userRoleSchema = z.enum([
  "ADMIN",
  "CLINIC_MANAGER",
  "RECEPTIONIST",
]);

export type UserRole = z.infer<typeof userRoleSchema>;

export const clinicIdSchema = z.string().uuid();

export type AuthClinic = {
  id: string;
  name: string;
  city: string;
  slug: string;
  color: string;
  active: boolean;
};

export type CurrentUser = {
  id: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  active: true;
  clinics: AuthClinic[];
};
