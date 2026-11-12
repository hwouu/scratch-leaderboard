# Tour Results implementation QA — 2026-11-12

final result: passed

Source truth: workspace design/2026-season/mobile-professional-2026-11-12/displayed-1.png, explicitly selected displayed1. Existing responsive WEB APP retained; no new device-shell template. User override removes official-record viewing link; no replacement button. Prior regular400/natural-spacing/no-dock/no-autofocus requirements override generated bold artifacts. Raster inventory: supplied original Park and NX PLUS logos only, unchanged. Phosphor matches supplied icons.

Comparison evidence: qa/tour-results/comparison-before.png and comparison-after.png; same-input focused comparison focus-after.png. Source1261x1247 contains two content panels ~598x1210 each; rendered original at820px wide in comparison to normalize each to~390x789. Actual list-after.png/sheet-after.png each390x789. CSS viewport390x789, screenshot density1. Both list and selected-player states share exact five sample names/ranks/scores and11:46 timestamp, explicit opt-in preview fixture. Real API is not replaced. Full-view comparison1680x900; focused comparison1000x600. Only image layout/quality evidence is archived here; source text is not authoritative event data.

Comparison history: first comparison identified P2 accumulated top spacing (~12px) and row-density drift (~40px by final row). Fixed header68→64px, scope bottom gap18→12px, table header36→34px and data rows48→44px; recaptured and compared. Final data region aligns within touch-target allowance. Remaining intentional differences: regular400 instead of image-bold;44px minimum rows; official CTA removed per user; duplicate round count removed (displayed once in identity), making sheet421px instead of source~507px. Sheet remains bottom anchored. No actionable P0/P1/P2 findings remain.

Five fidelity surfaces: licensed Pretendard400, natural tracking,16px names/24px list scores/22px player name/34px final score; viewport-aligned tabs, no filled segmented pills, neutral borders/ink with green active rules; pale venue footer only, black scrim without blur; original logos crisp/unwarped, no invented imagery; official ties, nulls, genuine E/units and course context preserved. Count is selected resource count, no duplicate title. Applied adjustments displayed without recalculating the official final.

Interactions: actual source-data search→course-only participant, shop/all-shops, ABC score/nearest switching, round1/2, event/return preserving prior nearest course, search opens unfocused,16px input, native Escape and focus return. Actual partial player shows missing records, no fabricated combined rank/score. Current longest observed live nicknames7characters; wrapping/truncation retained for future long content, not claimed as a synthetic long-name test. Official-record links absent on both PC/mobile details. Mobile320x568/360x640/390x844/600x900 andPC768x1024/1440x900: no modal x/y overflow, mobile bottom flush; sheet heights372.5/421.09px depending density. Close transparent, title focus H2. Extreme zoom/content can scroll rather than clip. Console warnings/errors none during actual main-flow checks.

TV1920x1080 regression: standings15/15/15/15, nearest8/8/8, QR retained, no overflow. Existing18 meaningful source/lookup/ticker/packaging tests and production build pass. No official adapter/formula changes. Physical iOS hardware, physical QR distance, and exhaustive accessibility certification outside this check.

Implementation checklist complete: mobile selected list; contextual player sheet; official CTA removal; preserved data/controls; responsive/browser checks; before/after comparison. P3: system font antialiasing differs from generated raster. No further loop required.

---

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

## Dialog initial state / player detail — 2026-11-12

final result: passed

Cause: showModal default focus on first close button, plus explicit input.focus in mobile useModal. Initial focus now goes to a noninteractive modal title (screen-reader context retained); input opens unfocused. Close backgrounds transparent, corners8px; hover fill limited to fine-pointer devices to avoid sticky touch hover. Keyboard focus on interactive controls and native Escape/return retained. Search input has no nested outline even after typing, caret/field boundary retained.

PC and mobile share compact player detail: identity, rank/final score, one ABC table with score and nearest columns, applied adjustments in two columns, official source. Actual player at390x844 andPC1440x900:517px dialog, no internal scroll;320x568:463px, no x/y overflow. Partial participant432px with missing courses correctly marked; nearest1.86m and per-course records preserved. Search-to-player transition, scope title focus, transparent X default, search unfocused on entry / no outline on typing, Escape and focus return verified. Console warnings/errors none.18 tests and build pass; original official values never recomputed. Extreme zoom/content retains scroll fallback rather than clipping.

## Mobile touch and motion — 2026-11-12

final result: passed

Scoped behavior refinement of selected Tour Results, no new visual layout. Underlines slide220ms; ranking content directional fade/10px180ms; sheets and search enter240ms/exit170ms with compositor transforms. Feedback on icons/actions/rows; no permanent pressed background. Drag handle/header only, native dialog body can scroll normally. Downward threshold/flick closes; small/horizontal/cancel returns. Native modal stays inert until exit finishes (an immediate background tap during closing is correctly ignored). Search→player waits for search exit, no two dialogs open. Title focus/unfocused search,16px inputs, Escape and focus return retained. Body scroll restored on close/unmount with shared lock ownership.

Browser pointer drag390x844 verified186px downward closes,14px pull snaps back with transform cleared. Search→partial player keeps real missing-course state, exactly one open dialog. Shop apply, score/nearest/course transitions, no horizontal overflow, body overflow hidden/open and restored/closed checked. Small320x568 dialog no overflow; PC1440 skips mobile motion and close immediate. Console warnings/errors none. Reduced-motion durations/desktop/threshold rejection independently covered by four tests, CSS overrides inspected; OS-level emulation and physical iOS touch hardware not available.22 tests/build passed. Existing official source tests still pass; no data adapter/scoring changes. Browser history keeps normal routing; no claim of native installation/haptics/hardware-back integration.
