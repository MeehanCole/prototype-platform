/**
 * Built-in design system presets
 * token values verified against official docs (2024):
 * - Element Plus: https://element-plus.org/en-US/guide/theming.html (var.scss)
 * - Ant Design:   https://ant.design/docs/react/customize-theme (5.x seed tokens)
 * - Arco Design:  https://arco.design/react/en-US/docs/token
 * - Naive UI:     https://www.naiveui.com/en-US/os-theme/docs/theme (common theme vars)
 */
export interface DesignSystemPreset {
  id: string
  name: string
  description: string
  tokens: Record<string, string>
  components: Record<string, Record<string, unknown>>
}

export const presets: DesignSystemPreset[] = [
  {
    id: 'default',
    name: 'Prototype Default',
    description: 'indigo brand, modern SaaS style',
    tokens: {
      '--color-primary': 'hsl(243 75% 59%)',
      '--color-primary-foreground': 'hsl(0 0% 100%)',
      '--color-success': 'hsl(142 71% 45%)',
      '--color-warning': 'hsl(38 92% 50%)',
      '--color-danger': 'hsl(0 84% 60%)',
      '--radius-btn': '6px',
      '--radius-card': '8px',
      '--radius-input': '6px',
      '--font-size-base': '14px',
      '--shadow-card': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 4px 12px -2px rgb(0 0 0 / 0.05)',
    },
    components: {
      Button: { radius: '6px', fontWeight: '500' },
      Table: { stripe: false, border: true },
      Form: { labelPosition: 'top', labelWidth: 'auto' },
    },
  },
  {
    id: 'element-plus',
    name: 'Element Plus',
    description: 'Vue3 + EP, blue #409eff, 4px radius',
    tokens: {
      // verified: EP var.scss primary base #409eff
      '--color-primary': '#409eff',
      '--color-primary-foreground': '#ffffff',
      // verified: EP success #67c23a, warning #e6a23c, danger #f56c6c
      '--color-success': '#67c23a',
      '--color-warning': '#e6a23c',
      '--color-danger': '#f56c6c',
      // verified: EP border-radius-base 4px
      '--radius-btn': '4px',
      '--radius-card': '4px',
      '--radius-input': '4px',
      '--font-size-base': '14px',
      // verified: EP shadow
      '--shadow-card': '0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04)',
    },
    components: {
      // EP Button: 4px radius, font-weight 500
      Button: { radius: '4px', fontWeight: '500', height: '32px' },
      // EP Table: stripe by default, border, header bg #fafafa
      Table: { stripe: true, border: true, headerBg: '#fafafa' },
      // EP Form: label right, width 100px
      Form: { labelPosition: 'right', labelWidth: '100px' },
      // EP Tag: 4px radius, 24px height
      Tag: { radius: '4px', height: '24px' },
      // EP Input: 4px radius, border #dcdfe6
      Input: { radius: '4px', border: '#dcdfe6' },
      // EP Pagination: background style
      Pagination: { style: 'background' },
    },
  },
  {
    id: 'ant-design',
    name: 'Ant Design',
    description: 'React + AD 5.x, blue #1677ff, 6px radius',
    tokens: {
      // verified: AD 5.x colorPrimary #1677ff (5.x default, 4.x was #1890ff)
      '--color-primary': '#1677ff',
      '--color-primary-foreground': '#ffffff',
      // verified: AD colorSuccess #52c41a, colorWarning #faad14, colorError #ff4d4f
      '--color-success': '#52c41a',
      '--color-warning': '#faad14',
      '--color-danger': '#ff4d4f',
      // verified: AD borderRadius 6
      '--radius-btn': '6px',
      '--radius-card': '8px',
      '--radius-input': '6px',
      '--font-size-base': '14px',
      // verified: AD boxShadow
      '--shadow-card': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    },
    components: {
      // AD Button: 6px radius, font-weight 400
      Button: { radius: '6px', fontWeight: '400', height: '32px' },
      // AD Table: no stripe, border, header bg #fafafa
      Table: { stripe: false, border: true, headerBg: '#fafafa' },
      // AD Form: label right, auto width
      Form: { labelPosition: 'right', labelWidth: 'auto' },
      // AD Tag: 4px radius, 22px height
      Tag: { radius: '4px', height: '22px' },
      // AD Input: 6px radius, border #d9d9d9
      Input: { radius: '6px', border: '#d9d9d9' },
    },
  },
  {
    id: 'arco-design',
    name: 'Arco Design',
    description: 'React/Vue + Arco, blue #165dff, 4px radius',
    tokens: {
      // verified: Arco primary-6 = arcoblue-6 = #165dff
      '--color-primary': '#165dff',
      '--color-primary-foreground': '#ffffff',
      // verified: Arco success-6 = green-6, warning-6 = orange-6, danger-6 = red-6
      '--color-success': '#00b42a',
      '--color-warning': '#ff7d00',
      '--color-danger': '#f53f3f',
      // verified: Arco border-radius-medium 4px (default component radius)
      '--radius-btn': '4px',
      '--radius-card': '4px',
      '--radius-input': '4px',
      // verified: Arco font-size-body-3 14px
      '--font-size-base': '14px',
      // verified: Arco shadow2-center
      '--shadow-card': '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    components: {
      // Arco Button: 4px radius (medium), font-weight 400, height 32px (size-default)
      Button: { radius: '4px', fontWeight: '400', height: '32px' },
      // Arco Table: no stripe, border, header bg #f7f8fa
      Table: { stripe: false, border: true, headerBg: '#f7f8fa' },
      // Arco Form: label right, width 120px
      Form: { labelPosition: 'right', labelWidth: '120px' },
      // Arco Tag: 2px radius (small), 24px height
      Tag: { radius: '2px', height: '24px' },
    },
  },
  {
    id: 'naive-ui',
    name: 'Naive UI',
    description: 'Vue3 + Naive, green #18a058, 3px radius',
    tokens: {
      // verified: Naive primaryColor #18a058
      '--color-primary': '#18a058',
      '--color-primary-foreground': '#ffffff',
      // verified: Naive successColor #18a058, warningColor #f0a020, errorColor #d03050
      '--color-success': '#18a058',
      '--color-warning': '#f0a020',
      '--color-danger': '#d03050',
      // verified: Naive borderRadius 3px
      '--radius-btn': '3px',
      '--radius-card': '3px',
      '--radius-input': '3px',
      // verified: Naive fontSize 14px
      '--font-size-base': '14px',
      // verified: Naive boxShadow1
      '--shadow-card': '0 1px 2px -2px rgba(0, 0, 0, 0.08), 0 3px 6px 0 rgba(0, 0, 0, 0.06), 0 5px 12px 4px rgba(0, 0, 0, 0.04)',
    },
    components: {
      // Naive Button: 3px radius, font-weight 400, height 34px (medium)
      Button: { radius: '3px', fontWeight: '400', height: '34px' },
      // Naive Table: no stripe by default, no border, header bg #fafafc
      Table: { stripe: false, border: false, headerBg: '#fafafc' },
      // Naive Form: label left, auto width
      Form: { labelPosition: 'left', labelWidth: 'auto' },
      // Naive Tag: 3px radius, 22px height (small)
      Tag: { radius: '3px', height: '22px' },
    },
  },
]

export const defaultPreset = presets[0]
