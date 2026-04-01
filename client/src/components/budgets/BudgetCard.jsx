import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import BudgetProgress from './BudgetProgress.jsx'

export default function BudgetCard({ budget, spent = 0, onEdit, onDelete }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {budget.category?.icon} {budget.category?.name}
          </p>
          <p className="text-xs text-gray-400 capitalize">{budget.period.toLowerCase()} · {budget.month}/{budget.year}</p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => onEdit(budget)}>Edit</Button>
          <Button variant="ghost" className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => onDelete(budget.id)}>Delete</Button>
        </div>
      </div>
      <BudgetProgress spent={spent} limit={budget.limitAmount} />
    </Card>
  )
}
