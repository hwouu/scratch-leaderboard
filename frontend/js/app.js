import { route } from "./router.js";
import { inject } from "@vercel/analytics";

/**
 * 전역 UI 요소에 대한 이벤트 리스너를 설정합니다.
 * 이 리스너들은 페이지가 바뀌어도 항상 활성화 상태를 유지해야 합니다.
 */
function initializeGlobalListeners() {
  // 테마 변경 버튼은 어떤 페이지에 있든 항상 존재하므로,
  // app.js에서 한 번만 등록해 관리합니다.
  document.addEventListener("click", (e) => {
    const themeToggle = e.target.closest("#theme-toggle");
    if (themeToggle) {
      const body = document.body;
      const newTheme = body.classList.contains("light-mode") ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      body.classList.toggle("light-mode", newTheme === "light");

      const icon = themeToggle.querySelector("i");
      if (icon) {
        icon.className =
          newTheme === "light" ? "fas fa-moon" : "fa-regular fa-sun";
      }
    }
  });
}

/**
 * 애플리케이션을 초기화하고 시작합니다.
 */
function init() {
  // Vercel Analytics 초기화
  inject();

  // 전역 이벤트 리스너 설정
  initializeGlobalListeners();

  // 현재 테마를 적용 (페이지 로드 시)
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.classList.toggle("light-mode", savedTheme === "light");

  // 라우터를 실행하여 현재 URL에 맞는 페이지를 렌더링
  route();
}

// 애플리케이션 시작
document.addEventListener("DOMContentLoaded", init);
