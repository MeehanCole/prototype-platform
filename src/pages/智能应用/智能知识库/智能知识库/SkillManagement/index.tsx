import { useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Cloud, Download, FileCode2, Info, Play, Square, Trash2, Upload, X } from 'lucide-react'
import {
  EnabledBadge,
  PrimaryButton,
  SettingsModal,
  SettingsPageHeader,
  SettingsPagination,
  SettingsSearch,
  SettingsToolbar,
} from '../SettingsUI'

interface SkillItem {
  id: string
  name: string
  description: string
  updatedAt: string
  enabled: boolean
  content: string
}

const USER_SKILLS: SkillItem[] = [
  {
    id: 'search-product-docs',
    name: 'search-product-docs',
    description:
      '检索并讲解平台官方操作手册。适用于功能说明、页面入口、操作方法、字段含义及使用限制等问题；实时资源状态查询、执行操作和普通对话不必先检索手册。',
    updatedAt: '2026-11-12',
    enabled: true,
    content:
      '# search-product-docs\n\n检索并讲解平台官方操作手册，返回对应功能说明、页面入口、操作方法、字段含义与使用限制。',
  },
]

const BUILTIN_SKILLS: SkillItem[] = [
  {
    id: 'guided-clarification',
    name: 'guided-clarification',
    description:
      'Before asking the user for missing task information or a decision, clarify one key issue or a small group of independently answerable questions at a time, including a single parameter, resource choice, requirements, design trade-offs, or planning. Use existing context and evidence first; stop clarifying when the task is clear.',
    updatedAt: '2026-11-14',
    enabled: true,
    content: '',
  },
  {
    id: 'platform-alerting',
    name: 'platform-alerting',
    description:
      '管理告警中心的指标、日志和事件告警规则，查询实时/历史告警与站内信，处理通知静默及恢复；发送渠道和模板配置使用通知业务 Skill。',
    updatedAt: '2026-11-14',
    enabled: true,
    content: '',
  },
  {
    id: 'platform-assets',
    name: 'platform-assets',
    description:
      '管理 CAP 资产台账、资产借用与归还、裸金属租赁关联和资产概览；解释字段、状态、统计口径及业务 API 用法。',
    updatedAt: '2026-11-14',
    enabled: true,
    content: '',
  },
  {
    id: 'platform-autoscaling',
    name: 'platform-autoscaling',
    description:
      '配置 Kubegien KEDA ScaledObject、触发器认证、原生 HPA/VPA，处理指标、关联 Secret、控制器状态及回收；不替代资源池伸缩。',
    updatedAt: '2026-11-14',
    enabled: true,
    content: '',
  },
  {
    id: 'platform-backup-restore',
    name: 'platform-backup-restore',
    description:
      '使用 Kubegien Velero 仓库、备份任务、备份计划、恢复任务及异步数据回收；区分备份保存、恢复记录与实际业务恢复。',
    updatedAt: '2026-11-14',
    enabled: true,
    content: '',
  },
  {
    id: 'platform-bare-metal',
    name: 'platform-bare-metal',
    description:
      '纳管 CAP 裸金属设备、分配项目裸金属实例、检查 BMC/SSH 连接、电源操作、修改凭据、查看规格指标与到期或提前回收时使用；区分物理设备、项目实例与分配记录。',
    updatedAt: '2026-11-14',
    enabled: true,
    content: '',
  },
]

const EXTRA_BUILTIN: SkillItem[] = [
  ['platform-billing', '查询账单明细、费用构成与计费周期，解释资源规格、折扣和欠费状态；不直接修改订单。'],
  ['platform-container', '管理容器应用、部署副本、环境变量与运行事件，定位镜像拉取、启动和健康检查问题。'],
  ['platform-cost', '分析项目与租户成本趋势，按资源类型拆分费用并给出闲置资源识别与优化建议。'],
  ['platform-database', '管理数据库实例、账号、备份与连接信息，排查慢查询、连接数和存储容量问题。'],
  ['platform-dns', '维护私有域名、解析记录与上游转发规则，检查解析生效状态和记录冲突。'],
  ['platform-elasticsearch', '管理 Elasticsearch 集群、索引与分片，执行检索和容量诊断并给出副本调整建议。'],
  ['platform-gateway', '配置应用路由、网关策略与证书，排查域名、路径转发和后端服务不可达问题。'],
  ['platform-gpu', '查询 GPU 型号、显存、利用率与温度，定位设备异常、驱动问题和资源碎片。'],
  ['platform-image', '管理镜像仓库、镜像预热与同步任务，检查镜像签名、拉取凭据和分发状态。'],
  ['platform-kubernetes', '管理 Kubernetes 集群、命名空间与节点，查询工作负载状态并定位调度异常。'],
  ['platform-kafka', '管理 Kafka 实例、Topic、消费组与分区，排查堆积、副本同步和连接认证问题。'],
  ['platform-loadbalancer', '配置负载均衡监听、后端服务器与健康检查，分析流量分发和会话保持状态。'],
  ['platform-log', '检索平台与应用日志，按时间、服务和关键字过滤，辅助定位错误链路与异常堆栈。'],
  ['platform-metrics', '查询指标采集规则与监控数据，解释指标含义、聚合方式和告警阈值配置。'],
  ['platform-monitoring', '维护监控大盘、采集目标与告警策略，检查数据断点和监控覆盖范围。'],
  ['platform-network', '管理 VPC、子网、安全组与网络策略，分析连通性、路由和访问控制问题。'],
  ['platform-node', '查看节点资源、标签、污点与维护状态，执行节点隔离、排空和恢复操作。'],
  ['platform-object-storage', '管理对象存储桶、生命周期和访问密钥，检查容量、权限与对象同步状态。'],
  ['platform-pod', '查询 Pod 状态、事件和容器日志，定位重启、探针失败、资源不足和挂载异常。'],
  ['platform-redis', '管理 Redis 实例、内存策略与慢日志，分析连接数、命中率和主从同步状态。'],
  ['platform-registry', '维护镜像仓库项目、成员与同步规则，检查镜像漏洞扫描和存储配额。'],
  ['platform-resource', '汇总计算、存储与网络资源配额，分析项目占用、可分配余量和超卖风险。'],
  ['platform-scheduler', '解释调度器策略、优先级与亲和性配置，定位 Pod 无法调度和资源争抢问题。'],
  ['platform-security', '检查账号权限、密钥、审计事件与安全基线，识别高风险访问和配置偏差。'],
  ['platform-service-mesh', '管理服务网格、流量规则与 Sidecar，分析熔断、重试和链路追踪数据。'],
  ['platform-storage', '管理持久卷、存储类与快照，排查挂载失败、容量不足和回收策略问题。'],
  ['platform-tenant', '管理租户、项目与成员授权，解释配额边界、角色权限和资源隔离规则。'],
  ['platform-ticket', '创建和查询运维工单，跟踪处理进度、变更记录与验收结论。'],
  ['platform-vm', '管理云主机生命周期、规格与磁盘，执行开机、关机、重启和快照恢复。'],
  ['platform-vpc', '管理 VPC 对等连接、路由表与出口网关，排查跨网络访问和地址冲突。'],
  ['platform-workflow', '编排自动化任务与审批流程，查看执行记录并处理失败节点和重试。'],
  ['platform-audit', '查询平台操作审计与登录日志，按用户、资源和时间还原关键操作轨迹。'],
  ['platform-compliance', '检查资源配置与合规基线，汇总风险项、责任人和整改进度。'],
  ['platform-observability', '关联指标、日志与链路数据，建立统一观测视图并定位跨服务异常。'],
  ['platform-capacity', '分析集群与资源池容量趋势，评估扩容需求、水位和资源交付周期。'],
  ['platform-release', '管理应用版本、灰度发布与回滚记录，检查发布批次和实例更新进度。'],
].map(([name, description], index) => ({
  id: `builtin-${index + 7}`,
  name,
  description,
  updatedAt: '2026-11-14',
  enabled: true,
  content: '',
}))

const ALL_BUILTIN = [...BUILTIN_SKILLS, ...EXTRA_BUILTIN]

/** 技能管理：用户技能与内置技能双 Tab */
export function SkillManagementPage() {
  const [tab, setTab] = useState<'user' | 'builtin'>('user')
  const [userSkills, setUserSkills] = useState<SkillItem[]>(USER_SKILLS)
  const [draftQuery, setDraftQuery] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showImport, setShowImport] = useState(false)

  const source = tab === 'user' ? userSkills : ALL_BUILTIN
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return source
    return source.filter(
      (skill) =>
        skill.name.toLowerCase().includes(keyword) || skill.description.toLowerCase().includes(keyword),
    )
  }, [source, query])
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  const resetSearch = () => {
    setDraftQuery('')
    setQuery('')
    setPage(1)
  }

  const exportSkill = (skill: SkillItem) => {
    const blob = new Blob([skill.content || `# ${skill.name}\n\n${skill.description}\n`], {
      type: 'text/markdown;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${skill.name}.md`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <SettingsPageHeader title="技能管理" description="查看内置技能，导入与管理用户技能。" />

      <div className="shrink-0 border-b border-[#E5E6EB] bg-white px-[24px]">
        <div className="flex gap-[28px]">
          {[
            { key: 'user' as const, label: '用户技能' },
            { key: 'builtin' as const, label: '内置技能' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setTab(item.key)
                setPage(1)
              }}
              className={`relative h-[42px] text-[13px] transition-colors ${
                tab === item.key ? 'font-medium text-[#166EFF]' : 'text-[#4E5969] hover:text-[#166EFF]'
              }`}
            >
              {item.label}
              {tab === item.key && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#166EFF]" />}
            </button>
          ))}
        </div>
      </div>

      <SettingsToolbar
        actions={
          <SettingsSearch
            value={draftQuery}
            onChange={setDraftQuery}
            onSearch={() => {
              setQuery(draftQuery)
              setPage(1)
            }}
            onReset={resetSearch}
            placeholder="搜索技能名称或描述"
            width="w-[320px]"
          />
        }
      >
        {tab === 'user' ? (
          <PrimaryButton onClick={() => setShowImport(true)}>
            <Upload className="h-[14px] w-[14px]" />
            导入技能
          </PrimaryButton>
        ) : undefined}
      </SettingsToolbar>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#F5F7FA] px-[24px] py-[18px]">
        <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((skill) => (
            <div
              key={skill.id}
              className="flex min-h-[210px] flex-col rounded-[5px] border border-[#E5E6EB] bg-white"
            >
              <div className="flex flex-1 flex-col px-[20px] py-[18px]">
                <div className="flex items-start gap-[12px]">
                  <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[5px] bg-[#EAF2FF]">
                    <Cloud className="h-[23px] w-[23px] text-[#6CA6FF]" strokeWidth={1.6} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-[8px]">
                      <h3 className="text-[15px] font-medium text-[#1D2129]">{skill.name}</h3>
                      <EnabledBadge enabled={skill.enabled} />
                    </div>
                    <p className="mt-[5px] text-[12px] text-[#86909C]">更新于 {skill.updatedAt}</p>
                  </div>
                </div>
                <p className="mt-[18px] text-[13px] leading-[21px] text-[#4E5969]">{skill.description}</p>
              </div>

              {tab === 'user' && (
                <div className="flex items-center justify-end gap-[8px] border-t border-[#EEF0F3] px-[20px] py-[10px]">
                  <button
                    type="button"
                    onClick={() =>
                      setUserSkills((current) =>
                        current.map((item) =>
                          item.id === skill.id ? { ...item, enabled: !item.enabled } : item,
                        ),
                      )
                    }
                    className="flex h-[28px] items-center gap-[4px] rounded-[3px] px-[8px] text-[12px] text-[#4E5969] hover:bg-[#F2F3F5]"
                  >
                    {skill.enabled ? <Square className="h-[12px] w-[12px]" /> : <Play className="h-[12px] w-[12px]" />}
                    {skill.enabled ? '停用' : '启用'}
                  </button>
                  <button
                    type="button"
                    onClick={() => exportSkill(skill)}
                    className="flex h-[28px] items-center gap-[4px] rounded-[3px] px-[8px] text-[12px] text-[#4E5969] hover:bg-[#F2F3F5]"
                  >
                    <Download className="h-[12px] w-[12px]" />
                    导出
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserSkills((current) => current.filter((item) => item.id !== skill.id))}
                    className="flex h-[28px] items-center gap-[4px] rounded-[3px] px-[8px] text-[12px] text-[#F53F3F] hover:bg-[#FFF5F5]"
                  >
                    <Trash2 className="h-[12px] w-[12px]" />
                    删除
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {pageItems.length === 0 && (
          <div className="flex h-[380px] flex-col items-center justify-center rounded-[5px] border border-[#E5E6EB] bg-white">
            <Cloud className="mb-[12px] h-[46px] w-[46px] text-[#C9CDD4]" strokeWidth={1.4} />
            <p className="text-[13px] text-[#86909C]">{tab === 'user' ? '暂无用户技能' : '暂无匹配的内置技能'}</p>
          </div>
        )}
      </div>

      <SettingsPagination
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />

      {showImport && (
        <ImportSkillModal
          onClose={() => setShowImport(false)}
          onSubmit={(skill) => {
            setUserSkills((current) => [...current, skill])
            setShowImport(false)
            setTab('user')
            resetSearch()
          }}
        />
      )}
    </div>
  )
}

const SKILL_NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const MAX_SKILL_SIZE = 10 * 1024 * 1024

type ParsedImport = {
  fileName: string
  fileSize: number
  name: string
  description: string
  content: string
  instructionLines?: number
  errors: string[]
  warnings: string[]
}

function parseSkillMarkdown(
  raw: string,
  fallbackName: string,
): { name: string; description: string; instructionLines: number; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  const fmMatch = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n([\s\S]*))?$/)
  if (!fmMatch) {
    errors.push('SKILL.md 顶部缺少 YAML Frontmatter（--- ... ---）')
    return { name: fallbackName, description: '', instructionLines: 0, errors, warnings }
  }
  const frontmatter = fmMatch[1]
  const body = (fmMatch[2] ?? '').trim()
  const instructionLines = body ? body.split(/\r?\n/).length : 0

  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m)
  const descMatch = frontmatter.match(/^description:\s*(.+)$/m)
  const compatMatch = frontmatter.match(/^compatibility:\s*(.+)$/m)
  const name = (nameMatch?.[1] ?? '').trim().replace(/^['"]|['"]$/g, '')
  const description = (descMatch?.[1] ?? '').trim().replace(/^['"]|['"]$/g, '')
  const compatibility = (compatMatch?.[1] ?? '').trim().replace(/^['"]|['"]$/g, '')

  if (!name) {
    errors.push('Frontmatter 缺少必填字段 name')
  } else if (name.length > 64 || !SKILL_NAME_RE.test(name)) {
    errors.push('name 须为 1–64 位小写字母、数字或单连字符（不可连续 -- 或首尾为 -）')
  }

  if (!description) {
    errors.push('Frontmatter 缺少必填字段 description')
  } else if (description.length > 1024) {
    errors.push('description 长度不可超过 1024 字符')
  }

  if (compatibility && compatibility.length > 500) {
    errors.push('compatibility 长度不可超过 500 字符')
  }

  if (!body) {
    errors.push('Frontmatter 之后缺少正文指令（instructions），不可为空')
  } else if (instructionLines > 500) {
    warnings.push(`正文指令共 ${instructionLines} 行，超出 AgentSkills 建议上限（500 行），建议拆入 references/`)
  }

  if (/(\/Users\/|\/home\/|[A-Za-z]:\\)/.test(body)) {
    warnings.push('正文指令疑似包含本机绝对路径，建议使用相对路径（如 scripts/、references/）')
  }

  return { name: name || fallbackName, description, instructionLines, errors, warnings }
}

function ImportSkillModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (skill: SkillItem) => void
}) {
  const [dragging, setDragging] = useState(false)
  const [parsed, setParsed] = useState<ParsedImport | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    const lower = file.name.toLowerCase()
    const isMd = lower.endsWith('.md')
    const isZip = lower.endsWith('.zip')
    const errors: string[] = []

    if (!isMd && !isZip) {
      setParsed({
        fileName: file.name,
        fileSize: file.size,
        name: file.name,
        description: '',
        content: '',
        errors: ['仅支持导入 SKILL.md（.md）或技能压缩包（.zip）'],
        warnings: [],
      })
      return
    }

    if (file.size > MAX_SKILL_SIZE) {
      errors.push('单个技能包大小不可超过 10MB')
    }

    if (isMd) {
      const text = await file.text()
      const baseName = file.name.replace(/\.md$/i, '')
      const result = parseSkillMarkdown(text, baseName)
      setParsed({
        fileName: file.name,
        fileSize: file.size,
        name: result.name,
        description: result.description,
        content: text,
        instructionLines: result.instructionLines,
        errors: [...errors, ...result.errors],
        warnings: result.warnings,
      })
      return
    }

    // .zip 技能包：校验包名符合 AgentSkills name 规范
    const baseName = file.name.replace(/\.zip$/i, '')
    if (!baseName || baseName.length > 64 || !SKILL_NAME_RE.test(baseName)) {
      errors.push('技能包名（对应技能目录与 name）须为 1–64 位小写字母、数字或连字符')
    }
    setParsed({
      fileName: file.name,
      fileSize: file.size,
      name: baseName,
      description: `从技能包 ${file.name} 导入（含 SKILL.md 指令与关联资源）`,
      content: `---\nname: ${baseName}\ndescription: 从技能包 ${file.name} 导入\n---\n`,
      errors,
      warnings: [],
    })
  }

  const canSubmit = Boolean(parsed && parsed.errors.length === 0)

  return (
    <SettingsModal
      title="导入技能"
      width="w-[640px] max-w-[92vw]"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-[32px] rounded-[3px] border border-[#D9DEE7] px-[14px] text-[13px] text-[#4E5969] hover:bg-[#F7F8FA]"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              if (!parsed || parsed.errors.length > 0) return
              onSubmit({
                id: `skill-${Date.now()}`,
                name: parsed.name,
                description: parsed.description,
                content: parsed.content,
                updatedAt: new Date().toISOString().slice(0, 10),
                enabled: true,
              })
            }}
            className="h-[32px] rounded-[3px] bg-[#166EFF] px-[16px] text-[13px] text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            确认导入
          </button>
        </>
      }
    >
      <div className="space-y-[16px]">
        {/* AgentSkills 规范约束提示 */}
        <div className="rounded-[6px] border border-[#DCE8FF] bg-[#F4F8FF] px-[14px] py-[12px]">
          <div className="flex items-center gap-[6px] text-[13px] font-medium text-[#1D2129]">
            <Info className="h-[15px] w-[15px] shrink-0 text-[#166EFF]" />
            <span>AgentSkills 导入规范约束</span>
          </div>
          <ul className="mt-[8px] list-disc space-y-[4px] pl-[20px] text-[12px] leading-[19px] text-[#4E5969]">
            <li>
              <strong>包结构与大小</strong>：支持 <code className="rounded bg-white/80 px-1 font-mono text-[11px]">.zip</code> 技能包（根目录须含 <code className="rounded bg-white/80 px-1 font-mono text-[11px]">SKILL.md</code>，可选 <code className="rounded bg-white/80 px-1 font-mono text-[11px]">scripts/</code>、<code className="rounded bg-white/80 px-1 font-mono text-[11px]">references/</code>、<code className="rounded bg-white/80 px-1 font-mono text-[11px]">assets/</code>）或单个 <code className="rounded bg-white/80 px-1 font-mono text-[11px]">SKILL.md</code>，单包 ≤ 10MB。
            </li>
            <li>
              <strong>Frontmatter 必填</strong>：<code className="rounded bg-white/80 px-1 font-mono text-[11px]">name</code>（1–64 位小写字母、数字与单连字符，须与目录名一致）；<code className="rounded bg-white/80 px-1 font-mono text-[11px]">description</code>（1–1024 字符，说明功能边界与触发时机，供主 Agent 检索匹配）。
            </li>
            <li>
              <strong>Frontmatter 可选</strong>：支持 <code className="rounded bg-white/80 px-1 font-mono text-[11px]">license</code>、<code className="rounded bg-white/80 px-1 font-mono text-[11px]">compatibility</code>（≤ 500 字符，环境与依赖要求）、<code className="rounded bg-white/80 px-1 font-mono text-[11px]">metadata</code>（键值扩展）及 <code className="rounded bg-white/80 px-1 font-mono text-[11px]">allowed-tools</code>。
            </li>
            <li>
              <strong>Instructions（正文指令）限制</strong>：YAML 头部之后须包含非空 Markdown 指令；遵循渐进式披露，正文建议控制在 <strong>500 行 / 5000 tokens 以内</strong>（超长细节拆入 <code className="rounded bg-white/80 px-1 font-mono text-[11px]">references/</code>）；引用包内文件必须使用<strong>相对路径</strong>，禁止硬编码本机绝对路径或深层嵌套引用。
            </li>
          </ul>
        </div>

        {/* 拖拽上传区 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.zip"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleFile(file)
            event.target.value = ''
          }}
        />
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) void handleFile(file)
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-[6px] border-2 border-dashed px-6 py-8 text-center transition-colors ${
            dragging
              ? 'border-[#166EFF] bg-[#ECF5FF]/60'
              : 'border-[#D9DEE7] bg-[#FAFBFD] hover:border-[#166EFF]/60 hover:bg-[#F5F8FF]/50'
          }`}
        >
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#EAF2FF] text-[#166EFF]">
            <Upload className="h-[20px] w-[20px]" />
          </div>
          <p className="mt-[10px] text-[13.5px] font-medium text-[#1D2129]">
            将技能包（.zip）或 SKILL.md 拖拽到此处，或<span className="text-[#166EFF]">点击选择文件</span>
          </p>
          <p className="mt-[4px] text-[12px] text-[#86909C]">
            自动解析 YAML Frontmatter 并校验 AgentSkills 规范
          </p>
        </div>

        {/* 解析与校验结果预览 */}
        {parsed && (
          <div
            className={`rounded-[6px] border p-[12px] ${
              parsed.errors.length === 0
                ? 'border-[#B7EB8F] bg-[#F6FFED]'
                : 'border-[#FFCCC7] bg-[#FFF2F0]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-[8px]">
                {parsed.errors.length === 0 ? (
                  <CheckCircle2 className="h-[16px] w-[16px] shrink-0 text-[#00B42A]" />
                ) : (
                  <AlertCircle className="h-[16px] w-[16px] shrink-0 text-[#F53F3F]" />
                )}
                <FileCode2 className="h-[15px] w-[15px] shrink-0 text-[#4E5969]" />
                <span className="truncate text-[13px] font-medium text-[#1D2129]">{parsed.fileName}</span>
                <span className="shrink-0 text-[11.5px] text-[#86909C]">
                  ({(parsed.fileSize / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setParsed(null)}
                aria-label="清除已选文件"
                className="text-[#86909C] hover:text-[#1D2129]"
              >
                <X className="h-[14px] w-[14px]" />
              </button>
            </div>

            {parsed.errors.length === 0 ? (
              <div className="mt-[8px] space-y-[4px] pl-[24px] text-[12.5px] text-[#4E5969]">
                <div>
                  <span className="text-[#86909C]">技能名称：</span>
                  <span className="font-mono font-medium text-[#1D2129]">{parsed.name}</span>
                  {typeof parsed.instructionLines === 'number' && parsed.instructionLines > 0 && (
                    <span className="ml-2 text-[11.5px] text-[#86909C]">
                      （指令 {parsed.instructionLines} 行）
                    </span>
                  )}
                </div>
                <div className="line-clamp-2">
                  <span className="text-[#86909C]">技能描述：</span>
                  {parsed.description}
                </div>
                {parsed.warnings.length > 0 && (
                  <ul className="mt-1 list-disc space-y-[2px] pl-[16px] text-[11.5px] text-[#D46B08]">
                    {parsed.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <ul className="mt-[8px] list-disc space-y-[2px] pl-[40px] text-[12px] text-[#F53F3F]">
                {parsed.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </SettingsModal>
  )
}

/** 供页面调试与后续扩展使用的内置技能数量说明 */
export const BUILTIN_SKILL_COUNT = ALL_BUILTIN.length