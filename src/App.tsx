/**
 * App entry - auto-generate routes from pageRegistry
 */
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Agentation } from 'agentation'
import { AppLayout } from '@/host/layout/AppLayout'
import { PageView } from '@/host/layout/PageView'
import { pageRegistry } from '@/host/router/pageRegistry'
import Overview from '@/host/components/Overview'
import { WorkbenchThemeProvider } from '@/host/theme/workbenchTheme'

// 开发态素材库：仅 DEV 分支动态引入，生产构建时整块代码不进入产物。
const DevAssetLibrary = import.meta.env.DEV
  ? lazy(() => import('@/dev/assets/AssetLibrary'))
  : null

function DevAssetsRoute() {
  if (!DevAssetLibrary) return null
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          加载素材库…
        </div>
      }
    >
      <DevAssetLibrary />
    </Suspense>
  )
}

function App() {
  return (
    <WorkbenchThemeProvider>
      <Routes>
        <Route element={<AppLayout />}>
          {/* 根路径: 平台首页总览(模块卡片 + 统计) */}
          <Route
            index
            element={
              pageRegistry.length > 0 ? (
                <Overview />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  暂无页面,请在 src/pages/ 下添加
                </div>
              )
            }
          />
          {/* 开发态素材库（仅 npm run dev 存在） */}
          {DevAssetLibrary && <Route path="__assets" element={<DevAssetsRoute />} />}
          {/* 动态路由: /:product/:requirement/:page */}
          <Route path=":product/:requirement/:page" element={<PageView />} />
        </Route>
      </Routes>
      {import.meta.env.DEV && <Agentation endpoint="http://localhost:4747" />}
    </WorkbenchThemeProvider>
  )
}

export default App
