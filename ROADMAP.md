# VocabQuest Roadmap

*Generated 2026-02-21 — for planning and prioritization*

This document covers feature ideas, security hardening, accessibility improvements, and deployment/performance optimizations based on a full codebase analysis. The target audience is 12–14 year old students preparing for the HSPT.

---

## Table of Contents

1. [Feature Roadmap](#feature-roadmap)
2. [Security Hardening](#security-hardening)
3. [Accessibility Improvements](#accessibility-improvements)
4. [Deployment & Performance](#deployment--performance)

---

## Feature Roadmap

### Priority 1 — High engagement, moderate effort

#### Vocabulary Decks (Admin + Student)
The API has a `decks` endpoint and the flashcard page has a `DeckSelector` component, but neither is functional — the endpoint returns an empty array and there is no admin UI for deck management. This is a foundational feature that other items depend on.

**Admin side:**
- Add a Decks management section to the admin dashboard (create, rename, delete decks)
- CSV upload should support a `deck` column so admins can bulk-import words into specific decks
- Admin can assign decks to individual students or to all students
- Admin can reorder decks to control the suggested study sequence

**Student side:**
- DeckSelector on the flashcard page shows only assigned decks
- Student picks a deck to study; the current random/sequential toggle applies within the selected deck
- Progress tracking scoped per deck so students see completion percentage per deck

**Schema changes:** Add a `Deck` model (name, description, createdBy, order) and a `DeckAssignment` join table (deckId, userId). Add `deckId` foreign key to the `Vocabulary` model.

#### Sentence Context Mode
Show the vocabulary word used in a sentence with the word blanked out. Student picks the correct word from options. This teaches contextual understanding, which is what the HSPT actually tests, rather than isolated definitions. Requires adding an `exampleSentence` field to the Vocabulary schema (can be bulk-populated via CSV upload or generated with AI assistance).

#### Word Relationships / Synonym-Antonym Matching
A new mode where students match words to their synonyms or antonyms. Could be presented as a drag-and-drop or timed matching game. Requires extending the vocabulary schema with `synonyms` and `antonyms` fields. Strong educational value because the HSPT frequently tests synonym/antonym recognition.

#### Pronunciation / Audio Support
Add text-to-speech for each vocabulary word so students hear the pronunciation. Could use the browser's built-in `SpeechSynthesis` API (zero cost). Helpful for words students have only read but never heard spoken aloud. Especially useful for the 12–14 age group who may encounter many of these words for the first time.

#### Word-of-the-Day Challenge
A daily word presented on login with a mini-challenge (use it in a sentence, pick the synonym, etc.). Completing it awards bonus XP and extends the daily streak. This gives students a reason to open the app every day even when they don't have time for a full session.

#### Spaced Repetition Review Queue
The server already calculates `nextReviewDate` and `easeFactor` per word using the SM-2 algorithm, but there's no dedicated "Review" mode that surfaces only due words. Add a review mode that pulls words where `nextReviewDate <= today`, sorted by urgency. This turns the existing data into an active study tool.

### Priority 2 — Good engagement, higher effort

#### Multiplayer / Class Challenges
Teacher sets a weekly challenge (e.g. "Learn 30 new words this week"). A class-wide progress bar shows collective progress. Individual contributions are visible on the leaderboard. This leverages peer motivation, which is strong in the 12–14 age group.

#### Timed Challenge Mode
A speed round where students answer as many cards correctly as possible in 60 seconds. High scores posted to a separate timed leaderboard. Appeals to the competitive instinct in this age group.

#### Progress Sharing / Report Card
Let students generate a shareable summary ("I learned 47 words this week with 89% accuracy!") that they can show parents or teachers. For the school use case, teachers could view per-student progress dashboards.

### Priority 3 — Nice to have

#### Badges and Profile Customization
Award visual badges (icons/frames) for achievements that students can display on their profile. Let them pick an avatar or color theme. The existing achievement system provides the unlock triggers; this adds the visual payoff.

#### Wrong Answer Review
After a quiz or session, show a summary of the words the student got wrong with the correct definitions. Currently the session just ends or a new set loads. A review step reinforces the missed words before moving on.

#### Favorites / Study Lists
Let students star words they want to revisit. A personal "starred words" list they can load as a custom set.

#### Offline Mode (PWA)
Cache the current word set and UI shell with a service worker so students can study without internet. Sync progress when connectivity returns. Useful for students on school buses or in areas with spotty wifi.

---

## Security Hardening

### High Priority

| Issue | Detail | Recommendation |
|-------|--------|----------------|
| **No CSRF tokens** | State-changing operations rely solely on SameSite cookies. While SameSite=lax blocks most cross-site POST attacks, it doesn't protect against same-site subdomain attacks or GET-based mutations. | Add `csurf` middleware or a custom double-submit cookie pattern for all POST/PUT/DELETE endpoints. |
| **Admin privilege escalation** | Any admin can promote any user to admin (`PUT /api/admin/users/:id/role`). No audit trail, no confirmation step. | Require a super-admin role or a confirmation code for role changes. Log all admin actions to an audit table with timestamp, actor, and action. |
| **No admin audit logging** | Admin actions (delete user, reset password, change role, bulk upload) leave no trace. | Create an `admin_audit_log` table. Log every admin mutation with `adminId`, `action`, `targetId`, `details`, `timestamp`. |
| **Account enumeration on registration** | Registration endpoint returns a specific error when an email already exists (`routes/auth.js` lines 30–32). An attacker can probe for valid .edu email addresses. | Return a generic "Check your email for next steps" message regardless of whether the account exists. |

### Medium Priority

| Issue | Detail | Recommendation |
|-------|--------|----------------|
| **`unsafe-inline` in CSP** | `scriptSrc` and `styleSrc` both allow `'unsafe-inline'`, which weakens XSS protection. Required by Svelte's current CSS injection. | Move to nonce-based inline styles or external stylesheets. For scripts, remove `unsafe-inline` and use nonce-based script loading. |
| **Rate limits too permissive** | The API limiter allows 1000 requests/minute. Admin endpoints share this limit. | Reduce to 200/min for general API. Add a stricter limit (20/min) for admin mutation endpoints. Add per-user (session-based) limiting in addition to IP-based. |
| **No email verification** | Users are immediately active after registration with no confirmation step. | Add email verification flow. Store a `verified` boolean on User, send a confirmation link on registration, and block study access until verified. |
| **No password reuse check** | Users can change their password to the same value. | Store a hash of the last 3 passwords and reject reuse on change. |
| **No account lockout** | Failed login attempts are only rate-limited by IP (10 per 15 min). A distributed attacker could brute-force passwords. | Add a `failedLoginAttempts` counter on User. Lock the account for 15 minutes after 5 consecutive failures. |

### Low Priority

| Issue | Detail | Recommendation |
|-------|--------|----------------|
| CSV upload content scanning | Admin CSV uploads are type-checked but not scanned for malicious content. | Validate CSV cell values (max length, allowed characters) before database insert. |
| No 2FA for admin accounts | Admin accounts have no additional authentication factor. | Add optional TOTP-based 2FA for admin users. |
| Session cookie max age | 30-day session cookie is long for a student-facing app. | Consider reducing to 7 days, or add a "Remember me" checkbox that controls the duration. |

---

## Accessibility Improvements

### High Priority

| Issue | Location | Fix |
|-------|----------|-----|
| **Missing `lang` attribute** | `client/index.html` | Add `lang="en"` to the `<html>` element so screen readers use the correct language model. |
| **Mascot images lack alt text** | `Header.svelte` mascot `<img>` tags | Add descriptive alt text (e.g. `alt="VocabQuest mascot"`) or `alt=""` with `aria-hidden="true"` if purely decorative. |
| **No focus-visible styles** | Global CSS / Tailwind config | Add `focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2` to all interactive elements. Currently only hover states are styled. |
| **Loading states not announced** | FlashcardsPage, AdminPage, StatsPage | Add `aria-live="polite"` regions that announce loading/loaded states to screen readers. Use `aria-busy="true"` on containers during async loads. |
| **Form validation not announced** | Login, Register, Settings forms | Associate error messages with inputs using `aria-describedby`. Add `aria-invalid="true"` on fields with errors. |

### Medium Priority

| Issue | Location | Fix |
|-------|----------|-----|
| **GamificationBar lacks ARIA** | `GamificationBar.svelte` | Add `role="status"` and `aria-label="Your progress"` to the bar. Add `aria-valuenow`, `aria-valuemin`, `aria-valuemax` to the XP progress bar `<div>`. |
| **FlashCard keyboard support** | `FlashCard.svelte` | Verify that card flip (practice mode) works with Enter/Space. Quiz options should be navigable with arrow keys. Typing mode input should auto-focus. |
| **Mobile POS filter labels** | `ControlBar.svelte` mobile layout | Abbreviated labels ("Adj." vs "Adjectives Only") may confuse screen readers. Add `aria-label` with the full name to the mobile `<option>` elements, or use a `title` attribute on the `<select>`. |
| **Achievement grid semantics** | `AchievementGrid.svelte` | Use proper `<ul>`/`<li>` list markup. Each achievement should have `aria-label` describing its name and unlock status. |
| **Admin tables** | `UserTable.svelte`, `VocabTable.svelte` | Add `<caption>` elements to tables. Ensure `<th>` elements have `scope="col"`. Add `aria-sort` to sortable columns. |
| **Color contrast audit** | Various components | Run automated WCAG AA contrast checks on all color combinations, especially the gradient text in the header (amber-900 to orange-500 on white). |

### Low Priority

| Issue | Fix |
|-------|-----|
| Reduce motion support | Add `@media (prefers-reduced-motion: reduce)` to disable confetti, card flip animations, and celebration overlays for users who prefer reduced motion. |
| Screen reader testing | Test full user flows with VoiceOver (macOS) and NVDA (Windows). Document findings and fix any interaction-blocking issues. |
| High contrast mode | Test with `forced-colors: active` media query. Ensure borders and focus indicators remain visible in Windows High Contrast mode. |

---

## Deployment & Performance

### Startup Performance

| Issue | Detail | Recommendation |
|-------|--------|----------------|
| **Migration runs on every deploy** | `npm run migrate` calls `sequelize.sync({ alter: true })` on every startup, which introspects every table and diffs the schema. On a cold Render start this adds 2–5 seconds. | Switch to explicit migrations with `sequelize-cli` (or `umzug`). Run `sync` only in development. In production, run migrations as a separate build step or one-off command. |
| **Vocabulary import as seed script** | `importVocab.js` is designed to run manually but could be automated on first deploy. | Add a check: if `Vocabulary.count() === 0`, auto-run the import during server startup. Skip otherwise. |
| **Cold start latency (Render free tier)** | Render free tier spins down after 15 minutes of inactivity. First request after spin-up takes 30–50 seconds. | Add a "waking up" loading screen on the client that detects a slow `/api/health` response and shows a friendly message instead of an error. Alternatively, use a free cron service (e.g. UptimeRobot) to ping `/api/health` every 14 minutes to prevent spin-down. |

### Frontend Performance

| Issue | Detail | Recommendation |
|-------|--------|----------------|
| **No route-based code splitting** | `svelte-spa-router` imports all route components synchronously in `App.svelte`. The entire app loads as a single 324KB JS bundle. | Use dynamic `import()` with `svelte-spa-router`'s `wrap` function to lazy-load route components. The admin dashboard alone would be a meaningful split since most users never visit it. |
| **No asset caching headers** | Express serves static files from `client/dist/` with no explicit `Cache-Control` headers. Browsers re-fetch on every visit. | Add `maxAge: '1y'` to `express.static()` for hashed assets (`*.js`, `*.css`). Vite already fingerprints filenames, so long cache is safe. Add `Cache-Control: no-cache` for `index.html` only. |
| **Mascot images not optimized** | PNG mascot images in `client/public/assets/mascot/`. No WebP/AVIF variants, no explicit dimensions. | Convert to WebP (50–70% smaller). Add explicit `width`/`height` attributes to prevent layout shift. Consider inline SVG for simple mascots. |
| **No critical CSS extraction** | The full Tailwind CSS bundle (59KB) loads before first paint. | Use `@fullhuman/postcss-purgecss` (already implicit in Tailwind's JIT mode) and consider extracting critical above-the-fold CSS for the login and flashcard pages. |

### Backend Performance

| Issue | Detail | Recommendation |
|-------|--------|----------------|
| **N+1 query in leaderboard** | `admin.js` lines 381–399 and `progress.js` lines 636–675 fetch the top 10 users, then run a separate `UserProgress.findOne()` query for each user to get stats. | Replace with a single SQL query using `GROUP BY` and `JOIN` to fetch all stats in one round-trip. |
| **No API response caching** | Stats, leaderboard, and vocabulary endpoints are computed fresh on every request. | Add short-lived caching (30–60 seconds) for leaderboard and stats GET endpoints using a simple in-memory cache (e.g. `node-cache`). These change infrequently but are hit often. |
| **Session store hits DB on every request** | `connect-pg-simple` reads/writes the session row on every HTTP request. | Acceptable at current scale. If latency becomes an issue, consider `connect-redis` with a free Redis instance (Upstash free tier). |
| **Database connection pool size** | Pool max is 5 connections. Neon free tier allows 15. | Increase to 10 if concurrent users grow. Monitor with `sequelize.connectionManager.pool.size` logging. |

### Deployment Pipeline

| Improvement | Detail |
|-------------|--------|
| **Health check endpoint** | `/api/health` exists but only returns `{ status: 'ok' }`. Enhance it to check DB connectivity (`sequelize.authenticate()`) so Render can detect unhealthy deploys and roll back. |
| **Environment variable validation** | `SESSION_SECRET` and `DATABASE_URL` are validated on startup (good). Add validation for minimum `NODE_ENV` and log a clear startup banner with the environment, database host (masked), and Node version. |
| **Docker Compose for local dev** | `docker-compose.yml` exists but references a remote DB. Add a local PostgreSQL service (commented-out section already exists) and a `.env.example` file so new developers can `docker-compose up` with zero configuration. |
| **CI pipeline** | No CI configuration exists. Add a GitHub Actions workflow that runs `npm run check` (svelte-check), `tsc`, and `npm run build` on every PR to catch type errors before merge. |

---

## Quick Wins (< 1 day each)

These items deliver noticeable improvement with minimal effort:

1. **Add `lang="en"` to index.html** — 1 line, fixes a top accessibility issue
2. **Add alt text to mascot images** — 4 lines in Header.svelte
3. **Cache static assets** — Add `maxAge` to `express.static()` call, one line
4. **UptimeRobot ping** — Free external service, zero code changes, eliminates cold starts
5. **Generic registration message** — Change one error message in `routes/auth.js` to prevent account enumeration
6. **Focus-visible styles** — Add one Tailwind plugin config to `tailwind.config.js`
7. **Lazy-load admin routes** — Wrap admin route component in dynamic `import()`, reduces main bundle for all non-admin users
