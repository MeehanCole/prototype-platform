// [功能标注] PRD FR-6 配置管理（Agent 运行参数）
import { useState } from "react";
import { NewTag } from "../feature-tags";
import { Info, Save, RotateCcw, Cpu, Repeat, Shrink, Timer, Network, GitBranch } from "lucide-react";

// ─── 类型定义 ─────────────────────────────────────────────────────────────────────────

interface AgentConfig {
  /** 最大迭代次数：Agent 单轮诊断允许的工具调用 / 推理循环上限 */
  maxIterations: number;
  /** 上下文压缩上限（tokens）：超过该阈值触发历史压缩 */
  compressionThreshold: number;
  /** 单次诊断超时时间（秒） */
  timeoutSeconds: number;
  /** 并发 Subagent 数量：动态派发的子智能体上限 */
  maxConcurrentSubagents: number;
  /** 最大回溯步数：诊断路径回溯深度 */
  maxBacktrackSteps: number;
}

const DEFAULT_CONFIG: AgentConfig = {
  maxIterations: 10,
  compressionThreshold: 8000,
  timeoutSeconds: 120,
  maxConcurrentSubagents: 3,
  maxBacktrackSteps: 5,
};

const STORAGE_KEY = "aiops.agentConfig";

function loadConfig(): AgentConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    /* 忽略解析错误，回退默认 */
  }
  return DEFAULT_CONFIG;
}

// ─── 字段定义（含后端对接说明）──────────────────────────────────────────────────────

const FIELDS: {
  key: keyof AgentConfig;
  label: string;
  unit?: string;
  min: number;
  max: number;
  step: number;
  icon: typeof Cpu;
  desc: string;
  /** 该参数后端尚未实现的占位说明 */
  backendNote: string;
}[] = [
  {
    key: "maxIterations",
    label: "迭代次数",
    min: 1,
    max: 50,
    step: 1,
    icon: Repeat,
    desc: "Agent 单轮诊断允许的工具调用 / 推理循环上限，达到上限后强制输出当前结论。",
    backendNote: "后端迭代调度器就绪后接入，当前仅前端预校验。",
  },
  {
    key: "compressionThreshold",
    label: "上下文压缩上限",
    unit: "tokens",
    min: 1000,
    max: 64000,
    step: 500,
    icon: Shrink,
    desc: "对话上下文超过该 token 阈值时触发历史压缩，保留关键证据链、丢弃冗余中间步骤。",
    backendNote: "后端压缩服务就绪后接入，当前仅前端保存配置。",
  },
  {
    key: "timeoutSeconds",
    label: "诊断超时时间",
    unit: "秒",
    min: 10,
    max: 600,
    step: 10,
    icon: Timer,
    desc: "单次诊断任务的最长执行时间，超时后中断并返回已采集的部分结论。",
    backendNote: "后端任务超时控制器就绪后接入。",
  },
  {
    key: "maxConcurrentSubagents",
    label: "并发 Subagent 数",
    min: 1,
    max: 10,
    step: 1,
    icon: Network,
    desc: "动态派发的子智能体（Subagent）并发上限，控制多工具 / 多目标并行诊断的粒度。",
    backendNote: "后端编排层就绪后接入，当前仅前端保存配置。",
  },
  {
    key: "maxBacktrackSteps",
    label: "最大回溯步数",
    min: 0,
    max: 20,
    step: 1,
    icon: GitBranch,
    desc: "诊断路径失败时允许回退的最大步数，用于换路重试而非直接放弃。",
    backendNote: "后端回溯引擎就绪后接入。",
  },
];

// ─── 主组件 ───────────────────────────────────────────────────────────────────────────

export function ConfigManagementPage() {
  const [config, setConfig] = useState<AgentConfig>(loadConfig);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const update = (key: keyof AgentConfig, value: number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSavedAt(null);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setSavedAt(new Date().toLocaleString("zh-CN"));
    } catch {
      /* 存储不可用时静默失败 */
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setSavedAt(null);
  };

  return (
    <div className="flex flex-col flex-1">
      {/* 顶部操作栏 */}
      <div className="bg-[#FFFFFF] border-b border-[#DCDFE6] px-[24px] py-[12px] shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-[16px] font-semibold text-[#303133] flex items-center gap-[6px]">配置管理 <NewTag code="FR-6" /></h1>
          <div className="flex items-center gap-[12px]">
            <button
              onClick={handleReset}
              className="h-[32px] px-[16px] bg-[#FFFFFF] text-[#606266] text-[14px] border border-[#DCDFE6] rounded-[4px] hover:text-[#409EFF] hover:border-[#409EFF] transition-colors flex items-center gap-[4px]"
            >
              <RotateCcw className="w-[14px] h-[14px]" />
              恢复默认
            </button>
            <button
              onClick={handleSave}
              className="h-[32px] px-[16px] bg-[#409EFF] text-white text-[14px] rounded-[4px] hover:bg-[#66b1ff] transition-colors flex items-center gap-[4px]"
            >
              <Save className="w-[14px] h-[14px]" />
              保存配置
            </button>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="flex-1 p-[24px] overflow-y-auto">
        {/* 后端对接提示 */}
        <div className="flex items-start gap-[10px] bg-[#f4f4f5] border border-[#E4E4E7] rounded-[8px] px-[16px] py-[12px] mb-[20px]">
          <Info className="w-[16px] h-[16px] text-[#909399] shrink-0 mt-[2px]" />
          <p className="text-[13px] text-[#606266] leading-[1.6]">
            以下为 Agent 运行参数配置原型，支持本地保存与预校验。
            <span className="text-[#E6A23C] font-medium"> 各参数的实际生效依赖后端能力，接口就绪后将自动绑定（详见每项「后端对接」说明）。</span>
          </p>
        </div>

        {/* 参数卡片列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
          {FIELDS.map((f) => {
            const Icon = f.icon;
            const value = config[f.key];
            return (
              <div
                key={f.key}
                className="bg-[#FFFFFF] border border-[#DCDFE6] rounded-[8px] p-[16px]"
              >
                {/* 卡片头部 */}
                <div className="flex items-start gap-[10px] mb-[10px]">
                  <div className="w-[36px] h-[36px] bg-[#ecf5ff] rounded-[4px] flex items-center justify-center shrink-0">
                    <Icon className="w-[18px] h-[18px] text-[#409EFF]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[14px] font-medium text-[#303133]">{f.label}</h3>
                    {f.unit && (
                      <span className="text-[12px] text-[#909399]">单位：{f.unit}</span>
                    )}
                  </div>
                </div>

                {/* 描述 */}
                <p className="text-[13px] text-[#606266] leading-[1.6] mb-[12px]">{f.desc}</p>

                {/* 输入区 */}
                <div className="flex items-center gap-[12px] mb-[10px]">
                  <input
                    type="range"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={value}
                    onChange={(e) => update(f.key, Number(e.target.value))}
                    className="flex-1 accent-[#409EFF]"
                  />
                  <input
                    type="number"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={value}
                    onChange={(e) => update(f.key, Number(e.target.value))}
                    className="w-[96px] h-[32px] px-[10px] text-[14px] border border-[#DCDFE6] rounded-[4px] bg-[#FFFFFF] text-[#303133] outline-none focus:border-[#409EFF] transition-colors"
                  />
                </div>

                {/* 后端对接说明 */}
                <div className="flex items-center gap-[6px] text-[12px] text-[#E6A23C] bg-[#fdf6ec] border border-[#faecd8] rounded-[4px] px-[8px] py-[6px]">
                  <Cpu className="w-[12px] h-[12px] shrink-0" />
                  <span>后端对接：{f.backendNote}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 保存状态 */}
        {savedAt && (
          <p className="text-[12px] text-[#67C23A] mt-[16px]">
            配置已保存到本地（{savedAt}），等待后端接口就绪后生效。
          </p>
        )}

        {/* 占位：后续参数区 */}
        <div className="mt-[20px] border border-dashed border-[#DCDFE6] rounded-[8px] px-[16px] py-[20px] text-center">
          <p className="text-[13px] text-[#A0A0A0]">
            更多 Agent 参数（模型温度、工具重试策略、知识库召回阈值等）待后端实现后补充
          </p>
        </div>
      </div>
    </div>
  );
}
