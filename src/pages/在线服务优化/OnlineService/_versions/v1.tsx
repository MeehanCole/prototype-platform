import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DocPanel, DocProvider, FEATURES } from '../feature-tags'
import { PlatformHeader, SideNav } from '../_shared'

/* Shared column ratios for header and data rows, measured from the screenshot (fluid fr units) */
const GRID_COLS = 'grid grid-cols-[274fr_269fr_112fr_124fr_214fr_179fr_157fr_359fr_247fr_304fr_210fr]'

type Instance = { label: string; red?: boolean }
type ServiceRow = {
  name: string
  model: string
  published: boolean
  route: string
  cache: string
  backend: string
  instances: Instance[]
}

const SERVICE_ROWS: ServiceRow[] = [
  { name: '测试外部2', model: 'test22', published: true, route: '–', cache: '未开启', backend: '外部推理服务', instances: [{ label: '阿里不完整路径' }] },
  { name: '测试外部服务', model: 'test', published: true, route: '–', cache: '未开启', backend: '外部推理服务', instances: [{ label: '阿里百炼服务' }] },
  { name: 'gge', model: 'de', published: false, route: '–', cache: '未开启', backend: '内部推理服务', instances: [{ label: 'kt服务', red: true }] },
  {
    name: '测试外部',
    model: 'test',
    published: false,
    route: '按权重分发',
    cache: '已开启',
    backend: '外部推理服务',
    instances: [{ label: 'demo-18080' }, { label: 'demo-18081' }, { label: 'demo-18082' }],
  },
  { name: '验证缓存设置', model: '放入', published: false, route: '–', cache: '已开启', backend: '内部推理服务', instances: [{ label: 'test', red: true }] },
  { name: '1个服务', model: 'aa', published: false, route: '–', cache: '未开启', backend: '内部推理服务', instances: [{ label: 'test', red: true }] },
]

function SelectBox({
  text,
  widthClass,
  textClass = 'text-[13px]',
  chevron = 10,
}: {
  text: string
  widthClass: string
  textClass?: string
  chevron?: number
}) {
  return (
    <span
      className={`h-[36px] inline-flex items-center justify-between rounded border border-[#d9d9d9] bg-white px-3 ${textClass} text-[#bfbfbf] cursor-pointer ${widthClass}`}
    >
      {text}
      <svg width={chevron} height={chevron} viewBox="0 0 10 10" fill="none" aria-hidden>
        <path d="m2 3.5 3 3 3-3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function SearchCard() {
  return (
    <div className="h-[75px] shrink-0 rounded-lg border border-[#e5e5e5] bg-white flex items-center pl-[17px] pr-6">
      <div className="flex items-center">
        <span className="text-[15.5px] font-semibold text-[#1f2329]">策略名称</span>
        <input
          placeholder="请输入策略名称"
          className="ml-[39px] h-[36px] w-[224px] rounded border border-[#d9d9d9] px-3 text-[14.5px] placeholder:text-[#bfbfbf] outline-none focus:border-[#166EFF]"
        />
      </div>
      <div className="ml-6 flex items-center">
        <span className="text-[15.5px] font-semibold text-[#1f2329]">模型名称</span>
        <SelectBox text="请选择模型" widthClass="ml-[39px] w-[246px]" textClass="text-[14.5px]" chevron={12} />
      </div>
      <div className="ml-6 flex items-center">
        <span className="text-[15.5px] font-semibold text-[#1f2329]">发布类型</span>
        <SelectBox text="请选择发布类型" widthClass="ml-[39px] w-[224px]" textClass="text-[14.5px]" chevron={12} />
      </div>
      <div className="ml-6 flex items-center gap-[14px]">
        <button className="h-[36px] w-[68px] rounded bg-[#166EFF] text-[14.5px] text-white cursor-pointer">查询</button>
        <button className="h-[36px] w-[68px] rounded border border-[#d9d9d9] bg-white text-[14.5px] text-[#333] cursor-pointer">
          重置
        </button>
      </div>
    </div>
  )
}

function TableCard() {
  const navigate = useNavigate()
  return (
    <div className="flex-1 min-h-0 rounded-lg border border-[#e8e8e8] bg-white flex flex-col">
      {/* Toolbar: create + refresh */}
      <div className="h-[70px] shrink-0 flex items-center pl-[18px] pr-[24px]">
        <button
          onClick={() => navigate('/在线服务优化/onlineservicecreate?v=v1')}
          className="h-[35px] pl-[18px] pr-[20px] flex items-center gap-[6px] rounded bg-[#166EFF] text-[15px] text-white cursor-pointer"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <path d="M11 7.6v6.8M7.6 11h6.8" />
          </svg>
          创建在线服务
        </button>
        <button
          className="ml-auto w-[51px] h-[34px] flex items-center justify-center rounded border border-[#d9d9d9] bg-white cursor-pointer"
          aria-label="刷新"
        >
          <svg width="18" height="18" viewBox="0 0 21 21" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M16.5 10.5a6 6 0 1 1-1.8-4.3" />
            <path d="M16.5 3.5v3.3h-3.3" />
          </svg>
        </button>
      </div>

      {/* Header band + rows share a horizontally scrollable area */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="min-w-[2000px]">
          <div className="mx-[18px] h-[38px] rounded-[4px] bg-[#F3F5F7] border-t border-[#f6f6f6] flex items-center pl-3.5 pr-3 text-[15px] font-medium text-[#4a5475]">
            <div className={`w-full ${GRID_COLS} items-center`}>
              {['策略名称', '模型名称', '状态', '发布类型', '路由策略', '缓存加速', '后端服务类型', '后端服务实例', '限流策略', '创建时间', '操作'].map(
                (h, i) => (
                  <div key={h} className={i === 10 ? 'sticky right-0 z-10 bg-[#F3F5F7] pl-3' : undefined}>
                    {h}
                  </div>
                ),
              )}
            </div>
          </div>

          {SERVICE_ROWS.map((row) => (
            <div key={row.name} className="shrink-0 border-b border-[#f6f6f6] flex items-center py-[8px] pl-[31px] pr-[18px]">
              <div className={`w-full ${GRID_COLS} items-center text-[15px]`}>
                <div>
                  <a
                    onClick={() => navigate(`/在线服务优化/onlineservicedetail?name=${encodeURIComponent(row.name)}&v=v1`)}
                    className="text-[#166EFF] cursor-pointer"
                  >
                    {row.name}
                  </a>
                </div>
                <div className="text-[#333]">{row.model}</div>
                <div>
                  <span
                    className={`inline-flex h-[26px] items-center rounded px-[9px] text-[14px] text-white ${row.published ? 'bg-[#67C23A]' : 'bg-[#909399]'}`}
                  >
                    {row.published ? '已发布' : '未发布'}
                  </span>
                </div>
                <div>
                  <span className="inline-flex h-[26px] items-center rounded bg-[#F0F9EB] px-[9px] text-[14px] text-[#67C23A]">私有发布</span>
                </div>
                <div className={row.route === '–' ? 'text-[#949494]' : 'text-[#333]'}>{row.route}</div>
                <div className="text-[#333]">{row.cache}</div>
                <div className="text-[#333]">{row.backend}</div>
                <div className="flex flex-col">
                  {row.instances.map((ins) => (
                    <div key={ins.label} className="h-[29px] flex items-center gap-1.5">
                      <span className={`w-[11px] h-[11px] rounded-full block ${ins.red ? 'bg-[#F82709]' : 'bg-[#52C18E]'}`} />
                      <a className="text-[#166EFF] cursor-pointer">{ins.label}</a>
                    </div>
                  ))}
                </div>
                <div className="text-[#949494]">–</div>
                <div className="text-[#949494]">–</div>
                <div className="sticky right-0 z-10 bg-white pl-3 flex items-center gap-[22px] text-[15px] whitespace-nowrap">
                  <a
                    onClick={() => navigate(`/在线服务优化/onlineservicecreate?name=${encodeURIComponent(row.name)}&v=v1`)}
                    className="text-[#166EFF] cursor-pointer"
                  >
                    编辑
                  </a>
                  <a className="text-[#166EFF] cursor-pointer">{row.published ? '停止发布' : '发布'}</a>
                  <a className="text-[#F5222D] cursor-pointer">删除</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="shrink-0 border-t border-[#f6f6f6] h-[78px] flex items-start pt-[12px] justify-end pl-[18px] pr-[28px]">
        <span className="h-[36px] flex items-center text-[14.5px] text-[#656565] mr-5">共 6 条</span>
        <SelectBox text="10条/页" widthClass="w-[143px]" textClass="text-[14.5px]" />
        <div className="ml-[19px] flex items-center gap-[10px]">
          <button className="w-[35px] h-[35px] flex items-center justify-center rounded bg-[#EEEEEE] cursor-pointer" aria-label="上一页">
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M6.5 1.5 3 5l3.5 3.5" stroke="#595959" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="w-[36px] h-[35px] rounded-[6px] bg-[#166EFF] text-[14.5px] text-white cursor-pointer">1</button>
          <button className="w-[35px] h-[35px] flex items-center justify-center rounded bg-[#EEEEEE] cursor-pointer" aria-label="下一页">
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M3.5 1.5 7 5 3.5 8.5" stroke="#595959" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <span className="ml-[14px] h-[36px] flex items-center text-[14.5px] text-[#656565]">前往</span>
        <input
          defaultValue="1"
          className="ml-[10px] h-[32px] w-[62px] rounded border border-[#d9d9d9] text-center text-[14.5px] text-[#333] outline-none"
        />
        <span className="ml-[9px] h-[36px] flex items-center text-[14.5px] text-[#656565]">页</span>
      </div>
    </div>
  )
}

export default function Page({ __showFeat = false }: { __showFeat?: boolean }) {
  const [docCode, setDocCode] = useState<string | null>(null)
  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
      <div className="relative h-[calc((100vh-57px)/0.9)] w-[calc(100%/0.9)] origin-top-left scale-[0.9] flex flex-col overflow-hidden bg-white text-[#1f2329] [font-family:'PingFang_SC','Helvetica_Neue',Arial,sans-serif]">
        <PlatformHeader />
        <div className="flex-1 min-h-0 flex">
          <SideNav />
          {/* Main content */}
          <main className="flex-1 min-w-0 flex flex-col pl-[6px] pr-[29px] pt-4 pb-[9px] overflow-hidden">
            <div className="shrink-0">
              <h1 className="text-[20px] font-bold text-[#000] leading-[30px]">在线服务</h1>
              <p className="text-[13px] text-[#6c6c6c]">
                管理对外提供访问的 API 接口，配置流量分发策略、安全限流及端点状态。
              </p>
            </div>
            <div className="mt-[22px]">
              <SearchCard />
            </div>
            <div className="mt-[23px] flex-1 min-h-0 flex flex-col">
              <TableCard />
            </div>
          </main>
        </div>

        {/* Floating AI assistant button, right edge */}
        <button
          className="absolute top-[920px] right-0 h-[44px] w-[26px] rounded-l-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)] border border-[#e6e9f0] border-r-0 flex items-center justify-end pr-[3px] cursor-pointer"
          aria-label="AI 助手"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <circle cx="9" cy="9" r="7" fill="#eaf1ff" />
            <circle cx="9" cy="9" r="7" fill="none" stroke="#166EFF" strokeWidth="1" />
            <circle cx="7.2" cy="7.2" r="1.4" fill="#166EFF" />
            <circle cx="11.4" cy="10.6" r="2.2" fill="#166EFF" />
          </svg>
        </button>
      </div>
      <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}
