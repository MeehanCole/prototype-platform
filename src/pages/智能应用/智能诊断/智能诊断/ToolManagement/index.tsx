import { useMemo, useState } from 'react'
import { Plus, Server, Trash2 } from 'lucide-react'
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

interface McpServer {
  id: string
  name: string
  connection: ConnectionType
  endpoint: string
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
  const [name, setName] = useState('')
  const [connection, setConnection] = useState<ConnectionType>('Streamable HTTP')
  const [endpoint, setEndpoint] = useState('')

  return (
    <SettingsModal
      title="添加 MCP"
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
            disabled={!name.trim() || !endpoint.trim()}
            onClick={() =>
              onSubmit({
                id: `mcp-${Date.now()}`,
                name: name.trim(),
                connection,
                endpoint: endpoint.trim(),
                enabled: true,
              })
            }
            className="h-[32px] rounded-[3px] bg-[#166EFF] px-[16px] text-[13px] text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            确认
          </button>
        </>
      }
    >
      <div className="space-y-[16px]">
        <div>
          <FieldLabel required>MCP 名称</FieldLabel>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="请输入 MCP 名称" className={inputClass} />
        </div>
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
          <FieldLabel required>服务地址</FieldLabel>
          <input
            value={endpoint}
            onChange={(event) => setEndpoint(event.target.value)}
            placeholder="https://example.com/mcp"
            className={inputClass}
          />
        </div>
      </div>
    </SettingsModal>
  )
}