# Cloudflare R2 海报图库 Worker

这个 Worker 为 GitHub Pages 上的婚礼页面提供跨设备海报图库。4K 原图和缩略图保存到私有 R2 bucket；公开页面只能读取，上传、改字幕和删除必须提供 Worker secret `UPLOAD_TOKEN`。

当前部署：`https://my-wedding-poster-library.yuyanp52.workers.dev`，绑定 bucket `wedding-posters`。

## 部署

1. 在 Cloudflare 创建 R2 bucket：`wedding-posters`。
2. 复制 `wrangler.toml.example` 为 `wrangler.toml`，确认 `ALLOWED_ORIGINS` 包含正式域名。
3. 在本目录执行 `npx wrangler secret put UPLOAD_TOKEN`，设置一段只由站点管理员知道的长口令。
4. 执行 `npx wrangler deploy`。
5. 打开婚礼页面编辑模式，在线性海报区点击“云端图库设置”，粘贴 Worker 的 HTTPS 地址。
6. 第一次批量上传时输入管理口令；口令只保留在当前标签页内存，不写入 localStorage 或 Git。

当前账户已完成以上部署。本机口令恢复文件为 `.upload-token.local.txt`，由根目录 `.gitignore` 排除；不要复制到公开仓库或网页源码。

## 接口

- `GET /api/posters`：公开读取海报清单。
- `GET /media/:id/thumbnail`：公开读取缩略图，长期缓存。
- `GET /media/:id/original`：公开读取点按放大后的原图。
- `PUT /api/posters/:id/original`：上传原图，需要 Bearer token。
- `PUT /api/posters/:id/thumbnail`：上传缩略图，需要 Bearer token。
- `POST /api/posters`：两个对象上传完成后写入目录，需要 Bearer token。
- `PATCH /api/posters/:id`：修改字幕，需要 Bearer token。
- `DELETE /api/posters/:id`：删除原图、缩略图和目录记录，需要 Bearer token。

如果婚礼站点不应公开访问原图，应进一步把读取路由放到 Cloudflare Access 后面；当前权限模型与现有公开 GitHub Pages 网站一致。
