# Repository Instructions

## Product

Build a trustworthy, fast, free randomizer for one-time events. The application must work without login and must not require a backend for its core workflow.

Preserve the BOC fantasy-football draft as a preset. In that preset, picks run from #12 to #1, one participant is removed per selection, and #1 is a draft position—not a champion.

## Required workflow

Before editing:

1. Read `README.md` and the relevant files in `docs/`.
2. State the feature's acceptance criteria.
3. Inspect existing code and tests.
4. Make the smallest coherent change.
5. Run format, lint, type-check, unit tests, build, and relevant end-to-end tests.
6. Review the diff and report what changed, what passed, and any remaining risk.

## Engineering rules

- Use TypeScript with strict mode; avoid `any`.
- Keep randomization logic in pure, tested functions separate from animation.
- Use `crypto.getRandomValues()` with rejection sampling; do not use modulo-biased selection.
- Support 2–25 normalized, unique participant names.
- Treat pasted, comma-delimited, newline-delimited, `.txt`, and `.csv` input consistently.
- Never upload participant names in the MVP. Store only the active event in browser storage.
- Never claim an email was sent when using `mailto:`; say the email app was opened with a prepared draft.
- Respect `prefers-reduced-motion` and keep the complete workflow keyboard accessible.
- Keep ads away from the wheel, form controls, navigation, and result actions.
- Avoid layout shift by reserving space for any ad slot.
- Do not add trackers, cookies, a database, authentication, or paid services without an approved product decision.
- Never commit secrets or `.env*` files containing values.

## Definition of done

- Acceptance criteria are covered by tests where practical.
- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass.
- Relevant Playwright flows pass at desktop and iPhone-sized viewports.
- Empty, duplicate, oversized, malformed-file, refresh, and completed-event states are checked.
- Metadata, canonical URL, social preview, sitemap, and robots behavior remain valid for public pages.
- Documentation and the checklist are updated in the same change.

