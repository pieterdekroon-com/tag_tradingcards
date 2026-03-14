-- Themes catalog
create table themes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  rarity text not null check (rarity in ('Common', 'Rare', 'Epic', 'Legendary')),
  from_color text not null,
  to_color text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Specialties catalog
create table specialties (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Descriptions catalog
create table descriptions (
  id uuid primary key default gen_random_uuid(),
  text text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger themes_updated_at before update on themes
  for each row execute function update_updated_at();

create trigger specialties_updated_at before update on specialties
  for each row execute function update_updated_at();

create trigger descriptions_updated_at before update on descriptions
  for each row execute function update_updated_at();

-- Row Level Security
alter table themes enable row level security;
alter table specialties enable row level security;
alter table descriptions enable row level security;

-- Public read access (anon key)
create policy "Public read themes" on themes for select using (true);
create policy "Public read specialties" on specialties for select using (true);
create policy "Public read descriptions" on descriptions for select using (true);

-- Authenticated write access (Generator)
create policy "Auth insert themes" on themes for insert to authenticated with check (true);
create policy "Auth update themes" on themes for update to authenticated using (true);
create policy "Auth delete themes" on themes for delete to authenticated using (true);

create policy "Auth insert specialties" on specialties for insert to authenticated with check (true);
create policy "Auth update specialties" on specialties for update to authenticated using (true);
create policy "Auth delete specialties" on specialties for delete to authenticated using (true);

create policy "Auth insert descriptions" on descriptions for insert to authenticated with check (true);
create policy "Auth update descriptions" on descriptions for update to authenticated using (true);
create policy "Auth delete descriptions" on descriptions for delete to authenticated using (true);
