import { num } from './format'
import type { Approval, Category, Expense, Member, Snapshot, Status, Wedding } from './types'

export function statusOf(
  expenseId: string,
  approvals: Approval[],
  memberCount: number
): Status {
  const mine = approvals.filter((a) => a.expense_id === expenseId)
  if (mine.some((a) => a.decision === 'reject')) return 'rejected'
  const needed = Math.max(1, memberCount)
  if (mine.filter((a) => a.decision === 'approve').length >= needed) return 'approved'
  return 'pending'
}

export type ExpenseView = Expense & {
  status: Status
  votes: Approval[]
  category: Category | null
}

export function decorate(snap: Snapshot): ExpenseView[] {
  const memberCount = snap.members.length
  const byId = new Map(snap.categories.map((c) => [c.id, c]))
  return snap.expenses
    .filter((e) => !e.archived)
    .map((e) => ({
      ...e,
      amount: num(e.amount),
      settled_amount: num(e.settled_amount),
      status: statusOf(e.id, snap.approvals, memberCount),
      votes: snap.approvals.filter((a) => a.expense_id === e.id),
      category: e.category_id ? byId.get(e.category_id) ?? null : null,
    }))
}

export type CategoryStat = {
  category: Category
  planned: number
  approved: number
  pending: number
  rejected: number
  settled: number
  /** Ce que la categorie va reellement couter : l'enveloppe ou le reel s'il la depasse. */
  estimate: number
  count: number
}

export function categoryStats(
  snap: Snapshot,
  views: ExpenseView[]
): CategoryStat[] {
  return snap.categories
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, 'fr'))
    .map((category) => {
      const items = views.filter((v) => v.category_id === category.id)
      const approved = sum(items.filter((i) => i.status === 'approved').map((i) => i.amount))
      const pending = sum(items.filter((i) => i.status === 'pending').map((i) => i.amount))
      const rejected = sum(items.filter((i) => i.status === 'rejected').map((i) => i.amount))
      const settled = sum(
        items.filter((i) => i.status !== 'rejected').map((i) => i.settled_amount)
      )
      const planned = num(category.planned_amount)
      return {
        category,
        planned,
        approved,
        pending,
        rejected,
        settled,
        estimate: Math.max(planned, approved + pending),
        count: items.filter((i) => i.status !== 'rejected').length,
      }
    })
}

export type Totals = {
  budgetMax: number
  estimate: number
  approved: number
  pending: number
  settled: number
  remaining: number
  overBudget: number
  usedRatio: number
  pendingCount: number
  toDecideByMe: number
}

export function totals(
  wedding: Wedding | null,
  snap: Snapshot,
  views: ExpenseView[],
  stats: CategoryStat[],
  userId: string | null
): Totals {
  const budgetMax = num(wedding?.budget_max)
  const uncategorized = views.filter((v) => !v.category_id && v.status !== 'rejected')
  const estimate =
    sum(stats.map((s) => s.estimate)) + sum(uncategorized.map((v) => v.amount))
  const approved = sum(views.filter((v) => v.status === 'approved').map((v) => v.amount))
  const pending = sum(views.filter((v) => v.status === 'pending').map((v) => v.amount))
  const settled = sum(views.filter((v) => v.status !== 'rejected').map((v) => v.settled_amount))
  const remaining = budgetMax - approved
  return {
    budgetMax,
    estimate,
    approved,
    pending,
    settled,
    remaining,
    overBudget: Math.max(0, estimate - budgetMax),
    usedRatio: budgetMax > 0 ? approved / budgetMax : 0,
    pendingCount: views.filter((v) => v.status === 'pending').length,
    toDecideByMe: userId
      ? views.filter(
          (v) => v.status === 'pending' && !v.votes.some((a) => a.user_id === userId)
        ).length
      : 0,
  }
}

export function myVote(view: ExpenseView, userId: string | null): Approval | null {
  if (!userId) return null
  return view.votes.find((a) => a.user_id === userId) ?? null
}

export function otherMember(members: Member[], userId: string | null): Member | null {
  return members.find((m) => m.user_id !== userId) ?? null
}

export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + num(v), 0)
}

export function groupOrder(snap: Snapshot): string[] {
  const seen = new Map<string, number>()
  for (const c of snap.categories) {
    const current = seen.get(c.group_name)
    if (current === undefined || c.sort_order < current) seen.set(c.group_name, c.sort_order)
  }
  return [...seen.entries()].sort((a, b) => a[1] - b[1]).map(([g]) => g)
}
