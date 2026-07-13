# 방과후 테트리스 — Claude Project Memory

> Mobile-first web app for Korean dual-income parents to compose a feasible weekly after-school schedule.

This file is the persistent context for this project. Read it first in every new session before touching code.

---

## What this is (one sentence)

**A schedule feasibility tool, not an academy finder** — the primary question is *"Can this realistically fit into our family's week?"*, not *"Is this academy good?"*

Originating brief: [afterschool-tetris-brief.md](afterschool-tetris-brief.md)
Visual spec: [afterschool-tetris-mockup.html](afterschool-tetris-mockup.html) (interactive 5-screen HTML mockup, pixel-faithful target)

---

## Target user & context

- Korean parents of elementary school kids (grades 1–6) in dual-income households, primarily mothers
- Optimized for the **Toss in-app browser** (WebKit, mobile, 390×844 viewport target)
- Korean UI copy throughout — do not translate to English
- Initial geography: **Suwon / Gwanggyo only**
- Initial schools: 광교초, 신풍초, 영통초
- Initial subjects: 영어 (English), 수학 (Math), 태권도 (Taekwondo), 미술 (Art)

---

## Architecture

```
/                                  # repo root
├── afterschool-tetris-brief.md    # original strategic brief
├── afterschool-tetris-mockup.html # 5-screen vanilla HTML mockup (visual spec)
├── CLAUDE.md                      # this file
├── mockup/                        # ★ DEPLOYED build (Vercel root dir) — vanilla HTML+JS, source of truth for the live app
│   ├── index.html                 # nav history stack, list↔map toggle, multi-child, vertical week timetable
│   └── academies.json             # real Gwanggyo academy data (Kakao Local API sourced)
└── app/                           # Next.js 15 project (NOT deployed; feature-behind mockup/, needs port of July 2026 UX changes)
    ├── data/academies.json        # hardcoded mock data — load-bearing
    ├── src/app/                   # App router routes
    │   ├── page.tsx               # Screen 1: 홈 (Home)
    │   ├── setup/page.tsx         # Screen 2: 조건 설정 (Constraints)
    │   ├── results/page.tsx       # Screen 3: 결과 지도 (Results)
    │   ├── slot/[id]/page.tsx     # Screen 4: 시간표 (Tetris grid)
    │   └── schedule/page.tsx      # Screen 5: 내 주간 스케줄
    ├── src/components/            # Shared UI: StatusBar, NavHeader, BottomNav, Chip, Tag, FitBadge…
    ├── src/lib/                   # Store, types, fit-score, gap-detector
    └── next.config.ts             # output: 'export' for static hosting
```

---

## Tech stack

- **Next.js 15** — App router, static export (`output: 'export'`), TypeScript
- **Tailwind CSS** — pixel-faithful port of the Toss-style design tokens from the mockup
- **No UI library** (no shadcn, no Radix, no MUI) — all components hand-built to match the Toss aesthetic
- **State** — React Context + useReducer, persisted to `localStorage`. No Zustand/Redux.
- **No backend** in v1 — all data is hardcoded JSON
- **Deploy target** — static export to GitHub Pages from `https://github.com/younginsa/afterschool-tetris.git`

---

## Key UX decisions (load-bearing — do not change without discussion)

| Decision | Rationale |
|---|---|
| **적합도 % replaces star rating** | Fit is the core metric, not academy quality |
| **Constraint-first input** | Establish constraints *before* showing options. No search bar. |
| **Gap warnings surface automatically** | Parents don't notice dangerous pickup gaps without prompting |
| **Shuttle is a top-level toggle, not a filter** | It's a hard constraint, not a preference |
| **Combo suggestion lives inside slot view** | Cross-sell at the moment of commitment, not before |
| **Vertical week-grid timetable in schedule** | Days as columns, time flows top→bottom (calendar-style). Replaced the horizontal timeline per user decision, July 2026 |
| **Multi-child is first-class** | Child selector in setup; 지호/지안/같이 보기 tabs in schedule. 같이 보기 splits each day column (left=child 1, right=child 2). This is the differentiating wedge — no competitor does multi-child feasibility |
| **Back = exactly one step; tabs reset the stack** | Navigation uses a real history stack synced to browser history (OS back-gesture works). Tab-bar taps are context switches: stack resets so back goes straight home |
| **Results list↔map full-screen toggle** | List is default; floating pill button switches to full-screen map. Filter chips visible in both modes; map pins follow the active filter |
| **Monthly cost estimate per slot** | Anchors decision-making to budget reality |
| **44px minimum tap targets** | Toss WebKit / mobile-first ergonomics |

---

## Design tokens (from mockup)

- Primary blue: `#3182F6` (Toss blue)
- Primary blue hover/active: `#1C6FDF`
- Tinted blue surface: `#EBF2FF` / `#F0F5FF`
- Success green: `#059669` / `#15803D`
- Tinted green surface: `#E5F9F3` / `#DCFCE7` / `#F0FFF8`
- Warning amber: `#D97706` / `#92400E`
- Tinted amber surface: `#FEF3C7` / `#FFFBEB`
- Body text: `#191F28`
- Muted text: `#6B7684`
- Disabled / tertiary text: `#B0B8C1`
- Background: `#F5F6F8`
- Card border: `#EAECF0` / `#E5E8EF`
- Subject pill colors: English `#DBEAFE`/`#1D4ED8`, Math `#FEF3C7`/`#B45309`, Taekwondo `#FCE7F3`/`#BE185D`, Art `#D1FAE5`/`#065F46`, Shuttle `#E5F9F3`/`#059669`
- Font: `-apple-system, 'SF Pro Display', 'Noto Sans KR', sans-serif`
- Border radius: cards `16px`, chips `100px` (pill), buttons `14px`, tags `6–7px`

---

## Data model

```ts
type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
type Subject = 'english' | 'math' | 'taekwondo' | 'art';

type Slot = {
  day: Day;
  startTime: string;     // "HH:mm" 24h
  endTime: string;
  available: boolean;    // false = 만석
};

type Academy = {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  subjects: Subject[];
  shuttleAvailable: boolean;
  slots: Slot[];
  monthlyCostKRW: number;
  fitScore: number;      // 60-99
};

type Child = {
  id: string;            // demo children: c1 지호(3학년) / c2 지안(1학년)
  name: string;
  grade: 1 | 2 | 3 | 4 | 5 | 6;
  school: '광교초' | '신풍초' | '영통초';
};

type Constraints = {
  childId: string;       // constraints & schedules are saved per child
  school: '광교초' | '신풍초' | '영통초';
  grade: 1 | 2 | 3 | 4 | 5 | 6;
  subjects: Subject[];
  shuttleRequired: boolean;
  latestArrivalTime: string; // "HH:mm"
};

type Selection = {
  academyId: string;
  slotDays: Day[];
  startTime: string;
  endTime: string;
};
```

---

## What NOT to build (per brief)

- User auth or accounts
- Any real-time data
- ~~Sibling coordination~~ → **promoted to core scope July 2026** (multi-child selector + 같이 보기 combined view; competitive wedge)
- AI recommendations
- Shuttle booking / payment
- In-app academy messaging
- Push notifications
- Reviews or ratings
- Route optimization

---

## Out-of-band reminders

- Korean copy is the source of truth — do not paraphrase or shorten it without explicit ask
- The phone-frame chrome in the mockup is for the visual demo only — the real app renders full-bleed mobile
- When in doubt about a visual detail, the mockup is canonical
- The brief explicitly warns "empty-map syndrome" — the seeded JSON must look realistic, never sparse
