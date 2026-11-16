/**
 * 智能知识库 - 未建页面的占位视图
 *
 * 智能中心导航已按面板 1:1 落地（智能应用 / 系统设置），本组件用于未建页面的占位，
 * 避免空白页或偷用旧页面。当前无调用方，不参与任何交互逻辑。
 */
import type { ReactNode } from 'react'

export function StubPage({
  title,
  summary,
  planned,
  note,
  icon,
}: {
  title: string
  /** 一句话说明这个入口是干什么的 */
  summary: string
  /** 规划中的模块（灰底标签） */
  planned: string[]
  /** 底部补充说明，如评审状态 / 关联文档 */
  note: string
  icon: ReactNode
}) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#F5F7FA]">
      <div className="max-w-[720px] mx-auto mt-[80px] bg-white border border-[#DCDFE6] rounded-[8px] px-[32px] py-[32px]">
        <div className="flex items-start gap-[16px]">
          <div className="w-[40px] h-[40px] rounded-[8px] bg-[#ECF1FD] flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h1 className="text-[16px] font-semibold text-[#303133]">{title}</h1>
            <p className="mt-[6px] text-[13px] leading-[22px] text-[#606266]">{summary}</p>
          </div>
        </div>

        <div className="mt-[24px] pl-[56px]">
          <div className="text-[12px] text-[#909399] mb-[8px]">规划模块</div>
          <div className="flex flex-wrap gap-[8px]">
            {planned.map((p) => (
              <span
                key={p}
                className="px-[10px] h-[26px] inline-flex items-center rounded-[4px] bg-[#F5F7FA] border border-[#E4E7ED] text-[12px] text-[#606266]"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="mt-[20px] text-[12px] leading-[20px] text-[#909399]">{note}</p>
        </div>
      </div>
    </div>
  )
}