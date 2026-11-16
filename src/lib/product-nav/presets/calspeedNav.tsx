/**
 * 九宫格产品导航面板 · 「算力加速平台」数据（素材示例 preset）
 *
 * 来源：点击顶栏左上角 9 宫格弹出的产品类导航截图（5 列等宽，栏内可堆叠多个产品）。
 * 本文件只放文案与图标名，几何与配色全部在 ProductNav 组件里，换产品时复制本文件改数据即可。
 */
import type { ShellPanelPreset } from '../types'

/** 智能中心 · 智能应用（前台：所有登录用户可见） */
const AI_APP_ITEMS = [
  { label: '智能知识库', icon: 'Library' },
]

/** 智能中心 · 系统设置（后台：仅平台管理员可见，普通用户整组不渲染） */
const AI_ADMIN_ITEMS = [
  { label: '模型管理', icon: 'BrainCircuit' },
  { label: '工具管理', icon: 'Wrench' },
  { label: '技能管理', icon: 'Puzzle' },
  // 知识库配置 / 运行配置 收进本页内部的二级导航，不再占面板位
  { label: '参数配置', icon: 'SlidersHorizontal' },
]

const MONITOR_ITEMS = [
  { label: '监控中心', icon: 'LineChart' },
  { label: '告警中心', icon: 'BellRing' },
  { label: '日志管理', icon: 'ScrollText' },
]

export const CALSPEED_PRODUCT_NAV: ShellPanelPreset = [
  {
    sections: [
      {
        title: '算力平台',
        icon: 'BrainCircuit',
        groups: [
          {
            items: [
              { label: '快速入门', icon: 'BookOpen' },
              { label: '总览', icon: 'Gauge' },
            ],
          },
          {
            label: '弹性算力',
            items: [
              { label: '容器实例', icon: 'Boxes' },
              { label: '主机实例', icon: 'Server' },
              { label: '裸金属实例', icon: 'HardDrive' },
            ],
          },
          {
            label: '模型服务',
            items: [
              { label: '模型广场', icon: 'Compass' },
              { label: '模型仓库', icon: 'Warehouse' },
              { label: '推理服务', icon: 'Zap' },
              { label: '模型体验', icon: 'Sparkles' },
              { label: 'API 管理', icon: 'Braces' },
              { label: '模型链路分析', icon: 'GitBranch' },
            ],
          },
          {
            label: '基础资源',
            items: [
              { label: '存储管理', icon: 'Database' },
              { label: '镜像管理', icon: 'Layers' },
            ],
          },
          {
            label: '算力评测',
            items: [
              { label: '算力评估', icon: 'Cpu' },
              { label: '性能评估', icon: 'Activity' },
            ],
          },
        ],
      },
    ],
  },
  {
    sections: [
      {
        title: '容器云',
        icon: 'Blocks',
        groups: [
          { items: [{ label: '总览', icon: 'Gauge' }] },
          {
            label: '容器应用',
            items: [
              { label: '自制应用', icon: 'Box' },
              { label: '模板应用', icon: 'LayoutTemplate' },
              { label: '服务', icon: 'Gem' },
            ],
          },
          {
            label: '应用负载',
            items: [
              { label: '工作负载', icon: 'Blocks' },
              { label: '任务', icon: 'ListChecks' },
              { label: '容器组', icon: 'Grid2x2' },
            ],
          },
          {
            label: '配置管理',
            items: [
              { label: '配置字典', icon: 'BookText' },
              { label: '保密字典', icon: 'Lock' },
            ],
          },
          {
            label: '容器网络',
            items: [
              { label: '网络策略', icon: 'Shield' },
              { label: '应用路由', icon: 'Route' },
            ],
          },
          {
            label: '容器存储',
            items: [
              { label: '持久卷', icon: 'Disc' },
              { label: '卷快照', icon: 'Camera' },
            ],
          },
          { items: [{ label: '云主机', icon: 'Cloud' }] },
          {
            label: '边云消息',
            items: [
              { label: '消息端点', icon: 'Webhook' },
              { label: '消息路由', icon: 'Route' },
            ],
          },
        ],
      },
    ],
  },
  {
    sections: [
      {
        title: '交付中心',
        icon: 'BookOpen',
        groups: [
          {
            label: '仓库目录',
            items: [
              { label: '镜像仓库', icon: 'Package' },
              { label: '镜像预热', icon: 'Flame' },
              { label: '仓库配置', icon: 'Wrench' },
            ],
          },
          {
            label: '应用中心',
            items: [
              { label: '应用商店', icon: 'Store' },
              { label: '模板市场', icon: 'LayoutTemplate' },
            ],
          },
        ],
      },
      {
        title: '运维中心',
        icon: 'Wrench',
        groups: [
          { label: '操作审计', items: [{ label: '平台审计', icon: 'FileSearch' }] },
          { label: '平台运维', items: MONITOR_ITEMS },
          {
            label: '备份服务',
            items: [
              { label: 'ETCD备份', icon: 'DatabaseBackup' },
              { label: '备份恢复', icon: 'RotateCcw' },
            ],
          },
          { label: '应用运维', items: MONITOR_ITEMS },
          {
            label: '系统管理',
            items: [
              { label: '通知配置', icon: 'Bell' },
              { label: '运维参数', icon: 'SlidersHorizontal' },
            ],
          },
        ],
      },
    ],
  },
  {
    sections: [
      {
        title: '运营中心',
        icon: 'ChartPie',
        groups: [
          {
            label: '费用管理',
            items: [
              { label: '订单明细', icon: 'ReceiptText' },
              { label: '账单明细', icon: 'Receipt' },
            ],
          },
          {
            label: '商品规格',
            items: [
              { label: '规格管理', icon: 'Tags' },
              { label: '商品管理', icon: 'Package' },
            ],
          },
          {
            label: '资产管理',
            items: [
              { label: '资产概览', icon: 'PieChart' },
              { label: '资产清单', icon: 'List' },
              { label: '资产分配', icon: 'Share2' },
              { label: '运营报表', icon: 'BarChart3' },
            ],
          },
        ],
      },
      {
        title: '平台巡检',
        icon: 'Radar',
        groups: [
          {
            label: '巡检中心',
            items: [
              { label: '巡检规则', icon: 'FileCheck' },
              { label: '巡检计划', icon: 'CalendarClock' },
              { label: '巡检结果', icon: 'ClipboardCheck' },
            ],
          },
        ],
      },
    ],
  },
  {
    sections: [
      {
        title: '智能中心',
        icon: 'Atom',
        groups: [
          { label: '智能应用', items: AI_APP_ITEMS },
          { label: '系统设置', items: AI_ADMIN_ITEMS, visibleTo: 'admin' },
        ],
      },
    ],
  },
]