# 测试用例清单（v1.0）

- 范围
  - 覆盖用户故事文档的 7 个模块：授权引导、意图与控制准入、设备控制、状态自动上报、设备发现与词典、知识问答、对话记忆
- 命名规范
  - 用例 ID：`TC-<模块简称>-<序号>`，示例：`TC-AUTH-01`
- 优先级
  - P0：核心路径，必须通过；P1：重要增强；P2：兼容/性能/长期风险
- 测试类型
  - 功能、性能、安全、兼容、易用性
- 数据准备
  - 至少 1 个品牌（如 `midea`）OAuth 测试账号与回调环境
  - HA 中至少 1 个空间（`living_room`）与实体（`light.living_main`、`climate.bedroom_ac`）
  - 设备别名字典与空间映射样例

## 授权引导（OAuth）

- TC-AUTH-01 首次授权跳转生成
  - 前置条件：支持品牌列表可用；MCP `oauth.authorize` 联通
  - 步骤：用户对话选择品牌→系统返回授权链接→点击跳转
  - 预期结果：返回有效 `auth_url`；链接包含状态参数；≤1s 响应
  - 优先级/类型：P0 功能，P1 安全
  - 追溯：US-AUTH-01

- TC-AUTH-02 回调与 Token 交换成功
  - 前置条件：第三方回调返回 `code`
  - 步骤：调用 `oauth.token_exchange(code, client_info)`→加密存储 token
  - 预期结果：获得 `access_token/refresh_token`；日志不含敏感；耗时 ≤2s
  - 优先级/类型：P0 功能，P1 安全，P2 性能
  - 追溯：US-AUTH-02

- TC-AUTH-03 授权失败重试与提示
  - 前置条件：网络异常或用户拒绝授权
  - 步骤：触发失败→显示分类错误与重试入口
  - 预期结果：错误提示清晰不含敏感；可重试成功
  - 优先级/类型：P0 功能，P1 安全
  - 追溯：US-AUTH-03

## 意图与控制准入

- TC-INTENT-01 意图分类准确率
  - 前置条件：准备 MVP 话术集（控制/查询/知识/闲聊）
  - 步骤：输入话术→分类→统计准确率
  - 预期结果：准确率 ≥90%；低置信标记
  - 优先级/类型：P0 功能，P1 性能
  - 追溯：US-INTENT-01

- TC-INTENT-02 低置信澄清与二次确认
  - 前置条件：控制意图置信度低；高风险策略开启
  - 步骤：触发澄清≤2回合补全槽位；高风险执行前确认
  - 预期结果：澄清后完成控制；未确认不执行
  - 优先级/类型：P0 安全，P1 易用
  - 追溯：US-INTENT-02/03

## 设备控制（MCP→HA）

- TC-CTRL-01 槽位解析正确
  - 前置条件：空间/设备/功能/参数词典与记忆可用
  - 步骤：输入“客厅灯光调到30%”→解析槽位
  - 预期结果：抽取空间=客厅，设备=灯光，功能=亮度，参数=30%
  - 优先级/类型：P0 功能，P1 性能
  - 追溯：US-CTRL-01

- TC-CTRL-02 实体映射与服务调用成功
  - 前置条件：`light.living_main` 真实存在
  - 步骤：映射到 `entity_id`→调用 `ha.call_service(light.turn_on, brightness_pct=30)`
  - 预期结果：返回 `{ status: ok, trace_id }`；3 秒内状态更新
  - 优先级/类型：P0 功能，P1 兼容
  - 追溯：US-CTRL-02

- TC-CTRL-03 执行反馈与失败建议
  - 前置条件：控制成功与失败场景各一
  - 步骤：完成控制→生成话术；模拟失败→返回建议
  - 预期结果：话术包含关键参数与空间/设备；失败有建议与重试入口
  - 优先级/类型：P0 功能，P1 易用
  - 追溯：US-CTRL-03

- TC-CTRL-04 幂等与重试策略
  - 前置条件：网络偶发异常；幂等键开启
  - 步骤：重复同一控制请求 2 次→观察执行次数
  - 预期结果：仅执行一次；失败自动重试不重复执行
  - 优先级/类型：P1 功能，P2 稳定性
  - 追溯：US-CTRL-02/03

## 状态自动上报

- TC-STATE-01 订阅 `state_changed` 事件
  - 前置条件：WebSocket 可用；`ha.subscribe_events(state_changed)`
  - 步骤：订阅→触发设备变更→接收事件
  - 预期结果：事件正确解析并记录；断线重连成功
  - 优先级/类型：P0 功能，P1 稳定性
  - 追溯：US-STATE-01

- TC-STATE-02 节流与合并策略
  - 前置条件：高频事件模拟
  - 步骤：连续触发同一设备多事件→观察播报
  - 预期结果：不超过设定频率；同设备合并一次播报
  - 优先级/类型：P0 功能，P1 易用
  - 追溯：US-STATE-02

- TC-STATE-03 安全事件优先提醒
  - 前置条件：安全规则配置；触发异常事件
  - 步骤：触发→监听播报
  - 预期结果：立即播报并高亮提示；有审计记录
  - 优先级/类型：P0 安全
  - 追溯：US-STATE-03

## 设备发现与词典

- TC-DISC-01 周期扫描与配置刷新
  - 前置条件：`discovery.scan` 联通；设备存储 P 可写
  - 步骤：触发扫描→比对差异→写入存储
  - 预期结果：输出标准化；差异记录审计；耗时 ≤5s/100设备
  - 优先级/类型：P0 功能，P1 性能
  - 追溯：US-DISC-01

- TC-DISC-02 别名 CRUD 与冲突检测
  - 前置条件：存在设备与空间
  - 步骤：新增/修改/删除别名→制造冲突→提示
  - 预期结果：CRUD 成功；冲突提示清晰；解析生效
  - 优先级/类型：P0 功能，P1 易用
  - 追溯：US-DISC-02

- TC-DISC-03 向量嵌入刷新与检索效果
  - 前置条件：向量库 N 可用；有新词典
  - 步骤：触发嵌入批处理→检索问答→评估相关性
  - 预期结果：检索相关性提升；失败可重试
  - 优先级/类型：P1 性能
  - 追溯：US-DISC-03

## 知识问答

- TC-KB-01 品牌/设备能力问答
  - 前置条件：知识库已有设备能力说明
  - 步骤：提问设备能力→返回答案
  - 预期结果：包含关键参数与限制；答案简洁可读
  - 优先级/类型：P0 功能
  - 追溯：US-KB-01

- TC-KB-02 来源与可信度提示
  - 前置条件：知识检索返回来源信息
  - 步骤：提问→查看答案来源与可信度
  - 预期结果：显示来源摘要与分值；来源真实可追溯
  - 优先级/类型：P1 易用
  - 追溯：US-KB-02

## 对话记忆

- TC-MEM-01 偏好记忆写入/读取
  - 前置条件：记忆存储 O 可用
  - 步骤：写入偏好（如“客厅默认亮度 40%”）→后续控制自动补全
  - 预期结果：解析时引用偏好；过期策略生效
  - 优先级/类型：P0 功能
  - 追溯：US-MEM-01

- TC-MEM-02 连续对话解析增强
  - 前置条件：上下文存在；连续 3 回合对话
  - 步骤：发起连续控制→观察澄清次数与延迟
  - 预期结果：澄清次数减少；延迟无显著增加
  - 优先级/类型：P1 性能
  - 追溯：US-MEM-02

## 性能与安全专项（示例）

- TC-PERF-01 控制请求并发 50 rps
  - 前置条件：压测环境就绪
  - 步骤：模拟并发控制→采集成功率与延迟
  - 预期结果：95% 请求 ≤800ms；错误率 ≤1%
  - 优先级/类型：P1 性能

- TC-SEC-01 Token 管理与最小权限
  - 前置条件：Token 加密存储，日志脱敏开启
  - 步骤：检查存储与访问权限→审计日志
  - 预期结果：最小权限生效；日志无敏感；审计完整
  - 优先级/类型：P0 安全

## 结果记录与追溯

- 记录内容：用例 ID、执行时间、环境、实际结果、缺陷与修复链接
- 追溯关系：对应 `docs/user-stories.md` 的 Story ID（如 `US-AUTH-01`）
- 版本：v1.0（2025-11-28）

## 自动化断言与数据引用

- 运行入口：`docker compose -f tests/docker-compose.yml run --rm tests-runner`
- 用例文件映射：
  - 授权引导：
    - `TC-AUTH-01` → `tests/cases/auth/TC-AUTH-01.json`
    - `TC-AUTH-02` → `tests/cases/auth/TC-AUTH-02.json`
    - `TC-AUTH-03` → `tests/cases/auth/TC-AUTH-03.json`
  - 意图与准入：
    - `TC-INTENT-01` → `tests/cases/intent/TC-INTENT-01.json`
    - `TC-INTENT-02` → `tests/cases/intent/TC-INTENT-02.json`
  - 设备控制：
    - `TC-CTRL-01` → `tests/cases/ctrl/TC-CTRL-01.json`
    - `TC-CTRL-02` → `tests/cases/ctrl/TC-CTRL-02.json`
    - `TC-CTRL-03` → `tests/cases/ctrl/TC-CTRL-03.json`
    - `TC-CTRL-04` → `tests/cases/ctrl/TC-CTRL-04.json`
  - 状态上报：
    - `TC-STATE-01` → `tests/cases/state/TC-STATE-01.json`
    - `TC-STATE-02` → `tests/cases/state/TC-STATE-02.json`
    - `TC-STATE-03` → `tests/cases/state/TC-STATE-03.json`
  - 设备发现与词典：
    - `TC-DISC-01` → `tests/cases/disc/TC-DISC-01.json`
    - `TC-DISC-02` → `tests/cases/disc/TC-DISC-02.json`
    - `TC-DISC-03` → `tests/cases/disc/TC-DISC-03.json`
  - 知识问答：
    - `TC-KB-01` → `tests/cases/kb/TC-KB-01.json`
    - `TC-KB-02` → `tests/cases/kb/TC-KB-02.json`
  - 对话记忆：
    - `TC-MEM-01` → `tests/cases/mem/TC-MEM-01.json`
    - `TC-MEM-02` → `tests/cases/mem/TC-MEM-02.json`
- 报告产物：`tests/reports/summary.json`
