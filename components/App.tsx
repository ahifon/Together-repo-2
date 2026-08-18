'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { categoryStats, decorate, totals } from '@/lib/compute'
import { DEMO_USER, useDemoWedding } from '@/lib/demo'
import { getSupabase, supabaseConfigured } from '@/lib/supabase'
import { useWedding, type Actions } from '@/lib/store'
import type { Snapshot } from '@/lib/types'
import { Budget } from './Budget'
import { Dashboard } from './Dashboard'
import { Decisions } from './Decisions'
import { ExpenseSheet, type SheetState } from './ExpenseSheet'
import { Login } from './Login'
import { Onboarding } from './Onboarding'
import { Settings } from './Settings'
import { Icon, Spinner } from './ui'

type Status = 'loading' | 'anon' | 'onboarding' | 'ready'
type Mode = 'unknown' | 'demo' | 'live'

export function App() {
  const [mode, setMode] = useState<Mode>('unknown')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setMode(params.has('demo') ? 'demo' : 'live')
  }, [])

  if (mode === 'unknown') return <Spinner />
  if (mode === 'demo') return <DemoApp />
  if (!supabaseConfigured) return <SetupNotice />
  return <Authenticated />
}

function DemoApp() {
  const store = useDemoWedding()
  return (
    <>
      <div className="sticky top-0 z-40 bg-accent px-4 py-2 text-center text-xs text-white">
        Mode démo — données locales, rien n’est enregistré.{' '}
        <a href="/" className="underline">
          Quitter
        </a>
      </div>
      <WeddingShell
        snap={store.snap}
        actions={store.actions}
        userId={DEMO_USER}
        email="demo@exemple.fr"
        onSignOut={() => {
          window.location.href = '/'
        }}
        onLeft={() => {
          window.location.href = '/'
        }}
      />
    </>
  )
}

function Authenticated() {
  const [status, setStatus] = useState<Status>('loading')
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [weddingId, setWeddingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resolveMembership = useCallback(async (uid: string) => {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('wedding_members')
      .select('wedding_id, joined_at')
      .eq('user_id', uid)
      .order('joined_at')
      .limit(1)
    if (error) {
      setError(error.message)
      setStatus('onboarding')
      return
    }
    if (data && data.length > 0) {
      setWeddingId(data[0].wedding_id as string)
      setStatus('ready')
    } else {
      setWeddingId(null)
      setStatus('onboarding')
    }
  }, [])

  useEffect(() => {
    const sb = getSupabase()
    let cancelled = false

    async function boot() {
      const { data } = await sb.auth.getSession()
      if (cancelled) return
      const session = data.session
      if (!session) {
        setStatus('anon')
        return
      }
      setUserId(session.user.id)
      setEmail(session.user.email ?? '')
      if (window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname)
      }
      await resolveMembership(session.user.id)
    }

    void boot()

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUserId(null)
        setWeddingId(null)
        setStatus('anon')
        return
      }
      setUserId(session.user.id)
      setEmail(session.user.email ?? '')
      void resolveMembership(session.user.id)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [resolveMembership])

  const signOut = useCallback(async () => {
    const sb = getSupabase()
    await sb.auth.signOut()
    setStatus('anon')
  }, [])

  if (status === 'loading') return <Spinner label="Connexion…" />
  if (status === 'anon') return <Login />
  if (status === 'onboarding' || !weddingId)
    return (
      <>
        {error ? <p className="mx-auto max-w-md px-5 pt-5 text-sm text-bad">{error}</p> : null}
        <Onboarding
          email={email}
          onReady={() => {
            if (userId) void resolveMembership(userId)
          }}
          onSignOut={() => void signOut()}
        />
      </>
    )

  return (
    <LiveWedding
      weddingId={weddingId}
      userId={userId}
      email={email}
      onSignOut={() => void signOut()}
      onRetry={() => {
        if (userId) void resolveMembership(userId)
      }}
    />
  )
}

function LiveWedding({
  weddingId,
  userId,
  email,
  onSignOut,
  onRetry,
}: {
  weddingId: string
  userId: string | null
  email: string
  onSignOut: () => void
  onRetry: () => void
}) {
  const { snap, loading, error, actions } = useWedding(weddingId, userId)

  if (loading && !snap.wedding) return <Spinner label="Chargement du budget…" />

  if (error)
    return (
      <div className="mx-auto max-w-md px-5 py-16">
        <p className="font-medium">Impossible de charger le budget</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{error}</p>
        <p className="mt-3 text-xs leading-relaxed text-faint">
          Vérifie que le script <code>supabase/schema.sql</code> a bien été exécuté dans ton projet
          Supabase.
        </p>
        <button onClick={onRetry} className="btn btn-ghost mt-5 w-full">
          Réessayer
        </button>
      </div>
    )

  if (!snap.wedding)
    return (
      <div className="mx-auto max-w-md px-5 py-16">
        <p className="font-medium">Budget introuvable</p>
        <button onClick={onRetry} className="btn btn-ghost mt-4 w-full">
          Réessayer
        </button>
      </div>
    )

  return (
    <WeddingShell
      snap={snap}
      actions={actions}
      userId={userId}
      email={email}
      onSignOut={onSignOut}
      onLeft={onRetry}
    />
  )
}

type Tab = 'home' | 'decisions' | 'budget' | 'settings'

function WeddingShell({
  snap,
  actions,
  userId,
  email,
  onSignOut,
}: {
  snap: Snapshot
  actions: Actions
  userId: string | null
  email: string
  onSignOut: () => void
  onLeft: () => void
}) {
  const [tab, setTab] = useState<Tab>('home')
  const [sheet, setSheet] = useState<SheetState>({ mode: 'closed' })

  const views = useMemo(() => decorate(snap), [snap])
  const stats = useMemo(() => categoryStats(snap, views), [snap, views])
  const sums = useMemo(
    () => totals(snap.wedding, snap, views, stats, userId),
    [snap, views, stats, userId]
  )

  const openExpense = useCallback((id: string) => setSheet({ mode: 'detail', expenseId: id }), [])
  const addExpense = useCallback(
    (categoryId: string | null) => setSheet({ mode: 'create', categoryId }),
    []
  )

  if (!snap.wedding) return <Spinner />

  return (
    <div className="mx-auto min-h-dvh max-w-lg">
      {tab === 'home' ? (
        <Dashboard
          wedding={snap.wedding}
          members={snap.members}
          userId={userId}
          views={views}
          stats={stats}
          sums={sums}
          actions={actions}
          onOpenExpense={openExpense}
          onGoDecisions={() => setTab('decisions')}
        />
      ) : null}

      {tab === 'decisions' ? (
        <Decisions
          views={views}
          stats={stats}
          sums={sums}
          members={snap.members}
          comments={snap.comments}
          userId={userId}
          actions={actions}
          onOpenExpense={openExpense}
        />
      ) : null}

      {tab === 'budget' ? (
        <Budget
          snap={snap}
          views={views}
          stats={stats}
          sums={sums}
          actions={actions}
          onOpenExpense={openExpense}
          onAddExpense={addExpense}
        />
      ) : null}

      {tab === 'settings' ? (
        <Settings
          wedding={snap.wedding}
          members={snap.members}
          userId={userId}
          email={email}
          actions={actions}
          onSignOut={onSignOut}
        />
      ) : null}

      <button
        onClick={() => addExpense(null)}
        className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full bg-accent px-5 py-3 text-[0.9375rem] font-medium text-white shadow-lg shadow-accent/25"
      >
        <span className="flex items-center gap-2">
          <Icon name="plus" size={18} strokeWidth={2.2} />
          Ajouter une dépense
        </span>
      </button>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg">
          <TabButton
            icon="home"
            label="Accueil"
            active={tab === 'home'}
            onClick={() => setTab('home')}
          />
          <TabButton
            icon="cards"
            label="À décider"
            badge={sums.toDecideByMe}
            active={tab === 'decisions'}
            onClick={() => setTab('decisions')}
          />
          <TabButton
            icon="list"
            label="Budget"
            active={tab === 'budget'}
            onClick={() => setTab('budget')}
          />
          <TabButton
            icon="settings"
            label="Réglages"
            active={tab === 'settings'}
            onClick={() => setTab('settings')}
          />
        </div>
      </nav>

      <ExpenseSheet
        state={sheet}
        snap={snap}
        views={views}
        userId={userId}
        actions={actions}
        onClose={() => setSheet({ mode: 'closed' })}
      />
    </div>
  )
}

function TabButton({
  icon,
  label,
  active,
  badge = 0,
  onClick,
}: {
  icon: string
  label: string
  active: boolean
  badge?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] text-[0.6875rem] ${
        active ? 'text-accent' : 'text-muted'
      }`}
    >
      <span className="relative">
        <Icon name={icon} size={22} strokeWidth={active ? 2 : 1.6} />
        {badge > 0 ? (
          <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-warn px-1 text-[0.625rem] font-medium text-white">
            {badge}
          </span>
        ) : null}
      </span>
      {label}
    </button>
  )
}

function SetupNotice() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warn-soft text-warn">
        <Icon name="alert" size={24} />
      </span>
      <h1 className="mt-5 text-xl font-medium">Supabase n’est pas encore branché</h1>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
        Ajoute les deux variables d’environnement, puis relance l’application :
      </p>
      <pre className="mt-4 overflow-x-auto rounded-2xl bg-card p-4 text-xs leading-relaxed">
        {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}
      </pre>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        En local dans <code>.env.local</code>, sur Vercel dans Settings → Environment Variables.
        Les valeurs se trouvent dans Supabase → Project Settings → API.
      </p>
      <a href="/?demo=1" className="btn btn-primary mt-6">
        Voir l’application en mode démo
      </a>
    </main>
  )
}
