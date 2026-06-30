# Installing Lingua 90 on YunoHost 12.1

Lingua 90 is a **pure static site** (HTML/CSS/JS, no backend, no database), so on
YunoHost it is served straight by Nginx via the official **My Webapp** package.
These instructions target **YunoHost 12.1** (Debian 13 "Trixie").

> Already covered briefly in `SETUP.md` — this guide goes step by step for 12.1
> and includes the optional online-only reading features (synchronised
> translation / TTS fallback).

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
