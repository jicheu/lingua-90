# Installing Lingua 90 on YunoHost 12.1

Lingua 90 runs in one of two modes on YunoHost:

1. **Static only** (sections 1–8) — served straight by Nginx via the official
   **My Webapp** package. Progress lives in each browser. No server process.
2. **Multi-user with saved progress** (section 9) — a tiny zero-dependency Node
   server stores each learner's settings + progress in a JSON file (no
   database) and can tie profiles to the YunoHost login. Pick this if you want
   progress to roam across devices or several people to share the instance.

These instructions target **YunoHost 12.1** (Debian 13 "Trixie").

> Also see `SETUP.md`. This guide additionally covers the optional online-only
> reading features (synchronised translation / TTS fallback) and the profile
> server.

---

## 0. Prerequisites

- A running **YunoHost 12.1** server (Debian 13 / Trixie) with at least one
  domain configured and Let's Encrypt installed (YunoHost manages the cert).
- A domain or sub-domain to serve the app from, e.g. `lingua.example.tld`, or a
  sub-path like `example.tld/lingua`.
- A machine with **Node.js ≥ 20** and **npm** to build the site (any OS).
  YunoHost itself is *not* required for the build step — you build locally and
  upload the static `dist/`.

---

## 1. Build the static site (on your dev machine)

```bash
git clone <your-repo-url> lingua-90
cd lingua-90
npm install
npm run build        # outputs the site to ./dist
```

`vite.config.ts` sets `base: "./"`, so the built assets use **relative paths**
and work whether the app is served from a domain root
(`https://lingua.example.tld/`) or a sub-path (`https://example.tld/lingua/`).
No rebuild is needed when moving between the two.

You should now have a `dist/` folder containing `index.html` plus
`dist/assets/*`.

---

## 2. Install "My Webapp" on YunoHost

1. In the YunoHost admin web UI, open **Applications → Install**.
2. Search for and select **My Webapp**.
3. In the install form:
   - **Label:** `Lingua 90` (display name, anything you like).
   - **Domain:** choose your domain, e.g. `lingua.example.tld`.
   - **Path:** `/` for a dedicated sub-domain, or `/lingua` for a sub-path.
   - **Password (SFTP):** set a strong password — you'll use it to upload files.
   - **PHP version:** `none` (Lingua 90 is static, no PHP needed).
   - **Database:** leave **none** (no database).
4. Click **Install**.

When it finishes, open the app's URL once. The page tells you the **SFTP user**,
**host**, and **port**, and shows the web root path, which is:

```
/var/www/my_webapp/www/
```

(My Webapp creates an SFTP-only user; the password is the one you just set.)

---

## 3. Upload the built site

Upload the **contents of `dist/`** (not the `dist` folder itself) into the
webapp's `www/` directory.

### Option A — SFTP (e.g. FileZilla)

- Host: your YunoHost domain (e.g. `lingua.example.tld`).
- Username: the SFTP user shown on the app page (e.g. `my_webapp`).
- Password: the password from step 2.
- Port: the port shown on the app page (often `22`, or a custom SFTP port).
- Connect, navigate to `www/`, delete the default `index.html`, and upload the
  contents of your local `dist/` into it.

### Option B — `scp` from your dev machine

```bash
# remove the default placeholder page first (one-time):
ssh my_webapp@example.tld 'rm -f www/index.html'

# upload the built site:
scp -r dist/* my_webapp@example.tld:www/
```

If My Webapp's SFTP user is chrooted to its home, the `www/` path above is
relative to that home — i.e. it lands in `/var/www/my_webapp/www/` on disk.

---

## 4. Visit the app

Open the app's URL in a browser, e.g. `https://lingua.example.tld/`.

You should see the Lingua 90 dashboard. Each learner's progress is stored in
their own browser (`localStorage`); use **My Words → Export/Import backup** to
move progress between devices.

That's the whole installation — there is nothing else to run on the server.

---

## 5. Updating to a new version

Rebuild and re-upload:

```bash
git pull
npm install        # in case dependencies changed
npm run build
scp -r dist/* my_webapp@example.tld:www/
```

No YunoHost-side restart is needed — Nginx serves the new files immediately.

> **Gotcha:** browsers cache `index.html` and hashed assets aggressively. The
> JS/CSS bundle filenames are content-hashed (e.g. `index-AbC123.js`), so they
> update cleanly, but if you see a stale page do a hard refresh
> (Ctrl/Cmd-Shift-R).

---

## 6. Online-only reading features & network notes

The core app is fully offline once loaded. Two reading-exercise features need
**outbound internet** from the learner's browser:

- **Synchronised translation** — fetches sentence translations from
  `translate.googleapis.com`. The button is disabled automatically when the
  learner is offline.
- **Sentence / read-aloud TTS fallback** — if the browser has *no* system
  speech voice (common on desktop Linux without a speech engine), the app
  streams sentence audio from `translate.googleapis.com/translate_tts`.

No YunoHost configuration is required for these — they are direct
browser-to-Google requests. If your server/network blocks outbound traffic from
clients, these features degrade gracefully (read-aloud stays silent, sentence
mode still highlights and steps manually, translation shows a retry banner).

> YouTube videos (Exercise 2) also require the learner to have internet access,
> since they stream from YouTube.

---

## 7. Troubleshooting

**Blank page / 404 at the URL**
- Confirm you uploaded the *contents* of `dist/`, not a `dist/` subfolder —
  `index.html` must sit directly in `www/`.
- Check the path in the app settings matches where you expect.

**Assets 404 but HTML loads**
- Usually a `base` path mismatch. Because `base: "./"` is relative, this is rare,
  but if you installed at a deep sub-path, re-open `index.html` and confirm the
  `<script>`/`<link>` tags point to `./assets/...`.

**Can't log in via SFTP**
- Use the exact SFTP user and port shown on the My Webapp app page (not your
  admin account). The password is the one you set during install; it can be
  changed from the app's config panel.

**Synchronised translation never loads**
- The learner's browser must reach `translate.googleapis.com`. Check the
  device's network/proxy. The mode is intentionally disabled offline.

**Read-aloud / sentence audio is silent on a desktop**
- That browser likely has no system TTS voice. The app should then fall back to
  online TTS automatically; if it's still silent, the client can't reach
  `translate.googleapis.com`. Single-word "Listen" still works via prebuilt
  clips in `public/audio/`.

---

## 8. Alternative: serving without My Webapp

If you'd rather not use My Webapp, you can create a minimal custom app or just
drop the built files into an existing site's web root. The only requirement is
that Nginx serves the `dist/` directory as static files with the correct
`index.html` fallback. Because the build uses relative asset paths, it works at
any path depth.

---

## 9. Multi-user profiles + saved progress (lightweight, no database)

Sections 1–8 give a static site where progress lives only in each browser. To
**remember each learner's settings and progress on the server** — so anyone can
walk up, pick their profile, and continue where they left off from any device —
run the bundled profile server (`server/index.mjs`).

It is deliberately tiny:

- **No database.** Each learner is one JSON file: `server/data/<id>.json`,
  containing their full app state (display name, interface + learning language,
  light/dark theme, per-language day progress, XP, streak, saved words, badges).
- **One Node process** serves both the static site and the `/api` endpoints, so
  there is just one thing to run.
- The landing page shows a **"Who's learning?"** screen listing existing
  profiles with a **+ New learner** button.

### 9.1 Where the files live

YunoHost serves web apps from `/var/www/<app>/`, so install Lingua 90 there
rather than under `/opt`. The whole repo is checked out into
`/var/www/lingua-90/`, and the build output goes to `/var/www/lingua-90/dist/`.

> **What is `dist/`?** It's the compiled static site produced by `npm run build`
> (the `index.html` + hashed JS/CSS). It is *not* committed to git — you
> generate it on the server. The profile server (`server/index.mjs`) serves the
> files from `../dist` relative to itself, i.e. `/var/www/lingua-90/dist/`, so
> `dist/` must sit next to the `server/` folder inside the app directory.

Layout after install:

```
/var/www/lingua-90/
├── server/index.mjs     # the Node server
├── server/data/         # one JSON file per learner (created at runtime)
├── dist/                # built static site (npm run build)
└── …                    # the rest of the repo
```

### 9.2 Requirements & build

- **Node.js ≥ 18 and npm.** On Debian, `nodejs` and `npm` are **separate
  packages** — installing `nodejs` alone gives you `node` but *not* `npm`
  (hence `npm: command not found`). Install both:
  ```bash
  sudo apt update
  sudo apt install nodejs npm
  node -v && npm -v          # verify both are present
  ```
  > If Debian's packaged Node is too old for the build (Vite needs Node ≥ 18),
  > install a current release from NodeSource instead — it bundles npm:
  > ```bash
  > curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  > sudo apt install -y nodejs        # includes npm
  > ```
- Check out and build into `/var/www/lingua-90`:
  ```bash
  sudo git clone <your-repo-url> /var/www/lingua-90
  cd /var/www/lingua-90
  sudo npm install
  sudo npm run build         # produces /var/www/lingua-90/dist
  ```

### 9.3 Run it as a systemd service

Create `/etc/systemd/system/lingua-90.service`:

```ini
[Unit]
Description=Lingua 90 (static site + profile API)
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/lingua-90
Environment=PORT=3010
# DATA_DIR can point anywhere writable; defaults to /var/www/lingua-90/server/data
Environment=DATA_DIR=/var/www/lingua-90/server/data
# SSO_MODE: "auto" trusts a logged-in YunoHost user header when present (see 9.5);
#           "off" forces open profiles for everyone.
Environment=SSO_MODE=auto
ExecStart=/usr/bin/node server/index.mjs
Restart=on-failure
# Serve as the standard web user that owns /var/www
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

Then make the app directory writable by that user and start it:

```bash
sudo chown -R www-data:www-data /var/www/lingua-90
sudo systemctl daemon-reload
sudo systemctl enable --now lingua-90
sudo systemctl status lingua-90      # should be active
```

The server now listens on `127.0.0.1:3010`.

### 9.3 Reverse-proxy through Nginx (your YunoHost domain)

Add a YunoHost domain (e.g. `lingua.example.tld`, with its Let's Encrypt cert),
then create `/etc/nginx/conf.d/lingua.example.tld.d/lingua-90.conf`:

```nginx
location / {
    proxy_pass http://127.0.0.1:3010;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

`sudo systemctl reload nginx`, then open `https://lingua.example.tld/`. The same
process serves the app **and** the `/api/*` profile endpoints. The client calls
same-origin `/api`, so no rebuild is needed.

### 9.4 Optional: tie profiles to the YunoHost login (SSO)

If you protect the app with YunoHost's SSO (so visitors must log in with their
YunoHost account), the server uses the **logged-in user as the profile** — no
picker, and each user can only read/write their own file.

**How it actually works (important).** YunoHost's SSO (SSOwat) only injects the
logged-in identity into a backend when **two** conditions hold:

1. The app's URL is a **registered, protected YunoHost permission** (not
   "Visitors"/public), and
2. that permission has **`auth_header` enabled** (the default for protected
   apps).

When both hold, SSOwat adds these request headers before proxying to Node:

```
YNH_USER:          <username>
YNH_USER_EMAIL:    <email>
YNH_USER_FULLNAME: <full name>
Authorization:     Basic base64("<username>:-")
```

The server (`SSO_MODE=auto`, the default) reads `YNH_USER`, and—because some
nginx setups strip headers containing underscores—**also** decodes the
`Authorization: Basic` header as a fallback (it has no underscores, so it always
gets through). Either one is enough.

> ⚠️ **A hand-deployed nginx `location` does NOT get SSO headers.** SSOwat only
> injects them for URLs it knows about via the YunoHost *permission* system. If
> you just added the reverse-proxy block from 9.3 on a public domain, SSOwat
> sees the URL as public, runs no auth, and sends **no** `YNH_USER` — so the app
> falls back to the open "Who's learning?" picker. This is the usual reason
> "SSO doesn't work".

**To make SSO work you need a registered, protected permission.** The clean way
is to package Lingua 90 as a proper YunoHost app (a `manifest.toml` + install
script that registers the app, its permission, and the systemd service). If you
want, that packaging can be added to this repo. Until then, your options are:

- **Register a permission for the proxied URL** so SSOwat protects it and
  injects the headers, then keep `SSO_MODE=auto`.
- **Skip SSO** and run open profiles: set `Environment=SSO_MODE=off` in the
  service file (fine for a private/household instance).

**Verify what the server actually receives.** Visit (while logged in):

```
https://lingua.example.tld/api/whoami
```

- `"detectedUser": "alice"` → SSO is working.
- `"detectedUser": null` with empty `authHeaders` → SSOwat isn't injecting
  anything (URL isn't a protected permission). Fix the permission, or use open
  mode.

Once detected, logged-in **alice**'s state lives in `server/data/alice.json`,
she's sent straight into the app, and she can never read/write another user's
file (the server returns 403).

> **Open mode is not authenticated.** Anyone who can reach the site can open or
> create any profile. That's intended for a private/household instance. Use SSO
> (above) if you need per-user protection.

### 9.5 Backups & updating

- **Back up** `/var/www/lingua-90/server/data/` — that directory *is* everyone's
  progress. Each file is plain JSON.
- **Update:**
  ```bash
  cd /var/www/lingua-90
  sudo git pull
  sudo npm install       # if dependencies changed
  sudo npm run build
  sudo chown -R www-data:www-data /var/www/lingua-90
  sudo systemctl restart lingua-90
  ```

### 9.6 Local development

Run the API and the Vite dev server side by side:

```bash
npm run build && npm run serve     # API + built site on :3010
# in another terminal, for hot-reload dev pointing at that API:
echo 'VITE_API_URL=http://localhost:3010/api' > .env.local
npm run dev                        # http://localhost:5173
```
