/**
 * DesignSystemSwitcher - dropdown to switch built-in design system presets
 * applies tokens globally, affects all pages
 * 落地提示: 根据当前页面 meta.designSystem 展示目标设计系统与匹配状态,
 * 避免"切换后页面无变化"造成误解(未 token 化页面保留原始硬编码色)
 */
import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Palette, Check } from 'lucide-react'
import { useDesignSystem } from '../design-systems/useDesignSystem'
import { findPageByPath } from '@/host/router/pageRegistry'
import { cn } from '@/lib/utils'

/** meta.designSystem id → 展示名 */
const DS_NAMES: Record<string, string> = {
  'element-plus': 'Element Plus',
  'ant-design': 'Ant Design',
  'arco-design': 'Arco Design',
  'naive-ui': 'Naive UI',
}

export function DesignSystemSwitcher() {
  const { current, presets, switchTo } = useDesignSystem()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()
  // 当前路由对应的页面 meta(用于展示页面声明的目标设计系统)
  const pageDs = findPageByPath(location.pathname)?.meta.designSystem

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
                  {pageDs === preset.id && (
                    <span className="text-[10px] px-1 py-px rounded bg-primary/10 text-primary shrink-0">
                      页面匹配
                    </span>
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
          {/* 当前页面设计系统提示: 落地"切换"语义, 避免未 token 化页面无变化造成误解 */}
          <div className="px-3 py-2 border-t border-border bg-muted/20">
            {pageDs ? (
              <div className="text-[11px] text-muted-foreground">
                当前页面目标设计系统:
                <span className="font-medium text-foreground"> {DS_NAMES[pageDs] || pageDs}</span>
                {current.id === pageDs && <span className="text-primary ml-1">· 已匹配</span>}
              </div>
            ) : (
              <div className="text-[11px] text-muted-foreground leading-snug">
                此页面未声明设计系统(meta.json 的 designSystem), 切换仅影响使用平台 token 的页面
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
