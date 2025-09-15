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
  const schedule = {
    qualifying: { endDate: new Date("2025-09-14T23:59:59") },
    32: { endDate: new Date("2025-09-18T23:59:59") },
    16: { endDate: new Date("2025-09-22T23:59:59") },
    8: { endDate: new Date("2025-09-26T23:59:59") },
    4: { endDate: new Date("2025-09-30T23:59:59") },
    final: { endDate: new Date("2025-10-04T23:59:59") },
  };

  for (const stage in schedule) {
    if (now <= schedule[stage].endDate) {
      return `/leaderboard/${stage}`;
    }
  }

  // 모든 대회가 끝났으면 마지막 단계 페이지를 보여줌
  return "/leaderboard/final";
}

/**
 * URL 경로에 따라 적절한 페이지를 렌더링합니다.
 */
export function route() {
  let path = window.location.pathname;

  if (path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  // 루트 경로 접속 시, 날짜에 맞는 페이지로 리디렉션
  if (path === "") {
    path = getPathForCurrentDate();
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
