-- Service-role table privileges for server-side scripts, seeds, and CI DB verification.
-- App clients still use authenticated/anon with revoked direct table access + RLS/RPC.

grant usage on schema public to service_role;
grant usage on schema private to service_role;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
grant execute on all functions in schema private to service_role;

alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant all on sequences to service_role;
alter default privileges in schema public
  grant execute on functions to service_role;
alter default privileges in schema private
  grant execute on functions to service_role;
