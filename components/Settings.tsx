'use client'

import { useState } from 'react'
import { dateFr, euro } from '@/lib/format'
import type { Actions } from '@/lib/store'
import type { Member, Wedding } from '@/lib/types'
import { Avatar, Icon } from './ui'

export function Settings({
  wedding,
  members,
  userId,
  email,
  actions,
  onSignOut,
}: {
  wedding: Wedding
  members: Member[]
  userId: string | null
  email: string
  actions: Actions
  onSignOut: () => void
}) {
  const me = members.find((m) => m.user_id === userId) ?? null
  const partner = members.find((m) => m.user_id !== userId) ?? null

  const [name, setName] = useState(wedding.name)
  const [date, setDate] = useState(wedding.wedding_date ?? '')
  const [budget, setBudget] = useState(String(Math.round(Number(wedding.budget_max))))
  const [myName, setMyName] = useState(me?.display_name ?? '')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function save() {
    const value = Number(budget.replace(/[^\d.]/g, ''))
    if (!name.trim()) {
      setError('Le projet a besoin d’un nom')
      return
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError('Entre un budget supérieur à zéro')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await actions.updateWedding({
        name: name.trim(),
        wedding_date: date || null,
        budget_max: value,
      })
      if (myName.trim() && myName.trim() !== me?.display_name) {
        await actions.renameMe(myName.trim())
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible')
    } finally {
      setBusy(false)
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(wedding.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-4 px-4 pb-28 pt-3">
      <h1 className="text-lg font-medium">Réglages</h1>

      <section className="card p-5">
        <h2 className="text-sm font-medium">Le mariage</h2>

        <label className="label mt-4" htmlFor="sname">
          Nom du projet
        </label>
        <input
          id="sname"
          className="field"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
          }}
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="sdate">
              Date
            </label>
            <input
              id="sdate"
              type="date"
              className="field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="sbudget">
              Budget max (€)
            </label>
            <input
              id="sbudget"
              className="field tabular"
              inputMode="numeric"
              value={budget}
              onChange={(e) => {
                setBudget(e.target.value)
                setError(null)
              }}
            />
          </div>
        </div>

        <label className="label mt-4" htmlFor="smyname">
          Ton prénom
        </label>
        <input
          id="smyname"
          className="field"
          value={myName}
          onChange={(e) => setMyName(e.target.value)}
        />

        {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}

        <button onClick={save} disabled={busy} className="btn btn-primary mt-4 w-full">
          {busy ? 'Enregistrement…' : saved ? 'Enregistré' : 'Enregistrer'}
        </button>

        {wedding.wedding_date ? (
          <p className="mt-3 text-xs text-faint">
            Budget de {euro(Number(wedding.budget_max))} pour le {dateFr(wedding.wedding_date)}.
          </p>
        ) : null}
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-medium">Votre binôme</h2>
        <ul className="mt-3 space-y-3">
          {members.map((m) => (
            <li key={m.user_id} className="flex items-center gap-3">
              <Avatar name={m.display_name} accent={m.accent} size={34} />
              <div className="min-w-0 flex-1">
                <p className="text-[0.9375rem]">
                  {m.display_name}
                  {m.user_id === userId ? ' (toi)' : ''}
                </p>
                <p className="text-xs text-muted">
                  {m.user_id === userId ? email : 'A rejoint le budget'}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {!partner ? (
          <div className="mt-4 rounded-2xl bg-accent-soft p-3.5">
            <p className="text-sm font-medium text-accent-ink">Invite ta fiancée</p>
            <p className="mt-1 text-xs leading-relaxed text-accent-ink/80">
              Elle se connecte avec son e-mail, choisit « Rejoindre » et entre ce code.
            </p>
            <button
              onClick={copyCode}
              className="mt-3 flex w-full items-center justify-between rounded-xl bg-card px-3.5 py-3"
            >
              <span className="tabular text-xl font-medium tracking-[0.25em]">
                {wedding.invite_code}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-accent">
                <Icon name="copy" size={15} />
                {copied ? 'Copié' : 'Copier'}
              </span>
            </button>
          </div>
        ) : (
          <p className="mt-4 text-xs leading-relaxed text-faint">
            Une dépense devient « validée » quand vous l’avez tous les deux approuvée. Un seul
            refus la met de côté.
          </p>
        )}
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-medium">Compte</h2>
        <p className="mt-1.5 text-sm text-muted">{email}</p>
        <button onClick={onSignOut} className="btn btn-ghost mt-4 w-full">
          <Icon name="logout" size={16} />
          Se déconnecter
        </button>
      </section>
    </div>
  )
}
