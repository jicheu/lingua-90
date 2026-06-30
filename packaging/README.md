# YunoHost packaging

The YunoHost app package for Lingua 90 lives in its **own repository** (as
YunoHost convention requires `manifest.toml` at the repo root):

➡️ **https://github.com/jicheu/lingua-90_ynh**

Install it on a YunoHost server with:

```bash
sudo yunohost app install https://github.com/jicheu/lingua-90_ynh
```

That package fetches this repository's tagged source (see its
`manifest.toml` → `[resources.sources.main]`) and builds it on the server.

## Releasing a new version

1. Tag this code repo, e.g. `git tag -a v0.2.0 -m "..." && git push origin v0.2.0`.
2. In the `lingua-90_ynh` repo, update `manifest.toml`:
   - `version` (e.g. `0.2.0~ynh1`)
   - `[resources.sources.main].url` → the new tag tarball
   - `[resources.sources.main].sha256` → `curl -sL <url> | sha256sum`
