import { useMemo, useState } from 'react'
import { CheckCircle2, Link2, Loader2, Plus, Server, Trash2, X } from 'lucide-react'
import {
  FieldLabel,
  PrimaryButton,
  SettingsModal,
  SettingsPageHeader,
  SettingsPagination,
  SettingsSearch,
  SettingsToolbar,
  inputClass,
} from '../SettingsUI'

type ConnectionType = 'SSE' | 'Streamable HTTP'

interface McpHeader {
  key: string
  value: string
}

interface McpServer {
  id: string
  name: string
  connection: ConnectionType
  endpoint: string
  description?: string
  headers?: McpHeader[]
  enabled: boolean
}

/** 工具管理：外部 MCP 服务器注册与开关 */
export function ToolManagementPage() {
  const [servers, setServers] = useState<McpServer[]>([])
  const [draftQuery, setDraftQuery] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showAdd, setShowAdd] = useState(false)

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return servers
    return servers.filter(
      (server) =>
        server.name.toLowerCase().includes(keyword) || server.endpoint.toLowerCase().includes(keyword),
    )
  }, [servers, query])

  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <SettingsPageHeader title="工具管理" description="连接外部 MCP 服务器，管理工具注册与目录。" />
      <SettingsToolbar
        actions={
          <SettingsSearch
            value={draftQuery}
            onChange={setDraftQuery}
            onSearch={() => {
              setQuery(draftQuery)
              setPage(1)
            }}
            onReset={() => {
              setDraftQuery('')
              setQuery('')
              setPage(1)
            }}
            placeholder="搜索名称、描述或服务地址"
            width="w-[320px]"
          />
        }
      >
        <PrimaryButton onClick={() => setShowAdd(true)}>
          <Plus className="h-[14px] w-[14px]" />
          添加 MCP
        </PrimaryButton>
      </SettingsToolbar>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E5E6EB] text-[12px] font-normal text-[#4E5969]">
              <th className="w-[80px] px-[24px] py-[15px] font-normal">ID</th>
              <th className="w-[23%] px-[12px] py-[15px] font-normal">MCP 名称</th>
              <th className="w-[15%] px-[12px] py-[15px] font-normal">连接方式</th>
              <th className="px-[12px] py-[15px] font-normal">服务地址</th>
              <th className="w-[10%] px-[12px] py-[15px] text-center font-normal">开关</th>
              <th className="w-[12%] px-[12px] py-[15px] text-center font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((server, index) => (
              <tr key={server.id} className="border-b border-[#EEF0F3] text-[13px] text-[#1D2129] hover:bg-[#FAFBFC]">
                <td className="px-[24px] py-[14px] text-[#86909C]">{(page - 1) * pageSize + index + 1}</td>
                <td className="truncate px-[12px] py-[14px]">{server.name}</td>
                <td className="px-[12px] py-[14px] text-[#4E5969]">{server.connection}</td>
                <td className="truncate px-[12px] py-[14px] font-mono text-[12px] text-[#4E5969]">
                  {server.endpoint}
                </td>
                <td className="px-[12px] py-[14px] text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setServers((current) =>
                        current.map((item) =>
                          item.id === server.id ? { ...item, enabled: !item.enabled } : item,
                        ),
                      )
                    }
                    aria-label={server.enabled ? '关闭 MCP' : '开启 MCP'}
                    className={`relative inline-flex h-[18px] w-[34px] rounded-full transition-colors ${
                      server.enabled ? 'bg-[#166EFF]' : 'bg-[#C9CDD4]'
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-all ${
                        server.enabled ? 'left-[18px]' : 'left-[2px]'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-[12px] py-[14px] text-center">
                  <button
                    type="button"
                    onClick={() => setServers((current) => current.filter((item) => item.id !== server.id))}
                    className="inline-flex items-center gap-[4px] text-[12px] text-[#F53F3F] hover:underline"
                  >
                    <Trash2 className="h-[12px] w-[12px]" />
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pageItems.length === 0 && (
          <div className="flex h-[480px] flex-col items-center justify-center">
            <Server className="mb-[14px] h-[54px] w-[54px] text-[#E5E6EB]" strokeWidth={1.4} />
            <p className="text-[13px] text-[#86909C]">暂无 MCP</p>
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

      {showAdd && (
        <AddMcpModal
          onClose={() => setShowAdd(false)}
          onSubmit={(server) => {
            setServers((current) => [...current, server])
            setShowAdd(false)
          }}
        />
      )}
    </div>
  )
}

function AddMcpModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (server: McpServer) => void
}) {
  const [connection, setConnection] = useState<ConnectionType>('Streamable HTTP')
  const [name, setName] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [description, setDescription] = useState('')
  const [headers, setHeaders] = useState<McpHeader[]>([])
  const [testState, setTestState] = useState<'idle' | 'testing' | 'ok' | 'missing'>('idle')

  const addHeader = () => {
    setHeaders((prev) => [...prev, { key: '', value: '' }])
  }

  const updateHeader = (index: number, field: 'key' | 'value', val: string) => {
    setHeaders((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: val } : item)),
    )
  }

  const removeHeader = (index: number) => {
    setHeaders((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleTest = () => {
    if (!endpoint.trim()) {
      setTestState('missing')
      return
    }
    setTestState('testing')
    window.setTimeout(() => {
      setTestState('ok')
    }, 450)
  }

  return (
    <SettingsModal
      title="添加 MCP"
      width="w-[680px] max-w-[92vw]"
      onClose={onClose}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleTest}
              disabled={testState === 'testing'}
              className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] border border-[#D9DEE7] bg-white px-[14px] text-[13px] text-[#166EFF] transition-colors hover:border-[#166EFF] hover:bg-[#F5F8FF] disabled:opacity-60"
            >
              {testState === 'testing' && <Loader2 className="h-[13px] w-[13px] animate-spin" />}
              <span>测 试 连 接</span>
            </button>
            {testState === 'ok' && (
              <span className="inline-flex items-center gap-1 text-[12px] text-[#00B42A]">
                <CheckCircle2 className="h-[13px] w-[13px]" />
                连接成功
              </span>
            )}
            {testState === 'missing' && (
              <span className="text-[12px] text-[#F53F3F]">请先填写服务地址</span>
            )}
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={onClose}
              className="h-[32px] rounded-[4px] border border-[#D9DEE7] bg-white px-[16px] text-[13px] text-[#4E5969] transition-colors hover:bg-[#F7F8FA]"
            >
              取 消
            </button>
            <button
              type="button"
              disabled={!name.trim() || !endpoint.trim()}
              onClick={() =>
                onSubmit({
                  id: `mcp-${Date.now()}`,
                  name: name.trim(),
                  connection,
                  endpoint: endpoint.trim(),
                  description: description.trim() || undefined,
                  headers: headers.filter((h) => h.key.trim()),
                  enabled: true,
                })
              }
              className="h-[32px] rounded-[4px] bg-[#166EFF] px-[18px] text-[13px] text-white transition-colors hover:bg-[#2E7DFF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              保 存
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-[16px]">
        <div>
          <FieldLabel required>连接方式</FieldLabel>
          <select
            value={connection}
            onChange={(event) => setConnection(event.target.value as ConnectionType)}
            className={inputClass}
          >
            <option>Streamable HTTP</option>
            <option>SSE</option>
          </select>
        </div>

        <div>
          <FieldLabel required>MCP 名称</FieldLabel>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="请输入 MCP 名称，支持中文"
            className={inputClass}
          />
        </div>

        <div>
          <FieldLabel required>服务地址</FieldLabel>
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-[10px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#C0C4CC]" />
            <input
              value={endpoint}
              onChange={(event) => {
                setEndpoint(event.target.value)
                if (testState !== 'idle') setTestState('idle')
              }}
              placeholder="https://mcp.example.com/mcp"
              className={`${inputClass} pl-[30px]`}
            />
          </div>
        </div>

        <div>
          <FieldLabel>描述信息</FieldLabel>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="请输入工具描述信息"
            className="w-full resize-y rounded-[3px] border border-[#D9DEE7] px-[10px] py-[8px] text-[13px] text-[#1D2129] outline-none placeholder:text-[#A9AEB8] focus:border-[#166EFF]"
          />
        </div>

        <div>
          <div className="mb-[8px] flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#1D2129]">请求头</span>
            <button
              type="button"
              onClick={addHeader}
              className="inline-flex items-center gap-0.5 text-[13px] text-[#166EFF] hover:underline"
            >
              <Plus className="h-[13px] w-[13px]" />
              <span>添加请求头</span>
            </button>
          </div>

          {headers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[6px] border border-dashed border-[#DCDFE6] bg-[#FAFBFD] py-6 text-center">
              <Link2 className="h-[18px] w-[18px] text-[#B8BEC9]" />
              <p className="mt-2 text-[12.5px] text-[#86909C]">
                暂无自定义请求头，点击上方“添加请求头”进行配置
              </p>
            </div>
          ) : (
            <div className="space-y-2 rounded-[6px] border border-[#E5E8EE] bg-[#FAFBFD] p-3">
              {headers.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={item.key}
                    onChange={(e) => updateHeader(idx, 'key', e.target.value)}
                    placeholder="Header 名称，如 Authorization"
                    className={inputClass}
                  />
                  <input
                    value={item.value}
                    onChange={(e) => updateHeader(idx, 'value', e.target.value)}
                    placeholder="Header 值"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeHeader(idx)}
                    aria-label="删除请求头"
                    className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[3px] text-[#86909C] hover:bg-[#F2F3F5] hover:text-[#F53F3F]"
                  >
                    <X className="h-[14px] w-[14px]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SettingsModal>
  )
}