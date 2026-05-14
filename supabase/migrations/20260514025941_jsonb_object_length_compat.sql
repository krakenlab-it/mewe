-- Compatibility shim for deployments where jsonb_object_length is unavailable.

create or replace function public.jsonb_object_length(data jsonb)
returns integer
language sql
immutable
as $$
  select count(*)::integer
  from jsonb_object_keys(coalesce(data, '{}'::jsonb));
$$;

grant execute on function public.jsonb_object_length(jsonb) to authenticated, anon;
