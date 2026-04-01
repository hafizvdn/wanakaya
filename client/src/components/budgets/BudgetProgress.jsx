import { formatCurrency, formatPercent } from '../../lib/utils.js'

export default function BudgetProgress({ spent, limit }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const over = spent > limit

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{formatCurrency(spent)} spent</span>
        <span className={over ? 'text-red-500 font-semibold' : ''}>{formatCurrency(limit)} limit</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : 'bg-brand-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs ${over ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
        {over ? `Over by ${formatCurrency(spent - limit)}` : `${formatPercent(spent, limit)} used`}
      </p>
    </div>
  )
}
