// index.tsx - 默认入口，按 meta.defaultVersion 导出对应版本
// ⚠️ 版本下拉切 V1/V2 时，Host 会通过 versionComponents[currentVersion]
// 直接懒加载 _versions/v{N}.tsx 并以版本号 remount（见 host/layout/PageView.tsx key），
// 本文件只承担"没有 ?v= 参数时的首次路由兜底"职责。
import { lazy } from 'react'

const Default = lazy(() => import('./_versions/v2'))
export default Default
