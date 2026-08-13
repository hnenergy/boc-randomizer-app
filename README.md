# Randomizer App

A free, installable web application for creating fair randomized orders for fantasy drafts, golf groups, sports competitions, classroom activities, giveaways, and other events.

The current prototype is the **BOC Randomizer**, a 12-team fantasy-football draft picker. This repository is being evolved into a reusable public product.

## Product status

- Current: static installable PWA prototype in `index.html`
- Next: migrate to Next.js + TypeScript and implement the general event builder
- Hosting target: Vercel
- Data model: no accounts and no server-side event storage in the MVP
- Monetization target: free app supported by privacy-conscious display ads after traffic and policy eligibility are established

See [docs/ROADMAP.md](docs/ROADMAP.md) for the working checklist and [docs/DEVELOPMENT_PLAYBOOK.md](docs/DEVELOPMENT_PLAYBOOK.md) for the step-by-step build process.

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
- [Roadmap and checklist](docs/ROADMAP.md)
- [Development playbook](docs/DEVELOPMENT_PLAYBOOK.md)
- [SEO, growth, and monetization](docs/SEO_MONETIZATION.md)
- [Deployment and domain setup](docs/DEPLOYMENT.md)

## Working agreement

All implementation work should follow [AGENTS.md](AGENTS.md). Each feature is complete only when acceptance criteria pass, automated checks pass, and the mobile experience is manually verified.

