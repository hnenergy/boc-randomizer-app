# SpinOrder

A free, installable web application for creating fair randomized orders for fantasy drafts, golf groups, sports competitions, classroom activities, giveaways, and other events.

The current static PWA opens on a responsive SpinOrder landing page, collects event settings, accepts 2–20 manually entered names or 2–60 names from a local `.txt`/`.csv` import, and then creates the randomizer. Terminology choices are Draft Order, Random Order, Drawing Order, or a custom label. Manual mode spins once per click; Auto Spin starts immediately and continues after a visible three-second countdown with Pause, Resume, and Stop controls. Setup can be edited without losing results unless the reveal direction changes, which requires confirmation before resetting the assignments. When Auto Spin leaves only one participant and one position, it completes that deterministic final assignment without another countdown or wheel animation. Current Position and Selected Position stay synchronized during the event and display `Order Set` when every position is assigned. Example names are available on request as `Team 1` through `Team 12` but are never loaded automatically.

## Live application

The canonical production application is [www.spinorder.com](https://www.spinorder.com/). The apex address, [spinorder.com](https://spinorder.com/), redirects to the canonical `www` address.

The original [boc-randomizer-app.vercel.app](https://boc-randomizer-app.vercel.app/) deployment remains available as a fallback.

## Product status

- Public product name: SpinOrder
- Current interface: SpinOrder landing page, setup form, participant entry, and a dynamic randomizer supporting 20 manual or 60 imported names
- Production: `https://www.spinorder.com/` on Vercel
- Next: migrate to Next.js + TypeScript and implement the general event builder
- Domain registration and DNS: GoDaddy
- Hosting: Vercel; both custom domains show **Valid Configuration**
- Data model: no accounts and no server-side event storage in the MVP
- Monetization target: free app supported by privacy-conscious display ads after traffic and policy eligibility are established

See [docs/ROADMAP.md](docs/ROADMAP.md) for the working checklist and [docs/DEVELOPMENT_PLAYBOOK.md](docs/DEVELOPMENT_PLAYBOOK.md) for the step-by-step build process.

## Brand architecture

LFN Legacy Apps is the publisher of SpinOrder. Its approved publisher mark is a minimal, front-facing navy elephant outline with two eyes and a curled trunk, stored at [`assets/brand/lfn-legacy-apps-elephant.png`](assets/brand/lfn-legacy-apps-elephant.png). It is not the SpinOrder product logo.

The official SpinOrder product and website logo is the five-section blue wheel stored at [`assets/brand/spinorder-logo.svg`](assets/brand/spinorder-logo.svg). Browser tabs use a favicon matching the configured Football, Baseball, Golf, Basketball, or Generic activity. The installed PWA, Apple touch icon, and default product installation branding remain the approved playful football. The footer uses the mechanically recolored light-blue LFN Legacy Apps publisher mark; the original navy PNG remains the approved geometry source. A production elephant SVG and additional production light/dark treatments remain future work. See [Brand architecture](docs/BRAND.md) for the recorded decisions.

## Current prototype

Run a local static server from this directory:

```bash
npx serve .
```

Opening `index.html` directly will not fully test service workers or PWA installation.

Run the dependency-free tests with:

```bash
node --test tests/*.test.js
```

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
