/**
 * 开发态素材库 · 文档阅读器
 *
 * 文档在构建时通过 ?raw 内嵌；因为整个素材库只在 DEV 加载，正式产物不会包含这些文本。
 */
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

export function DocsView({
  content,
  theme,
}: {
  content: string
  theme: 'dark' | 'light'
}) {
  if (!content) {
    return <div className="text-[12px] text-muted-foreground">文档未找到。</div>
  }

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:scroll-mt-4 prose-headings:text-foreground',
        'prose-p:text-foreground/85 prose-li:text-foreground/85 prose-strong:text-foreground',
        'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-[11px] prose-code:font-normal prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-muted prose-pre:text-foreground',
        'prose-table:text-[12px] prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-2 prose-th:py-1 prose-td:border prose-td:border-border prose-td:px-2 prose-td:py-1',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        theme === 'dark' && 'prose-invert',
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
