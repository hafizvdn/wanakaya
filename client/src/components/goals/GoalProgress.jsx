import { formatCurrency, formatPercent, formatDate } from '../../lib/utils.js'

export default function GoalProgress({ goal }) {
  const pct = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0
  const done = goal.savedAmount >= goal.targetAmount

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{formatCurrency(goal.savedAmount)} saved</span>
        <span>{formatCurrency(goal.targetAmount)} goal</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${done ? 'bg-brand-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>{formatPercent(goal.savedAmount, goal.targetAmount)} complete</span>
        {goal.deadline && <span>By {formatDate(goal.deadline)}</span>}
      </div>
    </div>
  )
}
