import {
  GENRE_FILTERS,
  splitHiddenForAniList,
} from './genreFilters';

describe('GENRE_FILTERS catalog', () => {
  it('has 28 entries', () => {
    expect(GENRE_FILTERS).toHaveLength(28);
  });

  it('has unique ids', () => {
    const ids = GENRE_FILTERS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique tokens within each kind', () => {
    const genres = GENRE_FILTERS.filter((f) => f.kind === 'genre').map(
      (f) => f.token
    );
    const tags = GENRE_FILTERS.filter((f) => f.kind === 'tag').map(
      (f) => f.token
    );
    expect(new Set(genres).size).toBe(genres.length);
    expect(new Set(tags).size).toBe(tags.length);
  });

  it('contains Ecchi as a genre', () => {
    const ecchi = GENRE_FILTERS.find((f) => f.id === 'ecchi');
    expect(ecchi).toEqual({
      id: 'ecchi',
      label: 'Ecchi',
      kind: 'genre',
      token: 'Ecchi',
    });
  });

  it("contains BL with token \"Boys' Love\"", () => {
    const bl = GENRE_FILTERS.find((f) => f.id === 'bl');
    expect(bl?.kind).toBe('tag');
    expect(bl?.token).toBe("Boys' Love");
  });
});

describe('splitHiddenForAniList', () => {
  it('returns nulls for an empty selection', () => {
    expect(splitHiddenForAniList([])).toEqual({
      genreNotIn: null,
      tagNotIn: null,
    });
  });

  it('routes a genre id into genreNotIn', () => {
    expect(splitHiddenForAniList(['ecchi'])).toEqual({
      genreNotIn: ['Ecchi'],
      tagNotIn: null,
    });
  });

  it('routes a tag id into tagNotIn', () => {
    expect(splitHiddenForAniList(['isekai'])).toEqual({
      genreNotIn: null,
      tagNotIn: ['Isekai'],
    });
  });

  it('splits mixed selections into the right buckets', () => {
    const out = splitHiddenForAniList(['ecchi', 'isekai', 'horror', 'bl']);
    expect(out.genreNotIn?.sort()).toEqual(['Ecchi', 'Horror']);
    expect(out.tagNotIn?.sort()).toEqual(["Boys' Love", 'Isekai']);
  });

  it('produces stable output regardless of input order', () => {
    const a = splitHiddenForAniList(['horror', 'ecchi']);
    const b = splitHiddenForAniList(['ecchi', 'horror']);
    expect(a).toEqual(b);
  });

  it('ignores unknown ids without throwing', () => {
    expect(splitHiddenForAniList(['ecchi', 'nonexistent-id'])).toEqual({
      genreNotIn: ['Ecchi'],
      tagNotIn: null,
    });
  });
});
