# 项目愿景：【平行宇宙的相遇】交互式婚礼叙事网站

> **版本记录**（详见 [CHANGELOG.md](./CHANGELOG.md)）
> - v1.1.0 (2026-05-30): Three.js 布料模拟 — 视频纹理画布 + 物理拖拽掀开 + Hero Card 杂志排版
> - v0.3.0 (2026-05-30): 首页画布拖拽 + 新娘剪影 + SAY YES 按钮过渡
> - v0.2.0 (2026-05-30): 模块化拆分 — CSS/JS 独立文件，右下角版本标识
> - v0.1.0 (2026-05-30): 双轨视差骨架 — GSAP ScrollTrigger + canvas-confetti + 合并轨道

---

## 0. 整体页面流 (Page Flow)

```
[Three.js 布料画布] ──(掀开角落拖至40%)──▶ [Hero Card 求婚卡片] ──(点击 Say Yes)──▶ [双轨视差] ──(滚动)──▶ [相遇点] ──▶ [合并轨道]
```

三层结构（z-index 叠加）：
- **Layer 1 (z:1000):** Three.js 全屏布料画布 — 顶层交互
- **Layer 2 (z:900):** Hero Card — 画布滑出后显露
- **Layer 3:** 双轨视差页 — Say Yes 后激活

---

## 1. 首页 — 转身新娘与命运画布 (Three.js Cloth) ★ v1.1.0

### 1.1 交互逻辑
* 全屏 Three.js WebGL 画布，60×60 顶点 PlaneGeometry 网格模拟柔软布料。
* **视频纹理：** 布料表面播放"新娘转身"视频（`THREE.VideoTexture`），视频随布料形变同步弯曲。
* **物理模拟：** Verlet 积分 + 结构/剪切距离约束，顶部一行顶点固定，其余受重力 + 阻尼影响。
* **拖拽交互：** 仅允许从布料左下角或右下角抓取（Raycaster 判定，半径 0.22 世界单位）。拖拽时鼠标位置施加二次衰减力场到附近顶点。
* **触发临界点：** 实时追踪每个顶点距原始位置的位移。当超过 40% 顶点位移 > 0.08 单位时，触发滑出动画。
* **滑出动画：** GSAP Timeline — 布料沿拖拽方向平移出屏 + 绕 Y 轴旋转 + 透明度衰减，持续 0.9s。
* **Fallback 纹理：** 若无视频文件，自动使用 Canvas 2D 程序化纹理（婚纱剪影 + 微光波动动画）。
* `touch-action: none` 确保移动端触控流畅，无浏览器默认手势干扰。

### 1.2 技术规格
| 参数 | 值 | 说明 |
|------|-----|------|
| 网格密度 | 60 × 60 (3721 顶点) | PlaneGeometry segments |
| 约束类型 | 结构 + 剪切 | 水平/垂直 + 两条对角线 |
| 约束迭代 | 3 次/帧 | 越多越硬，越少越软 |
| 重力 | -0.0004 | 世界单位/frame² |
| 阻尼 | 0.98 | 速度衰减系数 |
| 触发阈值 | 40% 顶点位移 > 0.08 | DISPLACE_THRESHOLD / TRIGGER_RATIO |
| 时间步上限 | 33ms (~30fps) | 防止大帧跳跃穿模 |
| 渲染器 | WebGLRenderer, DPR ≤ 2 | antialias: true |

### 1.3 视频配置
* 载体：`<video autoplay muted loop playsinline>`
* 路径：`assets/video/bride-turn.mp4`（支持 mp4/webm）
* 纹理：`THREE.VideoTexture` → `MeshStandardMaterial.map`
* iOS 兼容：`playsinline` + `webkit-playsinline` + muted autoplay

---

## 2. Hero Card — 求婚/大日子卡片 (新增 v1.1.0)

### 2.1 交互逻辑
* 布料画布完全滑出后，Hero Card 从底层淡入显现（GSAP 0.8s）。
* 上半部分：`contenteditable="true"` 可编辑文本区，用户可直接在页面上书写情话。
* 下半部分："Say Yes" 按钮，呼吸光晕动画 + 悬停填充。

### 2.2 排版规格
| 元素 | 字体 | 大小 | 字重 | 颜色 | 其他 |
|------|------|------|------|------|------|
| 情话文本 | Cormorant Garamond / Noto Serif SC | `clamp(1.2rem, 2.5vw, 1.55rem)` | 300 | `#d4cfc8` | `letter-spacing: 0.08em`, `line-height: 2.1` |
| Say Yes 按钮 | Playfair Display / Cormorant Garamond | `1.05rem` | 500 | `#c0392b` | `letter-spacing: 0.35em`, 大写 |

### 2.3 按钮呼吸光晕 (Breathing Glow)
```css
@keyframes breathe {
  0%, 100% { box-shadow: 0 0 8px rgba(192,57,43,0.15), 0 0 20px rgba(192,57,43,0.06); }
  50%      { box-shadow: 0 0 18px rgba(192,57,43,0.35), 0 0 45px rgba(192,57,43,0.12); }
}
```
悬停时呼吸频率加快（3s → 1.5s），光晕强度提升。

---

## 3. 核心视觉与交互逻辑 (Dual Track — 保持自 v0.1.0)

本网站是一个纯前端的沉浸式叙事网页，展现两个独立的个体从各自平行发展到交织相遇的浪漫故事。

* **相遇前（上半部分页面）：** 屏幕水平一分为二（.track-left 与 .track-right）。
    * 滚动时，两侧以微小的视差比例（Parallax Scroll）异步向上滚动。背景为极简暗色调。
* **相遇点（黄金分割交汇线）：** 滚动到特定节点时，中央分界线散开，屏幕猛地拉开由暗转亮。
    * 触发全屏的 Canvas 浪漫粒子汇聚/烟花特效。
* **相遇后（下半部分页面）：** 合并为一个单轨全屏页面（.merged-track），共同记忆丝滑淡入。

## 4. 技术栈约束与增强扩展 (Technical & Skills)

* **核心底座：** 纯原生 HTML5 / CSS3 / Vanilla JS (ES6+)。不使用 React/Vue 框架。
* **动效增强（允许引入）：**
    * **GSAP (GreenSock)** + **ScrollTrigger** — 滚动视差与时间轴动画
    * **Three.js** (r160) — WebGL 布料模拟与视频纹理映射
    * **canvas-confetti** — 相遇瞬间粒子烟花特效
* **审美要求：** 现代杂志排版、大胆留白、精致的微动效，拒绝传统婚庆审美。

## 5. 核心色彩与视觉变量 (Design System)

```css
:root {
  --bg-dark: #121212;          /* 深邃夜空黑 */
  --bg-light: #fafafa;         /* 纯净高级白 */
  --romantic-pink: #f4c2c2;    /* 克制情感粉 */
  --hero-red: #c0392b;         /* Hero Section 古典红 */
  --text-main: #333333;
  --text-muted: #888888;
  --hero-text: #d4cfc8;        /* Hero Card 暖灰文本 */
}
```

## 6. 素材存放路径

```
assets/
├── video/
│   └── bride-turn.mp4     ← 新娘转身视频 (mp4/webm, 建议 720×1280 竖屏)
└── images/
    ├── photo-his-01.jpg   ← 左轨照片 (他的故事)
    ├── photo-her-01.jpg   ← 右轨照片 (她的故事)
    ├── photo-us-01.jpg    ← 合并轨道照片 1
    ├── photo-us-02.jpg    ← 合并轨道照片 2
    └── photo-us-03.jpg    ← 合并轨道照片 3
```
