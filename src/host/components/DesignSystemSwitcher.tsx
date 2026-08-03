/**
 * DesignSystemSwitcher - dropdown to switch built-in design system presets
 * applies tokens globally, affects all pages
 */
import { useState, useRef, useEffect } from 'react'
import { Palette, Check } from 'lucide-react'
import { useDesignSystem } from '../design-systems/useDesignSystem'
import { cn } from '@/lib/utils'

export function DesignSystemSwitcher() {
  const { current, presets, switchTo } = useDesignSystem()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title={`设计系统: ${current.name}`}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors',
          open
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        )}
      >
        <Palette size={14} />
        <span className="hidden lg:inline">{current.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-border bg-background shadow-pop z-50 overflow-hidden">
          <div className="px-3 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
            设计系统
          </div>
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                switchTo(preset.id)
                setOpen(false)
              }}
              className={cn(
                'w-full flex items-start gap-2 px-3 py-2 text-left transition-colors',
                current.id === preset.id
                  ? 'bg-accent/50'
                  : 'hover:bg-accent',
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-foreground">{preset.name}</span>
                  {current.id === preset.id && (
                    <Check size={12} className="text-primary shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{preset.description}</div>
                <div className="flex items-center gap-1 mt-1.5">
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ background: preset.tokens['--color-primary'] }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ background: preset.tokens['--color-danger'] }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ background: preset.tokens['--color-warning'] }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ background: preset.tokens['--color-success'] }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
