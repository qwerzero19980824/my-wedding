# CHANGELOG — 平行宇宙的相遇

## v0.2.0 — 模块化拆分 & 版本标识 (2026-05-30)

### 变更
- **单文件 → 模块化**：`index.html` 瘦身为入口文件，CSS/JS 各自独立
- **CSS 模块**（`css/`）：
  - `reset.css` — 全局重置
  - `design-system.css` — CSS 变量（--bg-dark / --bg-light / --romantic-pink 等）
  - `dual-track.css` — 双轨布局、分界线、滚动提示
  - `meeting-point.css` — 相遇区渐变背景
  - `merged-track.css` — 合并轨道记忆卡片
  - `version-badge.css` — 页面版本标识
- **JS 模块**（`js/`）：
  - `config.js` — 版本常量 APP.VERSION / APP.BUILD_DATE
  - `parallax.js` — 双轨视差 ScrollTrigger 时间线
  - `meeting.js` — confetti 粒子爆发 & 相遇文字动画
  - `merged.js` — 记忆卡片逐个淡入
  - `main.js` — 全局初始化、版本标识渲染、滚动提示控制
- **页面版本标识**：右下角固定显示 `v0.2.0`，亮/暗背景自适应切换

### 项目结构
```
my-wedding/
├── index.html
├── css/
│   ├── reset.css
│   ├── design-system.css
│   ├── dual-track.css
│   ├── meeting-point.css
│   ├── merged-track.css
│   └── version-badge.css
├── js/
│   ├── config.js
│   ├── main.js
│   ├── parallax.js
│   ├── meeting.js
│   └── merged.js
├── assets/          (预留：图片资源)
├── PROMPT_GUIDE.md
└── CHANGELOG.md
```

---

## v0.1.0 — 双轨视差骨架搭建 (2026-05-30)

### 新增
- 完整 HTML/CSS/JS 骨架，基于 `prompt_guide.md` 设计系统
- **双轨布局**：`.dual-track-stage` 固定视口，左/右轨各占 50%
- **GSAP ScrollTrigger 视差**：
  - 左轨内容 yPercent: -45%（慢速）
  - 右轨内容 yPercent: -70%（快速）
  - scrub: 1.2 实现平滑跟随
  - 分界线末尾消散动画
- **相遇点过渡**：
  - 150vh 渐变背景（暗 → 亮）
  - canvas-confetti 多次粒子爆发（150+80+120+60 粒子）
  - 相遇文字 scrub 淡入
- **合并轨道**：.merged-section 记忆卡片序列，ScrollTrigger 逐个淡入
- **微交互**：滚动提示线脉冲动画、confetti 点击重新触发
- 引入 CDN：GSAP 3.12.5 + ScrollTrigger + canvas-confetti 1.9.3

### 待定
- 真实照片替换 placeholder
- 具体文案调整
- 移动端响应式适配
