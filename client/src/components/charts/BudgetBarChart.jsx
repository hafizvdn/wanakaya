import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '../../lib/utils.js'

/**
 * @param {{ data: Array<{ name: string, limit: number, spent: number }> }} props
 * limit/spent in sen
 */
export default function BudgetBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={v => `RM ${(v / 100).toFixed(0)}`} tick={{ fontSize: 12 }} width={60} />
        <Tooltip formatter={val => formatCurrency(val)} />
        <Legend />
        <Bar dataKey="limit" name="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="spent" name="Spent" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.spent > entry.limit ? '#ef4444' : '#22c55e'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
