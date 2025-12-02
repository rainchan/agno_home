# SRS：US-AUTH-02 回调与 Token 交换规格说明

## 范围与目标
- 接收第三方回调 `code/state/brand`，完成 Token 交换并安全存储；提示设备同步。

## 业务流程
- 引导授权→第三方回调→校验与交换→加密存储→提示同步→后续设备发现。

## 接口契约
- `POST /oauth/callback`
  - 入参：`{ code: string, state: string, brand: string }`
  - 返回：`{ stored: boolean, expires_in: number }` 或 `{ error: string }`
- `POST /oauth/token`
  - 入参：`{ code: string, client_info?: object }`
  - 返回：`{ access_token: '****', refresh_token: '****', expires_in: 3600 }`

## 安全与日志
- `state` 一次性与长度校验；加密存储；日志脱敏，不含敏感明文。

## 话术
- 成功：`授权成功，设备同步中。`
- 错误：`授权失败，请重试或稍后再试。`

## 验收标准
- 成功路径返回并存储，耗时 ≤2s；错误路径提示；安全策略生效。
