# Product Requirements Document

## Working product definition

**SpinOrder** is a free, no-login web application that creates a randomized order for almost any event. Examples include fantasy-football drafts, golf groupings, baseball or basketball activities, classroom order, giveaways, and generic competitions.

The approved public brand is **SpinOrder**, with `https://www.spinorder.com/` as the canonical production URL. The current deployed interface is **SpinOrder Draft Randomizer**; the BOC football preset remains part of the planned reusable product.

## Goals

- Let a first-time visitor create and complete an event without instructions or an account.
- Make the outcome feel fair, transparent, entertaining, and easy to share.
- Work well on iPhone, Android, tablet, and desktop.
- Be indexable, fast, and useful enough to earn organic search traffic.
- Keep the core experience free and eventually fund it with unobtrusive ads.

## Non-goals for MVP

- User accounts or login
- Cloud-saved events or participant databases
- Real-time multiplayer viewing
- Guaranteed email delivery from the application
- Payments, subscriptions, or paid tiers
- AI-generated results or a backend randomization service

## Primary user flow

1. Visitor lands on a page explaining that the app is free and suitable for many activities.
2. Visitor selects **Create Randomizer**.
3. Visitor enters an event name.
4. Visitor chooses Football, Baseball, Golf, Basketball, or Generic.
5. Visitor enters 2–25 participant names by typing/pasting or uploading `.txt`/`.csv`.
6. Visitor chooses Manual Spin or Auto Spin.
7. Visitor reviews the event and starts it.
8. The app assigns one position per spin and removes the selected name.
9. Auto mode waits three seconds after a result is announced before the next spin begins.
10. Visitor copies, downloads, shares, prints, or opens an email draft containing the final results.
11. Visitor may start over; no account or server-side record remains.

## Functional requirements

### Landing page

- Clear headline, concise explanation, examples, and primary **Create Randomizer** button
- Explain “free,” “no login,” “private on this device,” and “up to 25 names”
- Links to focused use-case pages and trust/legal pages

### Event builder

- Event name: required, 1–80 characters
- Theme: Football, Baseball, Golf, Basketball, Generic
- Names: minimum 2, maximum 25 after normalization
- Add/remove/reorder names before starting
- Accept typing, paste, comma/newline input, `.txt`, and simple `.csv`
- Trim whitespace, remove blank values, flag duplicates, and show an actionable error
- Mode: Manual or Auto
- Rank direction: `1 → N` by default; BOC preset uses `N → 1`
- Review screen before starting

### Randomization

- Use unbiased browser cryptography for selection
- Selection logic must be independent of animation duration
- One participant is selected and removed per round
- Manual mode requires a user action for each round
- Auto mode pauses for three visible seconds between completed result and next spin
- Pause/cancel auto mode at any time
- Persist active event and results locally to recover from refresh
- “Start Over” must clearly erase the active local event after confirmation

### Results and sharing

- Display event name, date, theme, and complete ordered result
- Copy to clipboard
- Download results as `.txt` or `.csv`
- Use Web Share API where available
- Email MVP: open the device email client using `mailto:` with prefilled subject/body
- Accept multiple participant email addresses only for composing the draft; do not store them
- Provide a clear fallback when no email handler is available

### PWA and quality

- Installable on supported devices and usable after the first successful load
- Responsive down to 320px width
- Keyboard accessible, screen-reader labeled, and reduced-motion friendly
- Target Lighthouse scores: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+
- Public content pages render meaningful HTML without waiting for client JavaScript

## Privacy requirements

- Core event data stays in the browser
- No participant data is sent to a server in MVP
- Publish Privacy Policy, Terms, Contact, and About pages before ads
- Analytics must avoid collecting participant names or event contents
- Any later automated-email feature requires explicit consent, abuse prevention, retention rules, and a separate architecture review

## Acceptance criteria for MVP

- A new visitor can complete a 2-name and a 25-name event on mobile and desktop.
- Manual and auto modes produce exactly one unique position per participant.
- Auto mode allows pause and observes a three-second inter-spin countdown.
- Reloading during an event restores a valid state.
- Invalid and duplicate inputs never start an event.
- Uploaded `.txt` and simple `.csv` files are parsed locally.
- Sharing actions produce the same order shown on screen.
- No network request contains names, emails, event titles, or results.
