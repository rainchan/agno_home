# TDD：US-AUTH-01 技术设计说明

## 架构与接口
- 统一入口：`POST /oauth/guide/start`（校验品牌→生成 `state`→构造 `auth_url`）
- 兼容：保留 `GET /oauth/authorize`；回调接口占位 `POST /oauth/token`（与 US-AUTH-02）。

## 状态与安全
- `state` 生成：随机字符串（长度≥8），与请求绑定；校验存在与格式。
- 品牌白名单：`["midea"]`（可扩展）。

## 话术模板
- 成功与错误分支模板；多语言预留。

## 测试设计
- Runner：`eval_auth_01_v2` 断言 `auth_url`、`state`、耗时；
- PyTest：`test_auth_01_v2` 覆盖主流程与报告写入；
- 覆盖率：≥90%。
