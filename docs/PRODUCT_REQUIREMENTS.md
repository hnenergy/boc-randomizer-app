# Product Requirements Document

## Working product definition

**SpinOrder** is a free, no-login web application that creates a randomized order for almost any event. Examples include fantasy-football drafts, golf groupings, baseball or basketball activities, classroom order, giveaways, and generic competitions.

The approved public brand is **SpinOrder**, with `https://www.spinorder.com/` as the canonical production URL. The current static interface includes the landing page, event setup, local participant entry/import, and a dynamic randomizer supporting 20 manual or 60 imported names.

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
5. Visitor enters 2–20 names manually or imports 2–60 from `.txt`/`.csv`.
6. Visitor chooses Manual Spin or Auto Spin.
7. Visitor reviews the event and starts it.
8. The app assigns one position per spin and removes the selected name.
9. Auto mode waits three seconds after a result is announced before the next spin begins.
10. Visitor copies, downloads, shares, prints, or opens an email draft containing the final results.
11. Visitor may start over; no account or server-side record remains.

## Functional requirements

### Landing page

- Clear headline, concise explanation, examples, and primary **Create Randomizer** button
- Explain “free,” “no login,” “private on this device,” and the manual/import name limits
- Links to focused use-case pages and trust/legal pages

### Event builder

- Event name: required, 1–80 characters
- Theme: Football, Baseball, Golf, Basketball, Generic
- Order terminology: Draft Order, Random Order, Drawing Order, or a custom label up to 30 characters; Random Order is the default
- Setup selections are stored only for the current browser session
- Reveal order: Position 1 first or Last position first; Last position first is the default. Changing direction after results exist requires confirmation and resets results while preserving participants.
- Manual spin is the default. Auto Spin starts immediately, then continues after a visible three-second countdown and provides Pause, Resume, and Stop controls.
- Spin mode remains editable after results exist; switching modes preserves results, cancels automation, and never starts Auto Spin automatically.
- Names: minimum 2; maximum 20 for manual/example lists or 60 for imported lists after normalization
- Name length: maximum 50 characters
- Add/remove/reorder names before starting
- Accept typing, paste, comma/newline input, `.txt`, and simple `.csv`
- Trim whitespace, remove blank values, flag duplicates, and show an actionable error
- Accept local `.txt` and `.csv` files up to 100 KB, including quoted CSV values and optional Name, Participant, or Team headers; never upload or retain source files
- Store the working participant list only in versioned browser-session storage
- Mode: Manual or Auto
- Reveal order controls whether positions are assigned `1 → N` or `N → 1`; results remain sorted by position
- Current Position and Selected Position use one active-position state: both begin on the first assignable position, advance together only when a spin is accepted, and display `Order Set` after completion while retaining the final position internally
- Review screen before starting

### Randomization

- Use unbiased browser cryptography for selection
- Selection logic must be independent of animation duration
- One participant is selected and removed per round
- Manual mode requires a user action for each round
- While a manual spin is active, both position displays identify that spin's position and the live status announces “Spinning for position X”; repeat clicks cannot start another round
- Auto mode pauses for three visible seconds between completed results that still require a random selection; when one participant and one position remain, it assigns them directly without another countdown, animation, or spin sound
- Pause/cancel auto mode at any time
- Pausing during a spin allows that result to complete but prevents the next countdown; resuming always starts a fresh three-second countdown
- Hiding the page or navigating away pauses automation, and restored sessions never restart it automatically
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

- A new visitor can complete a 2-name, 20-name manual, and 60-name imported event on mobile and desktop.
- Manual and auto modes produce exactly one unique position per participant.
- Auto mode allows pause and observes a three-second inter-spin countdown.
- Reloading during an event restores a valid state.
- Invalid and duplicate inputs never start an event.
- Uploaded `.txt` and simple `.csv` files are parsed locally.
- Sharing actions produce the same order shown on screen.
- No network request contains names, emails, event titles, or results.
