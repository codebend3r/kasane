#!/usr/bin/env bash
#
# Lint every workflow under .github/workflows with actionlint.
#
# actionlint ships as a Go binary and has no npm package, so `bun install`
# cannot put it on PATH the way it does typos. This resolves a binary itself —
# reusing a system install when its version matches the pin, downloading the
# pinned release into a gitignored cache otherwise — so `bun run system-check`
# works on a clean checkout and in CI without either needing its own setup step.
set -euo pipefail

VERSION="1.7.12"
CACHE_DIR="node_modules/.cache/actionlint/${VERSION}"
CACHED_BIN="${CACHE_DIR}/actionlint"

WORK_DIR=""
cleanup() {
  # Must not be the trap's last failing command: under `set -e` a non-zero
  # return from an EXIT trap becomes the script's exit status.
  if [ -n "${WORK_DIR}" ]; then
    rm -rf "${WORK_DIR}"
  fi
}
trap cleanup EXIT

# Pinned per platform rather than read from the release's own checksums file:
# a checksum fetched from the same place as the artifact only proves the
# download was not corrupted, while these change only when the pin above does.
checksum_for() {
  case "$1" in
    darwin_amd64) echo "5b44c3bc2255115c9b69e30efc0fecdf498fdb63c5d58e17084fd5f16324c644" ;;
    darwin_arm64) echo "aba9ced2dee8d27fecca3dc7feb1a7f9a52caefa1eb46f3271ea66b6e0e6953f" ;;
    linux_amd64) echo "8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8" ;;
    linux_arm64) echo "325e971b6ba9bfa504672e29be93c24981eeb1c07576d730e9f7c8805afff0c6" ;;
    *) echo "no pinned actionlint checksum for platform: $1" >&2 && return 1 ;;
  esac
}

platform() {
  local os arch
  case "$(uname -s)" in
    Darwin) os="darwin" ;;
    Linux) os="linux" ;;
    *) echo "unsupported OS: $(uname -s)" >&2 && return 1 ;;
  esac
  case "$(uname -m)" in
    x86_64 | amd64) arch="amd64" ;;
    arm64 | aarch64) arch="arm64" ;;
    *) echo "unsupported architecture: $(uname -m)" >&2 && return 1 ;;
  esac
  echo "${os}_${arch}"
}

download() {
  local target expected archive actual
  target="$(platform)"
  expected="$(checksum_for "${target}")"

  WORK_DIR="$(mktemp -d -t actionlint.XXXXXX)"
  archive="${WORK_DIR}/actionlint.tar.gz"

  echo "⬇️  Downloading actionlint ${VERSION} (${target})…"
  curl \
    --silent \
    --show-error \
    --location \
    --fail \
    --max-time 120 \
    --retry 2 \
    --retry-delay 3 \
    --output "${archive}" \
    "https://github.com/rhysd/actionlint/releases/download/v${VERSION}/actionlint_${VERSION}_${target}.tar.gz"

  actual="$(shasum -a 256 "${archive}" | cut -d ' ' -f 1)"
  if [ "${actual}" != "${expected}" ]; then
    echo "❌ actionlint ${VERSION} checksum mismatch" >&2
    echo "   expected ${expected}" >&2
    echo "   received ${actual}" >&2
    return 1
  fi

  # Unpack beside the archive, then move into place, so a cancelled run cannot
  # leave a half-written binary in the cache for the next one to trust.
  tar --extract --gzip --file "${archive}" --directory "${WORK_DIR}" actionlint
  mkdir -p "${CACHE_DIR}"
  mv "${WORK_DIR}/actionlint" "${CACHED_BIN}"
}

# A system actionlint is reused only at the pinned version, so a developer
# machine and CI can never disagree about what counts as an error.
if command -v actionlint > /dev/null 2>&1 \
  && [ "$(actionlint -version | head -n 1)" = "${VERSION}" ]; then
  BIN="$(command -v actionlint)"
else
  if [ ! -x "${CACHED_BIN}" ]; then
    download
  fi
  BIN="${CACHED_BIN}"
fi

"${BIN}" -color "$@"
