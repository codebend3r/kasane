-- Arc mappings for 20 more series.
--
-- Catalog data, not schema: one `series` row per show with its ordered
-- `arc_mappings` (and `movies` where a theatrical film qualifies), researched
-- per the `arc-mapping` skill. Episodes are cumulative across seasons; arcs
-- with null episodes are manga-only. Each series insert is guarded by
-- `on conflict (anilist_anime_id) do nothing`, so a re-run is a no-op.

-- JoJo's Bizarre Adventure: Diamond is Unbreakable (anime 21450 / manga 33006)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (21450, 33006, 'JoJo''s Bizarre Adventure: Diamond is Unbreakable', 'Single 39-episode TV season (Apr-Dec 2016); cumulative = broadcast numbering. Manga is Part 4 of the JoJo franchise, complete at 174 chapters (Part-local numbering 1-174 = franchise ch 266-439, Vols 29-47). Arc groupings follow the JoJo Wiki plot-summary sections, cut on episode boundaries from the wiki''s per-episode chapter coverage; the anime reorders ch 77-89 (ep 20 adapts ch 83-88 before eps 21-22 adapt ch 77-82) and interleaves ch 133-153 across eps 31-34, so those arcs are grouped at their outer boundaries. Other Parts are separate catalog entries per the JoJo per-part convention; the 2017 live-action film and the Thus Spoke Kishibe Rohan OVAs are excluded.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,  5,  1,   18,  'Welcome to Morioh / The Nijimura Brothers', null::int, null::text),
  (1, 6,  12, 19,  49,  'The Threat of Red Hot Chili Pepper', null, null),
  (2, 13, 16, 50,  64,  'A Brief Reprieve / Rohan Kishibe', null, null),
  (3, 17, 22, 65,  89,  'A Killer Lurks in Morioh', null, null),
  (4, 23, 25, 90,  105, 'Yoshikage Kira''s Escape', null, null),
  (5, 26, 30, 106, 132, 'The Threat of the Kiras', null, null),
  (6, 31, 34, 133, 152, 'July 15th (Thursday)', null, null),
  (7, 35, 39, 153, 174, 'Showdown Against Yoshikage Kira', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- JoJo's Bizarre Adventure: Golden Wind (anime 102883 / manga 33008)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (102883, 33008, 'JoJo''s Bizarre Adventure: Golden Wind', 'Single 39-episode TV season (Oct 2018-Jul 2019); cumulative = broadcast numbering, the three recap specials (13.5, 21.5, 28.5) are not counted. Manga is Part 5 (Vento Aureo), complete at 155 chapters (Part-local numbering 1-155 = franchise ch 440-594). Arc groupings follow the JoJo Wiki plot-summary sections, cut on episode boundaries; chapters split across episodes (ch 39 over eps 11-12, ch 128 over eps 32-33) go to the arc where the wiki''s story arc places them, and flashback pages pulled from later chapters (e.g. ch 45 in ep 6, ch 130 in ep 26) are ignored. Other Parts are separate catalog entries per the JoJo per-part convention.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,  4,  1,   16,  'Giorno Giovanna Joins Passione', null::int, null::text),
  (1, 5,  8,  17,  28,  'Polpo''s Fortune', null, null),
  (2, 9,  11, 29,  38,  'Guarding the Boss''s Daughter', null, null),
  (3, 12, 19, 39,  76,  'Express Train to Florence / The Way to Venice', null, null),
  (4, 20, 21, 77,  84,  'Venice / Bucciarati''s Betrayal', null, null),
  (5, 22, 28, 85,  111, 'The Way to Sardinia / Sardinia', null, null),
  (6, 29, 32, 112, 128, 'The Way to Rome', null, null),
  (7, 33, 39, 129, 155, 'Final Battle Against Diavolo', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- JoJo's Bizarre Adventure: Stone Ocean (anime 131942 / manga 33009)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (131942, 33009, 'JoJo''s Bizarre Adventure: Stone Ocean', 'Cumulative episodes across Netflix Stone Ocean (AniList 131942, 12 eps, Dec 2021) + Stone Ocean Part 2 (AniList 146722, 26 eps = cumulative 13-38, released as Netflix batches 13-24 in Sep 2022 and 25-38 in Dec 2022) = 38 total. Manga is Part 6, complete at 158 chapters (Part-local numbering 1-158 = franchise ch 595-752). Arc groupings follow the JoJo Wiki plot-summary sections, cut on episode boundaries; out-of-order pages (ch 75 flashbacks in eps 3 and 5, ch 58 opening ep 13, ch 127-134 interleaved across eps 30-31) are ignored in the ranges. Other Parts are separate catalog entries per the JoJo per-part convention.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,  5,  1,   20,  'Framed for Murder / The Legacy of DIO', null::int, null::text),
  (1, 6,  12, 21,  50,  'Star Platinum''s DISC', null, null),
  (2, 13, 18, 51,  74,  'Ermes''s Revenge / The Ultra Security House Unit', null, null),
  (3, 19, 22, 75,  95,  'Prison Escape & The Green Baby', null, null),
  (4, 23, 27, 96,  117, 'Jail House Lock / DIO''s Sons', null, null),
  (5, 28, 32, 118, 137, 'Orlando / Heavy Weather', null, null),
  (6, 33, 35, 138, 148, 'Cape Canaveral / C-MOON', null, null),
  (7, 36, 38, 149, 158, 'Made in Heaven', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- JoJo's Bizarre Adventure: Steel Ball Run (anime 190327 / manga 31706)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (190327, 31706, 'JoJo''s Bizarre Adventure: Steel Ball Run', 'Cumulative episodes across Netflix STEEL BALL RUN 1st STAGE (AniList 190327, a single 47-minute episode = ep 1, Mar 2026) + 2nd & 3rd STAGE (AniList 210482, 11 eps weekly from Sep 25 2026 = cumulative 2-12). As of 2026-09-28 only eps 1-2 have aired (ep 1 = ch 1-11, ep 2 = ch 12-14); later arcs carry null episodes until adapted. Manga is Part 7, complete at 95 long monthly chapters (Part-local numbering 1-95 = franchise ch 753-847). Arc names follow the JoJo Wiki plot-summary regions. The 1st STAGE''s 2026 Japanese theatrical screening is the same episode, not a separate film. Parts 1-6 are separate catalog entries per the JoJo per-part convention.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         1,         1,  11, 'The Steel Ball Run Begins (1st STAGE)', null::int, '1st STAGE is one double-length episode'::text),
  (1, 2,         2,         12, 14, 'Across the Arizona Desert (2nd STAGE)', null, null),
  (2, null::int, null::int, 15, 32, 'The West: First Battles', null, null),
  (3, null::int, null::int, 33, 44, 'The Midwest: Struggle for the Saint''s Corpse', null, null),
  (4, null::int, null::int, 45, 55, 'The North: To Accept Loss', null, null),
  (5, null::int, null::int, 56, 63, 'The Northeast: The Hunt Concludes', null, null),
  (6, null::int, null::int, 64, 89, 'The East Coast: The Power of the Saint''s Corpse', null, null),
  (7, null::int, null::int, 90, 95, 'New York City: The End of the Steel Ball Run', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Tokyo Ghoul:re (anime 100240 / manga 85611)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (100240, 85611, 'Tokyo Ghoul:re', 'Cumulative episodes across :re S1 (12, anime 100240) + :re S2 (12, anime 102351) = 24. Separate row from Part 1 Tokyo Ghoul (anime 20605 / manga 63327). Manga complete at 179 chapters in 16 volumes; AniList lists 181, so the final arc is extended to 181 to match. Heavy compression: S1 covers ch 1-59 (~5 chapters/episode) and S2 races through ch 60-179 (~10 chapters/episode), cutting and reordering material, so episode boundaries are approximate. Arc names and chapter ranges from the Tokyo Ghoul fandom wiki.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1, 2, 1, 7, 'Torso Investigation', 1, null::text),
  (1, 3, 3, 8, 16, 'Nutcracker Investigation', 1, 'Ep 2 opens the Nutcracker case.'),
  (2, 4, 6, 17, 31, 'Auction Mopping-Up Operation', 1, null),
  (3, 7, 10, 32, 45, 'Rose Investigation', 1, 'Ep 7 opens with the auction aftermath (Hinami''s arrest).'),
  (4, 11, 12, 46, 59, 'Tsukiyama Family Extermination', 1, 'Ep 10 sets up the raid.'),
  (5, 13, 16, 60, 98, 'Third Cochlea Raid / Rushima Landing Operation', 2, null),
  (6, 17, 18, 99, 116, 'Clown Siege / CCG Lab Infiltration', 2, 'Lab infiltration largely cut.'),
  (7, 19, 20, 117, 144, '24th Ward Raid', 2, null),
  (8, 21, 24, 145, 181, 'Dragon War', 2, 'final chapter is 179; 181 matches AniList''s count')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- The Flowers of Evil (anime 16201 / manga 54705)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (16201, 54705, 'The Flowers of Evil', 'Single 13-episode rotoscoped season (2013). Manga complete: 57 numbered chapters plus a vol. 3 Special Episode (ch. 17.5); AniList counts 58, so ranges use print numbering and the final arc is extended to 58 to match. The anime ends partway into vol. 4 (~ch. 20) with a flash-forward montage; the rest of the middle-school story (hideout, summer festival, ch. 21-33) and the whole high-school part (ch. 34-57) are unadapted. Episode-to-chapter edges are approximate.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         4,         1,  6,  'The Gym Clothes and the Contract', null::int, null::text),
  (1, 5,         7,         7,  12, 'Saeki and the Classroom Vandalism', null, null),
  (2, 8,         10,        13, 17, 'Aftermath and the Mountain Escape', null, 'vol. 3 Special Episode (ch. 17.5) follows'),
  (3, 11,        13,        18, 20, 'The Breakup and Nakamura''s Diary', null, 'ep 13 closes with a flash-forward montage of later chapters'),
  (4, null::int, null::int, 21, 27, 'The Hideout', null, null),
  (5, null::int, null::int, 28, 33, 'The Summer Festival', null, null),
  (6, null::int, null::int, 34, 47, 'High School: Tokiwa', null, null),
  (7, null::int, null::int, 48, 58, 'Homecoming and Reunion', null, 'print numbering ends at ch. 57; 58 matches AniList''s count')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Pandora Hearts (anime 5530 / manga 33031)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (5530, 33031, 'Pandora Hearts', 'Single 25-episode season (2009). Manga complete at 104 retraces (24 volumes); AniList lists 107, so the final arc is extended to 107 to match. Arc names and chapter ranges from the PandoraHearts Wiki''s per-chapter arc tags; eps 1-22 adapt retraces 1-32 faithfully. Eps 23-25 are an anime-original Chain Invasion ending and are left unmapped; the Sablier arc onward (ch. 33+) was never adapted.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         4,         1,  4,   'Coming-of-Age Ceremony', null::int, null::text),
  (1, 5,         11,        5,  13,  'Working for Pandora', null, null),
  (2, 12,        16,        14, 23,  'Cheshire Cat''s Lair', null, null),
  (3, 17,        20,        24, 28,  'Lutwidge Academy', null, null),
  (4, 21,        22,        29, 32,  'Break''s Past', null, 'eps 23-25 that follow are anime-original (Chain Invasion ending)'),
  (5, null::int, null::int, 33, 42,  'Sablier', null, null),
  (6, null::int, null::int, 43, 61,  'The Feast', null, null),
  (7, null::int, null::int, 62, 82,  'Jack''s Intention', null, null),
  (8, null::int, null::int, 83, 107, 'Swan Song', null, 'final retrace is 104; 107 matches AniList''s count')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Boruto: Naruto Next Generations (anime 97938 / manga 87178)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (97938, 87178, 'Boruto: Naruto Next Generations', 'Single 293-episode TV run (anime Part 1). Only about 70 episodes adapt the manga: eps 1-52, 67-147, 152-180 and 221-286 are anime-original (Academy, Byakuya Gang, Kara Actuation, Chunin Re-Examination, Sasuke Retsuden, etc.) and fall in the gaps between arcs; ep 1 does open with ch 1''s flash-forward. Manga Part 1 complete at 80 chapters; AniList lists 81, so the final arc is extended to 81 to match; the Omnipotence arc (ch 68-80) was never animated. Sequel manga Boruto: Two Blue Vortex (AniList 168468) and the announced Part 2 anime are out of scope. Episode-to-chapter data from the Naruto fandom wiki''s per-episode chapter lists.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 53, 66, 1, 10, 'Versus Momoshiki (Chunin Exams)', null::int, 'Retells Boruto: Naruto the Movie. The anime arc opens at ep 51 with two lead-in episodes.'),
  (1, 148, 151, 11, 15, 'Mujina Bandits', null, 'Eps 141-147 (Hozuki Castle) are anime-original.'),
  (2, 181, 187, 16, 23, 'Ao (Vessel)', null, 'Eps 178-180 are anime-original.'),
  (3, 188, 205, 24, 39, 'Kawaki: Kara Clash', null, null),
  (4, 206, 220, 40, 55, 'Kawaki: Otsutsuki Awakening', null, 'Ep 220 previews ch 56-58 before the anime-original run (eps 221-286).'),
  (5, 287, 293, 56, 67, 'Code''s Assault', null, 'Anime Part 1 finale; ep 293 also adapts parts of ch 68 and 70.'),
  (6, null::int, null::int, 68, 81, 'Omnipotence', null, 'Not animated yet; final chapter is 80, 81 matches AniList''s count.')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

insert into movies
  (series_id, position, anilist_id, title, year, chapter_start, chapter_end, after_episode, note)
select id, v.* from series, (values
  (0, 21220, 'Boruto: Naruto the Movie', 2015, 1, 10, 52,
     'Original telling of the Chunin Exams / Momoshiki story; manga ch 1-10 and TV eps 53-66 later retell it.')
) as v(position, anilist_id, title, year, chapter_start, chapter_end, after_episode, note)
where series.anilist_anime_id = 97938
  and not exists (select 1 from movies m where m.series_id = series.id);

-- Lookism (anime 158539 / manga 86848)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (158539, 86848, 'Lookism', 'Single 8-episode Netflix ONA (Studio Mir, 2022) adapting ch. 1-27 with light reordering; continue from ch. 28 (Paprika TV). Webtoon ongoing (Korean ch. 619 as of Sep 2026; official English WEBTOON at ch. 615, same numbering). Arc names and ranges from the Lookism Wiki arc guide and WEBTOON episode titles; the many short post-anime arcs are grouped into larger blocks, with the constituent arcs listed in each note.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1, 3, 1, 14, 'Exposition / Breakaway', null::int, 'Daniel''s new body, J High, Jiho and the Gian High punks'::text),
  (1, 4, 5, 15, 20, 'Zack Lee / Vasco / Jay Hong', null, 'Mom''s visit, the fight with Vasco, Jay''s birthday gift'),
  (2, 6, 8, 21, 27, 'Festival', null, 'Duke Pyeon and the school festival performance'),
  (3, null::int, null::int, 28, 111, 'Paprika TV to PTJ Entertainment', null, 'Paprika TV, Secondhand Rana, Autumn Boot Camp, Euntae Lee, Abandoned Dog Enu, Fitting Model, Illegal Toto, Sports Festival, PTJ Entertainment and other short arcs'),
  (4, null::int, null::int, 112, 171, 'Stalker to Fake Bank Account', null, 'Stalker, Second Year, Troubled Transfer, First Love, Cult, Picnic, Animal Cruelty, Thanksgiving, Seonong Goes to Seoul, Crystal''s Investigation, Fake Bank Account'),
  (5, null::int, null::int, 172, 231, 'Daniel Park''s Death / God Dog / Runaway Fam', null, 'Daniel Park''s Death, Juvenile Prison, Homeless, Daniel Park vs. Logan Lee, God Dog, Jacedaichi Case Files, Runaway Fam'),
  (6, null::int, null::int, 232, 301, 'Eli Jang / Hostel / Workers (4th Affiliate)', null, 'Eli Jang, Hostel Branch, One Night, Hostel, Daniel Park vs. Gun, Workers (4th Affiliate), vs. Johan Seong'),
  (7, null::int, null::int, 302, 353, 'Jake Kim / Workers (3rd Affiliate)', null, 'Jake Kim, One Night II, Club, Workers (3rd Affiliate), The Summit Meeting'),
  (8, null::int, null::int, 354, 403, 'James Lee / Workers (2nd Affiliate)', null, 'James Lee, One Night III, Jiho''s Last Moment, Workers (2nd Affiliate), The Kidnapping of Daniel Park, The Hunt for Hostel'),
  (9, null::int, null::int, 404, 481, 'First Generation King / Workers (1st Affiliate)', null, 'First Generation King, The Hunt for Big Deal, Holidays 2, Funeral, Lookism, Workers (1st Affiliate), Gun''s Choice, The King of..'),
  (10, null::int, null::int, 482, 548, 'Cheonliang / The Hunt for Gun / Busan', null, 'Cheonliang, The Hunt for Gun, White Ghost, Busan'),
  (11, null::int, null::int, 549, 619, 'Incheon / The Hunt for the Workers / Gapryong Kim', null, 'Gapryong Kim''s Disciple, Cheonmyeong, Incheon, War Begins, The Hunt for the Workers, Gapryong Kim (ongoing)')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Blade of the Immortal (anime 109616 / manga 30658)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (109616, 30658, 'Blade of the Immortal', 'Mapped to the 2019 full-manga adaptation Blade of the Immortal -Immortal- (Mugen no Juunin: IMMORTAL, 24 eps), roughly 8-9 acts per episode. The partial 2008 TV series (anime 4151, 13 eps) covers only about acts 0-24 and is not mapped. Chapters use the manga''s act numbering (Antelude = 0, Acts 1-205, Final Act = 206; 207 chapters in 30 volumes, matching MangaDex); AniList lists 219, so the final arc is extended to 219 to match. The 2019 anime reorders acts 4-13 and skips or compresses side acts, so boundaries are approximate. Sequel manga Bakumatsu Arc is out of scope.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1, 7, 0, 24, 'Introduction: Manji and Rin', null::int, 'Eps 3-5 air Dreamsong and Rin''s Bane (acts 7-13) before Cry of the Worm (acts 4-6).'),
  (1, 8, 9, 25, 52, 'Mugai-ryu and the Gathering', null, null),
  (2, 10, 12, 53, 80, 'Road to Kaga', null, 'Acts 64-74 are largely cut.'),
  (3, 13, 13, 81, 83, 'Twilight (Mugai-ryu Banquet Massacre)', null, null),
  (4, 14, 17, 84, 134, 'Prison: On the Perfection of Anatomy', null, null),
  (5, 18, 19, 135, 160, 'Rokki-dan Pursuit', null, null),
  (6, 20, 20, 161, 169, 'Blizzard (Shira''s Last Stand)', null, null),
  (7, 21, 24, 170, 219, 'Winter War Finale', null, 'Acts 178-195 compressed into eps 22-23; Final Act is 206, 219 matches AniList''s count.')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- The Fable (anime 166910 / manga 94490)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (166910, 94490, 'The Fable', 'Single 25-episode TV anime (Tezuka Productions, 2024) adapting Part 1 ch. 1-135 (episode titles reuse chapter titles, which pins the splits); continue from ch. 136. Part 1 manga complete at 240 chapters (22 volumes); the Yamaoka arc is unadapted (a second season covering it is announced but unreleased). The sequels The Fable: The Second Contact (86 ch.) and The Fable: The Third Secret are separate manga and not mapped here. The 2019 and 2021 films are live action and excluded.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1, 5, 1, 25, 'Moving to Osaka / Joining Octopus', null::int, 'Ebihara''s test, Misaki and the Octopus design company'::text),
  (1, 6, 13, 26, 68, 'Kojima Arc', null, 'Kojima''s release through Ebihara and Sunagawa''s settlement'),
  (2, 14, 16, 69, 87, 'Survival Training Interlude', null, null),
  (3, 17, 25, 88, 135, 'Utsubo Arc', null, 'Ep 25 closes with an anime-original Christmas party'),
  (4, null::int, null::int, 136, 240, 'Yamaoka Arc', null, 'Opens with the rest of the Christmas and New Year chapters; ends Part 1')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Whisper Me a Love Song (anime 160181 / manga 107987)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (160181, 107987, 'Whisper Me a Love Song', 'Single 12-episode season (eps 11-12 delayed to Dec 2024). Manga ongoing in Comic Yuri Hime (current ch. 66, Oct 2026 issue; 12 volumes). Anime ends at ch. 44 (vol. 9); continue from ch. 45. Episode boundaries inferred from episode titles, which reuse chapter titles; the anime skips ch. 30-32 and most of 33. No formal arcs, so segments are story beats.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1, 4, 1, 10, 'Rooftop Confession', null::int, null::text),
  (1, 5, 6, 11, 17, 'Yori''s Song', null, null),
  (2, 7, 9, 18, 33, 'Laureley & the Audition Wager', null, 'Anime skips ch. 30-32 and most of 33'),
  (3, 10, 12, 34, 44, 'Kyou''s Past & the School Festival', null, null),
  (4, null::int, null::int, 45, 56, 'After the Festival: Ayaka & Miki', null, null),
  (5, null::int, null::int, 57, 66, 'Futures & Queen Records', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Why Raeliana Ended Up at the Duke's Mansion (anime 151847 / manga 104973)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (151847, 104973, 'Why Raeliana Ended Up at the Duke''s Mansion', 'Single 12-episode TV anime (Typhoon Graphics, 2023) adapting webtoon Season 1 (ch. 1-50, touching the opening of ch. 51); continue from ch. 51. Mapped to the webtoon (Whale''s KakaoPage adaptation of Milcha''s novel), complete at 158 chapters: S1 1-50, S2 51-87, S3 88-121, S4 122-147, side stories 148-158. The ep 3/ch 14 and ep 4/ch 15 splits are community-confirmed; the ch. 28/29 and 44/45 splits inside Season 1 follow an approximate ~4-chapters-per-episode guide.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1, 3, 1, 14, 'The Contract', null::int, 'Raeliana''s fake-engagement deal with Noah and the move to the Wynknight mansion'::text),
  (1, 4, 6, 15, 28, 'Vivian / The Abduction', null, 'Vivian Shamall''s debut; Raeliana is kidnapped'),
  (2, 7, 10, 29, 44, 'Monster Hunt / The Holy Lighting', null, 'Sycret Mountains hunt; temple purification and Heika Demint'),
  (3, 11, 12, 45, 50, 'Beatrice''s Trail / The Royal Seal', null, 'Anime ends at the close of webtoon Season 1'),
  (4, null::int, null::int, 51, 87, 'Season 2', null, null),
  (5, null::int, null::int, 88, 121, 'Season 3', null, null),
  (6, null::int, null::int, 122, 147, 'Season 4 (Finale)', null, null),
  (7, null::int, null::int, 148, 158, 'Side Stories', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Viral Hit (anime 174653 / manga 121991)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (174653, 121991, 'Viral Hit', 'Single 12-episode TV anime (Okuruto Noboru, 2024) adapting ch. 1-26 (ep 12 trims the tail of ch. 26); continue from ch. 27. Webtoon complete at 218 numbered chapters (Season 1 ch. 1-134, Season 2 ch. 135-218); AniList''s 222 also counts the four special episodes Naver ran between ch. 134 and 135, so the final arc is extended to 222 to match. Episode splits from per-episode anime-vs-manhwa chapter lists; post-anime arcs named after Hobin''s main opponents from Viral Hit Wiki chapter summaries. Season 2 boundaries (ch. 156/157) are approximate.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1, 5, 1, 12, 'Newtube Debut / VS Pakgo', null::int, 'Hobin''s first viral fight, Jihyeok, Bomi, and the rematch with Pakgo'::text),
  (1, 6, 8, 13, 19, 'VS Taehun Seong', null, 'Gaeul joins as editor; the combat-taekwondo bully'),
  (2, 9, 12, 20, 26, 'Comedy Crew / VS Mangi Hwang', null, 'Anime ends partway through ch. 26'),
  (3, null::int, null::int, 27, 34, 'VS Hyeonsu Lee (Viral Hook)', null, 'Demonetization and the copycat channel'),
  (4, null::int, null::int, 35, 49, 'XJ Company / VS Wangguk Han', null, 'OnePunchTV and Gyeoul; the Hobin Yoo Company is founded'),
  (5, null::int, null::int, 50, 74, 'Beach Trip / VS Jisu Ju', null, 'Taehun''s past with Dowoon, Taehun vs. Yeonwoo Ji, Pakgo''s return'),
  (6, null::int, null::int, 75, 102, 'VS Seongjun Baek', null, '244''s studio, exposing XJ Company, Seongjun''s past'),
  (7, null::int, null::int, 103, 134, 'VS Munseong Kim / VS 244', null, 'Samdak''s last video and the New International Branch; Season 1 finale'),
  (8, null::int, null::int, 135, 156, 'TroubleshooterTV / Joseong Academy', null, 'Season 2 opens; Eunwoo Kang joins'),
  (9, null::int, null::int, 157, 222, 'Runaway Fam / Final Battle vs. Jinho Lee', null, 'Series finale at ch. 218; 222 matches AniList''s count')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Please Put Them On, Takamine-san (anime 179965 / manga 107559)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (179965, 107559, 'Please Put Them On, Takamine-san', 'Single 12-episode season. Manga ongoing in Monthly Gangan Joker (current ch. 71; 11 volumes); each chapter runs as two magazine parts. Anime ends at ch. 29 (vol. 5); continue from ch. 30. The anime reorders some early chapters and adds original fan-service, so ranges are approximate. No formal arcs; post-anime segments follow the volume blurbs.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1, 5, 1, 12, 'Takamine''s Closet', null::int, 'Anime reorders chapters within this range'),
  (1, 6, 7, 13, 17, 'Summer Sleepover & Aogaku Open Day', null, null),
  (2, 8, 9, 18, 23, 'Ellie Evergreen', null, null),
  (3, 10, 12, 24, 29, 'Culture Festival: Cinderella', null, null),
  (4, null::int, null::int, 30, 39, 'Finals & Christmas', null, null),
  (5, null::int, null::int, 40, 57, 'Akanishi-senpai & Shirota''s Feelings', null, null),
  (6, null::int, null::int, 58, 63, 'School Trip & the Deserted Island', null, null),
  (7, null::int, null::int, 64, 71, 'Hina: The New Closet', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Kengan Ashura (anime 100891 / manga 86265)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (100891, 86265, 'Kengan Ashura', 'Cumulative episodes across Season 1 = Part I (12, anime 100891) + Part II (12, anime 111048), and Season 2 = Part 1 (12, anime 146638) + Part 2 (16, anime 169692), 52 in total. Manga complete at 236 numbered chapters in 27 volumes; AniList''s 260 also counts the ~24 volume extras, so the final arc is extended to 260 to match. The anime adapts the whole manga. Prequel Kengan Ashura Zero, sequel manga Kengan Omega and the Baki Hanma VS Kengan Ashura crossover special are out of scope. Season 1 episode-to-chapter data from the Kenganverse fandom wiki; Season 2 boundaries matched from episode and chapter titles.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1, 4, 1, 24, 'Kengan Matches (Ohma''s Debut)', 1, null::text),
  (1, 5, 7, 25, 42, 'Preliminaries & the S.S. Kengan', 1, null),
  (2, 8, 20, 43, 116, 'Annihilation Tournament: Round 1', 1, null),
  (3, 21, 24, 117, 136, 'Round 2: Cosmo vs. Akoya, Ohma vs. Raian', 1, null),
  (4, 25, 34, 137, 170, 'Round 2 (Continued)', 2, null),
  (5, 35, 36, 171, 181, 'Hayami''s Coup / Niko Style Secret', 2, null),
  (6, 37, 42, 182, 207, 'Quarter-Finals', 2, null),
  (7, 43, 45, 208, 214, 'Ohma vs. Kiryu', 2, null),
  (8, 46, 49, 215, 226, 'Semi-Finals', 2, null),
  (9, 50, 52, 227, 260, 'Finals & Epilogue', 2, 'story ends at ch. 236; 237-260 are AniList''s count of volume extras')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Medaka Kuroiwa is Impervious to My Charms (anime 177552 / manga 134369)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (177552, 134369, 'Medaka Kuroiwa is Impervious to My Charms', 'Season 1 (12 eps) only; season 2 is announced but unreleased. Manga ongoing in Weekly Shonen Magazine (current ch. 238, Sept 2026; 25 volumes). Anime ends at ch. 44 (vol. 5); continue from ch. 45. The anime skips ch. 4 and 14, and the finale''s closing scene is anime-original. No formal arcs; post-anime segments follow the volume blurbs, and boundaries after ch. 172 are estimated at 9 chapters per volume.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1, 4, 1, 14, 'Mona vs. Medaka & the School Festival', null::int, 'Anime skips ch. 4 and 14'),
  (1, 5, 8, 15, 28, 'Asahi''s Challenge', null, null),
  (2, 9, 12, 29, 44, 'Tomo, the Amusement Park & First Love', null, null),
  (3, null::int, null::int, 45, 68, 'First Date & the Miss Contest', null, null),
  (4, null::int, null::int, 69, 118, 'Christmas & the Three-Way Love War', null, null),
  (5, null::int, null::int, 119, 147, 'Valentine''s & White Day', null, null),
  (6, null::int, null::int, 148, 181, 'Third Year & the Sports Festival', null, null),
  (7, null::int, null::int, 182, 238, 'Asahi''s Date & the School Trip', null, 'Boundaries estimated from volume blurbs')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Eyeshield 21 (anime 15 / manga 30043)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (15, 30043, 'Eyeshield 21', 'Single 145-episode season (2005-2008). Manga complete at 333 chapters (37 volumes). Boundaries follow the Eyeshield 21 Wiki''s story-arc and per-episode chapter lists; the anime reorders and pads material, so episode edges are approximate. Anime-original eps 88-100 (Cream Puff Cup, Kanto lead-in) are left unmapped, and the anime-original Death Game eps 102-105 sit inside the Shinryuji arc. The anime stops after the Ojo semifinal (ch. 240) with an anime-original epilogue; the Kanto final, Christmas Bowl and Youth World Cup (ch. 241-333) were never adapted.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         8,         1,   20,  'Spring Tournament', null::int, null::text),
  (1,  9,         16,        21,  33,  'Zokugaku Chameleons', null, 'eps 15-16 anime-original'),
  (2,  17,        21,        34,  52,  'Taiyo Sphinx', null, null),
  (3,  22,        28,        53,  71,  'NASA Aliens', null, 'eps 22, 27-28 anime-original'),
  (4,  29,        36,        72,  88,  'Death March', null, null),
  (5,  37,        54,        89,  111, 'Fall Tournament Opening Rounds', null, 'Amino Cyborgs and the early autumn rounds; several anime-original episodes'),
  (6,  55,        63,        112, 127, 'Kyoshin Poseidons', null, null),
  (7,  64,        74,        128, 150, 'Seibu Wild Gunmen', null, null),
  (8,  75,        87,        151, 167, 'Bando Spiders', null, 'Tokyo final; eps 88-100 that follow are anime-original (Cream Puff Cup)'),
  (9,  101,       119,       168, 200, 'Shinryuji Nagas', null, 'eps 102-105 anime-original (Death Game)'),
  (10, 120,       129,       201, 209, 'Kanto Quarterfinals / Ojo Festival', null, 'eps 122-128 padded with anime-original matches'),
  (11, 130,       145,       210, 240, 'Ojo White Knights (Kanto Semifinal)', null, 'ep 145 ends on an anime-original epilogue'),
  (12, null::int, null::int, 241, 274, 'Hakushu Dinosaurs (Kanto Final)', null, null),
  (13, null::int, null::int, 275, 304, 'Christmas Bowl', null, null),
  (14, null::int, null::int, 305, 333, 'Youth World Cup', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Mission: Yozakura Family (anime 158898 / manga 111149)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (158898, 111149, 'Mission: Yozakura Family', 'Cumulative episodes across S1 (27, 2024) + S2 (12, spring 2026) = 39; S2 Part 2 (AniList 213657) premieres Oct 11 2026 and is not counted yet. Manga complete at 259 chapters (29 volumes). Arc names are the Mission: Yozakura Family Wiki''s community names. The anime reorders chapters heavily (e.g. ch. 18 in ep 27, ch. 32-33 in ep 17, ch. 38 in ep 29), so boundaries are arc-level approximations from the wiki''s per-episode adapted-chapter lists.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         3,         1,   4,   'Introduction', 1, null::text),
  (1,  4,         6,         5,   18,  'Flower Bin / PoPoPPo', 1, 'Flower Bin chapters condensed into eps 4-5'),
  (2,  7,         10,        19,  26,  'Kuroyuri', 1, null),
  (3,  11,        13,        27,  39,  'Marble Decoding', 1, null),
  (4,  14,        17,        40,  51,  'Tanpopo Invasion', 1, null),
  (5,  18,        20,        52,  60,  'Gerbera', 1, null),
  (6,  21,        27,        61,  85,  'Skeleton Island', 1, null),
  (7,  28,        32,        86,  97,  'Silver Rank Exam', 2, null),
  (8,  33,        36,        98,  116, 'Kawashita Interrogation / Yozakura Roots', 2, 'ch. 113-116 not yet adapted'),
  (9,  37,        39,        117, 129, 'Kyoichiro Disappearance', 2, null),
  (10, null::int, null::int, 130, 142, 'Momo Meeting / Spy Association', null, null),
  (11, null::int, null::int, 143, 161, 'Sibling Search', null, null),
  (12, null::int, null::int, 162, 173, 'Visitor / Wanted List', null, null),
  (13, null::int, null::int, 174, 193, 'Spy Academy / Nanao Dungeon', null, null),
  (14, null::int, null::int, 194, 202, 'Shinzo Wedding', null, null),
  (15, null::int, null::int, 203, 222, 'Split Investigation', null, null),
  (16, null::int, null::int, 223, 255, 'Yozakura All-Out War', null, null),
  (17, null::int, null::int, 256, 259, 'Epilogue', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Kowloon Generic Romance (anime 182814 / manga 112544)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (182814, 112544, 'Kowloon Generic Romance', 'Single 13-episode season. Manga complete at 108 chapters (12 volumes, Apr 2026). The anime follows the manga through ch. 82; eps 12-13 are an anime-original finale that loosely reworks ch. 83-91. Continue from ch. 92, or from ch. 83 for the manga version of those events. The 2025 live-action film is excluded. No formal arcs, so segments are story beats taken from episode-to-chapter guides.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1, 3, 1, 25, 'Wong Loi Realty & Kujirai B''s Photo', null::int, null::text),
  (1, 4, 6, 26, 51, 'Generic Terra & the Zirconian Project', null, null),
  (2, 7, 9, 52, 70, 'Gwen, Miyuki & the Generics', null, null),
  (3, 10, 11, 71, 82, 'Xiaohei & Bai Yuen Shan', null, null),
  (4, 12, 13, 83, 91, 'Kujirai B''s Death', null, 'Anime-original finale that loosely reworks these chapters'),
  (5, null::int, null::int, 92, 108, 'Finale', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);
