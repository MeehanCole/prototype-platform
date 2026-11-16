/**
 * 参数配置 · 容量与配额
 *
 * 平台对单库、单文件与用户建库数量设上限。
 * 降低配额不会删除已有内容，只阻止后续新增超出部分。
 */
import { useEffect, useState } from 'react'
import { Check, HardDrive, RotateCcw } from 'lucide-react'
import type { PlatformConfig } from './platform'

type QuotaKey = 'libraryDocLimit' | 'libraryStorageLimit' | 'fileSizeLimit' | 'userLibraryLimit'
type Errors = Partial<Record<QuotaKey, string>>

const FIELDS: {
  key: QuotaKey
  label: string
  unit: string
  min: number
  max: number
  desc: string
}[] = [
  {
    key: 'libraryDocLimit',
    label: '单库文档数上限',
    unit: '篇',
    min: 100,
    max: 100000,
    desc: '单个知识库可容纳的文档数量，超出后阻止上传。',
  },
  {
    key: 'libraryStorageLimit',
    label: '单库存储上限',
    unit: 'GB',
    min: 1,
    max: 1000,
    desc: '按解析后的原文与切片计算，不含临时文件。',
  },
  {
    key: 'fileSizeLimit',
    label: '单文件大小上限',
    unit: 'MB',
    min: 1,
    max: 500,
    desc: '超过上限的文件在上传前即被拦截，不进入解析队列。',
  },
  {
    key: 'userLibraryLimit',
    label: '单用户可建知识库',
    unit: '个',
    min: 1,
    max: 200,
    desc: '按库创建人计数，被添加为成员的库不占用该配额。',
  },
]

const textOf = (config: PlatformConfig) => ({
  libraryDocLimit: String(config.libraryDocLimit),
  libraryStorageLimit: String(config.libraryStorageLimit),
  fileSizeLimit: String(config.fileSizeLimit),
  userLibraryLimit: String(config.userLibraryLimit),
})

export function QuotaConfigSection({
  config,
  onChange,
}: {
  config: PlatformConfig
  onChange: (next: PlatformConfig) => void
}) {
  const [text, setText] = useState(() => textOf(config))
  const [errors, setErrors] = useState<Errors>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setText(textOf(config))
  }, [config])

  const dirty = FIELDS.some((f) => Number(text[f.key]) !== config[f.key])

  const update = (key: QuotaKey, value: string) => {
    setText((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setSaved(false)
  }

  const validate = (): Errors => {
    const next: Errors = {}
    for (const f of FIELDS) {
      const raw = text[f.key].trim()
      const value = Number(raw)
      if (!raw || !Number.isInteger(value) || value < f.min || value > f.max) {
        next[f.key] = `请输入 ${f.min}–${f.max} 之间的整数`
      }
    }
    return next
  }

  const save = () => {
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    onChange({
      ...config,
      libraryDocLimit: Number(text.libraryDocLimit),
      libraryStorageLimit: Number(text.libraryStorageLimit),
      fileSizeLimit: Number(text.fileSizeLimit),
      userLibraryLimit: Number(text.userLibraryLimit),
    })
    setErrors({})
    setSaved(true)
  }

  const reset = () => {
    setText(textOf(config))
    setErrors({})
    setSaved(false)
  }

  return (
    <div>
      <div className="mb-[16px] flex flex-wrap items-center justify-between gap-[12px] rounded-[6px] bg-[#F5F7FA] px-[14px] py-[12px]">
        <div className="flex items-center gap-[10px]">
          <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] bg-white">
            <HardDrive className="h-[16px] w-[16px] text-[#166EFF]" />
          </div>
          <div>
            <p className="text-[13px] text-[#1D2129]">平台已用存储 320 GB / 2 TB</p>
            <p className="mt-[1px] text-[11.5px] text-[#86909C]">
              共 12 个知识库、3,480 篇文档；容量由平台统一扩容。
            </p>
          </div>
        </div>
        <div className="w-[160px]">
          <div className="h-[6px] overflow-hidden rounded-full bg-[#E5E6EB]">
            <div className="h-full w-[16%] rounded-full bg-[#166EFF]" />
          </div>
          <p className="mt-[4px] text-right text-[11px] text-[#86909C]">已用 16%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-[24px] gap-y-[16px] lg:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`quota-${f.key}`} className="mb-[6px] block text-[13px] text-[#1D2129]">
              {f.label}
            </label>
            <div className="flex items-center gap-[8px]">
              <input
                id={`quota-${f.key}`}
                inputMode="numeric"
                value={text[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                className={`h-[34px] w-[160px] rounded-[4px] border bg-white px-[10px] text-[13px] text-[#1D2129] outline-none focus:ring-[2px] ${
                  errors[f.key]
                    ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/15'
                    : 'border-[#E5E6EB] focus:border-[#166EFF] focus:ring-[#166EFF]/15'
                }`}
              />
              <span className="text-[13px] text-[#86909C]">{f.unit}</span>
            </div>
            {errors[f.key] ? (
              <p className="mt-[4px] text-[11.5px] text-[#F53F3F]">{errors[f.key]}</p>
            ) : (
              <p className="mt-[4px] text-[11.5px] leading-[16px] text-[#86909C]">{f.desc}</p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-[16px] rounded-[4px] bg-[#FFF7E8] px-[10px] py-[8px] text-[12px] leading-[18px] text-[#8A4B00]">
        降低配额不会删除已有内容；已超出部分保持只读，仅阻止新增。修改仅影响之后的上传与建库。
      </p>

      <div className="mt-[16px] flex items-center justify-between border-t border-[#E5E6EB] pt-[16px]">
        <span className="text-[12px] text-[#86909C]">
          {saved ? (
            <span className="flex items-center gap-[4px] text-[#00B42A]">
              <Check className="h-[13px] w-[13px]" />
              已保存，配额立即生效
            </span>
          ) : (
            '配额按平台与库两级校验，取更严格的一项。'
          )}
        </span>
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            onClick={reset}
            disabled={!dirty}
            className="flex h-[32px] cursor-pointer items-center gap-[4px] rounded-[4px] border border-[#E5E6EB] bg-white px-[12px] text-[13px] text-[#4E5969] hover:border-[#c0c4cc] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-[13px] w-[13px]" />
            还原
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty}
            className="h-[32px] cursor-pointer rounded-[4px] bg-[#166EFF] px-[16px] text-[13px] text-white hover:bg-[#66b1ff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}