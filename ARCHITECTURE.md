# Scratch Leaderboard - 아키텍처 문서

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [전체 아키텍처](#전체-아키텍처)
4. [디렉토리 구조](#디렉토리-구조)
5. [주요 컴포넌트](#주요-컴포넌트)
6. [데이터 흐름](#데이터-흐름)
7. [라우팅 시스템](#라우팅-시스템)
8. [API 구조](#api-구조)
9. [스타일링 구조](#스타일링-구조)
10. [배포 구조](#배포-구조)

---

## 프로젝트 개요

**Scratch Leaderboard**는 스크린골프 대회의 실시간 순위 및 경기 정보를 제공하는 웹 애플리케이션입니다. 골프존(Golfzon) API에서 데이터를 가져와 통합하여 사용자에게 제공하는 SPA(Single Page Application)입니다.

### 주요 특징

- **서버리스 아키텍처**: Vercel 서버리스 함수 기반
- **Vanilla JavaScript**: 프레임워크 없이 순수 JavaScript로 구현
- **실시간 업데이트**: 5분마다 자동으로 데이터 갱신
- **다중 토너먼트 지원**: 1st, 2nd, 4th-open 등 여러 대회 지원
- **반응형 디자인**: 모바일, 태블릿, 데스크탑 최적화

---

## 기술 스택

### Backend
- **언어**: Python 3.x
- **주요 라이브러리**:
  - `requests`: HTTP 클라이언트
  - `concurrent.futures`: 병렬 API 호출
- **런타임**: Vercel Serverless Functions (@vercel/python)

### Frontend
- **언어**: JavaScript (ES6+ Modules)
- **프레임워크**: 없음 (Vanilla JS)
- **스타일링**: 순수 CSS
- **아이콘**: Font Awesome 6.4.0
- **분석**: Google Analytics (gtag.js), Vercel Analytics

### 배포 및 인프라
- **호스팅**: Vercel
- **빌드 시스템**: Vercel Build System
- **정적 파일 서빙**: Vercel Static Files

---

## 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Frontend (SPA)                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │ Router   │→ │  Views   │→ │ Services │           │  │
│  │  │          │  │          │  │          │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  │       ↓              ↓              ↓                 │  │
│  │  ┌──────────────────────────────────────┐            │  │
│  │  │         API Service Layer            │            │  │
│  │  └──────────────────────────────────────┘            │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                             │ HTTP Request
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Platform                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Serverless Function (api/index.py)            │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  ThreadPoolExecutor (병렬 처리)               │   │  │
│  │  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐     │   │  │
│  │  │  │ API1 │  │ API2 │  │ API3 │  │ API4 │     │   │  │
│  │  │  └──────┘  └──────┘  └──────┘  └──────┘     │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │              ↓ 통합 및 JSON 응답                      │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                             │ HTTP Request
                             ↓
┌─────────────────────────────────────────────────────────────┐
│              Golfzon Fairway API (External)                 │
│  - Tournament Ranks API (v1/v2)                             │
│  - Course Ranks API                                         │
│  - Bracket API                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 디렉토리 구조

```
scratch-leaderboard/
├── api/                          # 백엔드 서버리스 함수
│   └── index.py                  # 메인 API 핸들러
│
├── frontend/                     # 프론트엔드 애플리케이션
│   ├── assets/                   # 정적 리소스 (이미지 등)
│   │   ├── *.png, *.jpeg        # 대회 이미지
│   │   └── naverfd*.html         # 네이버 검색 등록 파일
│   │
│   ├── css/                      # 스타일시트
│   │   ├── main.css              # 메인 스타일 (v1)
│   │   ├── main-v2.css           # 메인 스타일 (v2)
│   │   ├── leaderboard.css       # 리더보드 스타일 (v1)
│   │   ├── leaderboard-v2.css    # 리더보드 스타일 (v2)
│   │   ├── tournament.css        # 토너먼트 스타일
│   │   ├── components/           # 컴포넌트별 CSS (v1)
│   │   └── components-v2/        # 컴포넌트별 CSS (v2)
│   │
│   ├── js/                       # JavaScript 모듈
│   │   ├── app.js                # 애플리케이션 진입점
│   │   ├── router.js             # 라우팅 시스템
│   │   │
│   │   ├── services/             # 서비스 레이어
│   │   │   └── api.js            # API 통신 모듈
│   │   │
│   │   ├── utils/                # 유틸리티 함수
│   │   │   └── analytics.js      # Google Analytics 통합
│   │   │
│   │   └── views/                # 페이지 뷰 컴포넌트
│   │       ├── leaderboard.js           # 1st 토너먼트 리더보드
│   │       ├── leaderboard-2nd.js       # 2nd 토너먼트 리더보드
│   │       ├── leaderboard-4th-open.js  # 4th-open 리더보드 (v1)
│   │       ├── leaderboard-4th-open-v2.js # 4th-open 리더보드 (v2)
│   │       └── tournament.js            # 토너먼트 대진표
│   │
│   ├── index.html                # 메인 HTML 파일
│   ├── robots.txt                # 검색 엔진 크롤러 설정
│   └── sitemap.xml               # 사이트맵
│
├── .gitignore                    # Git 제외 파일 목록
├── package.json                  # Node.js 프로젝트 설정
├── requirements.txt              # Python 의존성
├── vercel.json                   # Vercel 배포 설정
├── readme.md                     # 프로젝트 README
├── ARCHITECTURE.md               # 본 문서
├── ANALYTICS_SETUP.md            # 분석 도구 설정 가이드
├── SEO_GUIDE.md                  # SEO 가이드
└── GEMINI.md                     # 기타 문서
```

---

## 주요 컴포넌트

### 1. Backend (`api/index.py`)

#### 역할
- Golfzon API에서 여러 엔드포인트를 병렬로 호출
- 데이터를 통합하여 JSON 형식으로 반환
- 서버리스 함수로 Vercel에 배포

#### 주요 기능
- **병렬 API 호출**: `ThreadPoolExecutor`를 사용하여 여러 API를 동시에 호출
- **에러 처리**: 타임아웃, 네트워크 에러, JSON 파싱 에러 처리
- **다중 토너먼트 지원**: 1st, 2nd, 4th-open 등 다양한 대회 단계 지원
- **API 버전 호환**: v1과 v2 API 모두 지원

#### API 엔드포인트 구조
```python
API_URLS = {
    "qualifying": {
        "total": "...",
        "courseA": "...",
        "courseB": "...",
        "courseC": "..."
    },
    "32": {
        "brackets": "...",
        "total": "...",
        "courseA": "...",
        "courseB": "..."
    },
    # ... 기타 스테이지
}
```

### 2. Frontend Router (`frontend/js/router.js`)

#### 역할
- URL 경로에 따라 적절한 페이지 뷰 렌더링
- 날짜 기반 자동 라우팅 (진행 중인 대회 단계 자동 감지)
- SEO 메타 태그 동적 업데이트

#### 주요 기능
- **라우트 매핑**: 경로와 렌더링 함수 매핑
- **날짜 기반 라우팅**: 현재 날짜에 따라 적절한 대회 단계로 리디렉션
- **SEO 최적화**: 경로별 메타 태그, Open Graph 태그 동적 업데이트
- **히스토리 관리**: 브라우저 뒤로가기/앞으로가기 지원

#### 라우트 예시
```javascript
const routes = {
  "/leaderboard/qualifying": (app) => renderLeaderboardPage("qualifying", app),
  "/leaderboard-2nd/qualifying": (app) => renderLeaderboard2ndPage("2nd-qualifying", app),
  "/4th-open": (app) => renderLeaderboard4thOpenPage("4th-open", app),
  "/v2/4th-open": (app) => renderLeaderboard4thOpenPageV2("4th-open", app),
  // ...
};
```

### 3. API Service (`frontend/js/services/api.js`)

#### 역할
- 백엔드 API와의 통신 담당
- 데이터 캐싱 (2분 캐시)
- 플레이어 데이터 통합 처리

#### 주요 기능
- **데이터 페칭**: `fetchLeaderboardData(stage)` - 특정 스테이지 데이터 가져오기
- **캐싱**: 2분간 캐시하여 불필요한 API 호출 방지
- **데이터 통합**: 여러 코스의 데이터를 하나의 플레이어 객체로 통합
- **에러 처리**: API 에러 시 적절한 에러 메시지 반환

#### 데이터 구조
```javascript
{
  total: [...],      // 합산 순위
  courseA: [...],    // A 코스 순위
  courseB: [...],    // B 코스 순위
  courseC: [...],    // C 코스 순위 (예선전만)
  brackets: {...}    // 대진표 (본선부터)
}
```

### 4. View Components (`frontend/js/views/`)

#### 역할
- 각 페이지의 UI 렌더링
- 사용자 인터랙션 처리
- 실시간 데이터 업데이트

#### 주요 뷰 컴포넌트

1. **leaderboard.js**: 1st 토너먼트 리더보드
   - 합산 순위, 코스별 순위 표시
   - 컷오프 뷰 (상위 32명)
   - 선수 검색 및 상세 정보 모달

2. **leaderboard-2nd.js**: 2nd 토너먼트 리더보드
   - 1st와 유사한 구조이지만 다른 API 엔드포인트 사용

3. **leaderboard-4th-open.js**: 4th-open 스트로크 대회 (v1)
   - 스트로크 대회 전용 UI
   - v1 API 사용

4. **leaderboard-4th-open-v2.js**: 4th-open 스트로크 대회 (v2)
   - 개선된 UI/UX
   - v1 API 사용 (동일)

5. **tournament.js**: 토너먼트 대진표
   - 브래킷 형식의 대진표 표시

### 5. App Initialization (`frontend/js/app.js`)

#### 역할
- 애플리케이션 초기화
- 전역 이벤트 리스너 설정
- 테마 관리

#### 주요 기능
- **전역 리스너**: 테마 토글 버튼 등 전역 UI 요소 이벤트 처리
- **테마 관리**: 라이트/다크 모드 전환 및 localStorage 저장
- **라우터 초기화**: DOM 로드 후 라우터 실행

---

## 데이터 흐름

### 1. 초기 페이지 로드

```
1. 사용자가 브라우저에서 페이지 접속
   ↓
2. index.html 로드
   ↓
3. app.js 실행 (DOMContentLoaded)
   ↓
4. router.js의 route() 함수 실행
   ↓
5. 현재 URL 경로 확인
   ↓
6. 날짜 기반 자동 라우팅 (루트 경로인 경우)
   ↓
7. 해당 뷰 컴포넌트 렌더링 함수 호출
   ↓
8. 뷰 컴포넌트에서 api.js의 fetchLeaderboardData() 호출
   ↓
9. 백엔드 API 호출 (/api?stage=...)
   ↓
10. 서버리스 함수에서 Golfzon API 병렬 호출
   ↓
11. 데이터 통합 및 JSON 응답
   ↓
12. 프론트엔드에서 데이터 처리 및 UI 렌더링
```

### 2. 자동 새로고침

```
1. setInterval로 5분마다 실행
   ↓
2. fetchLeaderboardData() 호출 (forceRefresh=false)
   ↓
3. 캐시 확인 (2분 이내면 캐시 사용)
   ↓
4. 새 데이터 가져오기
   ↓
5. 이전 데이터와 비교
   ↓
6. 변경된 부분만 UI 업데이트 (애니메이션 효과)
```

### 3. 사용자 인터랙션

```
사용자 액션 (검색, 필터, 정렬 등)
   ↓
이벤트 핸들러 실행
   ↓
데이터 필터링/정렬 (클라이언트 사이드)
   ↓
UI 업데이트
```

---

## 라우팅 시스템

### 라우트 구조

```
/                           → 날짜 기반 자동 리디렉션
/leaderboard/qualifying     → 1st 토너먼트 예선
/leaderboard/32             → 1st 토너먼트 32강
/leaderboard/16             → 1st 토너먼트 16강
/leaderboard/8              → 1st 토너먼트 8강
/leaderboard/4              → 1st 토너먼트 4강
/leaderboard/final          → 1st 토너먼트 결승
/leaderboard-2nd/qualifying → 2nd 토너먼트 예선
/leaderboard-2nd/64         → 2nd 토너먼트 64강
/leaderboard-2nd/32         → 2nd 토너먼트 32강
/leaderboard-2nd/16         → 2nd 토너먼트 16강
/leaderboard-2nd/8          → 2nd 토너먼트 8강
/leaderboard-2nd/4          → 2nd 토너먼트 4강
/leaderboard-2nd/final      → 2nd 토너먼트 결승 (특정 기간에는 /4th-open으로 리디렉션)
/4th-open                   → 4th-open 스트로크 대회 (v1 UI)
/v2/4th-open                → 4th-open 스트로크 대회 (v2 UI)
```

### 날짜 기반 자동 라우팅

`router.js`의 `getPathForCurrentDate()` 함수가 현재 날짜를 확인하여:
- 진행 중인 대회 단계로 자동 리디렉션
- 대회가 없으면 다음 예정된 단계 표시
- 모든 대회가 끝나면 마지막 단계 표시

### SEO 최적화

각 라우트마다:
- 동적 메타 태그 업데이트
- Open Graph 태그 설정
- Twitter Card 태그 설정
- Canonical URL 설정

---

## API 구조

### 백엔드 API 엔드포인트

```
GET /api?stage={stage}
```

#### 파라미터
- `stage`: 대회 단계 (예: "qualifying", "32", "2nd-qualifying", "4th-open")

#### 응답 형식

**v2 API 응답 (1st, 2nd 토너먼트)**:
```json
{
  "total": [
    {
      "userId": "...",
      "rank": 1,
      "score": 280,
      "totalScore": 280,
      "roundCount": 4,
      "isTieRank": false,
      "revisionGrade": "..."
    }
  ],
  "courseA": [...],
  "courseB": [...],
  "courseC": [...],  // 예선전만
  "brackets": {...}   // 본선부터
}
```

**v1 API 응답 (4th-open)**:
```json
{
  "total": [
    {
      "userId": "...",
      "rank": 1,
      "score": 280,
      // ...
    }
  ],
  "courseA": [...],
  "courseB": [...],
  "courseC": [...]
}
```

### 에러 처리

- 타임아웃: 15초
- 에러 발생 시 해당 키에 `null` 또는 에러 객체 반환
- 부분 실패 허용 (일부 데이터만 있어도 응답)

---

## 스타일링 구조

### CSS 파일 구조

1. **main.css / main-v2.css**: 전역 스타일, 레이아웃, 테마
2. **leaderboard.css / leaderboard-v2.css**: 리더보드 전용 스타일
3. **tournament.css**: 토너먼트 대진표 스타일
4. **components/**: 컴포넌트별 CSS 모듈

### 테마 시스템

- **다크 모드**: 기본 테마
- **라이트 모드**: 사용자 선택 시 활성화
- **localStorage**: 테마 설정 저장
- **CSS 변수**: 테마 색상 관리

### 반응형 디자인

- **모바일**: 768px 이하
- **태블릿**: 768px ~ 1024px
- **데스크탑**: 1024px 이상

---

## 배포 구조

### Vercel 설정 (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    },
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    // API 라우트
    { "src": "/api/(.*)", "dest": "/api/index.py" },
    // 정적 파일 라우트
    { "src": "/js/(.*)", "dest": "/frontend/js/$1" },
    { "src": "/css/(.*)", "dest": "/frontend/css/$1" },
    { "src": "/assets/(.*)", "dest": "/frontend/assets/$1" },
    // SPA 폴백
    { "src": "/(.*)", "dest": "/frontend/index.html" }
  ]
}
```

### 배포 프로세스

1. Git 푸시
2. Vercel 자동 빌드
3. Python 의존성 설치 (`requirements.txt`)
4. 서버리스 함수 빌드
5. 정적 파일 배포
6. 라우팅 규칙 적용

### 환경 변수

- 환경 변수는 Vercel 대시보드에서 설정
- `env.example` 파일 참고

---

## 주요 설계 결정사항

### 1. Vanilla JavaScript 선택 이유
- **경량화**: 프레임워크 없이 빠른 로딩
- **단순성**: 작은 프로젝트에 적합
- **제어**: 완전한 제어 가능

### 2. 서버리스 아키텍처
- **확장성**: 자동 스케일링
- **비용**: 사용량 기반 과금
- **유지보수**: 서버 관리 불필요

### 3. 병렬 API 호출
- **성능**: 여러 API를 동시에 호출하여 응답 시간 단축
- **ThreadPoolExecutor**: Python의 동시성 활용

### 4. 클라이언트 사이드 캐싱
- **API 호출 감소**: 2분 캐시로 서버 부하 감소
- **사용자 경험**: 빠른 응답 시간

### 5. 날짜 기반 라우팅
- **사용자 편의성**: 자동으로 올바른 페이지 표시
- **SEO**: 적절한 콘텐츠 노출

---

## 성능 최적화

### 프론트엔드
- **모듈 번들링**: ES6 모듈 사용
- **이미지 최적화**: 적절한 형식 및 크기
- **폰트 최적화**: Google Fonts preconnect
- **캐싱**: API 응답 캐싱

### 백엔드
- **병렬 처리**: 여러 API 동시 호출
- **타임아웃**: 15초 타임아웃 설정
- **에러 처리**: 부분 실패 허용

---

## 보안 고려사항

1. **CORS**: API 응답에 `Access-Control-Allow-Origin: *` 설정
2. **입력 검증**: 스테이지 파라미터 검증
3. **에러 메시지**: 민감한 정보 노출 방지
4. **HTTPS**: Vercel 기본 HTTPS 사용

---

## 향후 개선 가능 사항

1. **상태 관리**: 전역 상태 관리 라이브러리 도입 고려
2. **타입 안정성**: TypeScript 도입 검토
3. **테스트**: 단위 테스트 및 통합 테스트 추가
4. **PWA**: Progressive Web App 기능 추가
5. **오프라인 지원**: Service Worker 구현
6. **성능 모니터링**: 더 상세한 성능 메트릭 수집

---

## 참고 문서

- [README.md](./readme.md) - 프로젝트 개요 및 시작 가이드
- [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md) - 분석 도구 설정
- [SEO_GUIDE.md](./SEO_GUIDE.md) - SEO 최적화 가이드

---

**문서 작성일**: 2025년
**최종 업데이트**: 프로젝트 구조 분석 기준

