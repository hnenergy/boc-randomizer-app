# Roadmap and Project Checklist

Update this file in every completed feature branch. Check an item only after its acceptance criteria and verification are complete.

## Phase 0 — Put the current application online

- [x] Preserve the current BOC PWA prototype and behavior
- [x] Confirm the current package contains `index.html`, manifest, service worker, and icons
- [x] Replace the private roster with a generic 12-team Fantasy Football Draft example and invalidate saved drafts that use the previous roster
- [x] Display SpinOrder in the wheel hub and restore the latest selection message after refresh
- [x] Rebrand the current interface and PWA metadata as SpinOrder Draft Randomizer
- [x] Label the generic 12-team example Team A through Team L to distinguish teams from numbered draft positions
- [ ] Install the official Codex extension in VS Code and sign in
- [ ] Open the unzipped `boc-randomizer-app` folder as the active VS Code folder
- [x] Run the current application locally through an HTTP server
- [ ] Verify spin, completed draft, new draft, refresh recovery, and mobile responsive mode
- [ ] Initialize a Git repository and create the baseline commit
- [ ] Create a GitHub repository and push the baseline
- [x] Deploy the production static PWA to Vercel
- [x] Verify the production HTTPS URL in a desktop browser
- [x] Verify the production HTTPS URL in iPhone Safari
- [x] Verify **Add to Home Screen** and launch the installed PWA
- [x] Record the Vercel URL in `README.md`
- [x] Configure `https://www.spinorder.com/` as the canonical production domain with HTTPS
- [x] Redirect `https://spinorder.com/` to the canonical `www` address
- [x] Verify desktop, iPhone Safari, and custom-domain PWA behavior
- [x] Retain the original Vercel URL as a deployment fallback

**Exit:** the unchanged current application is running from a stable Vercel HTTPS URL and is installable on iPhone.

## Phase 1 — Product and repository planning

- [x] Define expanded product requirements
- [x] Define MVP architecture and privacy boundary
- [x] Create Codex repo instructions and project playbook
- [x] Choose SpinOrder as the public product name
- [x] Purchase `spinorder.com` through GoDaddy and configure GoDaddy DNS
- [ ] Verify trademark conflicts
- [ ] Decide brand colors, typography, and logo direction
- [ ] Create a GitHub project board with one issue per approved feature

### Publisher and product branding

- [x] Approve the front-facing, navy, outline elephant with two minimal eyes and a curled trunk as the **LFN Legacy Apps publisher mark**; source: [`assets/brand/lfn-legacy-apps-elephant.png`](../assets/brand/lfn-legacy-apps-elephant.png)
- [x] Record that the LFN Legacy Apps publisher mark is not the SpinOrder product logo
- [ ] Create production SVG, light, and dark versions of the LFN Legacy Apps publisher mark
- [x] Create alpha-preserving light-blue and light-gray PNG variants from the approved navy elephant source
- [x] Approve the five-section blue wheel in [`assets/brand/spinorder-logo.svg`](../assets/brand/spinorder-logo.svg) as the official SpinOrder product and website logo
- [x] Finalize the playful football favicon and PWA app icons for the current static application
- [x] Add activity-specific browser favicons while preserving the football PWA and Apple touch icons
- [ ] Revisit whether the approved SpinOrder wheel should become the favicon and PWA icon in a later release
- [x] Add the light-blue LFN Legacy Apps mark as a small publisher attribution in the dark site footer

### Post-MVP activity-neutral SpinOrder logo redesign

- [ ] Redesign the product mark around a multicolor segmented wheel and pointer with no football or activity-specific symbol
- [ ] Apply the approved redesign to the favicon, PWA icons, Apple touch icon, homepage, and social preview
- [ ] Verify the installed icon on iPhone and Android devices

**Exit:** name, domain direction, design direction, and enhancement backlog are approved.

## Phase 2 — Modern application foundation

- [x] Maintain dependency-minimal Playwright smoke tests and GitHub Actions checks for the current static application
- [ ] Create Next.js + TypeScript application in a migration branch
- [ ] Add formatting, linting, strict type checking, and test commands
- [ ] Configure Vitest, React Testing Library, and Playwright
- [ ] Build shared responsive layout and design tokens
- [ ] Add PWA manifest, icons, offline strategy, and update behavior
- [ ] Port the existing BOC wheel as a verified preset
- [ ] Add CI for lint, type-check, tests, and production build

**Exit:** the BOC preset works in the new application and all checks pass.

## Phase 3 — General event builder

- [x] Build the responsive public splash/landing page with SpinOrder and LFN Legacy Apps brand attribution
- [x] Add **Create Randomizer** call to action and in-page navigation to the existing draft randomizer
- [x] Add event-name field and accessible validation
- [x] Add Football, Baseball, Golf, Basketball, and Generic activity selection with matching randomizer icons
- [x] Add editable participant lists with a 20-name manual/example limit, a 60-name import limit, clear confirmation, and optional Team 1–Team 12 examples
- [x] Add comma/newline parsing for local name imports
- [x] Add local `.txt` and quoted `.csv` upload with header handling and a 100 KB limit
- [x] Normalize whitespace and reject blanks, case-insensitive duplicates, overlength names, or names beyond the active manual/import limit
- [x] Add Manual spin selection and show Auto spin as disabled **Coming soon**
- [x] Add Position 1 first and Last position first reveal order, lock it after the first spin, and restore editing on reset
- [x] Let users choose Draft Order, Random Order, Drawing Order, or a custom label and apply that terminology to supporting text, progress, results, completion, position labels, and reset controls while keeping the event name as the randomizer heading
- [x] Add balanced Team Assignment mode with 2–10 teams, round-robin destinations, random participant selection, grouped results, persistence, reset, and sharing/export support
- [x] Add setup/name edit controls and browser Back behavior; a separate review screen remains future work

**Exit:** a valid custom event can be created without login or network data storage.

## Phase 4 — Randomizer experience

- [ ] Extract and unit-test unbiased randomization logic
- [x] Render functional wheel labels and position-sorted results for 2–60 names
- [ ] Add theme-specific center art, pointer, colors, and accessible labels
- [x] Implement guarded manual one-spin-at-a-time mode with synchronized Current Position and Selected Position displays
- [x] Implement auto mode with a visible three-second countdown using the guarded manual spin execution path
- [x] Complete Manual and Auto Spin deterministically when only one participant and one position remain
- [x] Reconcile the completed wheel to one full-circle wedge for the final participant
- [x] Hold the penultimate result for two seconds before deterministic completion, with cancellable stale-timeout protection
- [x] Retain the landed wedge until the next spin starts while excluding it from future selection
- [x] Add accessible Pause, Resume, and Stop controls with reset, navigation, visibility, and stale-callback safety
- [x] Allow non-destructive setup and spin-mode editing, with confirmed resets for reveal-order changes
- [x] Replace the primary completed-position value with `Order Set`
- [x] Preserve cumulative wheel orientation between Manual and Auto spins
- [x] Share recalculated wedge geometry across wheel colors, labels, and landing alignment
- [x] Render wedges and labels together on a reset-safe DPR-aware canvas beneath the stationary hub and pointer
- [x] Skip wheel and result animation timing when reduced motion is requested
- [ ] Save and safely restore an active event locally
- [x] Add a confirmed Home/start-over action that clears only the active SpinOrder event
- [ ] Add completed-event replay
- [ ] Test portrait/landscape mobile layouts and long names

**Exit:** manual and auto events always produce a complete, unique order and recover from refresh.

## Phase 5 — Results and sharing

- [x] Build a completed-only Share Results panel from one position-sorted result model
- [x] Copy formatted results with Clipboard API and a cleaned-up fallback
- [x] Download UTF-8 `.txt` and formula-safe BOM-prefixed `.csv` files
- [x] Generate a branded 1080×1350 PNG locally for up to 60 results
- [x] Add Web Share API with cancellation-safe fallback behavior
- [x] Add PNG file sharing with native text/URL fallback
- [x] Add default Email, Gmail, and Yahoo Mail compose actions with long-result copy/download fallback
- [ ] Add participant email input for one-time compose action
- [ ] Open a prefilled `mailto:` email draft
- [ ] Confirm that recipients and event data are not persisted or transmitted
- [x] Add a print-friendly multi-page result layout
- [ ] Create individual public result links with an explicit privacy/retention design
- [ ] After public result links exist, add Facebook sharing
- [ ] After public result links exist, add Reddit sharing

**Exit:** results are consistently shareable without an application backend.

## Phase 6 — SEO and trust foundation

- [x] Complete the homepage SEO foundation with a title, description, canonical URL, robots directive, Open Graph/Twitter metadata, and factual WebApplication JSON-LD
- [x] Add a one-URL `sitemap.xml` and crawlable `robots.txt`
- [x] Create a dedicated 1200 x 630 social-preview image and add `og:image`/Twitter image metadata
- [ ] Add additional Organization, WebSite, or SoftwareApplication structured data only where accurate and useful
- [ ] Publish a How It Works page
- [x] Publish indexable About, Privacy, and Contact pages with consistent navigation
- [ ] Publish a Terms page
- [x] Publish an indexable fantasy-football draft-order randomizer page with an allowlisted Football/Draft Order preset
- [x] Publish a useful golf-group randomizer landing page
- [x] Publish an indexable Random Team Generator landing page with the allowlisted Team Assignment preset
- [x] Add the Classroom activity with Name Picker terminology and publish an indexable Classroom Name Picker page
- [x] Publish an indexable Random Drawing Order Generator page using the existing Drawing Order mode
- [x] Complete the first SEO use-case collection: fantasy football, teams, golf groups, classroom names, and drawing order
- [x] Link every homepage use-case chip to its matching indexable landing page
- [ ] Evaluate a true Giveaway Winner Picker separately, including any entrant, eligibility, and prize-administration requirements
- [ ] Add internal links among use-case pages and the event builder
- [ ] Verify semantic headings, image text alternatives, and Core Web Vitals
- [ ] Connect Google Search Console and submit sitemap
- [x] Integrate Vercel Web Analytics for standard anonymous page views only, with no custom events or event-name/participant capture

**Exit:** the site is crawlable, trustworthy, measurable, and ready for content growth.

## Phase 7 — Enhanced application release

- [ ] Use the existing Vercel project for preview deployments
- [ ] Run production build and complete desktop/mobile QA
- [ ] Deploy production application over HTTPS
- [x] Buy and connect the approved custom domain
- [x] Verify GoDaddy DNS, Vercel **Valid Configuration** status for both domains, SSL, and the apex-to-`www` redirect
- [ ] Verify sitemap and analytics
- [x] Test HTTPS, desktop, iPhone Safari, and Add to Home Screen on the live custom domain
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
