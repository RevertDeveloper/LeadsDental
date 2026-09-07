-- Fase 1: autorización de datos en PostgreSQL.
-- Las funciones SECURITY DEFINER sólo consultan el estado de autorización;
-- las operaciones siguen pasando por RLS.

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and active = true
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and active = true
      and role = 'ADMIN'::public.user_role
  );
$$;

create or replace function public.can_access_clinic(target_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.user_clinics uc
      join public.profiles p on p.id = uc.user_id
      where uc.user_id = auth.uid()
        and uc.clinic_id = target_clinic_id
        and p.active = true
    );
$$;

grant execute on function public.is_active_user() to authenticated, service_role;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.can_access_clinic(uuid) to authenticated, service_role;

alter table public.clinics enable row level security;
alter table public.profiles enable row level security;
alter table public.user_clinics enable row level security;
alter table public.leads enable row level security;
alter table public.notes enable row level security;
alter table public.audit_log enable row level security;

create policy clinics_select_allowed
on public.clinics for select
using (public.is_admin() or public.can_access_clinic(id));

create policy clinics_insert_admin
on public.clinics for insert
with check (public.is_admin());

create policy clinics_update_admin
on public.clinics for update
using (public.is_admin())
with check (public.is_admin());

create policy clinics_no_delete
on public.clinics for delete
using (false);

create policy profiles_select_self_or_admin
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy profiles_insert_admin
on public.profiles for insert
with check (public.is_admin());

create policy profiles_update_admin
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

create policy profiles_no_delete
on public.profiles for delete
using (false);

create policy user_clinics_select_self_or_admin
on public.user_clinics for select
using (user_id = auth.uid() or public.is_admin());

create policy user_clinics_insert_admin
on public.user_clinics for insert
with check (public.is_admin());

create policy user_clinics_no_update
on public.user_clinics for update
using (false);

create policy user_clinics_no_delete
on public.user_clinics for delete
using (false);

create policy leads_select_allowed
on public.leads for select
using (
  deleted_at is null
  and (public.is_admin() or public.can_access_clinic(clinic_id))
);

create policy leads_insert_allowed
on public.leads for insert
with check (
  public.is_active_user()
  and created_by = auth.uid()
  and public.can_access_clinic(clinic_id)
  and (original_clinic_id is null or public.can_access_clinic(original_clinic_id))
);

create policy leads_update_allowed
on public.leads for update
using (
  deleted_at is null
  and (public.is_admin() or public.can_access_clinic(clinic_id))
)
with check (
  public.is_active_user()
  and (public.is_admin() or public.can_access_clinic(clinic_id))
  and (
    deleted_at is null
    or deleted_by = auth.uid()
  )
);

create policy leads_no_physical_delete
on public.leads for delete
using (false);

create policy notes_select_allowed
on public.notes for select
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_id
      and l.deleted_at is null
      and (public.is_admin() or public.can_access_clinic(l.clinic_id))
  )
);

create policy notes_insert_allowed
on public.notes for insert
with check (
  public.is_active_user()
  and created_by = auth.uid()
  and exists (
    select 1
    from public.leads l
    where l.id = lead_id
      and l.deleted_at is null
      and (public.is_admin() or public.can_access_clinic(l.clinic_id))
  )
);

create policy notes_no_update
on public.notes for update
using (false);

create policy notes_no_delete
on public.notes for delete
using (false);

create policy audit_log_select_admin
on public.audit_log for select
using (public.is_admin());

create policy audit_log_insert_active_actor
on public.audit_log for insert
with check (
  public.is_active_user()
  and actor_user_id = auth.uid()
);

create policy audit_log_no_update
on public.audit_log for update
using (false);

create policy audit_log_no_delete
on public.audit_log for delete
using (false);
