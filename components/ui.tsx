'use client'

import { useEffect } from 'react'
import { initials } from '@/lib/format'

const PATHS: Record<string, string[]> = {
  home: ['M3 11.2 12 3.5l9 7.7V20a1 1 0 0 1-1 1h-5v-6.2H9V21H4a1 1 0 0 1-1-1z'],
  cards: ['M7 8h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z', 'M8 5h8'],
  list: ['M4 7h16', 'M4 12h16', 'M4 17h10'],
  settings: ['M5 7h14', 'M5 12h14', 'M5 17h14'],
  check: ['M5 12.5 9.5 17 19 7'],
  x: ['M6.5 6.5 17.5 17.5', 'M17.5 6.5 6.5 17.5'],
  plus: ['M12 5v14', 'M5 12h14'],
  minus: ['M5 12h14'],
  right: ['M9.5 5.5 16 12l-6.5 6.5'],
  left: ['M14.5 5.5 8 12l6.5 6.5'],
  down: ['M6 9.5 12 15.5l6-6'],
  up: ['M6 14.5 12 8.5l6 6'],
  pencil: ['M4 20h4L19 9l-4-4L4 16z', 'M14 6l4 4'],
  trash: ['M4 7h16', 'M9.5 7V4h5v3', 'M6.5 7 7.5 20h9L17.5 7'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7.5V12l3 2'],
  users: [
    'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
    'M2.5 20c0-3.6 2.9-5.5 6.5-5.5s6.5 1.9 6.5 5.5',
    'M16.5 5.2a3.2 3.2 0 0 1 0 6',
    'M18 14.8c2.2.5 3.5 2 3.5 4.2',
  ],
  copy: ['M9 9h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z', 'M15 6H6a2 2 0 0 0-2 2v9'],
  logout: ['M14 12H3.5', 'M10.5 8.5 14 12l-3.5 3.5', 'M9 4.5h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9'],
  mail: ['M4 5.5h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z', 'M3.5 7 12 13l8.5-6'],
  calendar: [
    'M4.5 6h15a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z',
    'M8 3.5V7',
    'M16 3.5V7',
    'M3.5 11h17',
  ],
  message: ['M4 5.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9.5L4.5 20.5v-4H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z'],
  alert: ['M12 4 21 19.5H3z', 'M12 10v4', 'M12 17h.01'],
  wallet: ['M3.5 7.5h17a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z', 'M3 7.5 6 4h11', 'M17 13h2'],
  link: ['M10 14a4 4 0 0 1 0-5.6l2.4-2.4a4 4 0 0 1 5.6 5.6L16.5 13', 'M14 10a4 4 0 0 1 0 5.6l-2.4 2.4a4 4 0 0 1-5.6-5.6L7.5 11'],
  receipt: ['M6 3.5h12v17l-3-2-3 2-3-2-3 2z', 'M9.5 8h5', 'M9.5 12h5'],
  hourglass: ['M8 4h8', 'M8 20h8', 'M8 4c0 4 8 6 8 10s-8 6-8 6', 'M16 4c0 4-8 6-8 10s8 6 8 6'],
  spark: ['M12 3.5 13.8 9l5.7 1.8L13.8 13 12 20.5 10.2 13 4.5 10.8 10.2 9z'],
  euro: ['M17 6.5a7 7 0 1 0 0 11', 'M4.5 10.5H12', 'M4.5 13.5H12'],
  refresh: ['M20 12a8 8 0 1 1-2.4-5.7', 'M20 4v4h-4'],
}

export function Icon({
  name,
  size = 20,
  className = '',
  strokeWidth = 1.7,
}: {
  name: keyof typeof PATHS | string
  size?: number
  className?: string
  strokeWidth?: number
}) {
  const paths = PATHS[name] ?? PATHS.spark
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

export function Avatar({
  name,
  accent = 'violet',
  size = 28,
  dimmed = false,
}: {
  name: string
  accent?: string
  size?: number
  dimmed?: boolean
}) {
  const her = accent === 'rose'
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-medium"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.38),
        background: her ? 'var(--color-her-soft)' : 'var(--color-accent-soft)',
        color: her ? 'var(--color-her)' : 'var(--color-accent-ink)',
        opacity: dimmed ? 0.45 : 1,
      }}
      title={name}
    >
      {initials(name)}
    </span>
  )
}

export function Pill({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: 'neutral' | 'ok' | 'warn' | 'bad' | 'accent'
  children: React.ReactNode
  className?: string
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-paper text-muted',
    ok: 'bg-ok-soft text-ok',
    warn: 'bg-warn-soft text-warn',
    bad: 'bg-bad-soft text-bad',
    accent: 'bg-accent-soft text-accent-ink',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function Bar({ segments, height = 10 }: { segments: { value: number; color: string }[]; height?: number }) {
  const total = segments.reduce((a, s) => a + Math.max(0, s.value), 0)
  return (
    <div
      className="flex w-full overflow-hidden rounded-full"
      style={{ height, background: 'var(--color-line)' }}
    >
      {total > 0 &&
        segments.map((s, i) => (
          <div
            key={i}
            style={{ width: `${(Math.max(0, s.value) / total) * 100}%`, background: s.color }}
          />
        ))}
    </div>
  )
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
      />
      <div className="sheet-enter relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-card sm:max-w-lg sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-medium">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted hover:bg-paper">
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-line px-5 py-3">{footer}</div> : null}
      </div>
    </div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <svg width="26" height="26" viewBox="0 0 24 24" className="animate-spin" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="var(--color-line)" strokeWidth="2.5" fill="none" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  )
}

export function Empty({
  icon = 'spark',
  title,
  body,
  action,
}: {
  icon?: string
  title: string
  body?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
        <Icon name={icon} size={22} />
      </span>
      <p className="font-medium">{title}</p>
      {body ? <p className="max-w-xs text-sm text-muted">{body}</p> : null}
      {action}
    </div>
  )
}
