/**
 * V2 方案: 手机号 + 验证码登录
 */
import { useState, useEffect } from 'react'

export default function LoginV2() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendCode = () => {
    if (!phone || phone.length !== 11) return
    setCountdown(60)
  }

  return (
    <div className="flex min-h-[600px] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-96 rounded-xl border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-semibold text-gray-900">
          CRM 系统登录
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">验证码登录,更安全</p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">验证码</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6 位验证码"
                maxLength={6}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleSendCode}
                disabled={countdown > 0 || phone.length !== 11}
                className="shrink-0 rounded-md border border-indigo-500 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
          </div>

          <button className="w-full rounded-md bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500">
            登录
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">V2 方案</p>
      </div>
    </div>
  )
}
