# Changelog

All notable changes to the Sprout AAC website are documented here.

---

## [1.1.0] — 2026-02-28

### Added
- Beta tester opt-in checkbox on both signup forms (stored in D1, visible in admin table)
- Price comparison section: Proloquo2Go $249, TouchChat $149, Sprout $0
- Accessibility section — switch scanning, eye gaze, high contrast, grid size, OpenDyslexic, offline
- Roadmap section with v0.1–v0.4 milestones and activity signal
- Community strip with OpenAAC Discord link
- Admin signups table now shows beta tester badge, unsubscribe badge, and stats panel
- Subscriber count in hero (shown only when ≥10 active subscribers)
- Roadmap activity signal: "In active development · Last updated February 2026"
- GitHub Actions: auto-deploy on push to main, HTML validation on PRs

### Changed
- Phone mockup child name: "Matthew's board" → "Jamie's board"
- "OSS" → "Open source" in stats strip
- GitHub link updated to `github.com/sproutaac/app`
- Smooth scroll duration increased to 1600ms
- Card hover/tap effects removed entirely (feature, a11y, roadmap cards)
- Hero count no longer shows dash while loading
- Counter threshold raised to ≥10 before display
- Footer copyright updated to match across index.html and privacy.html

### Removed
- Quote section removed
- Dead quote CSS removed
- Scroll reveal / card entrance animations removed

### Fixed
- Beta checkbox layout: scoped `.hero-form input` and `.final-form input` rules to `[type="email"]` to prevent checkbox inheriting flex sizing
- `final-cta` class collision on beta label — renamed to `beta-label--dark`
- privacy.html: added favicon, OG/Twitter meta tags, fixed `hello@sproutaac.com` → `.org` throughout

---

## [1.0.0] — 2026-02-27

### Added
- Full marketing site (`public/index.html`) — hero, features, for-whom, FAQ, final CTA
- Privacy policy (`public/privacy.html`)
- Waitlist signup (`POST /api/signup`) with styled confirmation email and admin notification
- One-click unsubscribe (`GET /api/unsubscribe`) with HMAC-SHA256 token verification
- Subscriber count endpoint (`GET /api/count`) with 5-minute cache
- Admin signups table (`GET /admin/signups`) — key-gated HTML view
- Broadcast email endpoint (`GET/POST /admin/broadcast`) — sends to all active subscribers
- D1 schema: `WaitlistSignup` with `id`, `email`, `createdAt`, `unsubscribed`, `betaTester`
- OG image, favicon, Apple touch icon
- Back-to-top button
