-- Fase 1: modelo de datos base del CRM de Clínica Dental Vitalis.
-- La autenticación sigue siendo responsabilidad de Supabase Auth.

create extension if not exists pgcrypto;

create type public.user_role as enum (
  'ADMIN',
  'CLINIC_MANAGER',
  'RECEPTIONIST'
);

create type public.treatment as enum (
  'implantes',
  'ortodoncia',
  'estetica',
  'revision'
);

create type public.lead_source as enum (
  'instagram',
  'web',
  'llamada'
);

create type public.lead_status as enum (
  'nuevo',
  'contactado',
  'cita_agendada',
  'no_interesado',
  'cliente'
);

create type public.note_type as enum (
  'llamada',
  'mensaje',
  'mensaje_generado_ia'
);

create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  slug text not null unique,
  color text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clinics_color_hex check (color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint clinics_slug_not_blank check (length(trim(slug)) > 0)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'RECEPTIONIST',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_not_blank check (length(trim(full_name)) > 0)
);

create table public.user_clinics (
  user_id uuid not null references public.profiles(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (user_id, clinic_id)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  phone_normalized text not null,
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  original_clinic_id uuid references public.clinics(id) on delete restrict,
  treatment public.treatment not null,
  source public.lead_source not null,
  status public.lead_status not null default 'nuevo',
  duplicate_of uuid references public.leads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  constraint leads_name_not_blank check (length(trim(name)) > 0),
  constraint leads_phone_not_blank check (length(trim(phone)) > 0),
  constraint leads_phone_normalized_not_blank check (length(trim(phone_normalized)) > 0),
  constraint leads_duplicate_not_self check (duplicate_of is null or duplicate_of <> id),
  constraint leads_deleted_metadata check ((deleted_at is null) = (deleted_by is null))
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete restrict,
  text text not null,
  type public.note_type not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  constraint notes_text_not_blank check (length(trim(text)) > 0),
  constraint notes_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  old_values jsonb not null default '{}'::jsonb,
  new_values jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_action_not_blank check (length(trim(action)) > 0),
  constraint audit_entity_type_not_blank check (length(trim(entity_type)) > 0),
  constraint audit_old_values_object check (jsonb_typeof(old_values) = 'object'),
  constraint audit_new_values_object check (jsonb_typeof(new_values) = 'object'),
  constraint audit_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index leads_clinic_id_idx on public.leads (clinic_id);
create index leads_status_idx on public.leads (status);
create index leads_treatment_idx on public.leads (treatment);
create index leads_source_idx on public.leads (source);
create index leads_phone_normalized_idx on public.leads (phone_normalized);
create index leads_created_at_idx on public.leads (created_at desc);
create index leads_active_clinic_idx on public.leads (clinic_id) where deleted_at is null;
create index notes_lead_id_idx on public.notes (lead_id);
create index user_clinics_user_id_idx on public.user_clinics (user_id);
create index user_clinics_clinic_id_idx on public.user_clinics (clinic_id);
create index audit_log_entity_idx on public.audit_log (entity_type, entity_id, created_at desc);
create index audit_log_created_at_idx on public.audit_log (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clinics_set_updated_at
before update on public.clinics
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create or replace function public.prevent_lead_hard_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception using
    errcode = '42501',
    message = 'Leads are soft-deleted and cannot be physically deleted';
end;
$$;

create trigger leads_prevent_hard_delete
before delete on public.leads
for each row execute function public.prevent_lead_hard_delete();

create or replace function public.prevent_note_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception using
    errcode = '42501',
    message = 'Notes are append-only and cannot be modified or deleted';
end;
$$;

create trigger notes_prevent_update
before update on public.notes
for each row execute function public.prevent_note_mutation();

create trigger notes_prevent_delete
before delete on public.notes
for each row execute function public.prevent_note_mutation();
