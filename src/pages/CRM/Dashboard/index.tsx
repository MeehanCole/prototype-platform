import { useState } from 'react'

export default function DashboardPage() {
  const [range, setRange] = useState('7d')

  return (
    <div className="min-h-[600px] bg-muted/20 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">数据看板</h1>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
        >
          <option value="7d">近 7 天</option>
          <option value="30d">近 30 天</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">新增客户</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {range === '7d' ? '128' : '512'}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">成交订单</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {range === '7d' ? '32' : '148'}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">营收总额</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {range === '7d' ? '¥48,600' : '¥218,400'}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-background p-5">
        <h2 className="mb-4 text-lg font-medium text-foreground">近期动态</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-sm font-medium text-foreground">张三 完成了订单 #20260731-001</p>
              <p className="text-xs text-muted-foreground">2 小时前</p>
            </div>
            <span className="text-sm text-muted-foreground">¥3,200</span>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-sm font-medium text-foreground">李四 新增客户「星河科技」</p>
              <p className="text-xs text-muted-foreground">5 小时前</p>
            </div>
            <span className="rounded bg-accent px-2 py-0.5 text-xs text-accent-foreground">新客户</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">王五 跟进客户「海蓝集团」</p>
              <p className="text-xs text-muted-foreground">昨天</p>
            </div>
            <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">跟进中</span>
          </div>
        </div>
      </div>
    </div>
  )
}
