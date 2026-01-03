-- Adds DB-backed subscription periods (no Stripe required) and links a company to a selected period.
-- Run this in your Supabase SQL editor.

-- 1) Period catalog (admin can change these rows in the DB)
create table if not exists public.subscription_periods (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  duration_days integer not null check (duration_days > 0),
  is_trial boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) Company subscription fields
alter table public.companies
  add column if not exists subscription_period_id uuid references public.subscription_periods(id),
  add column if not exists subscription_started_at timestamptz,
  add column if not exists subscription_expires_at timestamptz;

-- 3) Seed default periods (edit these anytime)
insert into public.subscription_periods (code, name, duration_days, is_trial, sort_order, is_active)
values
  ('trial_7d',  '7 Days Trial',   7,  true,  10, true),
  ('trial_14d', '14 Days Trial',  14, true,  20, true),
  ('month_1',   '30 Days',        30, false, 30, true),
  ('month_3',   '3 Months',       90, false, 40, true),
  ('month_6',   '6 Months',       180,false, 50, true),
  ('month_12',  '12 Months',      360,false, 60, true)
on conflict (code) do update
set
  name = excluded.name,
  duration_days = excluded.duration_days,
  is_trial = excluded.is_trial,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;


