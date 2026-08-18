export type Wedding = {
  id: string
  name: string
  wedding_date: string | null
  budget_max: number
  invite_code: string
  created_at: string
}

export type Member = {
  wedding_id: string
  user_id: string
  display_name: string
  accent: string
  joined_at: string
}

export type Category = {
  id: string
  wedding_id: string
  group_name: string
  name: string
  icon: string
  planned_amount: number
  sort_order: number
  created_at: string
}

export type Expense = {
  id: string
  wedding_id: string
  category_id: string | null
  label: string
  vendor: string | null
  amount: number
  settled_amount: number
  quote_url: string | null
  due_date: string | null
  notes: string | null
  archived: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export type Decision = 'approve' | 'reject'

export type Approval = {
  expense_id: string
  user_id: string
  decision: Decision
  note: string | null
  created_at: string
}

export type Comment = {
  id: string
  expense_id: string
  user_id: string
  body: string
  created_at: string
}

export type Status = 'pending' | 'approved' | 'rejected'

export type Snapshot = {
  wedding: Wedding | null
  members: Member[]
  categories: Category[]
  expenses: Expense[]
  approvals: Approval[]
  comments: Comment[]
}
