# ME WE Domain Contract (Frontend-to-Backend)

## Scope
This document maps the existing UI flow in `me_we_plataforma.html` into backend domain entities and invariants for the Supabase DB-first rewrite.

## User Journeys

- Mother creates pair:
  - Inputs: `nombre`, `edadHija`, optional `taller`, consent flags.
  - Outputs: unique `codigo` (6 chars), mother participant created, session bound.
- Mother resumes by pair code:
  - Inputs: `codigo`.
  - Outputs: validated access, recovered pair snapshot.
- Daughter joins by pair code:
  - Inputs: `codigo`.
  - Outputs: daughter participant bound to pair, profile completion step.
- Tests:
  - Mother answers 96 items; daughter answers 48 items.
  - Progress (`preguntaIdx`) and `respuestas` are autosaved.
  - Completion writes timestamp and computed `indices`.
- Reports:
  - Individual report for current role after completion.
  - Comparative report unlocked when both participants complete.
- Admin:
  - List all pairs, inspect pair detail, view aggregate metrics, export CSV, delete pair.

## Canonical Aggregate

The legacy aggregate payload (`dupla`) remains the client contract:

```json
{
  "codigo": "ABC123",
  "creadaEn": "2026-05-13T12:00:00Z",
  "taller": "TALLER-01",
  "madre": {
    "nombre": "Ana",
    "edadHija": "11-12",
    "respuestas": { "M1-Q01": 4 },
    "preguntaIdx": 12,
    "completado": false,
    "indices": null,
    "fechaCompletado": null
  },
  "hija": {
    "nombre": "Lia",
    "respuestas": {},
    "preguntaIdx": 0,
    "completado": false,
    "indices": null,
    "fechaCompletado": null
  }
}
```

## Domain Entities

- `workshops`: optional grouping (`taller`).
- `pairs`: root aggregate key (`codigo`), lifecycle state.
- `participants`: one mother + one daughter per pair.
- `participant_identities`: links authenticated Supabase users to participant roles.
- `responses`: per participant answer map (question code -> 1..5).
- `computed_indices`: persisted scoring dimensions + awareness index.
- `comparative_reports`: cached pair-level comparative summary.
- `admin_actions_audit`: immutable admin action log.
- `pair_access_attempts`: security/rate-limit evidence for code-join attempts.
- `questionnaires`/`questions`: versioned scoring catalog.

## Invariants

- Pair code format: `^[A-HJKMNPQRSTUVWXYZ2-9]{6}$`.
- Pair code is unique and immutable.
- Exactly one mother and one daughter role per pair (`unique (pair_id, role)`).
- `responses.answer` is always 1..5.
- Comparative report is meaningful only when both participants have computed indices.
- Admin-only operations: list all pairs, delete pair, seed question bank.
- App authorization cannot trust `user_metadata`; role comes from JWT `app_metadata`.

## Authorization Model

- Mother and daughter are anonymous/authenticated Supabase users linked through `claim_pair_access`.
- Admin is a Supabase Auth user with `app_role=facilitator_admin`.
- All exposed tables run with RLS enabled.
- Public RPC wrappers call private security-definer functions where multi-table writes are required.
