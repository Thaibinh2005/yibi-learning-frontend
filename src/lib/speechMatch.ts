/** Which characters of a sentence were heard right, for colouring them while the learner speaks. */

const DIGITS = '零一二三四五六七八九'
const isHan = (character: string) => /\p{Script=Han}/u.test(character)

/** Chinese characters only, digits written as characters, as the recognizer may write 3 for 三. */
export const heardCharacters = (heard: string) =>
  [...heard].map((c) => (c >= '0' && c <= '9' ? DIGITS[Number(c)] : c)).filter(isHan)

/**
 * For each character of the sentence: true when an optimal alignment pairs it with the same character heard.
 * The same alignment as the server's, so the colours do not jump when the final result arrives.
 */
export function matchedCharacters(sentence: string[], heard: string): boolean[] {
  const spoken = sentence.map((c, i) => [c, i] as const).filter(([c]) => isHan(c))
  const want = spoken.map(([c]) => c)
  const got = heardCharacters(heard)
  const cost = Array.from({ length: want.length + 1 }, (_, i) => Array.from({ length: got.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))
  for (let i = 1; i <= want.length; i++) {
    for (let j = 1; j <= got.length; j++) {
      cost[i][j] = Math.min(cost[i - 1][j] + 1, cost[i][j - 1] + 1, cost[i - 1][j - 1] + (want[i - 1] === got[j - 1] ? 0 : 1))
    }
  }
  const matched = new Array<boolean>(sentence.length).fill(false)
  let i = want.length
  let j = got.length
  while (i > 0 && j > 0) {
    if (want[i - 1] === got[j - 1] && cost[i][j] === cost[i - 1][j - 1]) {
      matched[spoken[i - 1][1]] = true
      i--
      j--
    } else if (cost[i][j] === cost[i - 1][j - 1] + 1) {
      i--
      j--
    } else if (cost[i][j] === cost[i - 1][j] + 1) {
      i--
    } else {
      j--
    }
  }
  return matched
}

type Recognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

/** The browser's live speech recognition (Chrome, Edge, Safari), or null where there is none. */
export function createRecognition(): Recognition | null {
  const host = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }
  const Constructor = host.SpeechRecognition ?? host.webkitSpeechRecognition
  if (!Constructor) return null
  const recognition = new Constructor()
  recognition.lang = 'zh-CN'
  recognition.interimResults = true
  recognition.continuous = false
  return recognition
}
