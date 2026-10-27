# 方案：KEDA 读取 GPU 指标驱动弹性扩缩容

> 项目：算力加速平台-弹性扩缩容
> 日期：2026-10-26
> 状态：**方案候选（待选定）**，未实施
> 输入：[调研-KEDA与KubeRay弹性扩缩容.md](./调研-KEDA与KubeRay弹性扩缩容.md) · [cap-services 深度调研](./cap-services%20推理服务与弹性扩缩容机制深度调研.md)
> 方向（已确认）：**KEDA 从 Prometheus 取 GPU 相关指标 → 配置阈值 → 据此扩缩容**

---

## 0. 需求目的：扩展「扩缩容能看的指标维度」

这是本需求的**唯一目的**，架构是手段不是目标。

| 机制 | 能看到什么指标 | 局限 |
|---|---|---|
| **HPA（原生）** | 只有 CPU、内存（`Resource` 类型） | 要接别的指标必须再装 adapter（custom/external metrics） |
| **Ray 自带（Serve Autoscaler）** | 只有请求侧：进行中请求数、队列深度 | 看不到 GPU、显存、业务自定义指标 |
| **KEDA** | **任意 PromQL**（Prometheus scaler），外加 60+ 种 scaler | — |

所以：

> **KEDA 在这里的角色，本质上是给 HPA「装上任意指标」的那层适配器**——KEDA 内部就是生成一个 HPA，把 Prometheus 查到的值喂进去。
> 有了它，扩缩容信号可以从「CPU/内存」和「请求数」扩展到 **GPU 利用率、显存水位、SM 活跃度、Tensor Core 使用率、队列长度、以及任何业务指标**。

**一句话结论**：需求成立且合理——现状是「请求数驱动」，缺口是「GPU 资源视角」；KEDA 正是补这个缺口的标准手段。

## 1. 现状与边界（必须尊重的三条事实）

| # | 事实 | 来源 | 对方案的影响 |
|---|---|---|---|
| 1 | 弹性由 **Ray Serve Autoscaler** 驱动，信号是「进行中请求数」 | cap-services `Scale` → `AutoscalingConfig` | GPU 指标是**新增第二路信号**，不是替换 |
| 2 | 集群级 autoscaler **恒在**（head pod 内 `autoscaler` 容器） | 客户架构图 + 日志 | 不能「关掉 autoscaler 让 KEDA 接管」 |
| 3 | **RayCluster 没有 `/scale`**；RayService 副本在 `serveConfigV2` 字符串里 | KubeRay v1.3.0 `raycluster_types.go`（只有 `subresource:status`）+ Ray 论坛 | KEDA 不能直接改 Ray 副本，必须经参数或 API |

---

## 2. 架构简述（只谈必要的一层桥）

```
Prometheus（GPU 指标）──PromQL──► KEDA（阈值判定 / 0↔1 激活）
                                     │
                                     ▼
                          「期望副本数」需要落到 Ray 上
                                     │
              ┌──────────────────────┴──────────────────────┐
              ▼                                              ▼
   改 Ray 的副本（不可行：Ray 对象没有 /scale）    改「包络」min/max（可行）
                                                             ▼
                                              SkyLLMServing.spec.scale
                                                             ▼
                                        Ray Serve Autoscaler 在区间内按请求扩缩
```

只需要一层很薄的桥：把 KEDA 算出的「期望值」写进 `SkyLLMServing` 的 `Scale` 字段。
**不需要动 Ray、不需要改 Serve 配置格式**——operator 本来就会从 CR 重新生成配置。

## 3. 三个候选（含推荐）

### 候选 A：KEDA external scaler + 适配服务 ✅ 推荐

- KEDA 用 `external` scaler，回调自建 Adapter
- Adapter 收到「期望值」后 `PATCH` `SkyLLMServing.spec.scale.{minReplicas,maxReplicas}`
- 优点：不动 Ray、不动 CRD；KEDA 的阈值/冷却/激活阈值全部可用；Adapter 可加业务校验（配额、TP×PP×DP 卡数）
- 代价：多一个组件（Deployment + 一个 `/scale` gRPC 或 HTTP 接口）

### 候选 B：给 `SkyLLMServing` 加 `/scale` 子资源

- CRD 增加 `spec.replicas` + `+kubebuilder:subresource:scale`，`specReplicasPath: .spec.replicas`
- KEDA 直接 `ScaledObject` 指向它，无需 Adapter
- 优点：KEDA 用法最标准，零额外组件
- 代价：**`/scale` 只有一个整数字段**，而我们要控制 min/max 两个量 → 只能把 `replicas` 解释成 `maxReplicas`（语义歪一点，需在文档里写清）；且要改 CRD + operator

### 候选 C：不引入 KEDA，由 cap-services 自己读 Prometheus

- Operator 内加一个 controller，按 GPU 指标直接改 `Scale.minReplicas/maxReplicas`
- 优点：链路最短、无新组件、无跨系统权限问题
- 代价：**放弃了 KEDA**（与本次方向不符），且阈值/冷却要自己实现一遍

> 如果目标是「必须用 KEDA」，选 A；如果目标是「最快落地」，C 其实更省；B 是两者的折中，但受 `/scale` 单字段限制。

---

## 4. 信号设计（核心）

### 4.1 指标选型

| 用途 | 指标（PromQL 表达式示例） | 说明 |
|---|---|---|
| **扩容主信号** | `sum(ray_serve_deployment_queued_queries{namespace="ai-serving"})` | 排队请求数，最贴近「压力」 |
| 扩容辅信号 | `avg(DCGM_FI_DEV_GPU_UTIL{pod=~"$svc-.*"})` | GPU 利用率，仅辅助/健康度 |
| 扩容辅信号 | `avg(DCGM_FI_DEV_FB_USED / DCGM_FI_DEV_FB_TOTAL)` | 显存水位，>0.9 才考虑扩 |
| **缩容信号** | 上述指标持续低于阈值 + 冷却 | 缩容要慢、要保守 |
| 兜底 | `sum(ray_serve_deployment_ongoing_requests{...})` | 与 target_ongoing_requests 对齐 |

> ⚠️ **不要把 `DCGM_FI_DEV_GPU_UTIL` 单独当扩容阈值**：它是「kernel 活跃时间占比」，batch 打满 100% 属正常，按它扩会无限扩（详见调研文档 §2.3）。

### 4.2 阈值与节奏（示例值，需压测校准）

| 参数 | 建议值 | 说明 |
|---|---|---|
| `threshold`（扩容触发） | 队列深度 > 8 | 与 Serve 的 `target_ongoing_requests=10` 联动 |
| `activationThreshold` | 1 | 0↔1 的激活阈值，必须「大于」才激活 |
| `pollingInterval` | 30s | KEDA 默认 |
| `cooldownPeriod` | 300s | 只对缩到 0 有效 |
| HPA `behavior.scaleDown.stabilizationWindowSeconds` | 300s | 1→N 缩容的真实抑制手段 |
| 扩缩步长 | 每次 ±1 | 与 Serve 的 `upscalingFactor=1` 一致，避免突刺 |

### 4.3 与现有 Serve Autoscaler 的联动规则

| 场景 | 行为 |
|---|---|
| GPU 指标高 + 队列高 | KEDA 抬高 `maxReplicas` → Serve 按请求扩副本 |
| GPU 指标高 + 队列低 | **不扩**（说明是模型/批处理吃满，不是压力）→ 只告警 |
| GPU 指标低 + 队列低 | KEDA 压低 `maxReplicas` 至当前值附近，Serve 自行缩容（走 `downscaleDelayS=600`） |
| 指标源不可用 | `ignoreNullValues: "false"` + KEDA `fallback` → 冻结在 `fallback.replicas`，**禁止按「无数据=低负载」缩容** |

---

## 5. 参数映射（页面 ↔ CRD ↔ KEDA）

| 页面字段 | CRD `Scale` | KEDA / Serve 参数 | 本次由谁写 |
|---|---|---|---|
| 弹性模式 · Serverless | `autoscaling_config` | — | 用户创建时选 |
| 最小模型副本 | `minReplicas` | Serve `min_replicas` | KEDA（候选 A/B） |
| 最大模型副本 | `maxReplicas` | Serve `max_replicas` | **KEDA** |
| 缩容检测窗口 600s | `downscaleDelayS` | Serve `downscale_delay_s` | 用户配置（KEDA 不动） |
| 目标请求数 10 | `targetOngoingRequests` | Serve `target_ongoing_requests` | 用户配置（KEDA 不动） |
| 最大请求数 20 | `maxOngoingRequests` | Serve `max_ongoing_requests` | 用户配置（KEDA 不动） |
| （新增）GPU 扩容阈值 | 无 | KEDA `threshold` | 新增配置项 |
| （新增）GPU 指标 PromQL | 无 | KEDA `query` | 新增配置项 |

> 产品侧需要新增两个配置入口：**GPU 指标阈值** 与 **PromQL**（可以放在「高级配置」里）。

---

### 5.1 指标模式（原型已实现）的字段映射

> 设计原则：**页面只暴露「worker 节点」这一层**（用户能在环境里看到的），副本数由换算自动得出。

| 原型分组 | 字段 | 生成物 / 落点 |
|---|---|---|
| ① 监控指标 | 算力型号（只读） | 取自「算力规格」选中行，过滤内置指标 |
| ① | 指标 / 聚合方式 | 生成 PromQL（`avg/max/sum` 包裹）→ KEDA `query` |
| ② 扩缩参数 | 最小模型副本数 / 最大模型副本数 | `SkyLLMServing.spec.scale.minReplicas/maxReplicas`（KEDA 写入副本上下限；worker 范围由 operator 换算） |
| ② | 缩容检测窗口（秒，默认 600） | HPA `behavior.scaleDown.stabilizationWindowSeconds` |
| ② | 扩容阈值 / 缩容阈值 | KEDA `threshold`（扩容）+ 缩容阈值落地为收窄 `maxReplicas` 的触发条件（滞回） |
| ② | 单次调整（个节点） | HPA `behavior.policies`（Pods） |
| （页面已移除）资源换算 | 见 §5.2 | 由后端换算，不占用表单空间 |
| （已移除）采样与回溯 | — | 由后端固定：`pollingInterval` 默认 30s，回溯窗口固定 30s 拼进 PromQL |

**关键设计取舍**

1. **不暴露「模型副本范围」**：副本数 = f(worker 卡数, TP×PP×DP)，是派生量。让用户同时填「副本范围」和「worker 范围」必然出现互相矛盾的组合（之前版本的问题）。
2. **用「放开/收窄」表达 KEDA 的作用**，而不是「设置 worker 数」：KEDA 改的是边界，实际数量仍归 Ray Autoscaler。
3. **扩容/缩容双阈值**：单阈值会在临界点震荡，双阈值形成滞回区间（80 扩 / 30 缩）。

### 5.2 资源换算公式（页面不展示，仅后端换算）

```
每 Pod 卡数    = 算力规格选中行的「算力数量」
worldSize     = TP × PP × DP（简易模式为 1）
最多卡数       = 最大节点数 × 每 Pod 卡数
可支撑副本数   = floor(最多卡数 ÷ worldSize)
```

示例：每 Pod 1 卡、最大 4 节点、TP=2/PP=1/DP=1 → 最多 4 卡 → 可支撑 2 个模型副本。

**用途**

1. 后端换算 `max_replicas`（副本上限 = 可支撑副本数），保证 Serve 不会要求超过 worker 供给的卡数
2. 创建/编辑时做校验：`最大节点数 × 每 Pod 卡数` 不得超过租户配额
3. 详情页展示「当前最多可支撑 N 个副本」，让用户理解 worker 范围与副本数的关系

## 6. 实施步骤（候选 A）

1. **Adapter 开发**（1~2 人日）：暴露 KEDA external scaler 接口；实现 `GET /metrics`（查 Prometheus）+ `POST /scale`（PATCH CR）
2. **权限**（0.5 人日）：Adapter 的 ServiceAccount 需 `get/list/watch/patch skyl lmservings`
3. **KEDA 部署**（0.5 人日）：安装 KEDA，编写 `ScaledObject` + `TriggerAuthentication`（Prometheus 地址）
4. **联调**（2~3 人日）：注入负载，验证「GPU 指标 → maxReplicas → Serve 扩副本 → worker 扩 Pod」全链路
5. **压测校准**（2 人日）：确定阈值、冷却、步长；观察是否震荡
6. **前端**（1 人日）：加「GPU 阈值 / PromQL」配置项到创建页「高级配置」

**验收标准（建议）**

- 队列持续 > 阈值 90s 内，`maxReplicas` 上调且 Serve 副本随之增加
- GPU 打满但队列空闲时，**不触发扩容**（避免误扩）
- Prometheus 不可达时，弹性冻结且告警，副本数保持不变
- 缩容不导致正在处理的请求失败（`downscaleDelayS=600` + 优雅退出）

---

## 7. 风险

| 风险 | 影响 | 缓解 |
|---|---|---|
| Operator 每次 reconcile 重建 `serveConfigV2` | Adapter 改的值被覆盖 | 让 operator 从 CR 读 `Scale` 生成配置（现状即如此），Adapter 改 CR 而非直接改 RayService |
| KEDA 与 Serve autoscaler 同改副本 | 震荡 | 明确「KEDA 只写 maxReplicas，绝不写 num_replicas」 |
| GPU 指标口径误用 | 反向扩（无限扩） | 主信号用队列，GPU 仅辅助 + 联动规则（§4.3） |
| `maxReplicas` 默认 `maxInt32` | 不设上限时等于无上限 | 强制校验：`max × TP×PP×DP ≤ 配额卡数` |
| 指标基数过高 | Prometheus 压力大 | 用 `sum by (deployment)` 聚合，避免按 pod 拉全量 |

---

## 8. 待你拍板

1. **选哪个候选**：A（推荐）/ B / C
2. **GPU 指标是主信号还是辅助信号**：按 §4.3 的建议，我默认它是辅助 + 包络控制，主信号仍是队列
3. **KEDA 的扩缩对象**：是 `maxReplicas`（包络，推荐）还是直接当「副本数」用（会把 Serve autoscaler 架空）
4. **是否需要 0↔1**：GPU 冷启动分钟级，建议 `minReplicas ≥ 1`，不用 scale-to-zero
