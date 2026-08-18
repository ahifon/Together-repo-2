'use client'

import { useState } from 'react'
import type { CategoryStat, ExpenseView, Totals } from '@/lib/compute'
import { daysUntil, dateFr, euro, relativeFr } from '@/lib/format'
import type { Actions } from '@/lib/store'
import type { Member, Wedding } from '@/lib/types'
import { Avatar, Bar, Icon, Pill, Sheet } from './ui'

const OK = 'var(--color-ok)'
const OK_SOFT = '#9ad3bb'
const WARN = 'var(--color-warn)'

export function Dashboard({
  wedding,
  members,
  userId,
  views,
  stats,
  sums,
  actions,
  onOpenExpense,
  onGoDecisions,
}: {
  wedding: Wedding
  members: Member[]
  userId: string | null
  views: ExpenseView[]
  stats: CategoryStat[]
  sums: Totals
  actions: Actions
  onOpenExpense: (id: string) => void
  onGoDecisions: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const countdown = daysUntil(wedding.wedding_date)
  const available = Math.max(0, sums.budgetMax - sums.approved - sums.pending)
  const pendingApproved = Math.max(0, sums.approved - sums.settled)
  const recent = views.slice(0, 6)
  const topCategories = stats
    .filter((s) => s.estimate > 0)
    .sort((a, b) => b.estimate - a.estimate)
    .slice(0, 6)

  async function saveBudget() {
    const value = Number(draft.replace(/[^\d.]/g, ''))
    if (!Number.isFinite(value) || value <= 0) return
    setBusy(true)
    try {
      await actions.updateWedding({ budget_max: value })
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4 px-4 pb-28 pt-3">
      <section className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-medium leading-tight">{wedding.name}</h1>
            <p className="mt-0.5 text-sm text-muted">
              {wedding.wedding_date
                ? countdown !== null && countdown >= 0
                  ? `${dateFr(wedding.wedding_date)} · J‑${countdown}`
                  : dateFr(wedding.wedding_date)
                : 'Date à définir'}
            </p>
          </div>
          <div className="flex -space-x-1.5">
            {members.map((m) => (
              <Avatar key={m.user_id} name={m.display_name} accent={m.accent} size={30} />
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted">Validé à deux</p>
            <p className="tabular text-3xl font-medium leading-none">{euro(sums.approved)}</p>
          </div>
          <button
            onClick={() => {
              setDraft(String(Math.round(sums.budgetMax)))
              setEditing(true)
            }}
            className="flex items-center gap-1.5 text-right text-sm text-muted"
          >
            <span className="tabular">sur {euro(sums.budgetMax)}</span>
            <Icon name="pencil" size={14} />
          </button>
        </div>

        <div className="mt-3">
          <Bar
            segments={[
              { value: sums.settled, color: OK },
              { value: pendingApproved, color: OK_SOFT },
              { value: sums.pending, color: WARN },
              { value: available, color: 'var(--color-line)' },
            ]}
          />
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <Legend color={OK} label={`Payé ${euro(sums.settled)}`} />
            <Legend color={OK_SOFT} label={`Validé ${euro(pendingApproved)}`} />
            <Legend color={WARN} label={`En attente ${euro(sums.pending)}`} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Tile label="Estimation totale" value={euro(sums.estimate)} />
          <Tile
            label={sums.remaining >= 0 ? 'Reste à engager' : 'Dépassement'}
            value={euro(Math.abs(sums.remaining))}
            tone={sums.remaining >= 0 ? 'plain' : 'bad'}
          />
        </div>

        {sums.overBudget > 0 ? (
          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-warn-soft px-3 py-2.5 text-warn">
            <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed">
              Avec les enveloppes actuelles vous visez {euro(sums.estimate)}, soit{' '}
              {euro(sums.overBudget)} au‑dessus du budget max.
            </p>
          </div>
        ) : null}
      </section>

      <button
        onClick={onGoDecisions}
        className="card flex w-full items-center gap-3 p-4 text-left"
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            sums.toDecideByMe > 0 ? 'bg-warn-soft text-warn' : 'bg-ok-soft text-ok'
          }`}
        >
          <Icon name={sums.toDecideByMe > 0 ? 'hourglass' : 'check'} size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">
            {sums.toDecideByMe > 0
              ? `${sums.toDecideByMe} décision${sums.toDecideByMe > 1 ? 's' : ''} pour toi`
              : 'Rien à décider de ton côté'}
          </span>
          <span className="block text-sm text-muted">
            {sums.pendingCount > 0
              ? `${sums.pendingCount} dépense${sums.pendingCount > 1 ? 's' : ''} en attente · ${euro(sums.pending)}`
              : 'Toutes les dépenses sont tranchées'}
          </span>
        </span>
        <Icon name="right" size={18} className="shrink-0 text-faint" />
      </button>

      {topCategories.length > 0 ? (
        <section className="card overflow-hidden">
          <h2 className="px-4 pt-4 text-sm font-medium">Où part l’argent</h2>
          <div className="mt-3 divide-y divide-line">
            {topCategories.map((s) => {
              const over = s.approved + s.pending > s.planned && s.planned > 0
              return (
                <div key={s.category.id} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[0.9375rem]">{s.category.name}</p>
                    <p className="tabular shrink-0 text-[0.9375rem] font-medium">
                      {euro(s.estimate)}
                    </p>
                  </div>
                  <div className="mt-1.5">
                    <Bar
                      height={6}
                      segments={[
                        { value: s.approved, color: OK },
                        { value: s.pending, color: WARN },
                        {
                          value: Math.max(0, s.planned - s.approved - s.pending),
                          color: 'var(--color-line)',
                        },
                      ]}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    {euro(s.approved)} validé
                    {s.pending > 0 ? ` · ${euro(s.pending)} en attente` : ''}
                    {s.planned > 0 ? ` · enveloppe ${euro(s.planned)}` : ' · sans enveloppe'}
                    {over ? ' · dépassée' : ''}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section className="card overflow-hidden">
          <h2 className="px-4 pt-4 text-sm font-medium">Dernière activité</h2>
          <ul className="mt-2 divide-y divide-line">
            {recent.map((v) => (
              <li key={v.id}>
                <button
                  onClick={() => onOpenExpense(v.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[0.9375rem]">{v.label}</span>
                      <StatusPill status={v.status} />
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
                      {v.category?.name ?? 'Sans catégorie'} · {relativeFr(v.created_at)}
                    </span>
                  </span>
                  <span className="tabular shrink-0 text-[0.9375rem] font-medium">
                    {euro(v.amount)}
                  </span>
                  <Icon name="right" size={16} className="shrink-0 text-faint" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Sheet
        open={editing}
        onClose={() => setEditing(false)}
        title="Budget maximum"
        footer={
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn btn-ghost flex-1">
              Annuler
            </button>
            <button onClick={saveBudget} disabled={busy} className="btn btn-primary flex-1">
              Enregistrer
            </button>
          </div>
        }
      >
        <label className="label" htmlFor="bmax">
          Montant que vous ne voulez pas dépasser
        </label>
        <input
          id="bmax"
          className="field tabular"
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <p className="mt-3 text-xs leading-relaxed text-faint">
          Sert de référence à toutes les alertes. Modifiable à tout moment, visible par vous deux.
        </p>
      </Sheet>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="tabular">{label}</span>
    </span>
  )
}

function Tile({
  label,
  value,
  tone = 'plain',
}: {
  label: string
  value: string
  tone?: 'plain' | 'bad'
}) {
  return (
    <div className="rounded-2xl bg-paper px-3.5 py-3">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p
        className={`tabular mt-0.5 text-xl font-medium ${tone === 'bad' ? 'text-bad' : ''}`}
      >
        {value}
      </p>
    </div>
  )
}

export function StatusPill({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  if (status === 'approved')
    return (
      <Pill tone="ok">
        <Icon name="check" size={11} strokeWidth={2.4} />
        Validé
      </Pill>
    )
  if (status === 'rejected')
    return (
      <Pill tone="bad">
        <Icon name="x" size={11} strokeWidth={2.4} />
        Refusé
      </Pill>
    )
  return (
    <Pill tone="warn">
      <Icon name="clock" size={11} strokeWidth={2.4} />
      En attente
    </Pill>
  )
}
