-- Security Audit: RLS + Policies + Storage Buckets
-- Run in Supabase SQL Editor (safe/read-only).

-- 1) List all public tables and whether RLS is enabled / forced
select
  n.nspname as schema,
  c.relname as table,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by 1, 2;

-- 2) List all RLS policies in public schema
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 3) Spot dangerous policies (examples): public SELECT, broad authenticated ALL
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and (
    ('public' = any(roles) and cmd = 'SELECT')
    or (array_length(roles, 1) = 1 and roles[1] = 'authenticated' and cmd = 'ALL')
  )
order by tablename, policyname;

-- 4) Storage buckets: public flag (private buckets recommended)
select id as bucket_id, name, public, created_at, updated_at
from storage.buckets
order by id;


