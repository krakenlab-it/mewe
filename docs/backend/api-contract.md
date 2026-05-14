# API Contract (RPC + Frontend Adapter)

## Frontend Storage Contract

The frontend uses a storage adapter that preserves legacy calls:

- `guardarDupla(codigo, payload)`
- `cargarDupla(codigo)`
- `eliminarDupla(codigo)`
- `listarDuplas()`

Extended auth-aware operations:

- `claimPairAccess(codigo, rol)`
- `loginAdmin(email, password)`
- `isAdminSession()`
- `seedQuestionBank(questionnaireCode, version, questions)`
- `logout()`

## Supabase RPC Endpoints

### `claim_pair_access`
- Input:
  - `p_pair_code text`
  - `p_role text` (`mother` or `daughter`)
- Behavior:
  - Validates code and role.
  - Binds current `auth.uid()` to participant.
  - Logs attempts and enforces throttling window.

### `upsert_pair_snapshot`
- Input:
  - `p_pair_code text`
  - `p_payload jsonb` (legacy `dupla` shape)
- Behavior:
  - Creates/updates pair + participants.
  - Upserts responses.
  - Upserts/derives indices.
  - Upserts comparative report cache.
- Output:
  - Canonical pair snapshot (`jsonb`) aligned to legacy frontend shape.

### `get_pair_snapshot`
- Input:
  - `p_pair_code text`
- Behavior:
  - Validates access through pair binding or admin role.
- Output:
  - Pair snapshot (`jsonb`) or `null`.

### `list_pair_snapshots`
- Admin-only output:
  - Set of pair snapshots (`setof jsonb`) for dashboard list, metrics, CSV export.

### `admin_delete_pair`
- Input:
  - `p_pair_code text`
  - `p_reason text`
- Behavior:
  - Admin-only hard delete of participant-level data + soft-delete pair root.
  - Writes audit event.

### `seed_question_bank`
- Input:
  - `p_questionnaire_code text` (`mother_v1`/`daughter_v1`)
  - `p_version text`
  - `p_questions jsonb` (array of question objects from frontend constants)
- Behavior:
  - Admin-only upsert into `questionnaires` and `questions`.

## Screen-to-Query Mapping

- `screen-madre-nueva`:
  - `upsert_pair_snapshot` (create/update pair + mother profile)
  - `claim_pair_access` (`mother`)
- `screen-madre-retomar`:
  - `claim_pair_access` (`mother`)
  - `get_pair_snapshot`
- `screen-hija-acceso`:
  - `claim_pair_access` (`daughter`)
  - `get_pair_snapshot`
- `screen-test` autosave:
  - `upsert_pair_snapshot` with incremental response payload
- `screen-dashboard-madre` / `screen-dashboard-hija`:
  - `get_pair_snapshot`
- `screen-dashboard-admin`:
  - `list_pair_snapshots`
- Admin delete flow:
  - `admin_delete_pair`
- Admin question-bank maintenance:
  - `seed_question_bank`

## Error Semantics

- Unauthorized access returns explicit errors from RPC.
- Pair-code failure paths are user-facing and mapped to current alert UX.
- Admin login requires Auth password login + `is_facilitator_admin() = true`.

## Adapter Behavior Modes

- `MEWE_BACKEND_MODE=local`: force localStorage.
- `MEWE_BACKEND_MODE=auto` (default):
  - Uses Supabase when URL and publishable key are configured.
  - Falls back to localStorage if backend initialization fails.
