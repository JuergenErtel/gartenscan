#!/usr/bin/env bash
# Portierung von pipeline-update.ps1 (Windows) fuer macOS/Linux.
#
# Einrichtung einmalig in ~/.zshrc:
#   export PIPELINE_URL="https://pipeline-juergenertels-projects.vercel.app"
#   export PIPELINE_SECRET="<Secret aus dem Windows-PS-Profil>"
#   export PATH="$PATH:$HOME/bin"
# Danach installieren:
#   cp scripts/pipeline-update.sh ~/bin/pipeline-update && chmod +x ~/bin/pipeline-update
#
# Beispiel:
#   pipeline-update --slug gartenscanner --progress 97 \
#     --summary "Coach-LLM live" \
#     --todo "Impressum HRB-Daten" --todo "Stripe/Premium"
#
# Braucht nur node und curl — beides ist fuer das Projekt ohnehin vorhanden.

set -euo pipefail

SLUG="" STAGE="" SUMMARY="" STATUS="" PROGRESS=""
TODOS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --slug)     SLUG="$2"; shift 2 ;;
    --stage)    STAGE="$2"; shift 2 ;;
    --progress) PROGRESS="$2"; shift 2 ;;
    --summary)  SUMMARY="$2"; shift 2 ;;
    --status)   STATUS="$2"; shift 2 ;;
    --todo)     TODOS+=("$2"); shift 2 ;;
    -h|--help)  sed -n '2,16p' "$0"; exit 0 ;;
    *) echo "Unbekannte Option: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$SLUG" ]]; then
  echo "pipeline-update: --slug fehlt" >&2
  exit 1
fi
if [[ -z "${PIPELINE_URL:-}" || -z "${PIPELINE_SECRET:-}" ]]; then
  echo "pipeline-update: PIPELINE_URL und/oder PIPELINE_SECRET nicht gesetzt (siehe Kopf dieser Datei)" >&2
  exit 1
fi

# JSON via node bauen: escaped Anfuehrungszeichen und Umlaute zuverlaessig.
# Werte kommen ueber die Umgebung, nicht ueber die Kommandozeile, damit nichts
# von der Shell interpretiert wird.
BODY=$(
  PU_SLUG="$SLUG" PU_STAGE="$STAGE" PU_SUMMARY="$SUMMARY" \
  PU_STATUS="$STATUS" PU_PROGRESS="$PROGRESS" \
  node -e '
    const body = {
      projectSlug: process.env.PU_SLUG,
      updatedBy: "claude/" + new Date().toISOString().slice(0,16).replace("T","-").replace(":",""),
    };
    if (process.env.PU_STAGE)    body.stage = process.env.PU_STAGE;
    if (process.env.PU_SUMMARY)  body.summary = process.env.PU_SUMMARY;
    if (process.env.PU_STATUS)   body.status = process.env.PU_STATUS;
    if (process.env.PU_PROGRESS) body.progressPercent = Number(process.env.PU_PROGRESS);
    const todos = process.argv.slice(1);
    if (todos.length > 0) body.nextTodos = todos;
    process.stdout.write(JSON.stringify(body));
  ' "${TODOS[@]+"${TODOS[@]}"}"
)

RESPONSE=$(curl -sS -w '\n%{http_code}' -X POST \
  "$PIPELINE_URL/api/claude/project-update" \
  -H "X-Claude-Secret: $PIPELINE_SECRET" \
  -H "Content-Type: application/json" \
  -d "$BODY")

HTTP_CODE=$(tail -n1 <<<"$RESPONSE")
BODY_OUT=$(sed '$d' <<<"$RESPONSE")

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "pipeline-update fehlgeschlagen (HTTP $HTTP_CODE): $BODY_OUT" >&2
  exit 1
fi
echo "$BODY_OUT"
