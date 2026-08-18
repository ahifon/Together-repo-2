'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getSupabase } from './supabase'
import type {
  Approval,
  Category,
  Comment,
  Decision,
  Expense,
  Member,
  Snapshot,
  Wedding,
} from './types'

const EMPTY: Snapshot = {
  wedding: null,
  members: [],
  categories: [],
  expenses: [],
  approvals: [],
  comments: [],
}

export function useWedding(weddingId: string | null, userId: string | null) {
  const [snap, setSnap] = useState<Snapshot>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    if (!weddingId) {
      setSnap(EMPTY)
      setLoading(false)
      return
    }
    const sb = getSupabase()
    const [w, m, c, e] = await Promise.all([
      sb.from('weddings').select('*').eq('id', weddingId).maybeSingle(),
      sb.from('wedding_members').select('*').eq('wedding_id', weddingId).order('joined_at'),
      sb.from('categories').select('*').eq('wedding_id', weddingId),
      sb
        .from('expenses')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: false }),
    ])
    const firstError = [w, m, c, e].find((r) => r.error)?.error
    if (firstError) {
      setError(firstError.message)
      setLoading(false)
      return
    }
    const expenses = (e.data ?? []) as Expense[]
    const ids = new Set(expenses.map((x) => x.id))
    const [ap, cm] = await Promise.all([
      sb.from('approvals').select('*'),
      sb.from('comments').select('*').order('created_at'),
    ])
    const secondError = [ap, cm].find((r) => r.error)?.error
    if (secondError) {
      setError(secondError.message)
      setLoading(false)
      return
    }
    setError(null)
    setSnap({
      wedding: (w.data ?? null) as Wedding | null,
      members: (m.data ?? []) as Member[],
      categories: (c.data ?? []) as Category[],
      expenses,
      approvals: ((ap.data ?? []) as Approval[]).filter((a) => ids.has(a.expense_id)),
      comments: ((cm.data ?? []) as Comment[]).filter((x) => ids.has(x.expense_id)),
    })
    setLoading(false)
  }, [weddingId])

  const reload = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      void load()
    }, 250)
  }, [load])

  useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  useEffect(() => {
    if (!weddingId) return
    const sb = getSupabase()
    const channel = sb.channel('wedding-' + weddingId)
    const tables = [
      'weddings',
      'wedding_members',
      'categories',
      'expenses',
      'approvals',
      'comments',
    ]
    for (const table of tables) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => reload())
    }
    channel.subscribe()
    return () => {
      void sb.removeChannel(channel)
    }
  }, [weddingId, reload])

  const actions = useMemo(
    () => ({
      async updateWedding(patch: Partial<Wedding>) {
        if (!weddingId) return
        const sb = getSupabase()
        const { error } = await sb.from('weddings').update(patch).eq('id', weddingId)
        if (error) throw error
        await load()
      },

      async renameMe(displayName: string) {
        if (!weddingId || !userId) return
        const sb = getSupabase()
        const { error } = await sb
          .from('wedding_members')
          .update({ display_name: displayName })
          .eq('wedding_id', weddingId)
          .eq('user_id', userId)
        if (error) throw error
        await load()
      },

      async saveCategory(patch: Partial<Category> & { id?: string; name: string }) {
        if (!weddingId) return
        const sb = getSupabase()
        if (patch.id) {
          const { id, ...rest } = patch
          const { error } = await sb.from('categories').update(rest).eq('id', id)
          if (error) throw error
        } else {
          const { error } = await sb.from('categories').insert({
            wedding_id: weddingId,
            name: patch.name,
            group_name: patch.group_name ?? 'Couts additionnels',
            icon: patch.icon ?? 'tag',
            planned_amount: patch.planned_amount ?? 0,
            sort_order: patch.sort_order ?? 900,
          })
          if (error) throw error
        }
        await load()
      },

      async deleteCategory(id: string) {
        const sb = getSupabase()
        const { error } = await sb.from('categories').delete().eq('id', id)
        if (error) throw error
        await load()
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
        if (!weddingId || !userId) return undefined
        const sb = getSupabase()
        const { data, error } = await sb
          .from('expenses')
          .insert({
            wedding_id: weddingId,
            category_id: input.category_id,
            label: input.label,
            amount: input.amount,
            vendor: input.vendor ?? null,
            due_date: input.due_date ?? null,
            quote_url: input.quote_url ?? null,
            notes: input.notes ?? null,
            settled_amount: input.settled_amount ?? 0,
            created_by: userId,
          })
          .select('id')
          .single()
        if (error) throw error
        if (input.autoApprove !== false && data) {
          const { error: voteError } = await sb
            .from('approvals')
            .upsert({ expense_id: data.id, user_id: userId, decision: 'approve' as Decision })
          if (voteError) throw voteError
        }
        await load()
        return data?.id as string | undefined
      },

      async updateExpense(id: string, patch: Partial<Expense>, resetVotes = false) {
        const sb = getSupabase()
        const { error } = await sb
          .from('expenses')
          .update({ ...patch, updated_at: new Date().toISOString() })
          .eq('id', id)
        if (error) throw error
        if (resetVotes && userId) {
          const { error: delError } = await sb.from('approvals').delete().eq('expense_id', id)
          if (delError) throw delError
          const { error: voteError } = await sb
            .from('approvals')
            .upsert({ expense_id: id, user_id: userId, decision: 'approve' as Decision })
          if (voteError) throw voteError
        }
        await load()
      },

      async deleteExpense(id: string) {
        const sb = getSupabase()
        const { error } = await sb.from('expenses').delete().eq('id', id)
        if (error) throw error
        await load()
      },

      async decide(expenseId: string, decision: Decision, note?: string) {
        if (!userId) return
        const sb = getSupabase()
        const { error } = await sb
          .from('approvals')
          .upsert({ expense_id: expenseId, user_id: userId, decision, note: note ?? null })
        if (error) throw error
        await load()
      },

      async undecide(expenseId: string) {
        if (!userId) return
        const sb = getSupabase()
        const { error } = await sb
          .from('approvals')
          .delete()
          .eq('expense_id', expenseId)
          .eq('user_id', userId)
        if (error) throw error
        await load()
      },

      async addComment(expenseId: string, body: string) {
        if (!userId) return
        const sb = getSupabase()
        const { error } = await sb
          .from('comments')
          .insert({ expense_id: expenseId, user_id: userId, body })
        if (error) throw error
        await load()
      },
    }),
    [weddingId, userId, load]
  )

  return { snap, loading, error, reload: load, actions }
}

export type Actions = ReturnType<typeof useWedding>['actions']
