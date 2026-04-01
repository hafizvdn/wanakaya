
import { format } from 'date-fns'
import Layout from '../components/ui/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import SpendingPieChart from '../components/charts/SpendingPieChart.jsx'
import { useTransactions } from '../hooks/useTransactions.js'
import { useAccounts } from '../hooks/useAccounts.js'
import { formatCurrency } from '../lib/utils.js'
import { useMemo, useState } from 'react' // add useState here
// Add this near your other component imports
import CategoryIcon from '../components/ui/CategoryIcon.jsx'

export default function Dashboard() {
  const now = new Date()
  // 1. Add state for month and year
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  // 2. Pass the state variables into your hook instead of the hardcoded 'now'
  const { transactions, loading: txLoading } = useTransactions({ month, year })
  const { accounts, loading: acLoading } = useAccounts()


  const { totalIncome, totalExpense, spendingByCategory } = useMemo(() => {
    let totalIncome = 0
    let totalExpense = 0
    const byCategory = {}

    for (const t of transactions) {
      if (t.type === 'INCOME') totalIncome += t.amount
      else {
        totalExpense += t.amount
        const name = t.category?.name ?? 'Other'
        byCategory[name] = (byCategory[name] ?? 0) + t.amount
      }
    }

    const spendingByCategory = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    return { totalIncome, totalExpense, spendingByCategory }
  }, [transactions])

  const totalBalance = useMemo(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts])
  const monthlyNet = totalIncome - totalExpense

  return (
    <Layout>
      <div className="flex flex-wrap items-start justify-between mb-6 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          {/* Replace the static <p> with these selectors */}
          <div className="flex gap-2 mt-1">
            <select
              className="text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-2 py-1"
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <input
              type="number"
              className="text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-2 py-1 w-20"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-4 lg:grid-cols-4">
        <Card className="col-span-2 lg:col-span-1 bg-gradient-to-br from-brand-600 to-brand-700 border-0">
          <p className="text-xs text-brand-100 uppercase tracking-wider mb-1">Total Balance</p>
          <p className="text-2xl font-bold text-white">{acLoading ? '…' : formatCurrency(totalBalance)}</p>
          <p className="text-xs text-brand-200 mt-1">Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </Card>

        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Income</p>
          <p className="text-2xl font-bold text-brand-600">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </Card>

        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expenses</p>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpense)}</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Monthly Net Flow</p>
          <p className={`text-2xl font-bold ${monthlyNet >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
            {monthlyNet >= 0 ? '+' : ''}{formatCurrency(monthlyNet)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Income − expenses</p>
        </Card>
      </div>

      {/* Accounts quick view */}
      {!acLoading && accounts.length > 0 && (
        <div className="flex gap-3 mb-4 overflow-x-auto pb-1">
          {accounts.map(a => (
            <div key={a.id} className="shrink-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
              <span className="text-xl">{a.icon ?? '💳'}</span>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">{a.name}</p>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">{formatCurrency(a.balance)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts + recent transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Spending by Category</h3>
          {txLoading
            ? <p className="text-gray-400 text-sm">Loading…</p>
            : spendingByCategory.length
              ? <SpendingPieChart data={spendingByCategory} />
              : <p className="text-gray-400 text-sm text-center py-10">No expenses this month.</p>
          }
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Transactions</h3>
          {txLoading ? <p className="text-gray-400 text-sm">Loading…</p> : (
            <ul className="flex flex-col gap-2.5">
              {transactions.slice(0, 8).map(t => (
                <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <CategoryIcon name={t.category?.icon} className="w-5 h-5 text-gray-500" />
                    <div className="min-w-0">
                      <p className="text-gray-700 dark:text-gray-200 truncate">{t.category?.name}</p>
                      {t.account && (
                        <p className="text-xs text-gray-400">{t.account.icon ?? '💳'} {t.account.name}</p>
                      )}
                    </div>
                  </div>
                  <span className={`font-semibold shrink-0 ${t.type === 'INCOME' ? 'text-brand-600' : 'text-red-500'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </li>
              ))}
              {!transactions.length && <p className="text-gray-400 text-sm text-center py-6">No transactions this month.</p>}
            </ul>
          )}
        </Card>
      </div>
    </Layout>
  )
}
