# SpinOrder

A free, installable web application for creating fair randomized orders for fantasy drafts, golf groups, sports competitions, classroom activities, giveaways, and other events.

The current static PWA opens on a responsive SpinOrder landing page and leads into the **SpinOrder Draft Randomizer**, a generic 12-team Fantasy Football Draft example using `Team A` through `Team L`. The general event setup form remains future work.

## Live application

The canonical production application is [www.spinorder.com](https://www.spinorder.com/). The apex address, [spinorder.com](https://spinorder.com/), redirects to the canonical `www` address.

The original [boc-randomizer-app.vercel.app](https://boc-randomizer-app.vercel.app/) deployment remains available as a fallback.

## Product status

- Public product name: SpinOrder
- Current interface: SpinOrder landing page plus the SpinOrder Draft Randomizer static PWA with a generic 12-team Fantasy Football Draft example
- Production: `https://www.spinorder.com/` on Vercel
- Next: migrate to Next.js + TypeScript and implement the general event builder
- Domain registration and DNS: GoDaddy
- Hosting: Vercel; both custom domains show **Valid Configuration**
- Data model: no accounts and no server-side event storage in the MVP
- Monetization target: free app supported by privacy-conscious display ads after traffic and policy eligibility are established

See [docs/ROADMAP.md](docs/ROADMAP.md) for the working checklist and [docs/DEVELOPMENT_PLAYBOOK.md](docs/DEVELOPMENT_PLAYBOOK.md) for the step-by-step build process.

## Brand architecture

LFN Legacy Apps is the publisher of SpinOrder. Its approved publisher mark is a minimal, front-facing navy elephant outline with two eyes and a curled trunk, stored at [`assets/brand/lfn-legacy-apps-elephant.png`](assets/brand/lfn-legacy-apps-elephant.png). It is not the SpinOrder product logo.

The official SpinOrder product and website logo is the five-section blue wheel stored at [`assets/brand/spinorder-logo.svg`](assets/brand/spinorder-logo.svg). The current static application uses a playful football icon as its favicon and PWA app icon. Future activity themes may receive their own theme-specific icons. The LFN Legacy Apps mark is intended for subtle publisher attribution, such as in the site footer. Production SVG and light/dark versions of the publisher mark remain future work. See [Brand architecture](docs/BRAND.md) for the recorded decisions.

## Current prototype

Run a local static server from this directory:

```bash
npx serve .
```

Opening `index.html` directly will not fully test service workers or PWA installation.

## Planned development stack

- Next.js (App Router)
- React + TypeScript
- CSS Modules or Tailwind CSS
- Vitest + React Testing Library
- Playwright for end-to-end tests
- Vercel for preview and production deployments
- Vercel Web Analytics or another consent-conscious analytics provider

## Documentation

- [Product requirements](docs/PRODUCT_REQUIREMENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Brand architecture](docs/BRAND.md)
- [Roadmap and checklist](docs/ROADMAP.md)
- [Development playbook](docs/DEVELOPMENT_PLAYBOOK.md)
- [SEO, growth, and monetization](docs/SEO_MONETIZATION.md)
- [Deployment and domain setup](docs/DEPLOYMENT.md)

## Working agreement

All implementation work should follow [AGENTS.md](AGENTS.md). Each feature is complete only when acceptance criteria pass, automated checks pass, and the mobile experience is manually verified.
