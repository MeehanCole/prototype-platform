/**
 * App entry - auto-generate routes from pageRegistry
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/host/layout/AppLayout'
import { PageView } from '@/host/layout/PageView'
import { pageRegistry } from '@/host/router/pageRegistry'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* 根路径重定向到第一个页面 */}
        <Route
          index
          element={
            pageRegistry.length > 0 ? (
              <Navigate to={pageRegistry[0].path} replace />
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
