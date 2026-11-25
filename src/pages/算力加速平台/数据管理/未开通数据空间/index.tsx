/**
 * 算力加速平台-数据管理 - 未开通数据空间（独立状态页）
 *
 * 产品语义：租户/项目尚未在平台中创建数据存储空间（RustFS 等 S3 兼容桶）时，
 * 「数据管理」整体不可用。本页与「数据集管理」平行并列，用于评审该异常态：
 *   1. 进入即弹出「未检测到数据集空间」阻断提示（与设计稿逐字一致）
 *   2. 关闭提示后可见列表页为只读态，任何写入入口（创建数据集 / 新增版本 / 上传文件）
 *      都会再次弹出同一提示，不会真正发起创建或上传
 *
 * 实现上复用「数据集管理」页主体，通过 __forceNoSpace 注入未配置状态，
 * 保证两种状态下的布局、表格、弹窗完全一致，避免维护两套 UI。
 */
import { useState } from 'react'
import DatasetPage from '../数据集管理'
import { DocPanel, DocProvider, FEATURES, NewTag } from './feature-tags'

export default function NoSpacePage({ __showFeat = false }: { __showFeat?: boolean } = {}) {
  const [docCode, setDocCode] = useState<string | null>(null)
  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
      <div className="fixed left-4 top-20 z-40">
        {__showFeat && <NewTag code="F-SPACE-CHECK" />}
      </div>
      <DatasetPage __forceNoSpace __showFeat={false} />
      <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}
