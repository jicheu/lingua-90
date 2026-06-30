## How learner profiles work

Lingua 90 keeps each learner's settings (interface + learning language,
light/dark theme) and progress (per-day completion, XP, streak, badges, saved
words) in **one JSON file per learner**, under the app's data directory
(`/home/yunohost.app/__APP__/` by default). There is no database.

### Two modes

* **Logged-in (recommended).** If you installed the app so that it requires a
  YunoHost login (permission = *All users*, the default), the server detects the
  logged-in user via the auth header SSOwat injects and uses it as the learner
  profile. Each person automatically gets their own progress and cannot see
  anyone else's. No profile picker is shown.

* **Open.** If you set the app permission to *Visitors* (public, no login), the
  app shows a "Who's learning?" screen where anyone can pick or create a
  profile. Convenient for a shared/household device, but **not** access-controlled.

You can switch between the two at any time from the YunoHost admin → the app →
permissions (or `yunohost user permission update __APP__.main --add/--remove`).

### Checking SSO detection

Visit `https://<your-domain><path>/api/whoami` while logged in:

* `"detectedUser": "<username>"` → the logged-in user is recognised.
* `"detectedUser": null` → no auth header is reaching the server; make sure the
  app's permission requires login (not *Visitors*).

### Backups

The learner profiles are in the **data directory**, which is included in
`yunohost backup`. Each file is plain JSON, safe to copy.

### Toggling SSO off without changing the permission

The systemd service sets `SSO_MODE=auto`. To force open profiles regardless of
login, edit `/etc/systemd/system/__APP__.service`, set `Environment=SSO_MODE=off`,
then `systemctl daemon-reload && systemctl restart __APP__`.
