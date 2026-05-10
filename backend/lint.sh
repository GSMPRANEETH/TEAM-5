#!/usr/bin/env sh
set -e

cd "$(dirname "$0")"

ruff check .
