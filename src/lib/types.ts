export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'GHS' | 'KES' | 'ZAR'

export const CURRENCIES: Record<Currency, { symbol: string; name: string }> = {
  NGN: { symbol: '₦', name: 'Nigerian Naira' },
  USD: { symbol: '$', name: 'US Dollar' },
  GBP: { symbol: '£', name: 'British Pound' },
  EUR: { symbol: '€', name: 'Euro' },
  GHS: { symbol: 'GH₵', name: 'Ghanaian Cedi' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling' },
  ZAR: { symbol: 'R', name: 'South African Rand' },
}

export type IncomeCategory = 'sales' | 'delivery_fee' | 'other'

export const INCOME_CATEGORIES: Record<IncomeCategory, string> = {
  sales: 'Sales',
  delivery_fee: 'Delivery Fee',
  other: 'Other',
}

export type ExpenseCategory =
  | 'food_drinks'
  | 'transport'
  | 'utilities'
  | 'rent'
  | 'supplies'
  | 'marketing'
  | 'salary'
  | 'equipment'
  | 'packaging'
  | 'other'

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, string> = {
  food_drinks: 'Food & Drinks',
  transport: 'Transport',
  utilities: 'Utilities',
  rent: 'Rent',
  supplies: 'Supplies',
  marketing: 'Marketing',
  salary: 'Salary',
  equipment: 'Equipment',
  packaging: 'Packaging',
  other: 'Other',
}

export interface AppSetup {
  businessName: string
  currency: Currency
  setupDone: boolean
}

export interface Income {
  id: string
  amount: number
  category: IncomeCategory
  note?: string
  date: string
  createdAt: string
}

export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  note?: string
  receiptPhoto?: string
  date: string
  createdAt: string
}

export interface Debtor {
  id: string
  name: string
  phone?: string
  amount: number
  note?: string
  dueDate?: string
  isPaid: boolean
  paidAt?: string
  createdAt: string
}

export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export const REMINDER_FREQUENCIES: Record<ReminderFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

export interface Reminder {
  id: string
  title: string
  amount: number
  category: string
  frequency: ReminderFrequency
  nextDue: string
  isActive: boolean
  createdAt: string
}
