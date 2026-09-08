-- Fase 12: soft-delete autorizado sin romper la política de visibilidad.
-- Un UPDATE que hace que deleted_at deje de ser NULL debe satisfacer también
-- la política SELECT; esta función ejecuta sólo ese cambio como SECURITY DEFINER
-- después de repetir las comprobaciones del actor y de su clínica.

create or replace function public.soft_delete_lead(
  p_lead_id uuid,
  p_actor_user_id uuid
)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  target_lead public.leads;
begin
  if auth.uid() is null
    or p_actor_user_id is null
    or auth.uid() <> p_actor_user_id
    or not public.is_active_user() then
    raise exception using
      errcode = '42501',
      message = 'The authenticated actor cannot soft-delete this lead';
  end if;

  select *
  into target_lead
  from public.leads
  where id = p_lead_id
    and deleted_at is null;

  if not found then
    return null;
  end if;

  if not public.can_access_clinic(target_lead.clinic_id) then
    raise exception using
      errcode = '42501',
      message = 'The authenticated actor cannot access this clinic';
  end if;

  update public.leads
  set deleted_at = now(),
      deleted_by = auth.uid(),
      updated_by = auth.uid()
  where id = p_lead_id
    and deleted_at is null
  returning * into target_lead;

  return target_lead;
end;
$$;

revoke execute on function public.soft_delete_lead(uuid, uuid) from public;
grant execute on function public.soft_delete_lead(uuid, uuid) to authenticated;
