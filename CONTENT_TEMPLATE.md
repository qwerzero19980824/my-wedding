# 内容模板 — 用户可修改清单 (v1.1.0)

> **历史参考，不是当前实现的编辑入口。** 当前页面已迁移到单文件 `index.html` 的编辑模式与内容包；本文件中 `css/`、`js/` 路径仅用于理解 v1.x 历史，不应据此修改现行网站。

> 所有 ✏️ 标记处为你可以自由替换的内容。修改后刷新浏览器即可看到效果。

---

## 一、视频素材 (最优先)

### 1. 新娘转身视频
| 路径 | 说明 |
|------|------|
| `assets/video/bride-turn.mp4` | 将你的新娘转身视频放到此路径。支持 `.mp4` / `.webm`，建议竖屏 720×1280 |

代码会自动检测视频是否存在：
- 存在 → 布料表面播放真实视频
- 不存在 → 使用内置 Canvas 2D 程序化纹理（婚纱剪影微光动画）

### 2. 照片素材
| 路径 | 对应位置 |
|------|----------|
| `assets/images/photo-his-01.jpg` | 双轨页 — 左轨（他的照片） |
| `assets/images/photo-her-01.jpg` | 双轨页 — 右轨（她的照片） |
| `assets/images/photo-us-01.jpg` | 合并轨道 — 记忆卡片 1 |
| `assets/images/photo-us-02.jpg` | 合并轨道 — 记忆卡片 2 |
| `assets/images/photo-us-03.jpg` | 合并轨道 — 记忆卡片 3 |

---

## 二、Hero Card（求婚卡片页）

### 3. 情话文本（可直接在网页上编辑）
| 位置 | 说明 |
|------|------|
| `index.html` `.hero-text` | contenteditable 属性，**在浏览器中点击文本即可直接修改**。也可在 HTML 中修改默认文案 |

### 4. Say Yes 按钮文字
| 位置 | 当前内容 | 可修改为 |
|------|----------|----------|
| `index.html` `.hero-btn .btn-text` | `Say Yes` | 任意按钮文案 |

---

## 三、双轨视差页

### 5. 左轨（他的故事）
| 位置 | 当前内容 |
|------|----------|
| `.track-left .track-label` | `His Universe` |
| `.track-left .track-year` | `2018` |
| `.track-left .track-story span` | 三段文字 |
| `.track-left .track-photo-placeholder` | 替换为 `<img src="assets/images/photo-his-01.jpg">` |

### 6. 右轨（她的故事）
| 位置 | 当前内容 |
|------|----------|
| `.track-right .track-label` | `Her Universe` |
| `.track-right .track-year` | `2018` |
| `.track-right .track-story span` | 三段文字 |
| `.track-right .track-photo-placeholder` | 替换为 `<img src="assets/images/photo-her-01.jpg">` |

---

## 四、相遇点 & 合并轨道

### 7. 相遇文字
| 位置 | 当前内容 |
|------|----------|
| `.meeting-headline` | `我们相遇了` |
| `.meeting-date` | `2023 · 春` |

### 8. 记忆卡片（3 张，可增删）
| 位置 | 图片 | 文字 |
|------|------|------|
| `.merged-item` 1 | 替换 `<img>` | 从那天起，两条平行线开始有了交集。 |
| `.merged-item` 2 | 替换 `<img>` | 一起走过的路、看过的风景... |
| `.merged-item` 3 | 替换 `<img>` | 而当下的每一刻... |

---

## 五、全局配置

### 9. 配色
| 文件 | 变量 | 说明 |
|------|------|------|
| `css/design-system.css` | `--bg-dark`, `--bg-light`, `--romantic-pink` | 全局配色 |
| `css/landing.css` | `#c0392b`, `#d4cfc8` | Hero Card 专用色（古典红、暖灰） |

### 10. 物理参数调校
| 文件 | 变量 | 默认值 | 说明 |
|------|------|--------|------|
| `js/app.js` | `CLOTH_SEGMENTS` | 60 | 网格密度（越高越细腻，越耗性能） |
| `js/app.js` | `GRAVITY` | -0.0004 | 重力（更负 = 布料更垂） |
| `js/app.js` | `TRIGGER_RATIO` | 0.40 | 触发阈值（0~1，越低越容易掀开） |

### 11. 版本号
| 文件 | 变量 |
|------|------|
| `js/config.js` | `APP.VERSION` |
