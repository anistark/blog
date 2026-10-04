# Blog - Development Commands
# https://github.com/casey/just

# Default recipe to display help
default:
    @just --list

# Install dependencies
install:
    pnpm install

# Start the dev server with live reload
dev:
    pnpm run dev

# Dev server with live reload, reachable from your LAN and Tailscale, e.g. just dev-host 8080
dev-host port="8080":
    #!/usr/bin/env bash
    set -euo pipefail
    trap 'kill 0' EXIT
    pnpm run clean
    pnpm run build:rollup
    ts_ip=$(tailscale ip -4 2>/dev/null | head -1 || true)
    if [ -n "$ts_ip" ]; then echo "Tailscale: http://$ts_ip:{{port}}"; fi
    pnpm exec rollup -c -w &
    pnpm exec eleventy --serve --quiet --port={{port}}

# Production build into dist/
build:
    pnpm run build

# Remove dist/
clean:
    pnpm run clean

# Scaffold a new draft post, e.g. just new-post "My Post Title"
new-post +title:
    pnpm run new-post "{{title}}"

# Rasterise a featured image for link previews, e.g. just social-image /images/posts/foo.svg
social-image path:
    pnpm run social-image {{path}}
