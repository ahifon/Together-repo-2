const nf = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

export function euro(value: number | null | undefined): string {
  return nf.format(Math.round(Number(value ?? 0)))
}

export function euroSigned(value: number | null | undefined): string {
  const n = Math.round(Number(value ?? 0))
  return (n > 0 ? '+' : '') + nf.format(n)
}

export function num(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function dateFr(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value + (value.length === 10 ? 'T00:00:00' : ''))
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function dateShort(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value + (value.length === 10 ? 'T00:00:00' : ''))
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export function relativeFr(value: string): string {
  const d = new Date(value)
  const diff = Date.now() - d.getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `il y a ${h} h`
  const j = Math.round(h / 24)
  if (j < 7) return `il y a ${j} j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function daysUntil(value: string | null | undefined): number | null {
  if (!value) return null
  const d = new Date(value + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}
