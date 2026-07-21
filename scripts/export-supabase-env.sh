#!/usr/bin/env bash
# Export local Supabase credentials for app/e2e tests.
# Usage:
#   eval "$(./scripts/export-supabase-env.sh)"
#   ./scripts/export-supabase-env.sh --github-env

set -euo pipefail

MODE="${1:-shell}"

resolve_from_env_format() {
  local env_blob
  env_blob="$(supabase status -o env)"

  local api_url anon_key service_key db_url
  api_url="$(printf '%s\n' "$env_blob" | sed -n 's/^API_URL=//p' | tail -n1 | tr -d '"')"
  anon_key="$(printf '%s\n' "$env_blob" | sed -n -E 's/^(ANON_KEY|PUBLISHABLE_KEY)=//p' | tail -n1 | tr -d '"')"
  service_key="$(printf '%s\n' "$env_blob" | sed -n -E 's/^(SERVICE_ROLE_KEY|SECRET_KEY)=//p' | tail -n1 | tr -d '"')"
  db_url="$(printf '%s\n' "$env_blob" | sed -n 's/^DB_URL=//p' | tail -n1 | tr -d '"')"

  if [[ -z "$api_url" || -z "$anon_key" || -z "$service_key" ]]; then
    echo "Could not parse supabase status -o env credentials." >&2
    echo "$env_blob" >&2
    return 1
  fi

  export RESOLVED_SUPABASE_URL="$api_url"
  export RESOLVED_SUPABASE_ANON_KEY="$anon_key"
  export RESOLVED_SUPABASE_SERVICE_ROLE_KEY="$service_key"
  export RESOLVED_DATABASE_URL="${db_url:-}"
}

resolve_from_json_format() {
  local status_json
  status_json="$(supabase status -o json)"
  export STATUS_JSON="$status_json"

  eval "$(node <<'NODE'
const status = JSON.parse(process.env.STATUS_JSON);

function asString(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function pick(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === "function") {
      const value = asString(candidate(status));
      if (value) return value;
      continue;
    }
    const parts = String(candidate).split(".");
    let cur = status;
    for (const part of parts) {
      if (cur == null || typeof cur !== "object") {
        cur = null;
        break;
      }
      cur = cur[part];
    }
    const value = asString(cur);
    if (value) return value;
  }
  return null;
}

const url = pick("API_URL", "apiUrl", (s) => s?.SERVICES?.api?.URL, (s) => s?.services?.api?.url);
const anon = pick("ANON_KEY", "anonKey", "PUBLISHABLE_KEY", (s) => s?.KEYS?.ANON_KEY, (s) => s?.keys?.anon);
const service = pick("SERVICE_ROLE_KEY", "serviceRoleKey", "SECRET_KEY", (s) => s?.KEYS?.SERVICE_ROLE_KEY, (s) => s?.keys?.service_role);
const dbUrl = pick("DB_URL", "dbUrl", (s) => s?.DB?.URL, (s) => s?.db?.url);

if (!url || !anon || !service) process.exit(2);

const esc = (v) => String(v).replace(/'/g, `'\\''`);
process.stdout.write(`export RESOLVED_SUPABASE_URL='${esc(url)}'\n`);
process.stdout.write(`export RESOLVED_SUPABASE_ANON_KEY='${esc(anon)}'\n`);
process.stdout.write(`export RESOLVED_SUPABASE_SERVICE_ROLE_KEY='${esc(service)}'\n`);
process.stdout.write(`export RESOLVED_DATABASE_URL='${esc(dbUrl || "")}'\n`);
NODE
)"
}

if ! resolve_from_env_format; then
  resolve_from_json_format
fi

emit() {
  local key="$1"
  local value="$2"
  if [[ "$MODE" == "--github-env" ]]; then
    if [[ -z "${GITHUB_ENV:-}" ]]; then
      echo "GITHUB_ENV is not set" >&2
      exit 1
    fi
    printf '%s=%s\n' "$key" "$value" >> "$GITHUB_ENV"
  else
    local escaped
    escaped="$(printf "%s" "$value" | sed "s/'/'\\\\''/g")"
    printf "export %s='%s'\n" "$key" "$escaped"
  fi
}

emit SUPABASE_URL "$RESOLVED_SUPABASE_URL"
emit SUPABASE_ANON_KEY "$RESOLVED_SUPABASE_ANON_KEY"
emit SUPABASE_SERVICE_ROLE_KEY "$RESOLVED_SUPABASE_SERVICE_ROLE_KEY"
if [[ -n "${RESOLVED_DATABASE_URL:-}" ]]; then
  emit DATABASE_URL "$RESOLVED_DATABASE_URL"
fi
emit VITE_SUPABASE_URL "$RESOLVED_SUPABASE_URL"
emit VITE_SUPABASE_PUBLISHABLE_KEY "$RESOLVED_SUPABASE_ANON_KEY"
emit VITE_MEWE_BACKEND_MODE "supabase"
