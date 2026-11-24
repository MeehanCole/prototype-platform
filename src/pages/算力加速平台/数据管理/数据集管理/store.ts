/**
 * 数据集列表本地存储（跨页面共享）
 *
 * 「数据集管理」列表页与「创建数据集」表单页是两个独立路由，
 * 通过 localStorage 做一层轻量的持久化，保证表单页创建后回到列表可立即看到新数据。
 *
 * 读取策略：**以 MOCK_DATASETS 为基线合并**，而不是整体替换。
 *   - localStorage 里存的是「用户改动后的完整列表」；
 *   - 若之后 mock.ts 新增了演示数据，这些新行在旧存储里不存在，
 *     整体替换会导致「新加的 Mock 数据看不到」；
 *   - 因此按 id 合并：Mock 基线中新增的 id 补进结果，被用户删除的 id 尊重删除意图。
 */
import { MOCK_DATASETS } from './mock'
import type { Dataset } from './mock'

const STORE_KEY = 'calspeed.datasets.v5'
/** 记录用户显式删除过的 Mock 数据集 id，避免合并时又被基线补回来 */
const REMOVED_KEY = 'calspeed.datasets.removed.v1'

function readRemovedIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(REMOVED_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

function writeRemovedIds(ids: string[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(REMOVED_KEY, JSON.stringify(ids))
  } catch {
    // 忽略隐私模式等场景下的写入失败
  }
}

/** 用户删除数据集时登记 id，使其不再被 Mock 基线补回 */
export function markRemoved(id: string) {
  const next = Array.from(new Set([...readRemovedIds(), id]))
  writeRemovedIds(next)
}

/**
 * 读取数据集列表
 *
 * - 无存储或解析失败 → 直接返回 Mock 基线；
 * - 有存储 → 以存储中的顺序为准，并把 Mock 基线里「新增且未被删除」的 id 补到最前，
 *   保证新加的演示数据一定可见，同时保留用户创建的数据与删除动作。
 */
export function readDatasets(): Dataset[] {
  if (typeof window === 'undefined') return MOCK_DATASETS
  const removed = new Set(readRemovedIds())
  let stored: Dataset[] = []
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) stored = parsed as Dataset[]
    }
  } catch {
    stored = []
  }

  if (stored.length === 0) {
    return MOCK_DATASETS.filter((item) => !removed.has(item.id))
  }

  /**
   * 演示数据（MOCK_DATASETS）始终以 mock.ts 为准：
   * 存储里可能留有旧结构的同 id 对象（例如缺少后来新增的 upload 字段），
   * 若沿用存储版本，界面会读不到新字段。用户自己创建的数据（id 不在基线中）保留存储版本。
   */
  const mockIds = new Set(MOCK_DATASETS.map((item) => item.id))
  const storedOnly = stored.filter((item) => !mockIds.has(item.id))
  const baseline = MOCK_DATASETS.filter((item) => !removed.has(item.id))
  return [...baseline, ...storedOnly]
}

/** 覆盖写入数据集列表；拒绝写入空数组，避免误清空演示数据 */
export function writeDatasets(list: Dataset[]) {
  if (typeof window === 'undefined') return
  if (list.length === 0) return
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(list))
  } catch {
    // 忽略隐私模式等场景下的写入失败
  }
}

/** 新增一条数据集并持久化，返回新列表 */
export function prependDataset(dataset: Dataset): Dataset[] {
  const next = [dataset, ...readDatasets()]
  writeDatasets(next)
  return next
}
