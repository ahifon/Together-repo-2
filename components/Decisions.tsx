'use client'

import { useMemo, useRef, useState } from 'react'
import type { CategoryStat, ExpenseView, Totals } from '@/lib/compute'
import { dateShort, euro, relativeFr } from '@/lib/format'
import type { Actions } from '@/lib/store'
import type { Comment, Member } from '@/lib/types'
import { StatusPill } from './Dashboard'
import { Avatar, Empty, Icon, Pill } from './ui'

export function Decisions({
  views,
  stats,
  sums,
  members,
  comments,
  userId,
  actions,
  onOpenExpense,
}: {
  views: ExpenseView[]
  stats: CategoryStat[]
  sums: Totals
  members: Member[]
  comments: Comment[]
  userId: string | null
  actions: Actions
  onOpenExpense: (id: string) => void
}) {
  const [skipped, setSkipped] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(0)
  const startX = useRef<number | null>(null)

  const queue = useMemo(
    () =>
      views
        .filter((v) => v.status === 'pending' && !v.votes.some((a) => a.user_id === userId))
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [views, userId]
  )

  const active = queue.find((v) => !skipped.includes(v.id)) ?? null
  const waitingOnOther = views.filter(
    (v) => v.status === 'pending' && v.votes.some((a) => a.user_id === userId)
  )
  const rejected = views.filter((v) => v.status === 'rejected')

  const memberById = useMemo(
    () => new Map(members.map((m) => [m.user_id, m])),
    [members]
  )

  async function decide(decision: 'approve' | 'reject') {
    if (!active || busy) return
    setBusy(true)
    try {
      await actions.decide(active.id, decision, note.trim() || undefined)
      setNote('')
      setNoteOpen(false)
      setDrag(0)
    } finally {
      setBusy(false)
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX
  }

  function onPointerMove(e: React.PointerEvent) {
    if (startX.current === null) return
    setDrag(e.clientX - startX.current)
  }

  function onPointerUp() {
    if (startX.current === null) return
    const dx = drag
    startX.current = null
    if (dx > 110) void decide('approve')
    else if (dx < -110) void decide('reject')
    else setDrag(0)
  }

  const stat = active ? stats.find((s) => s.category.id === active.category_id) ?? null : null
  const envelopeLeft = stat ? stat.planned - stat.approved : null
  const overEnvelope =
    active && envelopeLeft !== null ? Math.max(0, active.amount - envelopeLeft) : 0
  const remainingAfter = active ? sums.budgetMax - sums.approved - active.amount : 0
  const author = active ? memberById.get(active.created_by) : undefined
  const activeComments = active ? comments.filter((c) => c.expense_id === active.id) : []

  return (
    <div className="space-y-5 px-4 pb-28 pt-3">
      <header className="flex items-baseline justify-between">
        <h1 className="text-lg font-medium">À décider</h1>
        <span className="tabular text-sm text-muted">
          {queue.length} en file{skipped.length > 0 ? ` · ${skipped.length} reportée${skipped.length > 1 ? 's' : ''}` : ''}
        </span>
      </header>

      {active ? (
        <div>
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="card card-swipe relative touch-pan-y select-none p-5"
            style={{
              transform: `translateX(${drag}px) rotate(${drag * 0.02}deg)`,
              transition: startX.current === null ? 'transform 0.2s ease' : 'none',
              borderColor:
                drag > 60
                  ? 'var(--color-ok)'
                  : drag < -60
                    ? 'var(--color-bad)'
                    : 'var(--color-line)',
            }}
          >
            {drag > 60 ? (
              <span className="absolute right-4 top-4 rounded-full bg-ok-soft px-2.5 py-1 text-xs font-medium text-ok">
                Valider
              </span>
            ) : null}
            {drag < -60 ? (
              <span className="absolute left-4 top-4 rounded-full bg-bad-soft px-2.5 py-1 text-xs font-medium text-bad">
                Refuser
              </span>
            ) : null}

            <div className="flex items-center gap-2">
              <Avatar
                name={author?.display_name ?? 'Binôme'}
                accent={author?.accent ?? 'violet'}
                size={24}
              />
              <p className="text-xs text-muted">
                Proposé par {author?.display_name ?? 'ton binôme'} ·{' '}
                {relativeFr(active.created_at)}
              </p>
            </div>

            <h2 className="mt-3 text-xl font-medium leading-tight">{active.label}</h2>
            <p className="mt-1 text-sm text-muted">
              {active.category?.name ?? 'Sans catégorie'}
              {active.vendor ? ` · ${active.vendor}` : ''}
              {active.due_date ? ` · échéance ${dateShort(active.due_date)}` : ''}
            </p>

            <p className="tabular mt-4 text-4xl font-medium leading-none">{euro(active.amount)}</p>

            <div className="mt-4 space-y-2 rounded-2xl bg-paper p-3.5 text-sm">
              {envelopeLeft !== null && stat && stat.planned > 0 ? (
                <Row
                  label={`Enveloppe ${stat.category.name}`}
                  value={`${euro(Math.max(0, envelopeLeft))} disponible`}
                  tone={overEnvelope > 0 ? 'bad' : 'plain'}
                />
              ) : null}
              {overEnvelope > 0 ? (
                <Row
                  label="Dépassement de l’enveloppe"
                  value={`+${euro(overEnvelope)}`}
                  tone="bad"
                />
              ) : null}
              <Row
                label="Budget restant si tu valides"
                value={euro(remainingAfter)}
                tone={remainingAfter < 0 ? 'bad' : 'ok'}
              />
            </div>

            {active.notes ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
                {active.notes}
              </p>
            ) : null}

            {active.quote_url ? (
              <a
                href={active.quote_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent underline"
              >
                <Icon name="link" size={15} />
                Voir le devis
              </a>
            ) : null}

            {activeComments.length > 0 ? (
              <button
                onClick={() => onOpenExpense(active.id)}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted"
              >
                <Icon name="message" size={15} />
                {activeComments.length} message{activeComments.length > 1 ? 's' : ''}
              </button>
            ) : null}
          </div>

          {noteOpen ? (
            <textarea
              className="field mt-3"
              rows={2}
              placeholder="Un mot pour expliquer ta décision (facultatif)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          ) : null}

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => void decide('reject')}
              disabled={busy}
              className="btn btn-bad flex-1"
            >
              <Icon name="x" size={17} strokeWidth={2.2} />
              Refuser
            </button>
            <button
              onClick={() => void decide('approve')}
              disabled={busy}
              className="btn btn-ok flex-1"
            >
              <Icon name="check" size={17} strokeWidth={2.2} />
              Valider
            </button>
          </div>

          <div className="mt-2 flex justify-between px-1">
            <button
              onClick={() => setNoteOpen((v) => !v)}
              className="text-sm text-muted underline"
            >
              {noteOpen ? 'Masquer le mot' : 'Ajouter un mot'}
            </button>
            <button
              onClick={() => setSkipped((s) => [...s, active.id])}
              className="text-sm text-muted underline"
            >
              Plus tard
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-faint">
            Glisse la carte à droite pour valider, à gauche pour refuser.
          </p>
        </div>
      ) : queue.length > 0 ? (
        <Empty
          icon="hourglass"
          title="Tout est reporté"
          body={`${skipped.length} dépense${skipped.length > 1 ? 's attendent' : ' attend'} encore ta décision.`}
          action={
            <button onClick={() => setSkipped([])} className="btn btn-ghost mt-1">
              <Icon name="refresh" size={16} />
              Reprendre la file
            </button>
          }
        />
      ) : (
        <Empty
          icon="check"
          title="Rien à décider"
          body="Chaque dépense proposée par ton binôme apparaîtra ici avec son impact sur le budget."
        />
      )}

      {waitingOnOther.length > 0 ? (
        <section className="card overflow-hidden">
          <h2 className="px-4 pt-4 text-sm font-medium">En attente de ton binôme</h2>
          <ul className="mt-2 divide-y divide-line">
            {waitingOnOther.map((v) => {
              const mine = v.votes.find((a) => a.user_id === userId)
              return (
                <li key={v.id}>
                  <button
                    onClick={() => onOpenExpense(v.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.9375rem]">{v.label}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        Tu as {mine?.decision === 'approve' ? 'validé' : 'refusé'} ·{' '}
                        {v.category?.name ?? 'Sans catégorie'}
                      </span>
                    </span>
                    <span className="tabular shrink-0 text-[0.9375rem] font-medium">
                      {euro(v.amount)}
                    </span>
                    <Pill tone="warn">
                      <Icon name="clock" size={11} strokeWidth={2.4} />
                    </Pill>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {rejected.length > 0 ? (
        <section className="card overflow-hidden">
          <h2 className="px-4 pt-4 text-sm font-medium">Écartées</h2>
          <ul className="mt-2 divide-y divide-line">
            {rejected.map((v) => (
              <li key={v.id}>
                <button
                  onClick={() => onOpenExpense(v.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.9375rem] text-muted line-through">
                      {v.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-faint">
                      {v.category?.name ?? 'Sans catégorie'}
                    </span>
                  </span>
                  <span className="tabular shrink-0 text-[0.9375rem] text-muted">
                    {euro(v.amount)}
                  </span>
                  <StatusPill status="rejected" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function Row({
  label,
  value,
  tone = 'plain',
}: {
  label: string
  value: string
  tone?: 'plain' | 'ok' | 'bad'
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span
        className={`tabular font-medium ${
          tone === 'bad' ? 'text-bad' : tone === 'ok' ? 'text-ok' : ''
        }`}
      >
        {value}
      </span>
    </div>
  )
}
