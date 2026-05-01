# Daily Intelligence Brief

React + Vite + Tailwind CSS SPA for daily intelligence briefings.

## Stack

- React 18
- Vite
- Tailwind CSS
- React Router with `HashRouter`
- Static JSON data from `public/data`

## Routes

- `/#/` - archive of all briefings
- `/#/latest` - redirect to the latest briefing
- `/#/YYYY-MM-DD` - full briefing

Production base path is `/daily/`, so deployed URLs look like:

- `https://asgoncharov.com/daily/#/`
- `https://asgoncharov.com/daily/#/latest`
- `https://asgoncharov.com/daily/#/2026-05-02`

## Data Layout

```text
public/data/
  index.json
  YYYY-MM-DD/
    brief.json
    chart.png
```

`index.json` defines the latest date and archive metadata. Each `brief.json` contains the full page content for one briefing.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The static build is written to `dist/`.

## Deploy

```bash
npm run deploy
```

This builds the app and copies `dist/` into `/var/www/daily/`.

Use `deploy/Caddyfile` as the Caddy site configuration. It serves `/daily/*` from `/var/www/daily/` and falls back to `index.html` for the SPA.
