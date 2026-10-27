# KEDA 与 KubeRay 弹性扩缩容能力调研

> 项目：算力加速平台-弹性扩缩容
> 日期：2026-10-26
> 用途：方案讨论底稿（B 阶段输入），不涉及具体实现
> 标注：✅ = 官方文档原文核实；🟡 = 基于通用机制/工程经验，**上线前需按第 6 节命令核实**

---

## 0. 结论摘要

0. **先摆正现状**：现场（cap-services）的弹性是 **Ray Serve Autoscaler（请求驱动）+ Ray 集群 autoscaler（需求驱动）两层**，**链路里没有 KEDA / HPA**。所以「基于 GPU 指标的弹性」是**新增一路信号**，不是改造现有弹性。
1. **KEDA 完全可以驱动 Ray**，但前提是目标 CRD 暴露 `/scale` 子资源。分工是：**0↔1 由 KEDA operator 自己改副本**，**1↔N 由 KEDA 生成的 HPA 执行**——不是「KEDA 完全不扩缩」。
2. **KEDA 的核心价值是「信号接入 + 0↔1 激活」**，不是替代 Ray 的调度。它对 GPU 指标没有原生认知，靠 Prometheus scaler 查 PromQL——所以「基于 GPU 指标」这件事，落在**写什么 PromQL**上，而不是 KEDA 的配置上。
3. **KubeRay 自带 in-tree autoscaler 是「需求驱动」而不是「指标驱动」**：它把待调度任务的资源需求与集群容量做比较来决定扩不扩，缩容只回收空闲节点。**GPU 利用率这类指标在经典 schema 里完全没有入口**（见 §2.3，已核对 ray-schema.json）；v2 是否有额外调优参数，本调研未核实。它和 KEDA 是两种完全不同的判断逻辑，同时开会打架。
4. **Ray Serve 还有一层应用级 autoscaler**（`target_ongoing_requests` 等），扩的是 Serve 副本，不是节点。注意：Ray 的这两层（集群层 + Serve 层）是**官方设计上互补**的（副本扩容→资源需求上升→集群扩容），不算冲突；真正的冲突只发生在 **KEDA 与其中任一层抢同一个对象**时（Ray 官方文档里明确写了这个「Serve 让节点空闲 → Ray 回收」的协作机制）。
5. **推荐方向（待讨论确认）**：KEDA 负责「按业务指标做 0↔1 与容量包络（min/max）」，**具体加几个 worker 由 Ray 按资源需求决定**。注意现场 **autoscaler 容器恒在**（见 §2.6），「关掉 autoscaler 让 KEDA 全权接管」不是可选项——两者通过**调参式解耦**避免双写。注意这里不是「KEDA 管前段、Ray 管后段」的分段，而是**阈值逻辑与需求逻辑各管一层**。

---

## 1. KEDA 能力盘点

### 1.1 架构与扩缩链路 ✅

```
事件源（Prometheus / 队列 / Cron …）
   │  KEDA operator 每 pollingInterval 轮询一次
   ▼
KEDA Metrics Server（把指标暴露成 external metric）
   ▼
HPA（KEDA 自动创建，命名默认 keda-hpa-{scaledobject-name}）
   ▼
目标资源（Deployment / StatefulSet / 带 /scale 子资源的 CRD）
```

- **0 ↔ 1（Activation）**：由 KEDA operator 用 scaler 的 `IsActive` 判定并直接改副本数 ✅
- **1 ↔ N（Scaling）**：由 **HPA controller** 执行，KEDA 只提供指标与目标值 ✅
- HPA 自己的轮询周期 `--horizontal-pod-autoscaler-sync-period`，默认 15s ✅
- 若 `minReplicaCount >= 1`，scaler 永远处于 active，**activation 阈值失效** ✅

### 1.2 ScaledObject 能力清单 ✅

| 字段 | 默认 | 作用 | 对本项目的意义 |
|---|---|---|---|
| `scaleTargetRef.{apiVersion,kind,name}` | apps/v1 / Deployment | 扩缩目标；**CRD 必须定义 `/scale` 子资源** | 能否直扩 RayCluster 的关键 |
| `pollingInterval` | 30s | 指标轮询间隔（0↔1 阶段由 KEDA 控制） | 决定响应速度下限 |
| `cooldownPeriod` | 300s | 最后一次 active 后**缩到 0** 的等待时间 | 仅作用于「缩到 0」 |
| `initialCooldownPeriod` | 0s | ScaledObject 创建后延迟启动 cooldown | 防新建即缩 |
| `idleReplicaCount` | 不启用 | 空闲副本数；**仅支持 0** | GPU 场景基本用不上 |
| `minReplicaCount` | 0 | 缩容下限 | 对应「最小模型副本」 |
| `maxReplicaCount` | 100 | 扩容上限（传给 HPA） | 对应「最大模型副本」 |
| `fallback.failureThreshold / replicas / behavior` | — | 连续失败 N 次后按固定/当前副本兜底 | 指标源挂掉时不至于乱缩 |
| `advanced.restoreToOriginalReplicaCount` | false | 删除 ScaledObject 后是否还原副本 | 策略下线时用 |
| `advanced.horizontalPodAutoscalerConfig.behavior` | — | 直接透传给 HPA 的 `behavior`（stabilizationWindowSeconds / policies） | 缩容抖动抑制 |
| `advanced.scalingModifiers.{formula,target,activationTarget,metricType}` | — | 多触发器合成一个指标（支持算术/三元/count） | GPU 显存压力 + 队列深度加权 |
| `triggers[].type / metadata / name` | — | 触发器定义；`name` 用于组合公式与 Prometheus 指标区分 | — |
| `triggers[].metricType` | `AverageValue` | `AverageValue` / `Value` | 决定 HPA 的副本计算公式 |
| `triggers[].useCachedMetrics` | false | 按 pollingInterval 缓存指标，降低源压力（cpu/memory/cron 不支持） | 高频 PromQL 时用 |
| 注解 `autoscaling.keda.sh/paused` / `paused-replicas` | — | 暂停扩缩（可用于维护窗口/人工兜底） | 运维开关 |
| 注解 `scaledobject.keda.sh/transfer-hpa-ownership` | — | 接管已有 HPA，避免双 owner | 现场已有 HPA 时必用 |

### 1.3 Prometheus scaler 字段 ✅

```yaml
triggers:
- type: prometheus
  metadata:
    serverAddress: http://prometheus:9090
    query: sum(ray_serve_deployment_queued_queries{...})   # 必须返回单元素 vector/scalar
    threshold: '8'
    activationThreshold: '1'
    ignoreNullValues: 'false'   # 默认 true=忽略空值；设 false 则指标丢失即报错（更安全）
    timeout: '1000'             # ms
    namespace / customHeaders / queryParameters / unsafeSsl
```

> **关键约束**：`query` 必须返回**单个** vector/scalar。要给多个工作负载做扩缩，就得**每个工作负载一个 ScaledObject**，不能一个 query 管一片。

### 1.4 扩缩对象能力边界 ✅

| 目标类型 | 是否支持 | 说明 |
|---|---|---|
| Deployment / StatefulSet | ✅ | 只需给 `name` |
| 任意 CRD | ✅ **当且仅当定义 `/scale` 子资源** | 需同时给 `apiVersion` 与 `kind` |
| RayService | ❌ | 副本数写在 `serveConfigV2` 字符串的 `num_replicas` 里，无法配 JSONPath（Ray 官方论坛确认） |
| RayCluster | 🟡 待核实 | 副本在 `spec.workerGroupSpecs[].replicas`（列表），是否暴露 `/scale` 需查 CRD |

### 1.5 KEDA 已知限制与坑 ✅

1. **缩容随机杀副本**：HPA 决定缩容时无法控制终止哪一个（官方明确承认），长任务可能被杀 → 需 `terminationGracePeriodSeconds` + `preStop` + SIGTERM 处理，或改用 `ScaledJob`
2. **activation 优先级高于 scaling**：`threshold=10`、`activationThreshold=50` 时，指标 40 会被判「不 active」→ 直接缩到 0
3. `cooldownPeriod` **只管缩到 0**，1↔N 的缩容抑制要靠 HPA 的 `behavior.stabilizationWindowSeconds`
4. `idleReplicaCount` 只支持 0
5. CPU/Memory scaler 不支持 `useCachedMetrics`，也不支持 `fallback`（fallback 仅支持 `AverageValue` 类）
6. KEDA 不感知 GPU/显存，所有 GPU 语义都要靠 PromQL 表达
7. **ScaledObject 与目标资源必须同 namespace** ✅
8. `fallback` 只支持 `ScaledObject`，**不支持 ScaledJob** ✅

---

## 2. KubeRay 能力盘点

> 本节主体已通过解码 KubeRay 官方样例、Ray 的 `ray-schema.json` 与 Serve 文档源文件核实；仅「RayCluster 是否暴露 `/scale`」仍待现场确认（见第 6 节 Q1）。

### 2.1 RayCluster 结构 ✅

来源：KubeRay `v1.3.0` 官方样例 `ray-cluster.autoscaler.yaml`（已解码核对）

```yaml
apiVersion: ray.io/v1
kind: RayCluster
metadata: { name: raycluster-autoscaler }
spec:
  rayVersion: '2.41.0'
  # 开启后，Autoscaler 以 sidecar 形式注入 head pod
  # 集成状态 Beta，要求 KubeRay >= 0.3.0 且 Ray >= 2.0.0
  enableInTreeAutoscaling: true
  autoscalerOptions:            # 可选；不写即用默认值
    upscalingMode: Default      # Default | Aggressive；Conservative 为限速模式
    idleTimeoutSeconds: 60      # 未被 Ray 使用的 worker pod，空闲多久后缩掉
    # 其余可覆盖项: image / imagePullPolicy / securityContext / env / envFrom / resources
  headGroupSpec:
    rayStartParams: { num-cpus: "0" }   # 避免任务调度到 head
    template: { ... }
  workerGroupSpecs:
  - groupName: small-group
    replicas: 0                 # 当前副本数，Autoscaler 通过 ±replicas 扩缩
    minReplicas: 0
    maxReplicas: 10
    rayStartParams: {}
    template: { ... }
```

关键语义（原文注释）：

- **`upscalingMode`**
  - `Conservative`：扩缩**限速**，未完成的 worker pod 数最多等于当前集群规模
  - `Default`：**不限速**
  - `Aggressive`：**Default 的别名**，同样不限速（不是我先前写的「更快但更激进」）
- **`idleTimeoutSeconds`**：worker pod **没有在使用 Ray 资源**时，等这么多秒再缩
- **缩容走名单制**：Ray Autoscaler 递减 `replicas` 的同时写入 `scaleStrategy.workersToDelete`，KubeRay operator 按这个名单**精确删指定 Pod**——所以缩容不是随机杀，而是「点谁删谁」

### 2.2 in-tree autoscaler 的判断依据：需求驱动，**不是指标阈值** ✅

形态：开启 `enableInTreeAutoscaling` 后，Autoscaler 作为 **head pod 里的 sidecar** 运行（Beta：KubeRay ≥ 0.3.0、Ray ≥ 2.0.0）。它只回答两个问题：

1. **要不要加 worker**：把「待调度任务的资源需求」+「运行中任务已占用的资源」+「actor 预留资源」近似加总成 **resource demand**（v1 的 `LoadMetrics` 口径，**具体构成待核实**），与集群现有容量比较。`demand > capacity` 就扩，扩多少受 `upscaling_speed` 与 `max_workers` 约束。
2. **要不要减 worker**：只回收**没有任务在跑的空闲节点**，需持续空闲 `idle_timeout_s` 才动。

所以它是**「综合判断」**——看的是「有没有活干不完」，而不是「某个指标超没超阈值」。

GPU 利用率这类指标在 Ray 里的真实角色：

- **v1（长期在用的那套）**：指标**不参与**扩缩决策，只做资源计数（`num-gpus` 这类资源声明）
- **v2（新 autoscaler）**：引入 `resource_tracker` / `ResourceProfileManager` 做**利用率画像与参数调优**（例如调 batch size、识别低效），扩缩决策仍以需求为主

> 这就是为什么「基于 GPU 指标的弹性」在 Ray 侧天然不成立：Ray 不认「利用率 80% 就扩」，它认「有多少卡的需求没被满足」。

### 2.3 Ray Autoscaler 参数：经典 schema 里**没有** GPU 阈值 ✅

核对 Ray master 的 `python/ray/autoscaler/ray-schema.json`（已解码核对，19KB 全量）后，经典 autoscaler 的配置项只有这些：

| 参数 | 作用（原文要点） |
|---|---|
| `cluster_name` / `provider` | 必填；provider.type 如 aws / gcp / azure / k8s |
| `max_workers` | 除 head 外最多 worker 节点数；不应大于各节点类型 `min_workers` 之和 |
| `upscaling_speed` | 扩容速度：每轮按 `upscaling_speed × 当前节点数` 分批扩容，需 > 0 |
| `idle_timeout_minutes` | 节点空闲多少分钟后移除 |
| `available_node_types.<type>.{min_workers,max_workers,idle_timeout_s,priority,resources,labels,node_config,docker}` | 每种节点类型的上下限、优先级、资源与标签 |
| `head_node_type` / `file_mounts` / `setup_commands` / `head_start_ray_commands` / `worker_start_ray_commands` … | 部署相关 |

> ⚠️ **重要纠正**：`gpu_utilization_threshold`、`gpu_memory_usage_threshold`、`resource_step_size`、`tune_interval_s` 这些「按 GPU 阈值扩缩」的参数，**在经典 schema 中并不存在**。我先前把它们列为 Ray 的扩缩参数是错的。它们若有，也只可能属于 Autoscaler v2 的「参数调优（parameter tuning）」范畴，**本调研未能核实，不应写进方案**。

**对方案的直接影响**：走经典 autoscaler，**Ray 侧没有任何 GPU 阈值旋钮**，它只用「资源需求 + 空闲超时」判断。要做「GPU 指标驱动」，旋钮只能放在 **KEDA 侧（PromQL 阈值）** 或 **Ray Serve 侧（并发数）**——这正好印证了 Ray 是综合判断、不是按指标扩缩。

### 2.4 三种弹性机制的真实差异（关键对比）

| 维度 | **KEDA** | **Ray 集群 autoscaler** | **Ray Serve autoscaler** |
|---|---|---|---|
| 触发依据 | 外部指标阈值（任意 PromQL） | **资源需求 vs 容量** + 空闲判定 | 每副本并发请求数 |
| 扩缩对象 | 副本数（Deployment / CR 的 replicas） | Ray worker 数（节点级） | Serve deployment 副本数 |
| 缩容策略 | 随机挑副本终止 | **只回收空闲节点** | 低于目标并发持续一段时间后缩 |
| 对 GPU 的理解 | 无（全靠 PromQL 表达） | 弱（资源计数；v2 才看利用率） | 无 |
| 语义层级 | 基础设施 | 集群容量 | 应用并发 |
| 可否 scale-to-zero | 可以（0↔1 由 KEDA 管） | 可以（`minReplicas: 0`） | 可以（`min_replicas: 0`） |
| 典型误用 | 用 GPU 利用率当扩容阈值 → 反向扩 | 与 KEDA 同时改同一 replicas → 双写 | 与 KEDA 同时管副本 → 双写 |

### 2.5 Ray Serve 应用层 autoscaler ✅

来源：Ray `doc/source/serve/autoscaling-guide.md`（已解码核对）

```yaml
- name: Model
  num_replicas: auto          # 开启自动扩缩的快捷写法
  max_ongoing_requests: 5     # 每副本并发上限（注意：不在 autoscaling_config 里）
  autoscaling_config:
    target_ongoing_requests: 2
    min_replicas: 1
    max_replicas: 100
```

| 参数 | 含义（原文要点） | 默认 |
|---|---|---|
| `num_replicas` | 手动副本数；设 `auto` 即启用自动扩缩 | 1 |
| `target_ongoing_requests` | **每副本**希望维持的平均并发请求数（请求越长、延迟目标越严，这个值越小） | 2（`auto` 模式下） |
| `max_ongoing_requests` | **每副本**并发上限；不属于 `autoscaling_config`，因为对所有部署都有意义 | 5（`auto` 模式下） |
| `min_replicas` | 副本下限；流量长期为 0 且能接受扩容时的尾部延迟，可设 0 | 1（`auto` 模式下） |
| `max_replicas` | 副本上限 | `auto` 模式 100；手动配置时基础默认是 **1**（不显式调高就不会扩） |
| `upscale_delay_s` / `downscale_delay_s` | 扩/缩容延迟（在「高级 autoscaling」文档里） | 🟡 未核实 |

**判断依据**：Serve autoscaler 监控**队列长度**并据此增减副本，不看 GPU。

**关键关系（原文）**：Ray Serve autoscaler 是**应用层**、架在 Ray Autoscaler 之上——
- Serve 按请求压力要求 Ray 启动 N 个副本 actor；
- 若 Ray Autoscaler 判断资源不足，它会去申请更多 Ray 节点；
- Serve 缩容时**尽量让节点变空闲**，好让 Ray Autoscaler 把节点回收掉。

→ 这直接说明：**Ray 的两层弹性是官方设计上互补的，不是冲突**；冲突只发生在 KEDA 介入、与其中任一层抢同一个对象时（见 §2.4）。

### 2.6 现场实际机制（客户架构图 + autoscaler 日志）✅

> 来源：客户提供的部署架构图与 autoscaler 实际日志。这一节推翻了我前面的一个假设，务必以本节为准。

**部署形态**

```
RayCluster (CRD)
└── ray-cluster-header (Pod)
    ├── ray-header   (Container)
    └── autoscaler   (Container)   ← 恒在
        │  ray init
        └── ray-cluster-worker (Pod) × N
            └── ray-worker (Container)
```

**关键结论：autoscaler 容器「常驻」——开不开 Serverless 都有它，区别只是参数配置。**

从 cap-services 源码看，**「常规 / Serverless」的开关其实在 Ray Serve 的部署配置层**，不是集群层：

| 层 | 常规模式 | Serverless 模式 |
|---|---|---|
| Ray Serve（部署级） | 设 `num_replicas`（固定副本），**不设** `autoscaling_config`（两者互斥） | 设 `autoscaling_config`（target/min/max/delay…），**不设** `num_replicas` |
| RayCluster（集群级） | autoscaler **始终运行**，头部 Pod 里的 `autoscaler` 容器常驻 | 同上 |

→ 所以「常规模式 = 不启用 autoscaler」是错的：**集群级 autoscaler 永远在跑**，常规模式只是不走 Serve 层的自动扩缩（副本数写死）。日志里的 `min_workers:1 / max_workers:1` 是该实例的集群侧配置，属于另一层参数。

**日志实证**（autoscaler 读到的 `available_node_types`，字段与我核实的经典 schema 完全一致）：

| 节点类型 | min_workers | max_workers | CPU | GPU | memory | 其它 |
|---|---|---|---|---|---|---|
| `headgroup` | 0 | 0 | 0 | — | 8 GiB (8589934592) | `labels: {}` `node_config: {}` |
| `ray-worker` | 1 | 1 | 32 | 1 | 10 GiB (10737418240) | `dummy-gpu: 1`、`labels: {}` |

值得注意的三点：

1. **head 不承载任务**：`headgroup` CPU=0、max_workers=0
2. **自定义资源 `dummy-gpu`**：除 `GPU: 1` 外还声明了一个 `dummy-gpu: 1` 的自定义资源（用途待确认，可能用于 vGPU/显存超分的记账或调度占位）
3. **min=max 时 autoscaler 仍在工作**：它照常计算需求，只是没有可扩的余量——所以「固定规格」与「弹性规格」在 Ray 侧是同一套代码、不同参数

### 2.7 现场实现：cap-services 的代码级机制 ✅

> 来源：`docs/GTCB/cap-services 推理服务与弹性扩缩容机制深度调研.md`（基于 cap-services 源码）。**这一节是现状的权威描述，优先级高于本文件其他章节的推断。**

**CRD 与两条后端路径**

| Provider | ResourceType | 工作负载 | 弹性 |
|---|---|---|---|
| `KubeRay`（主路径） | `RayService` | RayService → RayCluster → Ray Serve `serve:model` → vLLM | ✅ Ray Serve Autoscaler |
| `Kubernetes`（边缘） | `Replicaset` | ReplicaSet | ❌ 仅静态 `InitialReplicas` |

**弹性是两层叠加，不是一层**

```
请求压力（ongoing requests）
   ▼
Ray Serve Autoscaler（部署级，读 AutoscalingConfig）   ← 决定「几个副本」
   ▼  副本变多 → Ray 资源需求上升
Ray 集群 Autoscaler（head Pod 内 autoscaler 容器）      ← 决定「几个 worker Pod」
   ▼
worker Pod 数 = ceil(vllmGpus / podGpus)，vllmGpus = tp × pp × dp
```

**`Scale` → Ray Serve `AutoscalingConfig` 的字段映射（含默认值）**

| CRD `Scale` 字段 | 默认 | → Serve 参数 | 说明 |
|---|---|---|---|
| `targetOngoingRequests` | **10** | `target_ongoing_requests` | 每副本目标并发 |
| `maxOngoingRequests` | **20** | `max_ongoing_requests` | 每副本并发上限（限流） |
| `minReplicas` | 1 | `min_replicas` | 副本下限 |
| `maxReplicas` | 1 | `max_replicas` | 副本上限 |
| `initialReplicas` | 1 | `initial_replicas` | 初始副本，需 ∈ [min,max] |
| `upscaleDelayS` | **30** | `upscale_delay_s` | 扩容冷却 |
| `downscaleDelayS` | **600** | `downscale_delay_s` | 缩容冷却 |
| `upscalingFactor` / `downscalingFactor` | 1 / 1 | 同名参数 | 扩缩步长系数 |
| `metricsIntervalS` / `lookBackPeriodS` | 10 / 30 | 同名参数 | 采样间隔 / 回溯窗口 |

> 💡 **与已还原页面完全对得上**：创建页的「最小模型副本 1 / 最大模型副本 1 / 缩容检测窗口 600 / 目标请求数 10.0 / 最大请求数 20.0」**就是这张表的默认值**；「Pod数量 =（模型副本 × TP × PP × DP）/ 规格卡数」也正是 `ceil(vllmGpus/podGpus)` 的中文表述。页面不是拍脑袋设计的，是照着 CRD 抄的。

**其它关键实现细节**

- **`RAY_enable_autoscaler_v2`**：controller 里引用了该开关 → **现场用的是 Ray Autoscaler v2**（这回答了我之前「v1 还是 v2」的疑问）
- **`dummy-gpu`**：在 Ray placement group / `RayActorOptions` 里用虚拟资源名 **预留** GPU，而不是直接声明真实 GPU；另有 Metax GPU 分支 → 它不是配额记账，是**调度占位**（回答上一轮的问题）
- **Kueue**：配额/排队/抢占交给 LocalQueue/ClusterQueue；`AnnotationElasticJob=true` 常置，标记为弹性作业；`EnableGangScheduling` 保证多卡一次性拿齐
- **状态回写**：`RayCluster` 控制器累加 `workerGroupSpecs[].replicas` 回写 `SkyLLMServing.Status.Replicas`，前端看到的副本数来自这里
- **Suspend**：KubeRay 路径下删除 Kueue 标签 + 删 RayCluster；上游 Kueue 会强清 suspend，属已知 workaround
- **BUG-1126**：KubeRay 不把 RayService 的 `replicas`/`scaleStrategy` 变更传播到 RayCluster（零停机升级路径除外），需 `AnnotationReplicas` 中转

**对「基于 GPU 指标的弹性」的直接含义**

> **现状链路里完全没有 KEDA / HPA**。弹性信号是「进行中请求数」，不是 GPU 利用率。
>
> 所以新需求不是「改造现有弹性」，而是在这条链路上**新增一路信号源**。可选位置只有三处：
> ① 改 Serve autoscaler 的判定信号（Ray 侧扩展，需改代码）
> ② 在 Serve autoscaler 之上加 KEDA 调 `min/max_replicas` 包络（不动 Ray 代码）
> ③ 在集群侧用 KEDA 调 workerGroup 的 `minReplicas/maxReplicas`

## 3. 三条打通路径（方案候选）

| 路径 | 做法 | 优点 | 风险/代价 |
|---|---|---|---|
| **A. KEDA 直扩 RayCluster** | `ScaledObject.scaleTargetRef` 指向 `RayCluster`，走其 `/scale` | 配置最少、纯声明式、与现有 KEDA 运维经验一致 | 依赖 RayCluster 暴露 `/scale`（待核实）；**现场 autoscaler 恒在 → 双写必然发生**（不是「如果开了才冲突」） |
| **B. KEDA external scaler + 中间服务** | KEDA 回调自建服务，由服务调 Ray/KubeRay API 改 workerGroup | 完全可控、可做业务语义（按租户/优先级裁决） | 多一个组件要维护，回滚成本高 |
| **C. KEDA 只调参，Ray 执行** | KEDA 改 RayCluster 的 `minReplicas/maxReplicas`（容量包络），**实际扩多少由 Ray 按资源需求决定** | 无双写；缩容走 idle 判定，不会杀活任务；与 Ray 的需求驱动天然契合 | 「谁在扩」变间接，可解释性差；响应链更长 |

**判断（待讨论）**：C 在 GPU 场景最安全（缩容不杀任务），A 最省事但双写风险高，B 适合后续做多租户配额裁决。

> ⚠️ **看到 cap-services 源码后要修正这条判断**：现场 autoscaler **恒开**，且弹性在 **Serve 层**（不是集群层）。所以 A 不只是「双写风险」，而是**必然与一个永远在跑的 autoscaler 抢副本**。真正可行的落点是：

| 候选 | 做法 | 需要 cap-services 侧配合 |
|---|---|---|
| **① 改 Serve autoscaler 的信号** | 在 Ray Serve 的 autoscaling 逻辑里引入 GPU 指标 | 深改 Ray/Ray Serve，成本最高 |
| **② KEDA 调 `min/max_replicas` 包络** | KEDA 只改上下限，Serve autoscaler 在区间内按请求扩缩 | 需要能写进 `serveConfigV2`（字符串），**没有现成接口** |
| **③ operator 自己读 Prometheus 调包络** | cap-services 增加一个 controller，按 GPU 指标改 `Scale.minReplicas/maxReplicas` | 只要改自家 operator，**不引入 KEDA** |
| **④ KEDA → SkyLLMServing 的 `/scale`** | 给 CRD 加 `/scale` 子资源，KEDA 直接调 | 要改 CRD + 解决「/scale 只有一个整数字段，而我们要 min 和 max 两个」 |

> 「用 KEDA」在现状下**反而比「operator 自己读指标」更绕**：KEDA 的 `/scale` 模型只表达单个副本数，而弹性包络是 min/max 两个量。这点必须在下一次讨论里说清。



---

## 4. 与已还原页面的字段映射（代码级核实）

> 依据：cap-services 的 `Scale` struct 与 `buildServerConfigV2`。**页面字段与 CRD 字段是一一对应的，默认值也完全一致。**

| 页面字段 | 实际落点 | 默认值 | 备注 |
|---|---|---|---|
| 弹性模式 · 常规模式 | Serve `num_replicas`（固定副本），**不设** `autoscaling_config` | — | 两者互斥 |
| 弹性模式 · Serverless | Serve `autoscaling_config` | — | 副本区间交给 autoscaler |
| 最小模型副本 | `Scale.minReplicas` → `min_replicas` | **1** | ✅ 与页面一致 |
| 最大模型副本 | `Scale.maxReplicas` → `max_replicas` | **1** | ✅ 与页面一致 |
| 缩容检测窗口 | `Scale.downscaleDelayS` → `downscale_delay_s` | **600** | ✅ 与页面一致 |
| 目标请求数 | `Scale.targetOngoingRequests` → `target_ongoing_requests` | **10** | ✅ 与页面一致 |
| 最大请求数 | `Scale.maxOngoingRequests` → `max_ongoing_requests` | **20** | ✅ 与页面一致 |
| 模型副本数（常规模式） | `num_replicas` | 1 | — |
| （页面未暴露）扩容冷却 | `Scale.upscaleDelayS` → `upscale_delay_s` | **30** | 建议补进页面：突发流量时 30s 冷却影响明显 |
| （页面未暴露）扩缩步长 | `upscalingFactor` / `downscalingFactor` | 1 / 1 | 建议补进页面（高级配置） |
| （页面未暴露）采样/回溯 | `metricsIntervalS` / `lookBackPeriodS` | 10 / 30 | 建议补进页面（高级配置） |
| 规格卡片数 / Pod 数量 | `vllmGpus = tp × pp × dp`；`pod 数 = ceil(vllmGpus / podGpus)` | — | 与创建页说明文字同源 |
| 资源监控图表 | Prometheus（DCGM GPU 指标 + Ray/Serve 指标） | — | 待接；DCGM 字段见 §7 |

> 📌 **产品建议**：页面目前只暴露了 5 个弹性参数，而 CRD 实际有 10 个。缺的 5 个里，「扩容冷却 30s」「扩缩步长」对实际行为影响最大，建议放到「高级配置」里。

## 5. 对方案的关键问题（下次讨论要拍板的）

1. **决策权归谁**：KEDA（阈值）/ Ray in-tree（需求）/ Ray Serve（并发），三选一；还是分层——KEDA 定容量包络与 0↔1，Ray 按需求决定实际 worker 数？两种逻辑混用会互相抵消。
2. **主信号**：GPU 利用率（DCGM_FI_DEV_GPU_UTIL，是「kernel 活跃时间占比」，batch 打满属正常）不适合单独做扩容信号；队列深度 / ongoing requests / KV cache 更贴近压力
3. **scale-to-zero 要不要**：GPU 冷启动 + 模型加载是分钟级，`minReplicaCount=0` 对在线推理基本不可用
4. **KTransformer 路径差异**：vLLM 走 Ray 集群监控，KTransformer 是原生指标；弹性链路上是否也是两套（如 KTransformer 用 sglang 原生 autoscaler）
5. **双写防护**：现场 `enableInTreeAutoscaling` 是否开着？开了就必须二选一或加互锁

---

## 6. 待核实 / 待决策清单

### 6.1 已被 cap-services 源码解答（原待核实项）

| 原问题 | 结论 |
|---|---|
| Ray 用 v1 还是 v2 autoscaler | **v2**（controller 里引用了 `RAY_enable_autoscaler_v2`） |
| `dummy-gpu` 是什么 | Ray placement group 里**预留 GPU 的虚拟资源名**，不是配额记账 |
| 「缩容检测窗口 600s」落点 | `Scale.downscaleDelayS` → `downscale_delay_s`，默认就是 600 |
| 「目标/最大请求数」落点 | `targetOngoingRequests` / `maxOngoingRequests` → Serve 同名参数，默认 10 / 20 |
| 「常规 vs Serverless」差异 | Serve 层 `num_replicas` vs `autoscaling_config`，不是关 autoscaler |

### 6.2 仍需确认

| # | 问题 | 为什么重要 | 怎么查 |
|---|---|---|---|
| Q1 | `serveConfigV2` 能否被外部安全改写（改 min/max_replicas） | 决定候选 ② 是否可行 | 看 operator 是否每次 reconcile 都重建 config；有无注解可覆盖 |
| Q2 | 给 `SkyLLMServing` 加 `/scale` 子资源改造成本 | 决定候选 ④（KEDA 直调）是否可行 | 需 cap-services 团队评估；且 `/scale` 只能表达单个整数副本 |
| Q3 | 边缘路径（Kubernetes/ReplicaSet）要不要 GPU 弹性 | 该路径当前**完全无弹性** | 产品确认 |
| Q4 | Kueue 与弹性作业的交互（`AnnotationElasticJob` 的实际效果） | 扩缩容时配额是否跟着变、会不会被抢占 | 压测验证 |
| ~~Q5~~ | ~~RayCluster CRD 是否暴露 `/scale`~~ | **已核实：没有** | 见下方 6.3 |

### 6.3 已核实的关键约束：RayCluster **没有** `/scale` ✅

核对 KubeRay v1.3.0 `raycluster_types.go` 的 kubebuilder 标记：

```go
// +kubebuilder:object:root=true
// +kubebuilder:resource:categories=all
// +kubebuilder:subresource:status        ← 只有 status
// +kubebuilder:storageversion
// +kubebuilder:printcolumn:...
```

**只有 `subresource:status`，没有 `subresource:scale`。** 加上 RayService 的副本数写在 `serveConfigV2` 字符串里（同样配不了 `/scale`），结论是：

> **KEDA 无法直接扩缩任何 Ray 对象**（RayCluster / RayService 都没有 `/scale`）。「KEDA 读 GPU 指标 → 直接改 Ray 副本」这条路走不通，必须绕一层。

顺带核实到的两个细节：

- `workerGroupSpecs[].idleTimeoutSeconds` 的注释明确写着「**v2 autoscaler** terminates an idle worker pod」，再次确认现场用 v2
- `maxReplicas` 的 kubebuilder 默认值是 **`maxInt32`**（2147483647）——若不显式设置上限，等于没有上限，这点在做配额校验时要特别注意


## 7. 参考来源

| 主题 | 来源 | 状态 |
|---|---|---|
| ScaledObject 全字段规范 | [KEDA ScaledObject specification v2.17](https://keda.sh/docs/2.17/reference/scaledobject-spec/) | ✅ 已核实 |
| 两阶段扩缩 / 阈值语义 / 长任务缩容 / HPA 归属 | [KEDA Scaling Deployments v2.17](https://keda.sh/docs/2.17/concepts/scaling-deployments/) | ✅ 已核实 |
| Prometheus scaler 字段 | [KEDA Prometheus scaler v2.17](https://keda.sh/docs/2.17/scalers/prometheus/) | ✅ 已核实 |
| RayService 不能直接被 KEDA 扩 | [Ray 论坛 #13714](https://discuss.ray.io/t/autoscaling-ray-service-with-keda/13714) | ✅ 已核实 |
| KubeRay autoscaler 样例（已解码核对） | [ray-cluster.autoscaler.yaml v1.3.0](https://github.com/ray-project/kuberay/blob/v1.3.0/ray-operator/config/samples/ray-cluster.autoscaler.yaml) | ✅ 已核实 |
| Ray autoscaler 经典配置 schema（已解码核对） | [ray-schema.json](https://github.com/ray-project/ray/blob/master/python/ray/autoscaler/ray-schema.json) | ✅ 已核实 |
| Ray Serve autoscaling 参数与两层关系（已解码核对） | [autoscaling-guide.md](https://github.com/ray-project/ray/blob/master/doc/source/serve/autoscaling-guide.md) | ✅ 已核实 |
| 现场实现（cap-services 代码级机制） | [cap-services 推理服务与弹性扩缩容机制深度调研.md](./cap-services%20推理服务与弹性扩缩容机制深度调研.md) | ✅ 源码级 |
| GPU 指标语义（DCGM 字段） | [技术调研-GPU指标与弹性扩缩容.md](../GPU弹性调度/技术调研-GPU指标与弹性扩缩容.md)（GPU_UTIL / SM_ACTIVE / FB_USED …） | ✅ 已核实（另文；该目录若废弃需迁入本目录） |
