/**
 * @param {{ label?: string, error?: string } & React.InputHTMLAttributes<HTMLInputElement>} props
 */
export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <input
        className={`rounded-lg border px-3 py-2 text-sm outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent ${error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
