# MOTION — Phase 0 discovery memo

_2026-09-04. Research only, no code. Method note: this environment could reach the Anthropic pricing page but not Meta, TikTok, Google, Stripe, or vendor sites, so those figures are search-verified against snippets of the official pages (SV) or unverified (UV). Re-read the live pages before the pricing page and before Phase 6._

## 1. Competitive map

| Product | Owns | Price for one property | Makes the weekly "what to post/promote" decision? |
|---|---|---|---|
| Canva | Design; Canva Grow 2.0 (Jun 2026) briefs and runs paid ads | Pro $18/mo | Partial: paid ads only, no organic plan, no property context |
| Metricool | Scheduling + analytics, priced per brand block | Starter $25/mo monthly ($20 annual) for 5 brands; Advanced $67 ($53) for 15; $159 annual for 50 | No: 20 AI caption credits per brand; its own copy says it "isn't going to write your entire content strategy" |
| Later, Buffer | Schedulers | Later $25/mo; Buffer $6/channel (~$24 for 4) | No: caption writers, best time to post |
| Malou | Restaurant local SEO + reviews + AI social posts | From $339/mo per location, 12-month term | Partial: AI posts; strategy sold as a human "Copilot" |
| Popmenu | Restaurant website/menu + AI marketing | $179 to $499/mo; +~$300 per extra location | **Yes**: weekly AI post suggestions and an AI monthly calendar. Restaurants only, no stay or occupancy context |
| Owner.com | Restaurant ordering + automated email/SMS | $249/mo + 5% per order, or $499 flat | Partial: "AI CMO" positioning after its Aug 2026 raise; triggered campaigns, no organic plan |
| Cloudbeds Amplify | PMS + managed SEM/metasearch + email | Quote only | Partial: Signals (May 2026) forecasts demand and drafts email campaigns; nothing for social/content |
| Revinate, Cendyn, Userguest | Hotel CRM/email, loyalty, direct-booking widgets and paid ads | Quote only (Revinate ~$350 to $1,000+/property, UV) | No: Ivy is call scoring and chat; Wayfinder tracks AI-search visibility; Userguest is on-site nudges |
| MARA | AI review replies | €70 to €210 per property/mo | No: reputation only |
| Agency / freelancer | Done-for-you content | Freelancer $300 to $1,500; agency $500 to $7,500+; UK hotel retainer ~£1,800/mo | Yes, by a human, monthly cadence, weak measurement |

**Verdict.** Confirmed for hotels, residences, and spas: no hotel-side vendor decides or produces weekly organic content; their 2026 AI launches target forecasting, email, chat, reviews, and AI-search visibility. **Partially refuted for restaurants:** Popmenu already ships weekly post suggestions and a monthly AI calendar, Owner.com is funding an "AI CMO", Malou sells AI plus human strategy. MOTION's claim must be "one closed loop from property model to decision, creation, publishing, and measured direct outcomes, across hotel, restaurant, and spa", never "nobody decides what to post". Schedulers remain caption generators.

## 2. API constraints

| API | Possible | Review | Timeline | Key limit |
|---|---|---|---|---|
| Instagram (Instagram Login) | Image, video, Reels, carousels ≤10, Stories to Business/Creator accounts; account and media insights | Advanced Access: App Review + Business Verification; scopes `instagram_business_content_publish`, `instagram_business_manage_insights` | App Review "typically under a week"; Business Verification UV | 100 API posts per account per 24h |
| Facebook Pages | Publish posts, Page insights | Advanced Access for `pages_manage_posts`, `pages_read_engagement`, `read_insights` | Same | `impressions` and page-fans metrics removed Nov 2025, more by Jun 2026 |
| TikTok Content Posting | Direct Post or Upload-to-draft; video and photo | Audit; unaudited apps post SELF_ONLY | "Several days to two weeks", no guarantee | 6 init calls/min per user |
| TikTok Display | Own videos' views, likes, comments, shares | Same | Same | Public videos only; Research API academic only |
| YouTube Data v3 | Upload; Analytics API | Compliance audit; unaudited projects' uploads forced private | No stated SLA | 100 uploads/day bucket + 10,000 units/day (model changed Jul 2026) |
| Google Business Profile | Performance metrics, reviews list/reply, `localPosts`; Q&A API sunset Nov 2025 | "Basic API Access" form; needs a Cloud project and an owner/manager email of a real profile | "Reviewed within 14 days" | 0 QPM until approved, then 300 QPM |

Meta dev-mode apps expose every permission but only to Admin, Developer, and Tester roles, and one successful call per permission is required before submission. Build on Instagram Login only (scopes renamed Jan 2025; insights no longer need a linked Page since Mar 2025) and never rely on `impressions`. `ManualExportProvider` first, real providers behind flags, is confirmed.

## 3. AI cost model

Anthropic list rates, fetched 2026-09-04, per 1M tokens in / out: Haiku 4.5 $1 / $5, Sonnet 5 $2 / $10 (the Sept 1 rise was cancelled), Opus 5 $5 / $25. Cache reads are 10% of input; Batch is 50% off. Token counts below already include the ~30% larger tokenizer on current models.

| Task (model) | Tokens in / out | Per call |
|---|---|---|
| Weekly plan, seasonality-aware (Opus 5) | 7,000 / 1,500 | $0.07 |
| Score + findings refresh (Sonnet 5) | 8,000 / 1,200 | $0.03 |
| Static piece, 2 languages (Sonnet 5) | 5,000 / 600 | $0.016 |
| Reel script + shot list, 2 languages (Sonnet 5) | 6,000 / 1,500 | $0.027 |
| Quality check (Haiku 4.5) | 4,000 / 200 | $0.005 |
| Asset analysis + tagging, 1 image (Haiku 4.5) | 1,900 / 300 | $0.003 |
| Assistant turn with Brain (Sonnet 5) | 8,000 / 500 | $0.021 |

Monthly per active property, 1.5x regeneration factor on content, Stripe fees and infra share included:

| Tier | Assumed usage | AI / mo | Fees + infra | Margin |
|---|---|---|---|---|
| Free $0 | 4.3 plans, 13 pieces, 20 turns, 10 assets | $1.10 | $0.50 | −$1.60 |
| Starter $39 | 4.3 plans, 30 pieces, 40 turns, 30 assets | $2.10 | $2.40 | 88% |
| Property $99 | 4.3 plans, 120 pieces, 100 turns, 100 assets, weekly insights | $9.50 | $4.70 | 86% |
| Group $249, 5 properties | 5 × Property usage | $47.50 | $12.50 | 76% |

If Opus 5 wrote every piece, Property AI cost would be ~$24 and margin 72%, so task routing (Sonnet for content, Haiku for checks and tagging, Opus only for the weekly plan) is mandatory, and the Brain prefix must be cached. **Fair-use cap for "unlimited":** `MAX_AI_USAGE` = 1,500 generation actions per property per month on Property and Group (about $18 at 300 pieces, still profitable), soft notice at 80%, queued generation above 100%, never a hard block. Free: 150 per month, so a Free property never costs more than ~$2.

## 4. Pricing validation

- **Starter cannibalization.** A small hotel can live on 30 pieces a month, so the fence is not volume but what Property gates: reels, seasonal campaigns, performance learning, and booking-link tracking are exactly what a hotel buys. Keep $39 and $99. Add two limit values to sharpen the fence: `MAX_SOCIAL_ACCOUNTS` 2 on Starter, 5 on Property; `MAX_ASSETS` 200 on Starter, 2,000 on Property. Default plan by type stays restaurant/café → Starter, hotel/residence/spa → Property.
- **Regional multipliers.** GDP per capita at purchasing-power parity versus the US (World Bank 2024, SV): Spain 0.66, Morocco 0.12, Mauritania 0.075, Senegal 0.06. Pure PPP would put Property at $12 in Morocco, below its AI cost, so multipliers need a cost floor. Recommend `regionMultiplier`: ES 0.85 (Canva charges ~0.72× in Morocco, Notion floors at ~0.26×), MA 0.5, SN 0.4, MR 0.4. At 0.4, Property is $39.60 with ~70% margin and Starter $15.60 with ~82%. Key the multiplier on card country and billing address, not IP.
- **Payment reach.** Stripe does not onboard merchants in Morocco, Senegal, or Mauritania (SV), so the billing entity must sit in Spain with EUR as base currency. Present EUR for ES and MR, MAD for MA, XOF (zero-decimal) for SN via `currency_options`; MRU support is UV. Adaptive Pricing now covers subscriptions. Expect Mauritanian customers to need annual bank-transfer invoices.
- **Group per-property vs Metricool.** Metricool works out at $3 to $4.50 per brand; MOTION Group is $42 per property at 10 properties. The 10× gap is defensible only because each property carries its own Brain, weekly plan, and ~$9.50 of AI, so position against agency labour per property ($300 to $1,500), never against Metricool. Keep $35 (69% margin); do not go below $29.
- **Only `plans.ts` values change:** add `regionMultiplier`, `MAX_SOCIAL_ACCOUNTS`, `MAX_ASSETS`, and `MAX_AI_USAGE` values as above. Prices and gating principles are unchanged.

## 5. MVP cut

The phase order (Foundation → Design system → Brain and strategy → Content → Billing → Insights, GBP, Meta → Growth) is confirmed, with one change of timing and no change of scope. **Start the external clocks in Phase 1.** Meta Business Verification, App Review, the Google Business Profile access form, and the TikTok audit each take one to three weeks and need a live privacy policy, terms page, and demo video. Phase 1 should publish those pages and file the applications so approvals exist before Phase 6. Billing stays after Content because the proof-triggered paywall needs a cited result, which only exists once Phase 4 ships.

## 6. Top 10 risks

| # | Risk | Mitigation |
|---|---|---|
| 1 | Meta app review delay blocks real publishing | Manual export is the launch path; file in Phase 1; test against the Graph API test environment; never promise auto-publish until approved |
| 2 | Low-season churn | Weekly plan leads with low-season fill, local and diaspora segments; push annual before low season; Free keeps the Brain so re-activation is one click |
| 3 | Owner time scarcity | Plan delivered by email and WhatsApp with one-tap approve; first piece in the first session; Home has one action |
| 4 | Multilingual quality (Arabic register, Darija/Hassaniya, RTL) | Primary language drives generation, secondary is a checked translation pass; fixture tests per language; founder's properties are the Arabic/French QA bench |
| 5 | Google Business Profile access refused or slow | Flag-gated bonus; findings work without it; owner can paste reviews as untrusted data |
| 6 | Hallucinated amenities, prices, testimonials | Quality check rejects anything not in the Brain; human approval before every publish |
| 7 | Payment reach in Mauritania and Senegal | Spanish entity, EUR base, regional prices, annual bank-transfer invoices; see §4 |
| 8 | Founder-as-first-customer bias | Every feature passes fixture tests on all three property types; five non-founder properties before Phase 5 |
| 9 | Free-tier abuse and AI cost leakage | `MAX_AI_USAGE` on every tier, one Free property per organisation, cost logged per call |
| 10 | Prompt injection via uploaded menus and scraped pages | Untrusted content only in delimited blocks; hostile-PDF test in Phase 3; quality check on a separate call |
