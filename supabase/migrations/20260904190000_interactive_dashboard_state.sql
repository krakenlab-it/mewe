-- Persist interactive dashboard state (mood, activities, pieces, whatsapp, calendar, chat)
-- Stored as JSONB on pairs; merged into client dupla snapshot as `interactivo`.

alter table public.pairs
  add column if not exists interactive_state jsonb not null default '{}'::jsonb;

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
    'interactivo', coalesce(v_pair.interactive_state, '{}'::jsonb),
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

-- Patch upsert: persist interactivo payload before returning snapshot
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
  v_result jsonb;
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
    insert into public.pairs (pair_code, workshop_id, status, interactive_state)
    values (
      upper(trim(p_pair_code)),
      v_workshop_id,
      'active',
      coalesce(p_payload -> 'interactivo', '{}'::jsonb)
    )
    returning * into v_pair;
  else
    update public.pairs
      set workshop_id = coalesce(v_workshop_id, workshop_id),
          status = case when status = 'deleted' then 'active' else status end,
          interactive_state = case
            when jsonb_typeof(p_payload -> 'interactivo') = 'object'
            then coalesce(p_payload -> 'interactivo', interactive_state)
            else interactive_state
          end
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

  v_result := private.snapshot_for_pair(v_pair_id);
  return v_result;
end;
$$;
