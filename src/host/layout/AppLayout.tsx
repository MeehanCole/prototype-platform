/**
 * AppLayout - left Sidebar (collapsible) + right content area (maximizable)
 * platform-level global search: Cmd+K / Ctrl+K opens SearchPanel from anywhere
 */
import { useState, useEffect } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { SearchPanel } from '@/host/components/SearchPanel'

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const isEmbed = searchParams.get('embed') === 'true' || window.location.href.includes('embed=true')

  // global shortcut: Cmd+K / Ctrl+K toggles the search panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const shell = (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )

  if (isEmbed) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    )
  }

  return shell
}
