# RateMySlumlord

The national database of predatory landlords, rental properties, and management companies.

## Stack
- **Next.js 14** (static export)
- **Supabase** (database)
- **Tailwind CSS**
- **Cloudflare Pages** (hosting)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Deploy to Cloudflare Pages

1. Push this repo to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com)
3. Connect your GitHub repo
4. Set build command: `npm run build`
5. Set output directory: `out`
6. Add environment variables in Cloudflare dashboard
7. Connect your custom domain `ratemyslumlord.us`

## Supabase setup

Run this SQL in your Supabase SQL editor:

```sql
create table listings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null,
  type text default 'landlord',
  rating numeric(2,1),
  reviews int default 1,
  flags text[],
  deposit_lost int default 0,
  review_text text,
  created_at timestamp default now()
);

alter table listings enable row level security;
create policy "Public read" on listings for select using (true);
create policy "Public insert" on listings for insert with check (true);
```
