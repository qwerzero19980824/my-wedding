# 3D 高定婚纱多图层交互系统 (V2.0) - 核心架构与底层逻辑文档

本文档总结了该项目中用于物理模拟、图形渲染和跨图层交互的核心库、数学逻辑以及关键函数。旨在为您在其他平台（如 Vue, React, Webflow 或原生工程）复刻该系统提供清晰的技术图纸。

> **已实现**：完整三图层架构已集成到 `index.html`（v2.0.0）。参考实现见 `code.html`。

---

## 零、 三图层 Z-Index 架构 (Three-Layer Stack)

```
┌──────────────────────────────────────────────┐
│  Layer 3 (z-index: 3)                        │
│  Three.js WebGL Cloth — 正六边形网纱          │
│  · 双通道渲染 (FrontSide + BackSide)          │
│  · Verlet 积分物理                            │
│  · 程序化六边形 alphaMap                      │
│  · Raycaster 拖拽掀开                         │
│  · pointer-events: auto (顶层交互)            │
├──────────────────────────────────────────────┤
│  Layer 2 (z-index: 2)                        │
│  DOM Hero Card — 毛玻璃中层                   │
│  · backdrop-filter: blur()                   │
│  · contenteditable 情话编辑区                 │
│  · "Say Yes" 呼吸光晕按钮                     │
│  · 掀开后 pointer-events: auto               │
├──────────────────────────────────────────────┤
│  Layer 1 (z-index: 1)                        │
│  Video Background — 视频背景层                │
│  · <video> object-fit: cover                 │
│  · radial-gradient 边缘模糊遮罩               │
│  · 可调参数: 透明度、边缘模糊、DOM模糊        │
└──────────────────────────────────────────────┘
         │
         │ Say Yes 点击后 ↓
         ▼
┌──────────────────────────────────────────────┐
│  Scrollable Content                           │
│  Dual Track → Meeting Point → Merged Track    │
│  (GSAP ScrollTrigger 驱动)                    │
└──────────────────────────────────────────────┘
```

---

## 一、 核心依赖库 (Core Libraries)

系统实现了 **零外部杂项依赖**，仅使用了最基础的渲染和动画库：
* **Three.js (WebGL)**：用于构建 3D 场景、摄像机、光影渲染以及 `BufferGeometry` (几何体顶点) 的实时更新。
    * *版本要求*：r160 (使用 `THREE.CanvasTexture`、`THREE.LinearMipmapLinearFilter` 等)。
    * *CDN 引用*：`https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js`
* **GSAP + ScrollTrigger**：过渡动画与滚动视差。
* **canvas-confetti**：相遇粒子特效。

*注：整个物理引擎（包括重力、风力、碰撞、弹簧阻尼）均为 **纯原生 JavaScript 手写**，不依赖 Cannon.js 或 Ammo.js，以保证极致的轻量化和对面料手感的绝对控制。*

---

## 二、 核心底层逻辑 (Underlying Logic)

### 1. 物理引擎：韦尔莱积分法 (Verlet Integration)
不同于传统的欧拉积分（基于速度和加速度推算位置），本系统采用 **韦尔莱积分**。它通过记录质点的**当前坐标**与**上一帧坐标**来隐式计算速度，极大地增强了柔性布料（网格系统）在极端拉扯下的物理稳定性。
* **公式**：`NewPosition = CurrentPosition + (CurrentPosition - OldPosition) * Damping + Force * dt^2`

### 2. 网格拓扑：质点-弹簧模型 (Mass-Spring System)
布料在数学上被抽象为一个由 `xSegs * ySegs` 个质点构成的点阵。质点间由不可见的“弹簧”相连。
* **结构弹簧 (Structural)**：上下左右相邻的点相连，维持布料基础长宽。
* **剪切弹簧 (Shear)**：对角线相连，防止布料像渔网一样严重变形。
* **抗弯曲弹簧 (Bending)**：*核心优化*。隔一个点连接（如点 A 与点 C 相连），赋予布料物理上的“挺括度 (Stiffness)”，有效防止拖拽时产生尖锐的三角形死角。

### 3. 图形学渲染：双通道防穿模 (Dual-Pass Rendering)
半透明网格在 3D 空间折叠时极易发生“深度排序冲突”（即前面的纱反而被后面的纱挡住）。
* **逻辑**：在 Three.js 中，将同一个物理网格 `Geometry` 实例化为两个完全重叠的 `Mesh`。
    * `MeshBack`：材质设为 `THREE.BackSide`（只画背面），渲染优先级 `renderOrder = 1`。
    * `MeshFront`：材质设为 `THREE.FrontSide`（只画正面），渲染优先级 `renderOrder = 2`。
* *结果*：强制 GPU 永远先画底层再画表层，实现了物理上绝对完美的半透明叠层阻挡。

### 4. 材质贴图：程序化正六边形纹理 (Procedural Hexagonal Map)
真实婚纱（Tulle）微观下是蜂巢结构。系统不使用外部图片，而是利用 JS 原生 `Canvas API` 配合三角函数，在内存中动态绘制一套无缝衔接的正六边形网格。
* 将其作为 Three.js 的 `alphaMap`（透明通道贴图）。
* 开启 `LinearMipmapLinearFilter`（三线性过滤）和各向异性，确保网格密度高达 600 时依然平滑且不闪烁。

---

### 5. Layer 1 视频背景 (Video Background)

**功能**：最底层全屏视频播放，透过中层毛玻璃和前层网纱可见。

**核心逻辑**：
- `<video>` 元素设置 `muted loop playsinline autoplay`，确保移动端自动播放
- CSS `object-fit: cover` + `min-width/min-height: 100%` + `top/left: 50%` + `transform: translate(-50%, -50%)` 居中裁切填充
- 边缘模糊遮罩：`radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%)` 作为 `mask-image`
- 叠加 `backdrop-filter: blur()` 在遮罩层上，补偿宽高比不匹配时的硬边

**可调参数**：
| 参数 | 默认值 | 说明 |
|------|--------|------|
| `videoOpacity` | 0.92 | 视频层透明度 |
| `edgeBlur` | 0px | 边缘模糊遮罩强度 (0–40px) |
| `domBlur` | 15px | DOM 层毛玻璃模糊强度 (0–30px) |

### 6. 跨图层交互流 (Cross-Layer Interaction Flow)

**掀开判定 (`triggerFabricUnveil`)**：
1. 鼠标拖拽距离 > `config.threshold` (默认 120px)
2. 所有锚点 `pinned = false`（斩断悬挂）
3. 施加 `flightForce` 喷射气流
4. CSS `opacity: 0` + `pointer-events: none` 交还控制权

**Say Yes → 滚动内容过渡**：
1. GSAP Timeline：白色闪光 (`transition-flash`) 淡入
2. 同步淡出 Layer 1 + Layer 2 + Layer 3
3. `onComplete`：隐藏所有固定图层，设置 `mainContent.classList.add('active')`
4. `document.body.style.overflow = ''` 恢复滚动
5. `ScrollTrigger.refresh()` 重新计算所有滚动触发器

---

## 三、 核心代码梳理 (Core Functions)

如果您要在其他框架中重构，请重点移植以下函数：

### 1. `createHexagonalTexture()`
* **功能**：在内存中利用 HTML5 Canvas 绘制蜂巢状纹理。
* **核心逻辑**：利用 `Math.cos()` 和 `Math.sin()` 按照 $60^{\circ}$（$\pi/3$）步进，绘制密铺的正六边形线框。生成 `THREE.CanvasTexture` 并注入到材质中。

### 2. `class Particle` 和 `initPhysics()`
* **功能**：初始化物理网格体系。
* **核心逻辑**：
    * 根据设定好的 `width` 和 `height`，计算网格间距。
    * 按照 `u % 7 === 0` 的逻辑，固定顶部的若干“锚点”，形成自然垂坠的褶皱。
    * 将生成的物理坐标系和 Three.js 几何体 `PlaneGeometry` 的顶点属性（`attributes.position`）一对一绑定。

### 3. `animate()` (渲染与物理循环)
* **功能**：引擎的心脏，通过 `requestAnimationFrame` 递归调用。
* **核心逻辑**：
    1.  **物理迭代**：遍历所有 `Particle`，更新受重力、阻尼和多频湍流风场影响的新坐标。
    2.  **空间防穿模 (Anti-Clipping)**：对空间中任意两个非相邻的质点计算三维距离，若小于安全阈值则施加微弱排斥力。
    3.  **约束求解 (Constraint Relaxation)**：多次迭代弹簧约束，让偏离原始距离的质点相互拉近。
    4.  **顶点更新**：将计算后的物理坐标写回 Three.js 几何体，调用 `computeVertexNormals()` 更新法线以产生正确的光影流转。

### 4. 跨图层联动交互 (Raycaster & Unveil Logic)
* **协同抓取 (`mousedown` / `mousemove`)**：使用 `THREE.Raycaster` 射线检测获取被点击的质点。然后遍历全网格，基于**高斯衰减权重**计算半径内所有质点的连带位移，实现柔软、无死角的面域提拉。
* **解锁判定 (`mouseup`)**：计算鼠标纵向移动差值。如果差值大于设定的 `Threshold`，则触发 `triggerFabricUnveil()`。
* **`triggerFabricUnveil(dirSign)`**：
    * 将所有锚点的 `pinned` 设为 `false`（斩断悬挂）。
    * 施加一个强大的 `flightForce` 喷射气流。
    * 通过 CSS `pointer-events: none` 将顶层 WebGL 画布的控制权交还给下方的 DOM 图层（按钮、视频等）。
