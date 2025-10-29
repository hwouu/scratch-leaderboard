import { renderLeaderboardPage } from "./views/leaderboard.js";
import { renderLeaderboard2ndPage } from "./views/leaderboard-2nd.js";
import { trackPageView, AnalyticsEvents } from "./utils/analytics.js";

// 라우트 설정: 1st와 2nd 토너먼트 모두 지원
const routes = {
  // 1st 토너먼트 (기존)
  "/leaderboard/qualifying": (app) => renderLeaderboardPage("qualifying", app),
  "/leaderboard/32": (app) => renderLeaderboardPage("32", app),
  "/leaderboard/16": (app) => renderLeaderboardPage("16", app),
  "/leaderboard/8": (app) => renderLeaderboardPage("8", app),
  "/leaderboard/4": (app) => renderLeaderboardPage("4", app),
  "/leaderboard/final": (app) => renderLeaderboardPage("final", app),

  // 2nd 토너먼트 (새로 추가)
  "/leaderboard-2nd/qualifying": (app) =>
    renderLeaderboard2ndPage("2nd-qualifying", app),
  "/leaderboard-2nd/64": (app) => renderLeaderboard2ndPage("2nd-64", app),
  "/leaderboard-2nd/32": (app) => renderLeaderboard2ndPage("2nd-32", app),
  "/leaderboard-2nd/16": (app) => renderLeaderboard2ndPage("2nd-16", app),
  "/leaderboard-2nd/8": (app) => renderLeaderboard2ndPage("2nd-8", app),
  "/leaderboard-2nd/4": (app) => renderLeaderboard2ndPage("2nd-4", app),
  "/leaderboard-2nd/final": (app) => renderLeaderboard2ndPage("2nd-final", app),
};

function ensureMetaTag(nameOrProperty, key, value) {
  let selector =
    nameOrProperty === "name"
      ? `meta[name="${key}"]`
      : `meta[property="${key}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(nameOrProperty, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function ensureLinkTag(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function getSeoForPath(path) {
  const baseTitle = "스크래치 리더보드 | 골프존 리더보드 LIVE";
  const baseDesc =
    "스크래치/골프존 리더보드 실시간 순위. 골목대장 토너먼트 예선·본선·결승 정보를 제공합니다.";
  const baseKeywords =
    "스크래치 리더보드, 스크래치 골목대장, 골프존 리더보드, 화전스크래치, 스크린골프 리더보드, 골프 토너먼트, 실시간 순위, 골목대장 토너먼트";

  const stageLabel = (stage) =>
    ({
      qualifying: "예선",
      64: "64강",
      32: "32강",
      16: "16강",
      8: "8강",
      4: "4강",
      final: "결승전",
    }[stage] || "리더보드");

  if (path.startsWith("/leaderboard-2nd/")) {
    const stage = path.split("/").pop();
    const label = stageLabel(stage);
    return {
      title: `골목대장 토너먼트 2nd ${label} | 스크래치 리더보드`,
      desc: `골목대장 토너먼트 2nd ${label} 실시간 순위와 대진표를 확인하세요.`,
      keywords: baseKeywords,
    };
  }
  if (path.startsWith("/leaderboard/")) {
    const stage = path.split("/").pop();
    const label = stageLabel(stage);
    return {
      title: `골목대장 토너먼트 1st ${label} | 스크래치 리더보드`,
      desc: `골목대장 토너먼트 1st ${label} 실시간 순위와 선수 기록을 확인하세요.`,
      keywords: baseKeywords,
    };
  }
  return { title: baseTitle, desc: baseDesc, keywords: baseKeywords };
}

function updateSeoForPath(path) {
  const { title, desc, keywords } = getSeoForPath(path);
  document.title = title;
  ensureMetaTag("name", "description", desc);
  ensureMetaTag("name", "keywords", keywords);
  ensureMetaTag("property", "og:title", title);
  ensureMetaTag("property", "og:description", desc);
  ensureMetaTag("property", "og:url", `${location.origin}${path}`);
  ensureMetaTag("name", "twitter:title", title);
  ensureMetaTag("name", "twitter:description", desc);
  ensureLinkTag("canonical", `${location.origin}${path}`);
}

/**
 * 현재 날짜에 맞는 페이지 경로를 결정합니다.
 * @returns {string} 현재 대회 단계에 맞는 경로
 */
function getPathForCurrentDate() {
  const now = new Date();

  // 1st 토너먼트 스케줄
  const schedule1st = {
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

  // 2nd 토너먼트 스케줄
  const schedule2nd = {
    qualifying: {
      start: new Date("2025-10-24T00:00:00"),
      end: new Date("2025-11-09T23:59:59"),
    },
    64: {
      start: new Date("2025-11-10T00:00:00"),
      end: new Date("2025-11-16T23:59:59"),
    },
    32: {
      start: new Date("2025-11-17T00:00:00"),
      end: new Date("2025-11-23T23:59:59"),
    },
    16: {
      start: new Date("2025-11-24T00:00:00"),
      end: new Date("2025-11-27T23:59:59"),
    },
    8: {
      start: new Date("2025-11-28T00:00:00"),
      end: new Date("2025-12-01T23:59:59"),
    },
    4: {
      start: new Date("2025-12-02T00:00:00"),
      end: new Date("2025-12-04T23:59:59"),
    },
    final: {
      start: new Date("2025-12-05T00:00:00"),
      end: new Date("2025-12-07T23:59:59"),
    },
  };

  // 2nd 토너먼트 기간 체크 (최신 대회 우선)
  const schedule2ndOrder = ["qualifying", "64", "32", "16", "8", "4", "final"];
  for (const stage of schedule2ndOrder) {
    const event = schedule2nd[stage];
    if (now >= event.start && now <= event.end) {
      return `/leaderboard-2nd/${stage}`;
    }
  }

  // 1st 토너먼트 기간 체크
  const schedule1stOrder = ["qualifying", "32", "16", "8", "4", "final"];
  for (const stage of schedule1stOrder) {
    const event = schedule1st[stage];
    if (now >= event.start && now <= event.end) {
      return `/leaderboard/${stage}`;
    }
  }

  // 진행 중인 대회가 없을 경우
  const firstEventStart = schedule1st.qualifying.start;
  const lastEventEnd = schedule2nd.final.end;

  if (now < firstEventStart) {
    return "/leaderboard/qualifying"; // 1st 대회가 시작하기 전이면 1st 예선 페이지
  } else if (now > lastEventEnd) {
    return "/leaderboard-2nd/final"; // 모든 대회가 끝났으면 2nd 결승 페이지
  }

  // 스테이지 사이의 공백 기간일 경우, 다가올 스테이지 페이지를 보여줌
  // 2nd 토너먼트 우선 체크
  for (const stage of schedule2ndOrder) {
    if (now < schedule2nd[stage].start) {
      return `/leaderboard-2nd/${stage}`;
    }
  }

  // 1st 토너먼트 체크
  for (const stage of schedule1stOrder) {
    if (now < schedule1st[stage].start) {
      return `/leaderboard/${stage}`;
    }
  }

  // 모든 조건에 해당하지 않을 경우의 기본값: 2nd 토너먼트 예선 (현재 진행 중)
  return "/leaderboard-2nd/qualifying";
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

    // SEO 메타 업데이트
    updateSeoForPath(path);

    // 페이지 뷰 추적
    trackPageView(path, document.title);

    // 리더보드 페이지 뷰 이벤트 추적
    if (path.includes("/leaderboard")) {
      const tournament = path.includes("2nd") ? "2nd" : "1st";
      const stage = path.split("/").pop();
      trackPageView(path, `${tournament} 토너먼트 ${stage} 단계`);
    }
  } else if (app) {
    // 404 페이지 처리
    app.innerHTML = "<h1>404 Not Found</h1><p>페이지를 찾을 수 없습니다.</p>";
    updateSeoForPath(path);
    trackPageView(path, "404 Not Found");
  }
}

// 브라우저 뒤로가기/앞으로가기 이벤트 처리
window.addEventListener("popstate", route);
