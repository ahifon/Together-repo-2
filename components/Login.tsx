'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Icon } from './ui'

export function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const clean = email.trim().toLowerCase()
    if (!clean || !clean.includes('@')) {
      setError('Entre une adresse e-mail valide')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const sb = getSupabase()
      const { error } = await sb.auth.signInWithOtp({
        email: clean,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white">
          <Icon name="spark" size={24} />
        </span>
        <h1 className="mt-5 text-2xl font-medium tracking-tight">Budget mariage</h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
          Chaque dépense passe par vous deux. On propose, l’autre valide, le budget se met à jour
          en direct.
        </p>
      </div>

      {sent ? (
        <div className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ok-soft text-ok">
            <Icon name="mail" size={20} />
          </span>
          <p className="mt-3 font-medium">Lien envoyé à {email.trim().toLowerCase()}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Ouvre le lien depuis cet appareil pour te connecter. Il est valable une heure.
          </p>
          <button
            onClick={() => {
              setSent(false)
              setError(null)
            }}
            className="btn btn-ghost mt-4 w-full"
          >
            Changer d’adresse
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="card p-5">
          <label className="label" htmlFor="email">
            Ton adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className="field"
            placeholder="prenom@exemple.fr"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
          />
          {error ? <p className="mt-2 text-sm text-bad">{error}</p> : null}
          <button type="submit" disabled={busy} className="btn btn-primary mt-4 w-full">
            {busy ? 'Envoi…' : 'Recevoir mon lien de connexion'}
          </button>
          <p className="mt-3 text-xs leading-relaxed text-faint">
            Pas de mot de passe : tu reçois un lien à usage unique par e-mail.
          </p>
        </form>
      )}
    </main>
  )
}
