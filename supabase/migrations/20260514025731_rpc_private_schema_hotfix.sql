-- Hotfix: allow authenticated callers to resolve private helper functions
-- used by public RPC wrappers and RLS helper expressions.

grant usage on schema private to authenticated;

grant execute on function private.user_pair_access(uuid) to authenticated;
grant execute on function private.claim_pair_access(text, text) to authenticated;
grant execute on function private.upsert_pair_snapshot(text, jsonb) to authenticated;
grant execute on function private.get_pair_snapshot(text) to authenticated;
grant execute on function private.list_pair_snapshots() to authenticated;
grant execute on function private.admin_delete_pair(text, text) to authenticated;
grant execute on function private.seed_question_bank(text, text, jsonb) to authenticated;
