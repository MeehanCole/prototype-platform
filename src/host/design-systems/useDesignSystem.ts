/**
 * useDesignSystem - apply design system preset to document root
 * injects CSS variables dynamically, persists selection to localStorage
 */
import { useState, useEffect, useCallback } from 'react'
import { presets, defaultPreset, type DesignSystemPreset } from './presets'

const STORAGE_KEY = 'prototype-design-system'

export function useDesignSystem() {
  const [current, setCurrent] = useState<DesignSystemPreset>(() => {
    const saved = typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY)
      : null
    return presets.find((p) => p.id === saved) || defaultPreset
  })

  const apply = useCallback((preset: DesignSystemPreset) => {
    const root = document.documentElement
    // clear previous design-system tokens (marked with data-ds attribute)
    root.querySelectorAll('[data-ds-token]').forEach((el) => el.remove())

    // inject new tokens as a style tag
    const style = document.createElement('style')
    style.setAttribute('data-ds-token', 'true')
    const cssVars = Object.entries(preset.tokens)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n')
    style.textContent = `:root {\n${cssVars}\n}`
    root.appendChild(style)

    localStorage.setItem(STORAGE_KEY, preset.id)
    setCurrent(preset)
  }, [])

  // apply on mount
  useEffect(() => {
    apply(current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const switchTo = useCallback(
    (id: string) => {
      const preset = presets.find((p) => p.id === id)
      if (preset) apply(preset)
    },
    [apply],
  )

  return { current, presets, switchTo }
}
