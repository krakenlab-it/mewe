-- Failed pair-code attempts were inserted and then raised in the same
-- transaction, so Postgres rolled the audit row back. The rate-limit
-- counters therefore never moved. Return the failure as text so the row
-- commits. Callers must treat a non-empty string as failure; raising here
-- would undo the insert again.

drop function if exists public.claim_pair_access(text, text);
drop function if exists private.claim_pair_access(text, text);

create function private.claim_pair_access(p_pair_code text, p_role text)
returns text
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_uid uuid := auth.uid();
  v_pair_id uuid;
  v_role public.app_participant_role;
  v_participant_id uuid;
  v_failed_count integer;
  v_code_failed_count integer;
  v_normalized_code text := upper(trim(p_pair_code));
begin
  if v_uid is null then
    return 'Authentication required';
  end if;

  begin
    v_role := p_role::public.app_participant_role;
  exception
    when others then
      return 'Invalid role';
  end;

  select count(*) into v_code_failed_count
  from public.pair_access_attempts
  where pair_code = v_normalized_code
    and success = false
    and attempted_at > now() - interval '15 minutes';

  if v_code_failed_count >= 20 then
    return 'Too many failed access attempts for this code. Please try again later.';
  end if;

  select count(*) into v_failed_count
  from public.pair_access_attempts
  where auth_user_id = v_uid
    and success = false
    and attempted_at > now() - interval '15 minutes';

  if v_failed_count >= 10 then
    return 'Too many failed access attempts. Please try again later.';
  end if;

  select id into v_pair_id
  from public.pairs
  where pair_code = v_normalized_code
    and deleted_at is null;

  if v_pair_id is null then
    insert into public.pair_access_attempts (auth_user_id, pair_code, role_requested, success, failure_reason)
    values (v_uid, v_normalized_code, v_role, false, 'pair_not_found');
    return 'Pair code not found';
  end if;

  select id into v_participant_id
  from public.participants
  where pair_id = v_pair_id
    and role = v_role;

  if v_participant_id is null and v_role = 'daughter' then
    insert into public.participants (pair_id, role, display_name)
    values (v_pair_id, 'daughter', null)
    returning id into v_participant_id;
  end if;

  if v_participant_id is null then
    insert into public.pair_access_attempts (auth_user_id, pair_code, role_requested, success, failure_reason)
    values (v_uid, v_normalized_code, v_role, false, 'participant_missing');
    return 'Role is not available for this pair';
  end if;

  if exists (
    select 1
    from public.participant_identities pi
    join public.participants p on p.id = pi.participant_id
    where pi.auth_user_id = v_uid
      and p.pair_id <> v_pair_id
  ) then
    insert into public.pair_access_attempts (auth_user_id, pair_code, role_requested, success, failure_reason)
    values (v_uid, v_normalized_code, v_role, false, 'different_pair_already_claimed');
    return 'Current session is already linked to another pair';
  end if;

  delete from public.participant_identities
  where participant_id = v_participant_id
    and auth_user_id <> v_uid;

  insert into public.participant_identities (auth_user_id, participant_id)
  values (v_uid, v_participant_id)
  on conflict (auth_user_id) do update
    set participant_id = excluded.participant_id,
        linked_at = now();

  insert into public.pair_access_attempts (auth_user_id, pair_code, role_requested, success)
  values (v_uid, v_normalized_code, v_role, true);

  return null;
end;
$$;

create function public.claim_pair_access(p_pair_code text, p_role text)
returns text
language sql
security invoker
set search_path = public, private
as $$
  select private.claim_pair_access(p_pair_code, p_role);
$$;

revoke all on function public.claim_pair_access(text, text) from public, anon;
revoke all on function private.claim_pair_access(text, text) from public, anon;
grant execute on function public.claim_pair_access(text, text) to authenticated, service_role;
grant execute on function private.claim_pair_access(text, text) to authenticated, service_role;
