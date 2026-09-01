# SEO, Growth, and Monetization Plan

## Principle

The interactive wheel alone is unlikely to rank broadly. Organic traffic needs fast public pages that satisfy specific search intent and provide genuinely useful instructions, presets, examples, and answers. SEO begins in architecture and content—not with keyword stuffing after launch.

## Initial search-intent clusters

| Cluster | Primary page idea | User need |
| --- | --- | --- |
| Fantasy football | Fantasy Football Draft Order Randomizer | Assign fair draft positions |
| Golf | Golf Group Randomizer | Randomly create play order/groups |
| Teams | Random Team Order Generator | Randomize team or participant order |
| Classroom | Classroom Name Randomizer | Select or order students fairly |
| Giveaways | Giveaway Name Picker | Pick a random winner/order |

Only publish a page when it has distinct value. Do not generate dozens of near-duplicate doorway pages.

## Technical SEO checklist

- [x] Static, crawlable homepage content and semantic splash-page heading
- [x] One useful title and meta description for the canonical homepage
- [x] Canonical HTTPS homepage URL with the preferred `www` hostname
- [x] One-URL XML sitemap and accurate robots rules
- [x] Descriptive Open Graph and Twitter text metadata
- [x] Accurate WebApplication structured data without ratings or unsupported claims
- [x] Dedicated 1200 x 630 social-preview image and corresponding Open Graph/Twitter image metadata
- Fast fonts/images, minimal client JavaScript on content pages, and stable layouts
- Accessible controls, meaningful link text, and strong mobile usability
- Noindex the private active-event route if it has no standalone search value
- Internal links from guides/use-case pages to the correct preset
- Search Console verification and sitemap submission

The checked items above comprise the static SEO foundation batch. Search Console and instructional video content remain future work.

The public About, Privacy, and Contact pages are now available and included in the sitemap. How It Works and Terms remain future trust/content work.

## Content launch set

Before public promotion, publish:

1. Home page
2. How the randomization works and why it is fair
3. [Fantasy-football draft-order guide/preset](../fantasy-football-draft-order-randomizer/)
4. Golf-group/order guide/preset
5. [Random Team Generator guide/preset](../random-team-generator/)
6. About, Contact, Privacy, and Terms

Each use-case page should explain the problem, offer a usable preset immediately, give concise instructions, answer real questions, and link to related tools naturally.

## Measurement

Vercel Web Analytics is integrated through its static HTML script for standard anonymous page views only. The current application does not add custom analytics events, cookies, advertising trackers, or Google Analytics, and it does not send event names, participant names, or results to analytics.

Potential future product-safe events, if separately approved, include:

- Landing page viewed
- Create flow started
- Event started (participant count bucket only, never names)
- Event completed
- Share method used
- PWA install prompt accepted where measurable

Never send event names, participant names, email addresses, or results to analytics. The future-event list above is planning material and is not implemented by the current integration.

Use Search Console to review impressions, clicks, queries, indexing, and page performance. Use analytics to find conversion friction. Review monthly at first; avoid reacting to daily noise.

## Traffic playbook

1. Launch the strongest three use cases, not every imaginable category.
2. Share with real fantasy-football and golf groups and observe task completion.
3. Improve pages based on questions and failures from real users.
4. Earn relevant links through genuinely useful league/community resources; do not buy links.
5. Add a new use case only when research and feedback show distinct demand.
6. Refresh content when rules, screenshots, or user needs change.

## Ads plan

Do not add ads to the initial MVP. First establish a stable site, original content, trust pages, analytics, and meaningful traffic.

When ready:

- Review the current ad network policies and eligibility requirements.
- Add consent/privacy controls required for the target regions.
- Reserve fixed ad dimensions to prevent layout shift.
- Keep ads outside the wheel, event form, spin button, auto countdown, and result actions.
- Never style ads as app buttons or place them where accidental taps are likely.
- Measure completion rate, Core Web Vitals, and revenue before and after rollout.
- Remove or relocate placements that harm task completion or trust.

Revenue is not guaranteed. Display ads usually become meaningful only with sustained traffic, so the early success metrics are completed events, returning visitors, organic impressions, and shares.

## Domain and brand criteria

The public name should be memorable, easy to spell aloud, broad enough for sports and non-sports uses, and legally defensible. Prefer `.com`; consider `.app` only when HTTPS hosting and the name justify it.

Before buying:

- Check live registrar availability
- Search the web and relevant trademark database for conflicts
- Check matching social handles if they matter
- Avoid hyphens, confusing spellings, and names limited to football
- Buy through an established registrar with two-factor authentication and auto-renew

Domain availability must be verified at purchase time; do not rely on a static document or an old search result.
