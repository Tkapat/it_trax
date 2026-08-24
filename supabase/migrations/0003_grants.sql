-- 0003_grants.sql
-- Fix 42501 "permission denied for table X" for all public tables.
-- Tables were created without default privileges for the API roles
-- (anon / authenticated), so PostgREST requests fail with
-- "permission denied". Grant full DML access to both roles;
-- row-level security still constrains what each request can see/write.

-- Usage on the schema itself is required before table privileges matter.
grant usage on schema public to anon, authenticated;

-- Cover everything that already exists.
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;

-- Make sure objects created in the future get the same treatment.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;

alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;

alter default privileges in schema public
  grant execute on functions to anon, authenticated;
