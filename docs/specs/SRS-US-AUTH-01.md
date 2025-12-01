# SRS：US-AUTH-01 授权引导规格说明

## 范围与目标
- 用户选择品牌并发起授权，引导生成含 `state` 的授权链接；响应 ≤1s；安全与话术到位。

## 业务流程
- 选择品牌→生成链接→跳转授权页→回到应用提示设备同步（与 US-AUTH-02 衔接）。

## 接口契约（引导统一入口）
- `POST /oauth/guide/start`
  - 入参：`{ brand: string, redirect_uri?: string }`
  - 返回：`{ auth_url: string, state: string, supported: boolean }`
  - 错误：`{ error: 'unsupported_brand' | 'bad_request' }`

## 话术与多语言
- 成功：`已为你生成{brand}品牌授权链接，请点击完成授权。`
- 不支持：`当前品牌暂不支持，请选择支持品牌：{brands}`
- 预留 i18n key，中文为默认。

## 安全与日志
- `state` 随机与短期有效，入参/返回校验，日志脱敏，不记录敏感数据。

## 验收标准（AC）
- 生成 `https://` 前缀链接，包含 `brand` 与 `state`；响应 ≤1s；话术完整；错误分支友好。
