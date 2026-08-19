/**
 * App entry - auto-generate routes from pageRegistry
 */
import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/host/layout/AppLayout'
import { PageView } from '@/host/layout/PageView'
import { pageRegistry } from '@/host/router/pageRegistry'
import Overview from '@/host/components/Overview'

function App() {
  return (
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
        {/* 动态路由: /:module/:page */}
        <Route path=":module/:page" element={<PageView />} />
      </Route>
    </Routes>
  )
}

export default App
