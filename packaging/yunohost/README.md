# Lingua 90 — YunoHost package

This folder is a complete [YunoHost](https://yunohost.org) app package
(packaging format v2, helpers 2.1, targeting **YunoHost ≥ 12.1 / Debian Trixie**)
for the Lingua 90 language-learning app.

It installs the zero-dependency Node server (`server/index.mjs`), which serves
the built static site **and** a tiny file-per-learner profile API, behind
YunoHost's NGINX + SSO.

## What it sets up

- A dedicated system user and install dir (`/var/www/lingua90`).
- A **data dir** (`/home/yunohost.app/lingua90`) holding one JSON file per
  learner — this is where all progress lives (no database).
- A systemd service running `node server/index.mjs` on an internal port.
- An NGINX reverse-proxy on your chosen domain/path.
- A YunoHost permission. With the default *All users* permission, the app ties
  each learner's progress to their YunoHost login automatically (SSO). Set it to
  *Visitors* for an open "Who's learning?" picker.

See `doc/ADMIN.md` for how profiles and SSO behave.

## Before you publish / install

The package is generic except for the **source location**. Edit
`manifest.toml` → `[resources.sources.main]`:

1. Tag a release of the app code repo (this repo), e.g. `v0.1.0`.
2. Set `url` to that tag's tarball, e.g.
   `https://github.com/<you>/lingua90/archive/refs/tags/v0.1.0.tar.gz`.
3. Set `sha256` to `sha256sum` of that tarball.
4. Update `version` to match (`0.1.0~ynh1`).
5. Optionally set `[upstream]` `code`/`website` and `maintainers`.

> The source tarball does **not** need to contain a pre-built `dist/` — the
> install script runs `npm ci && npm run build` on the server and then removes
> `node_modules` (the runtime server has no dependencies).

## Install

Push this folder as its own git repository (the usual convention is a repo named
`lingua90_ynh` with these files at its root), then:

```bash
sudo yunohost app install https://github.com/<you>/lingua90_ynh
```

…or test a local copy:

```bash
sudo yunohost app install /path/to/this/folder
```

## Layout

```
manifest.toml          app metadata, install questions, resources
scripts/_common.sh     shared helpers
scripts/install        setup source, npm build, systemd + nginx, register service
scripts/remove         tear everything down
scripts/upgrade        re-fetch + rebuild + reapply config
scripts/backup         declare install dir + data dir + configs for backup
scripts/restore        restore the above
conf/systemd.service   the Node service (PORT/DATA_DIR/SSO_MODE env)
conf/nginx.conf        reverse proxy (strips the sub-path for the backend)
doc/DESCRIPTION.md      catalog description
doc/ADMIN.md            profiles + SSO admin notes
tests.toml             package_check config
```
