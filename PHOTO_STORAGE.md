# 海报照片存储架构

> 版本：v3.25.0 · 2026-07-16

## 当前已经实现：本机大容量图片库

海报批量上传不再把图片转换成 Base64 塞进 `localStorage`。页面使用 IndexedDB 数据库 `wedding_story_poster_library_v1`：

- `original`：用户选择的 4K 原图 Blob，只在需要原图时读取。
- `thumbnail`：最长边 960px 的 JPEG 缩略图，轮换舞台只加载它。
- `caption` / `name` / `createdAt`：字幕、文件名和顺序元数据。
- 上传前通过 `navigator.storage.estimate()` 检查可用空间，并调用 `navigator.storage.persist()` 请求持久化。

因此一次选择 80 张、总计数百 MB 的照片在现代桌面浏览器中通常可行，但最终配额由浏览器、剩余磁盘空间和用户设置决定。发生 `QuotaExceededError` 时页面会停止本批写入并提示空间不足。

轮换 DOM 还采用 12 张视窗虚拟化：只有中心附近的缩略图拥有 `src`；点按放大时才为当前照片创建 4K 原图对象 URL，退出后立即回收。因此图片库可以很大，但日常轮换不会同时解码全部原图或全部缩略图。

本机 IndexedDB 有两个边界：

1. 数据只属于当前域名、当前浏览器和当前设备；换手机不会自动出现。
2. 用户清除网站数据仍可能删除图片，所以原始照片必须继续保留独立备份。

参考：[MDN Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)。

## 壁纸站/小程序的正式方案：对象存储 + CDN

公开网站通常采用以下链路，而不是把 4K 图片提交进 Git 仓库：

```text
浏览器选择原图
  → 服务端生成短时上传凭证
  → 原图直传 R2 / S3 对象存储
  → 图片处理服务生成 WebP/AVIF 多尺寸缩略图
  → 数据库保存 URL、字幕、排序和尺寸
  → CDN 按设备尺寸分发，页面懒加载
```

Cloudflare R2 提供 S3 兼容 API、公开桶/自定义域名和 Workers 绑定；浏览器上传应使用 Worker 生成的短时签名 URL，绝不能把 R2 Secret 写进 `index.html`。参考：[R2 概览](https://developers.cloudflare.com/r2/)、[预签名 URL](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)、[上传对象](https://developers.cloudflare.com/r2/objects/upload-objects/)。

## 本项目的已上线云端方案

项目已部署 `cloudflare-r2-worker/`，正式地址为 `https://my-wedding-poster-library.yuyanp52.workers.dev`，并绑定私有 bucket `wedding-posters`。新设备默认连接云端；管理员明确关闭云端模式后仍可继续使用 IndexedDB 本机图库。

1. 原图和浏览器生成的 960px JPEG 缩略图分别写入 R2。
2. Worker 目录保存对象 ID、字幕、顺序和尺寸；公开页面只读，上传、改字幕、删除必须使用 `UPLOAD_TOKEN`。编辑入口会先调用只读 `/api/auth` 验证同一个口令。
3. 轮换默认读取长期缓存缩略图，只有点按放大时才读取原图。
4. 管理口令只保留在当前标签页内存；本机恢复副本被 Git 忽略，4K 二进制文件始终留在对象存储。
5. 已用非私人测试对象完成线上上传、读取、字幕更新和删除，测试结束后 R2 目录恢复为空。

最终求婚章节的结尾照片复用该图库，但使用符合 Worker 校验规则的保留记录 ID `poster-finale-photo`，不作为海报轮换项，也不进入本地内容包。它和其他云端原图一样需要管理员口令上传；公开读取策略仍与下文的 R2 权限说明一致。

未来若访问量显著增加，可再接入 Cloudflare Images/图片变换服务生成 WebP/AVIF 多尺寸版本和自定义图片域名；当前 R2 + Worker + 缩略图虚拟化已经足够承载数百 MB 的婚礼照片。
