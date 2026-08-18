'use client'

import { useMemo, useState } from 'react'
import type {
  Approval,
  Category,
  Comment,
  Decision,
  Expense,
  Snapshot,
  Wedding,
} from './types'

export const DEMO_USER = 'demo-moi'
const PARTNER = 'demo-elle'

function iso(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86400000).toISOString()
}

function cat(
  id: string,
  group: string,
  name: string,
  planned: number,
  order: number
): Category {
  return {
    id,
    wedding_id: 'demo',
    group_name: group,
    name,
    icon: 'tag',
    planned_amount: planned,
    sort_order: order,
    created_at: iso(30),
  }
}

function exp(
  id: string,
  categoryId: string | null,
  label: string,
  amount: number,
  by: string,
  daysAgo: number,
  extra: Partial<Expense> = {}
): Expense {
  return {
    id,
    wedding_id: 'demo',
    category_id: categoryId,
    label,
    vendor: null,
    amount,
    settled_amount: 0,
    quote_url: null,
    due_date: null,
    notes: null,
    archived: false,
    created_by: by,
    created_at: iso(daysAgo),
    updated_at: iso(daysAgo),
    ...extra,
  }
}

function initialSnapshot(): Snapshot {
  const wedding: Wedding = {
    id: 'demo',
    name: 'Notre mariage',
    wedding_date: new Date(Date.now() + 240 * 86400000).toISOString().slice(0, 10),
    budget_max: 20000,
    invite_code: 'DEMO01',
    created_at: iso(40),
  }

  const categories: Category[] = [
    cat('c-lieu', 'Lieux & Prestataires', 'Lieu de réception', 3500, 10),
    cat('c-traiteur', 'Lieux & Prestataires', 'Traiteur (nourriture & boissons)', 6000, 20),
    cat('c-photo', 'Lieux & Prestataires', 'Photographe', 1000, 30),
    cat('c-musique', 'Lieux & Prestataires', 'Musique', 1000, 40),
    cat('c-fleurs', 'Lieux & Prestataires', 'Fleuriste', 500, 50),
    cat('c-gateau', 'Lieux & Prestataires', 'Gâteau', 1000, 60),
    cat('c-robe', 'Tenues & Accessoires', 'Robe de mariée et accessoires', 2000, 110),
    cat('c-costume', 'Tenues & Accessoires', 'Costumes', 1000, 120),
    cat('c-alliances', 'Tenues & Accessoires', 'Alliances & bijoux', 2000, 130),
    cat('c-lune', 'Coûts additionnels', 'Lune de miel', 5000, 210),
    cat('c-cadeaux', 'Coûts additionnels', 'Cadeaux', 405, 220),
  ]

  const expenses: Expense[] = [
    exp('e1', 'c-lieu', 'Domaine des Tilleuls', 3500, DEMO_USER, 22, {
      vendor: 'Domaine des Tilleuls',
      settled_amount: 1000,
      notes: 'Acompte de 1 000 € versé, solde à un mois de la date.',
    }),
    exp('e2', 'c-traiteur', 'Maison Belmont — menu 90 couverts', 5800, PARTNER, 14, {
      vendor: 'Maison Belmont',
      settled_amount: 500,
      notes: 'Service et vin compris. Deuxième devis à 6 400 € sans le vin.',
    }),
    exp('e3', 'c-photo', 'Photographe journée complète', 1200, PARTNER, 9, {
      vendor: 'Camille Ferrand',
      notes: 'Reportage 10 h + album. 200 € au-dessus de l’enveloppe.',
    }),
    exp('e4', 'c-musique', 'DJ Sunset', 1400, PARTNER, 4, {
      vendor: 'DJ Sunset',
      notes: 'Sono et lumières incluses jusqu’à 4 h du matin.',
    }),
    exp('e5', 'c-fleurs', 'Bouquets et centres de table', 620, PARTNER, 3),
    exp('e6', 'c-alliances', 'Alliances', 1800, DEMO_USER, 12),
    exp('e7', 'c-gateau', 'Pièce montée', 900, DEMO_USER, 6, { vendor: 'Pâtisserie Lorel' }),
    exp('e8', 'c-lune', 'Deux semaines au Portugal', 4200, PARTNER, 2, {
      notes: 'Vols + logement. On peut décaler en septembre pour ‑600 €.',
    }),
    exp('e9', 'c-robe', 'Robe et retouches', 2400, PARTNER, 18),
  ]

  const approvals: Approval[] = [
    { expense_id: 'e1', user_id: DEMO_USER, decision: 'approve', note: null, created_at: iso(22) },
    { expense_id: 'e1', user_id: PARTNER, decision: 'approve', note: null, created_at: iso(21) },
    { expense_id: 'e2', user_id: PARTNER, decision: 'approve', note: null, created_at: iso(14) },
    {
      expense_id: 'e2',
      user_id: DEMO_USER,
      decision: 'approve',
      note: 'OK si on baisse le vin de 300 €.',
      created_at: iso(13),
    },
    { expense_id: 'e3', user_id: PARTNER, decision: 'approve', note: null, created_at: iso(9) },
    { expense_id: 'e4', user_id: PARTNER, decision: 'approve', note: null, created_at: iso(4) },
    { expense_id: 'e5', user_id: PARTNER, decision: 'approve', note: null, created_at: iso(3) },
    { expense_id: 'e6', user_id: DEMO_USER, decision: 'approve', note: null, created_at: iso(12) },
    { expense_id: 'e6', user_id: PARTNER, decision: 'approve', note: null, created_at: iso(11) },
    { expense_id: 'e7', user_id: DEMO_USER, decision: 'approve', note: null, created_at: iso(6) },
    {
      expense_id: 'e7',
      user_id: PARTNER,
      decision: 'reject',
      note: 'Trop cher pour un gâteau, on regarde ailleurs.',
      created_at: iso(5),
    },
    { expense_id: 'e8', user_id: PARTNER, decision: 'approve', note: null, created_at: iso(2) },
    { expense_id: 'e9', user_id: PARTNER, decision: 'approve', note: null, created_at: iso(18) },
    { expense_id: 'e9', user_id: DEMO_USER, decision: 'approve', note: null, created_at: iso(17) },
  ]

  const comments: Comment[] = [
    {
      id: 'k1',
      expense_id: 'e2',
      user_id: PARTNER,
      body: 'Le devis Belmont est à 5 800 €, service inclus.',
      created_at: iso(14),
    },
    {
      id: 'k2',
      expense_id: 'e2',
      user_id: DEMO_USER,
      body: 'Ça me va. On garde une marge pour le vin d’honneur.',
      created_at: iso(13),
    },
    {
      id: 'k3',
      expense_id: 'e4',
      user_id: PARTNER,
      body: 'Il est libre à notre date, mais il faut répondre cette semaine.',
      created_at: iso(4),
    },
  ]

  return {
    wedding,
    members: [
      {
        wedding_id: 'demo',
        user_id: DEMO_USER,
        display_name: 'Sacha',
        accent: 'violet',
        joined_at: iso(40),
      },
      {
        wedding_id: 'demo',
        user_id: PARTNER,
        display_name: 'Marie',
        accent: 'rose',
        joined_at: iso(39),
      },
    ],
    categories,
    expenses,
    approvals,
    comments,
  }
}

/** Meme interface que useWedding, mais entierement en memoire. */
export function useDemoWedding() {
  const [snap, setSnap] = useState<Snapshot>(initialSnapshot)
  const [seq, setSeq] = useState(1)

  const actions = useMemo(() => {
    const nextId = (prefix: string) => {
      const id = `${prefix}-${seq}`
      setSeq((s) => s + 1)
      return id
    }

    return {
      async updateWedding(patch: Partial<Wedding>) {
        setSnap((s) => (s.wedding ? { ...s, wedding: { ...s.wedding, ...patch } } : s))
      },

      async renameMe(displayName: string) {
        setSnap((s) => ({
          ...s,
          members: s.members.map((m) =>
            m.user_id === DEMO_USER ? { ...m, display_name: displayName } : m
          ),
        }))
      },

      async saveCategory(patch: Partial<Category> & { id?: string; name: string }) {
        setSnap((s) => {
          if (patch.id) {
            return {
              ...s,
              categories: s.categories.map((c) =>
                c.id === patch.id ? { ...c, ...patch, id: c.id } : c
              ),
            }
          }
          return {
            ...s,
            categories: [
              ...s.categories,
              cat(
                nextId('c'),
                patch.group_name ?? 'Coûts additionnels',
                patch.name,
                Number(patch.planned_amount ?? 0),
                patch.sort_order ?? 900
              ),
            ],
          }
        })
      },

      async deleteCategory(id: string) {
        setSnap((s) => ({
          ...s,
          categories: s.categories.filter((c) => c.id !== id),
          expenses: s.expenses.map((e) =>
            e.category_id === id ? { ...e, category_id: null } : e
          ),
        }))
      },

      async createExpense(input: {
        label: string
        amount: number
        category_id: string | null
        vendor?: string | null
        due_date?: string | null
        quote_url?: string | null
        notes?: string | null
        settled_amount?: number
        autoApprove?: boolean
      }) {
        const id = nextId('e')
        setSnap((s) => ({
          ...s,
          expenses: [
            exp(id, input.category_id, input.label, input.amount, DEMO_USER, 0, {
              vendor: input.vendor ?? null,
              due_date: input.due_date ?? null,
              quote_url: input.quote_url ?? null,
              notes: input.notes ?? null,
              settled_amount: input.settled_amount ?? 0,
            }),
            ...s.expenses,
          ],
          approvals:
            input.autoApprove === false
              ? s.approvals
              : [
                  ...s.approvals,
                  {
                    expense_id: id,
                    user_id: DEMO_USER,
                    decision: 'approve' as Decision,
                    note: null,
                    created_at: new Date().toISOString(),
                  },
                ],
        }))
        return id
      },

      async updateExpense(id: string, patch: Partial<Expense>, resetVotes = false) {
        setSnap((s) => ({
          ...s,
          expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          approvals: resetVotes
            ? [
                ...s.approvals.filter((a) => a.expense_id !== id),
                {
                  expense_id: id,
                  user_id: DEMO_USER,
                  decision: 'approve' as Decision,
                  note: null,
                  created_at: new Date().toISOString(),
                },
              ]
            : s.approvals,
        }))
      },

      async deleteExpense(id: string) {
        setSnap((s) => ({
          ...s,
          expenses: s.expenses.filter((e) => e.id !== id),
          approvals: s.approvals.filter((a) => a.expense_id !== id),
          comments: s.comments.filter((c) => c.expense_id !== id),
        }))
      },

      async decide(expenseId: string, decision: Decision, note?: string) {
        setSnap((s) => ({
          ...s,
          approvals: [
            ...s.approvals.filter(
              (a) => !(a.expense_id === expenseId && a.user_id === DEMO_USER)
            ),
            {
              expense_id: expenseId,
              user_id: DEMO_USER,
              decision,
              note: note ?? null,
              created_at: new Date().toISOString(),
            },
          ],
        }))
      },

      async undecide(expenseId: string) {
        setSnap((s) => ({
          ...s,
          approvals: s.approvals.filter(
            (a) => !(a.expense_id === expenseId && a.user_id === DEMO_USER)
          ),
        }))
      },

      async addComment(expenseId: string, body: string) {
        setSnap((s) => ({
          ...s,
          comments: [
            ...s.comments,
            {
              id: nextId('k'),
              expense_id: expenseId,
              user_id: DEMO_USER,
              body,
              created_at: new Date().toISOString(),
            },
          ],
        }))
      },
    }
  }, [seq])

  return { snap, loading: false, error: null as string | null, reload: async () => {}, actions }
}
