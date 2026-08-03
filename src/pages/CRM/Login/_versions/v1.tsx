/**
 * V1 方案: 手机号 + 密码登录
 */
import { useState } from 'react'

export default function LoginV1() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="flex min-h-[600px] items-center justify-center bg-gray-50">
      <div className="w-96 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
          CRM 系统登录
        </h1>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button className="w-full rounded-md bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
            登录
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">V1 方案</p>
      </div>
    </div>
  )
}
