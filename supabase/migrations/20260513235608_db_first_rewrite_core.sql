-- ME WE DB-first rewrite (full parity)
-- Generated for Supabase/Postgres.

create extension if not exists pgcrypto;

create schema if not exists private;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_participant_role') then
    create type public.app_participant_role as enum ('mother', 'daughter');
  end if;
  if not exists (select 1 from pg_type where typname = 'app_pair_status') then
    create type public.app_pair_status as enum ('active', 'archived', 'deleted');
  end if;
  if not exists (select 1 from pg_type where typname = 'app_zone') then
    create type public.app_zone as enum ('cuidado', 'atencion', 'sostenida');
  end if;
end $$;

create table if not exists public.workshops (
  id uuid primary key default gen_random_uuid(),
  workshop_code text not null unique check (length(workshop_code) between 2 and 64),
  name text not null,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now()
);

create table if not exists public.pairs (
  id uuid primary key default gen_random_uuid(),
  pair_code text not null unique check (pair_code ~ '^[A-HJKMNPQRSTUVWXYZ2-9]{6}$'),
  workshop_id uuid references public.workshops(id) on delete set null,
  status public.app_pair_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references public.pairs(id) on delete cascade,
  role public.app_participant_role not null,
  display_name text,
  daughter_age_range text,
  question_progress integer not null default 0 check (question_progress >= 0),
  is_completed boolean not null default false,
  test_started_at timestamptz,
  test_completed_at timestamptz,
  consent_accepted_at timestamptz,
  consent_version text,
  is_adult_guardian boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pair_id, role)
);

create table if not exists public.participant_identities (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  participant_id uuid not null unique references public.participants(id) on delete cascade,
  linked_at timestamptz not null default now()
);

create table if not exists public.questionnaires (
  id uuid primary key default gen_random_uuid(),
  questionnaire_code text not null unique check (questionnaire_code in ('mother_v1', 'daughter_v1')),
  role public.app_participant_role not null,
  version text not null default 'v1',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references public.questionnaires(id) on delete cascade,
  question_code text not null unique,
  module_code text not null,
  dimension_key text not null,
  prompt text not null,
  sign smallint not null check (sign in (-1, 1)),
  weight numeric(5,2) not null check (weight > 0 and weight <= 10),
  sort_order integer not null check (sort_order > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (questionnaire_id, sort_order)
);

create table if not exists public.responses (
  participant_id uuid not null references public.participants(id) on delete cascade,
  question_code text not null,
  answer smallint not null check (answer between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (participant_id, question_code)
);

create table if not exists public.computed_indices (
  participant_id uuid not null references public.participants(id) on delete cascade,
  dimension_key text not null,
  value smallint not null check (value between 0 and 100),
  zone public.app_zone not null,
  scoring_version text not null default 'v1',
  computed_at timestamptz not null default now(),
  primary key (participant_id, dimension_key)
);

create table if not exists public.comparative_reports (
  pair_id uuid primary key references public.pairs(id) on delete cascade,
  mother_quadrant text,
  daughter_quadrant text,
  average_gap smallint check (average_gap between 0 and 100),
  report_json jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pair_access_attempts (
  id bigserial primary key,
  auth_user_id uuid references auth.users(id) on delete set null,
  pair_code text not null,
  role_requested public.app_participant_role,
  success boolean not null default false,
  failure_reason text,
  attempted_at timestamptz not null default now()
);

create table if not exists public.admin_actions_audit (
  id bigserial primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action_type text not null,
  pair_id uuid references public.pairs(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_pairs_pair_code on public.pairs(pair_code);
create index if not exists idx_pairs_created_at on public.pairs(created_at desc);
create index if not exists idx_pairs_workshop on public.pairs(workshop_id);
create index if not exists idx_participants_pair_role on public.participants(pair_id, role);
create index if not exists idx_responses_participant on public.responses(participant_id);
create index if not exists idx_indices_participant on public.computed_indices(participant_id);
create index if not exists idx_pair_access_attempts_user_time on public.pair_access_attempts(auth_user_id, attempted_at desc);
create index if not exists idx_admin_actions_created_at on public.admin_actions_audit(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_pairs_updated_at on public.pairs;
create trigger trg_pairs_updated_at
before update on public.pairs
for each row execute function public.set_updated_at();

drop trigger if exists trg_participants_updated_at on public.participants;
create trigger trg_participants_updated_at
before update on public.participants
for each row execute function public.set_updated_at();

drop trigger if exists trg_questions_updated_at on public.questions;
create trigger trg_questions_updated_at
before update on public.questions
for each row execute function public.set_updated_at();

drop trigger if exists trg_comparative_reports_updated_at on public.comparative_reports;
create trigger trg_comparative_reports_updated_at
before update on public.comparative_reports
for each row execute function public.set_updated_at();

create or replace function public.is_facilitator_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'facilitator_admin', false);
$$;

create or replace function public.is_service_role()
returns boolean
language sql
stable
as $$
  select auth.role() = 'service_role';
$$;

create or replace function public.current_participant_id()
returns uuid
language sql
stable
as $$
  select pi.participant_id
  from public.participant_identities pi
  where pi.auth_user_id = auth.uid();
$$;

create or replace function private.user_pair_access(p_pair_id uuid)
returns boolean
language sql
stable
as $$
  select
    public.is_service_role()
    or
    public.is_facilitator_admin()
    or exists (
      select 1
      from public.participant_identities pi
      join public.participants p on p.id = pi.participant_id
      where pi.auth_user_id = auth.uid()
        and p.pair_id = p_pair_id
    );
$$;

create or replace function private.classify_zone(p_dim text, p_value integer)
returns public.app_zone
language plpgsql
immutable
as $$
begin
  if p_dim in ('saturacion', 'presion_social') then
    if p_value >= 66 then return 'cuidado'; end if;
    if p_value >= 41 then return 'atencion'; end if;
    return 'sostenida';
  end if;

  if p_value <= 40 then return 'cuidado'; end if;
  if p_value <= 65 then return 'atencion'; end if;
  return 'sostenida';
end;
$$;

create or replace function private.classify_quadrant(p_indices jsonb)
returns text
language plpgsql
immutable
as $$
declare
  seg numeric := coalesce((p_indices ->> 'seguridad')::numeric, 50);
  con_fam numeric := coalesce((p_indices ->> 'conexion_familiar')::numeric, seg);
  presencia numeric := coalesce((p_indices ->> 'presencia')::numeric, 50);
  validacion numeric := coalesce((p_indices ->> 'validacion')::numeric, 50);
  apertura numeric := coalesce((p_indices ->> 'apertura')::numeric, 50);
  seg_avg numeric;
  conex_avg numeric;
begin
  seg_avg := (seg + con_fam) / 2;
  conex_avg := (presencia + validacion + apertura) / 3;

  if seg_avg >= 55 and conex_avg >= 55 then
    return 'nos_vemos';
  elsif seg_avg >= 55 and conex_avg < 55 then
    return 'nos_protegemos';
  elsif seg_avg < 55 and conex_avg >= 55 then
    return 'nos_escuchamos';
  end if;
  return 'nos_necesitamos_comprender_mejor';
end;
$$;

create or replace function private.compute_gap_average(p_m jsonb, p_h jsonb)
returns integer
language sql
immutable
as $$
  with dims as (
    select unnest(array[
      'seguridad','regulacion','presencia','validacion','apertura','saturacion','presion_social','conexion_familiar'
    ]) as dim
  )
  select coalesce(round(avg(abs(
    coalesce((p_m ->> dim)::numeric, 0) - coalesce((p_h ->> dim)::numeric, 0)
  )))::int, 0)
  from dims;
$$;

create or replace function private.recompute_indices(p_participant_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  weighted record;
  awareness integer;
  inverted_dims text[] := array['saturacion', 'presion_social'];
begin
  delete from public.computed_indices where participant_id = p_participant_id;

  for weighted in
    with src as (
      select
        q.dimension_key,
        case when q.sign = 1 then r.answer else (6 - r.answer) end::numeric as normalized_answer,
        q.weight
      from public.responses r
      join public.questions q on q.question_code = r.question_code and q.is_active = true
      where r.participant_id = p_participant_id
    )
    select
      dimension_key,
      round(((sum(normalized_answer * weight) / nullif(sum(weight), 0)) - 1) * 25)::int as value
    from src
    group by dimension_key
  loop
    insert into public.computed_indices (participant_id, dimension_key, value, zone, scoring_version, computed_at)
    values (
      p_participant_id,
      weighted.dimension_key,
      greatest(0, least(100, weighted.value)),
      private.classify_zone(weighted.dimension_key, greatest(0, least(100, weighted.value))),
      'v1',
      now()
    )
    on conflict (participant_id, dimension_key)
    do update set
      value = excluded.value,
      zone = excluded.zone,
      scoring_version = excluded.scoring_version,
      computed_at = excluded.computed_at;
  end loop;

  with values_cte as (
    select
      ci.dimension_key,
      ci.value::numeric as value,
      case when ci.dimension_key = any(inverted_dims) then 100 - ci.value else ci.value end as normalized
    from public.computed_indices ci
    where ci.participant_id = p_participant_id
      and ci.dimension_key in ('seguridad','validacion','apertura','presencia','conexion_familiar','regulacion','saturacion','presion_social')
  ),
  weights as (
    select * from (values
      ('seguridad', 0.20::numeric),
      ('validacion', 0.18::numeric),
      ('apertura', 0.15::numeric),
      ('presencia', 0.12::numeric),
      ('conexion_familiar', 0.10::numeric),
      ('regulacion', 0.10::numeric),
      ('saturacion', 0.08::numeric),
      ('presion_social', 0.07::numeric)
    ) as w(dimension_key, weight)
  )
  select round(sum(v.normalized * w.weight) / nullif(sum(w.weight), 0))::int
  into awareness
  from values_cte v
  join weights w on w.dimension_key = v.dimension_key;

  if awareness is not null then
    insert into public.computed_indices (participant_id, dimension_key, value, zone, scoring_version, computed_at)
    values (
      p_participant_id,
      'conciencia_relacional',
      greatest(0, least(100, awareness)),
      private.classify_zone('conciencia_relacional', greatest(0, least(100, awareness))),
      'v1',
      now()
    )
    on conflict (participant_id, dimension_key)
    do update set
      value = excluded.value,
      zone = excluded.zone,
      scoring_version = excluded.scoring_version,
      computed_at = excluded.computed_at;
  end if;
end;
$$;

create or replace function private.indices_for_participant(p_participant_id uuid)
returns jsonb
language sql
stable
as $$
  select coalesce(
    jsonb_object_agg(ci.dimension_key, ci.value order by ci.dimension_key),
    '{}'::jsonb
  )
  from public.computed_indices ci
  where ci.participant_id = p_participant_id;
$$;

create or replace function private.responses_for_participant(p_participant_id uuid)
returns jsonb
language sql
stable
as $$
  select coalesce(
    jsonb_object_agg(r.question_code, r.answer order by r.question_code),
    '{}'::jsonb
  )
  from public.responses r
  where r.participant_id = p_participant_id;
$$;

create or replace function private.snapshot_for_pair(p_pair_id uuid)
returns jsonb
language plpgsql
stable
as $$
declare
  v_pair public.pairs%rowtype;
  v_m public.participants%rowtype;
  v_h public.participants%rowtype;
  v_m_indices jsonb := '{}'::jsonb;
  v_h_indices jsonb := '{}'::jsonb;
begin
  select * into v_pair from public.pairs p where p.id = p_pair_id and p.deleted_at is null;
  if not found then
    return null;
  end if;

  select * into v_m from public.participants where pair_id = p_pair_id and role = 'mother';
  select * into v_h from public.participants where pair_id = p_pair_id and role = 'daughter';
  if found then
    v_h_indices := private.indices_for_participant(v_h.id);
  end if;
  if v_m.id is not null then
    v_m_indices := private.indices_for_participant(v_m.id);
  end if;

  return jsonb_build_object(
    'codigo', v_pair.pair_code,
    'creadaEn', v_pair.created_at,
    'taller', (select workshop_code from public.workshops where id = v_pair.workshop_id),
    'madre', jsonb_build_object(
      'nombre', v_m.display_name,
      'edadHija', v_m.daughter_age_range,
      'respuestas', coalesce(private.responses_for_participant(v_m.id), '{}'::jsonb),
      'preguntaIdx', coalesce(v_m.question_progress, 0),
      'completado', coalesce(v_m.is_completed, false),
      'indices', nullif(v_m_indices, '{}'::jsonb),
      'fechaCompletado', v_m.test_completed_at,
      'consentimiento',
        case when v_m.consent_accepted_at is null then null
             else jsonb_build_object('aceptadoEn', v_m.consent_accepted_at, 'version', v_m.consent_version)
        end
    ),
    'hija', jsonb_build_object(
      'nombre', v_h.display_name,
      'respuestas', coalesce(private.responses_for_participant(v_h.id), '{}'::jsonb),
      'preguntaIdx', coalesce(v_h.question_progress, 0),
      'completado', coalesce(v_h.is_completed, false),
      'indices', nullif(v_h_indices, '{}'::jsonb),
      'fechaCompletado', v_h.test_completed_at,
      'consentimiento',
        case when v_h.consent_accepted_at is null then null
             else jsonb_build_object('aceptadoEn', v_h.consent_accepted_at, 'version', v_h.consent_version)
        end
    )
  );
end;
$$;

create or replace function private.ensure_questionnaire(p_role public.app_participant_role)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_code text := case when p_role = 'mother' then 'mother_v1' else 'daughter_v1' end;
  v_id uuid;
begin
  select id into v_id from public.questionnaires where questionnaire_code = v_code;
  if v_id is null then
    insert into public.questionnaires (questionnaire_code, role, version, is_active)
    values (v_code, p_role, 'v1', true)
    returning id into v_id;
  end if;
  return v_id;
end;
$$;

create or replace function private.claim_pair_access(p_pair_code text, p_role text)
returns void
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
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  begin
    v_role := p_role::public.app_participant_role;
  exception
    when others then
      raise exception 'Invalid role';
  end;

  select count(*) into v_failed_count
  from public.pair_access_attempts
  where auth_user_id = v_uid
    and success = false
    and attempted_at > now() - interval '15 minutes';

  if v_failed_count >= 10 then
    raise exception 'Too many failed access attempts. Please try again later.';
  end if;

  select id into v_pair_id
  from public.pairs
  where pair_code = upper(trim(p_pair_code))
    and deleted_at is null;

  if v_pair_id is null then
    insert into public.pair_access_attempts (auth_user_id, pair_code, role_requested, success, failure_reason)
    values (v_uid, upper(trim(p_pair_code)), v_role, false, 'pair_not_found');
    raise exception 'Pair code not found';
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
    values (v_uid, upper(trim(p_pair_code)), v_role, false, 'participant_missing');
    raise exception 'Role is not available for this pair';
  end if;

  if exists (
    select 1
    from public.participant_identities pi
    join public.participants p on p.id = pi.participant_id
    where pi.auth_user_id = v_uid
      and p.pair_id <> v_pair_id
  ) then
    insert into public.pair_access_attempts (auth_user_id, pair_code, role_requested, success, failure_reason)
    values (v_uid, upper(trim(p_pair_code)), v_role, false, 'different_pair_already_claimed');
    raise exception 'Current session is already linked to another pair';
  end if;

  insert into public.participant_identities (auth_user_id, participant_id)
  values (v_uid, v_participant_id)
  on conflict (auth_user_id) do update
    set participant_id = excluded.participant_id,
        linked_at = now();

  insert into public.pair_access_attempts (auth_user_id, pair_code, role_requested, success)
  values (v_uid, upper(trim(p_pair_code)), v_role, true);
end;
$$;

create or replace function private.upsert_pair_snapshot(p_pair_code text, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_pair public.pairs%rowtype;
  v_pair_id uuid;
  v_workshop_id uuid;
  v_workshop_code text := nullif(trim(coalesce(p_payload ->> 'taller', '')), '');
  v_m jsonb := coalesce(p_payload -> 'madre', '{}'::jsonb);
  v_h jsonb := coalesce(p_payload -> 'hija', '{}'::jsonb);
  v_m_participant_id uuid;
  v_h_participant_id uuid;
  dim_key text;
  dim_value int;
  q_code text;
  q_answer int;
  v_m_indices jsonb;
  v_h_indices jsonb;
  v_report_gap int;
begin
  select *
  into v_pair
  from public.pairs
  where pair_code = upper(trim(p_pair_code))
    and deleted_at is null;

  if v_pair.id is not null and not private.user_pair_access(v_pair.id) then
    raise exception 'Not authorized for this pair';
  end if;

  if v_workshop_code is not null then
    insert into public.workshops (workshop_code, name)
    values (v_workshop_code, 'Taller ' || v_workshop_code)
    on conflict (workshop_code) do update
      set workshop_code = excluded.workshop_code
    returning id into v_workshop_id;
  end if;

  if v_pair.id is null then
    insert into public.pairs (pair_code, workshop_id, status)
    values (upper(trim(p_pair_code)), v_workshop_id, 'active')
    returning * into v_pair;
  else
    update public.pairs
      set workshop_id = coalesce(v_workshop_id, workshop_id),
          status = case when status = 'deleted' then 'active' else status end
    where id = v_pair.id
    returning * into v_pair;
  end if;
  v_pair_id := v_pair.id;

  if v_m <> '{}'::jsonb then
    insert into public.participants (
      pair_id, role, display_name, daughter_age_range, question_progress,
      is_completed, test_started_at, test_completed_at, consent_accepted_at, consent_version, is_adult_guardian
    ) values (
      v_pair_id,
      'mother',
      nullif(v_m ->> 'nombre', ''),
      nullif(v_m ->> 'edadHija', ''),
      greatest(0, coalesce((v_m ->> 'preguntaIdx')::int, 0)),
      coalesce((v_m ->> 'completado')::boolean, false),
      case when coalesce((v_m ->> 'preguntaIdx')::int, 0) > 0 then now() else null end,
      case when coalesce((v_m ->> 'completado')::boolean, false) then coalesce((v_m ->> 'fechaCompletado')::timestamptz, now()) else null end,
      (v_m -> 'consentimiento' ->> 'aceptadoEn')::timestamptz,
      coalesce(v_m -> 'consentimiento' ->> 'version', '1.0'),
      coalesce((v_m ->> 'isAdultGuardian')::boolean, true)
    )
    on conflict (pair_id, role) do update set
      display_name = excluded.display_name,
      daughter_age_range = excluded.daughter_age_range,
      question_progress = excluded.question_progress,
      is_completed = excluded.is_completed,
      test_started_at = coalesce(public.participants.test_started_at, excluded.test_started_at),
      test_completed_at = excluded.test_completed_at,
      consent_accepted_at = coalesce(public.participants.consent_accepted_at, excluded.consent_accepted_at),
      consent_version = coalesce(excluded.consent_version, public.participants.consent_version),
      is_adult_guardian = coalesce(excluded.is_adult_guardian, public.participants.is_adult_guardian)
    returning id into v_m_participant_id;

    if auth.uid() is not null then
      insert into public.participant_identities (auth_user_id, participant_id)
      values (auth.uid(), v_m_participant_id)
      on conflict (auth_user_id) do nothing;
    end if;

    if jsonb_typeof(v_m -> 'respuestas') = 'object' then
      for q_code, q_answer in
        select key, value::text::int
        from jsonb_each_text(v_m -> 'respuestas')
      loop
        insert into public.responses (participant_id, question_code, answer)
        values (v_m_participant_id, q_code, q_answer)
        on conflict (participant_id, question_code)
        do update set answer = excluded.answer, updated_at = now();
      end loop;
    end if;

    if jsonb_typeof(v_m -> 'indices') = 'object' then
      for dim_key, dim_value in
        select key, value::text::int
        from jsonb_each_text(v_m -> 'indices')
      loop
        if dim_key in ('seguridad','regulacion','presencia','validacion','apertura','saturacion','presion_social','conexion_familiar','conciencia_relacional') then
          insert into public.computed_indices (participant_id, dimension_key, value, zone, scoring_version, computed_at)
          values (
            v_m_participant_id,
            dim_key,
            greatest(0, least(100, dim_value)),
            private.classify_zone(dim_key, greatest(0, least(100, dim_value))),
            'v1_client',
            now()
          )
          on conflict (participant_id, dimension_key)
          do update set
            value = excluded.value,
            zone = excluded.zone,
            scoring_version = excluded.scoring_version,
            computed_at = excluded.computed_at;
        end if;
      end loop;
    elsif exists (select 1 from public.questions q where q.question_code like 'M%') then
      perform private.recompute_indices(v_m_participant_id);
    end if;
  end if;

  if v_h <> '{}'::jsonb then
    insert into public.participants (
      pair_id, role, display_name, question_progress,
      is_completed, test_started_at, test_completed_at, consent_accepted_at, consent_version, is_adult_guardian
    ) values (
      v_pair_id,
      'daughter',
      nullif(v_h ->> 'nombre', ''),
      greatest(0, coalesce((v_h ->> 'preguntaIdx')::int, 0)),
      coalesce((v_h ->> 'completado')::boolean, false),
      case when coalesce((v_h ->> 'preguntaIdx')::int, 0) > 0 then now() else null end,
      case when coalesce((v_h ->> 'completado')::boolean, false) then coalesce((v_h ->> 'fechaCompletado')::timestamptz, now()) else null end,
      (v_h -> 'consentimiento' ->> 'aceptadoEn')::timestamptz,
      coalesce(v_h -> 'consentimiento' ->> 'version', '1.0'),
      false
    )
    on conflict (pair_id, role) do update set
      display_name = excluded.display_name,
      question_progress = excluded.question_progress,
      is_completed = excluded.is_completed,
      test_started_at = coalesce(public.participants.test_started_at, excluded.test_started_at),
      test_completed_at = excluded.test_completed_at,
      consent_accepted_at = coalesce(public.participants.consent_accepted_at, excluded.consent_accepted_at),
      consent_version = coalesce(excluded.consent_version, public.participants.consent_version)
    returning id into v_h_participant_id;

    if jsonb_typeof(v_h -> 'respuestas') = 'object' then
      for q_code, q_answer in
        select key, value::text::int
        from jsonb_each_text(v_h -> 'respuestas')
      loop
        insert into public.responses (participant_id, question_code, answer)
        values (v_h_participant_id, q_code, q_answer)
        on conflict (participant_id, question_code)
        do update set answer = excluded.answer, updated_at = now();
      end loop;
    end if;

    if jsonb_typeof(v_h -> 'indices') = 'object' then
      for dim_key, dim_value in
        select key, value::text::int
        from jsonb_each_text(v_h -> 'indices')
      loop
        if dim_key in ('seguridad','regulacion','presencia','validacion','apertura','saturacion','presion_social','conexion_familiar','conciencia_relacional') then
          insert into public.computed_indices (participant_id, dimension_key, value, zone, scoring_version, computed_at)
          values (
            v_h_participant_id,
            dim_key,
            greatest(0, least(100, dim_value)),
            private.classify_zone(dim_key, greatest(0, least(100, dim_value))),
            'v1_client',
            now()
          )
          on conflict (participant_id, dimension_key)
          do update set
            value = excluded.value,
            zone = excluded.zone,
            scoring_version = excluded.scoring_version,
            computed_at = excluded.computed_at;
        end if;
      end loop;
    elsif exists (select 1 from public.questions q where q.question_code like 'M%') then
      perform private.recompute_indices(v_h_participant_id);
    end if;
  end if;

  if v_m_participant_id is not null and v_h_participant_id is not null then
    v_m_indices := private.indices_for_participant(v_m_participant_id);
    v_h_indices := private.indices_for_participant(v_h_participant_id);
    if jsonb_object_length(v_m_indices) > 0 and jsonb_object_length(v_h_indices) > 0 then
      v_report_gap := private.compute_gap_average(v_m_indices, v_h_indices);
      insert into public.comparative_reports (pair_id, mother_quadrant, daughter_quadrant, average_gap, report_json, generated_at)
      values (
        v_pair_id,
        private.classify_quadrant(v_m_indices),
        private.classify_quadrant(v_h_indices),
        v_report_gap,
        jsonb_build_object(
          'averageGap', v_report_gap,
          'generatedBy', 'db_first_rewrite'
        ),
        now()
      )
      on conflict (pair_id)
      do update set
        mother_quadrant = excluded.mother_quadrant,
        daughter_quadrant = excluded.daughter_quadrant,
        average_gap = excluded.average_gap,
        report_json = excluded.report_json,
        generated_at = now(),
        updated_at = now();
    end if;
  end if;

  return private.snapshot_for_pair(v_pair_id);
end;
$$;

create or replace function private.get_pair_snapshot(p_pair_code text)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_pair_id uuid;
begin
  select id into v_pair_id
  from public.pairs
  where pair_code = upper(trim(p_pair_code))
    and deleted_at is null;

  if v_pair_id is null then
    return null;
  end if;

  if not private.user_pair_access(v_pair_id) then
    raise exception 'Not authorized for this pair';
  end if;

  return private.snapshot_for_pair(v_pair_id);
end;
$$;

create or replace function private.list_pair_snapshots()
returns setof jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_pair record;
begin
  if not (public.is_facilitator_admin() or public.is_service_role()) then
    raise exception 'Admin role required';
  end if;

  for v_pair in
    select id
    from public.pairs
    where deleted_at is null
    order by created_at desc
  loop
    return next private.snapshot_for_pair(v_pair.id);
  end loop;
end;
$$;

create or replace function private.admin_delete_pair(p_pair_code text, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_pair_id uuid;
begin
  if not (public.is_facilitator_admin() or public.is_service_role()) then
    raise exception 'Admin role required';
  end if;

  select id into v_pair_id
  from public.pairs
  where pair_code = upper(trim(p_pair_code))
    and deleted_at is null;

  if v_pair_id is null then
    return;
  end if;

  delete from public.responses
  where participant_id in (select id from public.participants where pair_id = v_pair_id);

  delete from public.computed_indices
  where participant_id in (select id from public.participants where pair_id = v_pair_id);

  delete from public.participant_identities
  where participant_id in (select id from public.participants where pair_id = v_pair_id);

  delete from public.comparative_reports where pair_id = v_pair_id;
  delete from public.participants where pair_id = v_pair_id;

  update public.pairs
    set status = 'deleted',
        deleted_at = now()
    where id = v_pair_id;

  insert into public.admin_actions_audit (actor_user_id, action_type, pair_id, metadata)
  values (auth.uid(), 'delete_pair', v_pair_id, jsonb_build_object('reason', p_reason));
end;
$$;

create or replace function private.seed_question_bank(
  p_questionnaire_code text,
  p_version text,
  p_questions jsonb
)
returns integer
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_role public.app_participant_role;
  v_questionnaire_id uuid;
  v_count integer := 0;
  item jsonb;
begin
  if not (public.is_facilitator_admin() or public.is_service_role()) then
    raise exception 'Admin role required';
  end if;

  if p_questionnaire_code not in ('mother_v1', 'daughter_v1') then
    raise exception 'Unsupported questionnaire code';
  end if;

  v_role := case when p_questionnaire_code = 'mother_v1' then 'mother'::public.app_participant_role else 'daughter'::public.app_participant_role end;

  insert into public.questionnaires (questionnaire_code, role, version, is_active)
  values (p_questionnaire_code, v_role, p_version, true)
  on conflict (questionnaire_code) do update
    set version = excluded.version,
        role = excluded.role,
        is_active = true
  returning id into v_questionnaire_id;

  for item in select * from jsonb_array_elements(p_questions)
  loop
    insert into public.questions (
      questionnaire_id, question_code, module_code, dimension_key, prompt, sign, weight, sort_order, is_active
    )
    values (
      v_questionnaire_id,
      item ->> 'id',
      item ->> 'mod',
      item ->> 'dim',
      item ->> 'txt',
      coalesce((item ->> 'signo')::smallint, 1),
      coalesce((item ->> 'peso')::numeric, 1),
      coalesce((item ->> 'sort_order')::int, 1),
      true
    )
    on conflict (question_code) do update
      set questionnaire_id = excluded.questionnaire_id,
          module_code = excluded.module_code,
          dimension_key = excluded.dimension_key,
          prompt = excluded.prompt,
          sign = excluded.sign,
          weight = excluded.weight,
          sort_order = excluded.sort_order,
          is_active = true;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

create or replace function public.claim_pair_access(p_pair_code text, p_role text)
returns void
language sql
security invoker
as $$
  select private.claim_pair_access(p_pair_code, p_role);
$$;

create or replace function public.upsert_pair_snapshot(p_pair_code text, p_payload jsonb)
returns jsonb
language sql
security invoker
as $$
  select private.upsert_pair_snapshot(p_pair_code, p_payload);
$$;

create or replace function public.get_pair_snapshot(p_pair_code text)
returns jsonb
language sql
security invoker
as $$
  select private.get_pair_snapshot(p_pair_code);
$$;

create or replace function public.list_pair_snapshots()
returns setof jsonb
language sql
security invoker
as $$
  select * from private.list_pair_snapshots();
$$;

create or replace function public.admin_delete_pair(p_pair_code text, p_reason text default null)
returns void
language sql
security invoker
as $$
  select private.admin_delete_pair(p_pair_code, p_reason);
$$;

create or replace function public.seed_question_bank(p_questionnaire_code text, p_version text, p_questions jsonb)
returns integer
language sql
security invoker
as $$
  select private.seed_question_bank(p_questionnaire_code, p_version, p_questions);
$$;

grant execute on function public.claim_pair_access(text, text) to authenticated;
grant execute on function public.upsert_pair_snapshot(text, jsonb) to authenticated;
grant execute on function public.get_pair_snapshot(text) to authenticated;
grant execute on function public.list_pair_snapshots() to authenticated;
grant execute on function public.admin_delete_pair(text, text) to authenticated;
grant execute on function public.seed_question_bank(text, text, jsonb) to authenticated;
grant execute on function public.is_facilitator_admin() to authenticated;
grant execute on function public.is_service_role() to authenticated;

alter table public.workshops enable row level security;
alter table public.pairs enable row level security;
alter table public.participants enable row level security;
alter table public.participant_identities enable row level security;
alter table public.questionnaires enable row level security;
alter table public.questions enable row level security;
alter table public.responses enable row level security;
alter table public.computed_indices enable row level security;
alter table public.comparative_reports enable row level security;
alter table public.pair_access_attempts enable row level security;
alter table public.admin_actions_audit enable row level security;

drop policy if exists "questionnaires_read_authenticated" on public.questionnaires;
create policy "questionnaires_read_authenticated"
on public.questionnaires
for select
to authenticated
using (true);

drop policy if exists "questions_read_authenticated" on public.questions;
create policy "questions_read_authenticated"
on public.questions
for select
to authenticated
using (true);

drop policy if exists "pair_select_member_or_admin" on public.pairs;
create policy "pair_select_member_or_admin"
on public.pairs
for select
to authenticated
using (private.user_pair_access(id));

drop policy if exists "participants_select_member_or_admin" on public.participants;
create policy "participants_select_member_or_admin"
on public.participants
for select
to authenticated
using (private.user_pair_access(pair_id));

drop policy if exists "responses_select_member_or_admin" on public.responses;
create policy "responses_select_member_or_admin"
on public.responses
for select
to authenticated
using (
  exists (
    select 1
    from public.participants p
    where p.id = responses.participant_id
      and private.user_pair_access(p.pair_id)
  )
);

drop policy if exists "computed_indices_select_member_or_admin" on public.computed_indices;
create policy "computed_indices_select_member_or_admin"
on public.computed_indices
for select
to authenticated
using (
  exists (
    select 1
    from public.participants p
    where p.id = computed_indices.participant_id
      and private.user_pair_access(p.pair_id)
  )
);

drop policy if exists "comparative_reports_select_member_or_admin" on public.comparative_reports;
create policy "comparative_reports_select_member_or_admin"
on public.comparative_reports
for select
to authenticated
using (private.user_pair_access(pair_id));

drop policy if exists "admin_actions_admin_only" on public.admin_actions_audit;
create policy "admin_actions_admin_only"
on public.admin_actions_audit
for select
to authenticated
using (public.is_facilitator_admin());

drop policy if exists "pair_access_attempts_admin_only" on public.pair_access_attempts;
create policy "pair_access_attempts_admin_only"
on public.pair_access_attempts
for select
to authenticated
using (public.is_facilitator_admin());

revoke all on table public.workshops from anon, authenticated;
revoke all on table public.pairs from anon, authenticated;
revoke all on table public.participants from anon, authenticated;
revoke all on table public.participant_identities from anon, authenticated;
revoke all on table public.responses from anon, authenticated;
revoke all on table public.computed_indices from anon, authenticated;
revoke all on table public.comparative_reports from anon, authenticated;
revoke all on table public.pair_access_attempts from anon, authenticated;
revoke all on table public.admin_actions_audit from anon, authenticated;
grant select on table public.questionnaires to authenticated;
grant select on table public.questions to authenticated;
