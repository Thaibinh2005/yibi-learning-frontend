// Copies the stroke files the writing page needs from hanzi-writer-data into public/hanzi-data,
// so the app serves them itself: the HSK writing characters, the radicals and the example characters.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'node_modules', 'hanzi-writer-data')
const target = join(root, 'public', 'hanzi-data')

const han = /\p{Script=Han}/gu
const text = ['scripts/writing-chars.txt', 'src/data/radicals.ts', 'src/data/pinyin.ts']
  .map((file) => readFileSync(join(root, file), 'utf8'))
  .join('')
const chars = [...new Set(text.match(han) ?? [])]

mkdirSync(target, { recursive: true })
const missing = []
let copied = 0
for (const char of chars) {
  const from = join(source, `${char}.json`)
  if (!existsSync(from)) { missing.push(char); continue }
  copyFileSync(from, join(target, `${char}.json`))
  copied++
}
console.log(`hanzi-data: ${copied} stroke files copied, ${missing.length} without data${missing.length ? `: ${missing.join(' ')}` : ''}`)
