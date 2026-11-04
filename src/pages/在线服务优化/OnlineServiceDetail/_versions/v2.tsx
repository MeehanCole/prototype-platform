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

const CURL_DOC = [
  'curl -X POST "http://kgateway.10.4.13.17.nip.io/uat/compatible-mode/v1/chat/completions" -k \\',
  '-H "Content-Type: application/json" \\',
  '-H "Authorization: Bearer $API_KEY" \\',
  "-d '{",
  '        "model": "test22",',
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
              <span className="ml-[16px] text-[16px] text-[#1f2329]">{d.name}</span>
            </div>

            <div className="px-[24px] py-[20px]">
              {/* 状态摘要卡 */}
              <div className="rounded-[4px] border border-[#e8e8e8] px-[24px] py-[20px]">
                <div className="flex items-center">
                  <span className="text-[15px] text-[#333]">状态：</span>
                  <span
                    className={`ml-2 inline-flex h-[26px] items-center rounded px-[10px] text-[14px] text-white ${
                      d.published ? 'bg-[#67C23A]' : 'bg-[#909399]'
                    }`}
                  >
                    {d.published ? '已发布' : '未发布'}
                  </span>
                  <span className="ml-auto text-[15px] text-[#333]">
                    创建时间：<span className="ml-2">{d.createdAt}</span>
                  </span>
                </div>
                <div className="mt-[20px] flex items-center gap-[16px]">
                  {d.published ? (
                    <button className="h-[38px] px-[22px] rounded border border-[#d9d9d9] bg-white text-[15px] text-[#333] cursor-pointer">
                      停止发布
                    </button>
                  ) : (
                    <button className="h-[38px] px-[22px] rounded border border-[#d9d9d9] bg-white text-[15px] text-[#333] cursor-pointer">
                      发布
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/在线服务优化/onlineservicecreate?name=${encodeURIComponent(d.name)}&v=v2`)}
                    className="h-[38px] px-[22px] rounded border border-[#d9d9d9] bg-white text-[15px] text-[#333] cursor-pointer"
                  >
                    编辑
                  </button>
                  <button className="h-[38px] px-[22px] rounded border border-[#d9d9d9] bg-white text-[15px] text-[#333] cursor-pointer">
                    删除
                  </button>
                  <button
                    className="h-[38px] w-[52px] rounded border border-[#d9d9d9] bg-white flex items-center justify-center cursor-pointer"
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

              {/* 服务配置 */}
              {tab === 'config' && (
                <div className="rounded-b-[4px] border border-t-0 border-[#e8e8e8] px-[50px] py-[30px]">
                  {/* 基本信息 */}
                  <div className="text-[16px] font-semibold text-[#1f2329]">基本信息</div>
                  <div className="mt-[24px] flex flex-col gap-[24px]">
                    <div className={row}>
                      <span className={label}>
                        服务名称
                        <NewTag code="F-01" />
                      </span>
                      <span className="text-[15px] text-[#333]">{d.name}</span>
                    </div>
                    <div className={row}>
                      <span className={label}>
                        调用模型名
                        <NewTag code="F-02" />
                      </span>
                      <span className="text-[15px] text-[#333]">{d.model}</span>
                    </div>
                    <div className={row}>
                      <span className={label}>发布类型</span>
                      <span className="inline-flex h-[26px] items-center rounded bg-[#F0F9EB] px-[9px] text-[14px] text-[#67C23A]">
                        {d.publishType}
                      </span>
                    </div>
                    <div className={row}>
                      <span className={label}>
                        后端推理类型
                        <NewTag code="F-03" />
                      </span>
                      <span className="inline-flex h-[26px] items-center rounded bg-[#EAF3FF] px-[9px] text-[14px] text-[#166EFF]">
                        {backendTypeV2}
                      </span>
                    </div>
                    <div className={row}>
                      <span className={label}>
                        后端推理实例
                        <NewTag code="F-04" />
                      </span>
                      <div className="flex flex-wrap items-center gap-[12px]">
                        {d.instances.map((ins) => (
                          <span key={ins.label} className="inline-flex items-center gap-[6px] text-[15px] text-[#333]">
                            <span>{ins.label}</span>
                            <span className="inline-flex h-[22px] items-center rounded bg-[#67C23A] px-[8px] text-[12px] text-white">
                              正常
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="my-[30px] h-px bg-[#f0f0f0]" />

                  {/* 路由策略 */}
                  <div className="text-[16px] font-semibold text-[#1f2329]">路由策略</div>
                  <div className="mt-[24px] mb-[30px] flex items-start">
                    <span className="w-[110px] shrink-0 text-[15px] text-[#333] pt-[10px]">模型权重</span>
                    <div className="flex gap-[22px]">
                      {d.instances.map((ins) => (
                        <div key={ins.label} className="w-[326px] rounded-[4px] border border-[#e7e7e7] px-[24px] py-[18px]">
                          <div className="flex items-center gap-[10px]">
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#1f2329" strokeWidth="1.4" aria-hidden>
                              <path d="m10 3 7 3.5L10 10 3 6.5Z" />
                              <path d="m3 10.5 7 3.5 7-3.5" />
                              <path d="m3 14 7 3.5 7-3.5" />
                            </svg>
                            <span className="text-[15px] text-[#333]">{ins.label}</span>
                          </div>
                          <div className="mt-[12px] text-[15px] text-[#333]">
                            权重：<span className="ml-2">{ins.weight ?? 0}</span> %
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="my-[30px] h-px bg-[#f0f0f0]" />

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

                  {/* 模型Fallback */}
                  <div className="text-[16px] font-semibold text-[#1f2329]">模型Fallback</div>
                  <div className="mt-[24px] flex flex-col gap-[24px]">
                    <div className={row}>
                      <span className={label}>是否开启</span>
                      <span className="text-[15px] text-[#333]">{d.fallbackOn ? '是' : '否'}</span>
                    </div>
                    {d.fallbackOn && (
                      <div className={row}>
                        <span className={label}>备用模型</span>
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

                  {/* 全局限流 */}
                  <div className="text-[16px] font-semibold text-[#1f2329]">全局限流</div>
                  <div className="mt-[24px]">
                    <div className={row}>
                      <span className={label}>是否开启</span>
                      <span className="text-[15px] text-[#333]">{d.rpmOn ? '是' : '否'}</span>
                    </div>
                  </div>

                  <div className="my-[30px] h-px bg-[#f0f0f0]" />

                  {/* 请求超时 */}
                  <div className="text-[16px] font-semibold text-[#1f2329]">请求超时</div>
                  <div className="mt-[24px] pb-[10px]">
                    <div className={row}>
                      <span className={label}>超时时间</span>
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
                    {CURL_DOC.map((line, i) => (
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
