export default function Card({ className = '', children }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 ${className}`}>
      {children}
    </div>
  )
}
