# P35 Spec - 信息茧房收敛迷宫

## 1. Summary

- **Project ID**: P35
- **Project Name**: 信息茧房收敛迷宫
- **Goal**: 模拟游戏：在算法推流中选项逐渐收窄，隐喻茧房形成
- **User Persona**: 新闻学生

## 2. Scope

- **In scope**:
  - 模拟游戏：在算法推流中选项逐渐收窄
  - 隐喻茧房形成
- **Out of scope**:
  - 后端代理或服务端逻辑
  - API Key 持久化存储

## 3. UX

- **Core workflow**: 用户输入 → 前端处理 → 结果展示
- **Inputs**: 观点标签选择
- **Outputs**: 多样性指数变化 + 收敛可视化
- **States**: empty (初始) / loading (处理中) / error (失败) / success (完成)

## 4. Functional Requirements

1. FR-1: 模拟游戏：在算法推流中选项逐渐收窄
2. FR-2: 结果可视化展示
3. FR-3: 错误状态可见提示

## 5. Non-Functional Requirements

- **Performance**: 核心任务 3 分钟内完成
- **Accessibility**: 键盘导航、aria-label、焦点可见、WCAG AA 对比度
- **Privacy**: 本地处理优先，不默认上传数据
- **Browser support**: 现代 Chromium (Chrome 110+)

## 6. Dependencies

- **Libraries/CDNs**: Canvas API
- **Local data**: 无

## 7. Risks & Mitigations

- **Risk**: 模型过于简化
- **Mitigation**: 标注为教学演示

## 8. Acceptance Criteria

- [ ] 观点点击
- [ ] 信息流收敛
- [ ] 多样性指数
- [ ] 纯静态页面可部署 GitHub Pages
- [ ] 移动端可用
- [ ] 隐私提示清晰可见
