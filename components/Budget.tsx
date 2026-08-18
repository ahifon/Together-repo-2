'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CategoryStat, ExpenseView, Totals } from '@/lib/compute'
import { euro } from '@/lib/format'
import type { Actions } from '@/lib/store'
import type { Category, Snapshot } from '@/lib/types'
import { StatusPill } from './Dashboard'
import { Bar, Icon, Sheet } from './ui'

const OK = 'var(--color-ok)'
const WARN = 'var(--color-warn)'

export function Budget({
  snap,
  views,
  stats,
  sums,
  actions,
  onOpenExpense,
  onAddExpense,
}: {
  snap: Snapshot
  views: ExpenseView[]
  stats: CategoryStat[]
  sums: Totals
  actions: Actions
  onOpenExpense: (id: string) => void
  onAddExpense: (categoryId: string | null) => void
}) {
  const [open, setOpen] = useState<string | null>(null)
  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)

  const groups = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, CategoryStat[]>()
    for (const s of stats) {
      const g = s.category.group_name
      if (!map.has(g)) {
        map.set(g, [])
        order.push(g)
      }
      map.get(g)!.push(s)
    }
    return order.map((g) => ({ name: g, items: map.get(g)! }))
  }, [stats])

  const orphans = views.filter((v) => !v.category_id)

  return (
    <div className="space-y-4 px-4 pb-28 pt-3">
      <section className="card grid grid-cols-3 divide-x divide-line p-4">
        <Stat label="Budget max" value={euro(sums.budgetMax)} />
        <Stat label="Estimation" value={euro(sums.estimate)} />
        <Stat label="Déjà payé" value={euro(sums.settled)} />
      </section>

      {groups.map((group) => (
        <section key={group.name} className="card overflow-hidden">
          <h2 className="px-4 pt-4 text-sm font-medium">{group.name}</h2>
          <ul className="mt-2 divide-y divide-line">
            {group.items.map((s) => {
              const expanded = open === s.category.id
              const items = views.filter((v) => v.category_id === s.category.id)
              const over = s.planned > 0 && s.approved + s.pending > s.planned
              return (
                <li key={s.category.id}>
                  <button
                    onClick={() => setOpen(expanded ? null : s.category.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-[0.9375rem]">{s.category.name}</span>
                        <span className="tabular shrink-0 text-[0.9375rem] font-medium">
                          {euro(s.estimate)}
                        </span>
                      </span>
                      <span className="mt-1.5 block">
                        <Bar
                          height={5}
                          segments={[
                            { value: s.approved, color: OK },
                            { value: s.pending, color: WARN },
                            {
                              value: Math.max(0, s.planned - s.approved - s.pending),
                              color: 'var(--color-line)',
                            },
                          ]}
                        />
                      </span>
                      <span className="mt-1.5 block text-xs text-muted">
                        {s.count === 0
                          ? s.planned > 0
                            ? `Enveloppe ${euro(s.planned)} · aucune dépense`
                            : 'Aucune enveloppe, aucune dépense'
                          : `${euro(s.approved)} validé${s.pending > 0 ? ` · ${euro(s.pending)} en attente` : ''}${
                              s.settled > 0 ? ` · ${euro(s.settled)} payé` : ''
                            }${s.planned > 0 ? ` · enveloppe ${euro(s.planned)}` : ''}`}
                        {over ? ' · dépassée' : ''}
                      </span>
                    </span>
                    <Icon
                      name={expanded ? 'up' : 'down'}
                      size={16}
                      className="shrink-0 text-faint"
                    />
                  </button>

                  {expanded ? (
                    <div className="bg-paper px-4 py-3">
                      {items.length > 0 ? (
                        <ul className="space-y-1.5">
                          {items.map((v) => (
                            <li key={v.id}>
                              <button
                                onClick={() => onOpenExpense(v.id)}
                                className="flex w-full items-center gap-2.5 rounded-xl bg-card px-3 py-2.5 text-left"
                              >
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm">{v.label}</span>
                                  {v.vendor ? (
                                    <span className="block truncate text-xs text-muted">
                                      {v.vendor}
                                    </span>
                                  ) : null}
                                </span>
                                <span className="tabular shrink-0 text-sm font-medium">
                                  {euro(v.amount)}
                                </span>
                                <StatusPill status={v.status} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted">Pas encore de dépense ici.</p>
                      )}

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => onAddExpense(s.category.id)}
                          className="btn btn-ghost flex-1 !py-2 text-sm"
                        >
                          <Icon name="plus" size={15} />
                          Dépense
                        </button>
                        <button
                          onClick={() => setEditing(s.category)}
                          className="btn btn-ghost flex-1 !py-2 text-sm"
                        >
                          <Icon name="pencil" size={15} />
                          Enveloppe
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {orphans.length > 0 ? (
        <section className="card overflow-hidden">
          <h2 className="px-4 pt-4 text-sm font-medium">Sans catégorie</h2>
          <ul className="mt-2 divide-y divide-line">
            {orphans.map((v) => (
              <li key={v.id}>
                <button
                  onClick={() => onOpenExpense(v.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="min-w-0 flex-1 truncate text-[0.9375rem]">{v.label}</span>
                  <span className="tabular shrink-0 text-[0.9375rem] font-medium">
                    {euro(v.amount)}
                  </span>
                  <StatusPill status={v.status} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <button onClick={() => setCreating(true)} className="btn btn-ghost w-full">
        <Icon name="plus" size={17} />
        Ajouter une catégorie
      </button>

      <CategorySheet
        category={editing}
        groups={groups.map((g) => g.name)}
        onClose={() => setEditing(null)}
        actions={actions}
        expenseCount={
          editing ? views.filter((v) => v.category_id === editing.id).length : 0
        }
      />

      <CategorySheet
        creating={creating}
        groups={groups.map((g) => g.name)}
        onClose={() => setCreating(false)}
        actions={actions}
        category={null}
        expenseCount={0}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 text-center first:pl-0 last:pr-0">
      <p className="text-[0.6875rem] font-medium text-muted">{label}</p>
      <p className="tabular mt-0.5 text-[0.9375rem] font-medium">{value}</p>
    </div>
  )
}

function CategorySheet({
  category,
  creating = false,
  groups,
  onClose,
  actions,
  expenseCount,
}: {
  category: Category | null
  creating?: boolean
  groups: string[]
  onClose: () => void
  actions: Actions
  expenseCount: number
}) {
  const open = creating || Boolean(category)
  const [name, setName] = useState('')
  const [group, setGroup] = useState('')
  const [planned, setPlanned] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const key = creating ? 'new' : (category?.id ?? '')
  const fallbackGroup = groups[0] ?? 'Couts additionnels'

  useEffect(() => {
    if (!open) return
    setName(category?.name ?? '')
    setGroup(category?.group_name ?? fallbackGroup)
    setPlanned(category ? String(Math.round(Number(category.planned_amount))) : '0')
    setError(null)
  }, [open, key, category, fallbackGroup])

  async function save() {
    if (!name.trim()) {
      setError('Donne un nom à la catégorie')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await actions.saveCategory({
        id: category?.id,
        name: name.trim(),
        group_name: group,
        planned_amount: Number(planned.replace(/[^\d.]/g, '')) || 0,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!category) return
    setBusy(true)
    try {
      await actions.deleteCategory(category.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={creating ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
      footer={
        <div className="flex gap-2">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            Annuler
          </button>
          <button onClick={save} disabled={busy} className="btn btn-primary flex-1">
            Enregistrer
          </button>
        </div>
      }
    >
      <label className="label" htmlFor="cname">
        Nom
      </label>
      <input
        id="cname"
        className="field"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          setError(null)
        }}
        placeholder="Vin d’honneur"
      />

      <label className="label mt-4" htmlFor="cgroup">
        Section
      </label>
      <select
        id="cgroup"
        className="field"
        value={group}
        onChange={(e) => setGroup(e.target.value)}
      >
        {[...new Set([...groups, 'Couts additionnels'])].map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <label className="label mt-4" htmlFor="cplan">
        Enveloppe prévue (€)
      </label>
      <input
        id="cplan"
        className="field tabular"
        inputMode="numeric"
        value={planned}
        onChange={(e) => setPlanned(e.target.value)}
      />
      <p className="mt-2 text-xs leading-relaxed text-faint">
        L’enveloppe sert de repère : quand les dépenses validées la dépassent, la catégorie est
        signalée.
      </p>

      {category ? (
        <button
          onClick={remove}
          disabled={busy}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-bad"
        >
          <Icon name="trash" size={15} />
          Supprimer la catégorie
          {expenseCount > 0 ? ` (${expenseCount} dépense${expenseCount > 1 ? 's' : ''} conservée${expenseCount > 1 ? 's' : ''})` : ''}
        </button>
      ) : null}

      {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}
    </Sheet>
  )
}
