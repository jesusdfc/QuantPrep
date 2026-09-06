#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v d2 >/dev/null 2>&1; then
  echo "d2 is required: https://d2lang.com/tour/install" >&2
  exit 1
fi

timeout 30s d2 "${script_dir}/arch.d2" "${script_dir}/arch.svg"
