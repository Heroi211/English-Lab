import { BookOpen, Menu, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../stores/appStore'

const links = [
  ['/dashboard', 'Dashboard'],
  ['/today', 'Today'],
  ['/journey', 'Journey'],
  ['/learn', 'Learn'],
  ['/review', 'Review'],
  ['/progress', 'Progress'],
  ['/tutor', 'Tutor'],
  ['/settings', 'Settings'],
] as const

export function RootLayout() {
  const [open, setOpen] = useState(false)
  const name = useAppStore((s) => s.settings.learnerName)
  const level = useAppStore((s) => s.progress.currentLevel)

  return (
    <div className="min-h-screen bg-lab-950 text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-lab-950/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-5">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <BookOpen className="text-teal-400" size={20} />
            <span>
              English <span className="text-zinc-500">Journey</span>
            </span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'rounded px-3 py-2 text-sm transition',
                    isActive ? 'bg-zinc-900 text-teal-300' : 'text-zinc-500 hover:text-zinc-200',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-4 hidden items-center gap-2 border-l border-zinc-800 pl-4 text-sm text-zinc-500 lg:flex">
            <Sparkles size={14} className="text-teal-500" />
            <span className="font-mono text-xs text-teal-400">{level}</span>
            {name ? <span>{name}</span> : null}
          </div>
          <Button className="ml-auto lg:hidden" variant="ghost" onClick={() => setOpen(!open)} aria-label="Menu">
            <Menu />
          </Button>
        </div>
        {open && (
          <nav className="border-t border-zinc-800 p-3 lg:hidden">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)} className="block p-3 text-sm text-zinc-400">
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-7xl animate-fade-in px-5 py-10">
        <Outlet />
      </main>
    </div>
  )
}
