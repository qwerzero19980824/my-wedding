# CHANGELOG — 平行宇宙的相遇

## v2.1.0 — 网眼白度 · 掀开特效 · 重返按钮 · 参数持久化 (2026-05-31)

### 新增功能

**1. 白纱面料视觉升级**
- **`hexFill` 参数**（0–180，默认 55）：控制六边形纹理背景灰度
  - 0 = 纯黑底，网眼之间完全透明（原版效果）
  - 180 = 近白底，网眼之间接近不透明（接近真实婚纱质感）
- **`hexLineWidth` 参数**（2.0–10.0，默认 5.0）：六边形框线粗细
  - 线越粗白纱视觉效果越明显
- 两项参数修改后实时重新生成 Canvas 纹理并更新材质

**2. 掀开粒子特效**
- **Canvas Sparkle 钻石粒子**：掀开瞬间在鼠标位置爆发 60 个旋转钻石形粒子
  - 自带重力、衰减、光晕
  - 粒子颜色混合纯白 `#ffffff` 和浪漫粉 `#f4c2c2`
- **Canvas-Confetti 双重爆发**：80 个彩屑同步发射
- **DOM 层白光闪过**：GSAP 内阴影动画 `inset box-shadow`

**3. 重返帘幕按钮**
- 进入滚动内容后，右下角出现圆形悬浮按钮（↑ 箭头图标）
- 悬停显示 "重返帘幕" 提示文字
- 点击后：
  - 隐藏滚动内容，显示三图层
  - 重新初始化布料物理（`initPhysics`）
  - 杀死并重建所有 ScrollTrigger
  - 平滑滚动回顶部

**4. 参数持久化（Save / Load）**
- **💾 保存设置按钮**：控制面板底部，点击保存全部 17 个参数到 `localStorage`
  - 保存后按钮变绿 "✓ 已保存" 1.8 秒
  - Toast 通知： "✨ 参数已保存到本地，下次自动读取"
- **自动加载**：页面初始化时从 `localStorage` 读取，合并到默认值（新参数用默认值）
  - 加载成功 Toast： "📋 已加载上次保存的参数"
- 存储键名：`wedding_veil_config_v2`

### 参数总览 (v2.1.0)

| 分组 | 参数 | 默认值 | 范围 |
|------|------|--------|------|
| 六边形纹理 | hexFill | 55 | 0–180 |
| | hexLineWidth | 5.0 | 2.0–10.0 |
| | tiling | 448 | 10–600 |
| 面料 | opacity | 0.86 | 0.3–1.0 |
| | blur | 0.6px | 0–2.5px |
| | dragRadius | 7.0 | 1.0–10.0 |
| | stiffness | 0.35 | 0.1–1 |
| 物理 | flightForce | 1.8 | 0.5–4.0 |
| | threshold | 120 | 50–250 |
| | damping | 0.98 | 0.90–0.99 |
| | gravity | 0.014 | 0–0.04 |
| | wind | 0.015 | 0–0.04 |
| 视频/图层 | videoOpacity | 0.92 | 0.3–1.0 |
| | edgeBlur | 0px | 0–40px |
| | domBlur | 15px | 0–30px |

### 修改文件
| 文件 | 操作 | 说明 |
|------|------|------|
| `index.html` | 更新 | 四项改进 + 17 参数控制 + localStorage + Sparkle 引擎 |
| `README.md` | 更新 | v2.1.0 参数表 + 功能列表 |
| `CHANGELOG.md` | 更新 | 本条目 |

---

## v2.0.0 — 三图层 Z-Index 架构 · 六边形网纱布料 · 视频背景 (2026-05-31)

### 重大架构升级

**三图层全屏堆叠架构** (参考 `wedding_architecture.md` 核心设计)：

```
Layer 3 (z:3): Three.js WebGL 正六边形网纱布料 — 顶层交互
Layer 2 (z:2): DOM Hero Card — 毛玻璃模糊 + 情话编辑 + Say Yes
Layer 1 (z:1): 视频背景 — video/1.mp4 全屏播放 + 边缘模糊遮罩
```

### Layer 3 — 六边形网纱布料 (全新实现)

- **程序化正六边形纹理**：利用 Canvas API + 三角函数按 60° 步进绘制密铺六边形线框，作为 `alphaMap` 透明通道贴图
- **双通道渲染防穿模**：`BackSide` (renderOrder=1) + `FrontSide` (renderOrder=2)，强制 GPU 先画背面再画正面
- **质点-弹簧模型**：
  - 结构弹簧（上下左右相邻）
  - 剪切弹簧（对角线相连）
  - 抗弯曲弹簧（隔点连接，防止尖锐三角形死角）
- **Verlet 积分物理**：`NewPosition = Current + (Current - Previous) * Damping + Force * dt²`
- **空间防穿模排斥力**：非相邻质点间距 < 1.4 世界单位时施加微弱排斥力
- **高斯衰减拖拽**：`weight = (1 - dist/radius)²`，实现柔软无死角面域提拉

### Layer 2 — DOM Hero Card

- `backdrop-filter: blur()` 毛玻璃效果，视频背景透出
- `contenteditable="true"` 可编辑情话区
- "Say Yes" 呼吸光晕按钮

### Layer 1 — 视频背景

- `video/1.mp4` 全屏 `object-fit: cover` 播放
- 边缘模糊遮罩：`radial-gradient` mask + `backdrop-filter: blur()`，柔化宽高比不匹配时的边缘
- 参数可调节：透明度、边缘模糊强度

### 参数控制器

15 个实时调节滑块（左上角面板），分类为：

| 分类 | 参数 |
|------|------|
| 面料 | opacity, blur, tiling, dragRadius, stiffness |
| 物理 | flightForce, threshold, damping, gravity, wind |
| 视频/图层 | videoOpacity, edgeBlur, domBlur |

### Say Yes → 滚动内容过渡

- 点击 "Say Yes" → 白色闪光过渡 → 所有固定图层隐藏
- 向下滚动内容激活：双轨视差 → 相遇粒子 → 合并记忆
- GSAP ScrollTrigger 在过渡完成后自动 refresh

### 新增/修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `index.html` | 重写 | 三图层集成 + 15 参数控制器 + 全 JS/CSS 内联 |
| `wedding_architecture.md` | 新增 | 3D 高定婚纱多图层交互系统核心架构文档 |
| `video/1.mp4` | 新增 | Layer 1 背景视频素材 |
| `code.html` | 保留 | 独立参考实现（含流体渐变背景版） |
| `README.md` | 更新 | v2.0.0 架构图 + 参数表 + 项目结构 |
| `CHANGELOG.md` | 更新 | 本文件 |

### 页面流 (v2.0.0)

```
[视频背景 + 网纱布料 + Hero Card] ──拖拽掀开──▶ [Hero Card] ──Say Yes──▶ [双轨视差] ──▶ [相遇点] ──▶ [合并轨道]
```

### 技术栈

- Three.js r160 (WebGL 2.0) — 双通道渲染 + 程序化纹理
- GSAP 3.12.5 + ScrollTrigger — 过渡动画 + 滚动视差
- canvas-confetti 1.9.3 — 相遇粒子
- 纯手写 Verlet 物理引擎 — 零外部物理库依赖
- Google Fonts: Playfair Display + Cormorant Garamond + Noto Serif SC

---

## v1.1.1 — 物理手感修复 · 掀开桌布体验 (2026-05-30)

### Bug 修复
- **THREE.RGBFormat 错误**：移除 r160 已废弃的格式常量，修复脚本初始化崩溃
- **透明度无效**：`MeshBasicMaterial` 增加 `transparent: true`，滑出动画 opacity 正常生效
- **布料过刚**：约束迭代从 3→1，布料从塑料板变为柔软织物
- **鼠标力度不足**：MOUSE_FORCE 0.18→0.55，拖拽跟手；力场半径 0.55→0.6，褶皱更真实
- **Fallback 纹理冻结**：修复更新条件（帧计数器取模 → 每 3 帧刷新）
- **时间步标准化**：引入固定步长 `FIXED_DT = 1/60`，重力用 `-9.8 m/s²`，物理与帧率解耦
- **角落方向丢失**：滑出前保存 `savedDragCorner` 用于确定滑动方向

### 体验优化
- **桌布掀开手感**：抓取布料底角向外拉，布料产生真实褶皱和跟随，超过 40% 面积位移后自动滑出
- **拖拽提示**：拖拽开始时隐藏底部提示文字，松手后未触发则恢复
- **切后台保护**：大帧跳（>200ms）自动截断，防止布料爆炸
- **移动端触摸**：增加 `touchcancel` 事件处理

---

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

---

## v0.3.0 — 首页 Landing Page & 画布拖拽 (2026-05-30)

### 新增
- **首页 Landing 覆盖层**：全屏暗色背景 `#0a0a0a`，作为整个网站的入口
- **Canvas 新娘剪影**：程序化绘制优雅婚纱剪影（头纱、胸衣、蓬松裙摆、腰带装饰），自适应 DPR 高清渲染
- **画布拖拽交互**：画布初始定位右下角，支持鼠标拖拽 + 触摸拖拽，发光提示环
- **解锁过渡**：画布中心拖至视口中心 22% 阈值内自动触发，白色闪光 + 首页淡出
- **"SAY YES" 按钮**：Playfair Display 衬线字体，`#c0392b` 古典红，悬停填充动画
- **排版设计**：引入 Google Fonts，标题 italic 衬线体
- **新增文件**：`css/landing.css`、`js/landing.js`、`CONTENT_TEMPLATE.md`

---

## v0.2.0 — 模块化拆分 & 版本标识 (2026-05-30)

- **单文件 → 模块化**：`index.html` 瘦身为入口文件，CSS/JS 各自独立
- **CSS 模块**（`css/`）：reset, design-system, dual-track, meeting-point, merged-track, version-badge
- **JS 模块**（`js/`）：config, main, parallax, meeting, merged
- **页面版本标识**：右下角固定显示版本号，亮/暗背景自适应切换

---

## v0.1.0 — 双轨视差骨架搭建 (2026-05-30)

- 完整 HTML/CSS/JS 骨架
- **双轨布局**：GSAP ScrollTrigger 异步视差 (左轨 -45%, 右轨 -70%)
- **相遇点过渡**：canvas-confetti 四次粒子爆发
- **合并轨道**：记忆卡片 ScrollTrigger 逐个淡入
- CDN 依赖：GSAP 3.12.5 + ScrollTrigger + canvas-confetti 1.9.3
