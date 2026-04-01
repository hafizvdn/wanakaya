import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../../lib/utils.js'

/**
 * @param {{ data: Array<{ name: string, progress: number, fill: string }> }} props
 * progress is 0–100
 */
export default function GoalProgressChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={data}>
        <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff', fontSize: 11 }} background dataKey="progress" />
        <Legend iconSize={10} />
        <Tooltip formatter={val => `${val}%`} />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}
