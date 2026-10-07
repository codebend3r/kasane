-- Arc mappings for 45 more series.
--
-- Catalog data, not schema: one `series` row per show with its ordered
-- `arc_mappings` (and `movies` where a theatrical film qualifies), researched
-- per the `arc-mapping` skill. Episodes are cumulative across seasons; arcs
-- with null episodes are manga-only. Each series insert is guarded by
-- `on conflict (anilist_anime_id) do nothing` and each movie insert by a
-- `not exists` check, so a re-run is a no-op.

-- LIAR GAME (anime 197754 / manga 31649)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (197754, 31649, 'LIAR GAME', 'Single 26-episode TV season (two continuous cours, Apr-Sep 2026, Madhouse). A 2nd season (AniList 217460) was announced on 2026-09-29 and has not aired. Manga complete at 201 chapters (19 volumes, 2005-2015). The 2026 sequel LIAR GAME: The Last Game is a separate AniList entry (208260) and is not mapped here. Arcs follow the tournament rounds as listed on Japanese Wikipedia, with chapter edges from the English chapter list and its volume summaries. Episode edges come from the episode titles, which reuse the manga''s chapter titles (ep 1 = ch 1, ep 5 = ch 11 Alliance, ep 8 = ch 19 Downsizing Game, ep 12 = ch 33 Yokoya, ep 23 = ch 68 Centerfield), and from the official episode synopses, so they may be off by a chapter. Season 1 ends with the Stationary Roulette, closing the second revival round (ch. 83). The 2007-2010 live-action drama and its two films are excluded.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         3,         1,   6,   'First Round: The 100 Million Yen Game', null::int, null::text),
  (1, 4,         7,         7,   17,  'Second Round: The Minority Game', null, null),
  (2, 8,         10,        18,  28,  'First Revival Round: The Downsizing Game', null, 'ch. 18 (Akiyama''s past and the revival-round invitation) closes ep 7'),
  (3, 11,        20,        29,  59,  'Third Round: The Contraband Game', null, null),
  (4, 21,        26,        60,  83,  'Second Revival Round: Three-on-Three Matches', null, 'Russian roulette, 17 Poker and the Stationary Roulette'),
  (5, null::int, null::int, 84,  102, 'Fourth Round Preliminary: The Pandemic Game', null, null),
  (6, null::int, null::int, 103, 138, 'Fourth Round: Musical Chairs', null, null),
  (7, null::int, null::int, 139, 169, 'Third Revival Round: Bid Poker', null, null),
  (8, null::int, null::int, 170, 183, 'Final Round: Amidakuji and the Human Auction', null, null),
  (9, null::int, null::int, 184, 201, 'Final Round: The Four Kingdoms Game', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Medaka Box (anime 11761 / manga 43949)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (11761, 43949, 'Medaka Box', 'Cumulative episodes across Medaka Box (AniList 11761, 12 eps, Apr-Jun 2012) + Medaka Box Abnormal (AniList 14527, 12 eps = cumulative 13-24, Oct-Dec 2012). Manga complete at 192 chapters (22 volumes). AniList lists 194, so the final arc is extended to 194 to match. Arc names and chapter ranges from the Medaka Box Wiki''s story-arc infoboxes: S1 adapts the Student Council Executive arc (ch 1-21) and Abnormal adapts the Thirteen Party arc (ch 22-55), ending as Kumagawa appears. Ep 24 adapts the Good Loser Kumagawa spin-off novel rather than the manga and is left unmapped. Everything from the Kumagawa Incident arc (ch 56) onward was never animated.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         12,        1,   21,  'Student Council Executive', 1, null::text),
  (1, 13,        23,        22,  55,  'Thirteen Party', 2, 'ep 24 adapts the Good Loser Kumagawa spin-off novel and is left unmapped'),
  (2, null::int, null::int, 56,  92,  'Kumagawa Incident', null, null),
  (3, null::int, null::int, 93,  140, 'Kurokami Medaka''s Successor', null, null),
  (4, null::int, null::int, 141, 158, 'Jet Black Bride', null, null),
  (5, null::int, null::int, 159, 185, 'Unknown Shiranui', null, null),
  (6, null::int, null::int, 186, 190, 'Bouquet Toss to the Future', null, null),
  (7, null::int, null::int, 191, 194, 'Epilogue', null, 'print numbering ends at ch. 192, 194 matches AniList''s count')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Helck (anime 145140 / manga 86720)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (145140, 86720, 'Helck', 'Single 24-episode TV season (two continuous cours, Jul-Dec 2023). Manga complete: chapter 0 (Cave of Trials) plus chapters 1-106 in 12 volumes. AniList lists 117, so the final arc is extended to 117 to match. Arc names and chapter ranges from the Helck Wiki''s Story Arcs page. Episode coverage comes from the wiki''s per-episode adapted-chapter fields: about three chapters per episode, ending with ep 24 = ch 68-70. The anime stops at ch 70, the opening of the Save the Humans arc, and everything from ch 71 is unadapted. The sequel manga Völundio is a separate work and is not mapped.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         4,         0,   12,  'Demon King Tournament', null::int, 'ch. 0 is the Cave of Trials prologue'::text),
  (1, 5,         7,         13,  21,  'Remote Island', null, null),
  (2, 8,         12,        22,  35,  'Journey', null, 'ch. 22, the wiki''s last Remote Island chapter, opens ep 8'),
  (3, 13,        18,        36,  52,  'Helck''s Past', null, 'ep 12 ends partway into ch. 36'),
  (4, 19,        20,        53,  58,  'Phase One', null, null),
  (5, 21,        24,        59,  70,  'Phase Two', null, 'ch. 70, the opening of the Save the Humans arc, closes ep 24'),
  (6, null::int, null::int, 71,  105, 'Save the Humans', null, null),
  (7, null::int, null::int, 106, 117, 'Epilogue', null, 'print numbering ends at ch. 106, 117 matches AniList''s count')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- BLACK TORCH (anime 187538 / manga 98148)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (187538, 98148, 'BLACK TORCH', 'Single 12-episode TV season (Jul-Sep 2026) that adapts the whole manga. Manga complete at 19 long monthly chapters (5 volumes, Jump SQ then Shonen Jump+, 2017-2018). AniList lists 28, so the final arc is extended to 28 to match. Every episode is titled after a chapter it adapts (eps 1-4 = ch 1-4, ep 5 Young Gunz = ch 6, ep 6 Turn Up = ch 8, ep 7 3 on Three = ch 10, ep 8 Underdog = ch 11, ep 9 ONE = ch 13, ep 10 Deadly Skillz = ch 15, ep 11 Black or White = ch 18, ep 12 Once Again = ch 19). Boundaries are anchored on those titles plus the episode synopses and Viz volume blurbs, so they are approximate within a chapter. Arc names are descriptive because the Black Torch wiki has no arc list.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,  3,  1,  3,  'Jiro and Rago', null::int, null::text),
  (1, 4,  6,  4,  8,  'Squad Black Torch / Fuyo''s Training', null, null),
  (2, 7,  8,  9,  12, 'The Hirasaka Murders / Amagi''s Ambush', null, 'ends with Rago leaving Jiro to join Amagi'),
  (3, 9,  10, 13, 16, 'Reclaiming Rago''s Power', null, null),
  (4, 11, 12, 17, 28, 'Final Battle with Amagi', null, 'manga ends at ch. 19, 28 matches AniList''s count')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Mistress Kanan is Devilishly Easy (anime 190704 / manga 149893)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (190704, 149893, 'Mistress Kanan is Devilishly Easy', 'Single 12-episode TV season (Apr-Jun 2026). A 2nd season (AniList 213363) was announced after the finale and has not aired. Manga ongoing in Weekly Shonen Magazine (current ch. 199 on Magazine Pocket as of 2026-10-07, 14 volumes). Episodic romantic comedy whose episode titles reuse chapter titles (ep 2 = ch 8, ep 3 = ch 14, ep 4 = ch 17, ep 6 = ch 26, ep 8 = ch 32, ep 9 = ch 37, ep 10 = ch 46, ep 11 = ch 52). These anchor the arc edges, so episode edges are approximate. The anime ends with the Demon Realm summer trip (ch 57), and ep 12 borrows ch 33''s title for Beelzebub''s final trial. Ep 7 pulls the exam-study and summer-promise chapters (19-20) in after Jeanne''s arrival. Arcs past the anime are grouped from Magazine Pocket chapter titles because the series has no wiki arc list.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         4,         1,   18,  'Kanan Meets Kyougi', null::int, null::text),
  (1,  5,         7,         19,  31,  'The Saint Jeanne and Summer Break', null, 'ep 7 adapts ch. 19-20 after the Jeanne chapters'),
  (2,  8,         9,         32,  40,  'Demon Realm: Lilim''s Approval', null, null),
  (3,  10,        11,        41,  53,  'Demon Realm: Milch and Miel', null, null),
  (4,  12,        12,        54,  57,  'Demon Realm: Beelzebub''s Final Trial', null, null),
  (5,  null::int, null::int, 58,  70,  'Summer Back Home', null, null),
  (6,  null::int, null::int, 71,  89,  'The Sisters at School and the Student Council President', null, null),
  (7,  null::int, null::int, 90,  100, 'Dates and Rivalries', null, null),
  (8,  null::int, null::int, 101, 140, 'Culture Festival and the Miss Contest', null, null),
  (9,  null::int, null::int, 141, 155, 'The Overnight Hot Spring Date', null, null),
  (10, null::int, null::int, 156, 177, 'Dodgeball and Autumn Days', null, null),
  (11, null::int, null::int, 178, 187, 'Christmas and New Year''s', null, null),
  (12, null::int, null::int, 188, 199, 'Winter Training Camp', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- xxxHOLiC (anime 861 / manga 30010)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (861, 30010, 'xxxHOLiC', 'Cumulative episodes across xxxHOLiC (AniList 861, 24 eps, 2006) + xxxHOLiC Kei (AniList 3091, 13 eps = cumulative 25-37, 2008) = 37. Manga complete at 213 chapters in 19 volumes (AniList lists 214, so the final arc is extended to 214). Chapter columns use the Japanese serialization numbering that AniList counts (the Del Rey / MangaDex tankobon numbering merges installments into 111 chapters). Serialization numbers for ch 97-213 come from the xxxHOLiC Wiki chapter pages (Rou opens at ch 186 per Japanese Wikipedia), and earlier boundaries are reconstructed from tankobon page counts at 12 installments per volume (vol 9 = ch 97-108), so the season-1/Kei edge is approximate (about 2 chapters either way). Season 1 is an episodic, out-of-order adaptation of tankobon ch 1-40 (= ch 1-69 here), with ep 17 taken from the AnotherHOLiC novel and ep 24 a side story. Kei follows vols 6-13 but reorders the back half and drops the Tsubasa crossover chapters (the Syaoran clone, Sakura''s dreams). The anime cuts most Tsubasa references, so the companion Tsubasa RESERVoir CHRoNiCLE entry is mapped separately. The Shunmuki (2009), Rou (2010) and Rou Adayume (2011) OVAs are not TV and are not counted. The sequel manga xxxHOLiC Rei, the 2013 drama and the 2022 live-action film are out of scope.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         24,        1,   69,  'Yuko''s Shop', 1::int, 'Episodic and out of order. Ep 17 adapts the AnotherHOLiC novel, ep 20 pulls the haunted-photo chapters (about ch 73-75) forward, ep 24 is a side story'::text),
  (1, 25,        27,        70,  96,  'The Spider''s Grudge and Watanuki''s Right Eye', 2, 'Kei opens. The haunted-photo chapters inside this range aired early as ep 20'),
  (2, 28,        31,        97,  113, 'Dream-Buying, Kohane and the Well', 2, 'The Syaoran clone''s visit to the shop (vol 9) is skipped'),
  (3, 32,        37,        114, 157, 'Himawari''s Secret and Kohane''s Mother', 2, 'Kei reorders: the noises-in-the-house case (about ch 125-129, ep 32) and Kohane''s TV ordeal (about ch 130-157, eps 33-34) air before Watanuki''s fall and Himawari''s confession (ch 114-120, eps 35-36). Ep 37 is a side story. Sakura''s dream chapters (vol 12) are skipped'),
  (4, null::int, null::int, 158, 185, 'Yuko''s Departure', null, 'The cooking student, the truth of Watanuki''s origin, Yuko''s death and Watanuki''s choice to keep the shop'),
  (5, null::int, null::int, 186, 214, 'Rou: Watanuki''s Shop', null, 'Time-skip arc with Watanuki as shopkeeper. The final chapter is 213, and 214 matches AniList''s count')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

insert into movies
  (series_id, position, anilist_id, title, year, chapter_start, chapter_end, after_episode, note)
select id, v.* from series, (values
  (0, 793, 'xxxHOLiC - A Midsummer Night''s Dream', 2005, null::int, null::int, null::int, 'side story (anime-original): the mansion-auction mystery with the TV cast, released as a double feature with the Tsubasa film before the TV series')
) as v(position, anilist_id, title, year, chapter_start, chapter_end, after_episode, note)
where series.anilist_anime_id = 861
  and not exists (select 1 from movies m where m.series_id = series.id);

-- Tsubasa RESERVoir CHRoNiCLE (anime 177 / manga 30009)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (177, 30009, 'Tsubasa RESERVoir CHRoNiCLE', 'Cumulative episodes across Tsubasa Chronicle S1 (AniList 177, 26 eps, 2005) + S2 (AniList 969, 26 eps = cumulative 27-52, 2006) = 52. Manga complete at 233 chapters in 28 volumes. World (arc) boundaries come from the Tsubasa Wiki''s per-world chapter ranges and per-episode locations, checked against MangaUpdates (S1 ends at ch 49, S2 at ch 106). Anime-original episodes: 4, 16, 26, 30-32, 37-39 and 44-52, and the gaps in the episode ranges are those fillers. S2 swaps the manga''s Shara/Shura and Piffle World arcs, so the two share one row, and the Country of Totems (ch 50-52) was never animated. TV stops after Lecourt (ch 106). Tokyo (ch 107-135) was adapted by the Tokyo Revelations OVA (2007) and Nihon (ch 167-182) by the Shunraiki OVA (2009). Those are OVAs, not TV, so their arcs carry null episodes. The 2005 film is an anime-original side story. The sequel manga Tsubasa: WoRLD CHRoNiCLE is out of scope, and xxxHOLiC is a separate catalog entry.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         1,         1,   3,   'Clow Country', 1::int, null::text),
  (1,  2,         6,         4,   13,  'Hanshin Republic', 1, 'Ep 4 is anime-original'),
  (2,  7,         11,        14,  22,  'Koryo Country', 1, null),
  (3,  12,        12,        23,  24,  'Country of Fog', 1, null),
  (4,  13,        15,        25,  32,  'Jade Country', 1, 'Ep 16 that follows is anime-original (Storm Country)'),
  (5,  17,        25,        33,  49,  'Oto Country', 1, 'Ep 26 that follows is an anime-original season finale (Tsarastora Country)'),
  (6,  27,        36,        50,  90,  'Shara and Shura / Piffle World', 2, 'S2 reverses the manga order: Piffle World (ch 70-90) airs first as eps 27-29, then anime-original eps 30-32, then Shara and Shura (ch 53-69) as eps 33-36. Ch 50-52 (Country of Totems) were never animated'),
  (7,  40,        43,        91,  106, 'Lecourt Country', 2, 'Eps 37-39 before it and eps 44-52 after it are anime-original. TV ends here'),
  (8,  null::int, null::int, 107, 135, 'Tokyo', null, 'Adapted by the Tsubasa Tokyo Revelations OVA (2007)'),
  (9,  null::int, null::int, 136, 153, 'Infinity', null, null),
  (10, null::int, null::int, 154, 166, 'Celes Country', null, null),
  (11, null::int, null::int, 167, 182, 'Nihon Country', null, 'Adapted by the Tsubasa Shunraiki (Spring Thunder Chronicles) OVA (2009)'),
  (12, null::int, null::int, 183, 209, 'Clow Country: Halted Time', null, null),
  (13, null::int, null::int, 210, 233, 'The Final Battle', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

insert into movies
  (series_id, position, anilist_id, title, year, chapter_start, chapter_end, after_episode, note)
select id, v.* from series, (values
  (0, 807, 'Tsubasa Reservoir Chronicle the Movie: The Princess in the Birdcage Kingdom', 2005, null::int, null::int, null::int, 'side story (anime-original): a feather hunt in the Birdcage Kingdom, released as a double feature with the xxxHOLiC film')
) as v(position, anilist_id, title, year, chapter_start, chapter_end, after_episode, note)
where series.anilist_anime_id = 177
  and not exists (select 1 from movies m where m.series_id = series.id);

-- Princess Jellyfish (anime 8129 / manga 47904)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (8129, 47904, 'Princess Jellyfish', 'Single 11-episode noitamina season (Oct-Dec 2010). Manga complete in 17 volumes. The main story ends at ch 84 (MangaUpdates). AniList lists 94 because it also counts the Kuragehime Heroes extras, so the final arc is extended to 94. Episode titles mirror chapter titles (ep 1 = ch 1, ep 3 = ch 4, ep 4 = ch 6, ep 5 = ch 8, ep 8 = ch 15), and eps 1-10 run about two chapters each through ch 21. Ep 11 condenses ch 22-29 and replaces the manga''s student-play costume show with an anime-original fashion show, per MangaUpdates and the Kuragehime Wiki. Continue from ch 30. No formal arcs, so the segments are story beats from the Kuragehime Wiki''s chapter summaries. The Heroes specials and Go shorts are bonus shorts, and the 2014 live-action film and 2018 drama are excluded.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         4,         1,  7,  'Tsukimi Meets Kuranosuke', null::int, null::text),
  (1, 5,         8,         8,  15, 'Saving Amamizukan', null, null),
  (2, 9,         11,        16, 29, 'The Jellyfish Dress', null, 'Ep 11 condenses ch 22-29 and swaps the student-play costume show for an anime-original fashion show'),
  (3, null::int, null::int, 30, 37, 'The Amamizukan Fashion Show', null, null),
  (4, null::int, null::int, 38, 51, 'Shu''s Confession', null, null),
  (5, null::int, null::int, 52, 66, 'Kai Fish and the Sale of Amamizukan', null, null),
  (6, null::int, null::int, 67, 78, 'Singapore', null, null),
  (7, null::int, null::int, 79, 94, 'The Proposal and Finale', null, 'The main story ends at ch 84, and 85-94 match AniList''s count of the Heroes extras')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- I Have a Crush at Work (anime 179696 / manga 116333)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (179696, 116333, 'I Have a Crush at Work', 'Single 12-episode season (Jan-Mar 2025). Manga complete at 147 chapters in 15 volumes (Morning, 2019-2023). The anime ends partway into ch 77 (vol 8). Per MangaUpdates it skips ch 13 and 65-73 and trims many more. Eps 1-5 reshuffle vols 1-3: ep 1 is ch 1-2 and 5-6 per the series wiki, and the first trip (ch 14-19) airs as ep 5 after the storage-room and seduction chapters. Continue from ch 78, or from ch 65 for the skipped Momzilla and side-character chapters. Episode titles match chapter titles (What I Need Now = ch 30-33, Anniversary = ch 36-39, Our Valentine''s Day = ch 50-52, True Feelings = ch 57). No formal arcs, so the segments are story beats from chapter titles. Post-anime segments follow the volume contents at 10 chapters per volume.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         5,         1,   29,  'Keeping It Secret / The First Trip', null::int, 'Reordered: ch 13 is skipped, and the trip (ch 14-19) lands in ep 5 after ch 22-26'::text),
  (1, 6,         7,         30,  39,  'What I Need Now / The Six-Month Anniversary', null, null),
  (2, 8,         10,        40,  57,  'Christmas, Valentine''s Day and Hayakawa''s Feelings', null, null),
  (3, 11,        12,        58,  77,  'The Joint Camp and the Internal Transfer', null, 'Ch 65-73 are skipped, and ep 12 frames part of ch 77 around a pre-dating flashback'),
  (4, null::int, null::int, 78,  95,  'Going Public', null, null),
  (5, null::int, null::int, 96,  117, 'Life Plans and Meeting the Parents', null, null),
  (6, null::int, null::int, 118, 137, 'Engagement and Wedding', null, null),
  (7, null::int, null::int, 138, 147, 'Three Years Later', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Akane-banashi (anime 196935 / manga 144866)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (196935, 144866, 'Akane-banashi', 'Single 12-episode TV season (Apr-Jun 2026, AniList 196935). A 2nd season (AniList 213360) is announced for January 2027 and has not aired, so everything from ch. 32 on carries null episodes. Manga ongoing in Weekly Shonen Jump (latest ch. 224, released Oct 5 2026, vols 1-24 collect ch. 1-214). Per-episode chapter coverage from the Akane-banashi Wiki episode pages: ep 1 = ch. 1, ep 2 = ch. 2-4, ep 3 = ch. 5-7, ep 4 = ch. 8-10, ep 5 = ch. 11-12, eps 6-9 = ch. 13-23, ep 10 = ch. 24-27, ep 11 = ch. 27-30, ep 12 = mostly anime-original plus the end of ch. 30 and ch. 31. Arc names and chapter ranges follow the wiki''s Story Arcs page (Intro and Kyoji Mentor are fan labels, the rest are official arc names). The wiki cuts Intro/Kyoji Mentor at ch. 5/6, but ep 3 adapts ch. 5-7, so that cut follows the episode edge instead.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         2,         1,   4,   'Introduction', null::int, 'wiki Intro arc runs to ch. 5, which opens ep 3'::text),
  (1,  3,         5,         5,   12,  'Kyoji''s Mentorship', null, null),
  (2,  6,         12,        13,  31,  'Karaku Cup', null, 'ep 12 is largely anime-original, closing ch. 30 and adapting ch. 31 (first chapter of Zenza Training)'),
  (3,  null::int, null::int, 32,  37,  'Zenza Training', null, 'season 2 (Jan 2027) picks up here'),
  (4,  null::int, null::int, 38,  50,  'Fetching Tea', null, null),
  (5,  null::int, null::int, 51,  59,  'Zenza Renseikai', null, null),
  (6,  null::int, null::int, 60,  73,  'Changing Time', null, null),
  (7,  null::int, null::int, 74,  77,  'Shikisai Festival', null, null),
  (8,  null::int, null::int, 78,  83,  'Chocho', null, null),
  (9,  null::int, null::int, 84,  88,  'Four-Person Event', null, null),
  (10, null::int, null::int, 89,  107, 'Futatsume Debut Event', null, null),
  (11, null::int, null::int, 108, 117, 'Maikeru''s Shin''uchi Promotion Test', null, null),
  (12, null::int, null::int, 118, 129, 'Shiguma Solo Event', null, null),
  (13, null::int, null::int, 130, 141, 'Arakawa School Past', null, null),
  (14, null::int, null::int, 142, 153, 'Futatsume', null, null),
  (15, null::int, null::int, 154, 180, 'Zuiun Prize', null, null),
  (16, null::int, null::int, 181, 224, 'Isshokai', null, 'ongoing, latest ch. 224 as of 2026-10-07')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Paradise Kiss (anime 322 / manga 30029)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (322, 30029, 'Paradise Kiss', 'Single 12-episode noitaminA season (Oct-Dec 2005) adapting the complete story. Manga complete at 48 chapters (Stages) in 5 volumes: vol. 1 = ch. 1-10, vol. 2 = 11-20, vol. 3 = 21-30, vol. 4 = 31-38, vol. 5 = 39-48. No per-episode chapter guide exists, so arcs are cut on volume edges. Eps 1-11 adapt vols 1-4 fairly faithfully and ep 12 compresses all of vol. 5 into vignettes (Anime Feminist adaptation essay). Episode synopses and volume blurbs anchor the rest: eps 1-2 cover the scouting and Yukari agreeing to model (vol. 1), ep 5 is her break with her mother and leaving home, ep 9 opens vol. 4 with her mother''s conditional approval, and ep 11 is the runway show that closes vol. 4. The vol. 2/3 split inside eps 3-8 is not documented, so those volumes share one arc. Episode edges are approximate. The 2011 live-action film is excluded.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,  2,  1,  10, 'Scouted by Paradise Kiss', null::int, null::text),
  (1, 3,  8,  11, 30, 'Falling for George and Leaving Home', null, 'ep 5 is Yukari leaving home'),
  (2, 9,  11, 31, 38, 'The Fashion Show', null, null),
  (3, 12, 12, 39, 48, 'After the Show', null, 'ep 12 compresses all of vol. 5')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Air Gear (anime 857 / manga 30074)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (857, 30074, 'Air Gear', 'Single 25-episode TV season (Apr-Sep 2006). The Special Trick (AniList 3791, a one-off Potemkin special numbered 21.5) is not counted. The TV anime is an abridged adaptation of vols 1-12 (ch. 1-104), from vol. 1 through Ikki clearing the Devil''s 30-30 in Kyoto. Readers continue at ch. 105. The 3-episode Break on the Sky OVA (AniList 9201, 2010-11) adapts non-contiguous later material (vol. 16 Ikki vs Ringo, vols 24-25 Kogarasumaru vs the Inorganic Net / old Sleeping Forest) and is not counted in the episode numbering. Manga complete in 37 volumes. Serialization ended at Trick 357, and vol. 37 adds a 46-page bonus counted as 358, which matches AniList. The manga has no official arc names, so arcs are descriptive and cut on volume edges from Kodansha''s per-volume synopses, with episode edges matched to episode summaries. Episode edges are approximate.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         8,         1,   23,  'Storm Rider Debut', null::int, 'Skull Saders, Rez Boa Dogs and the Yaou parts war (vols 1-3)'::text),
  (1,  9,         12,        24,  41,  'Forming Kogarasumaru', null, 'Agito joins, Sabel Tigers parts war (vols 4-5)'),
  (2,  13,        15,        42,  50,  'Rika and the Thorn Road', null, null),
  (3,  16,        20,        51,  77,  'Behemoth', null, null),
  (4,  21,        25,        78,  104, 'Genesis and the Kyoto Trip', null, 'ends with the Devil''s 30-30 jump, continue at ch. 105'),
  (5,  null::int, null::int, 105, 132, 'Kururu and the Sleeping Forest Assassins', null, null),
  (6,  null::int, null::int, 133, 143, 'Wind King vs. Thorn King', null, 'Break on the Sky OVA ep 1 adapts this (not counted)'),
  (7,  null::int, null::int, 144, 175, 'Tool Toul To and Sora''s Betrayal', null, null),
  (8,  null::int, null::int, 176, 217, 'Hakurokai and the Training Camp', null, null),
  (9,  null::int, null::int, 218, 267, 'Gram Scale Tournament', null, 'Break on the Sky OVA eps 2-3 adapt the Inorganic Net battle (not counted)'),
  (10, null::int, null::int, 268, 337, 'Assault on the Aircraft Carrier', null, null),
  (11, null::int, null::int, 338, 358, 'Trophaeum Tower Finale', null, 'serialization ends at Trick 357, 358 is the vol. 37 bonus chapter')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Übel Blatt (anime 175198 / manga 30070)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (175198, 30070, 'Übel Blatt', 'Single 12-episode season (Jan-Mar 2025). Chapter columns use print numbering. Vol. 0 holds ch. 1-3 (plus two Blade Master extras) and is its own AniList entry (Übel Blatt 0, 142429), so AniList''s 167 chapters for this entry are print ch. 4-170 and the first arc starts at ch. 4. The anime cuts vol. 0 entirely and races through vols 1-7 (ch. 4-65), cutting and compressing heavily (ANN episode reviews). Each episode is titled after one of the manga''s multi-part chapter titles (ep 1 Durch Bruch = ch. 4-11, ep 5 Die Burg vom Helden = ch. 24-30, ep 8 Der Heldmörder = ch. 39-47, ep 12 Neues Schwert = ch. 60-62), and those titles anchor the episode edges. The ends of the two vengeance arcs (ch. 38 and ch. 65) come from the Übel Blatt Wiki. The unadapted tail (ch. 66-170, vols 8-23) has no established arc names, so it is labelled with the manga''s own chapter-title runs, grouped on volume edges. Manga complete in 2019. The sequel Übel Blatt II is a separate manga.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         4,         4,   23,  'Durch Bruch: Into the Empire', null::int, 'vol. 0 (ch. 1-3) is skipped by the anime'::text),
  (1,  5,         7,         24,  38,  'First Vengeance: Schtemwölech', null, null),
  (2,  8,         8,         39,  47,  'The Hero Killer', null, null),
  (3,  9,         12,        48,  65,  'Second Vengeance: Barestar', null, 'anime ends at the close of vol. 7'),
  (4,  null::int, null::int, 66,  83,  'Watershed Peak', null, null),
  (5,  null::int, null::int, 84,  99,  'Erosion and Collapse', null, null),
  (6,  null::int, null::int, 100, 105, 'The Dragon''s Corridor', null, null),
  (7,  null::int, null::int, 106, 115, 'The Heroes', null, null),
  (8,  null::int, null::int, 116, 127, 'The New King', null, null),
  (9,  null::int, null::int, 128, 140, 'A Castle and a Castle', null, null),
  (10, null::int, null::int, 141, 152, 'The Flags of the Heroes', null, null),
  (11, null::int, null::int, 153, 170, 'The King''s Capital and the End of the World', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- A Condition Called Love (anime 165855 / manga 101700)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (165855, 101700, 'A Condition Called Love', 'Single 12-episode season (Apr-Jun 2024). The main story is complete at ch. 72 (Dessert, Sep 2025 issue, vols 1-18). An after-story side series followed and ended in the Jun 2026 issue (Apr 2026), collected in vol. 19. AniList counts 78 chapters, so the final side-story arc runs 73-78 to match. Episodes take their titles from the manga''s "Our First..." chapter titles (ep 1 = ch. 1, ep 3 = ch. 4, ep 4 = ch. 5, ep 5 = ch. 8, ep 6 = ch. 11, ep 7 = ch. 12, ep 9 = ch. 16, ep 10 = ch. 17, ep 12 = ch. 21-22), and the anime ends after ch. 22, so readers continue at ch. 23. Chapter titles for ch. 1-45 come from the A Condition Called Love Wiki volume pages. Later boundaries follow Kodansha volume synopses and known chapter titles (ch. 62-63 school trip, ch. 64 breakup, ch. 66-67 England, ch. 68 reunion), so arcs from ch. 46 on are approximate. The series has no named arcs, so names are descriptive.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         3,         1,  4,  'The Trial Relationship', null::int, null::text),
  (1,  4,         7,         5,  12, 'New Year to Valentine''s Day', null, null),
  (2,  8,         9,         13, 16, 'Rings and His Birthday', null, null),
  (3,  10,        12,        17, 22, 'Second Year and Yao', null, 'continue at ch. 23'),
  (4,  null::int, null::int, 23, 32, 'Sports Festival and Summer Vacation', null, null),
  (5,  null::int, null::int, 33, 36, 'The School Festival', null, null),
  (6,  null::int, null::int, 37, 45, 'Non-chan and the First Fight', null, null),
  (7,  null::int, null::int, 46, 63, 'Second Winter to the School Trip', null, 'vols 12-16, inner boundaries undocumented'),
  (8,  null::int, null::int, 64, 67, 'The Breakup and England', null, null),
  (9,  null::int, null::int, 68, 72, 'Reunion and Finale', null, 'main story ends at ch. 72'),
  (10, null::int, null::int, 73, 78, 'After Stories', null, 'side stories, numbered to match AniList''s 78')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- In the Clear Moonlit Dusk (anime 192507 / manga 120502)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (192507, 120502, 'In the Clear Moonlit Dusk', 'Single 12-episode TV season (TBS, Jan-Mar 2026). Manga ongoing in Dessert with 11 volumes (vol 11, Sep 2026), and the author has said vol 12 (spring 2027) will be the last. Chapter numbers follow Kodansha''s official single-chapter numbering: 4 chapters per volume through vol 10, and vol 11 = ch. 41-43. Fan scans add .5 splits that fold into the integer chapters. The anime ends at ch. 25 (vol 7), trimming part of that chapter for anime-original scenes. Continue from ch. 26. Episode boundaries come from episode-to-chapter guides, where neighbouring episodes share a chapter at their edges. No formal arcs, so segments are story beats from the volume blurbs. The tail stops at ch. 43, the last collected chapter, because later Dessert installments are not yet numbered. The Oct 2026 live-action film is excluded.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         4,         1,  9,  'Two Princes: The Trial Relationship', null::int, null::text),
  (1, 5,         8,         10, 17, 'A New Prince at Work and the Summer Festival', null, 'ch. 18 is split between eps 8 and 9'),
  (2, 9,         12,        18, 25, 'Officially Dating: Kobe and Ohji''s Confession', null, 'ep 12 trims the end of ch. 25'),
  (3, null::int, null::int, 26, 32, 'Missteps and the School Festival', null, null),
  (4, null::int, null::int, 33, 36, 'Kohaku''s Family and the Holidays', null, null),
  (5, null::int, null::int, 37, 43, 'Nobara and Kuwabatake, Kohaku''s Brother', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- When Will Ayumu Make His Move? (anime 128223 / manga 108105)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (128223, 108105, 'When Will Ayumu Make His Move?', 'Single 12-episode TV season (Silver Link, Jul-Sep 2022). Manga complete at 225 short chapters (moves) in 17 volumes. AniList lists 240, so the final arc is extended to 240 to match. The anime covers roughly ch. 1-116 but skips fluff chapters and reorders material, so boundaries are approximate: Miku and Hinano debut in ch. 97 but appear in ep 7, ep 9 uses Sakurako''s ch. 84 realization, and ep 12 jumps from ch. 111 to the end of ch. 115 and ch. 116. Anchors: the okonomiyaki owner debuts in ch. 53 (ep 5, New Year), Rin in ch. 70 (ep 7, new school year), and the culture-festival date is in vol 3 (ch. 29-41). Continue from ch. 116 for the manga''s version of the finale, or from ch. 117 for new material. Post-anime segments follow the Kodansha USA volume blurbs.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         3,         1,   41,  'First Year: Sports Day and the Culture Festival Date', null::int, null::text),
  (1, 4,         6,         42,  69,  'First-Year Winter: Christmas, New Year and Valentine''s Day', null, null),
  (2, 7,         12,        70,  116, 'Second Year: Rin Joins, Golden Week and the School Trip', null, 'reordered: ep 12 adapts ch. 111, the end of ch. 115 and ch. 116'),
  (3, null::int, null::int, 117, 149, 'Summer Break and the Shogi Training Camp', null, null),
  (4, null::int, null::int, 150, 187, 'Urushi''s Exams and Rin''s Confession', null, null),
  (5, null::int, null::int, 188, 213, 'Christmas, New Year and Entrance Exams', null, null),
  (6, null::int, null::int, 214, 240, 'The Final Move', null, 'final chapter is 225, 240 matches AniList''s count')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Shigurui: Death Frenzy (anime 2216 / manga 33868)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (2216, 33868, 'Shigurui: Death Frenzy', 'Single 12-episode TV season (Madhouse, WOWOW, 2007). Manga complete at 84 chapters in 15 volumes. The vol 1 extra Scene Zero is unnumbered and ignored. The anime adapts ch. 1-32, ending with Irako killing Kogan and Fujiki finding the massacre. Continue from ch. 33 (vol 7). Every episode title reuses a chapter title, which pins the boundaries: ep 2 = ch. 4, ep 3 = ch. 6, ep 5 = ch. 11, ep 6 = ch. 15, ep 7 = ch. 16, ep 9 = ch. 20, ep 10 = ch. 23, ep 11 = ch. 26, ep 12 = ch. 32. Like the manga, the anime opens at the 1629 Sunpu Castle tournament and then flashes back seven years. Post-anime segments follow the Shigurui Wiki volume summaries.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         2,         1,  5,  'The Sunpu Castle Tournament / Irako Arrives', null::int, null::text),
  (1, 3,         6,         6,  15, 'Heir to the Kogan School', null, null),
  (2, 7,         9,         16, 22, 'The Killer on the Bridge', null, null),
  (3, 10,        12,        23, 32, 'Kengyou''s Estate / Mumyou Sakanagare', null, null),
  (4, null::int, null::int, 33, 43, 'The Sanctioned Duel: Fujiki vs. Irako', null, null),
  (5, null::int, null::int, 44, 53, 'Gonzaemon''s Stand', null, null),
  (6, null::int, null::int, 54, 65, 'The Fall of the Kogan School', null, null),
  (7, null::int, null::int, 66, 77, 'The Road to the Sunpu Tournament', null, null),
  (8, null::int, null::int, 78, 84, 'The Sunpu Castle Tournament', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- The Klutzy Class Monitor and the Girl with the Short Skirt (anime 189987 / manga 108768)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (189987, 108768, 'The Klutzy Class Monitor and the Girl with the Short Skirt', 'Single 12-episode TV season (Zero-G, Apr-Jun 2026). Manga ongoing in Monthly Shonen Sirius (21 volumes as of Aug 2026). Chapter numbers follow the official numbering used by Mechacomic chapter releases and K Manga, which leaves the vol 3 side story unnumbered. Episode titles reuse chapter titles, which pins the ranges, and the anime moves ch. 13 into ep 4. The anime adapts ch. 1-35, through the first-year culture festival and its aftermath. Continue from ch. 36 (vol 8). No formal arcs, so segments follow the school calendar and volume blurbs. The tail stops at ch. 96 (the second-year culture festival), the last chapter whose number can be verified. Vol 21 (Student Council Election arc) and later magazine chapters are not mapped yet.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         3,         1,  8,  'The Klutzy Class Monitor and the Committee Members', null::int, null::text),
  (1, 4,         6,         9,  17, 'Days Off, Make-Up Classes and Swimsuit Shopping', null, 'ch. 13 airs in ep 4 ahead of ch. 10-12'),
  (2, 7,         9,         18, 26, 'Summer at the Beach and Enoshima', null, null),
  (3, 10,        12,        27, 35, 'The Culture Festival', null, null),
  (4, null::int, null::int, 36, 46, 'Sports Festival and the First Christmas', null, null),
  (5, null::int, null::int, 47, 56, 'Marathon, Entrance Exams and Spring Farewells', null, null),
  (6, null::int, null::int, 57, 75, 'Second Year: New Juniors and Thinking About the Future', null, null),
  (7, null::int, null::int, 76, 87, 'Second-Year Summer Vacation', null, null),
  (8, null::int, null::int, 88, 96, 'Career Paths and the Second-Year Culture Festival', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Tales of Wedding Rings (anime 160389 / manga 85310)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (160389, 85310, 'Tales of Wedding Rings', 'Cumulative episodes across S1 (12, Jan-Mar 2024) + S2 (13, anime 176298, Oct-Dec 2025) = 25. Manga complete at 86 chapters in 15 volumes (Aug 2024). AniList lists 87, so the final arc is extended to 87 to match. S1 adapts ch. 1-31 and ends as Morion arrives. S2 adapts ch. 32-70, through the Abyss King''s defeat, with a shortened ending. Continue from ch. 71 for the epilogue (the honeymoon in Japan, then destroying the rings). Season splits come from MangaUpdates and anime-to-manga guides. Inner boundaries follow the Tales of Wedding Rings Wiki volume chapter lists and volume blurbs, which line up with the ring arcs, so episode edges inside a season are approximate.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         4,         1,  10, 'The Ring of Light / The Wind Ring of Romca', 1, null::text),
  (1, 5,         6,         11, 16, 'The Fire Ring of Needakitta', 1, null),
  (2, 7,         8,         17, 21, 'The Water Ring of Maasa', 1, null),
  (3, 9,         12,        22, 31, 'Idanokan, the Earth Ring and the Abyss King', 1, 'ep 11 is the interlude in Japan where Amber appears'),
  (4, 13,        17,        32, 46, 'Bride Training and the Great Elven Library', 2, null),
  (5, 18,        21,        47, 57, 'The Ring King''s Sword and the Magecraft Spire', 2, null),
  (6, 22,        25,        58, 70, 'The Final Battle in Vanna', 2, 'ep 25 shortens the ending of ch. 68-70'),
  (7, null::int, null::int, 71, 80, 'Honeymoon in Japan', null, null),
  (8, null::int, null::int, 81, 87, 'Destroying the Rings', null, 'final chapter is 86, 87 matches AniList''s count')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- TOUGEN ANKI (anime 177474 / manga 119968)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (177474, 119968, 'TOUGEN ANKI', 'Cumulative episodes across S1 (AniList 177474, 24 eps, Jul-Dec 2025) + S2 Nikko Kegon Falls Arc (AniList 204650, 12 eps weekly from Oct 2 2026 = cumulative 25-36). As of 2026-10-07 only ep 25 has aired (ch 78-80 plus the opening pages of ch 82, ch 81 not yet shown), so the rest of the Snow Mountain Training arc and everything after it carry null episodes until they air. Manga ongoing (current ch. 285, Oct 1 2026). Arc names and chapter ranges from the Tougen Anki Wiki Story Arcs page (Intro and Tag are community names), episode edges from its per-episode adapted-chapter lists. Ep 12 (Day of the Storm) is anime-original and sits inside the Kyoto row. Ep 24 closes on the last pages of ch 77, which the wiki files under Snow Mountain Training. The TOUGEN ANKI Mini Anime ONA is excluded.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         2,         1,   4,   'Intro Arc', 1, null::text),
  (1,  3,         4,         5,   13,  'Tag Arc', 1, null),
  (2,  5,         12,        14,  36,  'Kyoto Arc', 1, 'Ep 12 (Day of the Storm) is anime-original'),
  (3,  13,        24,        37,  76,  'Nerima Arc', 1, null),
  (4,  25,        25,        77,  80,  'Snow Mountain Training Arc', 2, 'S2 airing weekly: only ep 25 aired as of 2026-10-07'),
  (5,  null::int, null::int, 81,  88,  'Snow Mountain Training Arc (cont.)', null, 'Rest of the arc, airing in S2'),
  (6,  null::int, null::int, 89,  162, 'Kegon Falls Arc', null, 'Adapted by S2 (Nikko Kegon Falls Arc), not yet aired'),
  (7,  null::int, null::int, 163, 205, 'Koenji Arc', null, null),
  (8,  null::int, null::int, 206, 220, 'Matsumoto Arc', null, null),
  (9,  null::int, null::int, 221, 227, 'Mikado Arc', null, null),
  (10, null::int, null::int, 228, 272, 'Toyosu Arc', null, null),
  (11, null::int, null::int, 273, 279, 'Sakurajima Arc', null, null),
  (12, null::int, null::int, 280, 285, 'Kochi Arc', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Lucifer and the Biscuit Hammer (anime 144323 / manga 40552)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (144323, 40552, 'Lucifer and the Biscuit Hammer', 'Single 24-episode TV season (Jul-Dec 2022) adapting the whole manga, complete at 65 chapters in 10 volumes (the Sp. completion booklet and the Sonogo no Hero one-shot are separate AniList entries). No published episode-to-chapter guide exists: edges are aligned from the episode titles, which reuse the manga chapter titles (ep 9 Akitani Inachika = ch 28-29, ep 21 The Last Battle = ch 56-59), cross-checked against the Lucifer and the Biscuit Hammer Wiki episode summaries (Hangetsu dies at the end of ep 5 = ch 14, Hisame grieves him at the start of ep 6 = ch 15). Arc names are editorial groupings taken from chapter titles. Compressed (~2.7 chapters per episode) with some reordering (Taiyou appears from ep 7 and his ch 36 backstory surfaces in eps 16-17), so edges are approximate.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,  3,  1,  7,  'Amamiya Yuuhi and the Lizard Knight', null::int, 'Yuuhi meets Noi and Samidare and signs the knight pact'::text),
  (1, 4,  5,  8,  14, 'Shinonome Hangetsu and the Dog Knight', null, 'Ends with Hangetsu''s death'),
  (2, 6,  8,  15, 27, 'Amamiya Yuuhi and the Beast Knights', null, 'Mikazuki, Nagumo and the rest of the knights assemble'),
  (3, 9,  12, 28, 35, 'Hekatombaion and the Spirit Anima', null, 'Inachika''s letter, the Asahina household, Unicorn and Metageitnion'),
  (4, 13, 14, 36, 41, 'Kusakabe Tarou and Sorano Hanako', null, 'Boedromion and the Invisible'),
  (5, 15, 18, 42, 50, 'The Heroes and the Children', null, 'Shinonome brothers, Yukimachi and Subaru, Taiyou, Anima''s trial'),
  (6, 19, 20, 51, 55, 'Maimakterion / Anima and Animus', null, null),
  (7, 21, 21, 56, 59, 'The Last Battle', null, null),
  (8, 22, 24, 60, 65, 'Hoshi no Samidare (Finale)', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Skip Beat! (anime 4722 / manga 30610)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (4722, 30610, 'Skip Beat!', 'Single 25-episode TV season (Oct 2008-Mar 2009). Manga ongoing and irregular in Hana to Yume (current ch. 338, Sep 2026). Arc names and chapter ranges from the Skip Beat! Wiki Story Arcs page (mostly fan names), episode edges from its per-arc episode lists. The anime skips Kanae''s arc (ch 46-50, the Hiou subplot) and goes straight from the Prisoner arc into Dark Moon at ep 20, so those chapters are folded into the Dark Moon row. It ends mid-Dark Moon at ch 66 (vol 11), continue from ch 67. The 2011 Taiwanese live-action drama is excluded.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         5,         1,   8,   'Introduction Arc', null::int, null::text),
  (1,  6,         7,         9,   14,  'Princess Coup d''Etat Arc', null, null),
  (2,  8,         10,        15,  19,  'The Miraculous Language of Angels Arc', null, null),
  (3,  11,        11,        20,  23,  'Bo''s Arc', null, null),
  (4,  12,        14,        24,  30,  'Curara CM Arc', null, null),
  (5,  15,        16,        31,  37,  'Manager Arc', null, null),
  (6,  17,        19,        38,  45,  'Prisoner Arc', null, null),
  (7,  20,        25,        46,  66,  'Kanae''s Arc / Dark Moon Arc', null, 'Ch 46-50 (Kanae''s arc) skipped by the anime, ep 20 opens at ch 51, ep 25 ends at ch 66'),
  (8,  null::int, null::int, 67,  78,  'Dark Moon Arc (cont.)', null, null),
  (9,  null::int, null::int, 79,  99,  'Suddenly, a Love Story Arc', null, null),
  (10, null::int, null::int, 100, 114, 'Kuu''s Arc', null, null),
  (11, null::int, null::int, 115, 120, 'Lucky Number Arc', null, null),
  (12, null::int, null::int, 121, 137, 'Natsu''s Arc', null, null),
  (13, null::int, null::int, 138, 150, 'Valentine Arc', null, null),
  (14, null::int, null::int, 151, 170, 'Violence Mission Arc', null, null),
  (15, null::int, null::int, 171, 174, 'Psychedelic Caution Arc', null, null),
  (16, null::int, null::int, 175, 203, 'Dark Breath Arc', null, null),
  (17, null::int, null::int, 204, 215, 'Technicolor Paradise Arc', null, null),
  (18, null::int, null::int, 216, 233, 'Saena''s Arc', null, null),
  (19, null::int, null::int, 234, 255, 'A Lotus in the Mud Arc', null, null),
  (20, null::int, null::int, 256, 272, 'Unexpected Results Arc', null, null),
  (21, null::int, null::int, 273, 286, 'Confession Arc', null, null),
  (22, null::int, null::int, 287, 338, 'Route Project Arc', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- TenPuru (anime 160447 / manga 109122)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (160447, 109122, 'TenPuru', 'Single 12-episode TV season (Jul-Sep 2023). The two OVA episodes (AniList 170661, a body-swap story and a fever dream) are anime-original and not counted. Manga ongoing on Comic Days (current ch. 141, Sep 2026), bonus .5 chapters and extras fold into the surrounding numbered chapter. No published episode guide exists: edges are aligned by matching the official Comic Days chapter titles against the Wikipedia episode summaries. The anime reorders heavily inside each block (ep 3 runs Mia''s duel ch 14-16 before the omiai lead-in ch 9, ep 5 runs Tsukuyo''s archery ch 21-23 before the training ch 17-20, eps 8-10 pull the hot spring, New Year and Kagura chapters 36-46 ahead of ch 29-35 in eps 10-12), so only the block edges are reliable. The anime ends around ch 46, continue from ch 47. Post-anime arc names are editorial, from the volume blurbs (vol 13 closes Part 1 at ch 116).')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         2,         1,   8,   'Welcome to Mikazuki Temple', null::int, 'Akemitsu''s debt, Tsukuyo and Kurage'::text),
  (1, 3,         4,         9,   16,  'Mia''s Duel and the Omiai', null, 'Ep 3 adapts ch 14-16 before ch 9, ep 4 = ch 10-13'),
  (2, 5,         7,         17,  26,  'Archery and Priestess Training', null, 'Ep 5 adapts ch 21-23 ahead of the training chapters 17-20'),
  (3, 8,         12,        27,  46,  'Christmas, the New Year and Kagura''s Secret', null, 'Eps 8-10 adapt ch 36-46 ahead of ch 29-35 in eps 10-12'),
  (4, null::int, null::int, 47,  80,  'Parishioners, Visiting Sisters and Valentine''s Day', null, null),
  (5, null::int, null::int, 81,  116, 'Akagami the Priest (End of Part 1)', null, null),
  (6, null::int, null::int, 117, 141, 'Part 2: Yuzuki''s Absence and the Christoph Island', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- The Witch and the Beast (anime 153818 / manga 100109)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (153818, 100109, 'The Witch and the Beast', 'Single 12-episode TV season (Jan-Apr 2024). Manga on indefinite hiatus since Nov 2022 at ch 58 (10 volumes, author''s health), AniList still lists it as releasing. Arc names and edges come from the official chapter subtitles on Yanmaga Web, which the anime reuses as episode titles (Beauty and Death = ch 6-9 = eps 4-5, The Witch and the Demon Sword = ch 10-21 = eps 6-9, Eloquence and Silence = ch 24-27 = eps 11-12). Ep 10 Origin Witch covers the two interlude chapters 22-23 (Angela Ann Huel debuts in ch 23). The anime ends at ch 27, continue from ch 28 (Basement Level 4). The special one-shot ch 0 (Witch and Whim) is a separate AniList entry and not mapped.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         1,         1,  2,  'The Witch and the Crimson City', null::int, null::text),
  (1, 2,         3,         3,  5,  'The Witch''s Pastime', null, null),
  (2, 4,         5,         6,  9,  'Beauty and Death', null, null),
  (3, 6,         9,         10, 21, 'The Witch and the Demon Sword', null, null),
  (4, 10,        10,        22, 23, 'Origin Witch', null, 'Interlude chapters, Angela Ann Huel debuts'),
  (5, 11,        12,        24, 27, 'Eloquence and Silence', null, null),
  (6, null::int, null::int, 28, 41, 'Basement Level 4', null, null),
  (7, null::int, null::int, 42, 49, 'The Witch''s Relic / Chaos in the Storm', null, null),
  (8, null::int, null::int, 50, 58, 'The Nameless Seed', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Yakuza Fiancé: Raise wa Tanin ga Ii (anime 170468 / manga 99897)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (170468, 99897, 'Yakuza Fiancé: Raise wa Tanin ga Ii', 'Single 12-episode TV season (Oct-Dec 2024), cumulative = broadcast numbering. Manga (Monthly Afternoon, long monthly chapters) has been on indefinite hiatus since its Feb 24 2024 chapter, so ch 38 is the latest published chapter (8 volumes collect ch 1-36, plus one unnumbered side story that is not counted). The episode titles reuse the manga''s chapter titles, which pin the boundaries: ep 1 = ch 1-2, ep 2 = ch 3-5, ep 3 = ch 6-9, ep 4 = ch 10-11, ep 5 = ch 12 (La Dame aux Camélias), eps 6-7 = ch 13-16, eps 8-10 = ch 17-21, ep 11 = ch 22-24 and ep 12 = ch 25-26 (finale range per the Sportskeeda episode 12 review). Arc names follow the multi-part chapter titles. No second season announced.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         2,         1,  5,  'The Engagement and the Akaza Fraud', null::int, null::text),
  (1, 3,         4,         6,  11, 'The Triangle from Hell', null, null),
  (2, 5,         5,         12, 12, 'Princess Tsubaki', null, null),
  (3, 6,         7,         13, 16, 'I''d Rather You Hate Me Than Not Care (Osaka)', null, null),
  (4, 8,         10,        17, 21, 'To Be Honest, I Want to Marry You (The Ozu Hunt)', null, null),
  (5, 11,        12,        22, 26, 'Pets That Outgrow Their Owner', null, 'Ep 12 adapts ch 25-26.'),
  (6, null::int, null::int, 27, 31, 'His Kindness Is Heavier Than Life', null, null),
  (7, null::int, null::int, 32, 34, 'Your Lover, Your Weapon, Your Scapegoat', null, null),
  (8, null::int, null::int, 35, 38, 'You Are Life', null, 'Manga on hiatus after ch 38.')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- I Want to End This Love Game (anime 194393 / manga 143031)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (194393, 143031, 'I Want to End This Love Game', 'Single 12-episode TV season (Apr-Jun 2026), cumulative = broadcast numbering. Manga (Sunday Webry, chapters titled GAME n) ongoing, latest GAME 71 as of late Sep 2026 (9 volumes). Each episode is titled after a chapter it adapts (ep 1 = GAME 1, 2 = 3, 3 = 5, 4 = 8, 5 = 11, 6 = 14, 7 = 16, 8 = 20, 9 = 21, 10 = 24, 11 = 28, 12 = 30) and the official episode synopses follow the chapter order. The anime ends at GAME 30 plus the unnumbered origami extra chapter (AniList episode 12 thread), so readers continue at GAME 31. Arc cuts inside the season sit on those title chapters and can be off by a chapter. Unnumbered extra (bangai) chapters are not counted. Unadapted arc names are inferred from the chapter titles.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         3,         1,  7,  'The Love Game and the First Date', null::int, null::text),
  (1, 4,         5,         8,  12, 'Anything Goes', null, null),
  (2, 6,         7,         13, 18, 'The Sleepover', null, null),
  (3, 8,         9,         19, 23, 'The Student Council President', null, null),
  (4, 10,        12,        24, 30, 'Crossing the Line', null, 'Ep 12 closes on an unnumbered extra chapter after GAME 30.'),
  (5, null::int, null::int, 31, 44, 'Trial Dating', null, null),
  (6, null::int, null::int, 45, 58, 'The Sports Festival', null, null),
  (7, null::int, null::int, 59, 61, 'The Confession', null, null),
  (8, null::int, null::int, 62, 71, 'Dating and the Next Game', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Silver Spoon (anime 16918 / manga 55096)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (16918, 55096, 'Silver Spoon', 'Cumulative episodes across S1 (AniList 16918, 11 eps, Jul-Sep 2013) + S2 (AniList 19363, 11 eps = cumulative 12-22, Jan-Mar 2014) = 22. Manga complete at 131 chapters (15 volumes), titled by season: Tale of Spring (ch 1-10), Tale of Summer plus the Summer Memories side story (ch 11-31), Tale of Autumn (ch 32-63), Tale of Winter (ch 64-97), Tale of Four Seasons (ch 98-130) and the epilogue Tale of Yugo Hachiken (ch 131). S1 adapts ch 1-31 (Summer begins at ep 6 per the Silver Spoon wiki, and the finale ends on the Summer Memories combine-harvester side story), S2 (officially subtitled Tale of Autumn) adapts ch 32-75 and stops at Tale of Winter 12. No per-episode chapter guide exists, so the cut inside S2 is placed at ep 19 from volume contents (vol 7 ends with Komaba missing after the baseball tournament, vol 8 opens with the cheese-making chapter and the Komaba farm closure) and is approximate. The 2014 live-action film is excluded.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         5,         1,  10,  'Tale of Spring', 1, null::text),
  (1, 6,         11,        11, 31,  'Tale of Summer', 1, 'Ends with the Summer Memories side story (ch 30-31).'),
  (2, 12,        18,        32, 61,  'Tale of Autumn', 2, null),
  (3, 19,        22,        62, 75,  'Tale of Winter: Komaba Leaves Ezo Ag', 2, 'Opens with the last two Tale of Autumn chapters (ch 62-63), episode cut approximate.'),
  (4, null::int, null::int, 76, 97,  'Tale of Winter (cont.)', null, null),
  (5, null::int, null::int, 98, 131, 'Tale of Four Seasons', null, 'Ch 131 is the epilogue, Tale of Yugo Hachiken.')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Tying the Knot with an Amagami Sister (anime 164172 / manga 128160)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (164172, 128160, 'Tying the Knot with an Amagami Sister', 'Single 24-episode TV run in two continuous cours (Oct 2024-Mar 2025, one AniList entry), cumulative = broadcast numbering. Manga complete at 194 chapters (22 volumes). Per-episode chapters from AnimeFillerGuide''s episode-to-chapter table, arc names from the anime''s multi-part episode titles, which match the manga''s chapter-title runs. The anime skips side chapters 30-31, 53, 55, 64, 68 and 71 (they stay inside the arc around them) and pulls ch 69 forward into ep 10, revisited in ep 15. Ch 15 starts at the end of ep 6 and is counted with Dream and Moon and Dream. The anime ends at ch 83, so readers continue at ch 84. Unadapted arcs follow the manga''s multi-part chapter titles (Crossroads of the Future, Now and Forever, Year''s End in the Mirror, How to Tie the Sky), with the standalone chapters between them grouped or folded into the arc they lead into. No second season announced.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         3,         1,   5,   'The Miracle Begins', null::int, null::text),
  (1,  4,         5,         6,   11,  'The Amagami Shrine Festival', null, null),
  (2,  6,         6,         12,  14,  'From Dawn till Dusk', null, null),
  (3,  7,         9,         15,  26,  'Dream and Moon and Dream', null, 'Ch 15 begins at the end of ep 6.'),
  (4,  10,        10,        27,  28,  'Changing Clothes, Changing Hearts', null, 'Ep 10 also adapts part of ch 69.'),
  (5,  11,        13,        29,  41,  'The Real Reason for Staying Up Late', null, 'Ch 30-31 skipped by the anime.'),
  (6,  14,        16,        42,  49,  'The Scales That Hold Wishes', null, null),
  (7,  17,        17,        50,  53,  'The Send-Off Fires and the Vow with the Gods', null, 'Ch 53 skipped by the anime.'),
  (8,  18,        20,        54,  69,  'Nadeshiko Hide-and-Seek', null, 'Ch 55, 64 and 68 skipped, ch 69 moved to eps 10 and 15.'),
  (9,  21,        24,        70,  83,  'Shirahi''s Mirage', null, 'Ch 71 skipped, the finale (ep 24) adapts ch 81-83.'),
  (10, null::int, null::int, 84,  92,  'Morning, Evening and Night Roads', null, null),
  (11, null::int, null::int, 93,  105, 'The Crossroads of the Future', null, null),
  (12, null::int, null::int, 106, 123, 'Azuki and Uzuki (interludes)', null, null),
  (13, null::int, null::int, 124, 146, 'Now and Forever', null, null),
  (14, null::int, null::int, 147, 170, 'Year''s End in the Mirror', null, null),
  (15, null::int, null::int, 171, 194, 'How to Tie the Sky', null, 'Ch 194 is the series finale.')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- This Monster Wants to Eat Me (anime 183385 / manga 123777)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (183385, 123777, 'This Monster Wants to Eat Me', 'Single 13-episode TV season (Oct-Dec 2025), cumulative = broadcast numbering. Manga (Dengeki Maoh, monthly) ongoing, latest numbered chapter 59 on KadoComi as of Sep 2026 (12 volumes collect ch 1-55). Per-episode chapters from the This Monster Wants to Eat Me Wiki for eps 1-11 (ep 1 = ch 1-2, ep 4 ends ch 8, ep 6 ends ch 13, ep 9 ends ch 22, ep 11 = ch 26-27) and from matching episode and chapter titles for eps 12-13 (Beloved Child = ch 28-29, Warm Seabed = ch 30-31), so the anime ends at ch 31. Episodes also adapt the unnumbered interlude chapters 4.5, 9.5 and 25.5, which are not counted. Arc groupings follow the featured yokai (Miko, Ayame, Azami, the tanuki Tsubaki and Inugami Gyobu) and are approximate. No second season announced.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         4,         1,  8,  'Shiori and the Summer Festival', null::int, null::text),
  (1, 5,         6,         9,  13, 'Miko''s True Identity', null, null),
  (2, 7,         9,         14, 22, 'The Beach and Ayame', null, null),
  (3, 10,        13,        23, 31, 'Shiori''s Promise', null, null),
  (4, null::int, null::int, 32, 39, 'Tsubaki and Inugami Gyobu', null, null),
  (5, null::int, null::int, 40, 48, 'The End of Summer', null, null),
  (6, null::int, null::int, 49, 59, 'Azami and Erica', null, 'Ch 55-59 grouped here pending wiki coverage.')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Tune In to the Midnight Heart (anime 187942 / manga 169272)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (187942, 169272, 'Tune In to the Midnight Heart', 'Single 12-episode TV season (Jan-Mar 2026), cumulative = broadcast numbering. A 2nd Season is announced for 2027 (AniList 209762, not yet aired), so every arc after ch 32 carries null episodes until it airs. Manga ongoing in Weekly Shonen Magazine (current ch. 132, issue 44, Sep 30 2026). Per-episode chapter coverage comes from the Tune In to the Midnight Heart Wiki episode pages (ep 1 = ch 1-2, ep 12 = ch 31-32, no reordering or filler), and arc names and ranges come from its Story Arcs page, whose names are community-made rather than official. The wiki''s Intro (ch 1-3) and Fake Dating (ch 4-5) arcs share ep 2, so they are merged into one row. No films.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         2,         1,   5,   'Intro / Fake Dating', null::int, 'wiki Intro (ch 1-3) and Fake Dating (ch 4-5) arcs share ep 2'::text),
  (1,  3,         3,         6,   8,   'Express Yourself', null, null),
  (2,  4,         6,         9,   16,  'Sports Day', null, null),
  (3,  7,         7,         17,  19,  'Original Song', null, null),
  (4,  8,         8,         20,  22,  'Two-Timing', null, null),
  (5,  9,         10,        23,  27,  'Collab', null, null),
  (6,  11,        12,        28,  32,  'Park Performance', null, null),
  (7,  null::int, null::int, 33,  44,  'Summer Camp', null, null),
  (8,  null::int, null::int, 45,  51,  'Summer Break', null, null),
  (9,  null::int, null::int, 52,  55,  'Amou Intro', null, null),
  (10, null::int, null::int, 56,  59,  'Song Negotiation', null, null),
  (11, null::int, null::int, 60,  69,  'Cultural Festival', null, null),
  (12, null::int, null::int, 70,  73,  'Song Composing', null, null),
  (13, null::int, null::int, 74,  79,  'Amou Promotion', null, null),
  (14, null::int, null::int, 80,  97,  'School Trip', null, null),
  (15, null::int, null::int, 98,  102, 'Cosmic Latte', null, null),
  (16, null::int, null::int, 103, 107, 'Lagrange Point', null, null),
  (17, null::int, null::int, 108, 111, 'Marathon', null, null),
  (18, null::int, null::int, 112, 118, 'Christmas', null, null),
  (19, null::int, null::int, 119, 125, 'Selection Video', null, null),
  (20, null::int, null::int, 126, 127, 'Odaiba Date', null, null),
  (21, null::int, null::int, 128, 131, 'Valentine''s Day', null, null),
  (22, null::int, null::int, 132, 132, 'Rikka & Hizumi''s Live Concert', null, 'ongoing')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- 365 Days to the Wedding (anime 165790 / manga 116401)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (165790, 116401, '365 Days to the Wedding', 'Single 12-episode TV season (Oct-Dec 2024), cumulative = broadcast numbering. Manga complete at 110 chapters (Big Comic Spirits 2020-2023, 11 vols). Japanese Wikipedia (citing Real Sound) states the anime adapts through vol 5, ending where the fake engagement is called off for a real proposal (ch 50), so readers continue from ch 51. The manga is built from multi-part question arcs whose Japanese titles the episodes reuse (e.g. ep 3 = Can You Share Your Crisis? ch 12-15, ep 10 = Can You Handle a Date? ch 34-39, ep 11 = Are We Really Going to Live Together? ch 40-45). Episode-to-chapter alignment follows those shared titles, with arcs cut on episode boundaries and short arcs merged where one episode straddles two. Arc names use Seven Seas''s English chapter titles. The 2023 Prime Video live-action drama is out of scope. No films.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         2,         1,   11,  'The Fake Engagement', null::int, null::text),
  (1,  3,         3,         12,  15,  'Can You Share Your Crisis? (Princess Claudia)', null, null),
  (2,  4,         5,         16,  22,  'Can You Share Your Life? (Trip to Aso)', null, null),
  (3,  6,         7,         23,  29,  'Are You Happy Together?', null, null),
  (4,  8,         10,        30,  39,  'Is This Really a Confession of Love? / Can You Handle a Date?', null, null),
  (5,  11,        12,        40,  50,  'Living Together & the Real Proposal', null, null),
  (6,  null::int, null::int, 51,  62,  'What Does a Marriage Need? / Life Isn''t Working Out', null, null),
  (7,  null::int, null::int, 63,  71,  'Girls'' Talk / What Is It Like to Become Family?', null, null),
  (8,  null::int, null::int, 72,  79,  'What Do We Do About Our Parents?', null, null),
  (9,  null::int, null::int, 80,  88,  'Too Many Decisions to Make?', null, null),
  (10, null::int, null::int, 89,  96,  'What Even Is Marriage?', null, null),
  (11, null::int, null::int, 97,  102, 'Can You Talk to Your Mother?', null, null),
  (12, null::int, null::int, 103, 110, 'Can You See the Ocean Yet? / The Wedding', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- SHY (anime 155389 / manga 110909)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (155389, 110909, 'SHY', 'Cumulative episodes across S1 (AniList 155389, 12 eps, Oct-Dec 2023) + S2 Tokyo Recapture (AniList 171748, 12 eps = cumulative 13-24, Jul-Sep 2024). Manga complete at 293 chapters (Weekly Shonen Champion 2019-2025, 33 vols). Adapted ranges come from the SHY Wiki per-episode adaptation fields. Out-of-order material is ignored in the ranges: ch 12 airs in ep 7, ep 12 previews ch 36, and eps 13-14 open with ch 83 and ch 82 pulled forward from after Tokyo. S2 ends at ch 74, so readers continue from ch 75. Unadapted arcs follow Akita Shoten''s official volume blurbs (the Six Bright Stars, the war with Amarariruku and Neverland, the vol 31 Moon arc) and are cut on volume boundaries. Their names are descriptive, not official. No films.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         2,         1,   4,   'Shy Returns / Iko Koishikawa', 1, null::text),
  (1,  3,         5,         5,   11,  'The Dinner-Table Meeting / Stardust & Pilz', 1, null),
  (2,  6,         12,        12,  30,  'Tzveta: Spirit''s Mother (Arctic & Russia)', 1, 'ch 12 airs in ep 7, after the Arctic opener'),
  (3,  13,        15,        31,  36,  'Ai Tennoji & the Heartblade', 2, 'eps 13-14 open with ch 83 and ch 82, pulled forward'),
  (4,  16,        19,        37,  53,  'Tokyo Recapture: Into the Black Sphere', 2, null),
  (5,  20,        24,        54,  74,  'Tokyo Recapture: Utsuro and Mai', 2, 'ch 54 straddles eps 19-20'),
  (6,  null::int, null::int, 75,  86,  'Space HQ & Mai''s Ring', null, null),
  (7,  null::int, null::int, 87,  104, 'The Six Bright Stars / Kufufu', null, null),
  (8,  null::int, null::int, 105, 122, 'All-Out War / Shine''s Past', null, null),
  (9,  null::int, null::int, 123, 149, 'Neverland: Lady Black''s Trauma', null, null),
  (10, null::int, null::int, 150, 167, 'Neverland: Shy''s Awakening', null, null),
  (11, null::int, null::int, 168, 186, 'Neverland: Shy''s Revival & Mian Long vs. Doki', null, null),
  (12, null::int, null::int, 187, 212, 'Neverland Act Two: Sekirara at School & Shine''s Picture Book', null, null),
  (13, null::int, null::int, 213, 239, 'Haltia, Grandfather Yo & the Fake Heroes', null, null),
  (14, null::int, null::int, 240, 266, 'Neverland Takes Flight', null, null),
  (15, null::int, null::int, 267, 293, 'Moon Arc / Final Battle', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- ONIMAI: I'm Now Your Sister! (anime 147864 / manga 100080)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (147864, 100080, 'ONIMAI: I''m Now Your Sister!', 'Single 12-episode TV season (Jan-Mar 2023), cumulative = broadcast numbering. Manga ongoing (current ch. 116, Sep 2026). Chapters reach the author''s pixiv about a month before the Monthly ComicREX print (ch 111 ran in the Jul 2026 issue). Episode-to-chapter alignment matches episode synopses to chapter titles, and Japanese Wikipedia ties Satsuki''s debut to ep 6 / ch 21. Eps 1-11 run ch 1-37 in order but skip ch 19. The Onsen Panic two-parter (ch 17-18) is held back for ep 12, which adds an anime-original ending, so readers continue from ch 38. The manga is an episodic slice-of-life with no official arcs, so groupings follow the school calendar and are named from chapter titles. Side-story and anthology volumes are separate AniList entries and excluded. No films.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         3,         1,   10,  'Big Brother Rehabilitation', null::int, null::text),
  (1,  4,         5,         11,  19,  'Momiji & the Hozuki Sisters', null, 'ch 17-18 (Onsen Panic) air as ep 12, ch 19 is not adapted'),
  (2,  6,         7,         20,  26,  'Back to Middle School', null, null),
  (3,  8,         9,         27,  30,  'Winter Break: Sleepover & New Year', null, null),
  (4,  10,        12,        31,  37,  'Valentine''s, a Birthday & the Onsen Finale', null, 'ep 12 adapts ch 17-18 plus an anime-original ending'),
  (5,  null::int, null::int, 38,  50,  'Physical Exams to Swim Class', null, null),
  (6,  null::int, null::int, 51,  62,  'Rainy Season & Summer Vacation', null, null),
  (7,  null::int, null::int, 63,  73,  'Culture Festival & Sports Festival', null, null),
  (8,  null::int, null::int, 74,  83,  'Farewell Party, Christmas & New Year', null, null),
  (9,  null::int, null::int, 84,  93,  'A Stressful Reunion & Celebrating Success', null, null),
  (10, null::int, null::int, 94,  105, 'A New School Year, Once Again', null, null),
  (11, null::int, null::int, 106, 116, 'Popularity Rankings to the Parent-Teacher Conference', null, 'ongoing')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- 2.5 Dimensional Seduction (anime 158559 / manga 110785)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (158559, 110785, '2.5 Dimensional Seduction', 'Single 24-episode TV season (J.C.Staff, Jul-Dec 2024) adapting ch. 1-70 (vols 1-9), roughly 3 chapters per episode. Ep 24 "2.5-Dimensional Ririsa" closes on ch. 70, continue from ch. 71. The post-finale special is not counted. A second season is announced but unreleased. Manga complete (Shonen Jump+, Jun 2019-Dec 2025, 25 volumes) at 200 chapters plus the ch. 200+1 epilogue, numbered 201 in print and on MangaDex. Ranges use that print numbering. AniList lists 241, which appears to count the per-volume bonus chapters and web-split parts, so the final arc is extended to 241 to match. Episode splits pinned by episode titles that reuse chapter titles plus per-episode previews (ep 8 = ch 23-24, ep 12 = ch 35-37, ep 13 = ch 38-40, ep 14 = ch 41-43). No formal arcs, so segments are story beats named from the chapter titles. Post-anime blocks follow volume breaks.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         5,         1,   16,  'The Manga Club and the First Event', null::int, null::text),
  (1,  6,         8,         17,  24,  'Recruiting an Advisor', null, null),
  (2,  9,         12,        25,  37,  'Liliel''s Resurrection / Five Rising Stars', null, null),
  (3,  13,        17,        38,  49,  'Nonoa', null, null),
  (4,  18,        22,        50,  63,  'Summer Comiket', null, null),
  (5,  23,        24,        64,  70,  'Summer Training Camp', null, null),
  (6,  null::int, null::int, 71,  85,  'Cosplay Cafe and the Culture Festival', null, null),
  (7,  null::int, null::int, 86,  104, 'Winter Comiket', null, null),
  (8,  null::int, null::int, 105, 112, 'Valentine''s Day and 0.5D', null, null),
  (9,  null::int, null::int, 113, 128, 'The New School Year / Four Heavenly Queens', null, null),
  (10, null::int, null::int, 129, 151, 'Spring Training Camp / The Next Heavenly Queen', null, null),
  (11, null::int, null::int, 152, 167, 'The Second Summer', null, null),
  (12, null::int, null::int, 168, 183, 'The Final Culture Festival', null, null),
  (13, null::int, null::int, 184, 193, 'The Final Winter Comiket', null, null),
  (14, null::int, null::int, 194, 241, 'Final Arc', null, 'print numbering ends at ch. 201 (the 200+1 epilogue). 241 matches AniList''s count')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- My Home Hero (anime 151189 / manga 108196)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (151189, 108196, 'My Home Hero', 'Single 12-episode TV season (Tezuka Productions, Apr-Jun 2023) adapting the whole of manga Part 1, ch. 1-48 (vols 1-6, ch. 48 is titled "My Happiness (Part 1 Finale)"), continue from ch. 49. Manga complete at 224 chapters in 26 volumes (Weekly Young Magazine, 2017-2024): Part 1 ch. 1-48, Part 2 ch. 49-150, Part 3 ch. 151-224 (opens with "7 Years Later"). Episode splits inferred from episode titles, which reuse chapter titles (ep 4 = ch 16, ep 9 = ch 34, ep 10 = ch 39, ep 12 = ch 48), cut on volume breaks. No named arcs beyond the three Parts, so Part 1 is split on story beats and Part 2 on the investigation, village and war phases from the chapter titles. The 2023 live-action drama and 2024 live-action film are excluded.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         4,         1,   16,  'Nobuto''s Murder', null::int, null::text),
  (1, 5,         9,         17,  34,  'Kyoichi''s Deadline', null, null),
  (2, 10,        12,        35,  48,  'Showdown with Matori (Part 1 Finale)', null, null),
  (3, null::int, null::int, 49,  82,  'Part 2: The Police Close In', null, null),
  (4, null::int, null::int, 83,  123, 'Part 2: Kasen''s Village', null, null),
  (5, null::int, null::int, 124, 150, 'Part 2: War at the Village', null, null),
  (6, null::int, null::int, 151, 224, 'Part 3: Seven Years Later', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- I Want to Love You Till Your Dying Day (anime 187260 / manga 104045)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (187260, 104045, 'I Want to Love You Till Your Dying Day', 'Single 13-episode TV season (Roll2, Jul-Sep 2026) adapting ch. 1-24 (vols 1-5), continue from ch. 25. Every episode title reuses a chapter title (ep 1 = ch 2 "Kiss", ep 6 = ch 11 "Welcome Back", ep 9 = ch 17 "My Magic", ep 12 = ch 23 "On My Own", ep 13 = ch 24 "I Want to See You"), which pins the splits at about 2 chapters per episode. Manga ongoing (Comic Yuri Hime, now Ichijin Plus web serialization, roughly one long chapter every few months), current ch. 42 (vol. 9, Jul 2026). AniList has no chapter count. The 2026 side-story volume (AniList 206732) and the official anthology are separate entries. No formal arcs, so segments are story beats. Post-anime blocks follow volume breaks and are named from their chapter titles.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         5,         1,  10, 'The Immortal Girl', null::int, null::text),
  (1, 6,         9,         11, 18, 'Seiran and Ali', null, null),
  (2, 10,        13,        19, 24, 'Halfred and the Quarrel', null, null),
  (3, null::int, null::int, 25, 34, 'The Shape of Us', null, null),
  (4, null::int, null::int, 35, 42, 'From Here On Out', null, 'ongoing: ch. 42 is the latest as of Oct 2026')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- A Town Where You Live (anime 17741 / manga 38483)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (17741, 38483, 'A Town Where You Live', 'Single 12-episode TV season (Gonzo, Jul-Sep 2013). The TV series opens at ch. 80 with Haruto moving to Tokyo and skips the Hiroshima arc (ch. 1-79), which it only revisits in flashbacks (eps 2, 3 and 5, plus a ch. 212 flashback in ep 6). It then compresses the Tokyo arc and the start of the College arc, ending around ch. 144 (end of vol. 15) when Haruto chooses Yuzuki after the Shobara summer festival. Continue from ch. 145. The 2012 Twilight Intersection OVAs (AniList 11313) and the 2014 OVAs (AniList 20715, bundled with vols 26-27 and animating a vol. 9 flashback and the final chapter) are OVAs, not TV episodes, and are excluded. Manga complete at 261 chapters in 27 volumes (Weekly Shonen Magazine, 2008-2014). Arc names and ranges from Japanese Wikipedia (Hiroshima 1-79, Tokyo 80-109, College 110-247, Working Adult 248-261). Episode splits from the Seo Kouji fandom wiki episode pages (ep 1 = ch 80-82, ep 8 = ch 119-124, ep 9 = ch 125-127) and Bandai Channel episode synopses, so the ch. 144 end is approximate.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, null::int, null::int, 1,   79,  'Hiroshima Arc', null::int, 'skipped by the TV anime, seen only in flashbacks (eps 2, 3, 5) and the 2012 OVAs'::text),
  (1, 1,         7,         80,  109, 'Tokyo Arc', null, null),
  (2, 8,         12,        110, 144, 'College Arc: Reunion and the Shobara Summer', null, 'ep 8 skims ch. 110-118 and adapts ch. 119-124'),
  (3, null::int, null::int, 145, 247, 'College Arc: Life Together in Tokyo', null, null),
  (4, null::int, null::int, 248, 261, 'Working Adult Arc', null, 'final chapter animated only in the 2014 OVA, which is excluded')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Tsugumomo (anime 97625 / manga 44369)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (97625, 44369, 'Tsugumomo', 'Cumulative episodes across Tsugumomo S1 (AniList 97625, 12 eps, 2017) + Tsugu Tsugumomo S2 (AniList 108266, 12 eps = cumulative 13-24, 2020) = 24. S1 adapts ch. 1-34 and ends as Kiriha transfers into Kazuya''s class (start of ch. 35), abridging ch. 31-34. S2 resumes at ch. 35 and stops partway through ch. 71 (vol. 14). Its ep 1 second half is anime-original and its ep 2 (ep 14) adapts the ch. 32-33 Fake Marriage chapters S1 skipped. Continue from ch. 72. Manga ongoing (Comic Seed!, WEB Comic High!, Monthly Action, now Manga Action), current ch. 188 (37 volumes as of Sep 2026). Arc names, chapter ranges and episode assignments from the Tsugumomo Wiki Story Arcs page (fan-made names), cross-checked against Japanese Wikipedia''s volume-based arcs. The 2020 crowdfunded OVA (AniList 108267) and the mini-anime are excluded.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         2,         1,   4,   'Introduction', 1, null::text),
  (1,  3,         4,         5,   9,   'Hakusan Shrine', 1, null),
  (2,  5,         9,         10,  19,  'Local Exorcist', 1, null),
  (3,  10,        12,        20,  34,  'Sunao Sumeragi', 1, 'ch. 32-33 are adapted later in ep 14'),
  (4,  13,        15,        35,  41,  'Counselling Office Club', 2, 'ep 14 (The False Fiancee) adapts the skipped ch. 32-33'),
  (5,  16,        17,        42,  48,  'Reversal', 2, null),
  (6,  18,        24,        49,  71,  'Mayoiga Revolt', 2, 'ep 24 stops partway through ch. 71'),
  (7,  null::int, null::int, 72,  85,  'Memories of Kanaka', null, null),
  (8,  null::int, null::int, 86,  113, 'Tsuzura Temple', null, null),
  (9,  null::int, null::int, 114, 127, 'Chronicles of Ziral', null, null),
  (10, null::int, null::int, 128, 132, 'Kazuya''s Partners', null, null),
  (11, null::int, null::int, 133, 161, 'Divine Resurrection', null, null),
  (12, null::int, null::int, 162, 188, 'Curse Allies', null, 'ongoing: ch. 188 is the latest as of Oct 2026')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- The Café Terrace and Its Goddesses (anime 154412 / manga 129694)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (154412, 129694, 'The Café Terrace and Its Goddesses', 'Cumulative episodes across S1 (AniList 154412, 12 eps, Apr-Jun 2023) + Season 2 (AniList 166477, 12 eps = cumulative 13-24, Jul-Sep 2024). Manga complete at 217 chapters in 22 volumes (Weekly Shonen Magazine, Feb 2021-Nov 2025), the unnumbered special chapters Kouji Seo has published irregularly since the finale are not counted. Episode coverage from animefillerguide''s per-episode chapter conversion: the anime reorders chapters freely within each stretch and ends at ch 89, so arcs are grouped at their outer boundaries (ch 27 airs in ep 12, ch 29 in ep 15, ch 30 and ch 75 are skipped). The manga has no formal named arcs: names follow key chapter titles and story beats, and the unadapted ch 90-217 are grouped near volume boundaries. No theatrical films.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         3,         1,   7,   'Reopening Familia', 1, null::text),
  (1,  4,         6,         8,   16,  'Spring at Familia', 1, null),
  (2,  7,         9,         17,  28,  'Summer at the Beach Hut', 1, 'ch 27 airs later, in ep 12'),
  (3,  10,        12,        29,  43,  'Ouka and Kikka / End of Summer', 1, 'ch 29 airs in ep 15, ch 30 is skipped'),
  (4,  13,        15,        44,  53,  'The Copycat Terrace Café', 2, null),
  (5,  16,        19,        54,  66,  'Eleven Under One Roof / Hot Spring Trip', 2, null),
  (6,  20,        21,        67,  74,  'Riho''s Choice / Mother and Daughter', 2, null),
  (7,  22,        24,        75,  89,  'Christmas, New Year and the Last Pilaf', 2, 'ch 75 is skipped'),
  (8,  null::int, null::int, 90,  107, 'New Familia Order / One Year Anniversary', null, null),
  (9,  null::int, null::int, 108, 117, 'The Miyakojima Trip', null, null),
  (10, null::int, null::int, 118, 123, 'Sachiko''s Happiness', null, null),
  (11, null::int, null::int, 124, 134, 'Karate and the Summer Fes', null, null),
  (12, null::int, null::int, 135, 147, 'Olivia the Fiancée', null, null),
  (13, null::int, null::int, 148, 158, 'Mission: Proposal', null, null),
  (14, null::int, null::int, 159, 167, 'Sachiko and Masahiro / The Second Familia Trial', null, null),
  (15, null::int, null::int, 168, 187, 'Riho''s Acting Comeback', null, null),
  (16, null::int, null::int, 188, 197, 'Hayato''s Confession', null, null),
  (17, null::int, null::int, 198, 217, 'Familia Wars (Finale)', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Medalist (anime 165171 / manga 118371)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (165171, 118371, 'Medalist', 'Cumulative episodes across S1 (AniList 165171, 13 eps, Jan-Mar 2025) + Season 2 (AniList 189275, 9 eps = cumulative 14-22, Jan-Mar 2026), both fully aired. Chapters use the official score numbering (Monthly Afternoon), the unnumbered Short Program and Exhibition extras are not counted. S1 adapts score 1-15 (gamepedia.jp) and S2 score 16-28, cross-checked against the episode titles, which reuse the chapter titles (eps 12 and 13 swap scores 15 and 14, ep 22 closes at the All-Japans opening ceremony). Manga ongoing but on hiatus since score 61 (Jun 2026, vol 15), paused mid-way through the JGP Final. Arc names follow the competitions the manga is built around. The Medalist Movie (AniList 206298, Feb 2027, set after S2) is not yet released, so it is excluded.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         3,         1,  3,  'Genius on Ice', 1, null::text),
  (1, 4,         6,         4,  6,  'Meikoh Cup', 1, null),
  (2, 7,         9,         7,  10, 'The Powers of the West', 1, null),
  (3, 10,        13,        11, 15, 'Level 6 Badge Test', 1, null),
  (4, 14,        17,        16, 21, 'Chubu Block Championship', 2, null),
  (5, 18,        22,        22, 28, 'Road to the All-Japans', 2, null),
  (6, null::int, null::int, 29, 36, 'All-Japan Novice Championship', null, null),
  (7, null::int, null::int, 37, 48, 'Junior Grand Prix Series', null, null),
  (8, null::int, null::int, 49, 53, 'All-Japan Junior Championship', null, null),
  (9, null::int, null::int, 54, 61, 'Junior Grand Prix Final', null, 'manga on hiatus mid-competition')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Gals Can't Be Kind to Otaku!? (anime 199588 / manga 138380)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (199588, 138380, 'Gals Can''t Be Kind to Otaku!?', 'Single 12-episode TV season (Apr-Jun 2026). Manga ongoing in Monthly Comic Zenon (current ch. 108 as of 2026-10-07, 13 volumes), chapters 8-10 are split into short parts on some readers but counted whole here. No published episode-to-chapter guide exists: arcs are aligned by matching the official per-episode synopses (otagal.jp) and episode titles to chapter titles, and the anime ends on the school-festival afterparty at ch 29 (end of vol 4). Eps 5-6 reorder ch 12-15 within the summer stretch. Unadapted arcs are grouped by volume and named after key chapter titles. No films.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         3,         1,  7,   'Otaku Meets Gals', null::int, null::text),
  (1,  4,         6,         8,  15,  'Summer with the Gals', null, null),
  (2,  7,         9,         16, 21,  'Festival Prep and the Sleepover', null, null),
  (3,  10,        12,        22, 29,  'The School Festival', null, null),
  (4,  null::int, null::int, 30, 37,  'Birthday Party and Late-Night Love Talk', null, null),
  (5,  null::int, null::int, 38, 44,  'Christmas Eve', null, null),
  (6,  null::int, null::int, 45, 60,  'Valentine''s Day and White Day', null, null),
  (7,  null::int, null::int, 61, 68,  'Double Date and the New School Year', null, null),
  (8,  null::int, null::int, 69, 85,  'Playing Couple / One-Year Anniversary', null, null),
  (9,  null::int, null::int, 86, 95,  'Ball Game Tournament and Open Campus', null, null),
  (10, null::int, null::int, 96, 108, 'The Second Confession', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Dealing with Mikadono Sisters Is a Breeze (anime 178886 / manga 143719)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (178886, 143719, 'Dealing with Mikadono Sisters Is a Breeze', 'Single 12-episode TV season (Jul-Sep 2025). Manga ongoing in Weekly Shonen Sunday with chapters titled home.N (current home.221, 2026-09-30 issue, 20 volumes). Episode titles reuse chapter titles (ep 2 = ch 5, ep 4 = ch 13, ep 5 = ch 14, ep 6 = ch 18, ep 7 = ch 27, ep 8 = ch 30, ep 9 = ch 34, ep 10 = ch 38, ep 11 = ch 41, ep 12 = ch 42), and the anime opens on ch 1-3 and closes on ch 43-45, so the adapted arcs follow each sister''s focus stretch between those anchors. Unadapted arcs are named after key chapter titles (the confessions, trial dating, the school-festival play, the hot-spring trip) and grouped near volume boundaries. No films.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         4,         1,   13,  'Becoming a Family', null::int, null::text),
  (1,  5,         6,         14,  22,  'Kazuki''s Audition', null, null),
  (2,  7,         9,         23,  35,  'Niko and Iwayama Academy', null, null),
  (3,  10,        12,        36,  45,  'Miwa''s Shogi Title Match', null, null),
  (4,  null::int, null::int, 46,  66,  'Life at the Mikadono House', null, null),
  (5,  null::int, null::int, 67,  75,  'The Good Match Candidate', null, null),
  (6,  null::int, null::int, 76,  95,  'Summer on the Southern Island', null, null),
  (7,  null::int, null::int, 96,  116, 'The Confessions', null, null),
  (8,  null::int, null::int, 117, 126, 'Yu''s Decision', null, null),
  (9,  null::int, null::int, 127, 141, 'Trial Dating', null, null),
  (10, null::int, null::int, 142, 160, 'Becoming the Star', null, null),
  (11, null::int, null::int, 161, 181, 'The School Festival Play', null, null),
  (12, null::int, null::int, 182, 194, 'Christmas and New Year', null, null),
  (13, null::int, null::int, 195, 205, 'Papa and Mama?', null, null),
  (14, null::int, null::int, 206, 221, 'The Hot Spring Trip', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Love of Kill (anime 127050 / manga 99435)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (127050, 99435, 'Love of Kill', 'Single 12-episode TV season (Jan-Mar 2022). Main manga complete at 79 chapters in 13 volumes (Monthly Comic Gene, Oct 2015-Jan 2023), using the Yen Press and MangaDex numbering. AniList''s 102 also counts the Special File extras (x.5 chapters) and the After the File epilogue (2023-24, vol 14, separately numbered 0-7), so the final arc is extended to 102 to match (ch 80-102 stand in for those extras, not story chapters). Episode titles reuse chapter titles (ep 2 = ch 4, ep 3 = ch 9, ep 4 = ch 11, ep 5 = ch 15, ep 6 = ch 17, ep 7 = ch 21, ep 8 = ch 26, ep 9 = ch 28, ep 10 = ch 34, ep 11 = ch 38, ep 12 = ch 40), and the anime ends with vol 7 at ch 41, consistent with animefillerguide''s continue-from-vol-8 note. Unadapted tail arcs are grouped by volume. No films.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0, 1,         5,         1,  16, 'The Spiderweb Assassin', null::int, null::text),
  (1, 6,         8,         17, 26, 'The Cruise Ship', null, null),
  (2, 9,         10,        27, 34, 'Donny the Trigger', null, null),
  (3, 11,        12,        35, 41, 'The Real Ryang-ha Song', null, null),
  (4, null::int, null::int, 42, 53, 'On the Run / Chateau''s Lineage', null, null),
  (5, null::int, null::int, 54, 102, 'Endgame with Donny', null, 'Final chapter is 79, and 102 matches AniList''s count, which includes extras and the After the File epilogue')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Ayakashi Triangle (anime 142849 / manga 119493)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (142849, 119493, 'Ayakashi Triangle', 'Single 12-episode TV season (Jan-Sep 2023, halted after ep 6 by COVID-19 production delays and restarted from ep 1 in July), cumulative = broadcast numbering. Manga complete at 144 chapters in 16 volumes (Weekly Shonen Jump ch 1-88, Shonen Jump+ ch 89-144), matching AniList (the vol. 15 bonus ch 88.5 is not counted). Episode edges from the Ayakashi Triangle Wiki''s per-episode adapted-chapter lists, cross-checked against Anime Filler Guide''s conversion table: eps 1-8 adapt ch 1-16 in order, then ep 9 pulls ch 26-27 ahead of the Sosuke Hinojiki chapters (ch 17-24, eps 10-12), ch 25 is never animated, and ep 12 borrows Reo''s transfer from the end of ch 34, so the last adapted arc is grouped at its outer boundaries (ch 17-27). Continue from ch 25, then ch 28. The wiki has no story-arc list, so arc names are editorial: adapted arcs follow the episode stretches, unadapted arcs follow the tankobon volumes (vol 4 from ch 28, then vols 5-16), named from their chapter titles and Seven Seas volume blurbs. No films.')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         4,         1,   7,   'Matsuri, Suzu, and the Ayakashi', null::int, null::text),
  (1,  5,         6,         8,   11,  'Omokage', null, null),
  (2,  7,         8,         12,  16,  'Garaku Utagawa', null, null),
  (3,  9,         12,        17,  27,  'Sosuke Hinojiki the Jinyo', null, 'Ep 9 adapts ch 26-27 ahead of the Hinojiki chapters 17-24 (eps 10-12), ch 25 is skipped, ep 12 borrows Reo''s transfer from the end of ch 34'),
  (4,  null::int, null::int, 28,  34,  'Mei Hirasaka and Chirizuka Kaiou', null, null),
  (5,  null::int, null::int, 35,  43,  'Rochka the Snow Maiden', null, null),
  (6,  null::int, null::int, 44,  52,  'The Hiderigami and Kubire Oni', null, null),
  (7,  null::int, null::int, 53,  61,  'When Past and Present Meet', null, null),
  (8,  null::int, null::int, 62,  70,  'Garaku''s Betrayal and Hinojiki''s Revenge', null, null),
  (9,  null::int, null::int, 71,  79,  'Shadow Mei''s Friendship / Mysterious Detective Lucy', null, null),
  (10, null::int, null::int, 80,  88,  'Rochka''s Present / Suzu Spirited Away', null, null),
  (11, null::int, null::int, 89,  97,  'Feelings of a Young Heart / Kanade', null, null),
  (12, null::int, null::int, 98,  106, 'Summer Camp and Une the Ungaikyo', null, null),
  (13, null::int, null::int, 107, 115, 'Ayakashi of the Moon and the Gogyosen', null, null),
  (14, null::int, null::int, 116, 124, 'The Two Matsuris', null, null),
  (15, null::int, null::int, 125, 134, 'Love Prison', null, null),
  (16, null::int, null::int, 135, 144, 'Final Battle Against the Gogyosen', null, null)
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);

-- Hikaru no Go (anime 135 / manga 30020)
with s as (
  insert into series (anilist_anime_id, anilist_manga_id, title, source_notes)
  values (135, 30020, 'Hikaru no Go', 'Single 75-episode TV run (Studio Pierrot, TV Tokyo, Oct 2001-Mar 2003), cumulative = broadcast numbering (Game 1-75). Manga complete at 189 numbered chapters (Games) in 23 volumes. AniList lists 197 because it also counts the eight collected side stories (six fill vol. 18, two close vol. 23), so ranges use the Game numbering and the final arc is extended to 197 to match. The anime is a faithful adaptation of vols 1-17 (ch 1-148) ending on Hikaru vs. Akira, continue from ch 149 (vol. 19). Three episodes sit outside the chapter numbering inside their arcs: ep 50 (a Sai-narrated backstory and recap interlude), ep 64 (anime-original Keicho flower-vase story, a TV remake of the 2001 Jump Festa special, AniList 10765) and ep 66 (adapts the unnumbered vol. 18 side story Toya Akira). The Hokuto Cup preliminaries (ch 149-167) were condensed into the 77-minute 2004 New Year TV special Road to the Hokuto Cup (AniList 645), which is not counted in the episode numbering, and the tournament itself (ch 168-189) was never animated. Arc names loosely follow the Hikaru no Go fandom wiki story-arc list. Episode edges matched from the Japanese episode titles (most reuse a chapter title) and wiki chapter summaries, so a few edges may be off by a chapter. No theatrical films exist (both specials are TV/event releases).')
  on conflict (anilist_anime_id) do nothing
  returning id
)
insert into arc_mappings
  (series_id, position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note)
select s.id, v.* from s, (values
  (0,  1,         6,         1,   12,  'Beginning: Sai Awakens', null::int, null::text),
  (1,  7,         14,        13,  28,  'Haze Middle School Go Club', null, null),
  (2,  15,        18,        29,  36,  'Who Is sai?', null, null),
  (3,  19,        22,        37,  45,  'Becoming an Insei', null, null),
  (4,  23,        27,        46,  57,  'Insei Days / Akira vs. the Oza', null, 'Ep 27 (A Place to Return) adapts ch 51 together with ch 57, after the A League chapters'),
  (5,  28,        30,        58,  63,  'Young Lions Tournament', null, null),
  (6,  31,        32,        64,  68,  'Pro Exam Preliminaries', null, null),
  (7,  33,        36,        69,  76,  'Summer Training / Suyong Hong', null, null),
  (8,  37,        46,        77,  96,  'Pro Exam', null, null),
  (9,  47,        51,        97,  104, 'Shinshodan Series', null, 'Ep 50 is a Sai-narrated backstory and recap interlude'),
  (10, 52,        59,        105, 121, 'Sai vs. Toya Koyo', null, null),
  (11, 60,        64,        122, 130, 'Sai Disappears', null, 'Ep 64 is anime-original (TV remake of the 2001 Jump Festa special)'),
  (12, 65,        68,        131, 137, 'Isumi in China', null, 'Ep 66 adapts the unnumbered vol. 18 side story Toya Akira'),
  (13, 69,        72,        138, 143, 'Hikaru Returns', null, null),
  (14, 73,        75,        144, 148, 'Hikaru vs. Akira', null, null),
  (15, null::int, null::int, 149, 167, 'Road to the Hokuto Cup', null, 'Condensed into the 2004 TV special Road to the Hokuto Cup (AniList 645), not counted in episode numbering'),
  (16, null::int, null::int, 168, 177, 'Hokuto Cup Preparations', null, null),
  (17, null::int, null::int, 178, 181, 'Hokuto Cup: China vs. Japan', null, null),
  (18, null::int, null::int, 182, 197, 'Hokuto Cup: Japan vs. Korea', null, 'Story ends at ch 189, extended to AniList''s 197 for the counted side stories')
) as v(position, episode_start, episode_end, chapter_start, chapter_end, arc, season, note);
