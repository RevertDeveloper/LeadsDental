-- Smoke test SQL para Supabase/PostgreSQL.
-- Ejecutar con un rol capaz de preparar datos de test, por ejemplo:
-- psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.sql
-- Todo se revierte al terminar.

begin;

create temporary table rls_test_ids (
  admin_id uuid not null,
  manager_id uuid not null,
  receptionist_id uuid not null,
  madrid_id uuid not null,
  valencia_id uuid not null,
  sevilla_id uuid not null
);

insert into rls_test_ids
select
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid,
  (select id from public.clinics where slug = 'madrid'),
  (select id from public.clinics where slug = 'valencia'),
  (select id from public.clinics where slug = 'sevilla');

grant select on rls_test_ids to authenticated;

insert into auth.users (id)
select admin_id from rls_test_ids
on conflict (id) do nothing;

insert into auth.users (id)
select manager_id from rls_test_ids
on conflict (id) do nothing;

insert into auth.users (id)
select receptionist_id from rls_test_ids
on conflict (id) do nothing;

insert into public.profiles (id, full_name, role)
select admin_id, 'RLS Test Admin', 'ADMIN'::public.user_role from rls_test_ids
on conflict (id) do update set role = excluded.role, active = true;

insert into public.profiles (id, full_name, role)
select manager_id, 'RLS Test Manager', 'CLINIC_MANAGER'::public.user_role from rls_test_ids
on conflict (id) do update set role = excluded.role, active = true;

insert into public.profiles (id, full_name, role)
select receptionist_id, 'RLS Test Receptionist', 'RECEPTIONIST'::public.user_role from rls_test_ids
on conflict (id) do update set role = excluded.role, active = true;

insert into public.user_clinics (user_id, clinic_id)
select manager_id, madrid_id from rls_test_ids
on conflict do nothing;

insert into public.user_clinics (user_id, clinic_id)
select manager_id, valencia_id from rls_test_ids
on conflict do nothing;

insert into public.user_clinics (user_id, clinic_id)
select receptionist_id, madrid_id from rls_test_ids
on conflict do nothing;

insert into public.leads (
  id, name, phone, phone_normalized, clinic_id, original_clinic_id,
  treatment, source, status, created_by, updated_by
)
select
  '00000000-0000-0000-0001-000000000001'::uuid,
  'RLS Madrid', '+34 600 000 001', '34600000001', madrid_id, madrid_id,
  'implantes', 'web', 'nuevo', admin_id, admin_id
from rls_test_ids
on conflict (id) do nothing;

insert into public.leads (
  id, name, phone, phone_normalized, clinic_id, original_clinic_id,
  treatment, source, status, created_by, updated_by
)
select
  '00000000-0000-0000-0001-000000000002'::uuid,
  'RLS Valencia', '+34 600 000 002', '34600000002', valencia_id, valencia_id,
  'ortodoncia', 'instagram', 'contactado', admin_id, admin_id
from rls_test_ids
on conflict (id) do nothing;

insert into public.leads (
  id, name, phone, phone_normalized, clinic_id, original_clinic_id,
  treatment, source, status, created_by, updated_by
)
select
  '00000000-0000-0000-0001-000000000003'::uuid,
  'RLS Sevilla', '+34 600 000 003', '34600000003', sevilla_id, sevilla_id,
  'revision', 'llamada', 'nuevo', admin_id, admin_id
from rls_test_ids
on conflict (id) do nothing;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.clinics, public.leads, public.notes to authenticated;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  (select admin_id::text from rls_test_ids),
  true
);

do $$
begin
  if (select count(*) from public.leads) <> 3 then
    raise exception 'ADMIN should see all three clinic leads';
  end if;
  if (select count(*) from public.clinics) <> 3 then
    raise exception 'ADMIN should see all three clinics';
  end if;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  (select manager_id::text from rls_test_ids),
  true
);

do $$
begin
  if (select count(*) from public.leads) <> 2 then
    raise exception 'MANAGER should see only assigned clinic leads';
  end if;
  if (select count(*) from public.clinics) <> 2 then
    raise exception 'MANAGER should see only assigned clinics';
  end if;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  (select receptionist_id::text from rls_test_ids),
  true
);

do $$
begin
  if (select count(*) from public.leads) <> 1 then
    raise exception 'RECEPTIONIST should see only their clinic leads';
  end if;
  if (select count(*) from public.clinics) <> 1 then
    raise exception 'RECEPTIONIST should see only their clinic';
  end if;
end;
$$;

set local role postgres;

update public.leads
set deleted_at = now(), deleted_by = (select admin_id from rls_test_ids)
where id = '00000000-0000-0000-0001-000000000001';

insert into public.notes (lead_id, text, type, created_by)
select
  '00000000-0000-0000-0001-000000000002'::uuid,
  'RLS append-only note',
  'llamada',
  admin_id
from rls_test_ids;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  (select admin_id::text from rls_test_ids),
  true
);

do $$
begin
  if (select count(*) from public.leads) <> 2 then
    raise exception 'Soft-deleted leads must be hidden from normal queries';
  end if;
end;
$$;

do $$
begin
  delete from public.leads
  where id = '00000000-0000-0000-0001-000000000002'::uuid;
  if found then
    raise exception 'RLS must block physical lead deletion';
  end if;
end;
$$;

set local role postgres;

do $$
begin
  begin
    delete from public.leads
    where id = '00000000-0000-0000-0001-000000000002'::uuid;
    raise exception 'Lead hard-delete trigger did not fire';
  exception
    when sqlstate '42501' then null;
  end;

  begin
    update public.notes set text = 'mutated' where text = 'RLS append-only note';
    raise exception 'Note update trigger did not fire';
  exception
    when sqlstate '42501' then null;
  end;

  begin
    delete from public.notes where text = 'RLS append-only note';
    raise exception 'Note delete trigger did not fire';
  exception
    when sqlstate '42501' then null;
  end;
end;
$$;

rollback;
