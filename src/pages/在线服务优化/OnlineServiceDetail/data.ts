export type Instance = {
  label: string
  running: boolean
  weight?: number
  role?: '基线' | '金丝雀' | '主' | '备'
}
export type ServiceDetail = {
  name: string
  model: string
  published: boolean
  createdAt: string
  publishType: string
  routeMode: string
  instances: Instance[]
  cacheOn: boolean
  cacheTime: string
  fallbackOn: boolean
  fallbackType: string
  fallbackModels: string[]
  rpmOn: boolean
  rpm: string
  backendType: '内部推理服务' | '外部推理服务'
  timeout: string
}

/* 在线服务 mock 数据（列表 / 详情 / 编辑 三页共享）
   覆盖列表页全部 6 条策略，保证任意一行点「编辑」都有数据回填 */
export const DETAILS: Record<string, ServiceDetail> = {
  测试外部2: {
    name: '测试外部2',
    model: 'qwen-max',
    published: true,
    createdAt: '2026-11-02 14:22:02',
    publishType: '私有发布',
    routeMode: '按权重分发',
    instances: [{ label: '阿里不完整路径', running: true, weight: 100 }],
    cacheOn: false,
    cacheTime: '60秒',
    fallbackOn: false,
    fallbackType: '内部推理服务',
    fallbackModels: [],
    rpmOn: false,
    rpm: '',
    backendType: '外部推理服务',
    timeout: '180秒',
  },
  测试外部服务: {
    name: '测试外部服务',
    model: 'qwen-plus',
    published: true,
    createdAt: '2026-11-01 10:18:42',
    publishType: '私有发布',
    routeMode: '金丝雀发布',
    instances: [
      { label: '百炼基线服务', running: true, weight: 90, role: '基线' },
      { label: '百炼灰度服务', running: true, weight: 10, role: '金丝雀' },
    ],
    cacheOn: true,
    cacheTime: '120秒',
    fallbackOn: false,
    fallbackType: '内部推理服务',
    fallbackModels: [],
    rpmOn: false,
    rpm: '',
    backendType: '外部推理服务',
    timeout: '180秒',
  },
  gge: {
    name: 'gge',
    model: 'QwQ-32B',
    published: false,
    createdAt: '2026-10-30 16:42:11',
    publishType: '私有发布',
    routeMode: '蓝绿发布',
    instances: [
      { label: 'kt服务-蓝组', running: true, weight: 100, role: '主' },
      { label: 'kt服务-绿组', running: true, weight: 0, role: '备' },
    ],
    cacheOn: false,
    cacheTime: '60秒',
    fallbackOn: false,
    fallbackType: '内部推理服务',
    fallbackModels: [],
    rpmOn: false,
    rpm: '',
    backendType: '内部推理服务',
    timeout: '180秒',
  },
  测试外部: {
    name: '测试外部',
    model: 'Qwen2.5-72B-Instruct',
    published: false,
    createdAt: '2026-11-02 13:35:24',
    publishType: '私有发布',
    routeMode: '按权重分发',
    instances: [
      { label: 'demo-18080', running: true, weight: 20 },
      { label: 'demo-18081', running: true, weight: 30 },
      { label: 'demo-18082', running: true, weight: 50 },
    ],
    cacheOn: true,
    cacheTime: '100秒',
    fallbackOn: true,
    fallbackType: '内部推理服务',
    fallbackModels: ['DeepSeek-R1-Distill-Qwen-32B'],
    rpmOn: false,
    rpm: '',
    backendType: '外部推理服务',
    timeout: '180秒',
  },
  验证缓存设置: {
    name: '验证缓存设置',
    model: 'Qwen3-32B',
    published: false,
    createdAt: '2026-10-29 09:27:03',
    publishType: '私有发布',
    routeMode: '按权重分发',
    instances: [{ label: 'test', running: true, weight: 100 }],
    cacheOn: true,
    cacheTime: '60秒',
    fallbackOn: false,
    fallbackType: '内部推理服务',
    fallbackModels: [],
    rpmOn: false,
    rpm: '',
    backendType: '内部推理服务',
    timeout: '180秒',
  },
  '1个服务': {
    name: '1个服务',
    model: 'DeepSeek-R1-Distill-Qwen-32B',
    published: false,
    createdAt: '2026-10-28 11:05:37',
    publishType: '私有发布',
    routeMode: '按权重分发',
    instances: [{ label: 'test', running: true, weight: 100 }],
    cacheOn: false,
    cacheTime: '60秒',
    fallbackOn: false,
    fallbackType: '内部推理服务',
    fallbackModels: [],
    rpmOn: false,
    rpm: '',
    backendType: '内部推理服务',
    timeout: '180秒',
  },
}

const DEFAULT_DETAIL: ServiceDetail = DETAILS['测试外部']

export { DEFAULT_DETAIL }
