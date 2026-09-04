# MOTION — CLAUDE.md

Standing contract for every session. Read fully before doing anything.

## 1. What MOTION is

MOTION is the AI marketing director for independent hospitality businesses: hotels, serviced residences, restaurants, cafés, and spas. The owner tells MOTION about their property; MOTION decides what their marketing should do next, creates it from their own photos and videos, gets approval, publishes where officially supported, measures, and learns — with the outcome framed as direct bookings, covers, and treatments, not likes.

**Positioning:** a marketing decision and execution system for one vertical, not a scheduler, caption generator, or dashboard. Not a PMS, CRM, booking engine, or revenue-management tool — those are integration targets later, never the product.

**Why this vertical:** it exists in every country, has the highest visual-content need and willingness to pay among SMBs, and the incumbent hospitality software is built around CRM/email, direct-booking widgets, reputation management, and rate optimization — none of them own the "what do we post, say, and promote this week" decision. The founder runs marketing for a hotel-residence-spa group and is the first customer.

Every feature must strengthen this loop:

```
UNDERSTAND PROPERTY → STRATEGIZE (season, occupancy, offers) → CREATE → APPROVE → PUBLISH → MEASURE → LEARN → RECOMMEND
```

**Launch order:** hotels & residences first, restaurants/cafés second, spas third. Same schema, different defaults. Other verticals are out of scope.

## 2. Decision authority

If the spec is wrong given research, constraints, or economics: state the problem, its impact, the alternative, then implement the alternative. Record it as an ADR in `/docs/adr/`.

Decide reversible things yourself. **Ask before:** destructive schema changes on migrated tables, adding a paid third-party service, changing pricing/plan constants, deleting user data, or adding scope outside the current phase.

Never add scope beyond the current phase. Never add features "because competitors have them."

Prefer the simplest architecture that reliably works. No autonomous agents unless a simpler pipeline demonstrably fails.

## 3. Product rules (non-negotiable)

- **Activation** = property created + property facts provided + assets uploaded or a social/Google account connected + strategy received + content generated + content approved or scheduled. Instrument every step.
- **Onboarding:** 6–8 questions, all skippable except property type and location. Meaningful output in the first session: marketing score → 3–5 findings → this week's plan → first content piece from their own asset.
- **Home** answers "what should this property do next?" — one primary action, this week's status, marketing health. Not a chart dashboard.
- **Insights** derive only from real data (their metrics, their reviews, their assets). Never fabricate, pad, or template an insight.
- **Trial:** `TRIAL_DAYS = 14`, full Property-tier access, no card required. Both values in plan config, never hardcoded. Expiry downgrades to Free and preserves everything.
- **Never gate the intelligence.** Every tier, including Free, gets the full Property Brain, the marketing score, insights, and the weekly plan. Paid tiers gate volume, execution, and properties — never understanding.
- **The weekly plan is the habit.** Every property receives a strategy on a fixed weekday that references last week's results and the upcoming season/events. Treat it as the core retention feature.
- **Upgrade at the moment of proof.** Paywalls fire only when a volume limit is hit and a concrete result exists to cite. Never on a timer, never on day one, never a generic modal.
- **Switching cost is earned.** One-click data export always. The moat is the learned property model, tagged asset library, and performance patterns.
- **Multilingual by default.** Property owners and their guests span Arabic, French, English, and Spanish in the first markets. Content generation, UI, and the weekly plan support per-property primary and secondary languages from day one.
- **Forbidden:** fake scarcity, fake countdowns, hidden cancellation, misleading pricing, forced notifications, manipulative confirmations, engagement-bait notifications, fabricated guest testimonials.
- **Never lose user work.** Autosave drafts; regenerate single fields, never the whole piece.

### 3b. Plan ladder (initial config — all values in `plans.ts`)

| Plan | Monthly | Gates |
|---|---|---|
| Free | $0 | 1 property, 3 content pieces/week, manual publish, 1 seat |
| Starter | $39 | 1 property (restaurant/café/small venue default), 30 pieces/month, scheduling, 1 seat |
| Property | $99 | 1 property, unlimited pieces, reels + seasonal campaigns, performance learning, direct-booking link tracking, 3 seats |
| Group / Agency | $249 + $35 per extra property | 5 properties, group dashboard, client reports, approval workflow, 10 seats |

Annual = 2 months free. Regional price tiers by country via Stripe multi-currency and a region multiplier in `plans.ts`; first customers are in Mauritania, Senegal, Morocco, and Spain. The pricing page positions against a freelancer or agency ($500–2,000/mo for a hotel), never against schedulers.

## 4. Stack (decided — change only via ADR)

| Layer | Choice |
|---|---|
| Runtime / PM | Node 22 LTS, pnpm, Turborepo monorepo |
| Web | Next.js (App Router), TypeScript strict, Tailwind, design tokens in `packages/ui`, next-intl for i18n incl. RTL |
| API | Next.js route handlers + `packages/core` services; all boundaries validated with Zod |
| DB | PostgreSQL 16, Drizzle ORM, migrations in `packages/db` |
| Cache / jobs | Redis + BullMQ |
| Storage | S3-compatible (Cloudflare R2), presigned uploads, server-side validation |
| Auth | Auth.js v5, database sessions, email magic link + Google |
| Payments | Stripe (Checkout + Customer Portal + metered prices + webhooks) |
| AI | Vercel AI SDK for provider abstraction; `generateObject` with Zod schemas; Anthropic default, OpenAI secondary; provider chosen by task router |
| Tests | Vitest (unit/integration), Playwright (e2e) |
| Observability | pino structured logs, Sentry, OpenTelemetry where cheap |
| Local | docker compose for Postgres + Redis + MinIO |
| Mobile | Responsive web only for MVP. No native app until retention data justifies it. |

## 5. Architecture rules

### Tenant model

Organization (billing unit) → Property (hotel, residence, restaurant, spa; a hotel may have child outlets) → content, assets, accounts, metrics.

- Every tenant table has `organization_id` and, where applicable, `property_id` (UUID, FK, indexed).
- All data access goes through `packages/core/repositories`, whose functions take an `OrgContext` and scope every query. No Drizzle calls in route handlers or components. Postgres RLS as a second layer.
- Every new tenant table ships with an isolation test: org A cannot read/write/list org B's rows through any endpoint.

### Property Brain (`packages/core/brain`)

Structured, persistent record per property: type, location, positioning and price band, rooms/outlets/treatment rooms, amenities, F&B outlets and menus, packages and offers with prices, guest segments (business, leisure, local, expat, diaspora), primary and secondary languages, booking channels and booking-engine URL, seasonality calendar (high/low months, local and religious holidays, events), competitors, brand voice, review themes (from connected Google Business Profile), content history, performance history, strategic preferences.

Every AI call receives it. The owner never re-explains the property.

### Entitlements & metering

One module: `packages/core/entitlements`; plans and limits in `plans.ts`. API: `can(ctx, 'CAN_SCHEDULE')`, `limit(ctx, 'MAX_PROPERTIES')`, `usage(ctx, 'CONTENT_PIECES')`.

Keys: `CAN_SCHEDULE`, `CAN_USE_CAMPAIGNS`, `CAN_USE_REELS`, `CAN_USE_PERFORMANCE_LEARNING`, `CAN_USE_BOOKING_TRACKING`, `CAN_USE_CLIENT_REPORTS`, `CAN_USE_APPROVAL_WORKFLOW`, `MAX_CONTENT_PIECES_PER_PERIOD` (week|month), `MAX_PROPERTIES`, `MAX_SEATS`, `MAX_ASSETS`, `MAX_SOCIAL_ACCOUNTS`, `MAX_AI_USAGE`. Deliberately **no** `CAN_USE_INSIGHTS` or `CAN_USE_STRATEGY`.

Property overage on Group/Agency is a Stripe metered price. Enforcement is server-side only; subscription state comes from Stripe webhooks persisted to DB.

### AI pipeline (`packages/ai`)

```
request → intent → property brain → asset/performance/review retrieval → task route → model select → structured generate → validate → hospitality quality check → response
```

- **Hospitality quality check rejects:** invented amenities, prices, or awards not in the Brain; claims about rooms/dishes/treatments the property did not list; testimonials not sourced from a real connected review; content in a language the property did not enable.
- Prompts are versioned files in `packages/ai/prompts`, organized by property type.
- Uploaded menus, brochures, scraped pages, reviews, and social content are **untrusted**: delimited data blocks only, never in the system prompt; test that they cannot override instructions.
- Log cost per call with `organization_id`, `property_id`, task, model, tokens. Route simple tasks to cheap models.

### Content types (hospitality-specific, in `packages/ai/schemas/content`)

Room/suite reel, F&B dish or menu feature, chef/staff/team story, spa treatment or package, event/occasion, offer/promo, arrival/experience story sequence, guest-review highlight (sourced review only), seasonal campaign (low-season fill, Ramadan/Eid, summer, New Year, local festival).

Every piece carries `objective` (`direct_bookings | covers | treatments | awareness | reputation`), `platform`, `language`, and a tracked link where relevant.

### Direct-outcome tracking (`packages/core/tracking`)

MOTION issues short tracked links (`m.tn/…`) with UTM to the property's booking engine, reservation page, or WhatsApp. Click and referrer data are stored per content piece. No PMS or booking-engine integration in MVP; the tracked link is the outcome signal.

### Providers (`packages/social`, `packages/listings`)

- `SocialProvider` interface. First implementation is `ManualExportProvider` (download pack + caption + tracked link, mark published manually) because Meta, TikTok, and YouTube publishing require app review or verification. Real providers ship behind feature flags.
- `ListingProvider` for Google Business Profile: read reviews and post updates once API access is approved; flag-gated. Reviews feed the Brain's review themes.
- Never claim a capability the official API does not offer.

### Jobs & reliability

- Any operation over ~2 seconds (generation, media processing, publishing) is a BullMQ job with an idempotency key and persisted status the UI polls or streams.
- Webhooks: verify signature, dedupe by event id, process idempotently.
- User-facing errors: what happened, work is safe, one recovery action. Never expose internals.

### Security baseline

- RBAC per organization: owner, admin, editor, viewer; property-scoped roles for Group/Agency.
- Rate limits on auth, AI, upload, public audit, and tracked-link endpoints.
- Uploads: type sniffing, size limits, image re-encoding, quarantine bucket until scanned.
- Audit log for privileged and billing actions. Secrets via env only; `.env.example` kept current.

## 6. Design rules (measurable)

- All colors, spacing, radii, type scale, shadows come from `packages/ui/tokens.ts`. No hardcoded values.
- One primary action per screen.
- Mobile bottom nav is exactly: Home, Content, Calendar, Insights, AI.
- Every async view implements loading, empty, error, and success states.
- RTL layout correct for Arabic; verified in Playwright with `dir="rtl"`.
- Respect `prefers-reduced-motion`; animation only communicates state.
- WCAG 2.1 AA contrast, keyboard navigation, focus management, semantic HTML.
- Restraint: the product should feel like a quiet, premium hotel back office, not an AI startup.

## 7. Repo conventions

Commands: `pnpm dev`, `pnpm test`, `pnpm test:e2e`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm lint`, `pnpm typecheck`. Conventional commits. CI runs lint, typecheck, unit, integration, isolation tests on every PR.

```
apps/web            Next.js app
packages/core       services, repositories, brain, entitlements, metering, tracking
packages/db         Drizzle schema + migrations + seed (seed includes 3 fixture properties: hotel, restaurant, spa)
packages/ai         pipeline, prompts by property type, schemas, routers, quality checks
packages/social     SocialProvider + implementations
packages/listings   ListingProvider (Google Business Profile)
packages/ui         tokens + components
docs/               architecture, adr/, billing, ai, security, runbook
```

## 8. Definition of Done (every task)

- Typecheck and lint clean; tests for the change pass in CI.
- Any new tenant table has an isolation test.
- Any new entitlement-gated feature has a "client cannot bypass" test.
- Any new AI output schema has fixture tests for all three property types and a hallucination test against the Brain.
- Migration included and reversible.
- `/docs` updated if architecture, schema, API, billing, or env changed.
- No TODO on auth, billing, isolation, upload, or tracking paths.

## 9. Product analytics events

`signup_completed`, `onboarding_started`, `onboarding_completed`, `property_created`, `asset_uploaded`, `social_connected`, `listing_connected`, `strategy_generated`, `content_generated`, `content_approved`, `content_scheduled`, `content_published`, `tracked_link_clicked`, `insight_viewed`, `upgrade_moment_shown`, `upgrade_moment_converted`, `trial_started`, `subscription_started`, `subscription_cancelled`, `trial_expired`, `payment_failed`, `account_deleted`.

Include org id, property type, plan, language; exclude PII.

## 10. Out of scope until explicitly reopened

Non-hospitality verticals, PMS/booking-engine/CRM integrations, email/SMS guest marketing, rate or revenue management, review reply automation, ads management, template marketplace, AI video editor, referral program, native mobile apps, more than one real social provider, internal admin UI (read-only DB view + Stripe dashboard for now).

## Phase status

Phases are run one per session, in order; do not start a phase until the previous phase's Definition of Done passes.

| Phase | Deliverable | Status |
|---|---|---|
| 0 | `/docs/00-discovery.md` (research memo, no code) | done |
| 1 | Foundation (monorepo, schema, auth, RLS, entitlements, Stripe trial, i18n, CI, seed) | not started |
| 2 | Design system and shell | not started |
| 3 | Property Brain, onboarding, strategy | not started |
| 4 | Content | not started |
| 5 | Billing | not started |
| 6 | Insights, Google Business Profile, first real social provider | not started |
| 7 | Growth and hardening | not started |
