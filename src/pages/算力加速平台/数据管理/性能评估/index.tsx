/**
 * 性能评估（数据管理 · 性能评估）
 *
 * 还原现状页面：外壳复用 platform-shell 素材，中间区域按现有性能评估列表 1:1 还原。
 * 分为标题区、列表卡片（工具条 + 表格 + 底部批量操作与分页）。
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Filter, Pencil, Plus, Search } from 'lucide-react'
import { PlatformHeader, SideNav } from '../数据集管理/_shared'
import { SearchBar } from '@/lib/search-bar'
import { TablePagination } from '@/lib/table-pagination'

/* --------------------------------- Mock --------------------------------- */

interface PerfTask {
  id: string
  code: string
  name: string
  gpu: string
  resource: string
  type: string
  targetName: string
  targetKind: string
  mode: string
  modeDetail: string
  status: '已完成' | '评估中' | '失败'
  creator: string
  createdAt: string
}

const TASKS: PerfTask[] = [
  {
    id: 'msp-l8jv6vm1',
    code: 'msp-l8jv6vm1',
    name: '覆盖kt',
    gpu: 'Nvidia H100 * 1',
    resource: 'CPU 24C 内存 100Gi 显存 15Gi',
    type: '文本推理',
    targetName: '测试KT1',
    targetKind: '内部推理服务',
    mode: '固定场景模式',
    modeDetail: '固定并发场景',
    status: '已完成',
    creator: 'admin',
    createdAt: '16 天前',
  },
  {
    id: 'msp-81x4pjpz',
    code: 'msp-81x4pjpz',
    name: '可靠回归111',
    gpu: 'Nvidia H100 * 1',
    resource: 'CPU 24C 内存 100Gi 显存 79Gi',
    type: '文本推理',
    targetName: '整卡指定1',
    targetKind: '内部推理服务',
    mode: '固定场景模式',
    modeDetail: '固定 QPS 场景',
    status: '已完成',
    creator: 'admin',
    createdAt: '17 天前',
  },
  {
    id: 'msp-9ylgvd6o',
    code: 'msp-9ylgvd6o',
    name: '可靠回归3',
    gpu: 'Nvidia H100 * 1',
    resource: 'CPU 24C 内存 100Gi 显存 79Gi',
    type: '文本推理',
    targetName: '整卡指定1',
    targetKind: '内部推理服务',
    mode: '固定场景模式',
    modeDetail: '固定 QPS 场景',
    status: '已完成',
    creator: 'admin',
    createdAt: '20 天前',
  },
  {
    id: 'msp-uczyxc97',
    code: 'msp-uczyxc97',
    name: '评测回归-1105-1543-S03-错误率SLA稳定版本',
    gpu: 'Nvidia H100 * 1',
    resource: 'CPU 24C 内存 100Gi 显存 79Gi',
    type: '文本推理',
    targetName: '整卡指定1',
    targetKind: '内部推理服务',
    mode: '高级探索模式',
    modeDetail: '智能寻优场景',
    status: '已完成',
    creator: 'admin',
    createdAt: '20 天前',
  },
  {
    id: 'msp-jz6j8z68',
    code: 'msp-jz6j8z68',
    name: '评测回归-1105-1543-S04-Goodput寻优-不指定卡',
    gpu: 'Nvidia H100 * 1',
    resource: 'CPU 24C 内存 100Gi 显存 15Gi',
    type: '文本推理',
    targetName: '验证不指定卡',
    targetKind: '内部推理服务',
    mode: '高级探索模式',
    modeDetail: '智能寻优场景',
    status: '已完成',
    creator: 'admin',
    createdAt: '20 天前',
  },
  {
    id: 'msp-68ik911j',
    code: 'msp-68ik911j',
    name: '评测回归-1105-1543-S01-TTFT寻优-整卡',
    gpu: 'Nvidia H100 * 1',
    resource: 'CPU 24C 内存 100Gi 显存 79Gi',
    type: '文本推理',
    targetName: '整卡指定1',
    targetKind: '内部推理服务',
    mode: '高级探索模式',
    modeDetail: '智能寻优场景',
    status: '已完成',
    creator: 'admin',
    createdAt: '20 天前',
  },
  {
    id: 'msp-4t6m3df0',
    code: 'msp-4t6m3df0',
    name: '评测回归-1105-1543-S02-ITL寻优-不指定卡',
    gpu: 'Nvidia H100 * 1',
    resource: 'CPU 24C 内存 100Gi 显存 15Gi',
    type: '文本推理',
    targetName: '验证不指定卡',
    targetKind: '内部推理服务',
    mode: '高级探索模式',
    modeDetail: '智能寻优场景',
    status: '已完成',
    creator: 'admin',
    createdAt: '20 天前',
  },
  {
    id: 'msp-3ssof4he',
    code: 'msp-3ssof4he',
    name: '评测回归-1105-1543-G09-并发梯度分布-整卡',
    gpu: 'Nvidia H100 * 1',
    resource: 'CPU 24C 内存 100Gi 显存 79Gi',
    type: '文本推理',
    targetName: '整卡指定1',
    targetKind: '内部推理服务',
    mode: '高级探索模式',
    modeDetail: '常规梯度场景',
    status: '已完成',
    creator: 'admin',
    createdAt: '20 天前',
  },
  {
    id: 'msp-ziydoy55',
    code: 'msp-ziydoy55',
    name: '评测回归-1105-1543-G10-QPS梯度分布-不指定卡',
    gpu: 'Nvidia H100 * 1',
    resource: 'CPU 24C 内存 100Gi 显存 15Gi',
    type: '文本推理',
    targetName: '验证不指定卡',
    targetKind: '内部推理服务',
    mode: '高级探索模式',
    modeDetail: '常规梯度场景',
    status: '已完成',
    creator: 'admin',
    createdAt: '20 天前',
  },
  {
    id: 'msp-8k362vhm',
    code: 'msp-8k362vhm',
    name: '评测回归-1105-1543-G08-QPS梯度CV-不指定卡',
    gpu: 'Nvidia H100 * 1',
    resource: 'CPU 24C 内存 100Gi 显存 15Gi',
    type: '文本推理',
    targetName: '验证不指定卡',
    targetKind: '内部推理服务',
    mode: '高级探索模式',
    modeDetail: '常规梯度场景',
    status: '已完成',
    creator: 'admin',
    createdAt: '20 天前',
  },
]

const PAGE_SIZES = [10, 20, 50] as const
const TOTAL = 34

const BLUE = 'text-[#166eff]'

/** 表格链接文字按钮 */
function RowLink({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode
  onClick?: () => void
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`${BLUE} hover:underline`}
    >
      {children}
    </button>
  )
}

/* --------------------------------- 页面 --------------------------------- */

export default function PerformanceEvaluationPage() {
  const navigate = useNavigate()
  const [draftKeyword, setDraftKeyword] = useState('')
  const [keyword, setKeyword] = useState('')
  const [mode, setMode] = useState<'all' | 'bad'>( 'all' )
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0])
  const [selected, setSelected] = useState<string[]>([])
  const [filterOpen, setFilterOpen] = useState(false)

  const filtered = useMemo(() => {
    let rows = TASKS
    if (keyword.trim()) {
      rows = rows.filter((task) => task.name.includes(keyword.trim()))
    }
    if (mode === 'bad') rows = rows.filter((task) => task.status !== '已完成')
    return rows
  }, [keyword, mode])

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const allChecked = pageRows.length > 0 && pageRows.every((r) => selected.includes(r.id))

  function toggleRow(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  function toggleAll() {
    setSelected((prev) => {
      const ids = pageRows.map((row) => row.id)
      if (ids.every((id) => prev.includes(id))) {
        return prev.filter((id) => !ids.includes(id))
      }
      return Array.from(new Set([...prev, ...ids]))
    })
  }

  function handleReset() {
    setDraftKeyword('')
    setKeyword('')
    setMode('all')
    setPage(1)
    setFilterOpen(false)
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white [font-family:'PingFang_SC','Microsoft_YaHei',Arial,sans-serif]">
      <PlatformHeader />
      <div className="flex min-h-0 flex-1">
        <SideNav activeKey="性能评估" />

        <main className="min-w-0 flex-1 overflow-auto bg-white px-6 pb-8 pt-6">
          <h1 className="text-[28px] font-bold leading-10 text-[#323232]">性能评估</h1>
          <p className="mt-2 text-[14px] leading-6 text-[#aaaaaa]">
            支持对在线推理服务进行文本性能评估，覆盖多种并发与负载策略，沉淀可复现的评估任务与报告。
          </p>

          <section className="mt-6 flex min-h-[560px] flex-col rounded-[2px] border border-[#e5e6eb] bg-white p-5">
            {/* 工具条 */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate('/算力加速平台/数据管理/创建评估任务')}
                className="flex h-10 items-center gap-2 rounded-[2px] bg-[#166eff] px-4 text-[14px] text-white transition-colors hover:bg-[#0d5fe0]"
              >
                <Plus size={16} strokeWidth={2.6} />
                创建评估任务
              </button>

              <div className="flex shrink-0 items-center gap-2">
                <SearchBar
                  value={draftKeyword}
                  onChange={setDraftKeyword}
                  onSearch={() => {
                    setKeyword(draftKeyword)
                    setPage(1)
                  }}
                  fields={[{ label: '名称', value: 'name' }]}
                  placeholder="请输入"
                  inputWidth={292}
                  showRefresh
                  onRefresh={handleReset}
                  refreshTitle="刷新"
                  aria-label="搜索评估任务名称"
                  extra={
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setFilterOpen((open) => !open)}
                        aria-label="筛选"
                        title="筛选"
                        aria-expanded={filterOpen}
                        className={`flex h-8 w-8 items-center justify-center rounded-[4px] border transition-colors ${
                          mode === 'bad'
                            ? 'border-[#166eff] bg-[#f0f6ff] text-[#166eff]'
                            : 'border-[#d9dde3] bg-white text-[#4e5969] hover:border-[#166eff] hover:text-[#166eff]'
                        }`}
                      >
                        <Filter size={15} strokeWidth={2} />
                      </button>
                      {filterOpen && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-[180px] rounded-[2px] border border-[#e5e6eb] bg-white p-3 text-[13px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                          <p className="mb-2 text-[12px] text-[#86909c]">评估状态</p>
                          <label className="flex cursor-pointer items-center gap-2 py-1 text-[#3d3d3d]">
                            <input
                              type="radio"
                              name="perf-status"
                              checked={mode === 'all'}
                              onChange={() => {
                                setMode('all')
                                setPage(1)
                              }}
                              className="accent-[#166eff]"
                            />
                            全部
                          </label>
                          <label className="flex cursor-pointer items-center gap-2 py-1 text-[#3d3d3d]">
                            <input
                              type="radio"
                              name="perf-status"
                              checked={mode === 'bad'}
                              onChange={() => {
                                setMode('bad')
                                setPage(1)
                              }}
                              className="accent-[#166eff]"
                            />
                            仅未完成
                          </label>
                        </div>
                      )}
                    </div>
                  }
                />
              </div>
            </div>

            {/* 表格 */}
            <div className="mt-6 flex-1 overflow-x-auto">
              <table className="w-full min-w-[1120px] table-fixed border-collapse text-left">
                <thead>
                  <tr className="bg-[#f7f8fa] text-[13px] text-[#4e5969]">
                    <th className="w-[44px] px-3 py-3 font-medium">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={toggleAll}
                        aria-label="全选"
                        className="h-[14px] w-[14px] accent-[#166eff]"
                      />
                    </th>
                    <th className="w-[220px] px-2 py-3 font-medium">名称/ID</th>
                    <th className="w-[190px] px-2 py-3 font-medium">评估规格</th>
                    <th className="w-[84px] px-2 py-3 font-medium">评估类型</th>
                    <th className="w-[110px] px-2 py-3 font-medium">评估对象</th>
                    <th className="w-[118px] px-2 py-3 font-medium">评估模式</th>
                    <th className="w-[96px] px-2 py-3 font-medium">评估状态</th>
                    <th className="w-[76px] px-2 py-3 font-medium">创建人</th>
                    <th className="w-[84px] px-2 py-3 font-medium">创建时间</th>
                    <th className="w-[96px] px-2 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((task) => (
                    <tr key={task.id} className="border-b border-[#f0f0f0] align-top">
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(task.id)}
                          onChange={() => toggleRow(task.id)}
                          aria-label={`选择 ${task.name}`}
                          className="mt-1 h-[14px] w-[14px] accent-[#166eff]"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title={task.name}
                            className={`min-w-0 truncate text-[13px] ${BLUE} hover:underline`}
                          >
                            {task.name}
                          </button>
                          <button
                            type="button"
                            aria-label="编辑名称"
                            title="编辑名称"
                            className="shrink-0 text-[#c0c4cc] hover:text-[#166eff]"
                          >
                            <Pencil size={12} strokeWidth={2} />
                          </button>
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[12px] tabular-nums text-[#86909c]">
                            {task.code}
                          </span>
                          <button
                            type="button"
                            aria-label="复制 ID"
                            title="复制 ID"
                            className="shrink-0 text-[#c0c4cc] hover:text-[#166eff]"
                          >
                            <Copy size={12} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <p className="truncate text-[13px] text-[#3d3d3d]" title={task.gpu}>
                          {task.gpu}
                        </p>
                        <p className="mt-1 truncate text-[12px] text-[#86909c]" title={task.resource}>
                          {task.resource}
                        </p>
                      </td>
                      <td className="px-2 py-3 text-[13px] text-[#3d3d3d]">{task.type}</td>
                      <td className="px-2 py-3">
                        <p className="truncate text-[13px] text-[#3d3d3d]" title={task.targetName}>
                          {task.targetName}
                        </p>
                        <p className="mt-1 truncate text-[12px] text-[#86909c]">{task.targetKind}</p>
                      </td>
                      <td className="px-2 py-3">
                        <p className="truncate text-[13px] text-[#3d3d3d]" title={task.mode}>
                          {task.mode}
                        </p>
                        <p className="mt-1 truncate text-[12px] text-[#86909c]">{task.modeDetail}</p>
                      </td>
                      <td className="px-2 py-3">
                        <span className="flex items-center gap-1 text-[13px] text-[#52c41a]">
                          <span className="inline-block h-[6px] w-[6px] rounded-full bg-[#52c41a]" />
                          {task.status}
                        </span>
                        <button
                          type="button"
                          className={`mt-1 flex items-center gap-1 text-[12px] ${BLUE} hover:underline`}
                        >
                          <Search size={11} strokeWidth={2} />
                          查看结果
                        </button>
                      </td>
                      <td className="px-2 py-3 text-[13px] text-[#3d3d3d]">{task.creator}</td>
                      <td className="px-2 py-3 text-[13px] text-[#3d3d3d]">{task.createdAt}</td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-x-2 whitespace-nowrap text-[13px]">
                          <RowLink>克隆</RowLink>
                          <RowLink>删除</RowLink>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-6 py-20 text-center text-[14px] text-[#86909c]">
                        暂无评估任务
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 底部：批量操作 + 分页 */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-[#86909c]">已选 {selected.length} 项</span>
                <button
                  type="button"
                  disabled={selected.length === 0}
                  className="flex h-8 items-center rounded-[2px] bg-[#166eff] px-3 text-[13px] text-white transition-colors hover:bg-[#0d5fe0] disabled:cursor-not-allowed disabled:bg-[#a3c4ff] disabled:hover:bg-[#a3c4ff]"
                >
                  批量删除
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <TablePagination
                  total={TOTAL}
                  page={page}
                  pageSize={pageSize}
                  pageSizeOptions={[...PAGE_SIZES]}
                  onChange={({ page: nextPage, pageSize: nextSize }) => {
                    setPageSize(nextSize)
                    setPage(nextPage)
                  }}
                />
                <div className="flex items-center gap-1 text-[13px] text-[#656565]">
                  跳至
                  <input
                    type="text"
                    inputMode="numeric"
                    defaultValue="1"
                    aria-label="跳至页码"
                    className="h-[28px] w-[40px] rounded-[2px] border border-[#dcdfe6] text-center text-[13px] text-[#3d3d3d] outline-none focus:border-[#166eff]"
                  />
                  页
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}