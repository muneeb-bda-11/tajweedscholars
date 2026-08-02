# Tajweed Scholars website

Production marketing website for Tajweed Scholars, built with React 19, Vite, TypeScript, and Tailwind CSS.

## Architecture

- `src/` contains the React application, route components, shared configuration, and client-side routing.
- `scripts/prerender.tsx` renders every configured public route into route-specific HTML under `dist/` after Vite builds the client assets. It uses React's server renderer and Node APIs already in the project, without a separate prerendering dependency.
- `scripts/validate-seo.ts` verifies all 22 generated routes, including unique metadata, canonicals, social metadata, one H1, one main landmark, meaningful initial HTML, and valid internal links.
- `api/trial-leads.ts` is the Vercel serverless boundary for Free Trial submissions. It validates the payload before forwarding it to the configured Apps Script endpoint.
- `apps-script/` contains the separately deployed admissions webhook and its operational documentation.

## Local development

Prerequisite: a supported Node.js release and npm.

```sh
npm install
npm run dev
```

The development server runs at `http://localhost:3000` by default. Public browsing does not require environment variables. Trial submission forwarding requires the server-side values documented in `.env.example`; never expose those values through Vite client variables or commit real secrets.

## Automated CI and validation

GitHub Actions runs the following exact gates for every pull request targeting `main` and every push to `main`, using Node 22, npm caching, and `npm ci`:

```sh
npm run lint
npm test
npm run build
npm run validate:seo
git diff --check
```

`npm run build` creates the Vite bundle, prerenders all 22 public routes, and validates their generated HTML, metadata, canonicals, landmarks, and production-safe URLs. `npm run validate:seo` remains a separate CI gate so an already-built output can be checked directly. Existing tests preserve real 404 behavior and canonical non-trailing routes.

For an optional local responsive audit, run `node scripts/audit-responsive.mjs`. It uses an installed Chromium-family browser and writes generated screenshots and measurements only below `.artifacts/`.

## Production verification

Run the dependency-free, read-only production smoke test with:

```sh
npm run verify:production
```

It sends only GET requests, never submits a form or changes remote data, and checks all 22 production routes plus robots, sitemap, 404, canonical redirects, and the API method guard. No secrets are required.

## Vercel deployment

The repository is configured for Vercel with clean URLs and no trailing slash.

- Build command: `npm run build`
- Output directory: `dist`
- Serverless function: `api/trial-leads.ts`
- Required production secrets: `APPS_SCRIPT_WEB_APP_URL` and `APPS_SCRIPT_API_SECRET`

Normal releases should deploy from the intended Git branch through the connected Vercel project. Confirm the production environment variables before releasing; do not put webhook URLs or secrets in source control.

## Manual deployment fallback

If automatic Git deployment is unavailable, create or redeploy the intended revision from the Vercel dashboard using the same build command, output directory, domain configuration, and server-side environment variables above. A static upload of `dist/` alone is incomplete because it omits the `/api/trial-leads` serverless function. After a manual release, verify the canonical domain, redirects, all public routes, `/robots.txt`, `/sitemap.xml`, the API's `405` response to `GET`, and a designated non-production trial submission before reopening admissions.
