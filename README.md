# 平行宇宙的相遇 — 婚礼叙事网站

> 当前版本 **v2.1.0** | 2026-05-31

纯前端沉浸式婚礼叙事网页。三图层 z-index 堆叠架构：视频背景 → 毛玻璃 Hero Card → Three.js 六边形网纱布料模拟。拖拽掀开 + 粒子特效 → Say Yes → 双轨视差 → 相遇 → 合并记忆。支持参数保存到本地、一键返回婚纱。

---

## 快速启动

```bash
cd C:\Users\Administrator\Desktop\my-wedding
python -m http.server 8080
```

浏览器打开 `http://localhost:8080`

---

## 三图层架构 (v2.0.0 核心)

```
 ┌──────────────────────────────┐
 │  Layer 3 (z:3)  WebGL Cloth  │  ← 正六边形网纱 · Verlet物理 · 拖拽掀开
 │  ┌────────────────────────┐  │
 │  │ Layer 2 (z:2) DOM Hero │  │  ← 毛玻璃模糊 · 情话编辑 · Say Yes
 │  │  ┌──────────────────┐  │  │
 │  │  │ Layer 1 (z:1)    │  │  │  ← 视频背景 · 边缘模糊遮罩
 │  │  │ Video Background │  │  │
 │  │  └──────────────────┘  │  │
 │  └────────────────────────┘  │
 └──────────────────────────────┘

   Say Yes 点击后 ↓
 ┌──────────────────────────────┐
 │  Dual Track → Meeting → Merged│  ← GSAP ScrollTrigger 滚动叙事
 └──────────────────────────────┘
```

### 技术要点
- **Layer 3 — 六边形网纱布料**：Three.js r160 + 纯手写 Verlet 积分物理引擎
  - 质点-弹簧模型：结构弹簧 + 剪切弹簧 + 抗弯曲弹簧
  - 双通道渲染（FrontSide + BackSide）防半透明穿模
  - 程序化正六边形 alphaMap 纹理（Canvas API 动态生成）
  - Raycaster 高斯衰减权重拖拽，任意位置抓取
- **Layer 2 — DOM Hero Card**：`backdrop-filter: blur()` 毛玻璃效果，contenteditable 情话编辑
- **Layer 1 — 视频背景**：`video/1.mp4` 全屏播放，支持边缘模糊遮罩

---

## 当前进度

### 已完成

| 功能 | 技术 | 状态 |
|------|------|------|
| **Layer 3: 六边形网纱布料** | Three.js r160 + Verlet 物理 + 双通道渲染 | ✅ |
| **Layer 2: Hero Card** | DOM + backdrop-filter 毛玻璃 + contenteditable | ✅ |
| **Layer 1: 视频背景** | `<video>` + object-fit: cover + 边缘模糊遮罩 | ✅ |
| **网眼白度控制** | hexFill (0–180) + hexLineWidth (2.0–10.0) 实时可调 | ✅ |
| **掀开粒子特效** | Canvas Sparkle 钻石粒子 + confetti 彩屑双重爆发 | ✅ |
| **参数控制器** | 17 个滑块实时调节（面料/物理/六边形/视频） | ✅ |
| **参数持久化** | 💾 保存到 localStorage，下次自动读取 | ✅ |
| **拖拽掀开交互** | Raycaster + 高斯衰减权重 + 飞行力 | ✅ |
| **Say Yes 过渡** | 闪光过渡 → 滚动内容激活 | ✅ |
| **重返帘幕按钮** | 滚动内容右下角悬浮按钮，一键返回婚纱状态 | ✅ |
| **双轨视差** | GSAP ScrollTrigger 异步视差 (yPercent -45%/-70%) | ✅ |
| **相遇点** | canvas-confetti 四次粒子爆发 + 文字淡入 | ✅ |
| **合并轨道** | 三张记忆卡片逐个 ScrollTrigger 淡入 | ✅ |
| **版本标识** | 右下角 v2.1.0 标识，亮/暗背景自适应 | ✅ |

### 待替换

- `video/1.mp4` — 可替换为其他背景视频
- `assets/images/photo-*.jpg` — 照片素材
- 双轨文字和记忆卡片文案（直接编辑 HTML 或后续替换）

---

## 页面流

```
[视频背景 + 网纱布料 + Hero Card] ──拖拽掀开──▶ [Hero Card 显露] ──点击 Say Yes──▶ [双轨视差] ──滚动──▶ [相遇粒子] ──▶ [合并记忆]
```

---

## 物理参数调校

实时控制面板（左上角），改滑块即时生效：

### 面料参数
| 参数 | 默认值 | 范围 | 效果 |
|------|--------|------|------|
| `hexFill` | 80 | 0–180 | 网眼填充白度 (0=极透, 180=厚白) |
| `hexLineWidth` | 5.0 | 2.0–10.0 | 六边形框线粗细 |
| `opacity` | 0.86 | 0.3–1.0 | 白纱整体不透明度 |
| `blur` | 0.6px | 0–2.5px | 薄纱柔焦微朦胧 |
| `tiling` | 448 | 10–600 | 六边形纹理细腻度 |
| `dragRadius` | 7.0 | 1.0–10.0 | 拖拽连带范围 |
| `stiffness` | 0.35 | 0.1–1 | 面料挺括度 |

### 物理参数
| 参数 | 默认值 | 范围 | 效果 |
|------|--------|------|------|
| `flightForce` | 1.8 | 0.5–4.0 | 掀开后飞行推力 |
| `threshold` | 120 | 50–250 | 触发掀开灵敏度 (px) |
| `damping` | 0.98 | 0.90–0.99 | 空气阻尼 (0.9=快停, 0.99=飘摇) |
| `gravity` | 0.014 | 0–0.04 | 悬垂重力 |
| `wind` | 0.015 | 0–0.04 | 微风扰动强度 |

### 视频/图层参数
| 参数 | 默认值 | 范围 | 效果 |
|------|--------|------|------|
| `videoOpacity` | 0.92 | 0.3–1.0 | 视频层透明度 |
| `edgeBlur` | 0px | 0–40px | 边缘模糊遮罩强度 |
| `domBlur` | 15px | 0–30px | DOM 层毛玻璃强度 |

---

## 项目结构

```
my-wedding/
├── index.html              ← ★ 入口文件 (三图层集成)
├── README.md               ← 本文件
├── CHANGELOG.md             ← 完整变更日志
├── PROMPT_GUIDE.md          ← 设计规格与版本记录
├── CONTENT_TEMPLATE.md      ← 用户可修改内容清单
├── wedding_architecture.md  ← 3D 婚纱物理模拟核心架构文档
├── code.html               ← 参考实现 (独立版布料模拟 + 控制面板)
├── css/                    ← 独立 CSS 模块 (v1.x 遗留, v2.0 内联)
├── js/                     ← 独立 JS 模块 (v1.x 遗留, v2.0 内联)
├── video/
│   └── 1.mp4              ← 背景视频 (Layer 1)
└── assets/
    ├── video/              ← 新娘转身视频 (Layer 3 旧版用)
    └── images/             ← 照片素材
```

---

## 版本历史

```
v2.1.0  网眼白度 + 掀开特效 + 重返按钮 + 参数保存/加载 (当前)
v2.0.0  三图层 z-index 架构 — 六边形网纱 + 视频背景 + 参数控制器
v1.1.1  物理手感修复 — 桌布掀开体验
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
