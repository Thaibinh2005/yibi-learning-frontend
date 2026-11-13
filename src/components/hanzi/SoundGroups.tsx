import React from 'react'
import { FINAL_GROUPS, INITIAL_GROUPS, SPELLING_RULES } from '@/data/pinyin'
import type { SoundGroup } from '@/data/pinyin'

const Groups: React.FC<{ groups: SoundGroup[] }> = ({ groups }) => (
  <div className="grid gap-3 md:grid-cols-2">
    {groups.map((group) => (
      <article key={group.id} className="card-soft space-y-3 p-5">
        <header className="flex items-baseline gap-2">
          <h3 className="font-extrabold text-slate-900">{group.title}</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold tabular-nums text-slate-600">{group.sounds.length}</span>
        </header>
        <ul className="flex flex-wrap gap-2">
          {group.sounds.map((sound) => (
            <li key={sound.letter} className="flex min-w-16 flex-col items-center rounded-2xl border-2 border-slate-200 bg-white px-3 py-2">
              <span className="text-xl font-extrabold leading-snug text-slate-900">{sound.letter}</span>
              {sound.like && <span className="text-xs leading-snug text-slate-500">≈ {sound.like}</span>}
            </li>
          ))}
        </ul>
      </article>
    ))}
  </div>
)

export const InitialsPanel: React.FC = () => (
  <div className="space-y-3">
    <p className="max-w-prose text-sm leading-relaxed text-slate-600">
      21 thanh mẫu, chia 6 nhóm theo vị trí phát âm. <b>y</b> và <b>w</b> chỉ là cách viết khi âm tiết bắt đầu bằng i, u, ü. Phần "≈" là cách đọc gần giống tiếng Việt, chỉ để dễ nhớ.
    </p>
    <Groups groups={INITIAL_GROUPS} />
  </div>
)

export const FinalsPanel: React.FC = () => (
  <div className="space-y-5">
    <Groups groups={FINAL_GROUPS} />
    <section className="space-y-3">
      <h3 className="text-lg font-extrabold text-slate-900">Quy tắc viết cần nhớ</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {SPELLING_RULES.map((rule) => (
          <article key={rule.id} className="card-soft space-y-3 p-5">
            <h4 className="font-extrabold leading-snug text-slate-900">{rule.title}</h4>
            <ul className="flex flex-wrap gap-2">
              {rule.chips.map((chip) => <li key={chip} className="rounded-xl bg-slate-100 px-3 py-1 text-sm font-bold leading-snug text-slate-700">{chip}</li>)}
            </ul>
            {rule.note && <p className="text-sm leading-relaxed text-slate-500">{rule.note}</p>}
          </article>
        ))}
      </div>
    </section>
  </div>
)
