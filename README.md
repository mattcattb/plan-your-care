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
bun run --cwd backend seed:care-data
```

Set `VITE_GEOCODING_API_KEY` in `.env` to enable Google Maps and Places features.

## Railway Deployment

Import the repository as a Bun monorepo, then add a Railway Redis database. Railway creates the `@plan-your-care/web` and `@plan-your-care/api` workspace services automatically. The service-local `railway.json` files configure health checks and restart behavior.

For `@plan-your-care/api`:

- `PORT=3000`
- `REDIS_URL=${{Redis.REDIS_URL}}` (use the actual Redis service name)
- `CORS_ORIGINS` is optional because browser traffic goes through the web proxy

For `@plan-your-care/web`:

- `PORT=4173`
- `API_URL=http://plan-your-careapi.railway.internal:3000`
- `VITE_GEOCODING_API_KEY` set to the browser-restricted Google Maps key
- Generate the public domain on this service only

The web service serves the SPA and forwards `/api/*` over Railway private networking, so no public API domain or browser CORS hop is required. The root Docker and Railway config files remain available for manual service creation, but the automatic Bun monorepo import does not require them.

Current deployment: https://plan-your-careweb-production.up.railway.app

## Care Data

The bundled care-resource snapshot contains separately classified Title X family-planning clinics and HRSA-supported general health centers. Refresh it from the public source data with `bun run --cwd backend seed:care-data`. The importer records source URLs and a retrieval timestamp, and Redis is populated from the snapshot when the API starts.

- `GET /api/clinics/resources?state=FL&type=title-x`
- `GET /api/clinics/resources/nearby?lat=29.65&lng=-82.32&type=title-x&maxDistance=80000`

The original hackathon abortion-provider list remains separate because a Title X or HRSA location must not be represented as offering abortion care without provider-level verification. The state-law dataset also requires a dedicated recurring source review before it should be presented as current legal guidance.

## Project Notes

The repository name is still `Winghacks`, but the clearer project name is `Plan Your Care`. The README uses the product name so the repo reads better from GitHub and portfolio links.
