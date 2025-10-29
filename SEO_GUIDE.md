# SEO 가이드 (Scratch Leaderboard)

## 1) 제출/등록
- Google Search Console: 사이트 소유권 확인 후 `sitemap.xml` 제출
- 네이버 서치어드바이저: 사이트 등록, 소유권 확인, `sitemap.xml` 제출
- 중요 URL 우선 색인요청: `/leaderboard-2nd/qualifying`, `/leaderboard/qualifying` 등

## 2) 운영 팁
- 대회 시작/변경 시: 라우팅 스케줄 갱신 후 색인요청
- 성능: 이미지 용량 200KB 이내, WebP 권장, 불필요한 JS 지양
- 로그 분석: Search Console/네이버 클릭 쿼리 확인해 제목/설명 미세 조정

## 3) 키워드 권장 문구
- 스크래치 리더보드, 스크래치 골목대장, 골프존 리더보드, 화전스크래치, 스크린골프 리더보드

## 4) 점검 체크리스트
- 메타 타이틀/설명: 페이지별 문맥 반영되는지
- Canonical/OG/Twitter 카드: URL/이미지/타이틀 일치
- `robots.txt`: `/api/` 차단, `Sitemap:` 경로 노출
- `sitemap.xml`: 최신 스테이지 URL 포함

## 5) 색인 확인 순서
1. Google: URL 검사 → 색인 요청 → 커버리지/강화 항목 확인
2. 네이버: 웹 페이지 수집 현황 확인 → 반영 요청
