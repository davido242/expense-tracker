import * as XLSX from 'xlsx'
import { Income, Expense, Debtor, INCOME_CATEGORIES, EXPENSE_CATEGORIES, Currency } from './types'
import { formatCurrency } from './format'

export function exportToExcel(
  income: Income[],
  expenses: Expense[],
  debtors: Debtor[],
  currency: Currency,
) {
  const wb = XLSX.utils.book_new()

  const incomeRows = income.map((i) => ({
    Date: i.date,
    Category: INCOME_CATEGORIES[i.category],
    Amount: i.amount,
    'Amount (formatted)': formatCurrency(i.amount, currency),
    Note: i.note || '',
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incomeRows), 'Income')

  const expenseRows = expenses.map((e) => ({
    Date: e.date,
    Category: EXPENSE_CATEGORIES[e.category],
    Amount: e.amount,
    'Amount (formatted)': formatCurrency(e.amount, currency),
    Note: e.note || '',
    'Has Receipt': e.receiptPhoto ? 'Yes' : 'No',
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseRows), 'Expenses')

  const debtorRows = debtors.map((d) => ({
    Name: d.name,
    Phone: d.phone || '',
    Amount: d.amount,
    'Amount (formatted)': formatCurrency(d.amount, currency),
    'Due Date': d.dueDate || '',
    Status: d.isPaid ? 'Paid' : 'Outstanding',
    'Paid On': d.paidAt || '',
    Note: d.note || '',
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(debtorRows), 'Debtors')

  XLSX.writeFile(wb, `cashflow-babe-export-${new Date().toISOString().split('T')[0]}.xlsx`)
}
