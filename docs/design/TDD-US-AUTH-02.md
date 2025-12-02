# TDD：US-AUTH-02 技术设计说明

## 接口与状态机
- 回调：`POST /oauth/callback` → 校验 → 交换 → 加密存储 → 返回摘要。
- 交换：`POST /oauth/token` → 生成占位 token → 返回脱敏与过期时间。

## 安全
- CSRF：`state` 长度≥8、一次性（Mock 环境校验格式与记录）。
- 加密：进程随机密钥（AES-256-GCM）加密存储；不持久化。
- 日志：仅摘要与过期时间，脱敏输出。

## 数据结构
- 存储：`{ key: state|brand, value: { enc_blob, expires_at } }`（内存）。

## 测试
- Runner：`eval_auth_02` 成功断言；
- PyTest：成功与错误分支；覆盖率≥90%。
