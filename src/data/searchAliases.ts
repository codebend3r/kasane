const SEARCH_ALIASES: Record<string, string> = {
  // concatenated titles AniList won't match without spaces
  deathnote: 'death note',
  onepiece: 'one piece',
  spyfamily: 'spy x family',
  spyxfamily: 'spy x family',
  chainsawman: 'chainsaw man',
  demonslayer: 'demon slayer',
  attackontitan: 'attack on titan',
  myheroacademia: 'my hero academia',
  jujutsukaisen: 'jujutsu kaisen',
  fullmetalalchemist: 'fullmetal alchemist',
  bleach: 'bleach',
  blackclover: 'black clover',
  fairytail: 'fairy tail',
  mobpsycho: 'mob psycho',
  drstone: 'dr. stone',
  kaijuno8: 'kaiju no. 8',
  sakamotodays: 'sakamoto days',
  goldenkamuy: 'golden kamuy',

  // common acronyms
  aot: 'attack on titan',
  snk: 'shingeki no kyojin',
  mha: 'my hero academia',
  bnha: 'boku no hero academia',
  jjk: 'jujutsu kaisen',
  fmab: 'fullmetal alchemist brotherhood',
  fma: 'fullmetal alchemist',
  ohshc: 'ouran high school host club',
  ygo: 'yu-gi-oh',
  hxh: 'hunter x hunter',
  tbhk: 'toilet-bound hanako-kun',
  ksdk: 'kaguya-sama love is war',
};

export function applySearchAlias(query: string): string {
  const key = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return SEARCH_ALIASES[key] ?? query;
}
