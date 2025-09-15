import { renderLeaderboardPage } from "./views/leaderboard.js";

// 라우트 설정: 모든 경로가 leaderboard.js를 사용하도록 통합
const routes = {
  "/leaderboard/qualifying": (app) => renderLeaderboardPage("qualifying", app),
  "/leaderboard/32": (app) => renderLeaderboardPage("32", app),
  "/leaderboard/16": (app) => renderLeaderboardPage("16", app),
  "/leaderboard/8": (app) => renderLeaderboardPage("8", app),
  "/leaderboard/4": (app) => renderLeaderboardPage("4", app),
  "/leaderboard/final": (app) => renderLeaderboardPage("final", app),
};

/**
 * 현재 날짜에 맞는 페이지 경로를 결정합니다.
 * @returns {string} 현재 대회 단계에 맞는 경로
 */
function getPathForCurrentDate() {
  const now = new Date();

  // 각 스테이지의 시작일과 종료일을 명확하게 정의
  const schedule = {
    qualifying: {
      start: new Date("2025-09-01T00:00:00"),
      end: new Date("2025-09-14T23:59:59"),
    },
    32: {
      start: new Date("2025-09-15T00:00:00"),
      end: new Date("2025-09-18T23:59:59"),
    },
    16: {
      start: new Date("2025-09-19T00:00:00"),
      end: new Date("2025-09-22T23:59:59"),
    },
    8: {
      start: new Date("2025-09-23T00:00:00"),
      end: new Date("2025-09-26T23:59:59"),
    },
    4: {
      start: new Date("2025-09-27T00:00:00"),
      end: new Date("2025-09-30T23:59:59"),
    },
    final: {
      start: new Date("2025-10-01T00:00:00"),
      end: new Date("2025-10-04T23:59:59"),
    },
  };

  // 객체 키 순서에 의존하지 않도록 명시적인 순서 배열 사용
  const scheduleOrder = ["qualifying", "32", "16", "8", "4", "final"];

  // 현재 날짜가 어떤 스테이지의 기간에 포함되는지 확인
  for (const stage of scheduleOrder) {
    const event = schedule[stage];
    if (now >= event.start && now <= event.end) {
      return `/leaderboard/${stage}`;
    }
  }

  // 진행 중인 대회가 없을 경우
  const firstEventStart = schedule.qualifying.start;
  const lastEventEnd = schedule.final.end;

  if (now < firstEventStart) {
    return "/leaderboard/qualifying"; // 대회가 시작하기 전이면 예선 페이지
  } else if (now > lastEventEnd) {
    return "/leaderboard/final"; // 대회가 모두 끝났으면 결승 페이지
  }

  // 스테이지 사이의 공백 기간일 경우, 다가올 스테이지 페이지를 보여줌
  for (const stage of scheduleOrder) {
    if (now < schedule[stage].start) {
      return `/leaderboard/${stage}`;
    }
  }

  // 모든 조건에 해당하지 않을 경우의 기본값
  return "/leaderboard/qualifying";
}

/**
 * URL 경로에 따라 적절한 페이지를 렌더링합니다.
 */
export function route() {
  let path = window.location.pathname;

  // URL 끝에 붙는 슬래시 제거
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  // 루트 경로("/") 접속 시, 날짜에 맞는 페이지로 리디렉션
  if (path === "" || path === "/") {
    path = getPathForCurrentDate();
    // history.pushState() 대신 replaceState()를 사용하여 불필요한 히스토리 생성을 방지
    window.history.replaceState({}, "", path);
  }

  const renderFunc = routes[path];
  const app = document.getElementById("app");

  if (renderFunc && app) {
    app.innerHTML = ""; // 페이지 전환 시 이전 내용 삭제
    renderFunc(app);
  } else if (app) {
    // 404 페이지 처리
    app.innerHTML = "<h1>404 Not Found</h1><p>페이지를 찾을 수 없습니다.</p>";
  }
}

// 브라우저 뒤로가기/앞으로가기 이벤트 처리
window.addEventListener("popstate", route);
