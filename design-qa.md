# Release QA — passed

2026-11-10. User authorized commit, push, and production deployment.

All screens use licensed Pretendard: light 300 headings and regular 400 controls/names/scores. No bold emphasis by device. Reference: https://www.genesis.com/kr/ko/genesis/genesis-golf/championship.html (official page inspected; proprietary fonts not redistributed). Heritage option 1 layout and glass mobile navigation retained.

Production build and 11 automatic tests passed. Official scores/ranks retained without additional adjustments. Missing values, pagination, shop scope, combined nearest, failed/empty resources, stale-success timestamps, and packaging covered.

Browser QA: mobile 390x844 actual participant details verified (rank 1, final -3, grade -15, round -1). TV standings 1920x1080 has 15/8/8/8 rows, no horizontal or vertical overflow, no computed font weights above 400. Responsive and production smoke checks recorded in the release result.

Previous implementation is retained in Git history at 9f0c36a141f33464021e48fc210db5470fe1e513. Separate local legacy reference clone unchanged. Removed committed dependencies, obsolete frontend and Python API from the current tree; public Naver verification retained. The final is a separate tournament and is outside this release's live standings.

Final responsive recheck: 360x800, 600x800, 768x1024, 1440x900 had no horizontal overflow and no visible font weight above 400. Nearest TV 3840x2160 had 8/8/8 rows and no horizontal/vertical overflow. Browser console warnings/errors: none.

## UI refinement — 2026-11-11

Passed local QA: 1920x1080 standings 15/8/8/8 rows, 3840x2160 nearest 8/8/8 rows, no horizontal/vertical overflow. TV header background is none, mobile CTA removed. Heading reduced from approximately 76px to 44px at 1080p; natural letter spacing. Official ticker plays with pause control; duplicated track is hidden from assistive technology, reduced-motion CSS disables animation. No fabricated change arrows or gains.

Desktop TV 보기 reaches `/tv`, and choosing the first card reaches `/tv/nearest?round=1`. Mobile search focus verified at 390x844: computed font 16px, visual viewport scale 1, no horizontal overflow, search matches actual record. Pinch zoom is not disabled. Real iOS hardware was not available.

14 tests including 3 meaningful ticker cases pass. Production build passes. The prior selected visual is superseded only by the user's explicit refinements; photo assets are removed rather than re-used.

## Client rules confirmation — 2026-11-11

Official Golfzon settings confirmed; policy provisional=false, confirmedBy=client. Public round choices are only 1/2 even for an old ?round=season link. TV standings ignores ?shop=0 and remains14859; no shop select. Nearest remains combined. Final is a separate ordinary event with season-based shop top15 each plus additional overall top30; no premature qualification badge or fixed unique count. Poster link clearly says awaiting correction. Schedule comes from official metadata rather than the client's approximate20-day phrase. 14 tests and build passed.

## TV controls / copy cleanup — 2026-11-11

Scoped Product Design audit: before/after screenshots of TV settings, player modal and event page. Header centerline mismatch ~9px fixed using one grid row. Close target now32px square, actions44px, settings below header; Escape closes and returns focus. 1080p center difference0px, 4K<0.01px. Nearest8/8/8 and no overflow at4K.

Player modal omits prose/missing raw/zero adjustments, preserves official totals, genuine E and applied adjustments. Event page retains essential schedules/courses/selection/links as labeled values without explanatory sentences. Mobile390x844 modal646px and no horizontal overflow; event no overflow. Console errors/warnings none. This is a scoped interaction check, not full accessibility certification. Full screenshot comparison is stored in the workspace design/2026-season/qa-2026-11-11/controls-cleanup/report.html.

## TV row count / headings — 2026-11-11

User titles applied exactly: 니어리스트 (통합), 순위 (화전 스크래치). Standings tables now15/15/15/15 rows, including empty placeholders. Course panels stretch to total panel height; 1080p row height41.6px. Verified no horizontal/vertical overflow at1920x1080 and3840x2160. Nearest remains8/8/8. Launcher labels/counts updated.14 tests and build passed.

## Selected mobile concept 3 — 2026-11-12

final result: passed

Scope: mobile public routes only (below700px); existing PC/TV presentation retained. Selected reference: workspace design/2026-season/mobile-renewal-2026-11-11/displayed-3-unified-results.png. Reference normalized from852x1846 to390px width; actual390x844 captured with identical five nearest-A names/distances and14:20 timestamp. Side-by-side evidence: qa/mobile3/comparison.html and comparison.png. Initial extra preview/title spacing corrected and recaptured. User's regular400 typography overrides generated bold;44px controls and refresh action intentionally retained. No remaining P0/P1/P2 findings in this scoped check.

One records surface with score/nearest modes, one search entry, one shop/round scope sheet, ABC selection and two-item glass dock. Search includes course-only participants without inventing a combined score/rank. Native modal keyboard dismissal, search-to-player transition and incomplete player course records checked with live data. Round2 empty state, all-shops setting, nearest combined scope and returning from event to previous record mode checked. Input16px, visual scale1, pinch zoom remains available; actual iOS hardware not available.

Responsive360/390/430/600 mobile and768/1440 desktop checked for horizontal overflow. Fixed viewport initialization race found at360px and rechecked. TV1920x1080 remains nearest8/8/8 and standings15/15/15/15, no overflow. Console errors/warnings none during main-flow checks. Production build and18 meaningful tests passed, including official values, failure/cache behavior and mobile participant lookup. Source adapter and official scoring unchanged.

## Footer / QR refinement — 2026-11-12

final result: passed

User-directed incremental refinement supersedes selected mock's bottom dock. Removed mobile fixed dock and112px bottom reservation; event is a44px header link with return to records. Shop footer is in normal flow, so ranks remain unobscured. Original Golfzon Park and TWOVISION NX PLUS assets fetched from official sites, aspect ratios preserved; verified official shop14859 roadAddress/telephone/NX PLUS9 systems. Provenance in public/assets/branding/sources.json. No assumed hours/prices.

PC QR occupies a reserved gutter above1050px; tablet700–1050 uses an end-of-page QR. Both TVs reserve right footer/ticker space. Initial ticker edge overlapped QR by29px; corrected and recaptured:1080p tickerRight1674.97, QRleft1707.38 (32px gap), table bottom875.91, QRtop900.86 (25px gap).4K no overflow;15/15/15/15 standings and8/8/8 nearest retained. Header event/return works.360/390/600/768/1050/1051/1440 widths checked, no horizontal overflow; mobile has zero visible fixed elements. Console errors/warnings none.

QR independently decoded from generated PNG and actual PC1440/TV1920 screenshots using macOS Vision: exact https://scratch-leaderboard-omega.vercel.app/. Four-module quiet zone, opaque white backing, no logo overlay. Physical TV/camera distance not tested. Screenshots in workspace design/2026-season/qa-2026-11-12-branding/. Existing18 tests and production build passed.

## Compact controls and PC brand assets — 2026-11-12

final result: passed

User requested direct refinement. Mobile header tournament name left/Park logo84px right; info/search icon44px targets beside two mode tabs. Same MobileRoundPicker DOM/control for score and nearest,16px select. Separate shop-only sheet avoids duplicate phase selection. Round2 selection retained when switching modes, shop change and info/return/search verified against actual records. Removed stale poster link from shared EventInfo on PC and mobile. Footer123.19px (previous~267px), all three contact targets share the exact y position. Only NX PLUS remains in footer, Park logo moved up as requested. PC uses original Park logo96px header/NX PLUS156px sidebar; tablet header84px. No changes to official data or TV layout.

Responsive320/360/390/600/768/1051/1440 checked: no horizontal overflow; contact row stays on one line even320px. Search and native select remain16px; original logo aspect ratios retained.18 tests and build passed. Desktop screenshot inspected at1440x900. No new decorative text or weight emphasis. Existing QR placement retained.
