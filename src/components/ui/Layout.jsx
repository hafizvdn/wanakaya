import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import Button from './Button.jsx'

// 1. Import the professional icons
import { 
  LayoutDashboard, 
  Landmark, 
  ArrowRightLeft, 
  PieChart, 
  Target, 
  CalendarClock, 
  Tags,
  Sun,
  Moon
} from 'lucide-react'

// 2. Replace emojis with the imported Lucide components
const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/accounts', label: 'Accounts', icon: Landmark },
  { to: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { to: '/budgets', label: 'Budgets', icon: PieChart },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/bills', label: 'Recurring Bills', icon: CalendarClock },
  { to: '/categories', label: 'Categories', icon: Tags },
]

// 3. Render the Icon component properly with Tailwind sizing
function NavItems({ onNav }) {
  return navItems.map(({ to, label, icon: Icon }) => (
    <NavLink
      key={to}
      to={to}
      end={to === '/'}
      onClick={onNav}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand-50 dark:bg-brand-700/20 text-brand-700 dark:text-brand-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  ))
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">

      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex w-56 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex-col py-6 px-4 shrink-0">
        <h1 className="text-xl font-bold text-brand-600 mb-8 px-2">wanakaya</h1>
        <nav className="flex flex-col gap-1 flex-1">
          <NavItems />
        </nav>
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-col gap-1">
          <button
            onClick={toggle}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
          <p className="text-xs text-gray-400 dark:text-gray-500 px-3 pt-1">{user?.email}</p>
          <Button variant="ghost" className="w-full justify-start text-gray-500 dark:text-gray-400" onClick={logout}>
            Sign out
          </Button>
        </div>
      </aside>

      {/* ── Mobile nav drawer ───────────────────────────── */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 flex flex-col py-6 px-4 shadow-xl z-50">
            <div className="flex items-center justify-between mb-8 px-2">
              <h1 className="text-xl font-bold text-brand-600">wanakaya</h1>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <nav className="flex flex-col gap-1 flex-1">
              <NavItems onNav={() => setMenuOpen(false)} />
            </nav>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-col gap-1">
              <button
                onClick={() => { toggle(); setMenuOpen(false) }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {dark ? 'Light mode' : 'Dark mode'}
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500 px-3 pt-1">{user?.email}</p>
              <Button variant="ghost" className="w-full justify-start text-gray-500 dark:text-gray-400" onClick={logout}>
                Sign out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Page content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-30">
          <button
            onClick={() => setMenuOpen(true)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 -ml-1 text-xl"
            aria-label="Open menu"
          >
            ☰
          </button>
          <h1 className="text-base font-bold text-brand-600">wanakaya</h1>
          <button
            onClick={toggle}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 -mr-1 text-lg"
            aria-label="Toggle theme"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto text-gray-900 dark:text-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}
