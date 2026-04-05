import { formatCurrency } from '../../lib/utils.js' // Removed formatDate from here
import Button from '../ui/Button.jsx'
import CategoryIcon from '../ui/CategoryIcon.jsx'

export default function TransactionRow({ transaction, onEdit, onDelete }) {
  const isIncome = transaction.type === 'INCOME'
  return (
    <tr className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      {/* Date <td> has been completely removed! */}
      
      <td className="py-3 px-4">
        <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <CategoryIcon name={transaction.category?.icon} className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="truncate">{transaction.category?.name}</span>
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate hidden sm:table-cell">{transaction.note ?? '—'}</td>
      <td className="py-3 px-4 text-sm hidden md:table-cell">
        {transaction.account ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs text-gray-600 dark:text-gray-300 font-medium">
            {transaction.account.icon ?? '💳'} {transaction.account.name}
          </span>
        ) : (
          <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
        )}
      </td>
      <td className={`py-3 px-4 text-sm font-semibold text-right ${isIncome ? 'text-brand-600' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => onEdit(transaction)}>Edit</Button>
          <Button variant="ghost" className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => onDelete(transaction.id)}>Delete</Button>
        </div>
      </td>
    </tr>
  )
}