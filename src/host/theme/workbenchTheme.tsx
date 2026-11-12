import React, { createContext, useContext, useEffect, useState } from 'react'

export type WorkbenchTheme = 'dark' | 'light'

interface WorkbenchThemeContextValue {
  theme: WorkbenchTheme
  setTheme: (theme: WorkbenchTheme) => void
  toggleTheme: () => void
}

const WorkbenchThemeContext = createContext<WorkbenchThemeContextValue | null>(null)

const STORAGE_KEY = 'prototype_workbench_theme'

export function WorkbenchThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<WorkbenchTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'dark' || saved === 'light') return saved
    } catch {
      // fallback
    }
    // 默认提供深色工作台，与左侧协作台视觉统一
    return 'dark'
  })

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-workbench-theme', theme)
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore
    }
  }, [theme])

  const setTheme = (next: WorkbenchTheme) => {
    setThemeState(next)
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <WorkbenchThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </WorkbenchThemeContext.Provider>
  )
}

export function useWorkbenchTheme() {
  const ctx = useContext(WorkbenchThemeContext)
  if (!ctx) {
    throw new Error('useWorkbenchTheme must be used within WorkbenchThemeProvider')
  }
  return ctx
}
