import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import GoalProgress from './GoalProgress.jsx'

export default function GoalCard({ goal, onEdit, onDelete, onAddFunds, onHistory }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <p className="font-semibold text-gray-900 dark:text-white">{goal.name}</p>
        <div className="flex gap-1">
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => onEdit(goal)}>Edit</Button>
          <Button variant="ghost" className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => onDelete(goal.id)}>Delete</Button>
        </div>
      </div>

      <GoalProgress goal={goal} />

      <div className="flex gap-2 mt-3">
        <Button
          variant="secondary"
          className="flex-1 text-xs py-1.5"
          onClick={onAddFunds}
        >
          + Add funds
        </Button>
        <Button
          variant="ghost"
          className="text-xs py-1.5 px-3 text-gray-500"
          onClick={onHistory}
        >
          History
        </Button>
      </div>
    </Card>
  )
}