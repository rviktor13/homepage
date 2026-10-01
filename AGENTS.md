# Base44 Dev Environment

## Project
Static personal start page (Hungarian) — clock, weather, search, link wheel, todo list, calendar. Pure HTML/CSS/JS, no build step, no backend, no dependencies.

## Running
`docker compose -f docker-compose.base44.yml up -d` serves the static files via nginx on port 3000.

## Key details
- The repo root directory has 0700 permissions, so nginx workers must run as `user root;` (see `nginx.base44.conf`). Without this, nginx returns 403.
- Source is bind-mounted read-only into the container; edits to HTML/CSS/JS appear immediately on refresh (no rebuild needed).
- No external credentials required. Weather uses free public APIs (open-meteo geocoding + forecast) with no API key.
- All user data (theme, background, city, links, todos, calendar URL) is stored in browser localStorage — no server-side persistence.
