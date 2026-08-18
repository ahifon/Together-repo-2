'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Icon } from './ui'

export function Onboarding({
  email,
  onReady,
  onSignOut,
}: {
  email: string
  onReady: () => void
  onSignOut: () => void
}) {
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [displayName, setDisplayName] = useState('')
  const [weddingName, setWeddingName] = useState('Notre mariage')
  const [budget, setBudget] = useState('20000')
  const [date, setDate] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const name = displayName.trim()
    if (!name) {
      setError('Indique ton prénom')
      return
    }
    if (mode === 'join' && code.trim().length < 4) {
      setError('Entre le code reçu de ton binôme')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const sb = getSupabase()
      if (mode === 'create') {
        const { error } = await sb.rpc('create_wedding', {
          p_name: weddingName.trim() || 'Notre mariage',
          p_display_name: name,
          p_budget_max: Number(budget.replace(/[^\d.]/g, '')) || 20000,
          p_wedding_date: date || null,
        })
        if (error) throw error
      } else {
        const { error } = await sb.rpc('join_wedding', {
          p_code: code.trim().toUpperCase(),
          p_display_name: name,
        })
        if (error) throw error
      }
      onReady()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opération impossible')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <h1 className="text-2xl font-medium tracking-tight">Bienvenue</h1>
      <p className="mt-1.5 text-sm text-muted">Connecté avec {email}</p>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            setMode('create')
            setError(null)
          }}
          className={`rounded-2xl border p-3 text-left ${
            mode === 'create'
              ? 'border-accent bg-accent-soft'
              : 'border-line bg-card text-muted'
          }`}
        >
          <Icon name="plus" size={18} />
          <p className="mt-1.5 text-sm font-medium text-ink">Créer le mariage</p>
          <p className="text-xs text-muted">Je démarre le budget</p>
        </button>
        <button
          onClick={() => {
            setMode('join')
            setError(null)
          }}
          className={`rounded-2xl border p-3 text-left ${
            mode === 'join' ? 'border-accent bg-accent-soft' : 'border-line bg-card text-muted'
          }`}
        >
          <Icon name="users" size={18} />
          <p className="mt-1.5 text-sm font-medium text-ink">Rejoindre</p>
          <p className="text-xs text-muted">J’ai un code</p>
        </button>
      </div>

      <form onSubmit={submit} className="card mt-4 p-5">
        <label className="label" htmlFor="me">
          Ton prénom
        </label>
        <input
          id="me"
          className="field"
          placeholder="Sacha"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value)
            setError(null)
          }}
        />

        {mode === 'create' ? (
          <>
            <label className="label mt-4" htmlFor="wname">
              Nom du projet
            </label>
            <input
              id="wname"
              className="field"
              value={weddingName}
              onChange={(e) => setWeddingName(e.target.value)}
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="budget">
                  Budget max (€)
                </label>
                <input
                  id="budget"
                  className="field tabular"
                  inputMode="numeric"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="date">
                  Date (facultatif)
                </label>
                <input
                  id="date"
                  type="date"
                  className="field"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-faint">
              Les catégories habituelles (lieu, traiteur, photographe…) sont créées
              automatiquement, avec des enveloppes que vous ajusterez ensuite.
            </p>
          </>
        ) : (
          <>
            <label className="label mt-4" htmlFor="code">
              Code d’invitation
            </label>
            <input
              id="code"
              className="field tabular tracking-[0.3em] uppercase"
              placeholder="A1B2C3"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setError(null)
              }}
            />
            <p className="mt-3 text-xs leading-relaxed text-faint">
              Ton binôme trouve ce code dans Réglages, une fois le mariage créé.
            </p>
          </>
        )}

        {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}

        <button type="submit" disabled={busy} className="btn btn-primary mt-4 w-full">
          {busy ? 'Un instant…' : mode === 'create' ? 'Créer le budget' : 'Rejoindre le budget'}
        </button>
      </form>

      <button onClick={onSignOut} className="mt-4 self-center text-sm text-muted underline">
        Se déconnecter
      </button>
    </main>
  )
}
