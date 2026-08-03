/**
 * MilkdownEditor - WYSIWYG markdown editor powered by Milkdown
 * Receives initial value, emits changes via onChange callback
 */
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { gfm } from '@milkdown/kit/preset/gfm'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { nord } from '@milkdown/theme-nord'
import { useRef, useCallback } from 'react'
import '@milkdown/theme-nord/style.css'

interface MilkdownEditorProps {
  /** initial markdown content */
  value: string
  /** called when content changes (debounced by parent) */
  onChange: (markdown: string) => void
}

function EditorInner({ value, onChange }: MilkdownEditorProps) {
  // keep latest onChange in a ref so editor factory closure stays stable
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, value)
        ctx.set(editorViewOptionsCtx, {
          editable: () => true,
          attributes: {
            class: 'prose prose-sm max-w-3xl mx-auto focus:outline-none',
          },
        })
      })
      .use(commonmark)
      .use(gfm)
      .use(nord)
      .use(listener)
      .config((ctx) => {
        ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
          onChangeRef.current(markdown)
        })
      })
  }, [])

  return <Milkdown />
}

export function MilkdownEditor({ value, onChange }: MilkdownEditorProps) {
  // stable onChange callback
  const handle = useCallback((md: string) => onChange(md), [onChange])

  return (
    <MilkdownProvider>
      <EditorInner value={value} onChange={handle} />
    </MilkdownProvider>
  )
}
