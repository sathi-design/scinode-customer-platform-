# SCINODE Supplier Platform — Complete Build Summary

> **Project Path:** `/Users/sathimidya/scinode`
> **Git Repo:** `https://github.com/sathi-design/scinode-customer-platform-.git`
> **Dev Server:** `http://localhost:3000`
> **Last Updated:** 2026-06-19 (Session 11)
> **Total Commits:** 63+

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + design tokens |
| UI Components | Custom Radix UI (shadcn-style, no shadcn CLI) |
| Forms | React Hook Form + Zod |
| State | Zustand (with persist) |
| React Version | React 19 |

**Brand colour:** `#2ACB83` / `#1F6F54` (SCINODE green)

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing / home page |
| `/login` | Role selector login page |
| `/login/cro-scientist` | CRO & Scientist login |
| `/signup/cro-scientist` | CRO & Scientist multi-step signup |
| `/signup/manufacturer` | Manufacturer multi-step signup |
| `/forgot-password` | Forgot password |
| `/reset-password` | Reset password |
| `/demo` | Demo access page (instant login) |
| `/dashboard` | Main dashboard — role-based render |
| `/dashboard/projects` | Manufacturer project listing |
| `/dashboard/projects/[id]` | Project detail (dynamic) |
| `/dashboard/proposals` | Proposal listing |
| `/dashboard/market-pulse` | Market Pulse intelligence page |
| `/dashboard/research-repository` | Deep Research Repository |
| `/dashboard/demand-catalyst` | Demand Catalyst — Managed B2B Growth Service |
| `/dashboard/profile` | Profile setup wizard |
| `/settings/change-email` | Change email |
| `/settings/change-password` | Change password |

---

## Demo Logins

| Role | Email | User |
|---|---|---|
| CRO | `cro@demo.com` | Aria Mehta |
| Manufacturing | `mfg@demo.com` | Rajan Sinha |
| Scientist | `sci@demo.com` | Dr. Priya Iyer |

---

## Progressive Dashboard System (Day-Based Reveal)

The dashboard uses `useDashboardDayStore` to switch between states:

| Day | CRO / Researcher | Manufacturing |
|---|---|---|
| Day 0 | `CRODashboard` / `ResearcherDashboard` — full onboarding dashboard | `ManufacturingDashboard` — Day 0 full dashboard |
| Day 1 | `Day1CRODashboard` / `Day1ResearcherDashboard` — profile submitted state | `ManufacturingDay1Dashboard` — Day 1 pipeline |
| Day 10 | `Day10Dashboard` — full opportunity reveal | — |
| PI | `PIPlaceholderDashboard` | — |
| Researcher (placeholder) | `ResearcherPlaceholderDashboard` | — |

---

## Module Flows — Full Detail

---

### 1. CRO Dashboard (`CRODashboard.tsx`)

**Route:** `/dashboard` (when role = CRO, Day 0)

**Layout:** Full-width max-1200px container, `space-y-5` vertical stack.

#### Sections (top to bottom):

**1.1 Hero Banner**
- Dark green gradient background (`linear-gradient(125deg, #002d16 → #001a0a → #081625)`)
- Ambient radial blur blobs (green + blue) for depth
- **SCINODE Secure badge** — pill button with shimmer animation (`cro-badgeShimmer` keyframe: background-position sweep 3.5s infinite). Hover shows a tooltip (fade + translateY transition 200ms).
- Headline: "Unlock Global R&D Opportunities"
- Two CTAs: "Complete Your Technical Profile" (green) + "View Matched Projects" (ghost border)
- Supporting value section below CTAs
- **Right panel (Live Signal):** "+58% demand this week vs last week" — gradient text, pulsing ping dot (emerald animate-ping), "Updated hourly · Scinode Intelligence"

**1.2 Opportunity Section (60% width)**
- White card, `border-2 border-[#0e6f5c]`, hover shadow transition
- Decorative radial + elliptic blur blobs (4 layers)
- Large animated number: **"400+"** — `group-hover:scale-[1.02]` on hover
- "Open R&D Opportunities" heading
- CTA: "Complete your profile" → green button
- Two stat tiles: "+42% Improve visibility" (green bg) + "+63% Strengthen collaboration fit" (blue bg) — `hover:-translate-y-0.5 hover:shadow-md`

**1.3 Profile Completion Engine (40% width)**
- White rounded-[20px] card
- **Progress Ring (SVG):** 88px, gradient stroke (`#1f6f54 → #4ed589`), `strokeDashoffset` animates at 600ms ease
- Shows current % complete + active level pill
- **Level Stepper:** 4 horizontal levels: Explorer → Listed Lab → Capable Partner → Verified CRO. Nodes turn filled-green when reached, active node has amber ring.
- **Profile Breakdown Accordion (scrollable, 4 rows visible, 208px max-height):**
  - 8 missions: Company Profile (20%), Products (10%), Certifications (15%), Services (20%), Equipment (10%), Facility & EHS (10%), Utility (5%), T&C (10%)
  - Each row: icon → title → subtitle → `+X%` chip
  - Expand: `animate-in fade-in-0 slide-in-from-top-1 duration-200`
  - Complete action triggers: setCompleted → setCelebrating → toast
  - Thin scrollbar visible only on hover (`cro-breakdown-scroll` custom CSS)
- **Celebration Overlay:** blurs card with `rgba(10,22,15,0.82)` + `backdrop-filter: blur(6px)`. Shows 🎉, level name, badge emoji. 24 confetti particles (8 keyframe paths `cro-cf0`–`cro-cf7`: scatter + rotate + scale(0.2) + fade, 1.3s cubic-bezier staggered by 38ms).
- **Toast:** fixed bottom-center, `animate-slide-up`, green bg, 🎉 emoji, auto-dismisses at 3.5s.

**1.4 Activation Banner**
- Dark green gradient full-width strip
- "🎯 Activation Goal" — "You're 2 steps away from unlocking a high-fit project match"
- "Add Capability Details" CTA button (right-aligned on desktop)

**1.5 Open Projects Carousel**
- 5 project cards: `w-[240px]` fixed, horizontal scroll, `scrollbarWidth: none`
- Scroll left/right chevron buttons (smooth scroll via `scrollTo`)
- Right fade gradient mask (`linear-gradient(to left, #ffffff → transparent)`)
- **Unlocked card:** image hover `scale-105` transition, match % overlay on image (bottom-left), "Well Matched" green pill, `ArrowUpRight` button appears on hover (`opacity-0 → opacity-100 + translate-y-1 → 0`)
- **Locked card:** image `blur-sm scale-105`, frosted lock icon overlay, "Complete your profile to unlock" CTA

**1.6 Platform Stats**
- Dark `#0d1117` background
- 5 stats: 20+ countries, 350+ R&D enquiries/week, 1000+ researchers, 90% matched, 98% satisfaction
- **Count-up animation:** triggered on `onMouseEnter`, `requestAnimationFrame` loop, 1400ms duration, cubic ease-out (`1 - (1-t)^3`)

**1.7 Quick Wins (Auto-Scroll Marquee)**
- 5 action cards doubled (10 total) in infinite horizontal scroll (`cro-quickWinsScroll` 28s linear)
- Pauses on `mouseEnter`, resumes on `mouseLeave`
- Left + right fade gradient masks
- Card hover: radial fill scales in from bottom-right (`scale-0 → scale-100`, origin-bottom-right, 250ms)
- Icon bg transitions to white on hover

**1.8 Testimonials Carousel**
- 3 testimonials, sliding via `translateX(-${idx * 88}%)` + `transition-transform duration-400`
- Dot indicators: active = `w-7 bg-[#1f6f54]`, inactive = `w-2 bg-slate-300`
- Prev/Next chevron buttons
- Large decorative `"` marks (140px, 8% opacity)
- Community avatar stack: 4 overlapping initials circles with `ring-2 ring-white`

**1.9 Talk to Expert**
- Dark green gradient section
- "Schedule a call via IONS CONNECT" CTA button
- Pulsing green dot "Available now" indicator (`animate-ping`)
- Decorative SVG icon (user/community graphic, gradient-filled circle with user icon strokes)

---

### 2. Manufacturing Dashboard (`ManufacturingDashboard.tsx`)

**Route:** `/dashboard` (when role = Manufacturing, Day 0)

**Layout:** Full-width max-1200px, sections stacked with `space-y-5`.

#### Sections:

**2.1 Welcome Banner (Hero)**
- Dark forest green gradient (`#003A1B → #001C08 → #000d04`)
- **Animated grid pattern:** SVG data-URI background, opacity pulses via `mfg-grid` keyframe (7s ease-in-out)
- **SCINODE Starter badge** — shimmer sweep (`mfg-badgeShimmer`) + hover tooltip
- Large `50+` in `#2ACB83` (72px black), "Live Opportunities Are Waiting for You"
- **Animated progress bar:** width `0% → 6%` in 1.2s cubic-bezier with glow shadow on mount (`progressMounted` state, 300ms delay)
- Two CTAs: "Set Up Plant Profile" (white bg) + "Explore Projects" (ghost)
- **Right panel: Buyer Signal Carousel**
  - 6 buyer signals (Cairo, Shanghai, Jakarta, São Paulo, Lyon, Mumbai)
  - Auto-rotates every 4s (`setInterval`), resets on manual dot click
  - Fade+slide animation: `mfg-cardFade` keyframe (0.38s ease)
  - Each card: flag emoji (44px), city/country, "SCINODE VERIFIED" pill with pulsing dot, role title, italic quote
  - 6 dot indicators: active = 20px wide green, inactive = 5px white/22%

**2.2 Profile Performance Card (70%)**
- Gradient accent line at top: `#2ACB83 → #1F6F54 → #0077CC → #D4AF37`
- **Half-pie gauge (SVG):** `M 20 100 A 80 80 0 0 1 180 100` semicircle, stroke-dasharray animates from 0 to `(SCORE/100 × πr)` in 1.4s cubic-bezier on mount. Glow filter: `drop-shadow(0 0 6px rgba(42,203,131,0.50))`
- Discovery Score: `6%`, "GETTING STARTED" amber badge
- **Stepper Timeline:** 3 core steps (Company Profile → Product Catalogue → Terms & Activation)
  - Full-width baseline, green filled portion animates to % complete
  - Pill nodes: Done = `#2ACB83` filled, pending = white border
  - Labels show "✓ Earned" or "Unlock +X%"
- **Section rows:** each row has emoji icon, label, animated solid progress bar (0% → 100% on mount, 1s), buyer-impact metric (e.g. "2,400+ buyers can discover your profile")
- "Add" buttons route to `/dashboard/profile?tab=X`

**2.3 Onboarding Journey Panel (30%)**
- 3-tier access level cards stacked:
  - **Tier 1 — Scinode Starter (ACTIVE):** green border, checkmarks for available features
  - **Tier 2 — After Onboarding (PENDING):** blue border, lock icons, "Complete your profile to activate"
  - **Tier 3 — Opportunity Value:** dark `#0d1117` card, pulsing gold dot "Onboarding Required", **$50,000/mo** in white (28px black), amber urgency bar

**2.4 Product Showcase (70%) + Market Pulse Panel (30%)**
- Product Showcase: horizontally scrollable product catalogue cards
- Market Pulse Panel: `#f0fdf6` bg, teaser for market intelligence features

**2.5 Global Opportunity Map**
- SVG world map with 8 interactive location pins (India, Germany, USA, Japan, Brazil, UK, China, Australia)
- Custom `LocationPin` SVG component: teardrop shape with inner white circle, drop-shadow in tier colour
- 3 demand tiers: High (#f59e0b), Rising (#8b5cf6), Emerging (#3b82f6)
- **Signal tabs:** RFQs / Contract Mfg / CDMO / Catalogue Leads — clicking changes the displayed count
- Active pin pulses (20px vs 16px), info tip shows region + demand tier + metric
- `InfoTip` — portal-based tooltip, position computed from `getBoundingClientRect()`, renders into `document.body` to avoid overflow clipping

**2.6 Projects Matched**
- 6 project cards in horizontal carousel
- Badge types: Exclusive (black), CMO (green), RFQ (blue), Tech Transfer (purple), Open (amber)
- Project cards: image + badge overlay + industry tag + title + description

**2.7 Platform Stats**
- 5 stats: 500+ manufacturers, 120+ projects, 2,400+ requirements, 130+ countries, 4.8/5 satisfaction
- Count-up on `mouseEnter` (same `requestAnimationFrame` pattern, 1400ms)
- Decimal support for 4.8/5

**2.8 Buyers Looking**
- 8 buyer requirement cards in horizontal scroll
- Each card: supplier image, badge pills (RFQ / CDMO / CMO), buyer requirement text, category tag

**2.9 Expert CTA**
- Same dark green gradient as CRO
- "Schedule a call via IONS CONNECT" + pulsing "Available now" dot

**Floating Profile Capsule**
- Fixed bottom-right pill button, opens `ProfileCompletionModal`

**Profile Completion Modal**
- Full-screen modal (backdrop blur) with 8-section profile completion list
- Each section has: emoji, label, score impact, description, buyer rationale, unlocks list, CTA label
- Sections: Company Profile (+10%), Product Catalogue (+25%), Terms & Activation (+35%), Certifications (+50%), Reactors (+65%), Equipment (+78%), EHS Facility (+90%), Utilities (+100%)

---

### 3. Day 1 Dashboard (`Day1Dashboard.tsx`)

**Route:** `/dashboard` (Day 1 state — profile submitted / under review)

**Exports:** `Day1ResearcherDashboard` + `Day1CRODashboard` (both use `Day1DashboardInner` with `profileType` prop)

#### Sections:

**3.1 Hero Row (Left panel + Right compact card)**

*Left: `HeroLeftPanel`*
- Dark green gradient (same as Day 0)
- SCINODE Secure badge with shimmer + tooltip
- Persona-specific headings:
  - Researcher: "Your Next Scientific Breakthrough Starts Here"
  - CRO: "Turn Your Scientific Expertise Into New Industrial Opportunities"
- Two CTAs (persona-specific labels)

*Right: `CompactProfileCard`*
- **Top status strip** (40px): coloured by `ProfileStatus` — incomplete (grey), submitted (amber), verified (green)
- **Progress Ring (110px):** same gradient ring, `strokeDashoffset` 600ms ease, shows % + "Profile Strength"
- **Level badge:** current milestone name with green dot
- **Milestone Timeline:** 4 nodes (Explorer → Visible Researcher → Industry Ready → Verified Partner)
  - Done nodes: filled green with check
  - Active node: white + amber border + `boxShadow`
  - Connectors: `flex-1 h-px` between nodes, green when passed
- **"See all details"** link → opens `ProfileDetailsDrawer`

**3.2 Profile Details Drawer**
- Slides in from right: `translateX(100%) → translateX(0)` in 320ms `cubic-bezier(0.22,1,0.36,1)`
- Backdrop: `rgba(0,0,0,0.38)` + `backdrop-filter: blur(4px)`, click-outside closes
- Status strip (coloured bg)
- **Celebration overlay inside drawer:** same confetti system (24 particles, 8 keyframes `d1cf0`–`d1cf7`)
- Scrollable mission list with `DrawerMissionRow` accordion
- Each mission row: icon → title → subtitle/completion message → `+X% Added` chip
- Expand panel: `animate-in fade-in-0 slide-in-from-top-1 duration-200`

**3.3 Live Industry Data Section**
- Pulsing "LIVE INDUSTRY SIGNALS / LIVE MARKET DEMAND" capsule with streaming dots (`d1-stream` keyframe: opacity + scale pulse, 1.6s, 3 dots staggered 280ms)
- Intelligence banner strip: 3 columns (active opportunities / this week / CTA)
- **Bar chart (70%):** 9 industries, each with animated bar entry
  - Bars animate width from 0% on `IntersectionObserver` trigger (`threshold: 0.1`)
  - Staggered delay: `i × 45ms`
  - **Inactive bars:** hatched diagonal pattern (`repeating-linear-gradient(-45deg)`)
  - **Active bar (hovered/selected):** splits into green (existing) + blue (new this week) segments, glow `boxShadow`
- **Right detail panel (30%):**
  - Selected industry: name + growth badge (`↗ +X%`)
  - Total count + new this week (large numbers)
  - **Sparkline (72×28px SVG):** smooth cubic bezier path (`C` commands), gradient fill, last-point dot
  - Live insight box with pulsing green dot
  - Demand confidence bar (animated width, green gradient)
  - CTA button: changes style based on `ProfileStatus` (blue = incomplete, grey disabled = submitted, green = verified)
- Fade-swap animation on industry change: `animate-in fade-in duration-200`

**3.4 Day 1 Activation Banner**
- Persona-specific: Researcher ("🎯 RESEARCH MATCH FOUND") vs CRO ("🎯 MATCHED OPPORTUNITY")
- Dark green gradient + decorative blobs

**3.5 Open Projects** — reused from Day 0 (CRO or Researcher version)

**3.6 Demand Discovery Day 1** — `DemandDiscoveryDay1` component

**3.7 Day 1 Quick Wins**
- Persona-specific card sets (5 cards each)
- Researcher: Add Publications, Add Patents, Add Unique Expertise, Add Research Interests, Add Certifications
- CRO: Add Services, Add Products, Add Key Expertise, Add Certifications, Complete Company Profile
- Horizontal scroll on mobile, 5-col grid on desktop

**3.8 Testimonials + Talk to Expert** — reused from Day 0

**Animations defined in `<style>` block:**
- `d1-badgeShimmer` (3.5s sweep)
- `d1-stream` (streaming dots)
- `d1cf0`–`d1cf7` (confetti scatter paths)
- Custom scrollbar styles for drawer (`.d1-drawer-scroll`)

---

### 4. Manufacturing Day 1 Dashboard (`ManufacturingDay1Dashboard.tsx`)

**Route:** `/dashboard` (Manufacturing, Day 1 state — 2400 lines)

- Pipeline redesign with unified card layout
- Diagonal bar charts with SCINODE brand palette
- Trial Banner integration
- Pricing Modal trigger
- Sidebar redesign

---

### 5. Projects Listing (`ProjectsListing.tsx`)

**Route:** `/dashboard/projects` (Manufacturing role)

**Features:**
- **Tabs:** Open Projects | Exclusive Projects
- **Search bar** with `Search` icon, debounced
- **Filter Drawer** (slides in from right): 8 filter categories
  - Match Type, Industry, Capability Type, Batch Scale, Geography, Certifications, Deadline, Type of Project
  - Nested sub-filter: Capability-Based → sub-options
  - Applied filter chips shown below search bar with `X` to remove individual filters
- **Segmented match type control** (Capability-Based / Product Catalogue-Based)
- **Project Cards:** image (with top scrim gradient), badge pill top-left (Exclusive/CMO/RFQ/Tech Transfer/Open), industry tag, title, description
- **Exclusive Projects tab** — 3 demo states:
  - `available`: normal cards visible
  - `locked`: cards blurred with lock icon
  - Premium upsell banner with upgrade CTA
- **Trial Banner** — full-width strips at top (2 states with urgency text)
- **Exclusive pill** — black-gold badge on exclusive project cards
- Load more (16 initial, +8 per load)
- `UpgradePremiumModal` triggered from locked exclusive state
- Card proposal limit: `FREE_PROPOSAL_LIMIT = 2`, tracks `PROPOSALS_USED`

---

### 6. Project Detail (`ProjectDetail.tsx` + `ManufacturerProjectDetail.tsx`)

**Route:** `/dashboard/projects/[id]`

**`ManufacturerProjectDetail`:**
- Capability type badge ("Co-Development")
- Trial state / locked state UI
- Full project overview: timeline, milestones, team, requirements

---

### 7. Proposals (`ProposalListing.tsx` + Drawers)

**Route:** `/dashboard/proposals`

**ProposalListing:**
- Proposal cards with status filters
- Status badges: colour-coded

**ProposalDrawer:**
- Slide-over right panel for proposal detail
- `useProposalStore` controls open/close + active proposal

**CMOProposalDrawer:**
- CMO-specific variant with additional fields

**RFQProposalDrawer:**
- RFQ response form within drawer

---

### 8. Market Pulse (`MarketPulse.tsx`)

**Route:** `/dashboard/market-pulse`

**Plan States:** `free-active` | `free-limit` | `premium-active` | `premium-intel-limit`

**Features:**
- **Product selector:** 12 products (Paracetamol, Para Aminophenol, Ibuprofen, Ascorbic Acid, etc.) with CAS numbers. Search/filter dropdown.
- **5 Intel Cards** (each with icon, label, description, bullet list):
  1. Market & Trade (Globe) — import/export trends, top trading countries
  2. Pricing Trends (TrendingUp) — historical price movements, regional comparisons
  3. Demand Insights (BarChart2) — high-demand industries, seasonal patterns
  4. Buyer Activity (Users) — buyer segments, procurement patterns
  5. Regulatory & Compliance (ShieldAlert) — compliance alerts, market risks
- **Free plan:** 5 snapshots/week, 1 detailed intel per week
- **Premium plan:** 10 detailed intel, unlimited snapshots
- **Report view modal:** slides open when "View Report" clicked
- Lock overlays on exhausted intel cards with upgrade CTA
- `Crown` icon on premium features
- `RefreshCw` icon for refresh action
- Plan state toggle in top-right (demo switcher)

---

### 9. Demand Discovery (`DemandDiscoverySection.tsx`)

**Used in:** CRODashboard (Day 0), Day1Dashboard (Day 1), Day10Dashboard

**Exports:** `DemandDiscoveryDay0`, `DemandDiscoveryDay1`

**Features:**
- Profile-type aware (`profileType: "cro" | "researcher" | "manufacturer"`)
- Locked cards with blur overlay (Day 0 state) vs full cards (Day 1)
- Right panel with demand signal data
- CTA changes based on profile completion state

---

### 10. Deep Research Repository (`DeepResearchRepository.tsx`)

**Route:** `/dashboard/research-repository`
**Last updated:** Session 3 (2026-06-10)

---

#### Page Header
- Breadcrumb: `Dashboard > Deep Research`
- H1: **"Deep Research"** (no icon — matches Market Pulse style)
- Subtext + Primary CTA: **"Get started with new research →"** top-right → opens Research Workspace drawer
- **Free Plan banner** (dark `#0e0e0e`, gold border): "Molecules researched: 0 / 20" + "Upgrade to Premium"
- **Demo switcher:** `Day 0 — No Research Done` | `After First Search`

---

#### Demo State: Day 0 (UNCHANGED)

**Top row (70/30 grid, `items-stretch`):**
- LEFT 70% — `WorkspaceCards` component: two workspace cards side-by-side
  - Card 1: AI RESEARCH WORKSPACE tag, FlaskConical icon, "Research Workspace", feature chips (Route Generation / Route Variants / Graph View / Process Flow), outline CTA → opens drawer (research tab)
  - Card 2: LITERATURE SYNTHESIS tag, BookOpen icon, "Literature Workspace", feature chips (Literature Analysis / Patent Search / Evidence Summaries / Citation Tracking), outline CTA → opens drawer (literature tab)
  - Hover: `border-[#1a5c3a]` + `shadow` + `-translate-y-0.5`. CTA: outline → fill on hover (all Tailwind, no inline color — CSS specificity fix)
- RIGHT 30% — `DeepResearchBannerCard`: dark green gradient + ambient blobs + "NEW" chip + "How Deep Research works →" CTA → `HowItWorksModal` + stat strip (400+ / 10× / Free)

**Full-width below:** `RecentCompoundsSection hasData={false}` — empty state: flask icon + "No research done yet" + "Start New Research" CTA

---

#### Demo State: After First Search — Layout (Session 3)

**70/30 grid split:**

**LEFT 70% — `RecentCompoundsPanel`**
- Section heading: **"My Recent Repository"** + "View all →"
- Row 2 (full width): Workspace toggle (Research / Literature) LEFT + Sort dropdown RIGHT

**Research Workspace tab (6 cards, 3×2 grid):**
- PubChem molecule image (grid bg) + name + CAS·formula + routes badge + date
- Buttons: **"View Details"** (filled green, `rounded-lg`) + **"Resume"** (outline, `rounded-lg`)
- Cards 5 & 6 on page 1: blurred content + lock overlay ("Upgrade to unlock" / "Go Premium" green CTA)
- **Numbered pagination** `< 1 2 >` below grid (6 cards/page)
- Data: `RESEARCH_COMPOUNDS` — 8 items (Paracetamol, Ibuprofen, Ascorbic Acid, Citric Acid, Metformin HCl, Acetylsalicylic Acid, Caffeine, Benzyl Alcohol)

**Literature Workspace tab (4 paper cards/page):**
- Paper card style: green BookOpen icon box + bold green title + external link icon
- Source pill (green) + year + DOI text
- Abstract text + "Show more / less" toggle
- Actions: **Read paper** | **Extract conditions** (left) · **Save to vault** (right)
- **Numbered pagination** `< 1 2 >` below
- Data: `LITERATURE_PAPERS` — 8 papers (real pharma/chem titles with source/DOI/abstract)

**RIGHT 30% — Workspace cards + Deep Research banner:**
- WORKSPACES label → `WorkspaceCards` vertical (Research + Literature stacked)
- DEEP RESEARCH label → `DeepResearchBannerCard`

---

#### View Details → `CompoundDetailModal` (Session 3)

Full-screen `z-50` overlay, fade-in + slide-up animation (`opacity 0→1, translateY 10px→0, 250ms`).

**Top bar:**
- `← Repository` back button | compound name + CAS/formula | Export PDF | **Resume Chat** (green filled) | Vault (with count badge)

**Body layout: LEFT sidebar (always visible) + RIGHT panel with tabs**

**Left sidebar — Routes (always shown regardless of active tab):**
- Route cards for Route A–E: route letter bold + score badge (green when selected), steps/yield, description snippet (truncated)
- ⭐ **"Most Efficient"** amber badge on Route A (9.0)
- ⬇️ **"Lowest Score"** red badge on Route C (7.2)
- Click a route → updates right panel route content AND switches to Routes tab
- **"Resume Chat" button** fixed at bottom of sidebar → opens research workspace drawer with pre-seeded chat

**Right panel — 4 tabs + route indicator pill:**

**Tab 1: Routes**
- Summary card: route letter/name + Most Efficient/Lowest Score badges + score /10 (top-right large)
- Param chips row: YIELD (green) / STEPS (blue) / TEMP (amber) / TIME (purple) / MODE (grey)
- Summary paragraph text
- Synthesis scheme: molecule transform images (from/to with reagent pills + conditions arrow)
- Workup + Purification (2-col cards)
- Route score breakdown: Feasibility / Affordability / IP Risk bars (`ScoreBarSmall`)
- References with external link icons

**Tab 2: Bill of Materials**
- **Batch scale selector**: `1mmol` | `1g` | `100g` | `1kg` — live recalculates all quantities via `fmtMmol()` + `fmtMass()` helpers
- Route summary table: Material / Role / MW / Total amount / Total mass / Used in steps
- Step-by-step breakdown (collapsible chevron): step header (number + title + mmol substrate), materials table (Material / Role / Equiv / Amount / Mass·Vol)
- Data: `BOM_SUMMARY_BASE` (3 rows) + `BOM_STEP_BASE` (4 rows including product)

**Tab 3: Literature**
- Green BookOpen icon cards: bold green title + date right-aligned + year · source + abstract text
- Data: `COMPOUND_SYNTHESIS_LITERATURE` — 4 synthesis-specific papers

**Tab 4: Patents**
- Amber shield icon cards: country code pill (US/EP/WO/DE) + patent number + amber title + date
- Data: `PATENT_DATA` — 4 patents (EP active, WO active, US active, DE expired/public domain)

**Route data (`DETAIL_ROUTES`):**
| Route | Name | Score | Steps | Yield | Flag |
|---|---|---|---|---|---|
| A | Classical Acetylation | 9.0 | 1 | 85–95% | ⭐ Most Efficient |
| B | Kolbe-Schmitt Synthesis | 8.5 | 4 | 55–65% | — |
| C | Enzymatic Green Route | 7.2 | 1 | 65–75% | ⬇️ Lowest Score |
| D | Solid Acid Catalysis | 7.8 | 3 | 58–65% | — |
| E | Continuous Flow Process | 8.2 | 4 | 60–70% | — |

---

#### Resume Flow (Session 3)

- **Resume** button from repository card OR **Resume Chat** from inside `CompoundDetailModal` sidebar/top bar
- Opens `ResearchWorkspaceModal` with `preloadedMessages` prop — 4 pre-seeded messages (user query + agent analysis + user follow-up + agent IP risk answer — all compound-specific)
- `preloadedHasResult=true` → `ResearchResultCanvas` loads immediately showing existing results
- `ResearchWorkspaceModal` new props: `preloadedMessages?: {role, text}[]`, `preloadedHasResult?: boolean`

---

#### Research Workspace Drawer → Full Screen (`ResearchWorkspaceModal`)

**Animation (key decision — only `left` animates, `right: 0` fixed):**
- Entry: `left: 100vw → 38vw` (drawer mode)
- Expand: `left: 38vw → 0px` (full screen, covers sidebar)
- Collapse: `left: 0px → 38vw`
- Transition: `340ms cubic-bezier(0.22,1,0.36,1)`
- Backdrop: stays in DOM, `opacity: 0.28 → 0` when expanded, `pointerEvents: none`

**Top bar (52px):**
- Left: `← Deep Research > Research/Literature Workspace` breadcrumb (click = close)
- Centre (expanded only): Research Workspace | Literature Workspace toggle
- Right: Expand/Collapse (outline drawer → filled green expanded) + `×` close (drawer only)

**Chat panel (300px drawer / 360px expanded):**
- History 7 + `+ New` green button
- Compact Research | Literature toggle in drawer mode
- Empty: agent icon + name + 4 suggested prompts (context-aware per tab)
- Messages: user (green right) + agent (grey left) with Flask icon
- Auto-resize textarea + send button + shortcut hint

**Research Canvas (flex-1 right):**
- Empty: Layers icon + "Research canvas" text
- After send or preloaded: `ResearchResultCanvas`

**Literature mode:** `LiteratureWorkspace` replaces both chat + canvas (full-width split)

---

#### `ResearchResultCanvas`

**Header:** Flask icon + "ROUTE OF SYNTHESIS" + "5 routes evaluated" badge | Share + Provenances (filled green + count when active) + Save to Vault

**Target molecule card:** aspirin (CID 2244), CAS/formula/MW/SMILES/InChIKey

**5 Route cards (horizontal scroll):** A(3s,67%,8.5) B(4s,70%,8.5) C(4s,70%,7.8) D(2s,75%,7.2) E(4s,85%,8.5 Best). ScoreBar for Feasibility/Affordability/IP Risk. Selected = green border+ring.

**Synthesis Scheme:** Route A–E tabs + Steps/Graph/Modify Path/Stoichiometry. Route E 4-step 2-col grid: molecule transforms, conditions, amber reagent pills, expandable workup, refs.

**Analysis panel:** `linear-gradient(135deg, #0a2640→#0d3d26→#0a2640)`. 4 score tiles + colour-coded analysis text + weighted formula footer.

**Provenances drawer:** `position:absolute z-20`, slides `translateX(100%→0)`. Blur backdrop `z-10 rgba(15,25,20,0.35) backdrop-blur(3px)`. 5 provenance cards.

---

#### `LiteratureWorkspace` (inside drawer)

**Left 30%:** Search + Search button, 14 source pills, date range From/To, Sort By (Relevance/Newest/Oldest), TRY 6 suggested searches (auto-run on click)

**Right 70%:** loading spinner | empty state | results: "N results for 'query'" + ✦ Synthesize, result cards (checkbox + green dot + title|journal + source pill + year + abstract "Show more" + Read paper / Extract conditions / Save to vault)

---

#### Modals

**`HowItWorksModal`:** dark green header, 4-step workflow, 6 benefit cards (Faster route discovery / Improve confidence / Increase throughput / Preserve knowledge / Eliminate duplicates / Move faster to scale-up)

**`UpgradeModal`:** dark green header, 6 premium features list, "Maybe later" + "Upgrade to Premium"

---

### 10b. Module Changes — Market Pulse (`MarketPulse.tsx`)
- Removed Activity icon from H1 heading — now plain "Market Pulse" text only

---

---

### 11. Demand Catalyst (`DemandCatalyst.tsx`) — Session 7 ACTIVE CAMPAIGN REDESIGN

**Route:** `/dashboard/demand-catalyst`
**File:** `src/modules/dashboard/DemandCatalyst.tsx` (~4,434 lines as of Session 8)
**Sidebar entry:** "Demand Catalyst" with `Megaphone` icon

#### Session 7 — s3-active Scene Redesign (Campaign Command Center)

**UX principle:** Mission Control — users understand entire campaign status within 5 seconds. No sub-page navigation; dynamic content panels update in-place.

**New components:**

| Component | Purpose |
|---|---|
| `MissionControlStrip` | Dark `#020202` full-width KPI band. 5 KPIs (Active Campaigns / Total Leads / MQLs / Active Markets / Avg Health) + live bottom row showing all products' stage + action badges. Replaces old `CampaignKpiHeader`. |
| `UrgentActionsBanner` | Amber strip surface at top of AllProductsView when actions exist. Lists each urgent action inline with CTA. Prevents users from missing critical steps. |
| `CampaignRunwayPanel` | Visual per-product timeline: stage stepper + 90-day progress bar + health badge + leads count. Click any row to drill into that product. Replaces old `PipelineRow` component. |
| `ProductSwitcher` | Redesigned pills — each product pill shows inline health score (colour-coded), amber dot when action required. "All Campaigns" pill shows count badge. |
| `ProductCommandHeader` | Replaces `ProductHeroBanner`. Shows campaign day/progress bar, health tile, leads tile, stage stepper, action alert inline. |
| `SetupForDemandView` | **NEW — was completely missing.** Stage 1 product readiness form: Identity (name/CAS/grade/purity/MOQ), Commercial Readiness (availability toggle, capacity, price, capabilities chips, target countries), Documents (COA/MSDS/TDS + compliance certs), product completeness donut sidebar. "Continue to Map the Market →" CTA. |
| `StageStepper` | Shared stepper component used in both `CampaignRunwayPanel` and `ProductCommandHeader`. |

**AllProductsView order (redesigned):**
1. `UrgentActionsBanner` — urgent first
2. `CampaignRunwayPanel` — visual stage progress
3. `AllPerformanceTable` — performance numbers
4. `WeeklyLeadsChart` + `TopMarketsPanel` — side by side
5. `ActionCenter` — full task list

**WeeklyLeadsChart** now has per-product filter (All / THF / TEP / TEC) using `useState`.

**Product stages now fully covered:**
- Stage 1 Setup for Demand → `SetupForDemandView` ✅ NEW
- Stage 2 Opportunity Scan → `OpportunityScanView` ✅
- Stage 3 Demand Generation → `DemandGenerationView` ✅
- Stage 4 Lead Pipeline → `LeadPipelineView` ✅

**Concept:** Managed B2B growth service. User adds products to catalogue (mirrored from Profile → Product Catalogue), selects up to 5 as "star products", then starts the Demand Chain. SCINODE's team runs targeted campaigns and delivers verified buyer opportunities.

**Design language:** Matches Deep Research module exactly — same `lg:grid-cols-10` 7/3 layout, `WorkspaceCards` card style, dark right panel (`DeepResearchBannerCard` equivalent), plan banner (`bg-[#0e0e0e]` + gold Crown), section labels, breadcrumb + H1 layout.

---

#### Demo Scene System

```ts
type Scene = "day0" | "s1-1" | "s1-3" | "s2-2" | "s2-5";
```

| Scene | Label | Products | Stars |
|---|---|---|---|
| `day0` | Day 0 — No Products | 0 | 0 |
| `s1-1` | 1 Product Added | 1 | 0 |
| `s1-3` | 3 Products, No Stars | 3 | 0 |
| `s2-2` | 2 Stars Selected | 3 | 2 (dc-p1, dc-p2) |
| `s2-5` | 5 Stars — Ready | 5 | 5 (all) |

`useEffect([scene])` drives `starredIds` + `campaignStarted` reset per scene.

---

#### Page Layout

**No sticky module header** — follows Deep Research pattern:
- Breadcrumb: `Dashboard > Demand Catalyst` (in content area)
- H1: "Demand Catalyst" + subtext
- **Top-right CTA** changes per state:
  - Day 0: "Add Product →"
  - Has products, no stars: "Select Star Products →"
  - Has stars: "Start Demand Chain →"
  - Campaign started: "View Campaign Status →"

**Plan Banner** (dark — matches Deep Research exactly):
- `bg-[#0e0e0e]` + gold border `rgba(201,162,39,0.40)`
- Crown icon in amber-tinted box
- "Free Plan Active" + "Demand Catalyst" emerald badge
- Count: "Star products: X / 5" in `#f5c842` amber
- "Upgrade to Premium" button: `linear-gradient(90deg,#f5c842,#c9a227)` gold

**Demo Switcher** — same style as Deep Research: white bordered pill container.

**70/30 grid** (`lg:grid-cols-10`):
- LEFT `lg:col-span-7` — CAMPAIGN WORKSPACE label + state content
- RIGHT `lg:col-span-3` — DEMAND CATALYST label + dark panel

---

#### Left Panel (CAMPAIGN WORKSPACE) — State-Driven

**View `"empty"` (Day 0 — no products):**
`WorkspaceCards` component — two side-by-side cards exactly matching Deep Research WorkspaceCards:

| Card | Tag | Icon | Title | Feature chips | CTA |
|---|---|---|---|---|---|
| 1 | PRODUCT CATALOGUE | Package (green) | "Add Your Products" | Product Name & CAS / Grade & Purity / MOQ & Status / Inventory Location | "Add Product" (outline → fill on hover) |
| 2 | STAR PRODUCTS | Star (amber) | "Select Star Products" | Up to 5 nominations / Campaign readiness check / Update anytime / You stay in control | Locked (grayed, Lock icon) until products exist |

Card hover: `hover:border-[#1a5c3a] hover:shadow-[0_4px_20px_rgba(26,92,58,0.12)] hover:-translate-y-0.5`
Feature chips: `bg-[#f0fdf4] text-[#1a5c3a]` with `CheckCircle2` icon

**View `"products"` (has products):**
1. `StarSlotsBar` — 5 slot dots (filled green = starred, dashed border = available, gray = no product), status text, "Start Demand Chain with X Products →" CTA (visible only when stars > 0)
2. `ProductsTable` — star toggle column (amber ⭐ when starred, slate outline otherwise), product rows with amber `bg-[#fffbeb]` highlight when starred. Columns: ☆ | Product Name | CAS | Industry | Grade | Purity | MOQ | Status. "Add Product" button in table header.

**View `"campaign"` (after start):**
`CampaignStartedPanel` — green success strip + starred products list with "In Campaign" badges.

---

#### Right Panel (DEMAND CATALYST) — Always Visible

`DemandCatalystPanel` — mirrors `DeepResearchBannerCard` exactly:
- `linear-gradient(160deg,#0d2818 0%,#0a1e10 55%,#091510 100%)` dark green bg
- Radial glow blobs (emerald + forest green)
- "NEW" badge: `rgba(42,203,131,0.15)` bg + emerald dot
- Heading: "Accelerate Your Growth with Demand Catalyst"
- 4 bullet points with `rgba(42,203,131,0.18)` circles
- CTA: **"How It Works →"** `bg-[#6ee7b7]` button → opens `HowItWorksModal`
- Stats strip: `bg-[rgba(0,0,0,0.20)]` — 2,400+ / 18K+ / 60+

---

#### How It Works Modal

Centered popup (not side drawer). `max-w-[860px]` `max-h-[90vh] overflow-y-auto`.

**Dark header** (`linear-gradient(135deg,#0d2818,#0a1e10)`):
- "HOW DEMAND CATALYST WORKS" emerald badge
- H2 + subtext
- Stats: 2,400+ / 60+ / 18K+ / 100%

**Body:**

3-column step cards (`grid-cols-3`):

| Step | Icon | Title | Outcome |
|---|---|---|---|
| 01 | Package (green) | Add Products & Select Stars | "Your star products are locked in and campaign-ready." |
| 02 | Megaphone (purple) | SCINODE Runs Campaigns | "SCINODE does the BD work. You focus on fulfillment." |
| 03 | Target (green) | Receive Verified Opportunities | "Exclusive, qualified, context-rich — ready to act on." |

Each card: numbered circle + icon + title/intro header, 4 bullets in `bg-[#e3f5ec]` check circles, outcome in `bg-[#f0fdf4] border-[#bbf7d0]` green strip.

**WHY SUPPLIERS CHOOSE DEMAND CATALYST** — 3-col benefit grid (`bg-[#fafafa]` cards):
Users (Dedicated Sales Team) | Radio (Multi-Channel Campaigns) | BarChart3 (Campaign Analytics) | Target (Qualified Leads) | ShieldCheck (SCINODE Shield) | Globe (Global Network)

CTAs: "Add Product →" (`linear-gradient(135deg,#1a5c3a,#0d3d26)`) + "Close"

---

#### Data

`DEMO_PRODUCTS` — 5 items with full `Product` type fields:
- dc-p1: Paracetamol API (103-90-2, Pharmaceuticals, IP Grade, 99.8%, 200kg, In inventory, GIDC Gujarat)
- dc-p2: Ibuprofen API (15687-27-1, Pharmaceuticals, 99.5%, 100kg, In inventory, Ankleshwar)
- dc-p3: Citric Acid Anhydrous (77-92-9, Food & Beverage, Made to order)
- dc-p4: Ascorbic Acid USP (50-81-7, Nutraceuticals, 99.0%, 250kg, In inventory, Vadodara)
- dc-p5: Caffeine Anhydrous EP (58-08-2, Nutraceuticals, 99.5%, 50kg, In inventory, Mumbai)

---

#### Key Design Decisions (Session 6)

| Decision | Reason |
|---|---|
| Products mirrored from Profile store (`useProfileStore`) | Products added in DC are saved to Profile → Product Catalogue — unified data source |
| `AddProductDrawer` imports `DrawerBase`, `SharedUI`, `constants`, `types` from profile module | Reuses identical form so data is truly the same across both modules |
| Blue info note in Add Product drawer | Explicitly tells users "Products added here appear in Profile → Product Catalogue" |
| `HowItWorksModal` is a centered popup (not side drawer) | User spec: "pop-up modal ... must not overlay the overview" — centered overlay with translucent backdrop, overview visible behind |
| Removed `state2`, `state3`, `state4` from old Demand Catalyst | Replaced with cleaner `"empty" / "products" / "campaign"` view logic derived from `displayProducts.length` and `campaignStarted` |
| `WorkspaceCards` locked state for "Star Products" when no catalogue | Prevents selecting stars before adding any products; shows Lock icon + explanatory text |
| `StarSlotsBar` CTA visible only when `starCount > 0` | Avoids dead CTAs; user must actively star before they can launch |

---

#### Previously Built (Sessions 4–5) — Now Replaced

The following components from the old DemandCatalyst.tsx were removed in Session 6:
`EmptyStatePanel`, `NoCatalogCard`, `ProductSelectionPanel`, `LaunchPanel`, `RightPanel`, `DemandCatalystBanner` (old version), `BenefitsModal`, `KpiCards`, `VerticalTimeline`, `ReadinessBadge`, `HowDCHelpsAccordion`, `HowItWorksTab`, `WhatYouGainTab`, `YourGrowthTab`, `StarProductKpiCard`, `DcScene` (old type), `STATE4_PRODUCTS`, `CATALOG_PRODUCTS`.

---

#### Previous Demo State System (Sessions 4–5 — superseded by Session 6)

The old 4-state system (`state1`/`state2`/`state3`/`state4`) with `EmptyStatePanel`, `NoCatalogCard`, `ProductSelectionPanel`, `LaunchPanel`, `KpiCards`, `VerticalTimeline`, and `BenefitsModal` has been fully replaced by the Session 6 architecture described above.

---

#### File Location

```
src/
├── app/dashboard/demand-catalyst/page.tsx   — thin wrapper, renders <DemandCatalyst />
└── modules/dashboard/DemandCatalyst.tsx     — ~480 lines (Session 6 rewrite)
```

Sidebar wired in `Sidebar.tsx`: `{ label: "Demand Catalyst", href: "/dashboard/demand-catalyst", icon: Megaphone }`.

---

### 11b. Demand Catalyst — Session 8 MAJOR ADDITIONS

#### Session 8 Changes Overview
- **Opportunities by Product section** fully redesigned (master-detail layout)
- **Product Campaign Status** table: "Leads" column renamed → "Opportunities"
- **Product Detail Screen system** — full-page navigation from overview table, three distinct scenario screens
- **ACTIVE_CAMPAIGN_PRODUCTS** data restructured to model a real 3-stage demo journey across 3 named products
- **New CSS animations** added to `AC_STYLES`

---

#### 11b-1. Opportunities by Product — Full Redesign (Section 03)

Replaced the old three-card layout + broken `WeeklyLeadsSection` call with a unified **master-detail panel**.

**New components:**

| Component | Purpose |
|---|---|
| `OpportunityLineChart` | Full-width SVG line chart. 6-week data, gradient fill, value labels above each point, pulsing ring on latest point, "+X this week" badge top-right. Used as main visualization inside detail panel. |
| `CountryTiles` | Grid of country tiles: flag emoji + large coloured count number + country name + mini progress bar (relative to max). Replaces old bar chart style. |
| `PipelineFunnel` | 4-step horizontal funnel: Opportunities received → Proposals sent → In negotiation → Won. Each step shows count + percentage. Chevron arrows between steps on `bg` tinted cells. |
| `ProductSelectorPanel` | Left panel (210px). "All Products" row + per-product rows. Each row: coloured dot + name + stage pill + action-needed badge + opportunity count + weekly delta. Active state: left accent bar in product colour. |
| `OpportunityDetailContent` | Right flex panel. Contains: KPI strip (3 tiles) + `OpportunityLineChart` + `CountryTiles` + `PipelineFunnel` (product-specific) + CTA button. |
| `BuyerEnquiryRow` | Expandable `<tr>` row. Click to expand inline detail. Columns: # / Buyer Company (flag + name + country) / Quantity / Date Received / Enquiry Type / Status / Action (context-aware: Send Proposal / Continue Negotiation / View Agreement) / Chevron. |
| `BuyerEnquiriesView` | Full buyer enquiries table, appears inline below the master-detail panel on CTA click. Header: back button + product name + total count. Pipeline summary strip. Filter tabs (All / Proposal / Negotiation / Won) with counts. Table with `BuyerEnquiryRow`. Footer: "Showing X of Y · Export all →". `scrollIntoView` auto-scroll on open. |
| `OpportunitiesSection` | Master section component. `useState` for `selectedId` (default "all") + `enquiriesProductId`. Selecting a product clears enquiries panel. "View X buyer enquiries →" triggers scroll + opens `BuyerEnquiriesView` below. |

**Data structures:**
```ts
OPP_WEEKLY: Record<"all"|"thf"|"tep"|"tec", number[]>   // 6-week arrays
OPP_PRODUCT: Record<string, {
  total: number; thisWeek: number;
  countries: { flag; name; count; pct }[];
  pipeline?: { proposals; negotiation; won };
  actionNeeded?: true;
}>
BUYER_CARDS: Record<string, {
  flag; company; country; qty; date;
  type: "Capability" | "Catalogue";
  status: "Proposal" | "Negotiation" | "Won";
}[]>
STATUS_BADGE: Record<string, { bg; color }>
```

**UX flow:**
1. "All Products" selected by default → shows aggregate KPIs + chart + 6-country tiles + hint CTA
2. Click individual product → detail updates in-place (chart colour changes to product dot colour)
3. "View X buyer enquiries →" → smooth scroll + `BuyerEnquiriesView` expands below
4. Filter tabs in enquiries view filter table rows live
5. Click any row → inline expand shows full detail + contextual action buttons
6. Back button in enquiries header collapses the table

---

#### 11b-2. Product Campaign Status — Column Rename

`ProductStatusTable` header: **"Leads" → "Opportunities"** to accurately reflect the metric shown (qualified buyer enquiries, not leads).

---

#### 11b-3. ACTIVE_CAMPAIGN_PRODUCTS — Data Restructure

Products reassigned to model a real sequential 3-stage demo journey:

| Product | Stage | stageIndex | Action Required | Dot Colour |
|---|---|---|---|---|
| Tetrahydrofuran (THF) | Setup for Demand | 1 | "Complete Setup" | `#2ACB83` green |
| Triethyl Phosphate (TEP) | Opportunity Scan | 2 | "Accept Market Plan" | `#0077CC` blue |
| Triethyl Citrate (TEC) | Demand Generation | 3 | — | `#6237C7` purple |
| Sodium Bromide (SNB) | Lead Pipeline | 4 | — | `#f59e0b` amber |

Previously: THF = Demand Generation (stageIndex 3), TEC = Lead Pipeline (stageIndex 4), SNB = Setup for Demand (stageIndex 1).

`RUNNING_PRODUCTS_AC` (stageIndex > 1) now = TEP + TEC + SNB.

---

#### 11b-4. Product Detail Screen System

Full-page navigation: clicking "View Details →" in `ProductStatusTable` replaces the Active Campaign page content with `ProductDetailScreen`. Back button restores the overview (no route change — pure `useState`).

**Navigation state in `ActiveCampaignPage`:**
```ts
const [viewingProduct, setViewingProduct] = useState<CampaignProduct | null>(null);
```
When set → renders `ProductDetailScreen`; when null → renders full overview.

**`ProductDetailScreen` layout (all products):**
1. **Back button** — `← Back to Overview`, resets `viewingProduct` to null
2. **Product header card** — Star icon in product colour tint box, product name, CAS · industry, "⏱ 90-day campaign · Day X of 90" amber badge
3. **`DetailStageStepper`** — mirrors `CampaignTimelineStrip` exactly (same `STAGE_EXPLAINER` data, `STAGE_META` colours, `dc-line-sweep` animation, icon circles). Active stage circle has deep green gradient + `dc-active-stage` pulsing beacon animation. Completed stages show filled coloured circles. Pending stages show muted grey circles.
4. **Stage-specific content** — see below

**`DetailInfoCards`** — 3 info cards placed **below Product Completeness** in Setup for Demand screen (moved from top of detail screen):
- 📊 Expected First Signals: "Enquiries typically begin in 2–4 weeks once your campaign goes live."
- 🙏 What We Need From You: respond within 24h, dispatch samples within 5 days
- ✏️ Honesty Is The Plan: "We say expected first signals, never guaranteed leads."

---

#### 11b-5. Screen A — Setup for Demand (THF)

**Pre-population:** `THF_FORM_PREFILLED` const (mirrors what a fully-filled Profile → Product Catalogue entry looks like). Form fields pre-filled from this demo data. Editable — user can update before submitting.

**Left sidebar (lg:col-span-3, sticky):**
- **Product Completeness donut** — SVG donut (100px), score / 100, "Strong" / "Good" / "Weak" badge, animated `stroke-dasharray`
- Section breakdown bars: Identity (green, /45) · Commercial (blue, /30) · Documents (purple, /25)
- `DetailInfoCards` — 3 info cards directly below completeness card

**Right main area (lg:col-span-7):**
- **Identity** section — Product Name (full-width), CAS Number, Industry (select), Grade (select), Purity (%), MOQ + unit dropdown
- **Commercial Readiness** section — Availability toggle (Made to Order / In Inventory), Production Capacity + Unit, Price, Packaging, Lead Time, Incoterms (select), Unique Capabilities chips (toggle), Target Countries chips (toggle)
- **Documents** section — A: Product-level docs (COA Required / MSDS optional / TDS optional) as toggleable cards; B: Compliance Certificates — editable row table (Certificate Name / Issuing Authority / Product|Plant scope toggle / delete), "Add Another Certificate" button, "Recommended for my markets" button
- **Footer CTA** — "Changes autosave · You can keep editing until you Accept the plan in Stage 2" text + "Continue to Map the Market →" gradient button

**Completeness calculation:**
```ts
identScore = filled fields out of 6 → ×45
commScore  = filled fields out of 7 → ×30
docScore   = filled items out of 4  → ×25
pct = sum capped at 100
```

---

#### 11b-6. Screen B — Opportunity Scan (TEP)

Market plan uploaded by SCINODE admin. User must read and approve before campaign launches.

**Layout (single column):**
1. **Plan Published action bar** — "● Plan Published" green badge + "You can still edit Stage 1 details…" note + "Schedule a Call" outline button + "Accept Plan" green gradient button
2. **Market Verdict by Country** — 4 country cards (Germany: Strong Demand green / India: Emerging Demand blue / France: Emerging Demand blue / UAE: Weak Demand red)
3. **Present Search Volume** — "1,240 monthly searches · ↑ 18% vs prior 90 days"
4. **Channel Mix** — PAID pills (Website / Scinode / Other) + ORGANIC pills (LinkedIn / Google / Others)
5. **Market Signals** — 3 bullet points with green dot indicators (real buyer behaviour intel)

**"Accept Plan" flow:** `useState(accepted)` → on click sets `accepted = true` → shows success state ("Plan Accepted! Campaign is now live…")

---

#### 11b-7. Screen C — Demand Generation (TEC)

Live campaign execution view. Week selector drives all data.

**Week selector:** `All | Week 1 | Week 2 | Week 3` pill tabs. `useState<"All"|"Week 1"|"Week 2"|"Week 3">` defaults to "Week 1".

**Data:**
```ts
TEC_WEEK_DATA: Record<"Week 1"|"Week 2"|"Week 3", {
  salesReachout; salesCaptains; meetings;
  geoBreakdown: { label; flag; pct }[];
  sizeBreakdown: { label; pct; color }[];
  salesLeads: { flag; country; qty; date }[];
  paidChannels: { ch; clicks; mql; leads }[];
  organicChannels: { ch; clicks; mql; leads }[];
  totalClicks; totalMqls;
  digitalLeads: { flag; country; qty; date }[];
}>
TEC_ALL  // aggregated across all 3 weeks via reduce()
```

**Sales Engine section:**
- Big dark green card: "Sales Reachout — X buyers contacted" + sub-stats (sales captains, meetings booked)
- Sales Force Deployed + Meetings Booked metric tiles
- Reachout Bifurcation: **By Geography** (SVG pie + legend) + **By Company Size** (SVG pie + legend)
- `MiniPieChart` component — pure SVG path rendering from arc math, no external charting lib
- Leads from Sales Engine: country flag + name + quantity + date + "Send Proposal" CTA

**Digital Engine section:**
- PAID CHANNELS table (Channel / Clicks / MQL / Leads) + ORGANIC CHANNELS table side by side
- Total Clicks + Total MQLs dark tiles (`bg-[#0f172a]`)
- Leads from Digital Engine: same lead card format + "Send Proposal" CTA in blue

---

#### 11b-8. New CSS Animations (added to `AC_STYLES`)

| Class | Keyframe | Effect |
|---|---|---|
| `.dc-active-stage` | `dc-stage-beacon` | Deep green gradient circle pulses: `box-shadow` expands from 0 → 10px ring → 0, inner glow fades in/out. 1.8s ease-in-out infinite. |
| `.dc-beacon-ring` | `dc-beacon-ring` | Absolute positioned `border-2` div expands from `scale(1)` → `scale(2.2)` + `opacity: 0.6 → 0`. 1.8s ease-out infinite. Creates expanding ring halo around active stage circle. |

**Active stage gradient:** `linear-gradient(135deg, #0d3d26 0%, #1a5c3a 50%, #2ACB83 100%)`

---

#### 11b-9. Key Design Decisions (Session 8)

| Decision | Reason |
|---|---|
| `WeeklyLeadsSection` removed (was undefined, caused build error) | Consolidated weekly trend data into `OpportunitiesSection`'s `OpportunityLineChart` — one section, no duplication |
| Buyer enquiries as inline table (not card grid) | Table gives more data density, scannable columns, and inline expand without navigating away |
| `BuyerEnquiriesView` scrolled into view on open | Large page — auto-scroll prevents user from missing the expansion |
| Product detail as full-page state swap (not route change) | No URL change needed; back button restores scroll position + state in one `setState` call |
| `DetailStageStepper` mirrors `CampaignTimelineStrip` exactly | Same icon circles, STAGE_META colours, dc-line-sweep animation — consistent visual language across overview and detail |
| `DetailInfoCards` moved below Product Completeness (not above timeline) | Info cards are contextual to the form filling; placing them below the donut groups them with the left sidebar context, removing visual clutter from the top |
| THF reassigned to Setup for Demand | Demo now tells a coherent 3-product story: THF (just starting) → TEP (plan ready) → TEC (campaign live) — each screen shows a different stage of the journey |
| `TEC_WEEK_DATA` week-by-week data structure | Enables "View by Week" toggle showing progressive growth story; `TEC_ALL` aggregated via `reduce()` without duplication |
| `MiniPieChart` built without external charting lib | Pure SVG arc math; no bundle weight; consistent with the project's no-external-chart philosophy |
| `PipelineFunnel` as horizontal 4-step strip | Shows conversion at a glance — "out of 24 received, 14 proposals sent (58%), 7 in negotiation (29%), 3 won (13%)" — reads left to right like a funnel |

---

### 11c. Demand Catalyst — Session 9 DEMAND GENERATION STAGE REDESIGN

#### Session 9 Changes Overview

All changes are inside `DemandCatalyst.tsx`. Focus: Demand Generation stage (Stage 3), Market Signals section, and Recommended Channel Mix section.

---

#### 11c-1. Market Signals Section (NEW — between Country Demand Analysis and Recommended Channel Mix)

Added a new `Market Signals` section inside the `ExecutionPlanningDetail` component, positioned between the **Country Demand Analysis** cards and the **Recommended Channel Mix** card.

**4 signal cards** (flat white `#f9fafb` background, `#e4e4e7` border — all neutral, no accent colors):

| Signal | Icon | Content |
|---|---|---|
| Top Performing Markets | Globe | Germany leads demand — 3 EU distributors posted RFQs. Japan diversifying from China. Country tags: Germany/Japan/USA |
| Must-Have Certifications | ShieldCheck | REACH mandatory for EU. Status pills: REACH EU (missing), ISO 9001 (available), FDA USA (missing) |
| Buyers vs Competitors | Users | Germany: 14 buyers vs 6 competitors. Grid: Germany/USA/Japan with buyers + competitors counts |
| Product Trend | TrendingUp | TEP search volume +34% over 90 days. Tags: "+34% Search Volume", "EU Reg. Tightening" |

**Design decisions:**
- All cards use `bg-[#f9fafb] border border-[#e4e4e7]` — deliberately neutral, no colored left borders
- Icons use `text-slate-500 bg-[#f3f4f6]` — muted, not accent-colored
- "Updated Weekly" badge removed per user request
- Removed `Market Intelligence` section (5 cards: Country-Specific Requirements, Mandatory Documents, Recommended Documents, Regulatory & Legal, Certification Readiness) entirely

---

#### 11c-2. Recommended Channel Mix — UI Changes

**Pie chart left panel redesign** (matches reference image):
- Removed old legend rows (Sales Force 70% / Digital 30%) below pie chart
- Added two stacked metric blocks below pie:
  - **DIGITAL CONTRIBUTION** — `30%` in `#0077CC` blue (28px font-black)
  - Horizontal divider
  - **OFFLINE TEAM DEPLOYED** — `70%` in `#2ACB83` green (28px font-black)
- Info icon `ⓘ` moved to top-right of pie panel with tooltip opening **right side** of icon (`left-8 top-0`, arrow points left)
- Removed "Digital Contribution 65%" stat from card header entirely
- Tooltip z-index raised to `z-[100]` to layer above all content

**Channel labels:** "Organic (70%)" → "Organic", "Paid (30%)" → "Paid" (percentages removed)

**Recommended Strategy card:** "Sales + Digital" → "Offline + Digital"

**Schedule a Call button:** outline green → filled `bg-[#2ACB83] text-[#020202]`

**Offline Sales Team country cards:**
- "Germany Specialist", "Japan Specialist", "USA Specialist" → "Germany", "Japan", "USA" (removed "Specialist" word)
- Grey members pill in top-right removed; member count merged into Assigned pill: "✓ 3 members Assigned"
- "View All Countries" chevron button added below the 3 cards for future expansion

**"Sales Deployed" label** → "Offline Team Deployed"

---

#### 11c-3. Demand Generation Stage (`DemandGenerationDetail`) — Full Redesign

**Replaced** the old `DemandGenerationDetail` function (which had week tabs, execution metrics, global demand map, channel performance, weekly market signals, opportunities generated, campaign health, campaign journey sections) with a focused live-campaign dashboard.

**New state:**
```ts
const [allTime, setAllTime]   = useState(true);
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate]     = useState("");
const [showChannels, setShowChannels] = useState(false);
```

**Information hierarchy:**
1. Campaign Summary Cards (4 cards)
2. Global Date Filter
3. Offline Engine (full-width, master-detail)
4. Digital Engine (full-width funnel + expandable channel performance)

---

#### 11c-4. Campaign Summary Cards (4 cards, replacing old status header)

| Card | Metric | Detail |
|---|---|---|
| Campaign Status | "Running" + Active pulse dot | Day 46 of 90 |
| Markets Active | 3 Active Markets | 🇩🇪 Germany · 🇯🇵 Japan · 🇺🇸 USA |
| Execution Plan | "Completed" + Strategy Active badge | "View Plan →" link |
| Total Opportunities | `salesOpps + digitalOpps` (live sum) | Sales N + Digital N breakdown pills |

`Total Opportunities` uses `salesOpps + digitalOpps` — derived from the actual funnel bottom values, not a hardcoded `product.leads` number.

---

#### 11c-5. Global Date Filter

Replaced week tabs (`All | Week 1 | Week 2 | Week 3`) with:
- **"All Time"** toggle button (dark filled when active)
- **Date range inputs** (from → to) with Calendar icon, inside a single bordered container
- Selecting a date deactivates "All Time" automatically
- Data maps: All Time → `TEC_ALL`, custom range → `TEC_WEEK_DATA["Week 2"]`

---

#### 11c-6. `ProperFunnel` Component (NEW)

Replaced `SalesFunnel` (bar-chart style) with a proper converging funnel:

```tsx
function ProperFunnel({ stages }: {
  stages: { label: string; value: number; activities: string[]; color: string; accentBg: string }[]
})
```

- 3 stages with widths `[100%, 64%, 38%]`
- Each bar: `height: 52px`, label + value side-by-side inside colored `accentBg` rectangle
- Borders: top stage has `borderRadius: "8px 8px 0 0"`, middle has `borderRadius: 0`, bottom has `borderRadius: "0 0 8px 8px"` — creates seamless stacked funnel
- `borderTop: none` on stages 2 & 3 — zero gap between stages
- Conversion rate labels **removed** per user request

---

#### 11c-7. `OfflineEnginePanel` Component (NEW — full-width master-detail)

Extracted as a standalone component above `DemandGenerationDetail`.

**Layout:** `grid grid-cols-[260px_1fr] items-stretch`

**Left column (260px):** 3 clickable stage cards
- Active card: `borderLeft: 3px solid {color}`, `bg-[#f9fafb]`, active pulse dot top-right
- Stage numbers: `01`, `02`, `03` (not `Stage 1`)
- Each card shows: stage label, large value + unit, tag pills (first 2 + count), chevron connector between cards

**Right panel:** updates based on which left card is selected (`useState<OfflineStage>`)

| Stage | Right Panel |
|---|---|
| `reach` (Sales Reach Out) | Buyer Geography Distribution + Company Size Distribution |
| `meetings` (Meetings Conducted) | Buyer Geography Distribution + Company Size Distribution (scaled to meetings count) |
| `opps` (Exclusive Opportunities) | Buyer Geography Distribution + Company Size Distribution (scaled to opps count) |

All three stages now show the **same two chart types** — consistent UX, data scales to the stage's total.

**Chart format (each chart card):**
- `MiniPieChart` (96px SVG donut) + legend rows
- Legend row: colored square + label + **bold count** + muted "leads"/"meetings"/"opportunities" word
- Percentage values removed entirely

**Geography data:** Germany 45%, USA 29%, Japan 16%, India 10%
**Size data:** Enterprise 45%, Mid-Market 35%, Small Business 20%

---

#### 11c-8. Digital Engine Section

Kept as full-width card with `ProperFunnel` (Raw Leads → Marketing Qualified Leads → Digital Opportunities).

**"View Detailed Channel Performance"** CTA at bottom — expands inline (no modal/drawer):
- `outline-none focus:outline-none` on button (removes browser blue focus ring)
- Expanded view shows:
  - 4 summary tiles in `bg-[#e8fbf2]` green: Total Clicks, Total Leads, Total MQLs, Total Opportunities
  - Organic Channels table + Paid Channels table (white cards, standard table layout)

---

#### 11c-9. Removed Sections (Session 9)

These sections were **deleted** from `DemandGenerationDetail`:
- ❌ Execution Metrics (6 KPI cards)
- ❌ Global Demand Map
- ❌ Channel Performance (old black card version)
- ❌ Weekly Market Signals (timeline feed)
- ❌ Opportunities Generated (buyer cards)
- ❌ Campaign Health (gauge + 3 metric tiles)
- ❌ Campaign Journey (duplicate stage stepper at bottom)
- ❌ Market Intelligence section (5 cards from ExecutionPlanningDetail)

---

#### 11c-10. Key Design Decisions (Session 9)

| Decision | Reason |
|---|---|
| `OfflineEnginePanel` as master-detail (left cards + right charts) | Sketch showed: left = 3 stage boxes, right = pie charts that change on click. Keeps all intelligence visible without tabs or drill-down. |
| All three stages show same Buyer Geography + Company Size charts | User requested consistent chart types across all stages; data scaled proportionally to each stage's total |
| `ProperFunnel` bars with zero gap (borderTop: none) | Creates visual continuity of the funnel shape — stages read as one connected object not separate cards |
| Conversion rate labels removed | User explicitly requested removal — numbers speak for themselves |
| Total Opportunities = salesOpps + digitalOpps (live) | Card reflects actual funnel output, not a hardcoded product.leads value; stays accurate when date filter changes |
| Date range picker replaces week tabs | User wants flexible date selection, not preset buckets; "All Time" as the default covers the full campaign |
| Channel performance expandable inline | User spec: no modal, no drawer, no popup — expand directly below the Digital Engine funnel |
| Blue focus outline removed from expand button | Browser default focus ring appeared as a thick blue border — removed with `outline-none focus:outline-none` |
| "Specialist" removed from country card labels | Cleaner — "Germany" is sufficient; "Germany Specialist" felt redundant with the flag |
| Members count merged into Assigned pill | Reduces visual noise — single pill "✓ 3 members Assigned" vs two separate pills |
| "opps" → "opportunities" in chart legend | More professional and readable at the enterprise SaaS level |

---

### 11d. Demand Catalyst — Session 10 CHANGES

#### Session 10 Changes Overview

All changes inside `DemandCatalyst.tsx`. Focus: pie chart colour system, Digital Engine rebuild, timeline interactivity, stage hero cards, Setup for Demand sidebar, and miscellaneous UI fixes.

---

#### 11d-1. Pie Chart Colour Palette (OfflineEnginePanel)

`geoData` and `sizeData` colours updated twice in this session:

**Final palette (monochromatic green scale — matches reference card UI):**
| Slice | Color | Label |
|---|---|---|
| Germany / Enterprise | `#C8E89A` | Light lime |
| USA / Mid-Market | `#52B87A` | Medium green |
| Japan / Small Business | `#2E7D52` | Forest green |
| India (geo only) | `#1A4A30` | Deep green |

---

#### 11d-2. `DigitalEnginePanel` Component (NEW — full rebuild)

Replaced the old `ProperFunnel` + expandable table layout with a master-detail panel that exactly mirrors `OfflineEnginePanel`.

**Component:** `DigitalEnginePanel` (type `DigitalMetric = "clicks" | "enquiries" | "opps"`)

**Layout:** `grid grid-cols-[260px_1fr] items-stretch` — same as Offline Engine

**Left column — 3 metric cards (no stage numbers, just metric name):**
| Card | Metric | Value | Color |
|---|---|---|---|
| Total Clicks | Campaign Clicks | `allPaidClicks + allOrganicClicks` | `#1a5c3a` |
| Total Enquiries | Raw Enquiries | `allPaidLeads + allOrganicLeads` | `#0077CC` |
| Total Exclusive Opps | Qualified Opps | `allOrganicOpps + allPaidOpps` | `#6237C7` |

**Right panel — updates on card click:**
1. **Organic vs Paid pie chart** — 2-slice (Organic `#C8E89A` / Paid `#1a5c3a`), shows raw count + unit next to each slice
2. **Channel Breakdown** — bar rows per channel, bar width scaled to **group total** (not grand total), shows "X / [group total] [unit]" next to each bar

**Channel groupings (corrected):**
- Organic Channels = Website / Scinode / Other (`paidChannels` data array)
- Paid Channels = LinkedIn / Google / Others (`organicChannels` data array)

**Group total display:** each group section header shows its own total (e.g. "3,450 clicks") so bars are contextually meaningful within their group.

**Removed:** `ProperFunnel`, `showChannels` state, expandable summary tiles, old `WeeklyLeadsSection` references.

**Props:**
```ts
{ data, digitalOpps, allOrganicClicks, allPaidClicks, allOrganicLeads,
  allPaidLeads, allOrganicOpps, allPaidOpps }
```

---

#### 11d-3. Clickable Timeline Navigation — Full Module

`DetailStageStepper` and `CampaignTimelineStrip` both now support clickable completed stages.

**`DetailStageStepper`** — new prop `onStageClick?: (stage: CampaignStage) => void`
- Completed stages (filled but not active): rendered as `<button>` with `title="View [stage]"`, `cursor-pointer`, `group-hover:scale-110` on circle, "View →" hint text appears on hover
- Active stage: non-clickable `<div>` (already there)
- Pending stages: non-clickable `<div>`

**`CampaignTimelineStrip`** — new prop `onViewDetails?: (id: string) => void`
- Maps each stage to `productByStage` (lookup from `ACTIVE_CAMPAIGN_PRODUCTS` by `stage` key)
- Completed stages become `<button>` showing product short name on hover
- Hint text "Click a completed stage to view its data" shown top-right of section header
- 3 clickable buttons wired in overview: "View Setup for Demand — Tetrahydrofuran", "View Execution Planning — Triethyl Phosphate", "View Demand Generation — Triethyl Citrate"

**`ActiveCampaignPage`** — new handler:
```ts
const handleNavigateToStage = (stage: CampaignStage) => {
  const p = ACTIVE_CAMPAIGN_PRODUCTS.find(x => x.stage === stage);
  if (p) { setViewingProduct(p); scroll to top; }
};
```
Passed as `onNavigateToStage` → `ProductDetailScreen` → all stage detail components → `DetailStageStepper`.

`ProductStatusTable` passes `onViewDetails` to `CampaignTimelineStrip`.

---

#### 11d-4. `StageHeroCard` Component (NEW — shared across all stages)

Extracted a shared hero card that renders at the top of every stage detail screen. Identical layout — only content changes per stage.

**Props:**
```ts
{ product, stageLabel, stageNum, headline, subtext,
  statusDot, statusText, metrics[], ctaLabel, onCtaClick, onStageClick }
```

**Layout:** `grid grid-cols-[1fr_260px]`
- Left: stage label + stage number (e.g. "DEMAND GENERATION · Stage 3 of 4") + H2 headline + subtext + product meta grid (Product / CAS / Industry / Duration)
- Right: coloured status dot + status text + 3 metric rows + green CTA button
- Bottom: `<DetailStageStepper>` with `noCard` + `onStageClick` (timeline embedded inside hero card)

**Per-stage content:**
| Stage | Headline | Status | Metrics |
|---|---|---|---|
| Setup for Demand | "Complete Your Product Information" | `#f59e0b` "Setup in Progress" | Profile Completeness / Documents Added / Next Step |
| Execution Planning | "Your Demand Generation Strategy is Ready" | `#2ACB83` "Execution Plan Ready" | Target Countries / Estimated Window / Market Confidence |
| Demand Generation | "Your Campaign is Live" | `#2ACB83` "Campaign Running" | Markets Active / Campaign Day / Total Opps |
| Lead Pipeline | "Buyers Are Being Delivered to You" | `#2ACB83` "Leads Incoming" | Markets Active / Campaign Day / Total Opps |

**Impact:** Removed standalone `DetailStageStepper` from `ProductDetailScreen`. Each stage detail now owns its own hero+timeline block. `ExecutionPlanningDetail` timeline updated to also pass `onStageClick`.

---

#### 11d-5. Campaign Summary Cards — Reduced to 3

Removed the **"Execution Plan"** card ("Completed · Strategy Active · View Plan →") from `DemandGenerationDetail`.

Grid changed: `grid-cols-2 lg:grid-cols-4` → `grid-cols-1 sm:grid-cols-3` so 3 remaining cards fill the full row equally.

Remaining cards: **Campaign Status** | **Markets Active** | **Total Opportunities**

---

#### 11d-6. Setup for Demand — Sidebar Rebuilt + Section-Tab Navigation

**Left sidebar** replaced with new UI matching Profile Setup design:

1. **Discovery Score card** — compact inline layout: 64px SVG donut (shows `pct%`) + green dot indicator + "DISCOVERY SCORE" label + mini progress bar + "Fill your profile to get discovered"

2. **Onboarding nav card** — collapsible (`navOpen` state):
   - Header: green dot + "ONBOARDING" + `X/3` count pill + mini progress bar + chevron
   - 3 nav items: Identity (🪪) / Commercial Readiness (📦) / Documents & Certs (📄)
   - Active item: `bg-[#1a5c3a] text-white` dark green fill (matches Profile Setup exactly)
   - Done items: green `Check` icon on right
   - Pending: grey `ChevronRight`

**Section-tab navigation (new behaviour):**
- Clicking a nav item sets `activeSection` state and calls `scrollIntoView` on the section ref
- Right panel renders **only the active section** (`{activeSection === "identity" && …}`)
- `useRef` on each section div: `identityRef`, `commercialRef`, `documentsRef`
- Footer CTA "Continue to Map the Market →" always visible regardless of active section

**Removed:** `DetailInfoCards` (Expected First Signals / What We Need From You / Honesty Is The Plan) — no longer shown in sidebar.

**New state added to `SetupForDemandDetail`:**
```ts
const [activeSection, setActiveSection] = useState<"identity"|"commercial"|"documents">("identity");
const [navOpen, setNavOpen] = useState(true);
const identityRef    = useRef<HTMLDivElement>(null);
const commercialRef  = useRef<HTMLDivElement>(null);
const documentsRef   = useRef<HTMLDivElement>(null);
```

`useRef` import added to top-level import: `import React, { useState, useEffect, useRef } from "react"`

---

#### 11d-7. Stage / Label Removals

- **OfflineEnginePanel left cards**: removed "Stage 01 / 02 / 03" labels — cards now show metric name directly
- **DigitalEnginePanel left cards**: "01 / 02 / 03" labels also not shown
- **CampaignTimelineStrip**: hint "Click a completed stage to view its data" added inline

---

#### 11d-8. Key Design Decisions (Session 10)

| Decision | Reason |
|---|---|
| `DigitalEnginePanel` mirrors `OfflineEnginePanel` exactly | User requested same master-detail layout; consistent UX between Sales and Digital intelligence |
| Channel bars scaled to group total, not grand total | Organic 3,450 and Paid 4,070 are different pools; scaling to grand total made paid bars appear proportionally larger by default — group scaling is fairer |
| Organic = Website/Scinode/Other; Paid = LinkedIn/Google/Others | Corrected from swapped initial assignment based on user feedback |
| `StageHeroCard` shared component | All 4 stages now have identical visual structure at top — product info + status + metrics + embedded timeline. Prevents drift as stages evolve. |
| Section-tab nav (show/hide) over scroll-to | User explicitly asked: "clicking Commercial Readiness should only show Commercial Readiness fields" — full hide/show was required, not scroll |
| `DetailInfoCards` removed from Setup for Demand sidebar | User requested removal — sidebar is cleaner with just Discovery Score + nav |
| `CampaignTimelineStrip` accepts `onViewDetails` from `ProductStatusTable` | Overview and detail screens now share one navigation model: click a completed stage circle anywhere → jump to that product's detail |
| Execution Plan card removed from Demand Generation summary | Redundant — the `StageHeroCard` already shows stage/plan context at the top of the screen |
| 3-card grid fills container (`sm:grid-cols-3`) | After removing 4th card, `grid-cols-4` left a gap; 3-col gives equal 33% width to each remaining card |

---

### 11e. Demand Catalyst — Session 11 CHANGES

#### Session 11 Overview
Major cross-cutting changes across `DemandCatalyst.tsx`, `ProjectsListing.tsx`, `CRODashboard.tsx`, `ResearcherDashboard.tsx`, and `Products.tsx`. Focus: "Lead Pipeline" rename, Opportunities Pipeline new screen, project card redesign platform-wide, weekly opportunities section, Setup for Demand UX refinements, and Add Product drawer overhaul.

---

#### 11e-1. "Lead Pipeline" → "Opportunities Pipeline" (Stage 4 Rename)

- `CampaignStage` type updated: `"Lead Pipeline"` → `"Opportunities Pipeline"` everywhere
- `STAGES`, `STAGE_META`, `PILL_MUTED`, `STAGE_EXPLAINER`, all label lookups updated
- Demo scene switcher label "Leads Pipeline" → "Opportunities Pipeline"

---

#### 11e-2. Product Stage Reassignment

| Product | Old Stage | New Stage |
|---|---|---|
| Triethyl Citrate (TEC) | Demand Generation (3) | **Opportunities Pipeline (4)** |
| Sodium Bromide (SNB) | Lead Pipeline (4) | **Demand Generation (3)** |

TEC is now the showcase product for the full 4-stage journey.

---

#### 11e-3. `OpportunitiesPipelineView` (NEW — Stage 4 detail screen)

**File:** `DemandCatalyst.tsx`

**Layout:** `StageHeroCard` + 4 KPI tiles + 60/40 grid

**Left 60% — Matched Opportunities cards (3 cards, 3-col grid):**
- Exact new `ProjectCard` spec: image (148px, hover scale), **Exclusive pill only** (top-left, no Capability/Catalogue), industry pill, project name, country+flag, quantity, posted date
- Hover: gradient border + "Submit Proposal →" button slides up (→ `router.push("/dashboard/projects/[id]")`)
- Data: `OPP_PIPELINE_PROJECTS` (3 items — Germany/Japan/UAE)

**Right 40% — Opportunities by Country:**
- Country list: flag + name + coloured count + animated bar + "X opportunities" text
- Real `/world-map.svg` flush-fill with animated pulse markers + country label pills

**KPI strip (4 tiles):** Total Opportunities / Proposals Sent / In Negotiation / Won — all white cards with coloured numbers

**Data:** `OPP_PIPELINE_PROJECTS` + `OPP_COUNTRY_DATA` (Germany 19 / Japan 11 / UAE 6)

---

#### 11e-4. `ProductDetailScreen` — Per-Product Stage Navigation

**Key change:** Stage detail screens no longer call `onNavigateToStage` (which switched to a different product). Instead, `ProductDetailScreen` manages its own `viewingStage` state.

```ts
const [viewingStage, setViewingStage] = useState<CampaignStage>(product.stage);
```

**Stage tab strip** (always visible at top of detail screen):
- Shows all 4 stage pills: reached stages = green clickable, active = dark green + dot, unreached = grey disabled
- Current active stage shows pulsing green dot
- Clicking any pill sets `viewingStage` + scrolls to top

**Breadcrumb banner** (shown when viewing a past stage):
`← Back to Overview › [Product] › [Viewing: Stage N — StageName]  Jump to Current Stage →`

**Stage rendering:** switches content based on `viewingStage`, always passes the real `product` (TEC, stageIndex 4) so `DetailStageStepper` always reflects the correct completion state.

**`DetailStageStepper` fix:** `clickable` changed from `isCompleted && !!onStageClick` → `filled && !!onStageClick` — active stage (Opportunities Pipeline) is now also clickable.

**`ExecutionPlanningDetail` fix:** `activeStage` was hardcoded `"Execution Planning"` → now passes `product.stage as CampaignStage` so timeline always shows TEC's full completion.

**`DemandGenerationDetail` fix:** stage label/num/headline were conditionally derived from `product.stage` → now hardcoded to "Stage 3 of 4" / "Demand Generation" / "Your Campaign is Live" so viewing stage 3 from TEC shows correct content.

---

#### 11e-5. `StageHeroCard` Right Panel Simplified

Removed all metric rows (Total Opportunities, Proposals Sent, Won, etc.) from the right panel.  
Right panel now shows only: **status dot + status text** and **"Schedule a Call" CTA button**.  
Applies uniformly to all 4 stages.

---

#### 11e-6. Weekly Opportunities Section (NEW — Active Campaign Overview)

**Component:** `WeeklyOpportunitiesSection` (new section added between Product Status Table and Opportunities by Product in `ActiveCampaignPage`)

**Outer layout:** 70/30 grid (`1fr 320px`)

**Left 70% — White card with:**
- Header: "Weekly Opportunities" title + product filter dropdown (`All Products` / THF / TEP / TEC)
- SVG line chart (W=900, H=200, 16px padding all sides) — `w-full` no fixed height, scales to container
- Hover tooltip (portal-based): dark card showing week label + total opportunities + country breakdown with flags
- Vertical dashed hover line

**Right 30% — Demand Catalyst dark card** (`DemandCatalystPanel` reused)

**Data:**
```ts
WO_WEEKLY: { all: [3,5,8,11,14,22], thf/tep/tec per product }
WO_WEEK_COUNTRIES: per-product per-week country breakdown for tooltip
WO_TOP_COUNTRIES: { flag, name, count, color, mapPctX, mapPctY }
WO_TOTAL: { all:63, thf:24, tep:6, tec:36 }
```

**`OpportunitiesSection`** (old master-detail "Opportunities by Product") — **removed** from `ActiveCampaignPage`.

---

#### 11e-7. Project Card Redesign — Platform-Wide

**New card spec (all locations):**
- Image (148px, hover `scale-[1.07]`, gradient top scrim)
- **Pill over image:** Open tab → `Capability` OR `Catalogue` (never both); Exclusive tab → `⭐ Exclusive` only
- Industry pill (1 shown, `bg-[#e3f4ff]`)
- Project name (`font-semibold`, `line-clamp-2`)
- 🌍 Country + flag
- 📦 Quantity (truncated at 30 chars)
- 🗓 Posted date
- Animated gradient hover border + `ArrowUpRight` slides up

**Files changed:**
- `ProjectsListing.tsx` — `ProjectCard` redesigned; `Project` interface extended with `country`, `countryFlag`, `postedDate`, `quantity`; `COUNTRY_DATA` lookup (20 countries) added; `OPEN_SEED` + `EXCLUSIVE_PROJECTS` populated from `ALL_PROJECTS`
- `CRODashboard.tsx` — `MATCHED_PROJECTS` data + `MatchCard` redesigned (same spec, carousel width 240px)
- `ResearcherDashboard.tsx` — Same updates as CRODashboard

---

#### 11e-8. Setup for Demand — Profile Module Field Components

**Identity tab:** replaced raw `<input>`/`<select>` with:
- `FormField` + `inputCls` for all text inputs
- `DropdownSelect` (custom dropdown) for Industry, Grade, MOQ unit (uses `INDUSTRIES`, `PRODUCT_GRADES`, `MOQ_UNITS` from profile constants)
- Red `*` on all mandatory fields

**Commercial Readiness tab:**
- Availability: segmented button (`YNToggle`-style "Made to Order / In Inventory")
- `DropdownSelect` for Unit, Incoterms
- `PillInput` for Unique Capabilities (type → Enter → green pill)
- `CountryMultiSelect` for Target Countries (new component — see below)

**Documents tab:** Combined A + B into one card with centre-line separators between sections; document upload cards redesigned with empty-state upload zone + thumbnail after upload.

**`CountryMultiSelect`** (NEW component — portal-based):
- Trigger button shows "N countries selected"
- Dropdown renders via `createPortal` into `document.body` (escapes `overflow-hidden` parents)
- 65+ world countries with flags, searchable, multi-select with checkmarks + "Clear all"
- Selected as removable green pills below the trigger
- `THF_FORM_PREFILLED.countries` updated to plain names matching `ALL_WORLD_COUNTRIES[i].name`

**Validation card** (always visible in sidebar, below nav tabs):
- Live — updates as user fills fields (no submit required)
- Red header "Missing required fields · N fields need attention"
- Per-tab breakdown: tab icon + label (clickable → jumps to that section) + list of missing field names
- Nav items show red badge with missing count
- All-clear: green "All required fields complete!" state
- Submit button blocked if `totalMissing > 0`

**Sidebar nav changes:**
- "ONBOARDING" collapsible header removed
- Nav items always visible, all show `ChevronRight` (no checkmark)
- Validation card sits below the nav

---

#### 11e-9. Add Product Drawer — Full Profile Products Tab

**`AddProductDrawer` in `DemandCatalyst.tsx` completely rebuilt:**
- Width: 940px
- Renders the full `Products` component from `src/modules/profile/tabs/Products.tsx` directly
- **Includes everything:** search bar, Sort by dropdown, Filters button, `+ Add Product` button, `↑ Upload Catalogue`, DC Demo switcher (Banner / Selecting 0/5 / 1 product only / 3/5 / 5/5 / Confirm popup), green Demand Catalyst banner, full `ProductTable` with all columns/sort/filter/bulk-select/row-actions (edit/delete/copy/star)
- Products added here sync to `useProfileStore` (single source of truth)
- `ProductTable` and `ProfileAddProductDrawer` exported from `Products.tsx`

---

#### 11e-10. Demo Scene Changes

| Change | Detail |
|---|---|
| "1 Product Added" scene removed | `Scene` type and `DcSceneSwitcher` array updated; `sceneProducts` branch removed |
| "3 Products, No Stars" → "4 Products, No Stars" | Label + `sceneProducts` slice(0,4); also `s2-2` now shows 4 products |
| New product `dc-p6` added to `DEMO_PRODUCTS` | Tetrahydrofuran (CAS 109-99-9, Specialty Chemicals, Anhydrous, 99.9%, 200 kg MOQ, In inventory, GIDC Gujarat) — same as Active Campaign THF product |

---

#### 11e-11. Minor UI Fixes (Session 11)

| Fix | Location |
|---|---|
| Discovery Score progress bar removed | `SetupForDemandDetail` sidebar donut card |
| "Continue to Map the Market" button → solid `#1F6F54` | was gradient; matches profile CTA colour |
| "Total Leads" / "Total MQLs" → "Total Enquiries" / "Total Opportunities" | `CampaignOverviewSection` KPI tiles + `ProductStatusTable` column headers |
| Legend words "leads" → "sales reach out" | `OfflineEnginePanel` geography/size chart legend |
| `DemandGenerationDetail` stage labels stabilised | Removed conditional from `product.stage`; hardcoded "Stage 3 of 4" + "Campaign Running" |
| `DetailInfoCards` placed below all stage content | `ProductDetailScreen` — visible after stage form regardless of stage |

---

### 12. Profile Setup — Manufacturer / CRO / CMO (`ProfileSetup.tsx`) — Session 5 REWRITE

**Route:** `/dashboard/profile`
**Tab navigation:** URL param `?tab=X`
**File:** `src/modules/profile/ProfileSetup.tsx` (fully rewritten in Session 5)

---

#### Layout — 20/80 Split (Session 6 update: reduced from 30%)

**LEFT 20% — Sticky Sidebar (`LeftSidebar` component):**
- Width changed from `w-[280px]` → `w-[20%]` in Session 6 to give the Product Catalogue table more horizontal room.

1. **Discovery Score card** (compact): donut SVG (48px, `#2ACB83` stroke), overall % label, mini progress bar, "+X% after this section" label

2. **Onboarding collapsible** (green, `#018e7e`): header pill shows `1/3` count + mini progress bar + chevron. Expands to show 3 clickable nav items (Company Profile, Product Catalogue, Terms & Activation). Active item = green filled bg, done item = green text + check icon, pending = slate text.

3. **Profile Enrichment collapsible** (amber): header shows `0/5` + amber mini bar. Expands to 5 nav items (Licences, Reactors, Equipment, EHS, Utilities). Active = amber filled, done = amber text + check.

4. **Section Context card** (4 sections separated by border-b):
   - **Score Impact**: `TrendingUp` icon + "+X% Discovery Score" green text
   - **What you fill in**: `Info` icon label + description text
   - **Why this matters**: green-tinted bg + paragraph
   - **What you unlock**: `Unlock` icon label + check-list items (green dot circles)

**RIGHT 70% — Form content:**
- Compact card header: 32px icon box (green/amber bg border) + tab label + score chip + subtitle
- "VISIBLE TO CUSTOMERS" strip: **removed**
- Tab content rendered inline
- `AutoSaveFooter`: compact (12px text, 13px button), green gradient CTA

**Mobile fallback (below xl breakpoint):**
- Horizontal scrollable pill tab strip replacing left sidebar nav
- Mobile context card below the form (shows score impact + whyItMatters)

---

#### Tab Configuration

**Onboarding tabs (3):**

| id | Label | Icon |
|---|---|---|
| `company` | Company Profile | Building2 |
| `products` | Product Catalogue | Package |
| `terms` | Terms & Activation | FileText |

**Enrichment tabs (5):**

| id | Label | Icon |
|---|---|---|
| `licences` | Licences & Certifications | Award |
| `reactors` | Reactors & Capacities | FlaskConical |
| `equipments` | Equipment & Infrastructure | Wrench |
| `ehs` | EHS Facility Details | ShieldCheck |
| `utilities` | Utilities | Zap |

---

#### Context Data Structure (`TAB_CONTEXT`)

Each tab now has:
```ts
{
  group: "onboarding" | "enrichment";
  scoreImpact: string;        // "+10%" etc
  whatYouHave: string;        // fields description
  whyItMatters: string;       // buyer rationale
  whatYouAchieve: string[];   // unlock bullets
}
```
(Previously: `buyerRationale`, `unlocks`, `fieldsHelp` — replaced with more structured copy)

---

### 12b. Product Catalogue Tab (`Products.tsx`) — Session 5 REWRITE + Session 6 Updates

**File:** `src/modules/profile/tabs/Products.tsx`

Complete rewrite of product display: **card grid → Excel-like data table**.

---

#### Session 6 Changes to Products.tsx

**1. Single unified table (removed group headers)**
- Previously: two separate `ProductTable` instances — "Catalogue Products" + "Manually Added" with `GroupHeader` dividers between them.
- Now: one merged array `allProducts = [...catalogueProducts, ...manualProducts]` rendered in a single `ProductTable`.
- `source` is shown per-row via the `Source` column (`"Catalogue"` vs `"Manual"`), making the group headers redundant.
- `onDelete` routes by ID prefix: `id.startsWith("cat-")` → catalogue state; else → Zustand `deleteProduct`.
- `filterAndSort` updated: source filter now checks per-item (`"source" in p`) instead of blocking entire arrays.

**2. CTA button colours**
- **"Upload Catalogue"** button: `bg-[#2ACB83] text-[#020202]` → `bg-[#1F6F54] text-white hover:bg-[#185e46]`
- **"Edit your profile"** button (ProfileSetup.tsx): `bg-[#018e7e]` → `bg-[#1F6F54] hover:bg-[#185e46]`
- Both now use the dark primary green `#1F6F54`, consistent with the banner and all primary CTAs.

**3. Demand Catalyst star-selection integration**
New components added inline in `Products.tsx`:

- **`DemandCatalystBanner`** — thin solid `#1F6F54` strip between toolbar and table. Left: Megaphone icon + "Demand Catalyst" label + description. Right: "Select Star Products" CTA (white fill, `#1F6F54` text).

- **`DcSceneSwitcher`** — demo pill tabs: Banner | Selecting 0/5 | 1 product only | 3/5 selected | 5/5 ready | Confirm popup.

- **`StarTracker`** — replaces banner when `dcMode === "selecting"`. Shows 5 slot dots (filled green = starred), `X / 5 selected` status text, "Select all (N)" muted link, "Cancel" outline button, "Confirm X Stars →" / "Review & Activate" CTA (white fill, dark green text, WCAG AA/AAA compliant on `#1F6F54` bg).

- **`LowCatalogueNudge`** — blue info card shown when `allProducts.length < 5` during selection. Wording adapts: 1 product → "Your catalogue has 1 product — fill remaining N slots after adding more"; N products → "N slots will be empty — add more products". `emptySlots = MAX - Math.min(totalProducts, MAX)`.

- **`DcConfirmPopup`** — centered fixed modal (not inline card). `max-w-[680px]`, light green gradient bg. Header: green star icon box + "X Star Products Selected" + remaining-slots message + X close. Body: **row table** — column headers (Product Name / CAS Number / Industry) + one row per selected product (green star circle + name + CAS mono + industry pill) + dashed empty-slot rows. Footer: "← Back to selection" + "Activate Demand Catalyst" (dark-to-light green gradient). Clicking backdrop or X = `onBack()`.

**State machine in `Products`:**
```ts
dcMode: "off" | "selecting" | "confirm"
starIds: Set<string>  // max 5
dcScene: DcScene      // demo switcher
```
- Scene changes drive `dcMode` + `starIds` + `cataloguePhase` + `catalogueProducts` via `useEffect([dcScene])`.
- Real user flow: "Select Star Products" → `setDcMode("selecting")`; star toggles → `handleStarToggle(id)`; "Confirm" → `setDcMode("confirm")` (NO scene change — preserves real starIds); "Activate" → `router.push("/dashboard/demand-catalyst")`.
- `ProductTable` gains `starMode?: boolean`, `starIds?: Set<string>`, `onStarToggle?: (id) => void` props. In star mode: left column shows ⭐ toggle instead of checkbox; starred rows use `bg-[#FFFBEB]` amber tint; disabled star when at max 5.

**WCAG colour contrast fixes:**
- `#1F6F54` background on banner/tracker is a single solid dark green (no gradient). White text on `#1F6F54` → ~10:1 (AAA).
- Confirm active CTA: white fill + `#1F6F54` text → ~10:1 (AAA).
- StarTracker secondary text (`text-white/60`), cancel (`text-white/80`), disabled (`text-white/35`) — disabled state is WCAG-exempt (1.4.3 exception).

---

#### Column System

```ts
type ColKey = "name"|"cas"|"industry"|"grade"|"purity"|"moq"|"status"|"source"|"chemistry"|"readiness"|"lastAction";
```

**11 columns** in `ALL_COLS`:

| Key | Label | Width | Notes |
|---|---|---|---|
| `name` | Product Name | 160px | Sticky left (`left: 40px`), `truncate w-full` |
| `cas` | CAS Number | 130px | Scrollable |
| `industry` | Industry | 160px | Scrollable |
| `grade` | Grade | 120px | Scrollable |
| `purity` | Purity | 90px | Shows `X%` |
| `moq` | MOQ | 110px | Shows `X unit` |
| `status` | Status / Availability | 190px | **Merged cell**: pill + qty + location stacked |
| `source` | Source | 130px | Manual/Catalogue pill |
| `chemistry` | Chemistry | 140px | ⚡ Cracked / ✓ Experience pill |
| `readiness` | Readiness | 110px | ✓ Complete (green) / Incomplete (red) — NEW |
| `lastAction` | Last Action | 140px | Scrollable text |

**Sticky anchors:**
- Left: checkbox (40px, `sticky left-0 z-10`) + Product Name (160px, `sticky left-10 z-10`)
- Right: kebab 3-dot (36px, `sticky right-0 z-10`)
- Both sticky zone edges: `border + shadow-[3px_0_6px_-1px_rgba(0,0,0,0.09)]` visual separator

All columns visible by default (`useState(new Set(ALL_COLS.map(c=>c.key)))`).

---

#### Table Features

**Columns popover** (`ColumnsPopover`):
- Portal-based (`createPortal → document.body`), `position: fixed; z-index: 9999`
- `anchorRef` from Columns button; positioned via `getBoundingClientRect()`
- Checkbox list per column; "Select all" resets to all visible

**Row kebab menu** (`RowMenu`):
- Portal-based (`createPortal → document.body`), `position: fixed; z-index: 99999`
- Positioned to left of anchor button via `getBoundingClientRect()`
- 4 actions: Edit (slate) / Duplicate (slate) / Deactivate (amber) / Delete (red)
- Per-row `anchorRef` stored in `menuBtnRefs.current[p.id]`

**Sorting:** click any column header → `sortCol` + `sortDir` state → sorts `sorted` array

**Multi-select:**
- Master checkbox in header: select all / deselect all
- Per-row checkbox: `selectedIds` Set state
- Bulk delete CTA appears in toolbar when `selectedIds.size > 0`

**Status/Availability merged cell:**
- "In Inventory" (green pill) or "Made to Order" (grey pill)
- Below pill: `${availableQty} ${availableUnit} · ${availableLocation}` if in inventory

**Empty placeholder rows:**
- `MIN_ROWS = 5`; `emptyCount = Math.max(1, 5 - products.length)`
- Empty rows always visible below real data
- Row 1 empty: "**+ Add product…**" (italic, hover turns green) in name cell
- Rows 2+: "**—**" in all cells (`text-slate-300`)
- Clicking any empty row → opens `AddProductDrawer`
- After 5 products filled, 1 empty row always remains

**Group headers** (when both catalogue + manual products exist):
- "Catalogue Products" + "Generated from Catalogue" blue pill
- "Manually Added" + "Added Manually" grey pill

---

#### Toolbar (unchanged structure, new props)

- Search bar (full-width) | Sort by dropdown | Filters side drawer | Add Product | Upload Catalogue
- Filters side drawer: Inventory Status / Product Source / Readiness (3 filter groups)

---

**DrawerBase:** slide-over drawer used within profile tabs for adding items

---

### 13. Profile Setup — Independent CRO (`IndependentCROProfileSetup.tsx`)

**8 tabs (same structure as Manufacturer):**
Tab1CompanyProfile → Tab2Products → Tab3Certifications → Tab4Services → Tab5Equipment → Tab6Facility → Tab7Utility → Tab8Terms

**Key difference from Manufacturer:** Services & Capabilities tab replaces Reactors tab. Store: `useIndependentCROProfileStore`.

---

### 14. Profile Setup — Researcher (`ResearcherProfileSetup.tsx`)

**4 steps:**

| Step | Component | Key Fields |
|---|---|---|
| 1 | `Step1Profile.tsx` | Academic/institutional identity, ORCID, department |
| 2 | `Step2Capabilities.tsx` | Research domains, techniques, specializations |
| 3 | `Step3TrackRecord.tsx` | Publications, patents, prior industry work |
| 4 | `Step4Compliance.tsx` | Agreements, documentation |

**Store:** `useResearcherProfileStore`

---

### 15. Auth Flows

**LoginPage** (`/login`):
- 3-tab role selector: CRO / Manufacturing / Scientist
- Tabs route to role-specific login pages

**CROScientistLoginPage** (`/login/cro-scientist`):
- Split panel: `CROScientistLeftPanel` (marketing) + login form
- Email + password with `PasswordInput` show/hide toggle
- Zod validation via `auth.schema.ts`

**ManufacturerSignupPage** (`/signup/manufacturer`):
- Multi-step signup with `ManufacturerLeftPanel`
- Steps: basic details → role confirmation → account creation

**CROScientistSignupPage** (`/signup/cro-scientist`):
- Same flow, CRO/Scientist-specific fields

**DemoAccessPage** (`/demo`):
- Single click role selection → instant login with mock credentials

**Forgot Password** + **Reset Password**:
- Email submission → mock reset flow

---

## Shared Components

### Layout Shell

| Component | Detail |
|---|---|
| `DashboardLayout` | `h-screen overflow-hidden` fixed height. Sidebar + TopNav + scrollable content area. Scroll zones are independent. |
| `Sidebar` | Role-aware navigation. Collapsible. Active route highlighted. |
| `TopNav` | User menu (dropdown), notification bell, breadcrumb |
| `PreviewToggle` | Desktop ↔ Mobile viewport switch (`usePreviewMode`) |
| `TrialBanner` | Full-width strip. 2 states: trial active (urgency text) + expired. Fixed top position. |
| `PricingModal` | Full-screen overlay. 3-tier pricing: Starter / Free after onboarding / Pro (gold). |
| `UpgradePremiumModal` | In-dashboard modal. Premium feature upsell with feature comparison list. |

### UI Atoms

| Component | Detail |
|---|---|
| `Button` | Primary (green), secondary, ghost variants. Focus ring. |
| `Input` | Styled text input with border, focus transition |
| `Label` | Form label |
| `Badge` | Colour variants for status/category |
| `Logo` | SCINODE SVG brand logo |
| `PasswordInput` | Input + eye toggle for show/hide password |
| `dropdown-menu` | Radix DropdownMenu primitive, custom styled |

### Shared Data Display

| Component | Detail |
|---|---|
| `MetricCard` | KPI tile: value, trend arrow, icon, label |
| `DataTable` | Sortable, filterable. Uses `Column<any>[]` to avoid generic conflicts. |
| `ActivityFeed` | Time-sorted activity list with icons |
| `Timeline` | Milestone/event vertical timeline |
| `StatusBadge` | Maps status string → colour-coded pill |
| `ProjectTypePill` | Category tag (CMO/RFQ/Exclusive/etc.) |
| `ProgressBar` | Width-animated percentage bar |

---

## Animations — Full Inventory

| Animation | Where Used | Definition |
|---|---|---|
| `cro-badgeShimmer` | CRO Hero badge | `background-position: -200% → 200%`, 3.5s ease-in-out infinite |
| `cro-cf0`–`cro-cf7` | CRO Profile Engine confetti | 8 scatter paths: translate + rotate(±120–300°) + scale(0.2) + opacity:0, 1.3s cubic-bezier staggered 38ms |
| `cro-quickWinsScroll` | Quick Wins marquee | `translateX(0 → -50%)` on doubled array, 28s linear infinite, pause on hover |
| `mfg-badgeShimmer` | Mfg Hero badge | Same as CRO variant |
| `mfg-grid` | Mfg Hero background | SVG grid opacity `0.025 → 0.045`, 7s ease-in-out |
| `mfg-cardFade` | Mfg Buyer Signal cards | `opacity:0 + translateY(7px) → opacity:1 + translateY(0)`, 0.38s ease |
| `d1-badgeShimmer` | Day 1 Hero badge | Same sweep pattern |
| `d1-stream` | Live signal dots | `opacity: 0.25 + scale(0.8) → opacity:1 + scale(1.2)`, 1.6s, 3-dot stagger 280ms |
| `d1cf0`–`d1cf7` | Day 1 drawer confetti | Same scatter system, prefixed `d1` |
| Progress ring | CRODashboard, Day1 card | `strokeDashoffset` CSS transition 600ms ease |
| Half-pie gauge | ManufacturingDashboard | `stroke-dasharray` CSS transition 1.4s cubic-bezier(0.22,1,0.36,1) |
| Bar chart entry | Day 1 Industry bars | Width `0% → X%`, staggered `i×45ms`, 620ms cubic-bezier, triggered by IntersectionObserver |
| Bar chart active swap | Day 1 Industry bars | Colour fill: width + opacity, 350ms; hatch: opacity, 240ms |
| Count-up | Platform Stats | `requestAnimationFrame` loop, 1400ms, ease-out `1-(1-t)^3` |
| Stepper line fill | Mfg ProfilePerformanceCard | CSS `width` transition 700ms |
| Progress bar mount | Mfg Hero + Onboarding rows | `width: 0% → X%`, 1.2s cubic-bezier(0.22,1,0.36,1), 400ms delay |
| Tooltip show/hide | SCINODE Secure badges, InfoTip | `opacity + translateY(-4px → 0)`, 200ms ease |
| Drawer slide-in | ProfileDetailsDrawer | `translateX(100% → 0)`, 320ms cubic-bezier(0.22,1,0.36,1) |
| Card hover lift | Open Project cards | `hover:-translate-y-0.5` + `hover:shadow-xl` Tailwind transitions |
| Testimonial carousel | CRODashboard, ResearcherDashboard | `translateX(-${idx × 88}%)`, `transition-transform duration-400` |
| Demand confidence bar | Day 1 Industry panel | `width` CSS transition 500ms |
| Sparkline | Day 1 Industry panel | Static SVG cubic bezier path, green gradient fill, last-point dot |
| Toast | CRODashboard, Day1 | `animate-in slide-in-from-bottom-4 duration-300`, auto-dismiss 3.5s |
| Radial blob blobs | Multiple heroes | Static CSS, decorative depth layers with `filter: blur(Xpx)` |
| `animate-ping` | Live dots, pulsing indicators | Tailwind built-in: scale(2) + opacity:0 loop |
| `dc-shine` | Demand Catalyst "Add Product" button (Sessions 4–5) | Removed in Session 6 rewrite — no longer used |
| Portal popover entry | Columns popover, RowMenu, Demand Catalyst dropdowns | `createPortal(…, document.body)` with `position: fixed` + z-index 9999/99999; positioned via `getBoundingClientRect()` |
| `dc-stage-beacon` | Detail screen active stage circle | `box-shadow` pulse 0 → 10px ring → 0, inner glow in/out; 1.8s ease-in-out infinite — deep green gradient `#0d3d26 → #1a5c3a → #2ACB83` |
| `dc-beacon-ring` | Detail screen active stage halo | Absolute `border-2` div; `scale(1) opacity(0.6) → scale(2.2) opacity(0)`; 1.8s ease-out infinite — creates expanding ring around active stage |

---

## State Management (Zustand Stores)

| Store | Persisted | Key State |
|---|---|---|
| `useAppStore` | ✅ | `user`, `role`, `isAuthenticated`, `login()`, `logout()` |
| `useProfileStore` | ✅ | Manufacturer profile form state (8 tabs) |
| `useIndependentCROProfileStore` | ✅ | Independent CRO profile form state (8 tabs) |
| `useResearcherProfileStore` | ✅ | Researcher profile form state (4 steps) |
| `useProposalStore` | ❌ | `isOpen`, `activeProposal`, `open()`, `close()` |
| `useDashboardDayStore` | ✅ | `day` (0/1/10/pi/researcher), controls which dashboard renders |
| `useNotificationStore` | ❌ | Notification queue array, `add()`, `dismiss()` |

---

## Hooks

| Hook | Detail |
|---|---|
| `useAuth` | Reads `useAppStore`, exposes `user`, `role`, `login`, `logout`, `isAuthenticated` |
| `useHydration` | Returns `false` until Zustand hydrates from localStorage. Gates auth redirects to prevent SSR mismatch. |
| `usePreviewMode` | `mode: "desktop" | "mobile"`, toggle function, stored in `useAppStore` |
| `useTrial` | Trial expiry date from store, countdown to expiry, `isExpired`, `daysLeft`, `showUpgrade` trigger |

---

## Validation Schemas (Zod)

| Schema | Rules |
|---|---|
| `auth.schema.ts` | Email format, password min 8 chars, confirm match |
| `cro.schema.ts` | Org name required, services array min 1, certifications optional |
| `manufacturing.schema.ts` | Facility size required, capabilities array, compliance checkboxes |
| `scientist.schema.ts` | Profile fields, research areas, publications optional array |

---

## Services & Data

| File | Detail |
|---|---|
| `services/mock-data.ts` | All mock data: projects, proposals, users, platform metrics, buyer signals |
| `services/auth.service.ts` | `login(email, password)` — checks against mock credentials, sets store. `logout()`. `getSession()`. |
| `lib/projectsData.ts` | `ALL_PROJECTS` array: 20+ projects with image, badge, industry, title, description. `BadgeType` union. |
| `lib/supplierImages.ts` | `SUPPLIER_IMAGES` object: `pharma[]`, `agro[]`, `industrial[]`, `specialty[]` — Unsplash URLs |
| `lib/utils.ts` | `cn()` (clsx + tailwind-merge), `formatDate()`, `formatCurrency()` |

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| `h-screen overflow-hidden` on DashboardLayout | Sidebar and content scroll independently, no double-scrollbar |
| `Column<any>[]` in DataTable | Avoids TypeScript generic conflicts across different table data shapes |
| `useHydration()` gates auth redirects | Prevents Zustand `persist` hydration mismatch between SSR HTML and client state |
| No shadcn CLI | Components written from scratch with Radix UI to match exact SCINODE design system |
| Progressive dashboard reveal via `useDashboardDayStore` | Day 0 = onboarding, Day 1 = profile submitted state, Day 10 = full access |
| Portal-based tooltips (`createPortal → document.body`) | Prevents tooltip clipping inside overflow-hidden containers |
| `IntersectionObserver` for bar chart animation | Only animates when section scrolls into view, not on page load |
| `requestAnimationFrame` count-up | Smooth, frame-rate-independent number animation without external deps |
| Doubled array for marquee (`[...arr, ...arr]`) | CSS `translateX(-50%)` loop on doubled content gives seamless infinite scroll |
| `InfoTip` uses `getBoundingClientRect()` | Correct portal tooltip positioning regardless of scroll/stacking context |
| Profile layout 30/70 split | Left sidebar nav (collapsible groups + context card) gives users orientation + context while filling form — replaces sticky horizontal tab bar |
| `LeftSidebar` sticky at `top: 64px` | Sidebar scrolls with page on mobile but stays fixed on xl+ |
| Products table sticky columns via CSS `position: sticky` on `<td>` | Checkbox (`left: 0`) + Name (`left: 40px`) + Kebab (`right: 0`) pin while middle columns scroll via `overflow-x: auto` wrapper |
| Portal-based popovers for table menus | `overflow-x: auto` on table wrapper clips `absolute` children — portalling to `document.body` with `position: fixed` avoids all clipping |
| Empty rows `MIN_ROWS = 5` default | Gives the table a filled look from the first load; "+" hint on row 1 teaches the add interaction; always 1 empty row after 5 filled keeps the affordance visible |
| Status/Availability merged column | Reduces cognitive load — inventory state + qty + location are always co-located; "Made to Order" rows naturally show no qty/location |
| `Readiness` column | Actionable signal — `isProductComplete()` check surfaces missing fields directly in the table without needing to open each row |
| Single unified Products table (Session 6) | Source column (`Catalogue` vs `Manual`) makes group-header dividers redundant; merging into one array simplifies filtering and delete routing |
| Products sidebar `w-[20%]` instead of `w-[280px]` (Session 6) | Gives the wide Product Catalogue table more horizontal room at any viewport width |
| `#1F6F54` solid colour on DC banner + StarTracker (Session 6) | Gradient endpoint `#2ACB83` failed WCAG AA for white text; solid dark green gives ~10:1 (AAA) across the full bar |
| `DcConfirmPopup` as fixed centered modal (Session 6) | Row layout (Product Name / CAS / Industry) with empty-slot placeholders gives clearer confirmation than pill tags |
| DC scene changes set `catalogueProducts` (Session 6) | Without this, demo `starIds` (cat-* prefixes) had no matching products in `allProducts`, causing the confirm popup to show empty rows |
| Confirm flow uses `setDcMode` not `setDcScene` (Session 6) | Calling `setDcScene("confirm")` would fire `useEffect` and reset `starIds`, wiping the user's real selections |
| Demand Catalyst redesigned to match Deep Research design language (Session 6) | Consistent module UX — same `lg:grid-cols-10`, `WorkspaceCards` style, dark panel, plan banner, breadcrumb+H1, section labels |
| `HowItWorksModal` in Demand Catalyst is a centered popup (Session 6) | User spec: "pop-up modal must not overlay the overview" — translucent backdrop at 55%, main content visible behind |
| DC `AddProductDrawer` imports from profile module (Session 6) | Products added in Demand Catalyst are saved to `useProfileStore` — truly unified, appears in both Profile and DC |
| `WeeklyLeadsSection` removed (Session 8) | Was referenced but never defined — caused build error. Weekly trend now lives inside `OpportunitiesSection` via `OpportunityLineChart`. |
| Buyer enquiries as inline table, not card grid (Session 8) | Table columns (company / qty / date / type / status / action) give higher density and scannability than cards; expandable rows add detail without navigation |
| Product detail as `useState` full-page swap, not route change (Session 8) | `viewingProduct` state in `ActiveCampaignPage` swaps content; back button is a single `setState(null)` — no URL changes, no scroll loss |
| `DetailStageStepper` mirrors `CampaignTimelineStrip` exactly (Session 8) | Same `STAGE_EXPLAINER` icons + `STAGE_META` colours + `dc-line-sweep` — unified visual language across overview table and detail screen |
| `DetailInfoCards` placed below Product Completeness, not above timeline (Session 8) | Info cards are form-context helpers; grouping them with the left completeness sidebar keeps the top of the detail screen clean and timeline-first |
| THF → Setup for Demand, TEC → Demand Generation (Session 8) | Reassignment creates a coherent 3-product demo story: THF (setup) → TEP (plan review) → TEC (campaign live) — each detail screen shows a distinct stage |
| `MiniPieChart` as pure SVG arc math (Session 8) | No external charting library; consistent with project's zero-extra-dependency philosophy for SVG charts |
| `PipelineFunnel` horizontal 4-step strip (Session 8) | Left-to-right funnel (received → sent → negotiation → won) with percentage labels makes conversion instantly readable without a chart |

---

## File Structure

```
scinode/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    — role-based dashboard render
│   │   │   ├── demand-catalyst/page.tsx
│   │   │   ├── market-pulse/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── proposals/page.tsx
│   │   │   └── research-repository/page.tsx
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── cro-scientist/page.tsx
│   │   ├── signup/
│   │   │   ├── cro-scientist/page.tsx
│   │   │   └── manufacturer/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── settings/
│   │   │   ├── change-email/page.tsx
│   │   │   └── change-password/page.tsx
│   │   ├── demo/page.tsx
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── FormField.tsx
│   │   │   └── PasswordInput.tsx
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── PreviewToggle.tsx
│   │   │   ├── PricingModal.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopNav.tsx
│   │   │   └── TrialBanner.tsx
│   │   ├── shared/
│   │   │   ├── ActivityFeed.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── ProjectTypePill.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── Timeline.tsx
│   │   └── ui/
│   │       ├── Logo.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       └── label.tsx
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── CROScientistLeftPanel.tsx
│   │   │   ├── CROScientistLoginPage.tsx
│   │   │   ├── CROScientistSignupPage.tsx
│   │   │   ├── DemoAccessPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ManufacturerLeftPanel.tsx
│   │   │   └── ManufacturerSignupPage.tsx
│   │   ├── dashboard/
│   │   │   ├── CMOProposalDrawer.tsx
│   │   │   ├── CRODashboard.tsx
│   │   │   ├── DashboardDayPlaceholders.tsx
│   │   │   ├── Day10Dashboard.tsx
│   │   │   ├── Day1Dashboard.tsx
│   │   │   ├── DeepResearchRepository.tsx
│   │   │   ├── DemandCatalyst.tsx
│   │   │   ├── DemandDiscoverySection.tsx
│   │   │   ├── IndependentCRODashboard.tsx
│   │   │   ├── ManufacturerProjectDetail.tsx
│   │   │   ├── ManufacturingDashboard.tsx
│   │   │   ├── ManufacturingDay1Dashboard.tsx
│   │   │   ├── MarketPulse.tsx
│   │   │   ├── PIPlaceholderDashboard.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── ProjectsListing.tsx
│   │   │   ├── ProjectsListingLegacy.tsx
│   │   │   ├── ProposalDrawer.tsx
│   │   │   ├── ProposalListing.tsx
│   │   │   ├── RFQProposalDrawer.tsx
│   │   │   ├── ResearcherDashboard.tsx
│   │   │   ├── ResearcherPlaceholderDashboard.tsx
│   │   │   ├── ScientistDashboard.tsx
│   │   │   └── UpgradePremiumModal.tsx
│   │   ├── independent-cro-profile/
│   │   │   ├── IndependentCROProfileSetup.tsx
│   │   │   ├── constants.ts
│   │   │   ├── types.ts
│   │   │   └── steps/
│   │   │       ├── Tab1CompanyProfile.tsx
│   │   │       ├── Tab2Products.tsx
│   │   │       ├── Tab3Certifications.tsx
│   │   │       ├── Tab4Services.tsx
│   │   │       ├── Tab5Equipment.tsx
│   │   │       ├── Tab6Facility.tsx
│   │   │       ├── Tab7Utility.tsx
│   │   │       └── Tab8Terms.tsx
│   │   ├── profile/
│   │   │   ├── DrawerBase.tsx
│   │   │   ├── ProfileSetup.tsx          — Session 5 rewrite: 30/70 layout, LeftSidebar, compact form
│   │   │   ├── SharedUI.tsx
│   │   │   ├── constants.ts
│   │   │   ├── types.ts
│   │   │   └── tabs/
│   │   │       ├── CompanyProfile.tsx
│   │   │       ├── EHSFacility.tsx
│   │   │       ├── Equipments.tsx
│   │   │       ├── LicencesCertifications.tsx
│   │   │       ├── Products.tsx          — Session 5 rewrite: Excel table, 11 cols, portal menus, empty rows
│   │   │       ├── Reactors.tsx
│   │   │       ├── TermsCondition.tsx
│   │   │       └── Utilities.tsx
│   │   └── researcher-profile/
│   │       ├── ResearcherProfileSetup.tsx
│   │       ├── constants.ts
│   │       ├── types.ts
│   │       └── steps/
│   │           ├── Step1Profile.tsx
│   │           ├── Step2Capabilities.tsx
│   │           ├── Step3TrackRecord.tsx
│   │           └── Step4Compliance.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useHydration.ts
│   │   ├── usePreviewMode.ts
│   │   └── useTrial.ts
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── cro.schema.ts
│   │   ├── manufacturing.schema.ts
│   │   └── scientist.schema.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── mock-data.ts
│   ├── store/
│   │   ├── useAppStore.ts
│   │   ├── useDashboardDayStore.ts
│   │   ├── useIndependentCROProfileStore.ts
│   │   ├── useNotificationStore.ts
│   │   ├── useProfileStore.ts
│   │   ├── useProposalStore.ts
│   │   └── useResearcherProfileStore.ts
│   ├── types/index.ts
│   └── lib/
│       ├── projectsData.ts
│       ├── supplierImages.ts
│       └── utils.ts
└── SCINODE_BUILD_SUMMARY.md
```
