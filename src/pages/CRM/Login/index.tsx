// CRM/Login 默认入口：按 meta.defaultVersion 导出 v2
// 版本下拉切 V1/V2 由 Host(PageView.tsx) 通过 versionComponents 懒加载 + remount，
// 本文件只承担无 ?v= 参数时的首次路由兜底。
import { lazy } from 'react'

const Default = lazy(() => import('./_versions/v2'))
export default Default
