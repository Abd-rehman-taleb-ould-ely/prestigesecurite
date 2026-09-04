# MOTION — Phase 0 discovery memo

_Date: 2026-09-04. Scope: research only, no code. Sources are official pages fetched on this date unless marked unverified._

## 1. Competitive map

| Product | Owns | Price (1 property) | Weekly "what to post/promote" decision? |
|---|---|---|---|
| Canva | Design; Canva Grow 2.0 (Jun 2026) briefs and runs paid ads | Pro $18/mo | Partial: paid ads only, no organic plan, no property context |
| Metricool | Scheduling + analytics, priced per brand | Starter ~$22/mo for 5 brands; Advanced ~$54/mo for 15; ~$210 for 50 | No: AI Assistant writes captions (20 credits/brand); Metricool states it does not write the strategy |
| Later | Visual scheduler | Starter $25/mo, 1 social set | No: caption writer, best-time-to-post |
| Buffer | Cheapest per-channel scheduler | $6/channel/mo (~$24 for 4 channels) | No: AI drafts text |
| Malou | Restaurant local SEO + reviews + social | From $339/mo per location, 12-month commitment | Partial: AI post generation; strategy sold as a human "Copilot" |
| Popmenu | Restaurant website/menu + AI marketing | $179 to $499/mo, +~$300 per extra location | **Yes**: weekly AI-suggested posts and an AI monthly marketing calendar. Restaurants only. |
| Owner.com | Restaurant direct ordering + automated email/SMS | $249/mo + 5% per order, or $499 flat | Partial: "AI CMO" positioning after Aug 2026 raise; triggered campaigns, no organic weekly plan |
| Cloudbeds Amplify | PMS + managed SEM/metasearch + email | Quote only | Partial: Signals (May 2026) forecasts demand and drafts email campaigns; no social/content plan |
| Revinate | Hotel CRM/email | Quote only (~$350 to $1,000+/property, unverified) | No: email builder; Ivy (Jun 2026) is call scoring and guest chat |
| Cendyn | Enterprise hotel CRM/loyalty | Quote only | No |
| Userguest | Direct-booking widgets + AI paid ads | About one room night per month (unverified) | No |
| MARA | AI review replies | €130/property/mo annual | No: reputation only |
| Agency / freelancer | Done-for-you content | Freelancer $300 to $1,500; agency $500 to $7,500+; UK hotel retainer ~£1,800/mo | Yes, by a human, monthly cadence, opaque measurement |

**Verdict.** The gap is confirmed for hotels, residences, and spas: no hotel-side tool decides or produces weekly organic content; their AI targets forecasting, email, chat, reviews, or ad bidding. The gap is **partially refuted for restaurants**: Popmenu ships weekly post suggestions and a monthly AI calendar, Owner.com is funding an "AI CMO", and Malou sells AI plus human strategy. MOTION's claim must be stated as "one closed loop from property model to decision, creation, publishing, and measured direct outcomes, across hotel, restaurant, and spa", not "nobody decides what to post." Schedulers remain caption generators; Canva Grow is the closest closed loop but is paid ads only. Prices are from search snippets (official pages were not fetchable from this environment); re-verify Metricool's brand ladder and Popmenu tiers before publishing the pricing page.

## 2. API constraints (verified against official docs)

Official developer sites (Meta, TikTok, Google) were not fetchable from this environment; every row below was checked against search-engine snippets of the official pages and must be re-read on the live docs before Phase 6. Items marked UNVERIFIED had no confirming snippet.

| API | Possible | Review needed | Timeline | Key limit |
|---|---|---|---|---|
| Instagram API (Instagram Login or Facebook Login) | Publish image, video, Reels, carousels (≤10), Stories to Business/Creator accounts; account and media insights | Yes. Serving other people's accounts needs Advanced Access: App Review + Business Verification. Scopes `instagram_business_content_publish`, `instagram_business_manage_insights` | App Review "typically under a week, often 2 to 3 days"; Business Verification timeline UNVERIFIED | 100 API-published posts per account per rolling 24h |
| Facebook Pages | Publish posts, read Page and post insights | Yes: `pages_manage_posts`, `pages_read_engagement`, `read_insights` need Advanced Access | Same App Review window | `impressions` and page-fans metrics removed Nov 2025; more removed by Jun 2026 |
| TikTok Content Posting API | Direct Post (publishes) or Upload (draft the user finishes in-app); video and photo | Yes. Unaudited apps can only post as private / SELF_ONLY | "Several days to two weeks", no guarantee | 6 init requests per minute per user |
| TikTok Display API | Own-account video views, likes, comments, shares | Same app review | Same | Public videos of the authorised user only; Research API is academic only |
| YouTube Data API v3 | Upload; Analytics API for views and watch time | Compliance audit for more quota; unaudited projects have uploads forced private | No stated SLA | Default now 100 uploads/day in its own bucket plus 10,000 units/day for the rest (quota model changed Jul 2026) |
| Google Business Profile | Performance metrics, reviews list and reply, `localPosts` create; Q&A API sunset Nov 2025 | Yes: "Application for Basic API Access" form; needs a Cloud project and an owner/manager email of a real profile | "Reviewed within 14 days" | 0 QPM until approved, then 300 QPM; increases refused if usage is under 50% of limit |

Meta dev-mode apps expose every permission but only to Admin, Developer, and Tester roles, and one successful call per permission is required before submission. Two 2025 changes matter for design: Instagram Login scopes were renamed (old names deprecated Jan 2025), and insights now work without a linked Facebook Page (Mar 2025), so MOTION should build on Instagram Login only and never rely on `impressions`. The `ManualExportProvider` first, real providers behind flags, is the right call.

## 3. AI cost model

Prices are Anthropic list rates on 2026-09-04 (per 1M tokens, input / output): Haiku 4.5 $1 / $5, Sonnet 5 $2 / $10, Opus 5 $5 / $25. Cache reads are 10% of input price; cached Brain prefixes cut input cost by roughly 40% on repeat calls. Image input costs about 1,600 tokens per 1.5-megapixel image.

| Task (model) | Tokens in / out | Cost per call |
|---|---|---|
| Weekly plan, seasonality-aware (Opus 5) | 7,000 / 1,500 | $0.07 |
| Score + findings refresh (Sonnet 5) | 8,000 / 1,200 | $0.03 |
| Static piece: caption, CTA, 2 languages (Sonnet 5) | 5,000 / 600 | $0.016 |
| Reel script + shot list, 2 languages (Sonnet 5) | 6,000 / 1,500 | $0.027 |
| Hospitality quality check (Haiku 4.5) | 4,000 / 200 | $0.005 |
| Asset analysis + tagging, 1 image (Haiku 4.5) | 1,900 / 300 | $0.003 |
| Assistant turn with Brain context (Sonnet 5) | 8,000 / 500 | $0.021 |
| Field-level regenerate (Sonnet 5) | 3,000 / 150 | $0.008 |

Monthly cost per active property, with a 1.5x regeneration factor applied to content:

| Tier | Assumed usage | AI cost / mo | Stripe + infra | Gross margin |
|---|---|---|---|---|
| Free ($0) | 4.3 plans, 13 pieces, 20 assistant turns, 10 assets | $1.10 | $0.50 | −$1.60 |
| Starter ($39) | 4.3 plans, 30 pieces (20 static, 10 reel), 40 turns, 30 assets | $2.10 | $2.40 | 88% |
| Property ($99) | 4.3 plans, 120 pieces, 100 turns, 100 assets, weekly insights | $9.50 | $4.70 | 86% |
| Group ($249, 5 properties) | 5 × Property usage | $47.50 | $12.50 | 76% |

Sensitivity: if Opus 5 is used for every content piece instead of Sonnet 5, Property-tier AI cost rises to roughly $24 and margin to 72%. Task routing (Sonnet for content, Haiku for checks and tagging, Opus only for the weekly plan) is therefore not optional.

**Fair-use cap for "unlimited".** At 300 pieces per month a Property costs about $18 in AI, still profitable. Recommend `MAX_AI_USAGE` = 1,500 generation actions per property per month on Property and Group (a generation action is one piece, regenerate, assistant turn, or insight run), with a soft notice at 80% and a throttle to queued generation above 100%, never a hard block. Free tier: `MAX_AI_USAGE` = 150 per month so a Free property never exceeds about $2.

## 4. Pricing validation

@@PRICING@@

## 5. MVP cut

The phase order (Foundation → Design system → Brain/strategy → Content → Billing → Insights/GBP/Meta → Growth) is confirmed. Two adjustments, neither changing phase scope:

- **Start the external clocks in Phase 1, not Phase 6.** Meta Business Verification, Meta App Review, the Google Business Profile API access request, and the TikTok audit each take weeks and depend on a live privacy policy, terms page, and demo video. Phase 1 should publish the legal pages and file the applications so approvals land before Phase 6 needs them. This is paperwork, not code, and does not widen any phase.
- **Billing stays after Content.** The proof-triggered paywall needs a cited result (a top piece, a tracked click), which only exists once Phase 4 ships. Phase 1's no-card trial start is sufficient until then.

## 6. Top 10 risks

| # | Risk | Mitigation |
|---|---|---|
| 1 | **Meta app review delay** blocks real publishing for months | ManualExportProvider is the launch path by design; file for review in Phase 1; run against the Graph API test environment; never promise auto-publish on the pricing page until approved. |
| 2 | **Low-season churn**: owners cancel when occupancy drops | The weekly plan must lead with low-season fill offers and diaspora/local segments; trial and annual discounts target pre-low-season sign-ups; downgrade to Free keeps the Brain so re-activation is one click. |
| 3 | **Owner time scarcity**: no one opens the app | Weekly plan delivered by email and WhatsApp with one-tap approve; onboarding produces the first piece in the first session; Home has exactly one action. |
| 4 | **Multilingual quality**, especially Arabic and Hassaniya/Darija register and RTL | Per-property primary language drives generation, secondary is a translation pass reviewed by the quality check; fixture tests per language; founder's properties are the Arabic/French QA bench. |
| 5 | **Google Business Profile API access refused or slow** | Treat as flag-gated bonus; findings work without it; owner can paste reviews as untrusted data blocks meanwhile. |
| 6 | **Hallucinated amenities, prices, or testimonials** damage a property's reputation | Hospitality quality check rejects anything not in the Brain; every piece is approved by a human before publish; no auto-publish in MVP. |
| 7 | **Payment reach in Mauritania and Senegal** (Stripe merchant availability, card penetration, currency support) | Bill from the EU entity in EUR/USD; regional multiplier covers affordability; accept that first Mauritanian customers may pay by bank transfer or via a local reseller; see §4. |
| 8 | **Founder-as-first-customer bias** produces features only the founder's group needs | Every Phase 3+ feature must pass fixture tests on all three property types; recruit 5 non-founder properties before Phase 5. |
| 9 | **Free-tier abuse and AI cost leakage** | `MAX_AI_USAGE` on every tier, rate limits on AI endpoints, one Free property per organisation, cost logged per call. |
| 10 | **Prompt injection via uploaded menus, brochures, and scraped pages** | Untrusted content only in delimited data blocks, never in the system prompt; hostile-PDF test in Phase 3; quality check runs on a separate call. |
