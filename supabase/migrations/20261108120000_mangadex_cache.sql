-- kasane: MangaDex cache
--
-- MangaDex answers a browser User-Agent with a bot challenge, so the web app
-- reaches it through a same-origin proxy, three to five hops per series page
-- (title search, cover pages, aggregate). This table holds the result of that
-- lookup per catalog manga, filled by `scripts/refresh-mangadex.ts` with the
-- service role and read by the client in one query. A series with no row here
-- still falls back to the live lookup.
--
-- Catalog data: public read-only, written by scripts only. The row is a cache
-- blob the client always reads whole, so titles and covers are jsonb columns
-- rather than child tables.

create table public.mangadex_series (
  id bigint generated always as identity primary key,
  anilist_manga_id integer not null unique,
  mangadex_id text not null,
  -- `[{ "locale": "en", "value": "..." }, ...]`, main titles first.
  titles jsonb not null default '[]'::jsonb,
  -- `[{ "volume": "1", "locale": "ja", "fileName": "..." }, ...]`. The file
  -- sits under `uploads.mangadex.org/covers/{mangadex_id}/`; the client builds
  -- the sized URL so it can route through its proxy.
  covers jsonb not null default '[]'::jsonb,
  -- Counts of what MangaDex hosts, from `/manga/{id}/aggregate`.
  volumes integer not null default 0,
  chapters integer not null default 0,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mangadex_series enable row level security;

create policy "mangadex_series are readable by everyone"
  on public.mangadex_series for select using (true);

grant select on public.mangadex_series to anon, authenticated;
