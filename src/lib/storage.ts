import { Income, Expense, Debtor, Reminder, AppSetup, EXPENSE_CATEGORIES } from './types'

const KEYS = {
  SETUP: 'cashflow_setup',
  ONBOARDED: 'cashflow_onboarded',
  INCOME: 'cashflow_income',
  EXPENSES: 'cashflow_expenses',
  DEBTORS: 'cashflow_debtors',
  REMINDERS: 'cashflow_reminders',
} as const

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  // Onboarding
  isOnboarded: () => getItem<boolean>(KEYS.ONBOARDED, false),
  setOnboarded: () => setItem(KEYS.ONBOARDED, true),

  // Setup
  getSetup: () => getItem<AppSetup | null>(KEYS.SETUP, null),
  saveSetup: (setup: AppSetup) => setItem(KEYS.SETUP, setup),

  // Income
  getIncome: () => getItem<Income[]>(KEYS.INCOME, []),
  addIncome: (income: Income) => {
    const list = getItem<Income[]>(KEYS.INCOME, [])
    setItem(KEYS.INCOME, [income, ...list])
  },
  deleteIncome: (id: string) => {
    const list = getItem<Income[]>(KEYS.INCOME, [])
    setItem(KEYS.INCOME, list.filter((i) => i.id !== id))
  },

  // Expenses
  getExpenses: () => getItem<Expense[]>(KEYS.EXPENSES, []),
  addExpense: (expense: Expense) => {
    const list = getItem<Expense[]>(KEYS.EXPENSES, [])
    setItem(KEYS.EXPENSES, [expense, ...list])
  },
  deleteExpense: (id: string) => {
    const list = getItem<Expense[]>(KEYS.EXPENSES, [])
    setItem(KEYS.EXPENSES, list.filter((e) => e.id !== id))
  },

  // Debtors
  getDebtors: () => getItem<Debtor[]>(KEYS.DEBTORS, []),
  addDebtor: (debtor: Debtor) => {
    const list = getItem<Debtor[]>(KEYS.DEBTORS, [])
    setItem(KEYS.DEBTORS, [debtor, ...list])
  },
  updateDebtor: (id: string, updates: Partial<Debtor>) => {
    const list = getItem<Debtor[]>(KEYS.DEBTORS, [])
    setItem(KEYS.DEBTORS, list.map((d) => (d.id === id ? { ...d, ...updates } : d)))
  },
  deleteDebtor: (id: string) => {
    const list = getItem<Debtor[]>(KEYS.DEBTORS, [])
    setItem(KEYS.DEBTORS, list.filter((d) => d.id !== id))
  },

  // Reminders
  getReminders: () => getItem<Reminder[]>(KEYS.REMINDERS, []),
  addReminder: (reminder: Reminder) => {
    const list = getItem<Reminder[]>(KEYS.REMINDERS, [])
    setItem(KEYS.REMINDERS, [reminder, ...list])
  },
  updateReminder: (id: string, updates: Partial<Reminder>) => {
    const list = getItem<Reminder[]>(KEYS.REMINDERS, [])
    setItem(KEYS.REMINDERS, list.map((r) => (r.id === id ? { ...r, ...updates } : r)))
  },
  deleteReminder: (id: string) => {
    const list = getItem<Reminder[]>(KEYS.REMINDERS, [])
    setItem(KEYS.REMINDERS, list.filter((r) => r.id !== id))
  },

  // Summary helpers
  getSummary: (period?: { start: string; end: string }) => {
    const income = getItem<Income[]>(KEYS.INCOME, [])
    const expenses = getItem<Expense[]>(KEYS.EXPENSES, [])

    const fi = period ? income.filter((i) => i.date >= period.start && i.date <= period.end) : income
    const fe = period ? expenses.filter((e) => e.date >= period.start && e.date <= period.end) : expenses

    const totalIncome = fi.reduce((s, i) => s + i.amount, 0)
    const totalExpenses = fe.reduce((s, e) => s + e.amount, 0)

    // Top expense category
    const expenseByCategory: Record<string, number> = {}
    fe.forEach((e) => {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount
    })
    const topExpenseCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0]

    // Income breakdown
    const incomeByCategory: Record<string, number> = {}
    fi.forEach((i) => {
      incomeByCategory[i.category] = (incomeByCategory[i.category] || 0) + i.amount
    })

    return {
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
      topExpenseCategory: topExpenseCategory
        ? {
            category: EXPENSE_CATEGORIES[topExpenseCategory[0] as keyof typeof EXPENSE_CATEGORIES] || topExpenseCategory[0],
            amount: topExpenseCategory[1],
          }
        : null,
      expenseByCategory,
      incomeByCategory,
    }
  },
}
