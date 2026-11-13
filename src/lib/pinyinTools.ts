import type { Tone, ToneInfo } from '@/data/pinyin'
import type { WritingRating } from '@/types/hanzi'

const MARKED: Record<string, [string, Tone]> = {}
const TONE_ROWS: Array<[string, string]> = [
  ['a', 'āáǎà'], ['e', 'ēéěè'], ['i', 'īíǐì'], ['o', 'ōóǒò'], ['u', 'ūúǔù'], ['ü', 'ǖǘǚǜ'],
]
for (const [base, marks] of TONE_ROWS) {
  ;[...marks].forEach((mark, i) => { MARKED[mark] = [base, (i + 1) as Tone] })
}

/** The tone of one pinyin syllable written with marks; 5 when it has none. */
export const toneOf = (syllable: string): Tone => {
  for (const ch of syllable) if (MARKED[ch]) return MARKED[ch][1]
  return 5
}

export const withTone = (syllable: string, tone: Tone): string => {
  if (tone === 5) return syllable
  const plain = [...syllable].map((ch) => MARKED[ch]?.[0] ?? ch).join('')
  const at = plain.includes('a') ? plain.indexOf('a')
    : plain.includes('e') ? plain.indexOf('e')
      : plain.includes('ou') ? plain.indexOf('o')
        : Math.max(...[...'aeiouü'].map((v) => plain.lastIndexOf(v)))
  if (at < 0) return syllable
  const row = TONE_ROWS.find(([base]) => base === plain[at])
  return row ? plain.slice(0, at) + row[1][tone - 1] + plain.slice(at + 1) : syllable
}

export interface SandhiResult {
  read: string[]
  /** True when three or more third tones run together: the grouping depends on meaning, so nothing is changed. */
  ambiguous: boolean
}

/**
 * Reads a run of pinyin syllables the way they are spoken: two third tones in a row become 2+3, 不 and 一 change
 * before the next tone. Three or more third tones, the half-third tone and word groups are taught, not computed.
 */
export const applySandhi = (input: string): SandhiResult => {
  const syllables = input.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const tones = syllables.map(toneOf)
  let ambiguous = false
  const read = syllables.map((syllable, i) => {
    const next = syllables[i + 1]
    if (!next) return syllable
    const nextTone = toneOf(next)
    const tone = toneOf(syllable)
    if (syllable === 'bù' && nextTone === 4) return 'bú'
    if (syllable === 'yī') {
      if (nextTone === 4) return 'yí'
      if (nextTone !== 5) return 'yì'
      return syllable
    }
    if (tone === 3 && nextTone === 3) {
      const before = i > 0 && tones[i - 1] === 3
      const after = tones[i + 2] === 3
      if (before || after) { ambiguous = true; return syllable }
      return withTone(syllable, 2)
    }
    return syllable
  })
  return { read, ambiguous }
}

/** Maps the strokes a learner got wrong in one run to the rating the review queue expects. */
export const ratingFromMistakes = (mistakes: number): WritingRating => {
  if (mistakes === 0) return 'EASY'
  if (mistakes === 1) return 'GOOD'
  if (mistakes <= 3) return 'HARD'
  return 'AGAIN'
}

/** SVG path points of a tone contour in a 120 x 100 box, matching the chart in the design. */
export const contourPath = (contour: ToneInfo['contour']): string =>
  contour.map(([x, level], i) => `${i === 0 ? 'M' : 'L'}${(14 + x * 86).toFixed(1)} ${(90 - (level - 1) * 20).toFixed(1)}`).join(' ')

const NO_INITIAL: Record<string, string> = {
  i: 'yi', in: 'yin', ing: 'ying', ia: 'ya', ie: 'ye', iao: 'yao', iu: 'you', ian: 'yan', iang: 'yang', iong: 'yong',
  u: 'wu', ua: 'wa', uo: 'wo', uai: 'wai', ui: 'wei', uan: 'wan', un: 'wen', uang: 'wang', ueng: 'weng',
  'ü': 'yu', 'üe': 'yue', 'üan': 'yuan', 'ün': 'yun',
}

/** Writes initial + final + tone as pinyin: y and w when there is no initial, u for ü after j, q, x, then the tone mark. */
export const composeSyllable = (initial: string, final: string, tone: Tone): string => {
  let body: string
  if (initial === '') body = NO_INITIAL[final] ?? final
  else if (['j', 'q', 'x'].includes(initial) && final.startsWith('ü')) body = initial + 'u' + final.slice(1)
  else body = initial + final
  return withTone(body, tone)
}
