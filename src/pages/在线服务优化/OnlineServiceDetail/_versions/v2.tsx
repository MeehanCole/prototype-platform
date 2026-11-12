import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlatformHeader, SideNav } from '../../OnlineService/_shared'
import { DETAILS, DEFAULT_DETAIL, type ServiceDetail } from '../data'
import { DocPanel, DocProvider, FEATURES, NewTag } from '../feature-tags'

const USAGE_CARDS = [
  'Token总量',
  '服务调用总次数',
  'Token输入量',
  '服务调用成功次数',
  'Token输出量',
  '服务调用失败次数',
]

function EmptyIllustration() {
  return (
    <svg width="240" height="200" viewBox="0 0 240 200" fill="none" aria-hidden className="mx-auto">
      <circle cx="120" cy="88" r="52" stroke="#9EC3F5" strokeWidth="14" fill="none" />
      <path d="M60 60c-8-10-4-26 8-30" stroke="#B9D6F8" strokeWidth="8" strokeLinecap="round" />
      <path d="M180 60c8-10 4-26-8-30" stroke="#B9D6F8" strokeWidth="8" strokeLinecap="round" />
      <path d="M52 130c-14 4-22 18-14 30" stroke="#B9D6F8" strokeWidth="10" strokeLinecap="round" />
      <ellipse cx="120" cy="168" rx="70" ry="10" fill="#F5E9D6" />
      <circle cx="150" cy="66" r="13" fill="#F7C592" />
      <path d="M138 118c2-16 20-16 24 0" stroke="#E8833A" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M120 116c4-10 24-10 30 2l-8 6" stroke="#F7A34B" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M120 118v34M138 122v30" stroke="#4A4A55" strokeWidth="8" strokeLinecap="round" />
      <text x="176" y="60" fontSize="18" fill="#B9D6F8" fontStyle="italic">?</text>
      <text x="188" y="76" fontSize="12" fill="#CFE2FA" fontStyle="italic">?</text>
    </svg>
  )
}

function buildCurlDoc(modelName: string) {
  return [
    'curl -X POST "http://kgateway.10.4.13.17.nip.io/uat/compatible-mode/v1/chat/completions" -k \\',
    '-H "Content-Type: application/json" \\',
    '-H "Authorization: Bearer $API_KEY" \\',
    "-d '{",
    `        "model": "${modelName}",`,
    '        "messages": [',
    '            {',
    '                "role": "system",',
    '                "content": "你是一个AI智能聊天机器人"',
    '            },',
    '            {',
    '            "role": "user",',
    '            "content": "你好"',
    '            }',
    '        ],',
    '        "temperature": 0.7,',
    '        "top_p": 0.7,',
    '        "max_tokens": 50',
    "    }'",
  ]
}

export default function Page({ __showFeat = true }: { __showFeat?: boolean }) {
  const [docCode, setDocCode] = useState<string | null>(null)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const name = params.get('name') || '测试外部'
  const d: ServiceDetail = DETAILS[name] || DEFAULT_DETAIL
  const initTab = (params.get('tab') || 'config') as 'config' | 'usage' | 'api'
  const [tab, setTab] = useState<'config' | 'usage' | 'api'>(initTab)
  const [docLang, setDocLang] = useState('curl')
  const [docEnv, setDocEnv] = useState('Linux/MacOS')
  const [instances] = useState(d.instances)
  const routeOn = d.routeOn ?? true
  const routeMode = d.routeMode || '按权重分发'
  const isGrayscale = routeOn && (routeMode === '金丝雀发布' || routeMode === '蓝绿发布')
  const curlLines = buildCurlDoc(d.model)

  const row = 'flex items-start'
  const label = 'w-[180px] shrink-0 text-[15px] text-[#333] pt-[2px] flex items-center'

  const backendTypeV2 =
    d.backendType === '内部推理服务'
      ? '内部推理实例'
      : d.backendType === '外部推理服务'
        ? '外部推理实例'
        : d.backendType

  const fallbackTypeV2 =
    d.fallbackType === '内部推理服务'
      ? '内部推理实例'
      : d.fallbackType === '外部推理服务'
        ? '外部推理实例'
        : d.fallbackType

  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
      <div className="min-h-screen bg-white text-[#1f2329] [font-family:'PingFang_SC','Helvetica_Neue',Arial,sans-serif]">
        <PlatformHeader />
        <div className="flex">
          <SideNav />
          <main className="flex-1 min-w-0">
            {/* 返回栏 */}
            <div className="h-[66px] border-b border-[#f0f0f0] flex items-center pl-[42px]">
              <button
                aria-label="返回"
                onClick={() => navigate('/在线服务优化/onlineservice?v=v2')}
                className="cursor-pointer flex items-center"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#166EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M19 12H5M11 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="ml-[16px] text-[16px] text-[#1f2329]">在线服务详情</span>
            </div>

            <div className="px-[24px] py-[20px]">
              {/* 顶部概览 + 基础信息卡 */}
              <div className="rounded-[4px] border border-[#e8e8e8] px-[24px] py-[20px]">
                {/* 第一行：服务名称 + 状态 */}
                <div className="flex items-center justify-between pb-[20px] border-b border-[#f0f0f0]">
                  <div className="flex items-center gap-[12px]">
                    <span className="text-[18px] font-semibold text-[#1f2329]">{d.name}</span>
                    <span
                      className={`inline-flex h-[26px] items-center rounded px-[10px] text-[13px] text-white ${
                        d.published ? 'bg-[#67C23A]' : 'bg-[#909399]'
                      }`}
                    >
                      {d.published ? '已发布' : '未发布'}
                    </span>
                    <NewTag code="F-01" />
                  </div>
                </div>

                {/* 第二行：基础属性 3 列网格（对齐创建页基本信息字段） */}
                <div className="pt-[20px] grid grid-cols-3 gap-x-[40px] gap-y-[18px]">
                  <div className="flex items-center gap-2">
                    <span className="w-[112px] shrink-0 text-[14px] text-[#8c8c8c]">调用模型名</span>
                    <span className="text-[14px] text-[#1f2329]">{d.model}</span>
                    <NewTag code="F-02" />
                  </div>
                  <div className="flex items-center">
                    <span className="w-[112px] shrink-0 text-[14px] text-[#8c8c8c]">发布类型</span>
                    <span
                      className={`inline-flex h-[24px] items-center rounded px-[8px] text-[12px] ${
                        d.publishType === '公开发布'
                          ? 'bg-[#EEF5FF] text-[#166EFF] border border-[#D4E4FF]'
                          : 'bg-[#F0F9EB] text-[#67C23A] border border-[#E1F3D8]'
                      }`}
                    >
                      {d.publishType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-[112px] shrink-0 text-[14px] text-[#8c8c8c]">后端推理类型</span>
                    <span className="inline-flex h-[24px] items-center rounded bg-[#F5F7FA] border border-[#E4E7ED] px-[8px] text-[12px] text-[#606266]">
                      {backendTypeV2}
                    </span>
                    <NewTag code="F-03" />
                  </div>
                  <div className="flex items-start">
                    <span className="w-[112px] shrink-0 text-[14px] text-[#8c8c8c] leading-[24px]">后端推理实例</span>
                    <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[6px]">
                      {d.instances.map((ins, i) => (
                        <div key={i} className="inline-flex items-center gap-[6px]">
                          <span className={`inline-block h-[10px] w-[10px] rounded-full ${ins.running ? 'bg-[#67C23A]' : 'bg-[#F56C6C]'}`} />
                          <span className="text-[14px] text-[#1f2329]">{ins.label}</span>
                        </div>
                      ))}
                      <NewTag code="F-04" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="w-[112px] shrink-0 text-[14px] text-[#8c8c8c]">创建时间</span>
                    <span className="text-[14px] text-[#1f2329]">{d.createdAt}</span>
                  </div>
                  {d.publishType === '公开发布' && backendTypeV2 === '内部推理实例' && (
                    <div className="flex items-center">
                      <span className="w-[112px] shrink-0 text-[14px] text-[#8c8c8c]">关联模型</span>
                      <span className="text-[14px] text-[#1f2329]">{d.associatedModel || d.model}</span>
                    </div>
                  )}
                </div>

                {/* 操作按钮：左下角 */}
                <div className="mt-[24px] flex items-center gap-[12px]">
                  {d.published ? (
                    <button className="h-[36px] px-[20px] rounded border border-[#d9d9d9] bg-white text-[14px] text-[#333] hover:border-[#166EFF] hover:text-[#166EFF] cursor-pointer">
                      停止发布
                    </button>
                  ) : (
                    <button className="h-[36px] px-[20px] rounded border border-[#d9d9d9] bg-white text-[14px] text-[#333] hover:border-[#166EFF] hover:text-[#166EFF] cursor-pointer">
                      发布
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/在线服务优化/onlineservicecreate?name=${encodeURIComponent(d.name)}&v=v2`)}
                    className="h-[36px] px-[20px] rounded border border-[#d9d9d9] bg-white text-[14px] text-[#333] hover:border-[#166EFF] hover:text-[#166EFF] cursor-pointer"
                  >
                    编辑
                  </button>
                  <button className="h-[36px] px-[20px] rounded border border-[#d9d9d9] bg-white text-[14px] text-[#333] hover:border-[#F5222D] hover:text-[#F5222D] cursor-pointer">
                    删除
                  </button>
                  <button
                    className="h-[36px] w-[44px] rounded border border-[#d9d9d9] bg-white flex items-center justify-center hover:border-[#166EFF] cursor-pointer"
                    aria-label="刷新"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                      <path d="M16 10a6 6 0 1 1-1.8-4.3" />
                      <path d="M16 3.5v3.3h-3.3" />
                    </svg>
                  </button>
                </div>
              </div>


              {/* Tab bar */}
              <div className="mt-[20px] rounded-[4px] bg-[#F5F7FB] flex items-stretch">
                {(
                  [
                    ['config', '服务配置'],
                    ['usage', '用量统计'],
                    ['api', 'API 文档'],
                  ] as const
                ).map(([k, t]) => (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className={`h-[50px] px-[34px] text-[15px] cursor-pointer ${
                      tab === k ? 'bg-[#166EFF] text-white' : 'text-[#333]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* 服务配置（纯策略配置，基础信息已上移到顶部概览框，严格对齐创建/编辑页字段名与联动规则） */}
              {tab === 'config' && (
                <div className="rounded-b-[4px] border border-t-0 border-[#e8e8e8] px-[50px] py-[30px]">
                  {/* 缓存加速 */}
                  <div className="text-[16px] font-semibold text-[#1f2329]">缓存加速</div>
                  <div className="mt-[24px] flex flex-col gap-[24px]">
                    <div className={row}>
                      <span className={label}>是否开启</span>
                      <span className="text-[15px] text-[#333]">{d.cacheOn ? '是' : '否'}</span>
                    </div>
                    {d.cacheOn && (
                      <div className={row}>
                        <span className={label}>缓存时间</span>
                        <span className="text-[15px] text-[#333]">{d.cacheTime}</span>
                      </div>
                    )}
                  </div>

                  <div className="my-[30px] h-px bg-[#f0f0f0]" />

                  {/* 流量分发策略 */}
                  <div className="flex items-center gap-[12px]">
                    <span className="text-[16px] font-semibold text-[#1f2329]">流量分发策略</span>
                    <NewTag code="F-05" />
                  </div>

                  <div className="mt-[24px] flex flex-col gap-[24px]">
                    <div className={row}>
                      <span className={label}>是否开启</span>
                      <span className="text-[15px] text-[#333]">{routeOn ? '是' : '否'}</span>
                    </div>

                    {routeOn && (
                      <>
                        <div className={row}>
                          <span className={label}>策略类型</span>
                          <span className="text-[15px] text-[#333]">
                            {isGrayscale ? '灰度发布策略' : '常规路由策略'}
                          </span>
                        </div>

                        <div className={row}>
                          <span className={label}>分发方式</span>
                          <span className="text-[15px] text-[#333]">{routeMode}</span>
                        </div>

                        <div className={row}>
                          <span className={label}>权重配置</span>
                          <div className="flex-1">
                            {routeMode === '蓝绿发布' ? (
                              <div className="flex flex-col gap-[10px]">
                                {instances.map((ins, idx) => {
                                  const isActive = (ins.weight ?? (idx === 0 ? 100 : 0)) > 0
                                  return (
                                    <div
                                      key={ins.label}
                                      className={`flex h-[40px] w-[420px] items-center rounded-[4px] border px-3 ${
                                        isActive
                                          ? 'border-[#166EFF] bg-[#f0f6ff]'
                                          : 'border-[#e4e6eb] bg-white'
                                      }`}
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke={isActive ? '#166EFF' : '#666'}
                                        strokeWidth="1.5"
                                        aria-hidden
                                        className="shrink-0"
                                      >
                                        <path d="m10 3 7 3.5L10 10 3 6.5Z" />
                                        <path d="m3 10.5 7 3.5 7-3.5" />
                                        <path d="m3 14 7 3.5 7-3.5" />
                                      </svg>
                                      <span
                                        className={`ml-2 flex-1 text-left text-[15px] truncate pr-2 ${
                                          isActive ? 'text-[#166EFF] font-medium' : 'text-[#333]'
                                        }`}
                                        title={ins.label}
                                      >
                                        {ins.label}
                                      </span>
                                      <span
                                        className={`shrink-0 rounded-[10px] px-2 py-[1px] text-[12px] leading-[18px] ${
                                          isActive
                                            ? 'bg-[#e6f4ea] text-[#16a34a]'
                                            : 'bg-[#f2f3f5] text-[#8c8c8c]'
                                        }`}
                                      >
                                        {isActive ? '当前生效 (100%)' : '待命 (0%)'}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-[20px]">
                                {instances.map((ins) => (
                                  <div
                                    key={ins.label}
                                    className="w-[320px] rounded-[4px] border border-[#e7e7e7] px-[24px] py-[18px]"
                                  >
                                    <div className="flex items-center gap-[10px] min-w-0">
                                      <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="#1f2329"
                                        strokeWidth="1.4"
                                        aria-hidden
                                        className="shrink-0"
                                      >
                                        <path d="m10 3 7 3.5L10 10 3 6.5Z" />
                                        <path d="m3 10.5 7 3.5 7-3.5" />
                                        <path d="m3 14 7 3.5 7-3.5" />
                                      </svg>
                                      <span className="text-[15px] text-[#333] truncate" title={ins.label}>
                                        {ins.label}
                                      </span>
                                    </div>
                                    <div className="mt-[12px] text-[15px] text-[#333]">
                                      权重：<span className="ml-2">{ins.weight ?? 0}</span> %
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="my-[30px] h-px bg-[#f0f0f0]" />

                  {/* 高可用与安全 */}
                  {/* 模型Fallback（常规路由与灰度发布策略下均展示） */}
                  {(
                    <>
                      <div className="text-[16px] font-semibold text-[#1f2329]">模型Fallback</div>
                      <div className="mt-[24px] flex flex-col gap-[24px]">
                        <div className={row}>
                          <span className={label}>是否开启</span>
                          <span className="text-[15px] text-[#333]">{d.fallbackOn ? '是' : '否'}</span>
                        </div>
                        {d.fallbackOn && (
                          <div className={row}>
                            <span className={label}>兜底推理实例</span>
                            <span className="flex items-center gap-[10px]">
                              <span className="inline-flex h-[26px] items-center rounded bg-[#EAF3FF] px-[9px] text-[14px] text-[#166EFF]">
                                {fallbackTypeV2}
                              </span>
                              <span className="text-[15px] text-[#333]">{d.fallbackModels.join('、')}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="my-[30px] h-px bg-[#f0f0f0]" />
                    </>
                  )}

                  {/* 实例限流 */}
                  <div className="text-[16px] font-semibold text-[#1f2329]">实例限流</div>
                  <div className="mt-[24px] flex flex-col gap-[24px]">
                    <div className={row}>
                      <span className={label}>是否开启</span>
                      <span className="text-[15px] text-[#333]">{d.rpmOn ? '是' : '否'}</span>
                    </div>
                    {d.rpmOn && d.rpm && (
                      <div className={row}>
                        <span className={label}>请求频次上限</span>
                        <span className="text-[15px] text-[#333]">
                          {d.rpm.includes('RPM') || d.rpm.includes('次') ? d.rpm : `${d.rpm} 次 / 分钟`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="my-[30px] h-px bg-[#f0f0f0]" />

                  {/* 请求超时时间 */}
                  <div className="text-[16px] font-semibold text-[#1f2329]">请求超时时间</div>
                  <div className="mt-[24px] pb-[10px]">
                    <div className={row}>
                      <span className={label}>请求超时时间</span>
                      <span className="text-[15px] text-[#333]">{d.timeout}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 用量统计 */}
              {tab === 'usage' && (
                <div className="rounded-b-[4px] border border-t-0 border-[#e8e8e8] px-[24px] py-[24px]">
                  <div className="flex items-center justify-end gap-[16px]">
                    <span className="inline-flex h-[42px] items-center gap-[10px] rounded border border-[#d9d9d9] px-[16px] text-[14px] text-[#333]">
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#999" strokeWidth="1.2" aria-hidden>
                        <circle cx="8" cy="8" r="6.2" />
                        <path d="M8 4.5V8l2.4 1.6" strokeLinecap="round" />
                      </svg>
                      2026-11-03 16:59:04
                      <span className="text-[#999]">至</span>
                      2026-11-04 16:59:04
                    </span>
                    <button
                      className="h-[42px] w-[52px] rounded border border-[#d9d9d9] bg-white flex items-center justify-center cursor-pointer"
                      aria-label="刷新"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                        <path d="M16 10a6 6 0 1 1-1.8-4.3" />
                        <path d="M16 3.5v3.3h-3.3" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-[20px] grid grid-cols-2 gap-x-[24px] gap-y-[24px]">
                    {USAGE_CARDS.map((t) => (
                      <div key={t} className="rounded-[4px] bg-[#F8FAFB] px-[24px] py-[20px] h-[388px]">
                        <div className="text-[15px] font-semibold text-[#1f2329]">{t}</div>
                        <div className="flex h-[300px] items-center justify-center">
                          <EmptyIllustration />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* API 文档 */}
              {tab === 'api' && (
                <div className="rounded-b-[4px] border border-t-0 border-[#e8e8e8] px-[36px] py-[30px]">
                  <div className="text-[16px] text-[#333]">1. 申请模型服务访问权限</div>
                  <p className="mt-[18px] text-[15px] text-[#333]">
                    请在 <a className="text-[#166EFF] cursor-pointer">API Key管理页面</a>
                    ，创建 API Key，并点击服务绑定，绑定成功后，继续以下操作
                  </p>

                  <div className="mt-[30px] text-[16px] text-[#333]">2. 选择 API Key</div>
                  <p className="mt-[18px] text-[15px] text-[#333]">
                    请按照以下方式设置 API Key作为环境变量，其中"YOUR_API_KEY"需要替换为您在平台创建的 API Key
                  </p>
                  <div className="mt-[16px] flex items-center">
                    {['Linux/MacOS', 'CMD', 'PowerShell'].map((t, i) => (
                      <button
                        key={t}
                        onClick={() => setDocEnv(t)}
                        className={`h-[37px] px-[18px] text-[15px] cursor-pointer border border-[#e5e5e5] ${
                          i > 0 ? '-ml-px' : ''
                        } ${
                          docEnv === t
                            ? 'relative z-[1] bg-[#166EFF] border-[#166EFF] text-white rounded-[4px]'
                            : 'bg-white text-[#333]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="mt-[20px] h-[56px] rounded-[4px] bg-[#F6F6F6] flex items-center px-[24px]">
                    <span className="text-[14px] text-[#333]">export API_KEY="YOUR_API_KEY"</span>
                  </div>

                  <div className="mt-[30px] flex items-center gap-[10px]">
                    <span className="text-[16px] text-[#333]">3.选择示例代码</span>
                    <a className="text-[15px] text-[#166EFF] cursor-pointer">编辑</a>
                  </div>
                  <div className="mt-[16px] flex items-center">
                    {['curl', 'python'].map((t, i) => (
                      <button
                        key={t}
                        onClick={() => setDocLang(t)}
                        className={`h-[37px] px-[20px] text-[15px] cursor-pointer border border-[#e5e5e5] ${
                          i > 0 ? '-ml-px' : ''
                        } ${
                          docLang === t
                            ? 'relative z-[1] bg-[#166EFF] border-[#166EFF] text-white rounded-[4px]'
                            : 'bg-white text-[#333]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="mt-[16px] rounded-[4px] bg-[#F6F6F6] px-[24px] py-[18px]">
                    {curlLines.map((line, i) => (
                      <div key={i} className="h-[25px] text-[14px] leading-[25px] text-[#333] whitespace-pre">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
        <DocPanel code={docCode} onClose={() => setDocCode(null)} />
      </div>
    </DocProvider>
  )
}
