-- Enable RLS on every table (public schema)
-- IMPORTANT:
-- - Running this without proper policies will break access for normal users.
-- - Do this together with tenant policies (see 02_tenant_rls.sql).
-- - service_role bypasses RLS, but your application should not rely on that for tenant isolation.

do $$
declare
  r record;
begin
  for r in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', r.tablename);
    execute format('alter table public.%I force row level security', r.tablename);
  end loop;
end $$;


