# CHANGELOG — 平行宇宙的相遇

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
