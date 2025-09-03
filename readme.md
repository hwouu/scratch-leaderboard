# Scratch Leaderboard - 스크린골프 대회 라이브 리더보드

\<br\>

「2025 골목대장 토너먼트 1st」 스크린골프 대회의 실시간 순위 및 경기 정보를 제공하는 웹 애플리케이션입니다. Vercel 서버리스 환경에 배포되어 운영됩니다.

## ✨ 주요 기능

  * **실시간 리더보드**: 5분마다 자동으로 업데이트되는 라이브 랭킹을 제공합니다.
  * **다양한 순위 보기**: 합산 순위뿐만 아니라 A, B, C 코스별 순위를 나누어 볼 수 있습니다.
  * **컷오프 뷰**: 예선전 통과가 유력한 상위 32명의 선수를 한눈에 확인할 수 있는 컷오프 보기를 지원합니다.
  * **선수 검색**: 닉네임 또는 아이디로 특정 선수의 상세 기록(코스별 성적, 라운드 수 등)을 조회할 수 있습니다.
  * **대회 정보**: 대회 개요, 일정, 코스 정보 등 주요 정보를 사이드바에서 확인할 수 있습니다.
  * **테마 변경**: 라이트 모드와 다크 모드를 지원하며, 사용자의 선택을 브라우저에 저장합니다.
  * **반응형 디자인**: 데스크탑, 태블릿, 모바일 등 다양한 기기에서 최적화된 화면을 제공합니다.

## 📸 스크린샷

### PC 버전

| 메인 리더보드 (합산) | 컷오프 뷰 |
| :---: | :---: |
| \<img width="1511" alt="PC 메인 화면" src="[https://github.com/user-attachments/assets/8ff2ec45-8583-44c5-aa70-0fea7ecc8c26](https://github.com/user-attachments/assets/8ff2ec45-8583-44c5-aa70-0fea7ecc8c26)" /\> | \<img width="1510" alt="PC 컷오프 뷰" src="[https://github.com/user-attachments/assets/584125d6-fd7d-4fda-80d4-f31eab53dcd8](https://github.com/user-attachments/assets/584125d6-fd7d-4fda-80d4-f31eab53dcd8)" /\> |
| 합산 및 코스별 순위를 제공하는 기본 랜딩 화면입니다. | 본선 진출이 유력한 상위 32명의 선수를 보여주는 화면입니다. |

| 선수 상세 정보 (모달) | 대회 개요 |
| :---: | :---: |
| \<img width="1511" alt="PC 선수 상세 정보" src="[https://github.com/user-attachments/assets/6a7ae46a-4e78-47eb-8c09-196e7a461963](https://github.com/user-attachments/assets/6a7ae46a-4e78-47eb-8c09-196e7a461963)" /\> | \<img width="1511" alt="대회 개요" src="[https://github.com/user-attachments/assets/884741ac-c242-49d9-a0f1-a73704c7dd60](https://github.com/user-attachments/assets/884741ac-c242-49d9-a0f1-a73704c7dd60)" /\> |
| 선수 검색 또는 클릭 시 나타나는 상세 기록입니다. | 대회 방식, 일정, 상금 등 전체 정보를 담은 포스터입니다. |

### 모바일 버전

| 메인 화면 (모바일) | 선수 상세 정보 (모바일) |
| :---: | :---: |
| \<img width="325" alt="모바일 메인 화면" src="[https://github.com/user-attachments/assets/70ffbb16-0d3d-4a8f-b32a-fcc9de045261](https://github.com/user-attachments/assets/70ffbb16-0d3d-4a8f-b32a-fcc9de045261)" /\> | \<img width="319" alt="모바일 선수 상세 정보" src="[https://github.com/user-attachments/assets/f01aa343-6ce1-4414-bded-ebd667172c61](https://github.com/user-attachments/assets/f01aa343-6ce1-4414-bded-ebd667172c61)" /\> |
| 모바일 환경에 최적화된 리더보드 UI입니다. | 모바일에서도 선수의 상세 기록을 쉽게 확인할 수 있습니다. |

## 🛠️ 기술 스택

  * **Backend**: Python, Requests
  * **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
  * **Deployment**: Vercel

## 🏗️ 아키텍처

  * **Backend**: Vercel의 서버리스 함수로 배포되는 단일 Python 스크립트(`api/index.py`)로 구성됩니다. Golfzon의 여러 API 엔드포인트에서 경기 데이터를 병렬로 가져와 하나의 JSON 객체로 통합하여 제공합니다.
  * **Frontend**: 순수 JavaScript로 작성된 SPA(Single Page Application)입니다. 백엔드 API에서 데이터를 받아와 동적으로 리더보드를 렌더링하며, 날짜에 따라 예선전 또는 토너먼트 페이지를 자동으로 보여주는 라우팅 기능이 포함되어 있습니다.
  * **Deployment**: `vercel.json` 파일을 통해 백엔드(Python)와 프론트엔드(Static)의 빌드 및 라우팅 규칙이 정의되어 있습니다.

## 🚀 시작하기

이 프로젝트는 Vercel을 통한 서버리스 배포를 기준으로 설계되었습니다. 로컬 환경에서 테스트하려면 아래 방법을 참고하세요.

### Backend 실행

Vercel CLI를 사용하여 로컬 개발 서버를 시작합니다. 백엔드 API는 `http://localhost:3000/api` 주소로 접근할 수 있습니다.

```bash
vercel dev
```

### Frontend 실행

`frontend/index.html` 파일을 웹 브라우저에서 직접 열어 확인할 수 있습니다. 단, 백엔드로부터 데이터를 정상적으로 가져오려면 `frontend/js/services/api.js` 파일의 `API_ENDPOINT` 변수를 로컬 서버 주소(`http://localhost:3000/api`)로 변경해야 합니다.

## 📁 프로젝트 구조

```
.
├── api/
│   └── index.py         # 백엔드 서버리스 함수
├── frontend/
│   ├── assets/          # 이미지 파일
│   ├── css/             # CSS 스타일시트
│   ├── js/              # JavaScript 파일
│   │   ├── services/    # API 연동 모듈
│   │   ├── views/       # 페이지별 뷰 렌더링 모듈
│   │   ├── app.js       # 전역 이벤트 및 앱 초기화
│   │   └── router.js    # 프론트엔드 라우터
│   └── index.html       # 메인 HTML 파일
├── .gitignore
├── GEMINI.md
├── package.json
├── README.md            # (본 파일)
├── requirements.txt     # Python 의존성
└── vercel.json          # Vercel 배포 설정
```

## 📄 라이선스

이 프로젝트는 ISC 라이선스를 따릅니다.
