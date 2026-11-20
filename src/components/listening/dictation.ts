/** Checking a dictation answer: Chinese characters by longest common subsequence, or pinyin without tones. */

const HAN = /[㐀-鿿豈-﫿]/

export const hanOnly = (text: string) => Array.from(text).filter((c) => HAN.test(c))

/** Pinyin letters only: tones, spaces and punctuation removed, ü written as v. */
export const plainPinyin = (text: string) =>
  text
    .normalize('NFD')
    .replace(/ü/g, 'v')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ü/g, 'v')
    .replace(/[^a-z]/g, '')

/** Which items of `a` and `b` belong to one longest common subsequence. */
export function lcsMarks<T>(a: T[], b: T[]): { aHit: boolean[]; bHit: boolean[] } {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const aHit = new Array<boolean>(a.length).fill(false)
  const bHit = new Array<boolean>(b.length).fill(false)
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      aHit[i] = true
      bHit[j] = true
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++
    else j++
  }
  return { aHit, bHit }
}

export interface DictationResult {
  /** 0 to 1 */
  score: number
  mode: 'hanzi' | 'pinyin'
  expected: { ch: string; hit: boolean }[]
  typed: { ch: string; hit: boolean }[]
}

/**
 * Scores what the learner typed against the sentence. Typed Chinese is compared character by character (extra
 * characters lower the score too); typed Latin letters are taken as pinyin and compared without tones.
 */
export function checkDictation(sentence: string, pinyin: string | undefined, answer: string): DictationResult {
  const typedHan = hanOnly(answer)
  if (typedHan.length === 0 && /[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/.test(answer) && pinyin) {
    const expected = Array.from(plainPinyin(pinyin))
    const typed = Array.from(plainPinyin(answer))
    const { aHit, bHit } = lcsMarks(expected, typed)
    const hits = aHit.filter(Boolean).length
    return {
      score: expected.length ? hits / Math.max(expected.length, typed.length) : 0,
      mode: 'pinyin',
      expected: expected.map((ch, i) => ({ ch, hit: aHit[i] })),
      typed: typed.map((ch, i) => ({ ch, hit: bHit[i] })),
    }
  }
  const expected = hanOnly(sentence)
  const { aHit, bHit } = lcsMarks(expected, typedHan)
  const hits = aHit.filter(Boolean).length
  return {
    score: expected.length ? hits / Math.max(expected.length, typedHan.length) : 0,
    mode: 'hanzi',
    expected: expected.map((ch, i) => ({ ch, hit: aHit[i] })),
    typed: typedHan.map((ch, i) => ({ ch, hit: bHit[i] })),
  }
}
