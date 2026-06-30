// Lingua 90 — lightweight profile server (zero dependencies, pure Node).
//
// Serves the built static site (../dist) AND a tiny file-per-user JSON API
// under /api. There is NO database: each learner's full app state (settings +
// progress + saved words + badges) lives in one file, server/data/<id>.json.
//
//   PORT=3010 node server/index.mjs
//
// ── Identity ──────────────────────────────────────────────────────────────
// When the app runs behind YunoHost's SSO (SSOwat), nginx injects the logged-in
// username in a request header. If we see it, the authenticated YunoHost user
// *is* the profile — one file per YunoHost user, and a client can only ever
// read/write its own file. If there is no such header (dev, plain nginx, or an
// unprotected install), we fall back to "open" mode: anyone can list, create,
// and open profiles. Controlled by SSO_MODE=auto|off (default: auto).
//
// ── Endpoints ─────────────────────────────────────────────────────────────
//   GET  /api/me               -> { user: string|null, sso: boolean }
//   GET  /api/users            -> [{ id, name }]      (open mode; SSO: just you)
//   POST /api/users {name}     -> { id, name }         (open mode only)
//   GET  /api/state/:id        -> AppState JSON
//   PUT  /api/state/:id (body) -> { ok: true }         (last-writer-wins)

import { createServer } from "node:http";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3010;
const HOST = process.env.HOST || "127.0.0.1";
const DATA_DIR = process.env.DATA_DIR || join(__dirname, "data");
const DIST_DIR = join(__dirname, "..", "dist");
const SSO_MODE = (process.env.SSO_MODE || "auto").toLowerCase(); // auto | off

// Headers SSOwat / reverse proxies commonly use to pass the logged-in user.
// How YunoHost's SSOwat tells a proxied app who is logged in:
//   - injects request headers  YNH_USER / YNH_USER_EMAIL / YNH_USER_FULLNAME
//   - injects  Authorization: Basic base64("<user>:-")
// ...but ONLY when the app's permission has `auth_header` enabled (the default
// for protected apps). It does NOT send "Remote-User". We also accept a few
// generic reverse-proxy header names as a courtesy.
//
// NB: `YNH_USER` contains underscores; some nginx setups drop underscore
// headers, which is exactly why we also decode the Authorization header — it
// has no underscores and is the most reliable signal.
const SSO_USER_HEADERS = [
  "ynh_user",
  "ynh-user",
  "remote-user",
  "remote_user",
  "x-remote-user",
  "x-forwarded-user",
];
const SSO_FULLNAME_HEADERS = ["ynh_user_fullname", "ynh-user-fullname"];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

await mkdir(DATA_DIR, { recursive: true });

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function sendJSON(res, status, body, headers = {}) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...CORS,
    ...headers,
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 6e6) {
        req.destroy();
        resolve(null);
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", () => resolve(null));
  });
}

// A safe id: lowercase letters, digits, dash, underscore, dot. No path bits.
function safeId(id) {
  return /^[A-Za-z0-9._-]{1,64}$/.test(id) && !id.includes("..") ? id : null;
}

function fileFor(id) {
  const s = safeId(id);
  return s ? join(DATA_DIR, s + ".json") : null;
}

// Resolve the SSO identity for a request, or null. Returns { user, fullname }.
// Order: explicit user header → decode the Basic Authorization header.
function ssoIdentity(req) {
  if (SSO_MODE === "off") return null;

  let user = null;
  for (const h of SSO_USER_HEADERS) {
    const v = req.headers[h];
    if (typeof v === "string" && v.trim()) {
      user = safeId(v.trim());
      if (user) break;
    }
  }

  // Fallback: SSOwat sets `Authorization: Basic base64("<user>:-")`. This has
  // no underscores, so it survives nginx setups that strip YNH_USER.
  if (!user) {
    const auth = req.headers["authorization"];
    if (typeof auth === "string") {
      const m = auth.match(/^Basic\s+(.+)$/i);
      if (m) {
        try {
          const decoded = Buffer.from(m[1], "base64").toString("utf8");
          const name = decoded.split(":")[0];
          if (name) user = safeId(name.trim());
        } catch {
          /* ignore */
        }
      }
    }
  }

  if (!user) return null;

  let fullname = null;
  for (const h of SSO_FULLNAME_HEADERS) {
    const v = req.headers[h];
    if (typeof v === "string" && v.trim()) {
      fullname = v.trim();
      break;
    }
  }
  return { user, fullname };
}

async function listProfiles() {
  try {
    const files = await readdir(DATA_DIR);
    const out = [];
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      const id = f.slice(0, -5);
      let name = id;
      try {
        const raw = await readFile(join(DATA_DIR, f), "utf8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.name === "string" && parsed.name.trim()) {
          name = parsed.name;
        }
      } catch {
        /* ignore unreadable files */
      }
      out.push({ id, name });
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = decodeURIComponent(url.pathname);
  const identity = ssoIdentity(req);
  const user = identity?.user ?? null;

  if (req.method === "OPTIONS") {
    sendJSON(res, 204, "");
    return;
  }

  // ── API ──
  if (path === "/api/me" && req.method === "GET") {
    sendJSON(res, 200, {
      user,
      sso: user !== null,
      fullname: identity?.fullname ?? null,
    });
    return;
  }

  // Diagnostics: see exactly which auth-ish headers reach this server. Helpful
  // for debugging SSOwat. Always reports the detected user; only dumps raw
  // headers when DEBUG_HEADERS=1 (avoid leaking headers by default).
  if (path === "/api/whoami" && req.method === "GET") {
    const interesting = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (/^(ynh|remote|x-remote|x-forwarded-user|authorization)/i.test(k)) {
        interesting[k] = k === "authorization" ? "<present>" : v;
      }
    }
    const out = { detectedUser: user, ssoMode: SSO_MODE, authHeaders: interesting };
    if (process.env.DEBUG_HEADERS === "1") out.allHeaders = req.headers;
    sendJSON(res, 200, out);
    return;
  }

  if (path === "/api/users") {
    // Behind SSO you only ever see yourself.
    if (user) {
      if (req.method === "GET") {
        let name = identity?.fullname || user;
        const f = fileFor(user);
        if (f && existsSync(f)) {
          try {
            const p = JSON.parse(await readFile(f, "utf8"));
            if (p?.name) name = p.name;
          } catch {
            /* ignore */
          }
        }
        sendJSON(res, 200, [{ id: user, name }]);
        return;
      }
      sendJSON(res, 403, { error: "managed by SSO" });
      return;
    }
    if (req.method === "GET") {
      sendJSON(res, 200, await listProfiles());
      return;
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      let name = "";
      try {
        name = String(JSON.parse(body || "{}").name || "").trim();
      } catch {
        /* ignore */
      }
      if (!name) {
        sendJSON(res, 400, { error: "name required" });
        return;
      }
      const id = randomBytes(6).toString("base64url").slice(0, 8).toLowerCase();
      const file = fileFor(id);
      await writeFile(file, JSON.stringify({ name, updatedAt: 0 }));
      sendJSON(res, 200, { id, name });
      return;
    }
  }

  const m = path.match(/^\/api\/state\/([^/]+)$/);
  if (m) {
    // In SSO mode, force the id to the authenticated user.
    const id = user ?? m[1];
    if (user && m[1] !== user) {
      // Allow clients that don't know their id yet to use "me".
      if (m[1] !== "me") {
        sendJSON(res, 403, { error: "forbidden" });
        return;
      }
    }
    const file = fileFor(id);
    if (!file) {
      sendJSON(res, 400, { error: "invalid id" });
      return;
    }
    if (req.method === "GET") {
      if (!existsSync(file)) {
        // SSO user with no file yet -> empty profile seeded with their name.
        if (user) {
          sendJSON(res, 200, { name: identity?.fullname || user, updatedAt: 0 });
          return;
        }
        sendJSON(res, 404, { error: "no such profile" });
        return;
      }
      const raw = await readFile(file, "utf8");
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        ...CORS,
      });
      res.end(raw);
      return;
    }
    if (req.method === "PUT") {
      const body = await readBody(req);
      if (body == null) {
        sendJSON(res, 400, { error: "body too large or unreadable" });
        return;
      }
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch {
        sendJSON(res, 400, { error: "invalid json" });
        return;
      }
      if (typeof parsed !== "object" || parsed === null) {
        sendJSON(res, 400, { error: "expected an object" });
        return;
      }
      await writeFile(file, JSON.stringify(parsed));
      sendJSON(res, 200, { ok: true, id });
      return;
    }
  }

  if (path.startsWith("/api/")) {
    sendJSON(res, 404, { error: "not found" });
    return;
  }

  // ── Static files (SPA) ──
  const rel = path === "/" ? "/index.html" : path;
  const file = join(DIST_DIR, rel);
  if (!file.startsWith(DIST_DIR)) {
    sendJSON(res, 403, { error: "forbidden" });
    return;
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, {
      "Content-Type": MIME[extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  } catch {
    // SPA fallback to index.html
    try {
      const index = await readFile(join(DIST_DIR, "index.html"));
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      res.end(index);
    } catch {
      sendJSON(res, 404, { error: "not found" });
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Lingua 90 server on http://${HOST}:${PORT}`);
  console.log(`  static : ${DIST_DIR}`);
  console.log(`  data   : ${DATA_DIR}`);
  console.log(`  sso    : ${SSO_MODE}`);
});
