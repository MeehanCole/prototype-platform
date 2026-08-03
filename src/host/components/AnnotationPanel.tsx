/**
 * AnnotationPanel - Word-style document annotations
 * 1. In read mode, user selects text, a floating "add annotation" button appears
 * 2. Click to open input dialog, enter comment
 * 3. Save annotation (anchorText + comment) to .annotations_<version>.json
 * 4. Display annotation list below PRD content
 */
import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import {
  readAnnotations,
  writeAnnotations,
  type Annotation,
} from '@/host/api'

interface AnnotationPanelProps {
  /** relative path to annotation file, e.g. CRM/Login/.annotations_v2.json */
  annoPath: string
  /** PRD content to wrap, so text selection is scoped */
  children?: ReactNode
}

export function AnnotationPanel({ annoPath, children }: AnnotationPanelProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedText, setSelectedText] = useState('')
  const [showFloatBtn, setShowFloatBtn] = useState(false)
  const [floatPos, setFloatPos] = useState({ x: 0, y: 0 })
  const [showDialog, setShowDialog] = useState(false)
  const [comment, setComment] = useState('')
  const [author, setAuthor] = useState('评审人')
  const containerRef = useRef<HTMLDivElement>(null)

  // load annotations on mount / path change
  useEffect(() => {
    let cancelled = false
    readAnnotations(annoPath).then((data) => {
      if (!cancelled) {
        setAnnotations(data?.annotations || [])
      }
    })
    return () => { cancelled = true }
  }, [annoPath])

  // listen for text selection in PRD content area
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    const text = selection?.toString().trim() || ''
    if (text.length > 0 && text.length < 500) {
      const range = selection?.getRangeAt(0)
      if (range && containerRef.current?.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect()
        const containerRect = containerRef.current.getBoundingClientRect()
        setSelectedText(text)
        setFloatPos({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top,
        })
        setShowFloatBtn(true)
        return
      }
    }
    setShowFloatBtn(false)
  }, [])

  const handleAddAnnotation = () => {
    setShowFloatBtn(false)
    setComment('')
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!comment.trim() || !selectedText) return

    const newAnno: Annotation = {
      id: `anno-${Date.now()}`,
      anchorText: selectedText,
      author: author || '匿名',
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    }

    const updated = [...annotations, newAnno]
    setAnnotations(updated)
    await writeAnnotations(annoPath, { annotations: updated })

    setShowDialog(false)
    setSelectedText('')
    setComment('')
  }

  const handleDelete = async (id: string) => {
    const updated = annotations.filter((a) => a.id !== id)
    setAnnotations(updated)
    await writeAnnotations(annoPath, { annotations: updated })
  }

  return (
    <div ref={containerRef} className="relative" onMouseUp={handleMouseUp}>
      {/* PRD content wrapped here so text selection is scoped */}
      {children}

      {/* floating add button */}
      {showFloatBtn && (
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-full"
          style={{ left: floatPos.x, top: floatPos.y - 8 }}
        >
          <button
            onClick={handleAddAnnotation}
            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md shadow-lg hover:bg-primary/90 whitespace-nowrap"
          >
            + 添加注解
          </button>
        </div>
      )}

      {/* annotation dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
          <div className="w-96 rounded-lg bg-background p-6 shadow-xl border border-border">
            <h3 className="mb-3 text-base font-semibold">添加注解</h3>
            <div className="mb-3 rounded-md bg-muted p-2 text-sm text-muted-foreground">
              选中: "{selectedText.length > 60 ? selectedText.slice(0, 60) + '...' : selectedText}"
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">署名</label>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full rounded-md border border-border px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">评论</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  autoFocus
                  className="w-full rounded-md border border-border px-3 py-1.5 text-sm resize-none"
                  placeholder="请输入评审意见..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDialog(false)}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={!comment.trim()}
                  className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* annotation list */}
      {annotations.length > 0 && (
        <div className="mt-8 border-t border-border pt-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            文档注解 ({annotations.length})
          </h3>
          <div className="space-y-3">
            {annotations.map((anno) => (
              <div
                key={anno.id}
                className="rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="mb-1 rounded bg-accent px-2 py-0.5 text-xs text-accent-foreground inline-block">
                      {anno.anchorText.length > 80
                        ? anno.anchorText.slice(0, 80) + '...'
                        : anno.anchorText}
                    </div>
                    <p className="text-sm text-foreground">{anno.comment}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(anno.id)}
                    className="shrink-0 text-xs text-muted-foreground hover:text-red-500"
                  >
                    删除
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {anno.author} - {new Date(anno.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
