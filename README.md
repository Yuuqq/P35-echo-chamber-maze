# P35 信息茧房收敛迷宫

> 信息茧房收敛迷宫

[![Live Demo](https://img.shields.io/badge/Live-Demo-7c3aed?style=for-the-badge)](https://yuuqq.github.io/P35-echo-chamber-maze/)

## 在线体验

**[https://yuuqq.github.io/P35-echo-chamber-maze/](https://yuuqq.github.io/P35-echo-chamber-maze/)**

在工具箱站点上可以安装为 PWA。离线可用的范围是本目录核心文件，加上已经缓存过的 `shared/releases/v2.6/` 模块。本仓库里没有 `shared/`。

## 这个页面做什么

- 点击一条新闻，或用「快速偏向」给某一类加权（一次 +2）。
- 多样性仪表、状态文案、信息流使用同一套点击计数（`echo-logic.js`）。样本少于 4 时视野保持全开；主导占比到 75% 时信息流只剩那一类。
- 暗色模式由共享 loader 注入。多样性颜色走 CSS 变量，会随 `data-theme` 变化。
- 阅读和点击记录留在浏览器里。`pm-metrics.js` 会把遥测写进 `localStorage`，没有上传接口。

## 本地运行

共享脚本不在本仓库。按工具箱的目录布局起静态服务器，否则暗色切换、命令面板和 Service Worker 预缓存会 404：

```text
journalism-toolbox/
  shared/
  P35-echo-chamber-maze/
```

```bash
cd journalism-toolbox
python -m http.server 8080
```

打开 `http://localhost:8080/P35-echo-chamber-maze/`。不要用 `file://` 打开，Service Worker 不会注册。

只想看收敛规则时，不必起页面：

```bash
node --test
```

## 技术栈

- HTML + CSS + JavaScript，无框架、无构建
- 规则在 `echo-logic.js`，页面在 `app.js`
- Service Worker 只缓存同目录核心文件和 v2.6 loader 子模块

## 许可

本项目为新闻素养教学工具，仅供学习与研究使用。

---

*本项目是 [新闻素养工具箱](https://yuuqq.github.io/journalism-toolbox/) 的第 35 号工具。*
