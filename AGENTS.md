# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Confirmed product scope
Use only the user-selected Heritage Scoreboard option 1 layout. Discard blended option1+2. Responsive web app (TV/PC/tablet/mobile), not a simulated native phone shell. Mobile compact header + liquid-glass bottom navigation. Official Golfzon API rank/totalScore are the client-confirmed source of truth; never apply an additional grade adjustment. TV1 ABC nearest8; TV2 total15 + ABC8 simultaneously. Default shop14859 with all-shops option.

## Typography revision and release authorization
On 2026-11-10 the user requested QA, commit, push, and deployment to the existing project. Mobile typography should be light and modern, referencing the official Genesis Championship page: regular 400 body/controls/names/scores and light 300 titles; remove decorative italic mobile wordmark. Use licensed Pretendard, not copied proprietary Genesis font files. Keep TV option 1 and mobile glass navigation.

Latest clarification: apply the same regular/light typography to ALL screens, including PC and TV. No extra bold emphasis for TV. Establish hierarchy through size, spacing, and color. This supersedes mobile-only typography scope.

## UI revision — 2026-11-11
User requests natural typography and normal tracking on all screens, no decorative middle-dot separators or generic slogans. TV: smaller type, more spacing, remove background photo and mobile link, exchange-style moving official-record ticker with pause/reduced-motion support. `/tv` is now the selection hub; TV 보기 routes there. Preserve TV row counts and independent views. Mobile inputs/selects use 16px to prevent iOS focus auto-zoom while preserving pinch zoom. This supersedes earlier generated mock details and extreme light typography.

## Client confirmation — 2026-11-11
Official Golfzon settings are correct; the poster will be corrected. Source policy is confirmed, not provisional. Stages 1 and 2 form ONE season tournament; the final will be a SEPARATE ordinary tournament, not a third season stage. Final selection uses two-stage season totals: shop top 15 each (30 across two shops), plus overall season top 30. Do not assume exactly 30 unique finalists or calculate badges before selection is finalized.
TV stroke posting is restricted to 화전 스크래치 14859 (ignore shop query overrides and remove TV shop selector); nearest retains existing combined scope. Mobile's previously authorized per-stage all-shop option remains available. Hide season-total selection from the public web UI for now, keeping the official season API for later selection work. Existing poster is labeled awaiting correction. Preserve official registered dates; client says 20 days but registration currently remains Nov 10–30 and Dec 1–21. Do not invent a revised timetable or a final tournament ID/link.

2026-11-11: PC TV 화면 선택 must be a visible button, not a small text link. Header uses filled deep green and sidebar uses bordered light green. Both link to /tv.

2026-11-11: User requests aligned TV controls and minimal copy. Settings trigger shares the heading grid centerline; settings menu below header, centered square close button, uniform 44px actions. Player detail and event tab use factual rows only; omit missing raw score and zero adjustments, retain official record values and essential eligibility rules. Remove generic explanatory prose.

2026-11-11 latest TV request: headings exactly 니어리스트 (통합) and 순위 (화전 스크래치). Standings has15 rows in EACH of total/A/B/C, including empty placeholders. Nearest retains8 rows per course. Supersedes previous ABC8 rule for standings only. Stretch course panels to same height as total. Update launcher labels/counts accordingly.

## Mobile footer / QR revision — 2026-11-12
User supersedes glass dock: remove mobile bottom navigation entirely; event moves to44px header link, record return at same location. No mobile fixed footer or reserved dock space. Nonfixed shop footer uses unmodified official Golfzon Park and TWOVISION NX PLUS image assets, verified address/phone, map and official shop links. Asset provenance/public shop source in public/assets/branding/sources.json. NX PLUS9 systems verified via official /v2/shop/14859. No hours/prices guessed.
PC and both TVs include site root QR at lower right. Four-module quiet zone, black/white, generated locally, no third-party QR service. Reserve PC right gutter and TV footer/ticker area so no ranks are obscured. Narrow tablets use flow-end right-aligned QR. TV counts remain nearest8/8/8 andstandings15/15/15/15.
