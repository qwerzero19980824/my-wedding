import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../src/index.js';

class MockR2Object {
  constructor(record) {
    this.record = record;
    this.body = record.bytes;
    this.size = record.bytes.byteLength;
    this.httpEtag = `"mock-${record.bytes.byteLength}"`;
  }

  async json() {
    return JSON.parse(new TextDecoder().decode(this.record.bytes));
  }

  writeHttpMetadata(headers) {
    if (this.record.httpMetadata?.contentType) headers.set('Content-Type', this.record.httpMetadata.contentType);
    if (this.record.httpMetadata?.cacheControl) headers.set('Cache-Control', this.record.httpMetadata.cacheControl);
  }
}

class MockR2Bucket {
  constructor() {
    this.records = new Map();
  }

  async put(key, value, options = {}) {
    let bytes;
    if (value instanceof ReadableStream) {
      bytes = new Uint8Array(await new Response(value).arrayBuffer());
    } else if (value instanceof ArrayBuffer) {
      bytes = new Uint8Array(value);
    } else if (ArrayBuffer.isView(value)) {
      bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    } else {
      bytes = new TextEncoder().encode(String(value));
    }
    this.records.set(key, { bytes: new Uint8Array(bytes), httpMetadata: options.httpMetadata || {} });
  }

  async get(key) {
    const record = this.records.get(key);
    return record ? new MockR2Object(record) : null;
  }

  async head(key) {
    const record = this.records.get(key);
    return record ? new MockR2Object(record) : null;
  }

  async delete(key) {
    this.records.delete(key);
  }
}

function makeEnv() {
  return {
    POSTERS: new MockR2Bucket(),
    UPLOAD_TOKEN: 'test-upload-token',
    ALLOWED_ORIGINS: 'https://www.cml-zy.love,http://127.0.0.1:8080,http://localhost:8080,http://127.0.0.1:8090',
    MAX_ORIGINAL_BYTES: '83886080'
  };
}

function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Origin')) headers.set('Origin', 'http://127.0.0.1:8090');
  return new Request(`https://poster-worker.example${path}`, { ...options, headers });
}

function authorized(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', 'Bearer test-upload-token');
  return request(path, { ...options, headers });
}

test('R2 poster lifecycle, authorization, CORS and limits', async () => {
  const env = makeEnv();
  const id = 'poster-finale-photo';

  const health = await worker.fetch(request('/'), env);
  assert.equal(health.status, 200);
  assert.equal(health.headers.get('Access-Control-Allow-Origin'), 'http://127.0.0.1:8090');

  const preflight = await worker.fetch(request('/api/posters', { method: 'OPTIONS' }), env);
  assert.equal(preflight.status, 204);
  assert.match(preflight.headers.get('Access-Control-Allow-Methods'), /PUT/);

  const denied = await worker.fetch(request(`/api/posters/${id}/original`, {
    method: 'PUT',
    body: new Uint8Array([1, 2, 3])
  }), env);
  assert.equal(denied.status, 401);

  const deniedAuth = await worker.fetch(request('/api/auth'), env);
  assert.equal(deniedAuth.status, 401);

  const ownerAuth = await worker.fetch(authorized('/api/auth'), env);
  assert.equal(ownerAuth.status, 200);
  assert.deepEqual(await ownerAuth.json(), { ok: true, role: 'owner' });

  const emptySiteState = await worker.fetch(request('/api/site-state'), env);
  assert.equal(emptySiteState.status, 200);
  assert.deepEqual(await emptySiteState.json(), { state: null });

  const missingAmapKey = await worker.fetch(request('/api/amap-static-map'), env);
  assert.equal(missingAmapKey.status, 503);

  const deniedSiteStateWrite = await worker.fetch(request('/api/site-state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ format: 'my-wedding-content', packageVersion: 1, storage: {} })
  }), env);
  assert.equal(deniedSiteStateWrite.status, 401);

  const siteStateWrite = await worker.fetch(authorized('/api/site-state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      format: 'my-wedding-content',
      packageVersion: 1,
      appVersion: '3.27.0',
      storage: {
        wedding_content_v1: JSON.stringify({ 'track-left-story-1': '手机端的新故事' }),
        unexpected: '不会进入云端'
      }
    })
  }), env);
  assert.equal(siteStateWrite.status, 200);
  const siteStateRecord = (await siteStateWrite.json()).state;
  assert.equal(JSON.parse(siteStateRecord.storage.wedding_content_v1)['track-left-story-1'], '手机端的新故事');
  assert.equal('unexpected' in siteStateRecord.storage, false);
  assert.equal(Object.keys(siteStateRecord.storage).length, 13);

  const siteStateRead = await worker.fetch(request('/api/site-state'), env);
  assert.equal(siteStateRead.status, 200);
  const syncedSiteState = (await siteStateRead.json()).state;
  assert.equal(syncedSiteState.updatedAt, siteStateRecord.updatedAt);
  assert.equal(JSON.parse(syncedSiteState.storage.wedding_content_v1)['track-left-story-1'], '手机端的新故事');

  const desktopStorage = { ...syncedSiteState.storage };
  desktopStorage.wedding_content_v1 = JSON.stringify({
    ...JSON.parse(desktopStorage.wedding_content_v1),
    'track-right-story-1': '电脑端补充的故事'
  });
  desktopStorage.wedding_fixed_photos_v1 = JSON.stringify({
    'track-left': 'https://my-wedding-poster-library.yuyanp52.workers.dev/media/assets/asset-fixed-track-left-12345678'
  });
  desktopStorage.wedding_music_playlist_v1 = JSON.stringify([{
    title: 'Cloud Song',
    url: 'https://my-wedding-poster-library.yuyanp52.workers.dev/media/assets/asset-music-12345678'
  }]);
  desktopStorage.wedding_layout_v1 = JSON.stringify({
    'proposal-title': { x: 18, y: -12, fontSize: 44, width: 720, deleted: false },
    'proposal-letter': { x: 0, y: 0, fontSize: 18, deleted: true }
  });
  const desktopWrite = await worker.fetch(authorized('/api/site-state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      format: 'my-wedding-content',
      packageVersion: 1,
      appVersion: '3.28.0',
      storage: desktopStorage
    })
  }), env);
  assert.equal(desktopWrite.status, 200);

  const mobileReadBack = (await worker.fetch(request('/api/site-state'), env).then(response => response.json())).state;
  const roundTripContent = JSON.parse(mobileReadBack.storage.wedding_content_v1);
  assert.equal(roundTripContent['track-left-story-1'], '手机端的新故事');
  assert.equal(roundTripContent['track-right-story-1'], '电脑端补充的故事');
  assert.match(JSON.parse(mobileReadBack.storage.wedding_fixed_photos_v1)['track-left'], /\/media\/assets\//);
  assert.equal(JSON.parse(mobileReadBack.storage.wedding_music_playlist_v1)[0].title, 'Cloud Song');
  const syncedLayout = JSON.parse(mobileReadBack.storage.wedding_layout_v1);
  assert.equal(syncedLayout['proposal-title'].fontSize, 44);
  assert.equal(syncedLayout['proposal-title'].width, 720);
  assert.equal(syncedLayout['proposal-letter'].deleted, true);

  const invalidSiteState = await worker.fetch(authorized('/api/site-state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ format: 'wrong-format', packageVersion: 1, storage: {} })
  }), env);
  assert.equal(invalidSiteState.status, 400);

  const assetId = 'asset-fixed-track-left-12345678';
  const assetUpload = await worker.fetch(authorized(`/api/assets/${assetId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: new Uint8Array([7, 8, 9])
  }), env);
  assert.equal(assetUpload.status, 200);
  const assetRead = await worker.fetch(request(`/media/assets/${assetId}`), env);
  assert.equal(assetRead.status, 200);
  assert.equal(assetRead.headers.get('Content-Type'), 'image/jpeg');
  assert.match(assetRead.headers.get('Cache-Control'), /immutable/);
  assert.deepEqual(new Uint8Array(await assetRead.arrayBuffer()), new Uint8Array([7, 8, 9]));
  const assetDelete = await worker.fetch(authorized(`/api/assets/${assetId}`, { method: 'DELETE' }), env);
  assert.equal(assetDelete.status, 200);
  assert.equal((await worker.fetch(request(`/media/assets/${assetId}`), env)).status, 404);

  const invalidFinaleId = await worker.fetch(authorized('/api/posters/finale-photo/original', {
    method: 'PUT',
    body: new Uint8Array([1])
  }), env);
  assert.equal(invalidFinaleId.status, 400);

  const localOwnerAuth = await worker.fetch(authorized('/api/auth', {
    headers: { Origin: 'http://localhost:8080' }
  }), env);
  assert.equal(localOwnerAuth.status, 200);
  assert.equal(localOwnerAuth.headers.get('Access-Control-Allow-Origin'), 'http://localhost:8080');

  const oversized = await worker.fetch(authorized(`/api/posters/${id}/original`, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg', 'Content-Length': '83886081' },
    body: new Uint8Array([1])
  }), env);
  assert.equal(oversized.status, 413);

  const original = await worker.fetch(authorized(`/api/posters/${id}/original`, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: new Uint8Array([10, 20, 30, 40])
  }), env);
  assert.equal(original.status, 200);

  const thumbnail = await worker.fetch(authorized(`/api/posters/${id}/thumbnail`, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: new Uint8Array([50, 60])
  }), env);
  assert.equal(thumbnail.status, 200);

  const catalogWrite = await worker.fetch(authorized('/api/posters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name: '第一张照片', caption: '我们的开始', createdAt: 123 })
  }), env);
  assert.equal(catalogWrite.status, 201);

  const catalogRead = await worker.fetch(request('/api/posters'), env);
  assert.equal(catalogRead.status, 200);
  const catalog = await catalogRead.json();
  assert.equal(catalog.posters.length, 1);
  assert.equal(catalog.posters[0].caption, '我们的开始');
  assert.equal(catalog.posters[0].originalSize, 4);

  const media = await worker.fetch(request(`/media/${id}/thumbnail`), env);
  assert.equal(media.status, 200);
  assert.equal(media.headers.get('Content-Type'), 'image/jpeg');
  assert.match(media.headers.get('Cache-Control'), /immutable/);
  assert.deepEqual(new Uint8Array(await media.arrayBuffer()), new Uint8Array([50, 60]));

  const patched = await worker.fetch(authorized(`/api/posters/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caption: '更新后的白色字幕\n第二行也要保留' })
  }), env);
  assert.equal(patched.status, 200);
  assert.equal((await patched.json()).poster.caption, '更新后的白色字幕\n第二行也要保留');

  const foreignOrigin = await worker.fetch(new Request('https://poster-worker.example/', {
    headers: { Origin: 'https://not-allowed.example' }
  }), env);
  assert.equal(foreignOrigin.status, 403);

  const removed = await worker.fetch(authorized(`/api/posters/${id}`, { method: 'DELETE' }), env);
  assert.equal(removed.status, 200);
  assert.equal((await worker.fetch(request('/api/posters'), env).then(response => response.json())).posters.length, 0);
  assert.equal((await worker.fetch(request(`/media/${id}/original`), env)).status, 404);
});
