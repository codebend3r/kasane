#!/usr/bin/env bash
# Starts the Expo dev server against one Supabase target.
#
#   scripts/dev.sh local [--keep] [-- <expo start args>]
#   scripts/dev.sh production [-- <expo start args>]
#
# local       Starts the local Supabase stack in Docker, copies production's
#             data into it (public and auth schemas), then serves the app
#             against http://127.0.0.1:54321. Pass --keep to skip the copy and
#             reuse whatever the local database already holds.
# production  Serves the app against the production project. Imports nothing.
#
# The copy reads SUPABASE_DB_URL, production's Postgres connection string,
# from the environment or from scripts/.env.local (gitignored). It is a
# service-level secret and never reaches app/ or src/.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SNAPSHOT_DIR="$ROOT/supabase/.snapshots"
SNAPSHOT="$SNAPSHOT_DIR/production-data.sql"
LAST_TARGET_FILE="$ROOT/supabase/.temp/dev-target"
LOCAL_DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

usage() {
  sed -n '2,15p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
  exit 1
}

TARGET="${1:-}"
[[ "$TARGET" == "local" || "$TARGET" == "production" ]] || usage
shift

KEEP=false
EXPO_ARGS=()
while (($#)); do
  case "$1" in
    --keep) KEEP=true ;;
    --) shift; EXPO_ARGS+=("$@"); break ;;
    *) EXPO_ARGS+=("$1") ;;
  esac
  shift
done

cd "$ROOT"

# Metro caches modules with EXPO_PUBLIC_* values already inlined, so switching
# targets without clearing it can keep serving the old database URL.
clear_flag_if_target_changed() {
  mkdir -p "$(dirname "$LAST_TARGET_FILE")"
  local last=""
  [[ -f "$LAST_TARGET_FILE" ]] && last="$(cat "$LAST_TARGET_FILE")"
  echo "$TARGET" >"$LAST_TARGET_FILE"
  [[ "$last" != "$TARGET" ]] && echo "--clear"
  return 0
}

ensure_docker() {
  docker info >/dev/null 2>&1 && return 0
  echo "Docker is not running; starting Docker Desktop..."
  open -a Docker
  local waited=0
  until docker info >/dev/null 2>&1; do
    ((waited >= 120)) && { echo "Docker did not start within 120s." >&2; exit 1; }
    sleep 2
    waited=$((waited + 2))
  done
}

load_db_url() {
  [[ -n "${SUPABASE_DB_URL:-}" ]] && return 0
  if [[ -f "$ROOT/scripts/.env.local" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "$ROOT/scripts/.env.local"
    set +a
  fi
  [[ -n "${SUPABASE_DB_URL:-}" ]] || {
    cat >&2 <<'EOF'
SUPABASE_DB_URL is not set. Add production's connection string to
scripts/.env.local (Supabase dashboard, Connect, Session pooler):

  SUPABASE_DB_URL="postgresql://postgres.obtgldkascmxbtpnvscn:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"

Or rerun with --keep to use the data already in the local database.
EOF
    exit 1
  }
}

import_production() {
  load_db_url
  mkdir -p "$SNAPSHOT_DIR"

  echo "Dumping production data (public, auth)..."
  bunx supabase db dump \
    --remote="$SUPABASE_DB_URL" \
    --data-only \
    --use-copy \
    --schema public,auth \
    --exclude auth.schema_migrations \
    --file "$SNAPSHOT"

  echo "Resetting the local database to the committed migrations..."
  bunx supabase db reset --local

  # The migrations seed catalog rows, so empty every table the dump covers
  # before loading it, and load in one transaction so a failure leaves the
  # freshly reset database rather than a half-imported one.
  echo "Loading the production snapshot..."
  psql "$LOCAL_DB_URL" --quiet -v ON_ERROR_STOP=1 --single-transaction \
    -c "set session_replication_role = replica;" \
    -c "do \$\$
        declare t text;
        begin
          select string_agg(format('%I.%I', schemaname, tablename), ', ')
            into t
            from pg_tables
           where schemaname in ('public', 'auth')
             and tablename <> 'schema_migrations';
          if t is not null then
            execute 'truncate table ' || t || ' cascade';
          end if;
        end \$\$;" \
    -f "$SNAPSHOT"

  echo "Local database now mirrors production."
}

start_local() {
  ensure_docker
  bunx supabase start

  if [[ "$KEEP" == true ]]; then
    echo "--keep: skipping the production import."
  else
    import_production
  fi

  local status api_url key
  status="$(bunx supabase status -o env)"
  api_url="$(sed -n 's/^API_URL="\{0,1\}\([^"]*\)"\{0,1\}$/\1/p' <<<"$status")"
  key="$(sed -n 's/^PUBLISHABLE_KEY="\{0,1\}\([^"]*\)"\{0,1\}$/\1/p' <<<"$status")"
  [[ -n "$key" ]] || key="$(sed -n 's/^ANON_KEY="\{0,1\}\([^"]*\)"\{0,1\}$/\1/p' <<<"$status")"
  [[ -n "$api_url" && -n "$key" ]] || {
    echo "Could not read the local API URL and key from 'supabase status'." >&2
    exit 1
  }

  echo "Serving against local Supabase at $api_url (Studio: http://127.0.0.1:54323)"
  local clear
  clear="$(clear_flag_if_target_changed)"
  EXPO_PUBLIC_SUPABASE_URL="$api_url" \
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$key" \
    exec bunx expo start ${clear:+"$clear"} ${EXPO_ARGS[@]+"${EXPO_ARGS[@]}"}
}

start_production() {
  echo "Serving against production Supabase."
  local clear
  clear="$(clear_flag_if_target_changed)"
  exec env -u EXPO_PUBLIC_SUPABASE_URL -u EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY \
    bunx expo start ${clear:+"$clear"} ${EXPO_ARGS[@]+"${EXPO_ARGS[@]}"}
}

case "$TARGET" in
  local) start_local ;;
  production) start_production ;;
esac
