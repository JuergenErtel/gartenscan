# Pipeline Integration

Slug: `gartenscanner` — tracked in the Coding Brothers Pipeline Dashboard
(https://pipeline-juergenertels-projects.vercel.app).

## When to push an update

After any meaningful milestone, call `pipeline-update`:

- Stage transitions (e.g. `mvp_in_development` → `testing`)
- Progress jumps of +10% or more
- Completing or adding notable todos
- Blocker encountered or cleared

## How

**macOS/Linux** — `scripts/pipeline-update.sh` (siehe Kopf der Datei für die
einmalige Einrichtung von `PIPELINE_URL`, `PIPELINE_SECRET` und `~/bin`):

```bash
pipeline-update --slug gartenscanner \
  --progress 40 \
  --summary "Kurzbeschreibung was passiert ist" \
  --todo "Nächster Schritt 1" --todo "Nächster Schritt 2"
```

**Windows** — gleichnamige PowerShell-Funktion aus dem globalen PS-Profil:

```powershell
pipeline-update -Slug gartenscanner `
  -Progress 40 `
  -Summary "Kurzbeschreibung was passiert ist" `
  -Todos @("Nächster Schritt 1", "Nächster Schritt 2")
```

Optional: `--stage <stage>` / `-Stage`, `--status <active|blocked>` / `-Status`.

**Valid stages:** `idea | concept | mvp_in_development | testing |
launch_prep | live | optimization | monetization | paused | archived`

## Don't over-push

The dashboard is an overview, not a commit log. Skip trivial changes
(typo fixes, comments). Rate-limit is 10 requests / 10 seconds.

## Todo-merge behaviour

Existing open todos with matching titles remain untouched. Todos no
longer mentioned get marked `superseded` (not deleted). New titles
land at the top of the card.

## Troubleshooting

`pipeline-update: command not found` → auf dem Mac `scripts/pipeline-update.sh`
nach `~/bin/pipeline-update` kopieren und `chmod +x` setzen; unter Windows ein
frisches PowerShell-Fenster öffnen (Profil lädt beim Shell-Start).

`PIPELINE_URL und/oder PIPELINE_SECRET nicht gesetzt` → Export in `~/.zshrc`
nachtragen (Secret stammt aus dem Windows-PS-Profil).

`HTTP 401` → `PIPELINE_SECRET` ist veraltet.

`HTTP 404 project_not_found` → slug typo, or project not in DB.
