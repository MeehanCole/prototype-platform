import { useMemo, useState } from 'react'
import { Cloud, Download, Play, Square, Trash2, Upload } from 'lucide-react'
import {
  EnabledBadge,
  FieldLabel,
  PrimaryButton,
  SettingsModal,
  SettingsPageHeader,
  SettingsPagination,
  SettingsSearch,
  SettingsToolbar,
  inputClass,
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
        <div className="grid grid-cols-1 gap-[16px] xl:grid-cols-2">
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

function ImportSkillModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (skill: SkillItem) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')

  return (
    <SettingsModal
      title="导入技能"
      width="w-[600px]"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-[32px] rounded-[3px] border border-[#D9DEE7] px-[14px] text-[13px] text-[#4E5969]"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!name.trim() || !description.trim()}
            onClick={() =>
              onSubmit({
                id: `skill-${Date.now()}`,
                name: name.trim(),
                description: description.trim(),
                content,
                updatedAt: new Date().toISOString().slice(0, 10),
                enabled: true,
              })
            }
            className="h-[32px] rounded-[3px] bg-[#166EFF] px-[16px] text-[13px] text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            导入
          </button>
        </>
      }
    >
      <div className="space-y-[16px]">
        <div>
          <FieldLabel required>技能名称</FieldLabel>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如 search-product-docs"
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel required>技能描述</FieldLabel>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="说明技能适用场景与能力边界"
            className="w-full rounded-[3px] border border-[#D9DEE7] px-[10px] py-[8px] text-[13px] leading-[20px] text-[#1D2129] outline-none placeholder:text-[#A9AEB8] focus:border-[#166EFF]"
          />
        </div>
        <div>
          <FieldLabel>SKILL.md 正文</FieldLabel>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={7}
            placeholder="粘贴 SKILL.md 指令正文（可选）"
            className="w-full rounded-[3px] border border-[#D9DEE7] px-[10px] py-[8px] font-mono text-[12px] leading-[20px] text-[#1D2129] outline-none placeholder:text-[#A9AEB8] focus:border-[#166EFF]"
          />
        </div>
      </div>
    </SettingsModal>
  )
}

/** 供页面调试与后续扩展使用的内置技能数量说明 */
export const BUILTIN_SKILL_COUNT = ALL_BUILTIN.length