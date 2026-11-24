/**
 * 「未检测到数据集空间」整页阻断态
 *
 * 数据存储空间（RustFS 等 S3 兼容桶）未开通时，「数据集管理」「创建数据集」的
 * 内容区不再渲染工具栏、搜索、表格或表单，而是整体替换为本组件：
 *   1. 居中 48×48 的「数据库 + 存储块」双色插画
 *   2. 标题「未检测到数据集空间」
 *   3. 两行灰色说明文案，指明需联系管理员开通数据存储空间
 *   4. 「返回」主按钮（退出该模块）
 */

/** 双色数据库插画：蓝色数据库柱体 + 金色存储块 */
export function SpaceIllustration({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <ellipse
        cx="20"
        cy="13"
        rx="8.5"
        ry="3.6"
        fill="none"
        stroke="#b7cbe3"
        strokeWidth="1.8"
      />
      <path
        d="M11.5 13v5.4c0 2 3.8 3.6 8.5 3.6s8.5-1.6 8.5-3.6V13"
        fill="none"
        stroke="#b7cbe3"
        strokeWidth="1.8"
      />
      <rect x="8" y="20" width="24" height="12.5" rx="1.5" fill="#ded1a2" />
      <rect x="8" y="20" width="24" height="12.5" rx="1.5" fill="none" stroke="#9b8c4e" strokeWidth="1.2" />
      <path d="M8 32.5h24" stroke="#5b512c" strokeWidth="1.4" />
    </svg>
  )
}

/**
 * 整页阻断态
 *
 * 以页面形态而非浮层呈现「模块不可用」：没有遮罩、不能被关闭，也不提供操作按钮，
 * 用户只能通过管理员开通数据存储空间后刷新页面恢复。
 */
export function SpaceBlockedState() {
  return (
    <div className="flex min-h-[560px] items-center justify-center rounded-[2px] border border-[#e5e6eb] bg-white">
      <div className="px-6 py-16 text-center">
        <div className="flex justify-center">
          <SpaceIllustration size={48} />
        </div>

        <h2 className="mt-5 text-[16px] font-bold leading-6 text-[#323232]">未检测到数据集空间</h2>

        {/* 固定两行断句，避免出现单字换行 */}
        <p className="mt-3 whitespace-nowrap text-[13px] leading-[22px] text-[#86909c]">
          系统检测到尚未在平台中创建数据存储空间，您
          <br />
          无法直接读取或上传数据集。请联系管理员
        </p>
      </div>
    </div>
  )
}
