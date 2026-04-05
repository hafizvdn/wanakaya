import TransactionRow from './TransactionRow.jsx'
import { formatCurrency, formatDate } from '../../lib/utils.js'

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (!transactions.length) {
    return <p className="text-center text-gray-400 py-10">No transactions yet.</p>
  }

  // 1. Group transactions by their formatted date string
  const groupedTransactions = transactions.reduce((acc, t) => {
    const dateStr = formatDate(t.date); 
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(t);
    return acc;
  }, {});

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-700">
            {/* Removed the Date <th> from here */}
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Note</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Account</th>
            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
            <th className="py-3 px-4" />
          </tr>
        </thead>
        
        {/* 2. Map over the grouped dates to create separate tbodys */}
        {Object.entries(groupedTransactions).map(([dateStr, dailyTransactions]) => {
          // Calculate the net total for the day
          const dailyTotal = dailyTransactions.reduce((sum, t) => {
            return sum + (t.type === 'EXPENSE' ? -t.amount : t.amount);
          }, 0);

          return (
            <tbody key={dateStr}>
              {/* Group Header Row */}
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                <td colSpan={5} className="py-2 px-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{dateStr}</span>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {formatCurrency(dailyTotal)}
                    </span>
                  </div>
                </td>
              </tr>
              
              {/* The Actual Transaction Rows for this day */}
              {dailyTransactions.map(t => (
                <TransactionRow key={t.id} transaction={t} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </tbody>
          );
        })}
      </table>
    </div>
  )
}