// analytics.js - 웹 분석 유틸리티 함수들

/**
 * Google Analytics 이벤트 추적
 * @param {string} action - 이벤트 액션
 * @param {string} category - 이벤트 카테고리
 * @param {string} label - 이벤트 라벨 (선택사항)
 * @param {number} value - 이벤트 값 (선택사항)
 */
export function trackEvent(action, category, label = null, value = null) {
  if (typeof gtag !== "undefined") {
    gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

/**
 * 페이지 뷰 추적
 * @param {string} pagePath - 페이지 경로
 * @param {string} pageTitle - 페이지 제목
 */
export function trackPageView(pagePath, pageTitle) {
  if (typeof gtag !== "undefined") {
    gtag("config", "G-X34KCRC07N", {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
}

/**
 * 사용자 정의 이벤트들
 */
export const AnalyticsEvents = {
  // 리더보드 관련 이벤트
  LEADERBOARD_VIEW: "leaderboard_view",
  LEADERBOARD_REFRESH: "leaderboard_refresh",
  PLAYER_CLICK: "player_click",

  // 토너먼트 관련 이벤트
  TOURNAMENT_VIEW: "tournament_view",
  COURSE_SELECT: "course_select",

  // UI 관련 이벤트
  THEME_TOGGLE: "theme_toggle",
  MOBILE_VIEW: "mobile_view",

  // 성능 관련 이벤트
  PAGE_LOAD_TIME: "page_load_time",
  API_RESPONSE_TIME: "api_response_time",
};

/**
 * 성능 메트릭 추적
 */
export function trackPerformance() {
  if ("performance" in window) {
    window.addEventListener("load", () => {
      const loadTime =
        performance.timing.loadEventEnd - performance.timing.navigationStart;
      trackEvent(
        AnalyticsEvents.PAGE_LOAD_TIME,
        "Performance",
        "Page Load",
        loadTime
      );
    });
  }
}
