import { renderQualifyingPage } from "./views/qualifying.js";
import { renderTournamentPage } from "./views/tournament.js";

// 대회 일정 정의
const TOURNAMENT_SCHEDULE = {
  qualifying: { start: "2025-09-01", end: "2025-09-14", path: "/qualifying" },
  round32: { start: "2025-09-15", end: "2025-09-18", path: "/32" },
  round16: { start: "2025-09-19", end: "2025-09-22", path: "/16" },
  quarterfinals: {
    start: "2025-09-23",
    end: "2025-09-26",
    path: "/quarterfinals",
  },
  semifinals: { start: "2025-09-27", end: "2025-09-30", path: "/semifinals" },
  final: { start: "2025-10-01", end: "2025-10-04", path: "/final" },
  thirdplace: { start: "2025-10-01", end: "2025-10-04", path: "/thirdplace" },
};

// URL 경로와 렌더링 함수를 매핑
const routes = {
  "/": renderQualifyingPage,
  "/qualifying": renderQualifyingPage,
  "/32": () => renderTournamentPage("32강"),
  "/16": () => renderTournamentPage("16강"),
  "/quarterfinals": () => renderTournamentPage("8강"),
  "/semifinals": () => renderTournamentPage("4강"),
  "/final": () => renderTournamentPage("결승"),
  "/thirdplace": () => renderTournamentPage("3-4위전"),
};

const app = document.getElementById("app");

/**
 * 현재 날짜에 맞는 대회 페이지 경로를 찾아 반환합니다.
 * @returns {string} 현재 진행 중인 대회의 경로
 */
function getPathForCurrentDate() {
  const now = new Date();
  // const now = new Date("2025-09-16T00:00:00"); // 테스트용 날짜
  now.setHours(0, 0, 0, 0);

  for (const key in TOURNAMENT_SCHEDULE) {
    const event = TOURNAMENT_SCHEDULE[key];
    const startDate = new Date(event.start + "T00:00:00");
    const endDate = new Date(event.end + "T23:59:59");
    if (now >= startDate && now <= endDate) {
      return event.path;
    }
  }
  // 진행 중인 대회가 없으면 예선 페이지를 기본값으로
  return "/qualifying";
}

/**
 * URL 경로에 따라 적절한 페이지를 렌더링합니다.
 */
export function route() {
  const path = window.location.pathname;

  // 만약 사용자가 메인 페이지('/')로 접속했다면,
  // 날짜에 맞는 페이지로 자동으로 리디렉션합니다.
  if (path === "/") {
    const currentPath = getPathForCurrentDate();
    // 브라우저 주소창의 URL을 변경하고, route 함수를 다시 호출
    window.history.pushState({}, "", currentPath);
    route();
    return;
  }

  // 해당 경로에 맞는 렌더링 함수를 찾습니다.
  const render =
    routes[path] ||
    (() => {
      app.innerHTML = `<h1>404 Not Found</h1><p>페이지를 찾을 수 없습니다.</p>`;
    });

  // 페이지 내용을 비우고 새로운 페이지를 렌더링
  app.innerHTML = "";
  render(app);
}

// 브라우저의 뒤로가기/앞으로가기 버튼을 처리
window.addEventListener("popstate", route);

// 페이지가 처음 로드될 때 라우팅 실행
document.addEventListener("DOMContentLoaded", route);
