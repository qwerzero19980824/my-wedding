const CATALOG_KEY = '_system/posters.json';

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

function cleanText(value, maximum = 160) {
  return String(value || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, maximum);
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

async function handleApi(request, env, url) {
  if (request.method === 'GET' && url.pathname === '/api/posters') {
    const posters = await readCatalog(env);
    return json({ posters: posters.filter(item => item && item.id).sort((a, b) => Number(a.createdAt) - Number(b.createdAt)) });
  }

  if (!isAuthorized(request, env)) return json({ error: 'unauthorized' }, 401);

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
      caption: cleanText(input.caption, 240) || cleanText(input.name, 180) || '我们的照片',
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
    record.caption = cleanText(input.caption, 240) || record.name || '我们的照片';
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
      } else {
        const mediaMatch = url.pathname.match(/^\/media\/([^/]+)\/(original|thumbnail)$/);
        if (request.method === 'GET' && mediaMatch) {
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
