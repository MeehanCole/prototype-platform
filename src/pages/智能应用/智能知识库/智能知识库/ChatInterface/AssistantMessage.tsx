import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronRight, Database, FileText, Lightbulb, Loader2 } from 'lucide-react'
import type { RetrievalCitation, StructuredReply } from './knowledgeRag'

function renderInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g)
  return parts.map((part, idx) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code
        key={idx}
        className="mx-0.5 rounded-[4px] bg-[#F3F5F8] px-1.5 py-[1px] font-mono text-[12.5px] text-[#303540]"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <span key={idx}>{part}</span>
    ),
  )
}

export function AssistantMessage({
  status,
  reply,
  onOpenCitations,
}: {
  status: 'retrieving' | 'done'
  reply?: StructuredReply
  onOpenCitations: (citations: RetrievalCitation[], activeId?: string) => void
}) {
  const [processExpanded, setProcessExpanded] = useState(false)

  if (status === 'retrieving' || !reply) {
    return (
      <div className="flex items-center gap-2 py-1 text-[13px] text-[#8A9099]">
        <Loader2 className="h-[14px] w-[14px] animate-spin text-[#409EFF]" />
        <span>正在检索知识库...</span>
      </div>
    )
  }

  const citationMap = new Map(reply.citations.map((c) => [c.id, c]))

  return (
    <div className="min-w-0 flex-1 space-y-3.5">
      {/* 检索 Agent 过程（可内联展开/收起） */}
      <div>
        <button
          type="button"
          onClick={() => setProcessExpanded((v) => !v)}
          className="inline-flex items-center gap-1 text-[12.5px] text-[#8A9099] transition-colors hover:text-[#4E5969]"
        >
          <span>检索完成 · 引用了 {reply.citations.length} 篇文档</span>
          {processExpanded ? (
            <ChevronDown className="h-[13px] w-[13px]" />
          ) : (
            <ChevronRight className="h-[13px] w-[13px]" />
          )}
        </button>

        {processExpanded && (
          <div className="mt-3 space-y-0 pl-1">
            {reply.agentSteps.map((step, index) => {
              const isLast = index === reply.agentSteps.length - 1
              return (
                <div key={index} className="relative flex gap-3 pb-3.5 last:pb-0">
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-[7px] top-[20px] w-px bg-[#E5E8EE]"
                    />
                  )}
                  <span className="mt-[2px] flex h-[15px] w-[15px] shrink-0 items-center justify-center bg-white text-[#606266]">
                    {step.kind === 'think' && <Lightbulb className="h-[14px] w-[14px]" strokeWidth={1.7} />}
                    {step.kind === 'search' && <Database className="h-[14px] w-[14px]" strokeWidth={1.7} />}
                    {step.kind === 'done' && <CheckCircle2 className="h-[14px] w-[14px]" strokeWidth={1.7} />}
                  </span>
                  <div className="min-w-0 text-[12.5px] leading-[1.6]">
                    <div className="text-[#4E5969]">{step.title}</div>
                    {step.detail && (
                      <div className="mt-0.5 text-[12px] text-[#8A9099]">{step.detail}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 结构化标题 */}
      <h3 className="text-[16px] font-semibold leading-[1.5] text-[#1F2329]">
        {reply.title}
      </h3>

      {/* 分节正文 + 行内文档引用胶囊 */}
      <div className="space-y-3.5">
        {reply.sections.map((section, idx) => {
          const cit = section.citationId ? citationMap.get(section.citationId) : undefined
          return (
            <div key={idx} className="space-y-1">
              <h4 className="text-[13.5px] font-semibold text-[#1F2329]">
                {section.heading}
              </h4>
              <p className="text-[13.5px] leading-[1.75] text-[#303540]">
                {renderInlineCode(section.text)}
                {cit && (
                  <button
                    type="button"
                    onClick={() => onOpenCitations(reply.citations, cit.id)}
                    title={`${cit.kbName} · ${cit.docName}`}
                    className="ml-1.5 inline-flex max-w-[180px] -translate-y-[1px] items-center gap-1 rounded-[4px] bg-[#F3F5F8] px-1.5 py-[1px] align-baseline text-[11.5px] text-[#606266] transition-colors hover:bg-[#E8EDF5] hover:text-[#1F2329]"
                  >
                    <FileText className="h-[11px] w-[11px] shrink-0 text-[#8A9099]" />
                    <span className="truncate">{cit.docName}</span>
                  </button>
                )}
              </p>
            </div>
          )
        })}
      </div>

      {/* 处理要点列表 */}
      {reply.steps && reply.steps.length > 0 && (
        <div className="space-y-1.5 pt-0.5">
          {reply.stepsTitle && (
            <h4 className="text-[13.5px] font-semibold text-[#1F2329]">
              {reply.stepsTitle}
            </h4>
          )}
          <ol className="list-decimal space-y-1.5 pl-5 text-[13.5px] leading-[1.7] text-[#303540]">
            {reply.steps.map((step, idx) => (
              <li key={idx}>{renderInlineCode(step)}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
