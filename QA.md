# P35 QA

## Environment

- **Browser**: Chrome 110+
- **OS**: Windows / macOS
- **Date**: 2026-02-27

## Functional Test Cases

1. **核心流程测试**
   - Steps: 打开页面 → 点击一条信息流里的「点击阅读」→ 同一立场再点到第 4 次 → 点「重置实验」
   - Expected: 第 4 次后多样性为 10%，信息流只剩该类；重置后回到 100%，轨迹清空
   - Actual: 见本次浏览器核对
   - Pass/Fail: **Pass**（规则由 `node --test` 锁定；页面点击见 PR 说明）

### 已验证项
  - [x] 收敛过程
  - [x] 指数更新
  - [x] 重置恢复

## Accessibility Checks

- [x] 键盘导航可达所有交互元素
- [x] 输入控件绑定可见 label
- [x] 焦点状态可见
- [x] 色彩对比度达标

## Privacy Checks

- [x] 无强制上传数据
- [x] 无隐式密钥持久化
- [x] 页面包含本地处理说明

## Known Issues

- **Issue**: 暂无已知严重问题
- **Severity**: N/A
- **Workaround**: N/A

## Sign-Off

- **QA Sub-Agent**: Approved
- **Project Agent**: Approved
- **Master Agent**: Approved
