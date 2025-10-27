# 웹 분석 도구 설정 가이드

## 1. Google Analytics 4 설정

### 단계 1: GA4 계정 생성

1. [Google Analytics](https://analytics.google.com/) 접속
2. "측정 시작" 클릭
3. 계정 이름 입력 (예: "Scratch Leaderboard")
4. 속성 이름 입력 (예: "골목대장 토너먼트")
5. 보고서 시간대를 "대한민국"으로 설정
6. 통화를 "KRW"로 설정

### 단계 2: 데이터 스트림 설정

1. 플랫폼으로 "웹" 선택
2. 웹사이트 URL: `https://scratch-leaderboard.vercel.app`
3. 스트림 이름: "Scratch Leaderboard"
4. 측정 ID 복사 (G-XXXXXXXXXX 형식)

### 단계 3: 코드에 측정 ID 적용

`frontend/index.html` 파일에서 측정 ID가 이미 적용되어 있습니다:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-X34KCRC07N"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-X34KCRC07N');
</script>
```

**현재 설정된 측정 ID**: `G-X34KCRC07N`

## 2. Vercel Analytics 설정

### 자동 활성화

- 이미 `@vercel/analytics` 패키지가 설치되어 있음
- `app.js`에서 `inject()` 함수 호출로 활성화됨
- 별도 설정 불필요

### Vercel 대시보드에서 확인

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. "Analytics" 탭에서 데이터 확인

## 3. 분석 가능한 데이터

### Google Analytics 4에서 확인 가능한 데이터:

- **실시간 사용자**: 현재 사이트를 방문 중인 사용자 수
- **일간/주간/월간 방문자**: 방문자 통계
- **유입 경로**: 어디서 사이트로 유입되었는지
  - 직접 방문 (Direct)
  - 검색 엔진 (Organic Search)
  - 소셜 미디어 (Social)
  - 참조 사이트 (Referral)
- **사용자 행동**: 페이지별 체류 시간, 이탈률
- **디바이스 정보**: 모바일/데스크톱 비율
- **지역 정보**: 방문자 위치

### Vercel Analytics에서 확인 가능한 데이터:

- **페이지 뷰**: 페이지별 조회수
- **성능 메트릭**: 페이지 로딩 속도
- **Core Web Vitals**: 사용자 경험 지표

## 4. 고급 분석 이벤트

### 추적되는 사용자 행동:

- 리더보드 페이지 조회
- 토너먼트 단계별 조회
- 테마 변경 (다크/라이트 모드)
- 모바일/데스크톱 사용
- 페이지 로딩 시간

### 커스텀 이벤트 추가 방법:

```javascript
import { trackEvent, AnalyticsEvents } from "./js/utils/analytics.js";

// 예: 새로고침 버튼 클릭 추적
trackEvent(
  AnalyticsEvents.LEADERBOARD_REFRESH,
  "User Action",
  "Refresh Button"
);
```

## 5. 배포 및 확인

### 배포:

```bash
git add .
git commit -m "Configure Google Analytics with measurement ID G-X34KCRC07N"
git push origin main
```

### 확인 방법:

1. 사이트 방문 후 GA4 실시간 보고서에서 확인
2. Vercel 대시보드에서 Analytics 데이터 확인
3. 브라우저 개발자 도구에서 네트워크 탭으로 요청 확인

## 6. 개인정보 보호 고려사항

### GDPR/개인정보보호법 준수:

- 쿠키 동의 배너 추가 고려
- 개인정보 처리방침 업데이트
- 분석 데이터의 익명화

### 쿠키 배너 추가 예시:

```html
<div id="cookie-banner" class="cookie-banner">
  <p>이 사이트는 사용자 경험 개선을 위해 분석 도구를 사용합니다.</p>
  <button onclick="acceptCookies()">동의</button>
  <button onclick="declineCookies()">거부</button>
</div>
```
