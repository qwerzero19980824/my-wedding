# 项目愿景：【平行宇宙的相遇】交互式婚礼叙事网站

> **历史视觉规格（v2.0 核心）**。当前功能、版本、存储契约和响应式规则以 `CHECKPOINT.md`、`My Wedding Master Skill.md` 与 `index.html` 为准；本文件仅保留三图层设计背景。

> **版本记录**（详见 [CHANGELOG.md](./CHANGELOG.md)）
> - v2.1.0 (2026-05-31): 网眼白度控制 + 掀开粒子特效 + 重返按钮 + 参数持久化保存/加载
> - v2.0.0 (2026-05-31): 三图层 Z-Index 架构 — 六边形网纱 + 视频背景 + 15 参数控制器
> - v1.1.1 (2026-05-30): 物理手感修复 — 桌布掀开体验
> - v1.1.0 (2026-05-30): Three.js 布料模拟 — 视频纹理画布 + 物理拖拽掀开 + Hero Card
> - v0.3.0 (2026-05-30): 首页画布拖拽 + 新娘剪影 + SAY YES 按钮过渡
> - v0.2.0 (2026-05-30): 模块化拆分 — CSS/JS 独立文件，右下角版本标识
> - v0.1.0 (2026-05-30): 双轨视差骨架 — GSAP ScrollTrigger + canvas-confetti + 合并轨道

---

## 0. 整体页面流 (Page Flow)

```
[三图层叠加] ──(拖拽掀开)──▶ [Hero Card] ──(Say Yes)──▶ [双轨视差] ──(滚动)──▶ [相遇点] ──▶ [合并轨道]
```

### 三图层 Z-Index 架构 (v2.0.0)

```
┌─────────────────────────────────┐
│ Layer 3 (z:3)  WebGL Cloth      │  正六边形网纱 · Verlet 物理 · 双通道渲染 · 拖拽掀开
│ ┌─────────────────────────────┐ │
│ │ Layer 2 (z:2)  DOM Hero     │ │  毛玻璃模糊 · contenteditable 情话 · Say Yes 按钮
│ │ ┌─────────────────────────┐ │ │
│ │ │ Layer 1 (z:1)  Video    │ │ │  视频背景 · 边缘模糊遮罩
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 1. Layer 3 — 正六边形网纱布料 (WebGL Cloth) ★ v2.0.0

### 1.1 物理引擎：韦尔莱积分法 (Verlet Integration)
- 通过记录质点的**当前坐标**与**上一帧坐标**隐式计算速度
- 公式：`NewPosition = CurrentPosition + (CurrentPosition - OldPosition) * Damping + Force * dt²`
- 极大增强柔性布料在极端拉扯下的物理稳定性

### 1.2 网格拓扑：质点-弹簧模型 (Mass-Spring System)
- 42×30 质点网格，xSegs * ySegs 个质点
- **结构弹簧**：上下左右相邻，维持基础长宽
- **剪切弹簧**：对角线相连，防止渔网变形
- **抗弯曲弹簧**：隔点连接（如 A 与 C），赋予挺括度，防止尖锐三角形死角

### 1.3 图形学渲染：双通道防穿模
- `MeshBack`：`THREE.BackSide`，renderOrder = 1
- `MeshFront`：`THREE.FrontSide`，renderOrder = 2
- 强制 GPU 永远先画背面再画正面，完美解决半透明深度排序

### 1.4 材质贴图：程序化正六边形纹理
- 利用 JS Canvas API 配合三角函数动态绘制无缝正六边形网格
- 作为 `alphaMap` 透明通道贴图
- `LinearMipmapLinearFilter` + 各向异性过滤，网格密度高达 600 依然平滑

### 1.5 拖拽交互
- `THREE.Raycaster` 射线检测获取被点击质点
- 基于**高斯衰减权重**：`weight = (1 - dist/radius)²`
- 约束求解时锁定的质点降低权重（0.08），防止拖拽中抖动

### 1.6 技术规格

| 参数 | 默认值 | 范围 | 说明 |
|------|--------|------|------|
| 网格密度 | 42 × 30 | — | xSegs × ySegs |
| 约束求解迭代 | 4 次/帧 | — | 越多越硬挺 |
| 面料挺括度 | 0.35 | 0.1–1 | stiffness |
| 阻尼 | 0.98 | 0.90–0.99 | damping |
| 重力 | 0.014 | 0–0.04 | gravity |
| 风力 | 0.015 | 0–0.04 | wind |
| 掀开飞行力 | 1.8 | 0.5–4.0 | flightForce |
| 触发灵敏度 | 120px | 50–250 | threshold |
| 六边形密度 | 448 | 10–600 | tiling |
| 拖拽半径 | 7.0 | 1.0–10.0 | dragRadius |

---

## 2. Layer 2 — DOM Hero Card (v2.0.0)

### 2.1 交互逻辑
- 布料掀开后，Layer 2 保持可见（`backdrop-filter: blur()` 毛玻璃）
- 上半部分：`contenteditable="true"` 可编辑情话区
- 下半部分："Say Yes" 按钮，呼吸光晕动画
- 点击 Say Yes → 闪光过渡 → 解锁下方滚动内容

### 2.2 排版规格

| 元素 | 字体 | 大小 | 字重 | 颜色 |
|------|------|------|------|------|
| 标题 | Playfair Display | clamp(2rem, 5vw, 3.5rem) | 500 | `#a92929` |
| 情话文本 | Cormorant Garamond / Noto Serif SC | clamp(1rem, 2.2vw, 1.35rem) | 300 | `#3a4044` |
| Say Yes 按钮 | Playfair Display | 16px | 600 | white on `#a92929` |

---

## 3. Layer 1 — 视频背景 (v2.0.0)

### 3.1 配置
- 载体：`<video muted loop playsinline autoplay>`
- 路径：`video/1.mp4`
- 铺满策略：`object-fit: cover` + `min-width/min-height: 100%`
- 边缘模糊遮罩：`radial-gradient` mask + `backdrop-filter: blur()`，补偿宽高比不匹配

### 3.2 可调参数

| 参数 | 默认值 | 范围 | 说明 |
|------|--------|------|------|
| videoOpacity | 0.92 | 0.3–1.0 | 视频层透明度 |
| edgeBlur | 0px | 0–40px | 边缘模糊遮罩强度 |
| domBlur | 15px | 0–30px | DOM 层毛玻璃强度 |

---

## 4. 下游滚动叙事 (Dual Track → Meeting → Merged)

### 4.1 双轨视差
- GSAP ScrollTrigger pinned stage
- 左轨 yPercent: -45%（慢速）
- 右轨 yPercent: -70%（快速）
- scrub: 1.2 平滑跟随
- 中央分界线末尾消散

### 4.2 相遇点
- 150vh 渐变背景（暗 → 亮）
- canvas-confetti 四次粒子爆发
- 相遇文字 scrub 淡入
- 点击可重新触发 confetti

### 4.3 合并轨道
- 三张记忆卡片 ScrollTrigger 逐个淡入
- toggleActions: "play none none reverse"

---

## 5. 核心色彩与视觉变量 (Design System)

```css
:root {
  --bg-dark: #121212;          /* 深邃夜空黑 */
  --bg-light: #fafafa;         /* 纯净高级白 */
  --romantic-pink: #f4c2c2;    /* 克制情感粉 */
  --romantic-red: #a92929;     /* 古典红 (Layer 2 按钮) */
  --text-main: #333333;
  --text-muted: #888888;
  --panel-bg: rgba(255,255,255,0.40);  /* 控制面板半透明 */
  --accent-color: #5a6a6c;     /* 滑块强调色 */
}
```

---

## 6. 素材存放路径

```
my-wedding/
├── video/
│   └── 1.mp4              ← Layer 1 背景视频
├── assets/
│   ├── video/
│   │   └── bride-turn.mp4 ← 旧版布料视频纹理 (v1.x)
│   └── images/
│       ├── photo-his-01.jpg
│       ├── photo-her-01.jpg
│       ├── photo-us-01.jpg
│       ├── photo-us-02.jpg
│       └── photo-us-03.jpg
```
