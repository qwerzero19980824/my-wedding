const CATALOG_KEY = '_system/posters.json';
const SITE_STATE_KEY = '_system/site-state.json';
const SITE_STATE_STORAGE_KEYS = [
  'wedding_veil_config_v2',
  'wedding_content_v1',
  'wedding_layout_v1',
  'wedding_story_modules_v1',
  'wedding_free_items_v1',
  'wedding_fixed_photos_v1',
  'wedding_polaroids_v1',
  'wedding_polaroid_layout_v1',
  'wedding_route_label_size_v1',
  'wedding_story_poster_config_v1',
  'wedding_anniversary_style_v1',
  'wedding_music_playlist_v1',
  'wedding_hidden_pages_v1'
];
const MAX_SITE_STATE_CHARACTERS = 12 * 1024 * 1024;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  });
}

function allowedOrigin(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  if (!origin) return allowed[0] || '*';
  return allowed.includes(origin) ? origin : '';
}

function withCors(response, request, env) {
  const origin = allowedOrigin(request, env);
  if (!origin) return json({ error: 'origin-not-allowed' }, 403);
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Vary', 'Origin');
  headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  return new Response(response.body, { status: response.status, headers });
}

function sameToken(left, right) {
  const a = String(left || '');
  const b = String(right || '');
  if (!a || !b || a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return mismatch === 0;
}

function isAuthorized(request, env) {
  const authorization = request.headers.get('Authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  return sameToken(token, env.UPLOAD_TOKEN);
}

function validPosterId(value) {
  const id = String(value || '');
  return /^poster-[a-zA-Z0-9-]{8,90}$/.test(id) ? id : '';
}

function validAssetId(value) {
  const id = String(value || '');
  return /^asset-[a-zA-Z0-9-]{8,110}$/.test(id) ? id : '';
}

function cleanText(value, maximum = 160) {
  return String(value || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, maximum);
}

function cleanCaption(value, maximum = 240) {
  return String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maximum);
}

async function readCatalog(env) {
  const object = await env.POSTERS.get(CATALOG_KEY);
  if (!object) return [];
  try {
    const parsed = await object.json();
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeCatalog(env, posters) {
  await env.POSTERS.put(CATALOG_KEY, JSON.stringify(posters), {
    httpMetadata: { contentType: 'application/json; charset=utf-8', cacheControl: 'no-store' }
  });
}

function normalizeSiteState(input) {
  if (!input || input.format !== 'my-wedding-content' || Number(input.packageVersion) !== 1) return null;
  if (!input.storage || typeof input.storage !== 'object' || Array.isArray(input.storage)) return null;
  let totalCharacters = 0;
  const storage = {};
  for (const key of SITE_STATE_STORAGE_KEYS) {
    const value = Object.prototype.hasOwnProperty.call(input.storage, key) ? input.storage[key] : null;
    if (value !== null && typeof value !== 'string') return null;
    totalCharacters += value ? value.length : 0;
    if (totalCharacters > MAX_SITE_STATE_CHARACTERS) return null;
    storage[key] = value;
  }
  return {
    format: 'my-wedding-content',
    packageVersion: 1,
    appVersion: cleanText(input.appVersion, 32),
    storage,
    updatedAt: Date.now()
  };
}

async function readSiteState(env) {
  const object = await env.POSTERS.get(SITE_STATE_KEY);
  if (!object) return null;
  try {
    return await object.json();
  } catch {
    return null;
  }
}

async function writeSiteState(env, input) {
  const record = normalizeSiteState(input);
  if (!record) return null;
  await env.POSTERS.put(SITE_STATE_KEY, JSON.stringify(record), {
    httpMetadata: { contentType: 'application/json; charset=utf-8', cacheControl: 'no-store' }
  });
  return record;
}

async function serveMedia(env, id, variant) {
  const key = `posters/${id}/${variant === 'original' ? 'original' : 'thumbnail'}`;
  const object = await env.POSTERS.get(key);
  if (!object) return json({ error: 'not-found' }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('ETag', object.httpEtag);
  headers.set('Cache-Control', variant === 'original' ? 'public, max-age=86400' : 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
}

async function serveAsset(env, id) {
  const object = await env.POSTERS.get(`assets/${id}`);
  if (!object) return json({ error: 'not-found' }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('ETag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
}

async function serveAmapChinaBackground(env) {
  const key = String(env.AMAP_WEB_SERVICE_KEY || '').trim();
  if (!key) return json({ error: 'amap-key-not-configured' }, 503);
  const params = new URLSearchParams({
    location: '104.195397,35.861660',
    zoom: '3',
    size: '1024*760',
    scale: '2',
    traffic: '0',
    key
  });
  const upstream = await fetch(`https://restapi.amap.com/v3/staticmap?${params}`);
  if (!upstream.ok) return json({ error: 'amap-upstream-failed' }, 502);
  const headers = new Headers();
  headers.set('Content-Type', upstream.headers.get('Content-Type') || 'image/png');
  headers.set('Cache-Control', 'public, max-age=604800');
  return new Response(upstream.body, { headers });
}

async function handleApi(request, env, url) {
  if (request.method === 'GET' && url.pathname === '/api/posters') {
    const posters = await readCatalog(env);
    return json({ posters: posters.filter(item => item && item.id).sort((a, b) => Number(a.createdAt) - Number(b.createdAt)) });
  }

  if (request.method === 'GET' && url.pathname === '/api/site-state') {
    return json({ state: await readSiteState(env) });
  }

  if (!isAuthorized(request, env)) return json({ error: 'unauthorized' }, 401);

  if (request.method === 'GET' && url.pathname === '/api/auth') {
    return json({ ok: true, role: 'owner' });
  }

  if (request.method === 'PUT' && url.pathname === '/api/site-state') {
    const input = await request.json();
    const state = await writeSiteState(env, input);
    return state ? json({ state }) : json({ error: 'invalid-site-state' }, 400);
  }

  const assetMatch = url.pathname.match(/^\/api\/assets\/([^/]+)$/);
  if (assetMatch) {
    const id = validAssetId(decodeURIComponent(assetMatch[1]));
    if (!id) return json({ error: 'invalid-id' }, 400);
    if (request.method === 'PUT') {
      const maximum = Number(env.MAX_ORIGINAL_BYTES || 80 * 1024 * 1024);
      const contentLength = Number(request.headers.get('Content-Length') || 0);
      if (contentLength && contentLength > maximum) return json({ error: 'file-too-large', maximum }, 413);
      await env.POSTERS.put(`assets/${id}`, request.body, {
        httpMetadata: {
          contentType: request.headers.get('Content-Type') || 'application/octet-stream',
          cacheControl: 'public, max-age=31536000, immutable'
        }
      });
      return json({ ok: true, id });
    }
    if (request.method === 'DELETE') {
      await env.POSTERS.delete(`assets/${id}`);
      return json({ ok: true });
    }
    return json({ error: 'method-not-allowed' }, 405);
  }

  if (request.method === 'POST' && url.pathname === '/api/posters') {
    const input = await request.json();
    const id = validPosterId(input.id);
    if (!id) return json({ error: 'invalid-id' }, 400);
    const original = await env.POSTERS.head(`posters/${id}/original`);
    const thumbnail = await env.POSTERS.head(`posters/${id}/thumbnail`);
    if (!original || !thumbnail) return json({ error: 'media-incomplete' }, 409);
    const posters = await readCatalog(env);
    const record = {
      id,
      name: cleanText(input.name, 180) || '我们的照片',
      caption: cleanCaption(input.caption, 240) || cleanText(input.name, 180) || '我们的照片',
      createdAt: Number(input.createdAt) || Date.now(),
      originalSize: Number(original.size || 0),
      thumbnailSize: Number(thumbnail.size || 0)
    };
    const next = posters.filter(item => item.id !== id);
    next.push(record);
    await writeCatalog(env, next);
    return json({ poster: record }, 201);
  }

  const apiMatch = url.pathname.match(/^\/api\/posters\/([^/]+)(?:\/(original|thumbnail))?$/);
  if (!apiMatch) return json({ error: 'not-found' }, 404);
  const id = validPosterId(decodeURIComponent(apiMatch[1]));
  if (!id) return json({ error: 'invalid-id' }, 400);
  const variant = apiMatch[2];

  if (request.method === 'PUT' && variant) {
    const maximum = variant === 'original'
      ? Number(env.MAX_ORIGINAL_BYTES || 80 * 1024 * 1024)
      : 3 * 1024 * 1024;
    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength && contentLength > maximum) return json({ error: 'file-too-large', maximum }, 413);
    await env.POSTERS.put(`posters/${id}/${variant}`, request.body, {
      httpMetadata: {
        contentType: request.headers.get('Content-Type') || 'application/octet-stream',
        cacheControl: variant === 'thumbnail' ? 'public, max-age=31536000, immutable' : 'public, max-age=86400'
      }
    });
    return json({ ok: true, id, variant });
  }

  if (request.method === 'PATCH' && !variant) {
    const input = await request.json();
    const posters = await readCatalog(env);
    const record = posters.find(item => item.id === id);
    if (!record) return json({ error: 'not-found' }, 404);
    record.caption = cleanCaption(input.caption, 240) || record.name || '我们的照片';
    await writeCatalog(env, posters);
    return json({ poster: record });
  }

  if (request.method === 'DELETE' && !variant) {
    await Promise.all([
      env.POSTERS.delete(`posters/${id}/original`),
      env.POSTERS.delete(`posters/${id}/thumbnail`)
    ]);
    const posters = await readCatalog(env);
    await writeCatalog(env, posters.filter(item => item.id !== id));
    return json({ ok: true });
  }

  return json({ error: 'method-not-allowed' }, 405);
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      let response;
      if (request.method === 'OPTIONS') {
        response = new Response(null, { status: 204 });
      } else if (request.method === 'GET' && url.pathname === '/api/amap-static-map') {
        response = await serveAmapChinaBackground(env);
      } else {
        const mediaMatch = url.pathname.match(/^\/media\/([^/]+)\/(original|thumbnail)$/);
        const assetMatch = url.pathname.match(/^\/media\/assets\/([^/]+)$/);
        if (request.method === 'GET' && assetMatch) {
          const id = validAssetId(decodeURIComponent(assetMatch[1]));
          response = id ? await serveAsset(env, id) : json({ error: 'invalid-id' }, 400);
        } else if (request.method === 'GET' && mediaMatch) {
          const id = validPosterId(decodeURIComponent(mediaMatch[1]));
          response = id ? await serveMedia(env, id, mediaMatch[2]) : json({ error: 'invalid-id' }, 400);
        } else if (url.pathname.startsWith('/api/')) {
          response = await handleApi(request, env, url);
        } else {
          response = json({ service: 'my-wedding-poster-library', status: 'ok' });
        }
      }
      return withCors(response, request, env);
    } catch (error) {
      return withCors(json({ error: 'internal-error' }, 500), request, env);
    }
  }
};
