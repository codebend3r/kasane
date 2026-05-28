import { formatAniListDate, formatAniListDateJa, localeLabel } from './format';

describe('formatAniListDate', () => {
  it('returns empty string for missing year', () => {
    expect(formatAniListDate(null)).toBe('');
    expect(formatAniListDate(undefined)).toBe('');
    expect(formatAniListDate({ year: null, month: 3, day: 12 })).toBe('');
  });

  it('formats full date', () => {
    expect(formatAniListDate({ year: 2024, month: 3, day: 12 })).toBe('Mar 12, 2024');
  });

  it('formats year + month only', () => {
    expect(formatAniListDate({ year: 2024, month: 7, day: null })).toBe('Jul 2024');
  });

  it('formats year only', () => {
    expect(formatAniListDate({ year: 2024, month: null, day: null })).toBe('2024');
  });
});

describe('formatAniListDateJa', () => {
  it('formats full date in Japanese', () => {
    expect(formatAniListDateJa({ year: 2024, month: 3, day: 12 })).toBe('2024年3月12日');
  });

  it('formats year + month in Japanese', () => {
    expect(formatAniListDateJa({ year: 2024, month: 7, day: null })).toBe('2024年7月');
  });

  it('formats year only in Japanese', () => {
    expect(formatAniListDateJa({ year: 2024, month: null, day: null })).toBe('2024年');
  });
});

describe('localeLabel', () => {
  it('maps known locales to friendly names', () => {
    expect(localeLabel('en')).toBe('English');
    expect(localeLabel('ja-ro')).toBe('Japanese (romaji)');
  });

  it('is case-insensitive on lookup', () => {
    expect(localeLabel('EN')).toBe('English');
  });

  it('falls back to uppercase for unknown locales', () => {
    expect(localeLabel('xx')).toBe('XX');
  });
});
