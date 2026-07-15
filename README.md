# Plan Your Care

Plan Your Care is a healthcare discovery app for finding reproductive healthcare information, nearby clinics, and state-level resources.

## Live Demo

Devpost: https://devpost.com/software/planurcare

## Screenshots

![Plan Your Care interface](docs/images/plan-your-care.png)

## Tech Stack

- Runtime and package manager: Bun workspaces
- Frontend: React, Vite, Tailwind CSS, TanStack Router, TanStack Query
- Backend: Bun and Hono
- Data: Redis with bundled read-only fallback data
- Maps: Google Maps APIs
- Integrations: EmailJS

## Features

- State-level reproductive healthcare information.
- Interactive map UI.
- Local clinic locator.
- Resource pages for care options and policy context.
- Chat-style guidance flow.
- Backend API for application data.

## Recognition

Plan Your Care received Best Overall and Best Use of MongoDB at WingHacks.

## Why I Built This

The project was built during WingHacks to make reproductive healthcare information easier to understand and navigate. The goal was to combine resource discovery, location search, and clear state-level context into one approachable app.

## My Role

I worked across the React frontend, map experience, resource presentation, backend API, and data structure for state and clinic information.

## Architecture

- `frontend` owns the Vite/React app, TanStack routes and queries, map interface, and Bun static/proxy server.
- `backend` owns the Hono API, Redis connection, and bundled state/clinic reference data.
- The browser always calls same-origin `/api`. Vite proxies it in development and the Bun web server proxies it in production.

## Hard Parts

- Turning sensitive healthcare information into an interface that felt clear and navigable.
- Combining map search, resource pages, and chat-style guidance without making the app feel fragmented.
- Building a useful product quickly within a hackathon time limit.

## What I Learned

- Public-interest apps need careful wording and simple navigation because users may arrive with urgent questions.
- Hackathon products benefit from a narrow core workflow and a clear product name.
- Keeping seed data structured makes map and resource features easier to iterate on.

## Running Locally

Requirements: Bun 1.3 or newer. Redis is optional locally; without `REDIS_URL`, the API uses the bundled read-only datasets.

```bash
git clone https://github.com/mattcattb/Winghacks.git
cd Winghacks
cp .env.example .env
bun install
bun run dev
```

The web app runs at `http://localhost:5173` and proxies API requests to `http://localhost:3000`.

Useful commands:

```bash
bun run dev:api
bun run dev:web
bun run typecheck
bun run test
bun run build
```

Set `VITE_GEOCODING_API_KEY` in `.env` to enable Google Maps and Places features.

## Railway Deployment

Create three services in one Railway project: `web`, `api`, and a Railway Redis database. Connect `web` and `api` to this repository without setting a root directory.

For `api`:

- Config file path: `/railway.api.json`
- `PORT=3000`
- `REDIS_URL=${{Redis.REDIS_URL}}` (use the actual Redis service name)
- `CORS_ORIGINS` is optional because browser traffic goes through the web proxy

For `web`:

- Config file path: `/railway.web.json`
- `API_URL=http://${{api.RAILWAY_PRIVATE_DOMAIN}}:3000` (use the actual API service name)
- `VITE_GEOCODING_API_KEY` set to the browser-restricted Google Maps key
- Generate the public domain on this service only

The two config files select their Dockerfiles, health checks, restart behavior, and watch paths. The web service serves the SPA and forwards `/api/*` over Railway private networking, so no public API domain or browser CORS hop is required.

## Data Note

The state-law and clinic datasets were carried over from the hackathon project so the port remains usable. This information changes frequently and must be reviewed and refreshed before the site is presented as current medical or legal guidance.

## Project Notes

The repository name is still `Winghacks`, but the clearer project name is `Plan Your Care`. The README uses the product name so the repo reads better from GitHub and portfolio links.
