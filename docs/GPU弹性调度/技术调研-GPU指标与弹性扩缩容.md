# GPU 指标驱动的弹性扩缩容 - 技术调研

> 用途：GPU 指标弹性调度需求分析的技术底稿（A2 阶段输入）
> 调研日期：2026-10-26
> 标注约定：✅ = 官方文档核实原话；🟡 = 通用机制/个人工程经验，未逐条核对；❌ = 推断（未证实，不得进 PRD）

---

## 1. 指标链路：GPU 指标怎么进到扩缩容决策里

```
GPU (nvidia-smi / DCGM)  +  Ray 应用指标（队列/并发/副本）
    │  DCGM Exporter（DaemonSet，暴露 /metrics）+ Ray metrics
    ▼
Prometheus
    │
    ├──► KEDA operator（prometheus scaler，直查 PromQL）──► HPA（KEDA 自动生成）
    │                                                        │
    │                                                        └──► 扩缩 Ray（RayCluster / RayService）
    │                                                             ↑ 客户选定的主路径：扩 Ray，不扩 Pod
    └──► Ray 侧（resource_tracker / Ray metrics）──► Ray Autoscaler（worker 数，in-tree）
```

> **主路径（客户确认）**：KEDA 读 Prometheus 指标 → 扩缩 **Ray**，而不是扩 K8s Pod。
> 注意：KEDA 内部仍会生成一个 HPA，由 HPA controller 执行 1↔N 的实际写入——所以「用 KEDA」≈「用 KEDA + 它生成的 HPA」，不是两套并行机制。

职责边界：

| 层 | 改什么 | 决策者 | 生效方式 |
|---|---|---|---|
| Ray 集群层（主路径） | RayCluster worker replicas / Ray worker 数 | **KEDA**（Prometheus 指标驱动） | KEDA → 生成的 HPA → 目标 CR 的 scale 接口 |
| Ray 集群层（备路径） | 同上 | Ray Autoscaler（in-tree） | Ray 自己按资源需求加/减 worker |
| Ray 应用层 | Ray Serve deployment 副本数 | Ray Serve autoscaler | 在已有 Ray 资源内增减副本 |
| K8s Pod 层 | 非 Ray 工作负载的 Pod 数 | 独立 HPA（如有） | 扩 `replicas`，Pod 重建 |

---

## 2. GPU 指标字典（DCGM Exporter）

**核实来源**：阿里云 ACS《GPU pod monitoring metrics》，明确声明兼容开源 DCGM Exporter。✅

### 2.1 资源类（低开销，高频采集）

| 指标 | 字段 | 单位 | 语义（官方） |
|---|---|---|---|
| GPU 利用率 | `DCGM_FI_DEV_GPU_UTIL` | % | 采样周期内**有一个或多个 kernel 处于 active 的时间占比**；只表示「有 kernel 在跑」，**不区分 kernel 在干什么** |
| 显存已用 | `DCGM_FI_DEV_FB_USED` | MiB | 已用帧缓冲（显存） |
| 显存总量 | `DCGM_FI_DEV_FB_TOTAL` | MiB | 显存总容量 |
| 编码利用率 | `DCGM_FI_DEV_ENC_UTIL` | % | 硬件编码引擎活跃时间占比 |
| 解码利用率 | `DCGM_FI_DEV_DEC_UTIL` | % | 硬件解码引擎活跃时间占比 |
| 显存带宽利用率 | `DCGM_FI_DEV_MEM_COPY_UTIL` | % | 峰值显存带宽占用比例 |

### 2.2 Profile 类（需 profiling，开销更高）

| 指标 | 字段 | 语义要点（官方） |
|---|---|---|
| SM 活跃度 | `DCGM_FI_PROF_SM_ACTIVE` | 至少一个 warp 活跃的 SM 时间占比；**< 0.5 表示 GPU 使用效率低，> 0.8 才算高效** |
| SM 占用率 | `DCGM_FI_PROF_SM_OCCUPANCY` | 常驻 warp / SM 最大 warp 数；**占用率高 ≠ 利用率高** |
| DRAM 活跃度 | `DCGM_FI_PROF_DRAM_ACTIVE` | 显存读写周期占比；**实际可达上限约 80%** |
| Tensor Core 活跃度 | `DCGM_FI_PROF_PIPE_TENSOR_ACTIVE` | Tensor(HMMA/IMMA) 管线活跃周期占比 |
| NVLink / PCIe 吞吐 | `DCGM_FI_PROF_NVLINK_RX/TX_BYTES`、`DCGM_FI_PROF_PCIE_RX/TX_BYTES` | 互联带宽实际速率（Counter） |

### 2.3 健康/功耗类

`DCGM_FI_DEV_SM_CLOCK`（MHz）、`DCGM_FI_DEV_GPU_TEMP`（℃）、`DCGM_FI_DEV_MEMORY_TEMP`、
`DCGM_FI_DEV_POWER_USAGE`（W）、`DCGM_FI_DEV_RETIRED_SBE/DBE`、`DCGM_FI_DEV_NVSWITCH_FATAL_ERRORS`（XID）

### 2.4 可用维度（做聚合/下钻的关键）

`namespace`、`pod`、`Hostname`、`NodeName`、`UUID`、`device`（如 nvidia0）、`gpu`（如 0）、`modelName`

> ⚠️ **重要推论（写进需求的口径约束）**：`DCGM_FI_DEV_GPU_UTIL` 是「kernel 活跃时间占比」，**不是算力饱和度**。batch 推理把 GPU 打满 100% 是正常状态，此时**不应该扩**；反而是「利用率中等但排队变长」才是要扩的信号。把 GPU_UTIL 直接当 HPA 目标值，会得到与需求相反的扩缩行为。

---

## 3. HPA（Kubernetes Horizontal Pod Autoscaler）

🟡 通用机制（K8s 官方行为，未逐条核对本文版本号）：

- 只决定 **Pod 副本数**，不感知 GPU 型号/卡数；Pod 请求 GPU 时，副本数 × 每 Pod 卡数 = 总卡占用
- 指标来源三类：`Resource`（CPU/内存）、`Custom`（需 metrics adapter，如 prometheus-adapter）、`External`（集群外指标）
- `behavior.scaleUp` / `behavior.scaleDown`：`stabilizationWindowSeconds`（稳定窗口，抑制抖动）、`policies`（每轮最大变化量 / 百分比）、`selectPolicy`
- 默认容忍度 `--horizontal-pod-autoscaler-tolerance` 10%，指标在目标值 ±10% 内不动
- 控制器同步周期 `--horizontal-pod-autoscaler-sync-period`，默认约 15s
- **缩容风险**：HPA 决定缩容时不保证挑「空闲」副本，长任务可能被杀（见 §4.5 同源问题）

> 关键限制：HPA 需要一个「目标值」来算 `期望副本数 = ceil(当前副本数 × 当前指标值 / 目标值)`。GPU 场景下这个公式的语义很容易失真——见 §6。

---

## 4. KEDA（CNCF Kubernetes Event-driven Autoscaling）

**核实来源**：KEDA 官方文档 v2.17 ✅（activation/scaling 两阶段、阈值语义、HPA 归属权、长任务缩容、pause 注解等）

### 4.1 核心机制：KEDA 不自己扩 1→N

官方原文要点：
- KEDA **监控事件源并把数据喂给 HPA**，由 HPA 驱动实际扩缩
- **Activation 阶段**：KEDA operator 用 scaler 的 `IsActive` 判断 **0 ↔ 1**（scale-to-zero / 从零拉起）
- **Scaling 阶段**：一旦 ≥1，后续 **1 ↔ N** 由 **HPA controller** 按 ScaledObject 生成的 HPA 执行
- 若 `minReplicaCount >= 1`，scaler 永远 active，activation 值被忽略

### 4.2 两套阈值

| 概念 | 字段 | 作用 |
|---|---|---|
| 激活阈值 | `activationThreshold` | 决定 0↔1；**必须「大于」才激活**（等于不激活）；默认 0 |
| 扩缩阈值 | `threshold` | 传给 HPA 作为目标值，决定 1↔N |
| 优先级 | — | activation 优先级**高于** scaling（例：threshold=10、activationThreshold=50，指标 40 时判定不 active → 直接缩到 0） |

### 4.3 ScaledObject 关键字段（以 prometheus scaler 为例）

```yaml
spec:
  scaleTargetRef: { name: my-deployment }
  minReplicaCount: 1        # GPU 作业通常不能是 0（冷启动/模型加载分钟级）
  maxReplicaCount: 12
  pollingInterval: 30       # 轮询间隔（秒）
  cooldownPeriod: 300       # 缩容冷却（秒）
  advanced:
    horizontalPodAutoscalerConfig:
      behavior:
        scaleDown: { stabilizationWindowSeconds: 15 }
  triggers:
  - type: prometheus
    metadata:
      serverAddress: http://prometheus:9090
      query: <PromQL，必须返回单元素 vector/scalar>
      threshold: '0.8'          # 扩缩目标
      activationThreshold: '0.1' # 0↔1 激活
      ignoreNullValues: 'false'  # 指标丢失时的行为：false=报错更安全
```

### 4.4 其它有用能力

- `useCachedMetrics`：按 `pollingInterval` 缓存指标，显著降低 scaler 对 Prometheus 的压力（cpu/memory/cron scaler 不支持）
- **Scaling Modifiers**：`advanced.scalingModifiers.formula` 支持多 trigger 组合成一个指标（算术/三元/嵌套/count），例如「(队列深度 + 显存压力)/2」，并支持 `activationTarget`
- **暂停扩缩**：注解 `autoscaling.keda.sh/paused: "true"` 或 `autoscaling.keda.sh/paused-replicas: "0"` — 适合「维护窗口冻结弹性」，也适合「指标异常时人工兜底」
- **接管已有 HPA**：`scaledobject.keda.sh/transfer-hpa-ownership: "true"` + `advanced.horizontalPodAutoscalerConfig.name` —— **如果现场已有 HPA 在跑同一 workload，这一点直接决定改造方案**

### 4.5 长任务缩容的已知坑（官方明确承认）

> 官方原文：HPA 缩容时「无法控制哪 N 个副本被终止」——可能杀掉一个已经跑了 2.9 小时/共 3 小时的副本。

缓解手段：
1. `terminationGracePeriodSeconds` + `preStop` hook + 容器捕获 `SIGTERM`，处理完当前批次再退出（代价：Pod 长时间处于 `Terminating`）
2. 改用 `ScaledJob`（K8s Job 语义），而不是 Deployment

→ **对 GPU 作业的直接影响**：训练/长时间推理不能靠「HPA 随机杀 Pod」缩容，必须由 Ray 侧「空闲 worker」判定，或作业本身可中断（checkpoint）。

---

## 5. Ray 自带的弹性扩缩容

> 🟡 因 `docs.ray.io` 返回 429、GitHub raw/镜像被截断，本节参数名基于既有工程经验整理，**上线前需按 `python/ray/autoscaler/ray-schema.json` 逐条核对**（列入待办）。

### 5.1 三个不同层次的「弹性」，不要混为一谈

| 层次 | 组件 | 扩缩对象 | 触发信号 |
|---|---|---|---|
| 集群层 | Ray Autoscaler | Ray node / worker 数 | 资源需求（GPU/CPU 请求）与利用率 |
| 应用层 | Ray Serve autoscaler | Serve deployment 副本数 | `target_ongoing_requests`（排队/并发请求数）、`upscale_delay_s`/`downscale_delay_s` |
| 调度层 | Ray scheduler | 任务→节点放置 | 资源可用性（不扩缩，只调度） |

### 5.2 Ray Autoscaler 资源驱动（resource-based tuning）

机制：Autoscaler 周期性采样「资源利用率」，按阈值决定加/减 worker；参数主要分两组——

- 边界：`min_workers` / `max_workers`（不同类型节点各自配置）
- 信号：GPU/CPU 利用率阈值、显存使用阈值、每轮扩缩步长、采样/调优周期、启动延迟
- 配套：`ray.util.resource_tracker`（记录运行中任务的资源占用）、`ResourceProfileManager`（资源画像）
- 与参数驱动（parameter-based tuning）的区别：后者调的是作业参数（batch size 等），不加减 worker

### 5.3 KubeRay 场景

- `RayCluster` 可开 `enableInTreeAutoscaling`，配 `minReplicas` / `maxReplicas`
- 此时 Ray Autoscaler 与 KEDA **都能改 RayCluster 的 worker 副本** → **双写冲突**，见 §6.1

### 5.4 KEDA 直接扩 Ray 的接入路径（主路径，含已知障碍）

客户选定：KEDA 读 Prometheus 指标扩缩 Ray。落地时命中一个**结构性约束**：

> KEDA 扩自定义资源（CRD）的**唯一要求是该 CRD 定义了 `/scale` 子资源**（KEDA 官方「Scaling Custom Resources」章节）✅

由此产生三个待核实点 / 三条候选路径：

| 路径 | 做法 | 已知情况 |
|---|---|---|
| **A. 直扩 RayCluster** | `ScaledObject.scaleTargetRef` 指向 `RayCluster`，由其 `/scale` 子资源写入 | RayCluster 的副本在 `spec.workerGroupSpecs[].replicas`（列表），**是否暴露 `/scale` 需核实** |
| **B. KEDA external scaler** | KEDA 通过 external scaler 回调自建服务，由该服务调用 Ray（Ray autoscaler / KubeRay API）改 workerGroup 副本 | 可控性最强，但要自建一个中间组件（违反「不新造轮子」的初衷，需权衡） |
| **C. KEDA 只调上限，Ray 执行** | KEDA 不改副本，而是调整 RayCluster 的 `min/max_workers` 或 Ray 的资源需求，由 Ray Autoscaler 实际增减 | 无 `/scale` 依赖，但响应链更长，且「谁真正在扩」更难解释 |

**已确认不可行的**：直接扩 `RayService`。Ray Serve 的副本数写在 `serveConfigV2` 字符串里（`num_replicas`），无法配 `specReplicasPath` 的 JSONPath —— Ray 官方论坛有明确讨论 ✅（[discuss.ray.io #13714](https://discuss.ray.io/t/autoscaling-ray-service-with-keda/13714)）

> 结论：**「KEDA 扩 Ray」在方案层是成立的，但在 CRD 接口层还差一个 `/scale` 子资源**。这必须写进需求（作为约束与风险），并在 A3 用 A/B/C 三选一。

---

## 6. 三层弹性的冲突点（需求分析的核心）

### 6.1 双写 / 三写冲突

| 冲突 | 场景 | 后果 |
|---|---|---|
| C1 KEDA vs Ray in-tree | `enableInTreeAutoscaling` 开着，同时 KEDA 也在改同一 RayCluster 的 worker 副本 | 两边互相覆盖，副本数震荡，调度器读到过期状态 |
| C2 缩 worker 时 worker 上有活 | KEDA 缩 worker，但该 worker 正承载 actor / Serve 副本 | actor 被杀 / 任务重试 / KV cache 丢失 |
| C3 扩缩延迟级联 | Serve 副本扩 → 需要 Ray 资源 → RayCluster 满 → 再拉新 node（分钟级） | 用户看到「扩了但没变快」，SLA 抖动 |

### 6.2 GPU 指标作为扩缩信号的三个悖论

1. **利用率悖论**：GPU_UTIL 100% 是 batch 作业的正常态，用它做「扩容触发」会无限扩；用它做「缩容触发」又会在 kernel 空转时误缩
2. **显存悖论**：显存高（KV cache 满）确实该扩，但显存是**模型权重 + KV cache** 的混合量，不拆开就无法判断是「模型太大」还是「请求太多」
3. **反馈延迟悖论**：GPU 指标 15~30s 采集周期 + HPA 15s 同步 + Pod 启动 + 模型加载，一次真实扩容可能 1~3 分钟；期间指标已经变化，容易过冲

### 6.3 结论方向（供 A3 选方案，不在 A2 定稿）

- **信号分层**：扩缩主信号用「业务侧压力」（队列深度 / 待处理请求 / KV cache 占比），GPU 利用率与 SM_ACTIVE 只做「健康度/辅助确认」
- **单点决策权**：同一条扩缩链路上只能有一个执行者（要么 Ray，要么 K8s），另一方只读
- **缩容靠优雅退出**：GPU 作业缩容必须走 idle 判定 / SIGTERM 等待 / checkpoint，不能靠随机杀 Pod

---

## 7. 引用来源

| 主题 | 来源 |
|---|---|
| DCGM 指标字段与语义（兼容 DCGM Exporter） | [阿里云 ACS GPU pod monitoring metrics](https://help.aliyun.com/en/cs/user-guide/acs-gpu-pod-monitoring-indicators) ✅ |
| KEDA 两阶段扩缩 / 阈值语义 / HPA 归属 / 长任务缩容 | [KEDA Scaling Deployments (v2.17)](https://keda.sh/docs/2.17/concepts/scaling-deployments/) ✅ |
| KEDA prometheus scaler 字段 | [KEDA Prometheus scaler (v2.17)](https://keda.sh/docs/2.17/scalers/prometheus/) ✅ |
| KEDA + DCGM 做 GPU 扩缩的既有实践 | [Azure AKS: Autoscale GPU workloads with KEDA](https://learn.microsoft.com/en-us/azure/aks/autoscale-gpu-workloads-with-keda)、[阿里云 ACK: 基于 GPU 指标自动伸缩](https://www.alibabacloud.com/help/en/ack/ack-managed-and-ack-dedicated/user-guide/enable-auto-scaling-based-on-gpu-metrics-1) |
| Ray Autoscaler / KubeRay 参数 | ⚠️ 未在线核实（docs.ray.io 429），待核对 `ray-schema.json` |
