# 平行宇宙的相遇 — 婚礼叙事网站

> 当前版本 **v1.1.1** | 2026-05-30

纯前端沉浸式婚礼叙事网页。Three.js 布料模拟 → Hero Card → 双轨视差 → 相遇粒子 → 合并记忆。

---

## 快速启动

```bash
cd C:\Users\Administrator\Desktop\my-wedding
python -m http.server 8080
```

浏览器打开 `http://localhost:8080`

---

## 当前进度

### 已完成

| 页面层 | 功能 | 技术 |
|--------|------|------|
| **Layer 1: 布料画布** | 全屏 Three.js 布料，视频纹理，Verlet 物理模拟，底角拖拽掀开，40% 位移触发滑出 | Three.js r160 + GSAP |
| **Layer 2: Hero Card** | 画布滑出后淡入，contenteditable 可编辑情话，"Say Yes" 呼吸光晕按钮 | CSS + GSAP |
| **Layer 3: 双轨视差** | 左右轨异步视差滚动 (yPercent -45%/-70%)，中央分界线消散 | GSAP ScrollTrigger |
| **相遇点** | 暗→亮渐变背景，canvas-confetti 四次粒子爆发，相遇文字淡入 | canvas-confetti |
| **合并轨道** | 三张记忆卡片逐个 ScrollTrigger 淡入 | GSAP ScrollTrigger |
| **版本标识** | 右下角 `v1.1.1` 标识，亮/暗背景自适应 | CSS + JS |

### 待替换

- `assets/video/bride-turn.mp4` — 新娘转身视频
- `assets/images/photo-*.jpg` — 照片素材
- `index.html` 中双轨文字和记忆卡片文案

---

## 项目结构

```
my-wedding/
├── index.html              ← 入口文件
├── README.md               ← 本文件
├── PROMPT_GUIDE.md          ← 设计规格与版本记录
├── CHANGELOG.md             ← 完整变更日志
├── CONTENT_TEMPLATE.md      ← 用户可修改内容清单
├── css/
│   ├── reset.css            ← 全局重置
│   ├── design-system.css    ← CSS 变量 (配色)
│   ├── landing.css          ← 布料容器 + Hero Card + 按钮
│   ├── dual-track.css       ← 双轨布局 + 分界线
│   ├── meeting-point.css    ← 相遇区渐变
│   ├── merged-track.css     ← 合并轨道卡片
│   └── version-badge.css    ← 版本标识
├── js/
│   ├── config.js            ← 版本号常量
│   ├── app.js               ← ★ Three.js 布料物理引擎 (核心)
│   ├── landing.js           ← 旧版首页 (已废弃, git 历史保留)
│   ├── parallax.js          ← 双轨视差 ScrollTrigger
│   ├── meeting.js           ← confetti + 相遇文字
│   ├── merged.js            ← 卡片淡入
│   └── main.js              ← 全局初始化 + 版本渲染
└── assets/
    ├── video/               ← 放新娘转身视频 (.mp4/.webm)
    └── images/              ← 放照片素材
```

---

## 页面流

```
[布料画布] ──拖拽底角掀开40%──▶ [Hero Card] ──点击 Say Yes──▶ [双轨视差] ──滚动──▶ [相遇粒子] ──▶ [合并记忆]
```

---

## 物理参数调校

`js/app.js` 顶部常量，改完刷新即可：

| 参数 | 默认值 | 效果 |
|------|--------|------|
| `MOUSE_FORCE` | 0.55 | 拖拽跟手度 (越大越紧) |
| `CONSTRAINT_ITERS` | 1 | 布料硬度 (1=柔软, 5=硬板) |
| `TRIGGER_RATIO` | 0.40 | 触发滑出需要的面积比例 |
| `GRAVITY` | -9.8 | 重力 (标准值) |
| `DAMPING` | 0.965 | 摆动衰减 (0.9=快停, 0.99=飘摇) |

---

## 版本历史

```
v1.1.1  物理手感修复 — 桌布掀开体验 (当前)
v1.1.0  Three.js 布料模拟 + Hero Card
v0.3.0  Canvas 2D 画布拖拽 + SAY YES
v0.2.0  模块化拆分 CSS/JS
v0.1.0  双轨视差骨架
```

详见 [CHANGELOG.md](./CHANGELOG.md)

---

## CDN 依赖

| 库 | 版本 | 用途 |
|----|------|------|
| GSAP | 3.12.5 | 滚动视差 + 过渡动画 |
| ScrollTrigger | 3.12.5 | 滚动触发 |
| Three.js | 0.160.0 | WebGL 布料模拟 |
| canvas-confetti | 1.9.3 | 相遇粒子特效 |
| Google Fonts | — | Playfair Display + Cormorant Garamond + Noto Serif SC |
