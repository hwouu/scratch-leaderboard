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
