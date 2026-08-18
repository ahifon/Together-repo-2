'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ExpenseView } from '@/lib/compute'
import { dateFr, euro, relativeFr } from '@/lib/format'
import type { Actions } from '@/lib/store'
import type { Snapshot } from '@/lib/types'
import { StatusPill } from './Dashboard'
import { Avatar, Icon, Sheet } from './ui'

type Mode = 'closed' | 'create' | 'detail'

export type SheetState = { mode: Mode; expenseId?: string; categoryId?: string | null }

export function ExpenseSheet({
  state,
  snap,
  views,
  userId,
  actions,
  onClose,
}: {
  state: SheetState
  snap: Snapshot
  views: ExpenseView[]
  userId: string | null
  actions: Actions
  onClose: () => void
}) {
  const open = state.mode !== 'closed'
  const expense = state.expenseId ? views.find((v) => v.id === state.expenseId) ?? null : null
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (state.mode === 'create') setEditing(true)
    if (state.mode === 'detail') setEditing(false)
  }, [state.mode, state.expenseId])

  const title =
    state.mode === 'create'
      ? 'Nouvelle dépense'
      : editing
        ? 'Modifier la dépense'
        : (expense?.label ?? 'Dépense')

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {state.mode === 'create' || editing ? (
        <ExpenseForm
          key={state.expenseId ?? 'new'}
          snap={snap}
          expense={expense}
          presetCategory={state.categoryId ?? null}
          userId={userId}
          actions={actions}
          onDone={() => (state.mode === 'create' ? onClose() : setEditing(false))}
          onCancel={() => (state.mode === 'create' ? onClose() : setEditing(false))}
        />
      ) : expense ? (
        <ExpenseDetail
          expense={expense}
          snap={snap}
          userId={userId}
          actions={actions}
          onEdit={() => setEditing(true)}
          onClose={onClose}
        />
      ) : (
        <p className="py-8 text-center text-sm text-muted">Cette dépense n’existe plus.</p>
      )}
    </Sheet>
  )
}

function ExpenseDetail({
  expense,
  snap,
  userId,
  actions,
  onEdit,
  onClose,
}: {
  expense: ExpenseView
  snap: Snapshot
  userId: string | null
  actions: Actions
  onEdit: () => void
  onClose: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const memberById = useMemo(
    () => new Map(snap.members.map((m) => [m.user_id, m])),
    [snap.members]
  )
  const thread = snap.comments
    .filter((c) => c.expense_id === expense.id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
  const myVote = expense.votes.find((v) => v.user_id === userId) ?? null
  const remaining = expense.amount - expense.settled_amount

  async function run(fn: () => Promise<unknown>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <StatusPill status={expense.status} />
          <span className="text-xs text-muted">
            ajoutée {relativeFr(expense.created_at)} par{' '}
            {memberById.get(expense.created_by)?.display_name ?? 'un membre'}
          </span>
        </div>
        <p className="tabular mt-3 text-3xl font-medium leading-none">{euro(expense.amount)}</p>
        <p className="mt-1.5 text-sm text-muted">
          {expense.category?.name ?? 'Sans catégorie'}
          {expense.vendor ? ` · ${expense.vendor}` : ''}
        </p>
        {expense.due_date ? (
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
            <Icon name="calendar" size={14} />
            Échéance {dateFr(expense.due_date)}
          </p>
        ) : null}
        {expense.notes ? (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{expense.notes}</p>
        ) : null}
        {expense.quote_url ? (
          <a
            href={expense.quote_url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent underline"
          >
            <Icon name="link" size={15} />
            Devis
          </a>
        ) : null}
      </div>

      <div className="rounded-2xl bg-paper p-3.5">
        <p className="text-xs font-medium text-muted">Validation</p>
        <ul className="mt-2 space-y-2">
          {snap.members.map((m) => {
            const vote = expense.votes.find((v) => v.user_id === m.user_id)
            return (
              <li key={m.user_id} className="flex items-start gap-2.5">
                <Avatar name={m.display_name} accent={m.accent} size={26} dimmed={!vote} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{m.display_name}</span>{' '}
                    {vote ? (
                      <span className={vote.decision === 'approve' ? 'text-ok' : 'text-bad'}>
                        a {vote.decision === 'approve' ? 'validé' : 'refusé'}
                      </span>
                    ) : (
                      <span className="text-muted">n’a pas encore répondu</span>
                    )}
                  </p>
                  {vote?.note ? (
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">« {vote.note} »</p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>

        <div className="mt-3 flex gap-2">
          {myVote?.decision !== 'approve' ? (
            <button
              onClick={() => run(() => actions.decide(expense.id, 'approve'))}
              disabled={busy}
              className="btn btn-ok flex-1 !py-2 text-sm"
            >
              <Icon name="check" size={15} strokeWidth={2.2} />
              Je valide
            </button>
          ) : null}
          {myVote?.decision !== 'reject' ? (
            <button
              onClick={() => run(() => actions.decide(expense.id, 'reject'))}
              disabled={busy}
              className="btn btn-bad flex-1 !py-2 text-sm"
            >
              <Icon name="x" size={15} strokeWidth={2.2} />
              Je refuse
            </button>
          ) : null}
          {myVote ? (
            <button
              onClick={() => run(() => actions.undecide(expense.id))}
              disabled={busy}
              className="btn btn-ghost !py-2 text-sm"
            >
              Annuler mon vote
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl bg-paper p-3.5">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-medium text-muted">Paiement</p>
          <p className="tabular text-sm">
            {euro(expense.settled_amount)} payé · {euro(Math.max(0, remaining))} restant
          </p>
        </div>
        <div className="mt-2.5 flex gap-2">
          <button
            onClick={() =>
              run(() =>
                actions.updateExpense(expense.id, { settled_amount: expense.amount })
              )
            }
            disabled={busy || remaining <= 0}
            className="btn btn-ghost flex-1 !py-2 text-sm"
          >
            Tout payé
          </button>
          <button
            onClick={() =>
              run(() =>
                actions.updateExpense(expense.id, {
                  settled_amount: Math.round(expense.amount * 0.3),
                })
              )
            }
            disabled={busy}
            className="btn btn-ghost flex-1 !py-2 text-sm"
          >
            Acompte 30 %
          </button>
          {expense.settled_amount > 0 ? (
            <button
              onClick={() => run(() => actions.updateExpense(expense.id, { settled_amount: 0 }))}
              disabled={busy}
              className="btn btn-ghost !py-2 text-sm"
            >
              Remettre à 0
            </button>
          ) : null}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted">Échanges</p>
        {thread.length > 0 ? (
          <ul className="mt-2.5 space-y-2.5">
            {thread.map((c) => {
              const mine = c.user_id === userId
              const author = memberById.get(c.user_id)
              return (
                <li key={c.id} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                  <Avatar
                    name={author?.display_name ?? '?'}
                    accent={author?.accent ?? 'violet'}
                    size={24}
                  />
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      mine ? 'bg-accent-soft text-accent-ink' : 'bg-paper'
                    }`}
                  >
                    <p className="whitespace-pre-line">{c.body}</p>
                    <p className="mt-1 text-[0.6875rem] opacity-60">{relativeFr(c.created_at)}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Aucun message pour l’instant.</p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            const body = message.trim()
            if (!body) {
              setError('Écris un message avant d’envoyer')
              return
            }
            void run(async () => {
              await actions.addComment(expense.id, body)
              setMessage('')
            })
          }}
          className="mt-3 flex gap-2"
        >
          <input
            className="field"
            placeholder="Un mot à ton binôme…"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              setError(null)
            }}
          />
          <button type="submit" disabled={busy} className="btn btn-primary !px-4">
            <Icon name="right" size={17} />
          </button>
        </form>
      </div>

      {error ? <p className="text-sm text-bad">{error}</p> : null}

      <div className="flex items-center justify-between border-t border-line pt-4">
        <button onClick={onEdit} className="inline-flex items-center gap-1.5 text-sm text-accent">
          <Icon name="pencil" size={15} />
          Modifier
        </button>
        {confirmDelete ? (
          <span className="flex items-center gap-2 text-sm">
            <span className="text-muted">Supprimer ?</span>
            <button
              onClick={() =>
                run(async () => {
                  await actions.deleteExpense(expense.id)
                  onClose()
                })
              }
              disabled={busy}
              className="font-medium text-bad"
            >
              Oui
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-muted">
              Non
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 text-sm text-bad"
          >
            <Icon name="trash" size={15} />
            Supprimer
          </button>
        )}
      </div>
    </div>
  )
}

function ExpenseForm({
  snap,
  expense,
  presetCategory,
  userId,
  actions,
  onDone,
  onCancel,
}: {
  snap: Snapshot
  expense: ExpenseView | null
  presetCategory: string | null
  userId: string | null
  actions: Actions
  onDone: () => void
  onCancel: () => void
}) {
  const [label, setLabel] = useState(expense?.label ?? '')
  const [amount, setAmount] = useState(expense ? String(Math.round(expense.amount)) : '')
  const [categoryId, setCategoryId] = useState<string>(
    expense?.category_id ?? presetCategory ?? ''
  )
  const [vendor, setVendor] = useState(expense?.vendor ?? '')
  const [dueDate, setDueDate] = useState(expense?.due_date ?? '')
  const [quoteUrl, setQuoteUrl] = useState(expense?.quote_url ?? '')
  const [notes, setNotes] = useState(expense?.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sorted = useMemo(
    () =>
      snap.categories
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, 'fr')),
    [snap.categories]
  )

  const parsedAmount = Number(amount.replace(/[^\d.,]/g, '').replace(',', '.'))
  const amountChanged = expense ? Math.round(parsedAmount) !== Math.round(expense.amount) : false

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) {
      setError('Donne un intitulé à la dépense')
      return
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Entre un montant supérieur à zéro')
      return
    }
    setBusy(true)
    setError(null)
    try {
      if (expense) {
        await actions.updateExpense(
          expense.id,
          {
            label: label.trim(),
            amount: parsedAmount,
            category_id: categoryId || null,
            vendor: vendor.trim() || null,
            due_date: dueDate || null,
            quote_url: quoteUrl.trim() || null,
            notes: notes.trim() || null,
          },
          amountChanged
        )
      } else {
        await actions.createExpense({
          label: label.trim(),
          amount: parsedAmount,
          category_id: categoryId || null,
          vendor: vendor.trim() || null,
          due_date: dueDate || null,
          quote_url: quoteUrl.trim() || null,
          notes: notes.trim() || null,
        })
      }
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible')
    } finally {
      setBusy(false)
    }
  }

  const partner = snap.members.find((m) => m.user_id !== userId)

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="elabel">
          Intitulé
        </label>
        <input
          id="elabel"
          className="field"
          placeholder="Acompte traiteur"
          value={label}
          onChange={(e) => {
            setLabel(e.target.value)
            setError(null)
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="eamount">
            Montant (€)
          </label>
          <input
            id="eamount"
            className="field tabular"
            inputMode="decimal"
            placeholder="1500"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setError(null)
            }}
          />
        </div>
        <div>
          <label className="label" htmlFor="edate">
            Échéance
          </label>
          <input
            id="edate"
            type="date"
            className="field"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="ecat">
          Catégorie
        </label>
        <select
          id="ecat"
          className="field"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Sans catégorie</option>
          {sorted.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="evendor">
          Prestataire (facultatif)
        </label>
        <input
          id="evendor"
          className="field"
          placeholder="Maison Belmont"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="equote">
          Lien du devis (facultatif)
        </label>
        <input
          id="equote"
          className="field"
          inputMode="url"
          placeholder="https://…"
          value={quoteUrl}
          onChange={(e) => setQuoteUrl(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="enotes">
          Pourquoi cette dépense (facultatif)
        </label>
        <textarea
          id="enotes"
          className="field"
          rows={3}
          placeholder="Ce qui est inclus, ce qu’on gagne à dire oui…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error ? <p className="text-sm text-bad">{error}</p> : null}

      <p className="rounded-2xl bg-accent-soft px-3.5 py-3 text-xs leading-relaxed text-accent-ink">
        {expense
          ? amountChanged
            ? `Le montant change : ton binôme devra valider à nouveau.`
            : 'Les validations en place sont conservées.'
          : `Tu valides automatiquement en ajoutant. ${
              partner ? partner.display_name : 'Ton binôme'
            } recevra la dépense dans « À décider ».`}
      </p>

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="btn btn-ghost flex-1">
          Annuler
        </button>
        <button type="submit" disabled={busy} className="btn btn-primary flex-1">
          {busy ? 'Enregistrement…' : expense ? 'Enregistrer' : 'Proposer la dépense'}
        </button>
      </div>
    </form>
  )
}
