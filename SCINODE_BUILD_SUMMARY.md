# SCINODE Supplier Platform — Complete Build Summary

> **Project Path:** `/Users/sathimidya/scinode`
> **Git Repo:** `https://github.com/sathi-design/scinode-customer-platform-.git`
> **Dev Server:** `http://localhost:3000`
> **Last Updated:** 2026-06-10 (Session 3)
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

### 11. Profile Setup — Manufacturer / CRO / CMO (`ProfileSetup.tsx`)

**Route:** `/dashboard/profile`

**Tab navigation:** URL param `?tab=X`

**8 Tabs:**

| Tab | Component | Key Fields |
|---|---|---|
| 1 | `CompanyProfile.tsx` | Company name, type, location, year est., employee count, toggle fields |
| 2 | `Products.tsx` | Product catalogue — CAS number, purity, quantity, packaging, application |
| 3 | `LicencesCertifications.tsx` | ISO, GMP, FDA, REACH upload + verification |
| 4 | `Reactors.tsx` | Reactor type (SS/glass-lined/HDPE), vessel capacity (KL), working volume, annual output |
| 5 | `Equipments.tsx` | Distillation columns, dryers, centrifuges, filtration, spray dryers |
| 6 | `EHSFacility.tsx` | ETP systems, fire safety, solvent recovery, hazardous material handling |
| 7 | `Utilities.tsx` | Chilling plants, boilers, HVAC, nitrogen lines, compressed air, steam, water treatment |
| 8 | `TermsCondition.tsx` | Platform terms review + accept, activates account |

**DrawerBase:** slide-over drawer used within profile tabs for adding items

---

### 12. Profile Setup — Independent CRO (`IndependentCROProfileSetup.tsx`)

**8 tabs (same structure as Manufacturer):**
Tab1CompanyProfile → Tab2Products → Tab3Certifications → Tab4Services → Tab5Equipment → Tab6Facility → Tab7Utility → Tab8Terms

**Key difference from Manufacturer:** Services & Capabilities tab replaces Reactors tab. Store: `useIndependentCROProfileStore`.

---

### 13. Profile Setup — Researcher (`ResearcherProfileSetup.tsx`)

**4 steps:**

| Step | Component | Key Fields |
|---|---|---|
| 1 | `Step1Profile.tsx` | Academic/institutional identity, ORCID, department |
| 2 | `Step2Capabilities.tsx` | Research domains, techniques, specializations |
| 3 | `Step3TrackRecord.tsx` | Publications, patents, prior industry work |
| 4 | `Step4Compliance.tsx` | Agreements, documentation |

**Store:** `useResearcherProfileStore`

---

### 14. Auth Flows

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

---

## File Structure

```
scinode/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    — role-based dashboard render
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
│   │   │   ├── ProfileSetup.tsx
│   │   │   ├── SharedUI.tsx
│   │   │   ├── constants.ts
│   │   │   ├── types.ts
│   │   │   └── tabs/
│   │   │       ├── CompanyProfile.tsx
│   │   │       ├── EHSFacility.tsx
│   │   │       ├── Equipments.tsx
│   │   │       ├── LicencesCertifications.tsx
│   │   │       ├── Products.tsx
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
