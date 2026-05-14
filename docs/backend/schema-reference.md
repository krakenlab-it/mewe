# Schema Reference (Supabase/Postgres)

## Core Tables

- `public.workshops`
  - Optional workshop taxonomy (`workshop_code`, `name`).
- `public.pairs`
  - Pair root, keyed by `pair_code`.
  - Lifecycle fields: `status`, `created_at`, `updated_at`, `deleted_at`.
- `public.participants`
  - One row per role (`mother`, `daughter`) in each pair.
  - Stores profile, consent metadata, progress, completion.
- `public.participant_identities`
  - Binds `auth.users.id` to a participant row for access control.
- `public.responses`
  - Canonical answer store: `(participant_id, question_code) -> answer`.
- `public.computed_indices`
  - Dimension snapshots per participant (`0..100`, zone classification).
- `public.comparative_reports`
  - Pair-level comparative cache and gap summary.
- `public.questionnaires`, `public.questions`
  - Versioned question/scoring catalog.
- `public.pair_access_attempts`
  - Join/access attempt logs for abuse/rate-limiting safeguards.
- `public.admin_actions_audit`
  - Admin delete/export and sensitive action evidence.

## Constraints and Integrity

- Pair code regex and uniqueness.
- One participant role per pair.
- Response bounds (`answer between 1 and 5`).
- Computed index bounds (`0..100`).
- Foreign keys from pair -> participants -> responses/indices.
- Soft-delete pair lifecycle via `pairs.deleted_at`.

## RLS Summary

- RLS enabled on all user-data tables.
- Default direct access is minimal; app writes happen through RPC.
- Read access by member/admin:
  - Pair members may read pair-scoped rows.
  - Admin may read all pair rows.
- Admin-only tables:
  - `admin_actions_audit`
  - `pair_access_attempts`

## Operational Indexes

- Pair lookup: `idx_pairs_pair_code`.
- Admin ordering: `idx_pairs_created_at`.
- Pair-role lookup: `idx_participants_pair_role`.
- Participant hot paths: responses + indices by participant.
- Security signals: access attempts by user/time.

## Functions (Public RPC)

- `claim_pair_access(pair_code, role)`
- `upsert_pair_snapshot(pair_code, payload)`
- `get_pair_snapshot(pair_code)`
- `list_pair_snapshots()`
- `admin_delete_pair(pair_code, reason)`
- `seed_question_bank(questionnaire_code, version, questions)`
- `is_facilitator_admin()`

Private (`private.*`) functions implement the privileged logic and are invoked by wrappers.
