# 방과후 테트리스 — Project Brief
> Ideation session summary · Ready for Claude Code development

---

## Product Concept

**"After-school Tetris for working parents in Korea"**

A mobile-first web app optimized for Toss in-app browser. Helps Korean dual-income parents with elementary school children find and compose a realistic weekly after-school schedule — accounting for shuttle availability, time slots, pickup gaps, and home arrival constraints.

**The core insight:** The product is not an academy finder. It is a **schedule feasibility tool**. The primary question it answers is not "Is this academy good?" but "Can this actually fit into my family's week?"

---

## Target User

- Korean parents with elementary school children (grades 1–6)
- Dual-income households, primary scheduler is typically the mother
- Pain: coordinating school end times, academy slots, shuttle routes, sibling schedules, pickup gaps — currently managed via KakaoTalk, Excel screenshots, and phone calls
- Emotional driver: reducing invisible cognitive load, daily anxiety

---

## Market & Positioning

### Why existing services fail this user
Gangnam Mom, AcademyTown, Heykorean — all are **lead generation platforms**. Their customer is the academy, not the parent. Solving schedule friction is against their business interest. No existing tool treats schedule compatibility as a first-class feature.

### Competitive gap
No one owns the intersection of: map discovery + schedule slot fit + shuttle availability + sibling coordination.

### Product category
Family logistics / micro-scheduling / local supply coordination. Closest international analogs: HopSkipDrive (kid transport ops) + Tripadvisor Experiences (discovery) + Google Calendar — but none exist in this specific Korean context.

### Differentiation
**Schedule feasibility as the primary filter.** Not rating, not price, not distance — "does this realistically work given my constraints?"

---

## MVP Scope (Strict)

### Initial geography
Suwon / Gwanggyo only

### Initial schools
2–3 elementary schools (광교초, 신풍초, 영통초)

### Initial academy categories
English, Math, Taekwondo, Art

### What to build in v1
- Constraint input flow (school, grade, subjects, shuttle toggle, latest arrival time)
- Filtered academy list with fit score
- Map view with academy pins
- Time slot grid per academy (the "Tetris board")
- Weekly schedule composer / preview
- Gap warning system

### What NOT to build in v1
- User auth or accounts
- Real-time data of any kind
- Sibling coordination
- AI recommendations
- Shuttle booking or payment
- In-app messaging with academies
- Push notifications
- Reviews or ratings
- Route optimization (too complex)

### What can be faked with mock data
- All academy data → Google Sheets → hardcoded JSON
- Shuttle availability → yes/no boolean per academy
- School dismissal times → static, sourced from MOE
- Time slot availability → manually collected from ~20 academies

---

## Core UX Flow (5 Screens)

### Screen 1: 홈 (Home)
- Hero with quick stats (total academies, shuttle count)
- Quick action grid (조건으로 찾기, 내 스케줄, 지도 탐색, 빈 슬롯 알림)
- Recent academies list
- Combo recommendation card

### Screen 2: 조건 설정 (Constraint Setup)
- School picker (chip select)
- Grade picker (chip select)
- Subject multi-select chips
- Shuttle required toggle
- Latest home arrival time slider
- Summary of entered constraints before CTA

### Screen 3: 결과 지도 (Results)
- SVG/Map top half with fit-score pins and shuttle radius overlay
- Filter chips: 전체 / 셔틀있음 / 빈 슬롯
- Academy cards sorted by 적합도 %
- Each card: name, distance, subject tag, shuttle tag, fit score, slot pills (available / full)
- Green banner for good-fit academies, amber banner for warnings

### Screen 4: 시간표 선택 (Slot Tetris)
- Academy header with emoji icon, name, tags
- Weekly time grid (Mon–Fri × 14:00–18:00, 30min intervals)
- Cell states: empty (tappable) / taken (만석) / selected (blue ✓)
- Selection summary (days, times, shuttle info, monthly cost estimate)
- Compatible combo suggestion at bottom

### Screen 5: 내 주간 스케줄 (My Schedule)
- Timeline visualization per day (14:00–19:00 bar)
- Color blocks: blue for English, amber for Math
- Striped warning blocks for gaps
- Gap warning banner with plain-language explanation
- Summary card: academies, weekly sessions, shuttle status, max arrival time, monthly cost
- Share as image CTA
- Re-do constraints CTA

---

## UX Design Decisions (From Mockup)

| Decision | Rationale |
|---|---|
| 적합도 % replaces star rating | Fit is the core metric, not quality |
| Constraint-first input | Not search-first — establish constraints before showing options |
| Gap warnings surface automatically | Parents don't notice dangerous pickup gaps without prompting |
| Shuttle toggle is top-level, not a filter | It's a hard constraint, not a preference |
| Combo suggestion inside slot view | Cross-sell at the moment of commitment, not before |
| Timeline view over table grid in schedule | More intuitive at a glance for non-technical users |
| Monthly cost estimate per slot | Anchors decision-making to budget reality |

---

## Top UX Ideas to Build Toward (Post-MVP)

**High-potential interactions**
- Natural language constraint input ("I need math 3 days a week, home by 6")
- Swipe left/right to accept/reject time slot options
- "Gap detector" — automatic warning when a combo has a dangerous pickup gap
- Share weekly schedule as a KakaoTalk-ready image
- School bell time preset (select school → auto-fill earliest available slot)
- Time scrubber slider: "What if school ends at 3pm?" → map updates live

**Retention mechanics**
- Slot waitlist: notify when a preferred slot opens
- Seasonal prompts (새 학기 — new semester rotation)
- Saved schedule with change alerts
- "47 families near you use this combination" social proof

---

## Cold Start Strategy

The empty-map problem is the biggest day-1 risk.

1. **Manual seed first, app second** — visit or call 20 academies in Gwanggyo before writing code. That data IS your v1 database.
2. **Target one apartment complex** — Gwanggyo has dense, homogeneous parent communities. One building = controlled test.
3. **KakaoTalk group as distribution** — seed in one elementary school parent group. Don't build new distribution.
4. **Do manual scheduling for 10 families** — unscalable on purpose. User research + content seeding simultaneously.
5. **Don't show a map until 30+ academies** — show a list with rich filters first.

---

## Risk Assessment

| Risk | Level | Notes |
|---|---|---|
| Academy data accuracy & maintenance | 🔴 Critical | Load-bearing assumption. Academies are small independent operators, many without websites |
| Empty-map syndrome at launch | 🔴 Critical | Must seed manually before launch |
| Naver / Kakao cloning the feature | 🟠 High | Only defensible with proprietary supply relationships |
| Parent won't trust mock data | 🟡 Medium | Clearly label data as "manually verified as of [date]" |
| Wrong target geography | 🟡 Medium | Gwanggyo is good: dense, affluent, high academy density |

**Highest-risk assumption:** That academies will voluntarily share and maintain accurate schedule and shuttle data.

---

## Investor Perspectives

**Bear case:** The supply side kills this. Academies are small independent operators. Getting them to submit and maintain data is a BD problem, not a product problem. Naver has the traffic to make your cold start irrelevant overnight. Defensibility is structurally weak without proprietary supply relationships.

**Bull case:** Parents spend ₩800K–1.2M/month per child on private education. The scheduling decision determines which academy gets that contract. If this app becomes the tool for that decision, commerce attachment is enormous. Right exit: acquisition by Kakao, Naver, or a large edtech player.

---

## Tech Stack Notes (For Claude Code)

- Mobile-first, Toss in-app browser optimized (WebKit)
- No backend in v1 — all mock data as JSON
- Touch-friendly: 44px minimum tap targets
- Smooth scrolling, no hover states as primary interaction
- Mockup built in vanilla HTML/CSS/JS — can be ported to React/Next.js
- Consider: Next.js static export for GitHub Pages (consistent with your portfolio setup)

---

## Files in This Project

| File | Description |
|---|---|
| `afterschool-tetris-mockup.html` | Full interactive 5-screen mobile prototype |
| `afterschool-tetris-brief.md` | This document — strategic brief and design spec |

---

## What to Do Next in Claude Code

1. Set up Next.js project (or vanilla HTML to start faster)
2. Create `data/academies.json` with 10–15 mock academy records including: name, address, subjects, shuttle boolean, available slots array, monthly cost
3. Build the constraint setup screen first — it's the clearest entry point and forces you to define the data model
4. Wire constraint → filtered results → slot view as the core loop
5. Test on actual mobile (Toss browser or Safari iOS) early — not just desktop dev tools

---

*Ideation session: May 2026 · Claude Sonnet 4.6*
