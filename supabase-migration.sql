-- Add new columns to listings (safe to run even if some exist)
alter table listings add column if not exists landlord_name text;
alter table listings add column if not exists property_address text;
alter table listings add column if not exists city text;
alter table listings add column if not exists state text;

-- Copy old data to new columns
update listings set landlord_name = name where landlord_name is null;
update listings set property_address = address where property_address is null;

-- Create reviews table
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references listings(id) on delete cascade,
  rating numeric(2,1),
  review_text text,
  deposit_lost int default 0,
  flags text[],
  created_at timestamp default now()
);

alter table reviews enable row level security;
create policy "Public read reviews" on reviews for select using (true);
create policy "Public insert reviews" on reviews for insert with check (true);
