import type { AniListDate } from "@/types";

const MONTHS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatAniListDate(
  date: AniListDate | undefined | null,
): string {
  if (!date?.year) return "";
  if (date.month && date.day) {
    return `${MONTHS_EN[date.month - 1]} ${date.day}, ${date.year}`;
  }
  if (date.month) {
    return `${MONTHS_EN[date.month - 1]} ${date.year}`;
  }
  return `${date.year}`;
}

export function formatAniListDateJa(
  date: AniListDate | undefined | null,
): string {
  if (!date?.year) return "";
  if (date.month && date.day) {
    return `${date.year}年${date.month}月${date.day}日`;
  }
  if (date.month) {
    return `${date.year}年${date.month}月`;
  }
  return `${date.year}年`;
}

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  "en-us": "English (US)",
  "ja-ro": "Japanese (romaji)",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  "zh-hk": "Chinese (HK)",
  "pt-br": "Portuguese (BR)",
  es: "Spanish",
  "es-la": "Spanish (LatAm)",
  fr: "French",
  de: "German",
  it: "Italian",
  ru: "Russian",
  vi: "Vietnamese",
  th: "Thai",
  tr: "Turkish",
  ar: "Arabic",
  he: "Hebrew",
  fa: "Persian",
  ur: "Urdu",
  bn: "Bengali",
  hi: "Hindi",
  uk: "Ukrainian",
  pl: "Polish",
  nl: "Dutch",
  id: "Indonesian",
  ms: "Malay",
  fil: "Filipino",
  kk: "Kazakh",
  mn: "Mongolian",
  ne: "Nepali",
};

export function localeLabel(locale: string): string {
  return LOCALE_NAMES[locale.toLowerCase()] ?? locale.toUpperCase();
}
