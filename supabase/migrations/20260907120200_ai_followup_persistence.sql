-- Fase 8: persiste la nota IA y su auditoría de generación en una única
-- operación transaccional invocada por el cliente autenticado.

create or replace function public.persist_ai_followup(
  p_lead_id uuid,
  p_text text,
  p_metadata jsonb,
  p_request_id uuid,
  p_actor_user_id uuid
)
returns public.notes
language plpgsql
security invoker
set search_path = public
as $$
declare
  inserted_note public.notes;
begin
  if auth.uid() is null or auth.uid() <> p_actor_user_id then
    raise exception using
      errcode = '42501',
      message = 'The authenticated actor does not match the requested actor';
  end if;

  if jsonb_typeof(p_metadata) <> 'object'
    or p_metadata->>'request_id' <> p_request_id::text
    or p_metadata->>'model' is null
    or p_metadata->>'prompt_version' is null
    or p_metadata->>'generated_at' is null
    or p_metadata->>'latency_ms' is null then
    raise exception using
      errcode = '22023',
      message = 'AI follow-up metadata is incomplete';
  end if;

  insert into public.notes (
    lead_id,
    text,
    type,
    created_by,
    metadata
  ) values (
    p_lead_id,
    p_text,
    'mensaje_generado_ia'::public.note_type,
    auth.uid(),
    p_metadata
  )
  returning * into inserted_note;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    new_values,
    metadata
  ) values (
    auth.uid(),
    'AI_FOLLOWUP_GENERATED',
    'ai_followup',
    p_lead_id,
    jsonb_build_object('note_id', inserted_note.id),
    jsonb_build_object(
      'request_id', p_request_id,
      'model', p_metadata->>'model',
      'prompt_version', p_metadata->>'prompt_version',
      'latency_ms', (p_metadata->>'latency_ms')::integer,
      'source', 'crm'
    )
  );

  return inserted_note;
end;
$$;

grant execute on function public.persist_ai_followup(uuid, text, jsonb, uuid, uuid)
  to authenticated;
