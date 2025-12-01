# 单人实验项目模式

## 工具与流程选择
- 代码托管：GitHub 仓库即可，无需额外平台。
- 任务追踪：GitHub Issues/Projects 轻量看板（Todo/In Progress/Done）。
- 测试执行：优先使用本地 `Makefile` 与 `docker compose`；必要时启用 GitHub Actions，但非必需。

## 迭代与验证
- 频率：以功能点为单位推进，完成后运行 `make test` 并记录结果。
- 文档：更新用户故事、测试用例、变更记录与建议库。
- 里程碑：参考 `docs/plans/roadmap.md`，按需压缩或扩展迭代。

## 评审与自律
- 自我评审：采用检查清单（见 `self-review-checklist.md`）；确保提交质量与追溯完整。
- 建议库：所有改进先暂存评审后纳入版本，避免随意变更。

## 变更管理
- 使用 Issues 记录变更与关联提交；必要时维护 `changelog` 与标签。
