# 项目断点保存 — 平行宇宙的相遇

> **最后更新**：2026-07-16
> **当前版本**：v3.25.1（`index.html` 内 `APP_VERSION` 已同步为 "3.25.1"）
> **工作目录**：`C:\Users\Administrator\Desktop\my-wedding`  
> **启动方式**：`python -m http.server 8080` → `http://localhost:8080`

---

## ⚠️ 以后每次工作前，先读这个文档

---

## 一、当前实现进度

### 已完成 ✅

| 模块 | 说明 | 文件 |
|------|------|------|
| **三图层 z-index 架构** | Layer1 视频背景 (z:1) + Layer2 DOM/毛玻璃 (z:2) + Layer3 WebGL 网纱布料 (z:3) | `index.html` |
| **六边形网纱纹理** | Canvas API 程序化生成，alphaMap 透明通道，双通道渲染防穿模 | `index.html` |
| **Verlet 积分物理** | 质点-弹簧模型（结构+剪切+抗弯曲），高斯衰减拖拽，空间防穿模排斥力 | `index.html` |
| **Raycaster 拖拽掀开** | 任意位置抓取布料，拖动 > threshold 触发掀开飞行力 | `index.html` |
| **掀开粒子特效** | Canvas Sparkle 钻石粒子 + canvas-confetti 双重爆发 + DOM 白光闪过 | `index.html` |
| **Hero Card** | contenteditable 情话编辑 + Say Yes 呼吸光晕按钮 | `index.html` |
| **Say Yes → 滚动内容** | GSAP 白色闪光过渡，隐藏固定图层，激活下方滚动叙事 | `index.html` |
| **双轨视差** | GSAP ScrollTrigger 异步视差 (左轨 -45%, 右轨 -70%)，分界线消散 | `index.html` |
| **相遇粒子** | canvas-confetti 四次爆发 + 文字淡入 + 点击重新触发 | `index.html` |
| **合并记忆卡片** | 三张卡片 ScrollTrigger 逐个淡入 | `index.html` |
| **Coverflow Gallery** | 中心直立、左右各三张，共 7 张可见；侧卡统一轻微变暗，支持点按、拖动、按钮、方向键和 50 张以上照片队列，不自动轮转 | `index.html` / `Coverflow Gallery.md` |
| **恋爱天数计数器** | 以 2018-07-20 为起始日自动显示相恋天数；编辑态可调整字号、字重、颜色和拖动位置，保存到 `wedding_anniversary_style_v1` | `index.html` |
| **结尾照片揭示** | 最终求婚章节可由管理员上传一张结尾照片；固定使用符合 Worker 校验的 R2 保留记录 `poster-finale-photo`，不进入内容包 | `index.html` / `cloudflare-r2-worker/` |
| **海报点按与大容量图库** | 海报背景无可见边框；仅点按时放大并显示可编辑白色字幕；字号可调；滚动刻度音与兼容设备震动；可批量选择 80 张以上 4K 原图，IndexedDB 保存原图、轮换读取缩略图 | `index.html` / `PHOTO_STORAGE.md` |
| **R2 跨设备云端图库** | 已部署正式 Worker；新设备默认连接 R2，使用 Bearer 管理口令分层上传原图/缩略图，并支持公开读取和字幕更新 | `index.html` / `cloudflare-r2-worker/` |
| **主人编辑认证** | 公开铅笔入口必须先用 R2 管理口令调用 Worker `/api/auth` 验证；成功后当前标签页才显示上传/编辑工具，口令不持久化 | `index.html` / `cloudflare-r2-worker/` |
| **单框连续密码故事入口** | 只显示一个密码框与“娜娜の生日”；连续两次输入 `19980607` 才进入，不显示进度，任意错误清零并只提示“密码错误” | `index.html` |
| **参数控制面板** | 17 个滑块，三分类（六边形纹理/面料物理/视频图层） | `index.html` |
| **参数持久化** | localStorage 保存/加载，键名 `wedding_veil_config_v2` | `index.html` |
| **重返帘幕按钮** | 滚动内容右下角悬浮按钮，一键返回三图层状态 | `index.html` |
| **内容编辑系统** | ✏️ 编辑模式开关 + 26 个 `data-ck` 文字/占位对象 + localStorage 持久化 | `index.html` |
| **PPT 式拖拽排版** | 编辑模式下每个可编辑对象显示拖拽点，可移动文字位置并保存到 `wedding_layout_v1` | `index.html` |
| **故事模块编辑器** | 编辑模式下可添加故事、照片、时间线、誓言模块；支持编辑、上移/下移、复制、删除，保存到 `wedding_story_modules_v1` | `index.html` |
| **28 张拍立得照片墙** | 新增独立页面，28 张拍立得相纸随机桌面摆放；可上传照片、桌面端悬停 1.6x 默认放大且倍数可调，左下角按钮只翻面，照片区和右下角淡箭头进入记忆舞台，背面手写区只负责编辑。照片墙翻面状态与回忆舞台翻面状态已拆分：舞台始终正面开始，舞台翻面后相纸移到左侧并在右侧显示/编辑故事，不会改写墙内状态；一键翻面不放大任何相纸、背面禁用上传误触、背面字号可调、背面写手写体文字，右上角编号 1-28；照片墙背景已改为暖纸桌面和柔光质感 | `index.html` |
| **拍立得一键排列** | 页面底部可一键按 1-28 排列，约占屏幕 80% 宽度；间距滑块只在此页显示，并可保存到 `wedding_polaroid_layout_v1` | `index.html` |
| **中国路线地图单页** | 原 `route-points` / `route-labels` 合并为 `route-map`；坐标固定，路线慢速流转，地图放大，地名字号可调，悬停/点击地址点后地名累计保留，全部显示后中国地图轮廓浮现 | `index.html` |
| **最终求婚章节** | 首屏按钮改为“翻开我们的故事”；路线地图后新增最终求婚页，求婚信、问题与答应后的文字全部接入 `data-ck` 编辑保存；点击“我愿意”后进入戒指光环、香槟金/玫瑰庆祝与未来誓言状态 | `index.html` |
| **“下一站”仪式转场** | 路线地图与求婚终章之间新增主动进入的情绪停顿页；文案可编辑，按钮平滑带入最终问题；首页柔焦限制在文字附近，浏览态隐藏版本号并弱化编辑入口 | `index.html` |
| **求婚现场音乐** | 本地音乐由左下角按钮手动开启并渐入/渐出；进入“下一站”自动压低到适合说话的音量，答应后轻轻回升；移动端保持紧凑且不依赖自动播放 | `index.html` / `music/` |
| **主叙事照片直传** | 双轨 2 张与共同记忆 3 张照片位在编辑模式可直接上传/更换；压缩后保存到 `wedding_fixed_photos_v1`，接入内容包、容量保护、键盘/触摸入口 | `index.html` |
| **动态照片模块直传** | 工具栏“加照片”创建的动态模块可独立上传/更换真实照片；压缩后保存到 `wedding_story_modules_v1`，接入容量预估、内容包安全导入与浏览态防误触 | `index.html` |
| **自由照片框直传** | 任意页面“加照片框”可上传/更换图片、编辑说明、拖动和换背景；压缩后保存到 `wedding_free_items_v1`，空框在浏览态隐藏，窗口缩窄后自动归位 | `index.html` |
| **编辑工具栏收纳** | 工具栏可收起为约 110px 的“展开编辑工具”按钮；新增自由框后自动收起，避免遮挡框体控制 | `index.html` |
| **求婚现场预演** | 编辑工具中打开排练对话框，可从帘幕、照片墙、“下一站”或最终求婚开始；自动保存/退出编辑并支持全屏入口 | `index.html` |
| **正式展示态主题收口** | 故事区去除编辑器文案；地图字号和相纸排版/字号/保存设置仅编辑态显示，浏览态照片墙只保留两个回忆动作 | `index.html` |
| **自由页面编辑器** | 工具条新增加文本框/加照片框/撤销/保存；每个页面都可新增自由浮层对象，支持拖动、复制、删除、背景颜色切换，保存到 `wedding_free_items_v1` | `index.html` |
| **页面删除与恢复** | 编辑工具可删除当前内容页并恢复最近删除页；开场入口受保护，隐藏状态保存到 `wedding_hidden_pages_v1` 并进入内容包 | `index.html` |
| **自由框页面锚定** | 平行宇宙页自由框锚定到 sticky 舞台，普通页面自由框随所在页面滚动；连续新增会自动错开避免遮挡控制点 | `index.html` |
| **自由框页面融合** | 新增文本框/照片框渲染到每页 `.free-item-layer`，浏览态不拦截点击，并随页面进入/离开视口柔和淡入淡出 | `index.html` |
| **编辑性能优化** | 输入时只保存脏字段，空闲时延迟写入；完整保存只在点击保存/退出编辑时执行，减少 contenteditable 卡顿 | `index.html` |
| **内容包与容量保护** | 编辑工具栏新增完整内容包导出/导入、本地容量计量和警告；导入只接受本项目格式、清理可执行属性并在失败时回滚；拍立得照片最长边压到 900px 并逐级降低 JPEG 质量以控制单张体积 | `index.html` |
| **版本标识** | 编辑模式显示右下角版本号；正式浏览时隐藏，避免技术信息干扰求婚画面 | `index.html` |
| **项目技能文档** | 新增并对齐 `My Wedding Master Skill.md` 与 `Responsive Desktop & Mobile Adaptation Skill.md`，后续工作需按当前单文件架构、相纸记忆舞台、路线地图和响应式规则执行 | `*.md` |

### 未完成 / 待定 ❌

| 事项 | 说明 |
|------|------|
| **视频素材可替换** | 当前 `video/1.mp4`（7.5MB），可换成其他背景视频 |
| **真实故事内容** | 文字、故事模块、自由文本框均可在编辑模式中替换，仍需填入真实内容 |
| **现场浏览器有声确认** | 音乐已集成；自动化浏览器无音频输出，正式展示前仍需在现场 Chrome/Safari 试听一次 |
| **移动端完整测试** | CSS 有响应式断点但未在真机全面测试 |
| **旧文件清理** | `css/` `js/` `assets/`、`CONTENT_TEMPLATE.md`、`PROMPT_GUIDE.md` 与 `想要实现的效果.txt` 为 v1.x 遗留；`music/` 已被当前页面的现场音乐控件使用，不能删除 |

---

## 二、项目文件结构

```
my-wedding/
├── index.html              ← ★ 核心文件 (约465KB)，所有 CSS/JS 内联，唯一入口
├── code.html               ← 参考实现 (25KB)，独立版布料模拟+流体背景
├── video/
│   └── 1.mp4              ← Layer 1 背景视频 (7.5MB)
├── README.md               ← 项目说明
├── CHANGELOG.md             ← 完整版本历史
├── CHECKPOINT.md            ← ★ 本文件，断点保存
├── My Wedding Master Skill.md ← ★ 项目总控技能：当前架构、存储键、回归保护与验证规则
├── Responsive Desktop & Mobile Adaptation Skill.md ← ★ 响应式技能：桌面/移动端适配规则与重点页面检查表
├── wedding_architecture.md  ← 物理模拟核心架构文档
├── .gitignore
├── .git/                    ← Git 仓库
│
├── css/    (7 文件) ← v1.x 遗留，未被 index.html 引用
├── js/     (8 文件) ← v1.x 遗留，未被 index.html 引用
├── assets/           ← 旧素材目录 (空)
├── music/            ← Ed Sheeran - Perfect.mp3 (10MB，现场音乐控件已集成)
├── PROMPT_GUIDE.md   ← 旧设计规格 (已由 README + wedding_architecture 覆盖)
├── CONTENT_TEMPLATE.md ← v1.x 内容模板
└── 想要实现的效果.txt    ← 早期笔记
```

**关键事实**：当前 `index.html` 是**完全自包含**的（所有 CSS/JS 内联），不依赖 `css/` 和 `js/` 目录中的任何文件。CDN 依赖：Three.js r160 + GSAP 3.12.5 + ScrollTrigger + canvas-confetti 1.9.3 + Google Fonts。

---

## 三、架构速查

### 页面流

```
[三图层叠加] 
  ├─ z:3 WebGL 六边形网纱布料 → 拖拽掀开
  ├─ z:2 DOM Hero Card (毛玻璃) + Say Yes 按钮
  └─ z:1 视频背景 video/1.mp4
           │
           │ 掀开 + 点击 Say Yes
           ▼
[闪光过渡]
           │
           ▼
[滚动叙事内容]
  ├─ 双轨视差 (His Universe / Her Universe)
  ├─ 相遇点 (confetti + "我们相遇了")
  ├─ 合并记忆 (三张卡片)
  ├─ 故事模块
  ├─ 28 张拍立得照片墙
  ├─ 单页路线地图
  └─ 最终求婚 / 我愿意
```

### 关键 z-index 值

| 元素 | z-index | 说明 |
|------|---------|------|
| `#webgl-container` | 3 | 顶层布料交互 |
| `#layer-dom` | 2 | 中层毛玻璃 Hero |
| `#layer-video` | 1 | 底层视频背景 |
| `.controls` | 100 | 参数面板 |
| `#unveil-sparkles` | 150 | 掀开粒子 canvas |
| `.return-btn` | 200 | 返回按钮 |
| `.transition-flash` | 2000 | 白色闪光过渡 |

---

## 四、复盘报告：Bug 与修复

### Bug #1：白纱完全消失（v2.1.0 初始化顺序错误）⚠️ 严重

**日期**：2026-05-31

**现象**：页面加载后 WebGL 白纱布料完全不可见，如同没有渲染。

**根因**：`applyConfig()` 初始化循环在 Three.js 材质对象创建**之前**执行。

错误执行流程：
```
1. applyConfig('hexFill', 80) 被调用
2. → createHexagonalTexture() 创建新 alphaTexture
3. → 尝试 matBack.alphaMap = alphaTexture
4. → 但 matBack 此时是 undefined！(材质还没创建)
5. → if (matBack && matFront) 为 false，赋值被跳过
6. → 新纹理丢失，旧纹理已被 dispose()
7. ...之后材质才创建，但引用了已被 dispose 的纹理
8. → WebGL 渲染时无有效 alphaMap → 白纱不可见
```

**修复**：将 `applyConfig` 初始化循环移到材质创建之后（`index.html` 第 1318 行）。

正确执行流程：
```
1. 创建 THREE 场景、相机、渲染器
2. createHexagonalTexture() — 创建初始纹理
3. 创建几何体 PlaneGeometry
4. 创建材质 matBack / matFront (引用初始纹理)
5. 创建网格 meshBack / meshFront，添加到场景
6. ★ applyConfig 初始化循环 (此时材质已存在)
7. → hexFill/hexLineWidth 触发 createHexagonalTexture()
8. → matBack.alphaMap = alphaTexture ✅ 正确赋值
9. → matBack.needsUpdate = true ✅ 触发 GPU 更新
```

**教训**：
- JavaScript 文件中的初始化顺序至关重要
- 任何依赖 DOM 元素或 Three.js 对象的操作，必须在该对象创建之后
- `if (obj && ...)` 的静默失败掩盖了问题——应加 `console.warn` 或 `else` 分支
- 建议在关键赋值点加防御性日志，方便定位初始化问题

---

### Bug #2：hexFill 默认值过低导致白纱过透

**日期**：2026-05-31

**现象**：即使修复 Bug #1 后，白纱在视频背景上仍然几乎看不见。

**根因**：`hexFill` 默认值为 55（背景灰度 ~22%），配合 0.86 的 opacity，网眼间有效不透明度仅约 19%，在动态视频背景上极难分辨。

**修复**：`hexFill` 默认值从 55 提升到 80（背景灰度 ~31%，有效不透明度约 27%），同时 `hexLineWidth` 默认 5.0 保证六边形框线可见。

**教训**：
- alphaMap 中的灰度值直接影响透明度：`gray/255 * opacity = 有效透明度`
- 在深色/动态背景上需要更高的填充白度
- 提供滑块调节器是正确的设计决策，用户可根据实际效果自行调整

---

### Bug #3：参数重复初始化导致纹理多次重建

**日期**：2026-05-31

**现象**：页面初始化时 `createHexagonalTexture()` 被调用 3 次（初始 1 次 + hexFill 触发 1 次 + hexLineWidth 触发 1 次），每次 dispose 旧纹理并新建，浪费 GPU 资源。

**根因**：`applyConfig` 循环遍历所有 sliderMap 键，hexFill 和 hexLineWidth 都会触发纹理重建。

**修复**：未完全修复，当前仍会重建 2 次（初始 1 次 + 2 次 applyConfig）。性能影响可忽略（< 1ms），但不够优雅。未来可优化为：初始 applyConfig 跳过 hexFill/hexLineWidth，仅靠初始 `createHexagonalTexture()` 生成。

---

## 四-B、v2.2.0 改进记录

### 改进 #1：婚纱蕾丝纹理质感提升

**日期**：2026-06-27

**变更**：`createHexagonalTexture()` 函数全面升级：
- 画布分辨率 256×256 → 512×512（4倍像素，纹理更清晰）
- 三层蕾丝图案：
  - Layer 1：主六边形轮廓（结构线，较粗）
  - Layer 2：内层同心六边形（类似刺绣，半透明细线）
  - Layer 3：顶点装饰结点（仿真实薄纱的打结点）
- 背景添加细微随机噪声（±4灰度），模拟面料纤维纹理
- 线宽自动按画布比例缩放（`config.hexLineWidth * 2`）

**效果**：白纱从简单的单层六边形网格 → 多层次蕾丝花纹，更接近真实婚纱薄纱（tulle）质感。

### 改进 #2：材质升级 — 面料丝光（Sheen）

**日期**：2026-06-27

**变更**：材质从 `MeshStandardMaterial` 升级为 `MeshPhysicalMaterial`：
```
sheen: 1.2            // 丝光强度
sheenColor: 0xffffff  // 白色丝光
sheenRoughness: 0.65  // 丝光柔和度（0=锐利镜面，1=完全漫反射）
roughness: 0.85       // 基础粗糙度（从0.94下调，配合sheen）
```

**效果**：白纱在光照下呈现微弱的丝绸光泽，不再是一块"哑光白布"。`MeshPhysicalMaterial.sheen` 是 Three.js 专为布料（cloth/fabric）渲染设计的属性。

### 改进 #3：桌面端性能优化（三项）

**日期**：2026-06-27

**问题**：桌面端卡顿，主要瓶颈：
1. 高分屏 pixelRatio=2 渲染 4× 像素
2. 防穿模 O(n²) 循环每帧 ~37,800 次距离检测
3. 约束求解每帧 4 次迭代 × ~3,700 条约束

**变更**：
| 优化项 | 旧值 | 新值 | 预估性能提升 |
|--------|------|------|-------------|
| `setPixelRatio` 上限 | 2 | 1.5 | 高DPI屏省 ~44% 像素 |
| 防穿模执行频率 | 每帧 | 隔帧 (`frameCount % 2`) | 省 ~50% 碰撞检测 |
| 约束迭代次数 | 4 | 3 | 省 ~25% 约束计算 |

**保留不变**：几何体分段（42×30）、粒子数（1260）、约束类型（结构+剪切+抗弯曲）——确保物理模拟精度不降低。

---

## 五、当前 17 个可调参数 (全部默认值)

### 六边形纹理（控制白纱外观）
| 参数 | 默认 | 范围 | 说明 |
|------|------|------|------|
| `hexFill` | 80 | 0–180 | 网眼填充白度。0=极透，180=厚白 |
| `hexLineWidth` | 5.0 | 2.0–10.0 | 六边形框线粗细 |
| `tiling` | 450 | 10–600 | 纹理细腻度（重复次数）；已从线上保存配置写入默认值 |

### 面料
| 参数 | 默认 | 范围 | 说明 |
|------|------|------|------|
| `opacity` | 0.86 | 0.3–1.0 | 白纱整体不透明度 |
| `blur` | 0.6px | 0–2.5px | WebGL 画布柔焦 |
| `dragRadius` | 7.0 | 1.0–10.0 | 拖拽连带范围 |
| `stiffness` | 0.35 | 0.1–1 | 面料挺括度 |

### 物理
| 参数 | 默认 | 范围 | 说明 |
|------|------|------|------|
| `flightForce` | 1.8 | 0.5–4.0 | 掀开飞行推力 |
| `threshold` | 120 | 50–250 | 触发灵敏度（px） |
| `damping` | 0.98 | 0.90–0.99 | 空气阻尼 |
| `gravity` | 0.014 | 0–0.04 | 悬垂重力 |
| `wind` | 0.015 | 0–0.04 | 微风扰动 |

### 视频/图层
| 参数 | 默认 | 范围 | 说明 |
|------|------|------|------|
| `videoOpacity` | 0.92 | 0.3–1.0 | 视频层透明度 |
| `edgeBlur` | 0px | 0–40px | 边缘模糊遮罩 |
| `domBlur` | 7px | 0–30px | 首屏文字层背景柔焦强度 |

### 保存/加载
- **保存**：点控制面板 `💾 保存设置` → localStorage 键 `wedding_veil_config_v2`
- **加载**：页面初始化自动读取，合并到 DEFAULTS（新参数用默认值兜底）
- **存储的键**：全部 17 个参数 + xSegs/ySegs/width/height

### 编辑器本地存储
- `wedding_content_v1`：静态 `data-ck` 文案内容
- `wedding_layout_v1`：静态文案拖拽偏移
- `wedding_story_modules_v1`：故事/照片/时间线/誓言模块
- `wedding_free_items_v1`：每页自由新增的文本框/照片框
- `wedding_polaroids_v1`：28 张拍立得照片、背面手写文字和记忆展开故事字段（`memoryTitle` / `memoryDate` / `memoryPlace` / `memoryStory`）
- `wedding_polaroid_layout_v1`：拍立得排列模式、间距、悬停放大倍数（`hoverScale`）和背面字大小（`noteFontSize`）
- `wedding_route_label_size_v1`：地图地名字号
- 编辑输入采用脏字段延迟保存；点击工具条 `保存` 或退出编辑模式会完整保存当前编辑状态

---

## 六、技术速查

### 关键函数

| 函数 | 位置 | 用途 |
|------|------|------|
| `createHexagonalTexture()` | `index.html` ~1237 | 生成六边形 alphaMap，控制白纱外观 |
| `class Particle` | `index.html` ~1320 | Verlet 积分质点 |
| `initPhysics()` | `index.html` ~1351 | 初始化/重置物理网格和约束 |
| `triggerFabricUnveil(dirSign, cx, cy)` | `index.html` ~1480 | 掀开：释放锚点 + 飞行力 + 粒子特效 |
| `triggerSparkles(cx, cy)` | `index.html` ~1450 | Canvas 钻石粒子爆发 |
| `applyConfig(key, val)` | `index.html` ~1139 | 参数变更实时生效 |
| `loadConfig()` | `index.html` ~1020 | 从 localStorage 加载参数 |
| `saveConfig()` | `index.html` ~1028 | 保存参数到 localStorage |
| `resetSim()` | `index.html` ~1945 | 复位布料（重返帘幕调用） |
| `animate()` | `index.html` ~1970 | 主渲染循环 |

### 外部 CDN（加载顺序重要）

```html
<!-- 1. 字体 -->
Google Fonts (Playfair Display + Cormorant Garamond + Noto Serif SC)

<!-- 2. 动画 -->
cdnjs.cloudflare.com/gsap/3.12.5/gsap.min.js
cdnjs.cloudflare.com/gsap/3.12.5/ScrollTrigger.min.js

<!-- 3. 3D -->
cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js

<!-- 4. 粒子 -->
cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js
```

---

## 七、下一步可做的工作

### v3.25.1 验证记录
- 修复结尾照片原保留 ID `finale-photo` 不符合 Worker `/^poster-[a-zA-Z0-9-]{8,90}$/` 校验、实际返回 `400 invalid-id` 却被前端错误提示为管理员口令错误的问题。
- 页面统一改用 `poster-finale-photo`；它仍会从海报轮换列表排除，并且不进入本地内容包。
- 上传提示根据实际异常细分为口令、80MB 文件上限、请求格式、云端配置或网络/服务问题。
- `node --test test/worker.test.mjs` 通过；测试覆盖 `poster-finale-photo` 的上传、目录、读取与删除完整生命周期，并确认旧 `finale-photo` 返回 `400`。
- `index.html` 内联脚本语法解析通过，`git diff --check` 通过。

### v3.25.0 发布前验证记录
- 已同步 2026-07-15 至 2026-07-16 的海报画框、恋爱天数、结尾照片与视觉优化；版本号更新为 `3.25.0`。
- 正文打开/后台标签页时，WebGL 布料循环跳过物理计算和渲染；回到首屏仍执行原有 `resetSim()`。
- `node --test test/worker.test.mjs` 通过：R2 图库生命周期、鉴权、CORS 与体积限制全部通过。
- In-app Browser 桌面与 `390×844` 验证通过：首屏加载、恋爱天数 `2918`、版本标识 `v3.25.0` 正确；手机端 `scrollWidth <= innerWidth`，无横向溢出，也未发现页面脚本错误。
- 浏览器仅保留 Three.js r160 全局构建方式的弃用警告；当前 CDN 正常加载，后续模块化时再迁移到 ES Modules。
- 已提交并推送到 GitHub `main`：`ca44bf4 feat: 完成 v3.25 发布收口`；推送前已再次同步 `origin/main`，无 CNAME 或其他合并冲突。

### v3.24.0 验证记录
- `index.html` 内联脚本、Worker Mock R2 测试与 `git diff --check` 通过；测试覆盖 `localhost:8080` 的管理员认证 CORS。
- In-app Browser 验证故事入口只有 1 个密码框；错误时只显示“密码错误”，第一次正确后无进度提示且弹窗保持，连续第二次正确后进入主叙事。
- 桌面与 390×844 均验证 Coverflow 正好 7 张可见：中心 `--poster-dim: 0`，六张侧卡均为 `0.42`，手机无横向溢出。
- 相纸验证：翻面后为 active，点击墙外后 active 清除但 `is-flipped` 保留；删除“相纸墙”后“恢复删页（1）”可恢复并清空删除状态。
- 编辑主人口令在 8090 本地页面真实验证成功；Worker 版本 `aa1960c6-87f0-4a1b-8113-4a6470d15711` 已发布。`localhost:8080` / `127.0.0.1:8080` 的预检均为 204、正确口令认证均为 200，错误口令为 401；本轮未推送 GitHub。

### v3.23.0 验证记录
- `index.html` 内联脚本、Worker 脚本与 `git diff --check` 通过；Mock R2 测试新增 `/api/auth` 未授权 401、正确口令 200 覆盖。
- In-app Browser 桌面验证：双密码只正确一次仍显示错误，两次均为 `19980607` 后进入主叙事；Coverflow 初始仅 5 张可见，下一张 0.6 秒切到 `02 / 12`，等待后不再自动轮转。
- 390×844 验证：Coverflow 中心卡约 `226×380px`、5 卡变换完整、页面无横向溢出；故事密码框约 `358×445px`，管理员框约 `358×407px`，输入自动聚焦。
- 真实 Worker 验证：错误管理口令保持编辑关闭并显示拒绝；正确口令开启编辑、显示批量上传入口，`multiple` 与 `accept=image/*` 生效。
- Worker 已部署版本 `a114bb08-7b6b-4945-817c-d54c12874df6`；按用户要求，本轮未推送 GitHub。

### v2.7.0 验证记录
- `index.html` 内联脚本语法检查通过（5 个 script 均 OK）
- Playwright 验证通过：工具条按钮完整、自由文本框可保存并在刷新后恢复、撤销新增照片框正常回退
- Playwright 验证通过：首屏 `intro` 可新增文本框/照片框并刷新恢复
- Playwright 验证通过：滚动内容 6 个页面均可新增文本框/照片框并刷新恢复，保存目标页覆盖 `parallel` / `meeting` / `merged` / `story` / `route-points` / `route-labels`
- 备注：当前沙箱阻断外部 CDN 时会出现预期的 `THREE is not defined` 页面错误；这是测试环境拦截网络导致，不是本次编辑器逻辑错误

### v2.8.0 验证记录
- `index.html` 内联脚本语法检查通过（5 个 script 均 OK）
- Playwright 验证通过：`parallel` 自由框锚定到 `.dual-track-stage`，滚动 700px 后视口位置不漂移
- Playwright 验证通过：`route-points` 普通页面自由框随页面滚动，滚轮 180px 后元素同步移动约 -180px
- Playwright 验证通过：文本框/照片框默认背景均为透明；文本框与照片框背景色可切换、保存并刷新恢复
- Playwright 移动端验证通过：编辑模式下参数控制面板隐藏，工具条和自由框色板在 390px 宽视口内不溢出

### v2.9.0 验证记录
- `index.html` 内联脚本语法检查通过（5 个 script 均 OK）
- Playwright 验证通过：自由框渲染到页面自己的 `.free-item-layer`，浏览态 `pointer-events:none`，不再像全局浮层拦截页面
- Playwright 验证通过：`route-points` 自由框在当前页显示，滚到 `route-labels` 后淡出到 opacity 0
- Playwright 验证通过：`parallel` 自由框仍跟随 sticky 舞台，滚动 700px 后视口位置不漂移
- Playwright 移动端验证通过：自由框位于页面内容层，编辑态可点色板，浏览态保持背景色并自然显示

### v3.0.0 验证记录
- `index.html` 内联脚本语法检查通过（inline-script-5 OK）
- 本地服务器 `http://127.0.0.1:8090/index.html` 返回 200
- 系统 Chrome + Playwright 验证通过：拍立得数量 28、一键排列生效、间距实时更新、保存间距写入 `{"arranged":true,"gap":24}`、第 1 张卡片可翻面
- 系统 Chrome + Playwright 验证通过：地图页数量为 1，点击地图地址点后地名 class `is-label-visible` 生效
- 备注：当前沙箱阻断外部 CDN 时仍会出现预期的 `THREE is not defined`，与前几版验证备注一致，不是本次新增逻辑错误

### v3.1.0 验证记录
- `index.html` 内联脚本语法检查通过（inline-script-1 OK）
- 本地服务器 `http://127.0.0.1:8090/index.html` 返回 200
- 静态断言通过：`APP_VERSION=3.1.0`、拍立得悬停放大 CSS、正反面同位置翻转按钮、地图 `pointerenter` 累计显名、无旧的单点互斥移除逻辑、全部点位后的 `is-map-complete` 完成态、地图宽度提升到 `min(1060px, 100%)`
- 备注：本轮 Browser / headless Chrome 自动化通道受 Windows 沙箱权限审核阻断，未完成视觉自动化实测；需在真实浏览器中做最终肉眼确认

### v3.2.0 验证记录
- `index.html` 内联脚本语法检查通过（inline-script-1 OK）
- Headless Chrome `--dump-dom` 验证通过：`polaroidFlipAllBtn`、`routeLabelSizeInput`、`china-outline-main` 已在运行页面 DOM 中出现
- Chrome DevTools 协议运行态验证通过：桌面视口约 `1424x749`，拍立得数量 28，地图 8 个点位全部显示后 `is-map-complete=true`，中国轮廓 opacity 过渡到 `0.9`，地图宽度约 `962px`，相纸 hover scale 为 `1.28`
- Chrome DevTools 协议运行态验证通过：`一键翻面` 后全部卡片含 `is-flipped`，`全部正面` 后全部卡片恢复正面，地名字号滑块设为 34 后 CSS 变量为 `34px`
- 相纸 hover 闪烁分析：v3.1.0 使用外层卡片 `translateY(-18px) scale(...)`，鼠标在卡片边缘时卡片会从光标下移走，导致 hover 反复进入/离开；v3.2.0 改为外层不位移、内层视觉放大，并给卡片加隐形 hover 缓冲区 `.polaroid-card::before` 修复

### v3.3.0 验证记录
- `index.html` 内联脚本语法检查通过（inline-script-1 OK）
- 静态断言通过：`APP_VERSION=3.3.0`、`polaroidHoverScaleInput`、`polaroidSaveScaleBtn`、`hoverScale` 存储字段、背面自动聚焦函数、默认文字选中函数均已写入
- Chrome DevTools 协议运行态验证通过：点击第 1 张相纸翻面后 `flipped=true`，`document.activeElement.dataset.polaroidField === "note"`，默认提示文字 `写给这张照片的话` 被选中，可直接输入覆盖
- Chrome DevTools 协议运行态验证通过：放大倍数滑块调到 `1.42` 后 CSS 变量为 `1.42`，点击 `保存放大倍数` 后 `wedding_polaroid_layout_v1.hoverScale === 1.42`
- 写死流程：用户调好后点击 `保存放大倍数`，之后可读取 `localStorage.wedding_polaroid_layout_v1.hoverScale`，再把 `DEFAULT_POLAROID_HOVER_SCALE` 和 CSS 默认 `--polaroid-hover-scale` 写成该值

### v3.4.0 验证记录
- `index.html` 内联脚本语法检查通过（inline-script-1 OK）
- 静态断言通过：`APP_VERSION=3.4.0`、`.polaroid-card-visual` hover 视觉层、`.polaroid-card-inner` 翻面旋转层、`DEFAULT_POLAROID_HOVER_SCALE=1.6`、放大倍数滑块、背面字号滑块、`hoverScale` / `noteFontSize` 存储字段均已写入
- Chrome DevTools 协议运行态验证通过：悬停/聚焦状态下点击第 1 张相纸后 `is-flipped=true`，视觉层继续放大，内层立即旋转到背面，背面文字区可进入编辑状态
- Chrome DevTools 协议运行态验证通过：放大倍数和背面字号调整后分别写入 `wedding_polaroid_layout_v1.hoverScale` 与 `wedding_polaroid_layout_v1.noteFontSize`
- 写死流程：用户调好后点 `保存放大倍数`，之后读取 `localStorage.wedding_polaroid_layout_v1.hoverScale`，再把 `DEFAULT_POLAROID_HOVER_SCALE` 和 `.polaroid-board` 默认 `--polaroid-hover-scale` 改成该值；背面字号同理读取 `noteFontSize` 写入 `DEFAULT_POLAROID_NOTE_SIZE` 和 `--polaroid-note-size`

### v3.4.1 验证记录
- `index.html` 内联脚本语法检查通过（inline-script-1 OK）
- 静态断言通过：`APP_VERSION=3.4.1`、背面禁用上传 CSS、上传点击保护、文件输入兜底、翻面聚焦不全选均已写入
- Chrome DevTools 协议运行态验证通过：翻面后背面文字区获得焦点但选区为空；背面状态下模拟点击正面上传按钮不会触发文件输入
- 交互结论：翻到背面后等待用户自己选择文字；相纸已经在背面时，上传照片入口不可见、不可点，异常事件路径也不会打开文件选择框

### v3.4.2 验证记录
- `index.html` 内联脚本语法检查通过（inline-script-1 OK）
- 静态断言通过：`APP_VERSION=3.4.2`、active 锁定 CSS、inactive hover 覆盖、单张翻面设置 active、批量翻面清除 active、批量翻面不再聚焦第一张均已写入
- Browser 插件通道本轮仍被 Windows 权限拦截（`CreateProcessAsUserW failed: 5`），改用本机 Chrome headless + DevTools 协议完成运行态验证
- Chrome DevTools 协议运行态验证通过：第 1 张手动翻面后，第 2 张获得焦点/模拟 hover 仍保持 `scale(1)`；点击 `一键翻面` 后 active 数量为 0，抽样相纸均未放大，28 张均为背面
- 交互结论：手动点单张后只允许当前相纸放大；一键翻面/全部正面属于批量操作，不会放大任何一张相纸

### v3.15.0 验证记录
- 使用已有旧默认内容的 127.0.0.1 浏览器验证精准迁移：故事区变为 `OUR CHAPTERS`、“后来，我们把平凡的日子写成了故事”和新版浪漫正文。
- 浏览态相纸 8 项技术设置均隐藏、地图字号设置隐藏；编辑态全部恢复，未牺牲原调节能力。
- 现场预演照片墙 `top=0`，正式可见控制仅“翻开所有背面 / 回到照片正面”，无横向溢出。
- 静态断言覆盖旧默认精准匹配迁移、浏览/编辑选择器和新按钮文案；脚本语法与 `git diff --check` 通过。

### v3.14.0 验证记录
- In-app Browser 端到端通过：编辑 → 现场预演 → “下一站”后 `editMode=false`、`mainActive=true`、对话框关闭、编辑工具隐藏，平滑滚动结束时 `targetTop=0`。
- 从帘幕开始后 `mainActive=false`、DOM/WebGL 显示、`body overflow=hidden`，恢复完整首屏交互。
- 390×844 下对话框约 `366px` 宽，四个目标按钮约 `316×47px` 单列；无横向溢出。
- Escape 关闭后 `aria-hidden=true` 且焦点返回 `rehearsalOpenBtn`；脚本语法和 `git diff --check` 通过。

### v3.13.0 验证记录
- In-app Browser 实际创建自由照片框：编辑态可上传、可聚焦，浏览态 `aria-disabled=true` / `tabIndex=-1` / `pointer-events:none`；空框浏览态隐藏。
- 390×844 下桌面坐标自动重新约束，自由照片框落在约 `94–374px`；页面无横向溢出。
- 编辑工具栏收起后宽约 110px；首屏 WebGL 在编辑态 `pointer-events:none`，框体删除控制可用。测试框已清理为 0。
- 静态断言覆盖图片压缩、容量拒绝、自由项安全导入、视口归位与工具栏 ARIA 状态；脚本语法和 `git diff --check` 通过。

### v3.12.0 验证记录
- In-app Browser 实际使用工具栏“加照片”创建动态模块；编辑态上传入口 `aria-disabled=false` / `tabIndex=0`，浏览态变为 `aria-disabled=true` / `tabIndex=-1` / `pointer-events:none`。
- 桌面照片区约 `436×220px`；390×844 下约 `306×170px`，动态模块单列且页面无横向溢出。
- 测试模块通过现有撤销系统清理，浏览器最终未残留测试故事。
- 静态断言覆盖 `modulePhotoInput`、安全 Data URL、900px/96KB 压缩、4.5MB 容量拒绝与 `wedding_story_modules_v1` 持久化；脚本语法和 `git diff --check` 通过。

### v3.11.0 验证记录
- In-app Browser 桌面端验证：5 个固定照片位在浏览态均为 `aria-disabled=true` / `tabIndex=-1`，编辑态均变为 `aria-disabled=false` / `tabIndex=0`。
- 编辑模式原有横向溢出已修复：`scrollWidth=clientWidth=1265`，`#scrollHint` 保持 fixed 且宽约 56px。
- In-app Browser 390×844 验证：页面无横向溢出；双轨照片移动端最大 150×216px，共同记忆照片为 4:3 自适应。
- 静态断言覆盖新存储键、5 个固定 ID、内容包白名单、导入 Data URL 清理、900px/96KB 压缩复用和容量拒绝逻辑；脚本语法与 `git diff --check` 通过。

### v3.10.0 验证记录
- 音频资源通过本地服务器返回 HTTP `200`、`audio/mpeg`、`10638698` 字节；浏览器读取 `readyState=4`。
- In-app Browser 桌面端音乐按钮视觉通过；390×844 下按钮为约 `126×38px`、左边界 `12px`、底边 `828px`，无横向溢出。
- 自动化浏览器不提供音频输出，实际播放动作被环境拒绝；按钮错误提示按预期出现。音量渐入、故事音量、说话音量和庆祝音量调用链已完成静态检查，需在现场浏览器进行最终有声确认。
- `index.html` 内联脚本语法检查与 `git diff --check` 通过。

### v3.9.0 验证记录
- `index.html` 内联脚本语法检查通过，`git diff --check` 通过。
- In-app Browser 桌面端验证：首页 `#layer-dom` 的整屏 `backdrop-filter` 为 `none`，柔焦仅保留在 `.hero-copy-stage`；“下一站”按钮点击后 `aria-expanded=true`、转场进入 `is-departing`，终章定位到视口顶部。
- In-app Browser 390×844 验证：转场宽 `390px`、按钮宽 `260px`、标题约 `42px`，页面无横向溢出；标题、正文、入口按钮与下一章提示完整可见。
- 展示态降噪已写入：版本号只在 `body.edit-mode` 显示，编辑铅笔在浏览时弱化、悬停/聚焦/编辑时恢复。

### v3.8.0 验证记录
- `index.html` 5 个内联脚本语法检查通过，`git diff --check` 通过。
- In-app Browser 桌面端验证通过：编辑工具栏显示 `导出内容包`、`导入内容包` 与容量计量；当前测试浏览器约 `10 KB / 建议 4.5 MB 内`，页面错误日志为空。
- In-app Browser 390×844 验证通过：工具栏右边界为 `380px`、底部约 `446px`，未超出 `390×844` 视口且页面无横向溢出。
- 静态断言通过：内容包格式/版本、8 个白名单存储键、导入 HTML 属性清理、图片 Data URL 校验、写入回滚、本地容量警告、照片 `900px` / `96 KB` 目标均已写入。

### v3.7.0 验证记录
- `index.html` 5 个内联脚本语法检查通过，`git diff --check` 通过。
- In-app Browser 桌面端验证通过：首屏“翻开我们的故事”进入主叙事；最终页问题卡片、戒指按钮和背景同心圆正常；点击“我愿意”后 `is-answered=true`、`aria-pressed=true`、按钮禁用、答应文案可见、焦点转移到答应状态，并生成 42 片求婚花瓣。
- In-app Browser 390×844 验证通过：最终求婚页无横向溢出，标题、求婚信、问题卡片和按钮完整显示；答应状态无浏览器默认焦点框。
- 编辑模式验证通过：`proposal-title` / `proposal-letter` / `proposal-question` / `proposal-answer-title` / `proposal-answer-note` 等 7 个字段均自动获得 `contenteditable="true"`，继续沿用 `wedding_content_v1` 与 `wedding_layout_v1`。
- 页面运行错误日志为空。

### v3.6.1 验证记录
- 首屏移除大面积白色玻璃卡片，替换为无边框、中心透明度最高仅 `0.16` 的径向暖光晕；标题和正文通过分层文字阴影保证可读性。
- 默认 `domBlur` 从 `15px` 调整为 `7px`，调节面板输入默认值与配置默认值保持一致。
- In-app Browser 桌面端实测：掀开婚纱后人物与花园背景完整可见，文字和按钮可清晰识别。
- In-app Browser 390×844 实测：无横向溢出，标题 `32px`、正文 `16px`，人物背景与求婚入口同时可见。

### v3.6.0 验证记录
- `index.html` 内联脚本语法检查通过（5 个 script 均可解析），`git diff --check` 通过。
- In-app Browser 本地运行态验证通过：墙内第 1 张相纸翻面后 `memoryOpen=false`；从相纸照片区打开回忆时 `memoryOpen=true`、`storyVisible=false`、舞台相纸保持正面；舞台内翻面后 `storyVisible=true`、舞台相纸翻面，墙内对应相纸仍保持正面。
- In-app Browser 桌面端验证通过：鼠标悬停相纸视觉层得到 `matrix(1.6, 0, 0, 1.6, 0, -14)`，保留可调的 1.6x 默认放大效果。
- 390px 视口检查：页面 `scrollWidth` 未超过视口；回忆舞台单列布局。窄屏舞台宽度已从 `96vw` 调整为可用内容区的 `100%`，防止叠加层出现横向滚动条。

### v3.5.3 验证记录
- `index.html` 内联脚本语法检查通过（inline-script-1 OK）
- 静态断言通过：`APP_VERSION=3.5.3`、背面手写区点击被排除、左下翻面调用 `togglePolaroidCard`、右下入口调用 `openPolaroidMemory`、新版背景/图标 CSS 均已写入
- Browser / Chrome / Computer Use 插件通道本轮均被 Windows 权限拦截（`CreateProcessAsUserW failed: 5`）；系统 Chrome headless 尝试生成本地截图未产出文件，因此未完成真实浏览器截图/点击验证
- 交互结论：背面手写区优先编辑，避免翻面后写字被回忆舞台抢走；进入回忆保留右下箭头和正面照片区

### v3.5.2 验证记录
- `index.html` 内联脚本语法检查通过（inline-script-1 OK）
- 静态断言通过：`APP_VERSION=3.5.2`、右下角箭头入口、左下角翻面按钮、相纸中间点击调用 `openPolaroidMemory`、翻面按钮调用 `togglePolaroidCard`、无旧的 `故事` 文案按钮均已写入
- Browser / Chrome 插件通道本轮被 Windows 权限拦截（`CreateProcessAsUserW failed: 5`）；系统 Chrome headless 在当前环境不返回 stdout，未完成浏览器运行态截图/点击验证
- 交互结论：照片墙中间区域与右下角箭头进入完整回忆，左下角圆形按钮保留翻面；编号移到右上角，桌面增加暖色光晕

### v3.5.1 验证记录
- `index.html` 内联脚本语法检查通过（inline-script-1 OK）
- 静态断言通过：`APP_VERSION=3.5.1`、墙内 `memory` 独立入口、翻面按钮调用 `togglePolaroidCard`、相纸主体点击调用墙内翻面、故事按钮调用 `openPolaroidMemory` 均已写入
- 浏览器自动化通道本轮未得到可用输出：本地服务启动被权限审核卡住，Playwright 缺少 `playwright-core`，Chrome `--dump-dom` 在当前沙箱中静默退出。需在真实浏览器中做最终肉眼确认
- 交互结论：照片墙承担快速翻面和背面手写；右上角 `故事` 按钮承担进入完整回忆舞台，两个动作互不抢占

### v3.5.0 验证记录
- `index.html` 内联脚本语法检查通过（inline-script-1 OK）
- 静态断言通过：`APP_VERSION=3.5.0`、记忆舞台 HTML/CSS、右侧故事字段、旧数据补默认值、打开/翻面/保存函数均已写入
- Chrome DevTools 协议运行态验证通过：点击第 1 张相纸打开记忆舞台；翻面后故事面板出现；编辑标题/日期/地点/正文后保存到 `wedding_polaroids_v1`；关闭后照片墙恢复
- 交互结论：相纸墙仍负责展示和轻预览，点击相纸后进入独立记忆舞台；舞台内翻面负责打开背面故事，右侧故事可直接编辑和保存

---

1. **替换照片素材** — 在 HTML 中搜索 `[ 照片预留 ]` 和 `photo-placeholder`，替换为真实照片
2. **替换双轨文案** — 搜索 `His Universe` / `Her Universe` / `2018` 等
3. **集成音乐** — `music/Ed Sheeran - Perfect.mp3` 加一个播放控制
4. **继续扩展编辑能力** — 后续可增加真实图片上传/替换、自由框缩放、层级调整、对齐辅助线等更完整的 PPT 式控件
5. **清理遗留文件** — 删除 `css/` `js/` `assets/` 等 v1.x 遗留
6. **移动端测试** — 在 iOS Safari / Android Chrome 上测试触摸交互
7. **优化纹理初始化** — 避免 applyConfig 中重复调用 createHexagonalTexture
8. **添加加载指示器** — 视频/Three.js 初始化时显示 loading

---

## 八、工作会话记录

| 日期 | 内容 | 结果 |
|------|------|------|
| 2026-05-31 | 首次集成：三图层架构 + code.html 物理引擎 + 视频背景 + 15参数控制器 | v2.0.0 |
| 2026-05-31 | 四项改进：hexFill/hexLineWidth + 掀开粒子特效 + 重返按钮 + localStorage 持久化 | v2.1.0 |
| 2026-05-31 | **Bug 修复**：白纱消失 — applyConfig 初始化顺序错误，移到材质创建之后 | 已修复 |
| 2026-05-31 | **Bug 修复**：白纱过透 — hexFill 默认值 55→80 | 已修复 |
| 2026-05-31 | 创建本断点文档 `CHECKPOINT.md` | 本文件 |
| 2026-06-27 | **纹理质感提升**：画布 256→512px + 三层蕾丝图案（主轮廓/内层同心/顶点结点）+ 面料噪声纹理 | v2.2.0 |
| 2026-06-27 | **材质升级**：MeshStandardMaterial → MeshPhysicalMaterial + sheen 丝光（sheen=1.2, sheenRoughness=0.65） | v2.2.0 |
| 2026-06-27 | **性能优化**：pixelRatio 上限 2→1.5 / 防穿模隔帧执行 / 约束迭代 4→3 | v2.2.0 |
| 2026-06-27 | **内容编辑系统**：✏️ 编辑模式开关 + 15个可编辑文字位 + localStorage 自动保存 | v2.3.0 |
| 2026-06-27 | **PPT 式编辑增强**：26个可编辑对象 + 拖拽句柄 + 位置持久化 + 复位位置/恢复文字工具条 | v2.4.0 |
| 2026-06-27 | **路线地图页**：新增中国地图背景、城市高亮点、焦作→郑州→锦州→青岛→上海→深圳→香港→江苏湖州流动闪烁路线 | v2.4.0 |
| 2026-06-27 | **故事模块编辑器**：新增故事编辑区 + 加故事/照片/时间线/誓言操作 + 模块编辑、排序、复制、删除 + localStorage 持久化 | v2.5.0 |
| 2026-06-27 | **地图双页优化 + 工具条修复**：路线地图拆成慢闪点/丝线页和地名渐显页；地图居中、文字侧置；编辑工具条改为固定两列面板，添加模块按钮完整可见 | v2.6.0 |
| 2026-06-27 | **自由编辑增强 + 防卡顿保存**：工具条新增撤销/保存/加文本框/加照片框；每页可新增自由浮层对象；输入改为脏字段延迟保存；新增内容保存到 `wedding_free_items_v1` | v2.7.0 |
| 2026-06-27 | **自由框锚定与背景色**：平行宇宙页自由框改挂 sticky 舞台，普通页面随滚动移动；文本框/照片框默认透明并可用色块切换背景色 | v2.8.0 |
| 2026-06-28 | **自由框页面融合**：新增 `.free-item-layer` 页面内嵌层；浏览态自由框不拦截点击，随页面进入/离开视口淡入淡出，避免滑动时突兀 | v2.9.0 |
| 2026-07-03 | **拍立得照片墙 + 地图合页**：新增 28 张拍立得页面、照片上传、慢速翻面、背面手写文字、一键排列/间距保存；地图双页合并为单页，点击/悬停地址点显示地名 | v3.0.0 |
| 2026-07-03 | **地图与拍立得交互优化**：地图放大，点位悬停/点击后累计保留显名，全部显示后轮廓浮现；拍立得悬停弹出放大，并新增正反面同位置翻转按钮 | v3.1.0 |
| 2026-07-03 | **地图与相纸二次优化**：地图轮廓改为参考 Natural Earth 的中国轮廓，新增地名字号滑块；拍立得 hover 放大到 1.28，新增一键翻面/全部正面，并修复 hover 闪烁 | v3.2.0 |
| 2026-07-03 | **相纸编辑与放大倍数优化**：点击翻到背面后自动聚焦手写文字区并选中默认提示；新增悬停放大倍数滑块和保存按钮，保存到 `wedding_polaroid_layout_v1.hoverScale` | v3.3.0 |
| 2026-07-03 | **相纸悬停翻面与字号保存**：相纸 hover 放大层和翻面旋转层拆开，悬停时点击可即时翻面；默认放大写成 1.6x，保留放大倍数保存，并新增背面字大小保存到 `noteFontSize` | v3.4.0 |
| 2026-07-04 | **相纸背面误触修复**：翻到背面后不再自动全选手写文字，只聚焦等待用户选择；背面状态隐藏并禁用正面上传按钮，JS 也拦截背面上传事件 | v3.4.1 |
| 2026-07-04 | **相纸放大状态锁定**：手动翻单张后锁定当前相纸放大，其他相纸 hover/focus 不再放大；一键翻面和全部正面清除 active，批量操作不放大任何相纸 | v3.4.2 |
| 2026-07-04 | **相纸记忆展开舞台**：点击相纸打开全屏记忆舞台，背景照片墙虚化；舞台内翻面后相纸移到左侧，右侧故事面板出现并可编辑标题/日期/地点/正文，保存到 `wedding_polaroids_v1` | v3.5.0 |
| 2026-07-05 | **项目技能整合**：根据当前代码、CHECKPOINT、README、CHANGELOG、旧设计文档和最新需求，重写两个 skill 文件；明确当前单文件架构、相纸记忆舞台、地图累计显名、localStorage 契约、响应式重点和验证流程 | 文档已对齐 |
| 2026-07-05 | **相纸交互拆分**：恢复照片墙内点击相纸/翻面按钮只翻面，新增右上角 `故事` 按钮进入记忆舞台，避免翻面动作直接跳进故事回忆 | v3.5.1 |
| 2026-07-05 | **相纸角落交互重排**：正反面左下角保持翻面，右下角改为淡箭头进入回忆；点击相纸中间也进入回忆，编号移到右上角并增加桌面暖色光晕 | v3.5.2 |
| 2026-07-05 | **相纸翻面逻辑和 UI 优化**：背面手写区点击优先编辑，不再误进回忆；照片墙背景、相纸阴影、角落图标和右下箭头重新打磨 | v3.5.3 |
| 2026-07-10 | **相纸交互状态重构**：明确照片区/回忆箭头/翻面按钮的职责；分离墙内便签翻面与回忆舞台翻面；回忆舞台从正面开始、舞台翻面再展开故事；补齐键盘触控入口、移动端宽度修复和首屏参数面板收纳 | v3.6.0 |
| 2026-07-10 | **首屏背景可见性优化**：移除文字后方白色大卡片，改用透明暖光晕和文字阴影；默认文字层柔焦降为 7px，并完成桌面/390px 浏览器验证 | v3.6.1 |
| 2026-07-11 | **最终求婚章节**：首屏入口调整为“翻开我们的故事”；路线地图后新增可编辑求婚信、真正的求婚问题与“我愿意”状态；加入戒指光环、玫瑰花瓣、响应式和减少动态效果支持 | v3.7.0 |
| 2026-07-11 | **内容安全与迁移**：新增内容包导出/导入、白名单和安全清理、失败回滚、本地容量计量；拍立得照片改为 900px 并按 96 KB 目标迭代压缩 | v3.8.0 |
| 2026-07-11 | **求婚仪式节奏优化**：地图后新增“未命名的下一站”主动转场；首页改为文字附近局部柔焦；正式浏览时隐藏版本号、弱化编辑入口；完成桌面与 390×844 浏览器验证 | v3.9.0 |
| 2026-07-11 | **求婚现场音乐**：新增手动音乐控制、渐入渐出、进入最终问题自动压低、答应后轻回升；完成桌面/手机端视觉和音频资源检查 | v3.10.0 |
| 2026-07-11 | **主叙事照片直传**：双轨与共同记忆 5 张照片可在编辑模式上传/更换，接入压缩、内容包和容量保护；修复编辑模式横向溢出 | v3.11.0 |
| 2026-07-11 | **动态照片模块直传**：工具栏“加照片”创建的模块可直接上传/更换图片，接入压缩、容量保护、安全导入与移动端单列布局 | v3.12.0 |
| 2026-07-11 | **自由照片框直传**：自由浮层可上传/更换图片并随内容包迁移；新增编辑工具栏收起、空框浏览隐藏、移动端自动归位与首屏点击修复 | v3.13.0 |
| 2026-07-11 | **求婚现场预演**：新增四个关键章节快速定位、自动保存退出编辑、全屏入口、移动端单列对话框和键盘焦点恢复 | v3.14.0 |
| 2026-07-11 | **正式展示态主题收口**：故事区浪漫化、旧默认精准迁移、地图和相纸技术控件退回编辑态，正式照片墙只保留两个回忆动作 | v3.15.0 |
| 2026-07-12 | **十二海报立体轮转**：移除 Swiper Coverflow，按参考视频实现连续弧形轮转、四次方减速、中心放大金色定格、外围压暗；支持拖动/按钮/方向键、50 张以上队列和多断点适配 | v3.19.0 |
| 2026-07-12 | **海报交互与大容量图库**：无边界背景、点按放大白色字幕、字幕字号、刻度声/兼容震动；IndexedDB 原图与缩略图分层，新增 80 张以上批量上传入口 | v3.20.0 |
| 2026-07-12 | **R2 云端图库适配**：新增 Worker/R2 后端、前端云端设置、管理口令、跨设备目录、原图点按加载和字幕更新；Mock R2 集成测试通过 | v3.21.0 |
| 2026-07-13 | **海报触碰与批量上传加固**：中心海报触碰即时放大、移动端重复点击防抖；云端批量上传改为逐张容错和失败清理；桌面及 390px 回归通过 | v3.21.1 |
| 2026-07-13 | **R2 正式上线**：创建 `wedding-posters`、写入随机 Worker Secret、部署 workers.dev 地址；新设备默认接入云端，真实上传/读取/更新/删除验证通过 | v3.22.0 |
| 2026-07-13 | **Coverflow 与私密入口**：按参考组件重做五卡 Coverflow；新增双生日密码、主人编辑认证、手机上传解锁、三层设计令牌并写入首屏 `tiling=450` | v3.23.0 |
| 2026-07-14 | **单框连续密码与页面管理**：单框静默累计两次生日密码；Coverflow 改为七图且侧卡统一变暗；相纸点外部取消放大；新增可恢复页面删除；发布并验证 8080 CORS | v3.24.0 |
