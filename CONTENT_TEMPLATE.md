# 内容模板 — 用户可修改清单

> 所有 ✏️ 标记处为你可以自由替换的内容。修改后刷新浏览器即可看到效果。

---

## 一、首页 (Landing Page)

### 1. 新娘视频/图片
| 位置 | 说明 | 如何修改 |
|------|------|----------|
| `js/landing.js` → `drawBride()` | Canvas 绘制的婚纱剪影占位 | 替换为真实 `<video>` 或 `<img>`：见下方 [替换方案](#video-replace) |

### 2. 标题文字
| 位置 | 当前内容 | 可修改为 |
|------|----------|----------|
| `index.html` L25 | `Love is a yes` | 任意标题文案 |

### 3. 按钮文字
| 位置 | 当前内容 | 可修改为 |
|------|----------|----------|
| `index.html` L26 | `SAY YES` | 任意按钮文案 |

### 4. 画布初始位置
| 位置 | 说明 |
|------|------|
| `css/landing.css` `.draggable-canvas-wrap` | 修改 `right` / `bottom` 改变初始角落；添加 `.bottom-left` class 切换到左下角 |

---

## 二、双轨视差页 (Dual Track)

### 5. 左轨（他的故事）
| 位置 | 当前内容 | 可修改为 |
|------|----------|----------|
| `index.html` `.track-left .track-label` | `His Universe` | 你的标签 |
| `index.html` `.track-left .track-year` | `2018` | 你的年份 |
| `index.html` `.track-left .track-story span` | 三段文字 | 你的故事 |
| `index.html` `.track-left .track-photo-placeholder` | `[ 照片预留 ]` | 替换为 `<img src="...">` |

### 6. 右轨（她的故事）
| 位置 | 当前内容 | 可修改为 |
|------|----------|----------|
| `index.html` `.track-right .track-label` | `Her Universe` | 你的标签 |
| `index.html` `.track-right .track-year` | `2018` | 你的年份 |
| `index.html` `.track-right .track-story span` | 三段文字 | 你的故事 |
| `index.html` `.track-right .track-photo-placeholder` | `[ 照片预留 ]` | 替换为 `<img src="...">` |

---

## 三、相遇点 (Meeting Point)

### 7. 相遇文字
| 位置 | 当前内容 | 可修改为 |
|------|----------|----------|
| `index.html` `.meeting-headline` | `我们相遇了` | 你的标题 |
| `index.html` `.meeting-date` | `2023 · 春` | 你的日期 |

### 8. Confetti 粒子颜色
| 位置 | 当前值 |
|------|--------|
| `js/meeting.js` → `colors` 数组 | `['#f4c2c2', '#ffffff', '#e8a0a0', '#f0d0d0']` |

---

## 四、合并轨道 (Merged Track)

### 9. 记忆卡片
| 位置 | 当前图片 | 当前文字 |
|------|----------|----------|
| `index.html` `.merged-item` (第1个) | `[ 共同记忆 · 照片预留 ]` | 从那天起，两条平行线开始有了交集。 |
| `index.html` `.merged-item` (第2个) | `[ 共同记忆 · 照片预留 ]` | 一起走过的路、看过的风景... |
| `index.html` `.merged-item` (第3个) | `[ 共同记忆 · 照片预留 ]` | 而当下的每一刻... |

> 可增删 `.merged-item` 数量，JS 自动适配。

---

## 五、全局

### 10. 页面标题 & 配色
| 位置 | 说明 |
|------|------|
| `index.html` `<title>` | 浏览器标签页标题 |
| `css/design-system.css` | 修改 `--bg-dark` / `--bg-light` / `--romantic-pink` 等全局配色 |

### 11. 版本号
| 位置 | 说明 |
|------|------|
| `js/config.js` → `APP.VERSION` | 部署时更新版本号 |

---

## 替换方案

### <a id="video-replace"></a>将 Canvas 剪影替换为真实视频

1. 准备一段竖屏视频（建议 720×1080 或类似比例），放到 `assets/` 目录
2. 在 `index.html` 的 `.draggable-canvas-wrap` 中替换 `<canvas>`：
```html
<video id="brideVideo" src="assets/bride.mp4" autoplay loop muted playsinline
       style="width:100%;height:100%;object-fit:cover;border-radius:4px;"></video>
```
3. 删除 `js/landing.js` 中的 `drawBride()` 调用和 canvas 相关代码
4. 拖拽逻辑保持不变（作用于外层 `.draggable-canvas-wrap`）

### 替换为真实照片
同上，用 `<img src="assets/bride.jpg">` 替换 `<canvas>`。
