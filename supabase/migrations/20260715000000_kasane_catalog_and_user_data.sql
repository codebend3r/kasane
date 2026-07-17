-- kasane: catalog + user-data schema
--
-- Catalog tables (series, arc_mappings, movies, search_aliases, genre_filters)
-- are public read-only: anyone can SELECT, nobody writes from the client.
-- Writes happen via the Supabase dashboard / service role only.
--
-- User tables (user_progress, user_preferences) are owner-scoped via RLS.

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

create table public.series (
  id bigint generated always as identity primary key,
  anilist_anime_id integer not null unique,
  anilist_manga_id integer not null,
  title text not null,
  source_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index series_anilist_manga_id_idx on public.series (anilist_manga_id);

create table public.arc_mappings (
  id bigint generated always as identity primary key,
  series_id bigint not null references public.series (id) on delete cascade,
  position integer not null,
  episode_start integer,
  episode_end integer,
  chapter_start integer not null,
  chapter_end integer not null,
  arc text,
  season integer,
  note text,
  unique (series_id, position),
  constraint arc_episodes_paired check ((episode_start is null) = (episode_end is null))
);
create index arc_mappings_series_id_idx on public.arc_mappings (series_id);

create table public.movies (
  id bigint generated always as identity primary key,
  series_id bigint not null references public.series (id) on delete cascade,
  position integer not null,
  anilist_id integer,
  title text not null,
  year integer not null,
  chapter_start integer,
  chapter_end integer,
  after_episode integer,
  note text,
  unique (series_id, position),
  constraint movie_chapters_paired check ((chapter_start is null) = (chapter_end is null))
);
create index movies_series_id_idx on public.movies (series_id);

create table public.search_aliases (
  alias text primary key,
  target text not null
);

create table public.genre_filters (
  id text primary key,
  label text not null,
  kind text not null check (kind in ('genre', 'tag')),
  token text not null,
  sort_order integer not null
);

-- ---------------------------------------------------------------------------
-- User data
-- ---------------------------------------------------------------------------

create table public.user_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  route_id integer not null,
  side text not null check (side in ('anime', 'manga')),
  position integer not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, route_id, side)
);

create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  japanese boolean not null default false,
  hidden_genres text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.series enable row level security;
alter table public.arc_mappings enable row level security;
alter table public.movies enable row level security;
alter table public.search_aliases enable row level security;
alter table public.genre_filters enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_preferences enable row level security;

create policy "series are readable by everyone"
  on public.series for select using (true);
create policy "arc_mappings are readable by everyone"
  on public.arc_mappings for select using (true);
create policy "movies are readable by everyone"
  on public.movies for select using (true);
create policy "search_aliases are readable by everyone"
  on public.search_aliases for select using (true);
create policy "genre_filters are readable by everyone"
  on public.genre_filters for select using (true);

create policy "users manage their own progress"
  on public.user_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "users manage their own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Grants (RLS still gates rows; these gate table access per role)
-- ---------------------------------------------------------------------------

grant select on
  public.series,
  public.arc_mappings,
  public.movies,
  public.search_aliases,
  public.genre_filters
  to anon, authenticated;

grant select, insert, update, delete on
  public.user_progress,
  public.user_preferences
  to authenticated;
