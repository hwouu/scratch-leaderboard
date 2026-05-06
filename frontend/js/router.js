import { renderLeaderboardPage } from "./views/leaderboard.js";
import { renderLeaderboard2ndPage } from "./views/leaderboard-2nd.js";
import { renderLeaderboard4thOpenPage } from "./views/leaderboard-4th-open.js";
import { renderLeaderboard4thOpenPageV2 } from "./views/leaderboard-4th-open-v2.js";
import { trackPageView, AnalyticsEvents } from "./utils/analytics.js";
import { renderPrizePage } from "./views/prize.js";
import { renderLeaderboard2026_1st } from "./views/leaderboard-2026-1st.js";
import { renderLeaderboard2026_1st_courses } from "./views/leaderboard-2026-1st-courses.js";
import { renderLeaderboard2026_1st_tournament } from "./views/leaderboard-2026-1st-tournament.js";
import { renderBracket2026_1st } from "./views/bracket-2026-1st.js";

const routes = {
  "/leaderboard/qualifying": (app) => renderLeaderboardPage("qualifying", app),
  "/leaderboard/32": (app) => renderLeaderboardPage("32", app),
  "/leaderboard/16": (app) => renderLeaderboardPage("16", app),
  "/leaderboard/8": (app) => renderLeaderboardPage("8", app),
  "/leaderboard/4": (app) => renderLeaderboardPage("4", app),
  "/leaderboard/final": (app) => renderLeaderboardPage("final", app),

  "/leaderboard-2nd/qualifying": (app) =>
    renderLeaderboard2ndPage("2nd-qualifying", app),
  "/leaderboard-2nd/64": (app) => renderLeaderboard2ndPage("2nd-64", app),
  "/leaderboard-2nd/32": (app) => renderLeaderboard2ndPage("2nd-32", app),
  "/leaderboard-2nd/16": (app) => renderLeaderboard2ndPage("2nd-16", app),
  "/leaderboard-2nd/8": (app) => renderLeaderboard2ndPage("2nd-8", app),
  "/leaderboard-2nd/4": (app) => renderLeaderboard2ndPage("2nd-4", app),
  "/leaderboard-2nd/final": (app) => {
    const now = new Date();
    const startDate = new Date("2025-12-15T00:00:00+09:00");
    const endDate = new Date("2026-01-09T23:59:59+09:00");
    if (now >= startDate && now <= endDate) {
      window.history.replaceState({}, "", "/4th-open");
      renderLeaderboard4thOpenPage("4th-open", app);
    } else {
      renderLeaderboard2ndPage("2nd-final", app);
    }
  },

  "/4th-open": (app) => renderLeaderboard4thOpenPage("4th-open", app),
  "/v2/4th-open": (app) => renderLeaderboard4thOpenPageV2("4th-open", app),

  "/2026-1st/qualifying": (app) =>
    renderLeaderboard2026_1st("2026-1st-qualifying", app),
  "/2026-1st/courses": (app) =>
    renderLeaderboard2026_1st_courses("2026-1st-qualifying", app),

  "/2026-1st/16": (app) =>
    renderLeaderboard2026_1st_tournament("2026-1st-16", app),
  "/2026-1st/8": (app) =>
    renderLeaderboard2026_1st_tournament("2026-1st-8", app),
  "/2026-1st/4": (app) =>
    renderLeaderboard2026_1st_tournament("2026-1st-4", app),
  "/2026-1st/final": (app) =>
    renderLeaderboard2026_1st_tournament("2026-1st-final", app),

  "/2026-1st/bracket": (app) => renderBracket2026_1st("2026-1st-bracket", app),

  "/prize": (app) => renderPrizePage("2026-1st-qualifying", app),
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
  const baseTitle = "2026 Scratch 1st OPEN | 스크래치 리더보드 LIVE";
  const baseDesc =
    "2026 Scratch 1st OPEN 골목대장 토너먼트 실시간 리더보드 및 홀인원 상금 현황을 확인하세요.";
  const baseKeywords =
    "스크래치 리더보드, 2026 Scratch 1st OPEN, 화전스크래치, 골프존 실시간 리더보드, 홀인원 대회, 실시간 순위";

  const stageLabel = (stage) =>
    ({
      qualifying: "예선",
      64: "64강",
      32: "32강",
      16: "16강",
      8: "8강",
      4: "4강",
      final: "결승전",
    })[stage] || "리더보드";

  if (path === "/prize")
    return {
      title: `누적 상금 라이브 | 2026 Scratch 1st OPEN`,
      desc: `2026 Scratch 1st OPEN 대회 홀인원 누적 상금을 실시간으로 확인하세요.`,
      keywords: baseKeywords,
    };
  if (path === "/2026-1st/courses")
    return {
      title: `코스별 랭킹 | 2026 Scratch 1st OPEN`,
      desc: `2026 Scratch 1st OPEN 각 코스별 실시간 순위를 확인하세요.`,
      keywords: baseKeywords,
    };
  if (path === "/2026-1st/bracket")
    return {
      title: `본선 대진표 | 2026 Scratch 1st OPEN`,
      desc: `2026 Scratch 1st OPEN 본선 대진표와 홀인원 상금을 확인하세요.`,
      keywords: baseKeywords,
    };
  if (path.startsWith("/2026-1st/")) {
    const stage = path.split("/").pop();
    return {
      title: `2026 Scratch 1st OPEN ${stageLabel(stage)} | 스크래치 리더보드`,
      desc: `2026 Scratch 1st OPEN ${stageLabel(stage)} 실시간 순위와 대진표를 확인하세요.`,
      keywords: baseKeywords,
    };
  }
  if (path === "/4th-open")
    return {
      title: `스크래치 선물 팡팡 | 스크래치 리더보드`,
      desc: `스크래치 선물 팡팡 스트로크 대회 실시간 순위를 확인하세요.`,
      keywords: baseKeywords,
    };
  if (path === "/v2/4th-open")
    return {
      title: `스크래치 선물 팡팡 | 스크래치 리더보드 V2`,
      desc: `스크래치 선물 팡팡 스트로크 대회 실시간 순위를 확인하세요.`,
      keywords: baseKeywords,
    };
  if (path.startsWith("/leaderboard-2nd/"))
    return {
      title: `골목대장 토너먼트 2nd ${stageLabel(path.split("/").pop())} | 스크래치 리더보드`,
      desc: `골목대장 토너먼트 2nd 실시간 순위와 대진표를 확인하세요.`,
      keywords: baseKeywords,
    };
  if (path.startsWith("/leaderboard/"))
    return {
      title: `골목대장 토너먼트 1st ${stageLabel(path.split("/").pop())} | 스크래치 리더보드`,
      desc: `골목대장 토너먼트 1st 실시간 순위와 선수 기록을 확인하세요.`,
      keywords: baseKeywords,
    };

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

function getPathForCurrentDate() {
  const now = new Date();

  // 한국 시간(KST) 기준으로 아침 6시에 다음 라운드로 넘어가도록 시간 조정 (+09:00 적용)
  const schedule2026_1st = {
    qualifying: {
      start: new Date("2026-03-31T00:00:00+09:00"),
      end: new Date("2026-04-28T05:59:59+09:00"),
    },
    16: {
      start: new Date("2026-04-28T06:00:00+09:00"),
      end: new Date("2026-05-02T05:59:59+09:00"),
    },
    8: {
      start: new Date("2026-05-02T06:00:00+09:00"),
      end: new Date("2026-05-06T05:59:59+09:00"),
    },
    4: {
      start: new Date("2026-05-06T06:00:00+09:00"),
      end: new Date("2026-05-10T05:59:59+09:00"),
    },
    final: {
      start: new Date("2026-05-10T06:00:00+09:00"),
      end: new Date("2026-05-13T23:59:59+09:00"),
    },
  };

  const schedule2nd = {
    qualifying: {
      start: new Date("2025-10-24T00:00:00+09:00"),
      end: new Date("2025-11-09T23:59:59+09:00"),
    },
    64: {
      start: new Date("2025-11-10T00:00:00+09:00"),
      end: new Date("2025-11-16T23:59:59+09:00"),
    },
    32: {
      start: new Date("2025-11-17T00:00:00+09:00"),
      end: new Date("2025-11-23T23:59:59+09:00"),
    },
    16: {
      start: new Date("2025-11-24T00:00:00+09:00"),
      end: new Date("2025-11-27T23:59:59+09:00"),
    },
    8: {
      start: new Date("2025-11-28T00:00:00+09:00"),
      end: new Date("2025-12-01T23:59:59+09:00"),
    },
    4: {
      start: new Date("2025-12-02T00:00:00+09:00"),
      end: new Date("2025-12-04T23:59:59+09:00"),
    },
    final: {
      start: new Date("2025-12-05T00:00:00+09:00"),
      end: new Date("2025-12-07T23:59:59+09:00"),
    },
  };

  const schedule2026Order = [
    "qualifying",
    "16",
    "8",
    "4",
    "final",
  ];
  for (const stage of schedule2026Order) {
    if (
      now >= schedule2026_1st[stage].start &&
      now <= schedule2026_1st[stage].end
    )
      return `/2026-1st/${stage}`;
  }

  const schedule2ndOrder = ["qualifying", "64", "32", "16", "8", "4", "final"];
  for (const stage of schedule2ndOrder) {
    if (now >= schedule2nd[stage].start && now <= schedule2nd[stage].end)
      return `/leaderboard-2nd/${stage}`;
  }

  for (const stage of schedule2026Order) {
    if (now < schedule2026_1st[stage].start) return `/2026-1st/${stage}`;
  }

  if (now > schedule2026_1st.final.end) return "/2026-1st/final";
  return "/2026-1st/qualifying";
}

export function route() {
  let path = window.location.pathname;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

  const currentPath = getPathForCurrentDate();

  // 보호할 경로 (리다이렉트 하지 않음)
  const protectedPaths = [
    "/prize",
    "/2026-1st/courses",
    "/2026-1st/bracket",
    "/4th-open",
    "/v2/4th-open",
  ];

  // 스테이지 관련 경로인지 확인
  const isStagePath = (p) => {
    return (
      p.startsWith("/2026-1st/") ||
      p.startsWith("/leaderboard-2nd/") ||
      p.startsWith("/leaderboard/")
    );
  };

  // 리다이렉트 조건:
  // 1. 루트 경로 (/)
  // 2. 스테이지 경로인데 현재 스테이지가 아니고 보호된 경로도 아닌 경우
  // 3. 등록되지 않은 경로이고 보호된 경로도 아닌 경우 (404 대신 현재 페이지로)
  const shouldRedirect =
    path === "" ||
    path === "/" ||
    (isStagePath(path) && path !== currentPath && !protectedPaths.includes(path)) ||
    (!protectedPaths.includes(path) && !routes[path]);

  if (shouldRedirect) {
    path = currentPath;
    window.history.replaceState({}, "", path);
  }

  const renderFunc = routes[path];
  const app = document.getElementById("app");

  if (renderFunc && app) {
    app.innerHTML = "";
    renderFunc(app);
    updateSeoForPath(path);
    trackPageView(path, document.title);
  } else if (app) {
    app.innerHTML = "<h1>404 Not Found</h1><p>페이지를 찾을 수 없습니다.</p>";
    updateSeoForPath(path);
    trackPageView(path, "404 Not Found");
  }
}

window.addEventListener("popstate", route);
