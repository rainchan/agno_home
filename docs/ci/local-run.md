# 本地运行与验证说明

## 前置
- Mac 环境，已安装 Docker 与 Compose。

## 启动测试环境
- 启动：`make up`
- 执行测试：`make test`
- 查看报告：`make report`
- 关闭与清理：`make down`、`make clean`

## 说明
- 所有测试均可在本地执行，无需 CI 工具。
- 若仓库托管在 GitHub，可选择启用 `.github/workflows/ci-skeleton.yml`，但非必需。
- 单人模式下，建议以每日或每次重要变更运行 `make test` 并记录结果。
