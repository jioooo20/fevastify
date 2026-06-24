import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useTheme } from './ThemeProvider'

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  )

function SunIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

function AdminLayout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="sticky top-0 flex h-screen flex-col border-b bg-card md:border-b-0 md:border-r">
          <div className="flex flex-col gap-6 px-4 py-6">
            <div className="space-y-1">
              <div className="text-lg font-semibold tracking-tight">Vastify</div>
              <div className="text-xs font-medium text-muted-foreground">
                Admin Console
              </div>
            </div>
            <nav className="grid gap-1">
              <NavLink to="/admin/dashboard" className={navClass}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/films" className={navClass}>
                Films
              </NavLink>
              <NavLink to="/admin/genres" className={navClass}>
                Genres
              </NavLink>
              <NavLink to="/admin/tags" className={navClass}>
                Tags
              </NavLink>
              <NavLink to="/admin/directors" className={navClass}>
                Directors
              </NavLink>
              <NavLink to="/admin/production-house" className={navClass}>
                Production Houses
              </NavLink>
            </nav>
          </div>
          <div className="mt-auto border-t px-4 py-4">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {theme === "dark" ? (
                <>
                  <SunIcon className="h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <MoonIcon className="h-4 w-4" />
                  Dark Mode
                </>
              )}
            </button>
          </div>
        </aside>
        <main className="overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
