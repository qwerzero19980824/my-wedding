# CHANGELOG — 平行宇宙的相遇

## v1.1.0 — Three.js 布料模拟 · 转身新娘与命运画布 (2026-05-30)

### 重大升级：Hero Section 重构

**Three.js 布料物理引擎** (`js/app.js`)：
- **WebGL 布料网格**：60×60 PlaneGeometry（3721 顶点），顶点级 Verlet 积分物理
- **视频纹理映射**：`THREE.VideoTexture` 将新娘转身视频实时映射到布料表面，视频随网格变形同步弯曲
- **约束系统**：结构约束（水平+垂直）+ 剪切约束（双对角线），每帧 3 次迭代求解
- **物理参数**：重力 -0.0004、阻尼 0.98、拖拽力场二次衰减
- **Fallback 纹理**：无视频时自动使用 Canvas 2D 程序化纹理（婚纱剪影 + 微光波动）

**拖拽交互**：
- Raycaster 精准检测布料左下角/右下角抓取（判定半径 0.22 世界单位）
- 拖拽时力场影响周围顶点（二次衰减 falloff），产生逼真布料褶皱
- 实时顶点位移追踪，超过 40% 顶点位移 > 0.08 单位时触发

**滑出过渡 & Hero Card 揭示**：
- GSAP Timeline：布料沿拖拽方向平移 + Y轴旋转 + 透明度衰减（0.9s power3.in）
- 画布容器淡出后显露底层 Hero Card
- Hero 文本 contenteditable 可编辑、呼吸光晕 Say Yes 按钮

### 新增/修改文件
| 文件 | 操作 | 说明 |
|------|------|------|
| `js/app.js` | 新增 | Three.js 布料物理引擎 + 交互 + 过渡 |
| `index.html` | 重构 | 三层页面结构 (cloth → hero → dual-track) |
| `css/landing.css` | 重写 | 布料容器 + Hero Card 排版 + 呼吸光晕按钮 |
| `js/config.js` | 更新 | 版本 → 1.1.0 |
| `PROMPT_GUIDE.md` | 更新 | 新增 §1 Three.js 布料规格、§2 Hero Card 规格、§6 素材路径 |
| `assets/video/` | 新增 | 视频素材目录 |
| `assets/images/` | 新增 | 图片素材目录 |

### 页面流 (v1.1.0)
```
[Three.js 布料] ──(掀开40%)──▶ [Hero Card] ──(Say Yes)──▶ [双轨视差] ──▶ [相遇点] ──▶ [合并轨道]
```

### 技术栈
- Three.js r160 (WebGL 2.0)
- GSAP 3.12.5 + ScrollTrigger
- canvas-confetti 1.9.3
- Google Fonts: Playfair Display + Cormorant Garamond + Noto Serif SC

---

## v0.3.0 — 首页 Landing Page & 画布拖拽 (2026-05-30)

### 新增
- **首页 Landing 覆盖层**：全屏暗色背景 `#0a0a0a`，作为整个网站的入口
- **Canvas 新娘剪影**：
  - 程序化绘制优雅婚纱剪影（头纱、胸衣、蓬松裙摆、腰带装饰）
  - Canvas 自适应 DPR 高清渲染
  - 径向渐变氛围光晕
- **画布拖拽交互**：
  - 画布初始定位右下角（CSS `right: 8vw; bottom: 6vh`）
  - 支持鼠标拖拽 + 触摸拖拽
  - 发光提示环（3s 脉冲动画，拖拽开始后消失）
- **解锁过渡**：
  - 画布中心拖至视口中心 22% 阈值内自动触发
  - 白色闪光 + 首页淡出动画（GSAP timeline）
  - 过渡完成后 `ScrollTrigger.refresh()` 刷新
- **"SAY YES" 按钮**：
  - Playfair Display 衬线字体，`#c0392b` 古典红
  - 1.5px 红色外框，悬停时红色填充滑入 + 白字
  - 点击直接触发过渡（与拖拽等效）
- **排版设计**：
  - 引入 Google Fonts: Playfair Display + Cormorant Garamond
  - 标题 "Love is a yes" — 4-5.5rem italic 衬线体
  - 按钮 letter-spacing 0.35em 大写
- **新增文件**：
  - `css/landing.css` — 首页 + 按钮 + 过渡闪光
  - `js/landing.js` — Canvas 绘制 + 拖拽逻辑 + 过渡动画
  - `CONTENT_TEMPLATE.md` — 用户可修改内容清单 & 替换指南
- **文档更新**：
  - `PROMPT_GUIDE.md` 新增 §1 首页章节（排版/按钮/画布规格）
  - `PROMPT_GUIDE.md` 新增 §0 整体页面流

### 项目结构
```
my-wedding/
├── index.html
├── CONTENT_TEMPLATE.md    ← NEW: 内容修改清单
├── css/
│   ├── landing.css        ← NEW: 首页样式
│   ├── ...
├── js/
│   ├── landing.js         ← NEW: 首页逻辑
│   ├── ...
├── assets/
├── PROMPT_GUIDE.md
└── CHANGELOG.md
```

---

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
