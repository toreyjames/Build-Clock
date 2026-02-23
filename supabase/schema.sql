-- Genesis Radar Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Opportunities table
create table if not exists opportunities (
  id text primary key,
  title text not null,
  subtitle text,
  genesis_pillar text not null,
  genesis_connection text,
  entity text not null,
  entity_type text default 'enterprise',
  sector text not null,
  location text,
  state text,
  estimated_value bigint,
  contract_type text default 'direct',
  funding_source text,
  procurement_stage text default 'pre-solicitation',
  urgency text default 'this-quarter',
  key_date date,
  key_date_description text,
  posted_date date,
  response_deadline date,
  ot_relevance text default 'medium',
  ot_systems text[] default '{}',
  ot_scope text,
  regulatory_drivers text[] default '{}',
  compliance_requirements text,
  deloitte_services text[] default '{}',
  deloitte_angle text,
  existing_relationship text default 'none',
  likely_primes text[] default '{}',
  competitors text[] default '{}',
  partner_opportunities text[] default '{}',
  sources jsonb default '[]',
  confidence text default 'likely',
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Signals table for news/policy updates
create table if not exists signals (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  summary text,
  source text,
  source_url text,
  published_at timestamp with time zone,
  genesis_pillar text,
  sectors text[] default '{}',
  signal_type text default 'news',
  relevance text default 'medium',
  action_required text,
  created_at timestamp with time zone default now()
);

-- Update trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_opportunities_updated_at
  before update on opportunities
  for each row
  execute function update_updated_at_column();

-- Enable Row Level Security (but allow public read for now)
alter table opportunities enable row level security;
alter table signals enable row level security;

-- Allow public read access
create policy "Allow public read access on opportunities"
  on opportunities for select
  using (true);

create policy "Allow public read access on signals"
  on signals for select
  using (true);

-- Allow public insert/update for now (can restrict later with auth)
create policy "Allow public insert on opportunities"
  on opportunities for insert
  with check (true);

create policy "Allow public update on opportunities"
  on opportunities for update
  using (true);

create policy "Allow public insert on signals"
  on signals for insert
  with check (true);

-- Create indexes for common queries
create index if not exists idx_opportunities_pillar on opportunities(genesis_pillar);
create index if not exists idx_opportunities_urgency on opportunities(urgency);
create index if not exists idx_opportunities_sector on opportunities(sector);
create index if not exists idx_opportunities_ot_relevance on opportunities(ot_relevance);
create index if not exists idx_signals_published on signals(published_at desc);
