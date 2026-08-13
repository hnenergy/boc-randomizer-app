# Roadmap and Project Checklist

Update this file in every completed feature branch. Check an item only after its acceptance criteria and verification are complete.

## Phase 0 — Put the current application online

- [x] Preserve the current BOC PWA prototype and behavior
- [x] Confirm the current package contains `index.html`, manifest, service worker, and icons
- [ ] Install the official Codex extension in VS Code and sign in
- [ ] Open the unzipped `boc-randomizer-app` folder as the active VS Code folder
- [ ] Run the current application locally through an HTTP server
- [ ] Verify spin, completed draft, new draft, refresh recovery, and mobile responsive mode
- [ ] Initialize a Git repository and create the baseline commit
- [ ] Create a GitHub repository and push the baseline
- [x] Deploy the production static PWA to Vercel
- [x] Verify the production HTTPS URL in a desktop browser
- [x] Verify the production HTTPS URL in iPhone Safari
- [x] Verify **Add to Home Screen** and launch the installed PWA
- [x] Record the Vercel URL in `README.md`

**Exit:** the unchanged current application is running from a stable Vercel HTTPS URL and is installable on iPhone.

## Phase 1 — Product and repository planning

- [x] Define expanded product requirements
- [x] Define MVP architecture and privacy boundary
- [x] Create Codex repo instructions and project playbook
- [ ] Choose the public product name
- [ ] Shortlist and verify domain availability and trademark conflicts
- [ ] Decide brand colors, typography, and logo direction
- [ ] Create a GitHub project board with one issue per approved feature

**Exit:** name, domain direction, design direction, and enhancement backlog are approved.

## Phase 2 — Modern application foundation

- [ ] Create Next.js + TypeScript application in a migration branch
- [ ] Add formatting, linting, strict type checking, and test commands
- [ ] Configure Vitest, React Testing Library, and Playwright
- [ ] Build shared responsive layout and design tokens
- [ ] Add PWA manifest, icons, offline strategy, and update behavior
- [ ] Port the existing BOC wheel as a verified preset
- [ ] Add CI for lint, type-check, tests, and production build

**Exit:** the BOC preset works in the new application and all checks pass.

## Phase 3 — General event builder

- [ ] Build the public splash/landing page
- [ ] Add **Create Randomizer** call to action
- [ ] Add event-name field and validation
- [ ] Add Football, Baseball, Golf, Basketball, and Generic themes
- [ ] Add editable 2–25 name list
- [ ] Add comma/newline paste support
- [ ] Add local `.txt` and simple `.csv` upload
- [ ] Normalize blanks/whitespace and reject duplicates or more than 25 names
- [ ] Add manual vs auto mode selection
- [ ] Add ascending vs descending rank direction
- [ ] Let users choose Draft, Order, Grouping, Lineup, Draw, or a custom activity label; use the selected terminology instead of hard-coded "Draft" wording in headings, buttons, status messages, results, downloads, sharing, print output, and email drafts, with the BOC football preset defaulting to Draft
- [ ] Add review screen and edit/back behavior

**Exit:** a valid custom event can be created without login or network data storage.

## Phase 4 — Randomizer experience

- [ ] Extract and unit-test unbiased randomization logic
- [ ] Render readable wheel labels for 2–25 names
- [ ] Add theme-specific center art, pointer, colors, and accessible labels
- [ ] Implement manual one-spin-at-a-time mode
- [ ] Implement auto mode with visible three-second countdown
- [ ] Add pause, resume, and cancel controls
- [ ] Add reduced-motion behavior
- [ ] Save and safely restore an active event locally
- [ ] Add start-over confirmation and completed-event replay
- [ ] Test portrait/landscape mobile layouts and long names

**Exit:** manual and auto events always produce a complete, unique order and recover from refresh.

## Phase 5 — Results and sharing

- [ ] Build final result screen
- [ ] Copy formatted results
- [ ] Download `.txt` and `.csv`
- [ ] Add Web Share API with fallback
- [ ] Add participant email input for one-time compose action
- [ ] Open a prefilled `mailto:` email draft
- [ ] Confirm that recipients and event data are not persisted or transmitted
- [ ] Add print-friendly result layout

**Exit:** results are consistently shareable without an application backend.

## Phase 6 — SEO and trust foundation

- [ ] Add unique titles, descriptions, canonical URLs, and social images
- [ ] Add `sitemap.xml` and `robots.txt`
- [ ] Add Organization/WebSite/SoftwareApplication structured data where accurate
- [ ] Publish How It Works, About, Contact, Privacy, and Terms pages
- [ ] Publish useful football, golf, and generic team-randomizer landing pages
- [ ] Add internal links among use-case pages and the event builder
- [ ] Verify semantic headings, image text alternatives, and Core Web Vitals
- [ ] Connect Google Search Console and submit sitemap
- [ ] Add privacy-conscious analytics with no event-name/participant capture

**Exit:** the site is crawlable, trustworthy, measurable, and ready for content growth.

## Phase 7 — Enhanced application release

- [ ] Use the existing Vercel project for preview deployments
- [ ] Run production build and complete desktop/mobile QA
- [ ] Deploy production application over HTTPS
- [ ] Buy and connect the approved custom domain
- [ ] Verify DNS, SSL, canonical redirects, sitemap, and analytics
- [ ] Test iPhone Safari and Add to Home Screen on the live domain
- [ ] Run Lighthouse and resolve release-blocking issues
- [ ] Create tagged `v1.0.0` release and rollback notes

**Exit:** public v1 is live, monitored, installable, and recoverable.

## Phase 8 — Traffic and monetization

- [ ] Publish an initial cluster of genuinely useful use-case guides
- [ ] Create a repeatable monthly Search Console/content review
- [ ] Gather real user feedback and prioritize retention improvements
- [ ] Confirm ad-network eligibility, consent, privacy, and ads.txt requirements
- [ ] Design reserved, non-intrusive ad slots away from controls
- [ ] Add ads only after traffic and policy readiness justify them
- [ ] Measure revenue, page speed, layout shift, and task completion after launch

**Exit:** growth is evidence-led and ads do not compromise trust or usability.

## Future candidates—not MVP

- Shareable result links
- Live participant viewing
- Saved templates/accounts
- Automated transactional email
- Group/team generation with constraints
- Embeddable randomizer widget
- Internationalization
