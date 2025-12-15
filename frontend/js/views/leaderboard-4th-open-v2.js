import {
  fetchLeaderboardData,
  getLeaderboardData,
  getPrevLeaderboardData,
  getAllPlayers,
  getLastFetchTime,
} from "../services/api.js";

// --- 상태 변수 ---
let currentStage = "4th-open";
let activeTab = localStorage.getItem("activeTab-4th-v2") || "total";
let currentViewMode = localStorage.getItem("currentViewMode-4th-v2") || "leaderboard";
let isSidebarCollapsed = localStorage.getItem("isSidebarCollapsed-v2") === "true";
let refreshIntervalId = null;
const REFRESH_INTERVAL_MS = 300000; // 5분

const tournamentInfo = {
  name: "스크래치 선물 팡팡",
  period: "2025-12-15 ~ 2026-01-09",
  type: "스트로크",
  courses: {
    A: "세븐밸리리트리트클럽&리조트",
    B: "어등산 CC - 하남/어등",
    C: "울산 CC - 동/남",
  },
};

// --- 템플릿 HTML ---
const leaderboardPageHTML = `
  <div class="ticker-wrap-v2">
    <div class="ticker-v2"></div>
  </div>
  <div class="container-v2">
    <header class="header-v2">
    </header>
    <main id="main-grid-v2" class="grid-container-v2">
      <aside class="sidebar-v2">
      </aside>
      <div id="content-v2" class="content-v2"></div>
    </main>
  </div>
  <footer class="mobile-footer-v2">
  </footer>
  <div id="search-modal-v2" class="modal-overlay-v2">
    <div class="modal-content-v2">
      <button class="modal-close-button-v2">&times;</button>
      <div id="modal-body-v2"></div>
    </div>
  </div>
  <div id="overview-modal-v2" class="modal-overlay-v2">
    <div class="modal-content-v2 image-modal-v2">
      <button class="modal-close-button-v2">&times;</button>
      <img src="/assets/4th-open-overview.jpeg" alt="대회 요강" class="overview-image-v2"
           onerror="this.onerror=null;this.src='https://placehold.co/800x1131/1a1c1e/eaeaea?text=Image%20Not%20Found';" />
    </div>
  </div>
`;

/**
 * 리더보드 페이지의 전체 구조를 렌더링하고 초기화합니다. (V2 신버전)
 * @param {string} stage - 렌더링할 스테이지 (항상 '4th-open')
 * @param {HTMLElement} app - 앱의 루트 요소
 */
export function renderLeaderboard4thOpenPageV2(stage, app) {
  currentStage = stage;
  app.innerHTML = leaderboardPageHTML;
  
  // V2 CSS 파일 로드
  if (!document.querySelector('link[href="/css/main-v2.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/main-v2.css';
    document.head.appendChild(link);
  }
  if (!document.querySelector('link[href="/css/leaderboard-v2.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/leaderboard-v2.css';
    document.head.appendChild(link);
  }

  renderHeader(app.querySelector(".header-v2"));
  renderSidebar(app.querySelector(".sidebar-v2"));
  renderMobileFooter(app.querySelector(".mobile-footer-v2"));

  if (isSidebarCollapsed) {
    document.getElementById("main-grid-v2").classList.add("sidebar-collapsed");
  }

  const elements = {
    contentElement: document.getElementById("content-v2"),
    lastUpdatedElement: document.getElementById("last-updated-time-v2"),
    tickerElement: document.querySelector(".ticker-v2"),
    highlightContentElement: document.getElementById("highlight-content-v2"),
    searchModal: document.getElementById("search-modal-v2"),
    overviewModal: document.getElementById("overview-modal-v2"),
  };

  initialize(elements);
}

// --- 템플릿 렌더링 함수들 ---
function renderHeader(header) {
  const currentTheme = localStorage.getItem("theme") || "dark";
  const themeIconClass =
    currentTheme === "light" ? "fas fa-moon" : "fa-regular fa-sun";

  header.innerHTML = `
    <div class="header-content-v2">
      <div class="title-section-v2">
        <div class="title-group-v2">
          <h1 class="title-v2">LEADER BOARD</h1>
          <span class="live-indicator-v2">
            <span class="live-dot-v2"></span>
            LIVE
          </span>
        </div>
        <div class="subtitle-v2">
          <span class="subtitle-text-v2">${tournamentInfo.name}</span>
          <span class="tournament-period-v2 mobile-show-v2">${tournamentInfo.period}</span>
          <span class="last-updated-v2">마지막 업데이트: <span id="last-updated-time-v2"></span></span>
        </div>
      </div>
      <div class="controls-section-v2">
        <div class="view-controls-v2 desktop-show-v2">
          <div id="view-toggle-v2" class="view-toggle-v2">
            <button class="toggle-btn-v2" data-view="total" title="합산">
              <span>합산</span>
            </button>
            <button class="toggle-btn-v2" data-view="course-rankings" title="코스별">
              <span>코스별</span>
            </button>
            <button class="toggle-btn-v2" data-view="courseA" title="A코스">
              <span>A코스</span>
            </button>
            <button class="toggle-btn-v2" data-view="courseB" title="B코스">
              <span>B코스</span>
            </button>
            <button class="toggle-btn-v2" data-view="courseC" title="C코스">
              <span>C코스</span>
            </button>
          </div>
        </div>
        <div class="view-dropdown-container-v2 mobile-show-v2">
          <div class="custom-dropdown-v2" id="view-dropdown-custom-v2">
            <button class="custom-dropdown-button-v2" id="view-dropdown-button-v2">
              <span class="dropdown-selected-v2">합산</span>
              <i class="fas fa-chevron-down dropdown-icon-v2"></i>
            </button>
            <div class="custom-dropdown-menu-v2" id="view-dropdown-menu-v2">
              <div class="dropdown-option-v2" data-value="total">합산</div>
              <div class="dropdown-option-v2" data-value="course-rankings">코스별</div>
              <div class="dropdown-option-v2" data-value="courseA">A코스</div>
              <div class="dropdown-option-v2" data-value="courseB">B코스</div>
              <div class="dropdown-option-v2" data-value="courseC">C코스</div>
            </div>
          </div>
        </div>
        <div class="action-buttons-v2">
          <div class="search-container-v2">
            <input type="text" id="search-input-v2" placeholder="닉네임 또는 아이디" />
            <button id="search-button-v2"><i class="fas fa-search"></i></button>
          </div>
          <button id="refresh-button-v2" class="icon-button-v2" title="새로고침">
            <i class="fas fa-sync-alt"></i>
          </button>
          <button id="sidebar-toggle-v2" class="icon-button-v2" title="사이드바 열기/닫기">
            <i class="fas fa-expand"></i>
          </button>
          <button id="overview-button-v2" class="icon-button-v2" title="대회 요강">
            <i class="fas fa-file-alt"></i>
          </button>
          <button id="theme-toggle-v2" class="icon-button-v2" title="테마 변경">
            <i class="${themeIconClass}"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderSidebar(sidebar) {
  sidebar.innerHTML = `
    <div class="info-panel-v2">
      <h2 class="panel-title-v2">대회 정보</h2>
      <div class="info-group-v2">
        <div class="info-item-v2">
          <span class="info-label-v2">대회 방식</span>
          <span class="info-value-v2">${tournamentInfo.type}</span>
        </div>
        <div class="info-item-v2">
          <span class="info-label-v2">대회 기간</span>
          <span class="info-value-v2">${tournamentInfo.period}</span>
        </div>
      </div>
      <div class="info-group-v2">
        <span class="info-label-v2">코스 정보</span>
        <ul class="store-list-v2">
          <li><strong>A코스:</strong> ${tournamentInfo.courses.A}</li>
          <li><strong>B코스:</strong> ${tournamentInfo.courses.B}</li>
          <li><strong>C코스:</strong> ${tournamentInfo.courses.C}</li>
        </ul>
      </div>
    </div>
    <div class="highlight-panel-v2">
      <h2 class="panel-title-v2">대회 하이라이트</h2>
      <div id="highlight-content-v2"></div>
    </div>
    <footer class="desktop-footer-v2">
      <div class="footer-links-v2">
        <a href="https://www.golfzon.com/tournament/glf/view?wtm_code=1197844" target="_blank" title="대회 페이지">
          <i class="fas fa-trophy"></i>
        </a>
        <a href="https://github.com/hwouu/scratch-leaderboard" target="_blank" title="Developer: hwouu">
          <i class="fab fa-github"></i>
        </a>
        <a href="mailto:nhw3990@gmail.com" title="Contact">
          <i class="fas fa-envelope"></i>
        </a>
      </div>
      <div class="footer-copyright-v2">&copy; 2025 Scratch Leaderboard</div>
    </footer>
  `;
}

function renderMobileFooter(footer) {
  footer.innerHTML = `
    <div class="footer-links-v2">
      <a href="https://www.golfzon.com/tournament/glf/view?wtm_code=1197844" target="_blank" title="대회 페이지">
        <i class="fas fa-trophy"></i>
      </a>
      <a href="https://github.com/hwouu/scratch-leaderboard" target="_blank" title="Developer: hwouu">
        <i class="fab fa-github"></i>
      </a>
      <a href="mailto:nhw3990@gmail.com" title="Contact">
        <i class="fas fa-envelope"></i>
      </a>
      <a class="footer-copyright-mobile-v2">&copy; 2025 Scratch Leaderboard</a>
    </div>
  `;
}

async function initialize(elements) {
  setupEventListeners(elements);
  setActiveTabUI();
  setViewModeUI();
  // 초기 로딩 시 스켈레톤 표시
  renderSkeleton(elements.contentElement);
  await fetchAndRender(elements);
  startAutoRefresh(elements);
}

function renderSkeleton(container) {
  // 코스별 뷰인 경우
  if (currentViewMode === "course-rankings") {
    const courseSections = ["A", "B", "C"].map((courseLabel) => {
      const headHTML = `
        <thead>
          <tr>
            <th>순위</th>
            <th>닉네임</th>
            <th>최종 성적</th>
          </tr>
        </thead>
      `;
      
      const skeletonRows = Array(5)
        .fill(0)
        .map(() => {
          return `
            <tr>
              <td><div class="skeleton-cell-v2 rank"></div></td>
              <td><div class="skeleton-cell-v2 nickname"></div></td>
              <td><div class="skeleton-cell-v2 score"></div></td>
            </tr>
          `;
        }).join("");

      return `
        <div class="course-ranking-section-v2">
          <h3 class="course-ranking-title-v2">${courseLabel}코스</h3>
          <div class="skeleton-container-v2">
            <table class="skeleton-table-v2">
              ${headHTML}
              <tbody>${skeletonRows}</tbody>
            </table>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="course-rankings-container-v2">
        ${courseSections}
      </div>
    `;
    return;
  }

  // 일반 리더보드 뷰
  const headersConfig = {
    total: [
      { key: "순위" },
      { key: "닉네임" },
      { key: "참여매장", class: "mobile-hide-v2" },
      { key: "라운드", class: "mobile-hide-v2" },
      { key: "A", class: "mobile-hide-v2" },
      { key: "B", class: "mobile-hide-v2" },
      { key: "C", class: "mobile-hide-v2" },
      { key: "보정치" },
      { key: "최종 성적" },
    ],
    course: [
      { key: "순위" },
      { key: "닉네임" },
      { key: "참여매장", class: "tablet-hide-v2 mobile-hide-v2" },
      { key: "라운드", class: "mobile-hide-v2" },
      { key: "코스 성적", class: "mobile-hide-v2" },
      { key: "실력 등급", class: "mobile-hide-v2" },
      { key: "보정치", class: "mobile-hide-v2" },
      { key: "최종 성적" },
    ],
  };
  
  let headers;
  if (currentViewMode === "total") {
    headers = headersConfig.total;
  } else if (currentViewMode === "courseA" || currentViewMode === "courseB" || currentViewMode === "courseC") {
    headers = headersConfig.course;
  } else {
    headers = activeTab === "total" ? headersConfig.total : headersConfig.course;
  }

  const headHTML = `<thead><tr>${headers
    .map((h) => `<th class="${h.class || ""}">${h.key}</th>`)
    .join("")}</tr></thead>`;

  const skeletonRows = Array(10)
    .fill(0)
    .map(() => {
      const cells = headers.map((h, idx) => {
        let cellClass = "skeleton-cell-v2";
        if (idx === 0) cellClass += " rank";
        else if (idx === 1) cellClass += " nickname";
        else if (idx === headers.length - 1) cellClass += " score";
        else cellClass += " score";
        
        return `<td class="${h.class || ""}"><div class="${cellClass}"></div></td>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    }).join("");

  container.innerHTML = `
    <div class="skeleton-container-v2">
      <table class="skeleton-table-v2">
        ${headHTML}
        <tbody>${skeletonRows}</tbody>
      </table>
    </div>
  `;
}

async function fetchAndRender(elements) {
  const refreshButton = document.getElementById("refresh-button-v2");
  
  // 스켈레톤 UI 표시
  renderSkeleton(elements.contentElement);
  if (refreshButton) refreshButton.querySelector("i").classList.add("fa-spin");

  const { success } = await fetchLeaderboardData(currentStage);
  if (success) {
    const leaderboardData = getLeaderboardData();
    if (elements.lastUpdatedElement) {
      elements.lastUpdatedElement.textContent =
        getLastFetchTime().toLocaleTimeString("ko-KR");
    }
    renderContent(elements.contentElement);
    renderTicker(elements.tickerElement, leaderboardData.total);
    renderHighlights(elements.highlightContentElement, leaderboardData.total);
  } else {
    elements.contentElement.innerHTML = `
      <div class="error-container-v2">
        <div class="error-icon-v2">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 class="error-title-v2">데이터 로딩 실패</h3>
        <p class="error-message-v2">데이터를 불러오는 데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
      </div>
    `;
  }
  if (refreshButton) refreshButton.querySelector("i").classList.remove("fa-spin");
}

function startAutoRefresh(elements) {
  if (refreshIntervalId) clearInterval(refreshIntervalId);
  refreshIntervalId = setInterval(
    () => fetchAndRender(elements),
    REFRESH_INTERVAL_MS
  );
}

function setActiveTabUI() {
  document
    .querySelectorAll(".tab-button-v2")
    .forEach((t) =>
      t.classList.toggle("active", t.dataset.target === activeTab)
    );
}

function setViewModeUI() {
  document
    .querySelectorAll(".toggle-btn-v2")
    .forEach((b) => b.classList.remove("active"));
  const currentViewBtn = document.querySelector(
    `.toggle-btn-v2[data-view="${currentViewMode}"]`
  );
  if (currentViewBtn) currentViewBtn.classList.add("active");
  
  // 커스텀 드롭다운 업데이트
  const dropdownSelected = document.querySelector("#view-dropdown-button-v2 .dropdown-selected-v2");
  const dropdownOption = document.querySelector(`#view-dropdown-menu-v2 .dropdown-option-v2[data-value="${currentViewMode}"]`);
  if (dropdownSelected && dropdownOption) {
    dropdownSelected.textContent = dropdownOption.textContent;
  }
  
  // 드롭다운 옵션 활성화 상태 업데이트
  document.querySelectorAll("#view-dropdown-menu-v2 .dropdown-option-v2").forEach((opt) => {
    opt.classList.remove("selected");
    if (opt.dataset.value === currentViewMode) {
      opt.classList.add("selected");
    }
  });
}

const formatFinalScore = (score) =>
  score === null || score === undefined
    ? "<span>-</span>"
    : `<span class="final-score-v2">${
        parseInt(score, 10) > 0 ? `+${score}` : score
      }</span>`;
const formatSimpleScore = (score) =>
  score === null || score === undefined
    ? "-"
    : parseInt(score, 10) > 0
    ? `+${score}`
    : score;
const formatTickerScore = (score) =>
  score === null || score === undefined
    ? "<span>-</span>"
    : `<span class="score-final-v2">${
        parseInt(score, 10) > 0 ? `+${score}` : score
      }</span>`;
const formatSkillLevel = (grade) => {
  if (!grade || typeof grade !== "string" || grade.length < 4)
    return grade || "-";
  const levelMap = {
    REA: "독수리",
    PEA: "독수리",
    RFA: "매",
    PFA: "매",
    RCR: "학",
    PCR: "학",
    RMA: "까치",
    PMA: "까치",
  };
  const tierMap = { 0: "예정", 1: "골드", 2: "실버", 3: "브론즈" };
  const level = levelMap[grade.substring(0, 3)];
  const tier = tierMap[grade.substring(3, 4)];
  return level && tier ? `${level} ${tier}` : grade;
};

function renderContent(container) {
  const leaderboardData = getLeaderboardData();
  
  if (currentViewMode === "course-rankings") {
    renderCourseRankingsView(container, leaderboardData);
  } else if (currentViewMode === "total" || currentViewMode === "courseA" || currentViewMode === "courseB" || currentViewMode === "courseC") {
    const data = leaderboardData[currentViewMode] || [];
    renderLeaderboardView(container, data);
  } else {
    const data = leaderboardData[activeTab] || [];
    renderLeaderboardView(container, data);
  }
}

function renderEmptyView(container, headers) {
  const headHTML = `<thead><tr>${headers
    .map((h) => `<th class="${h.class || ""}">${h.key}</th>`)
    .join("")}</tr></thead>`;
  const bodyHTML = `<tbody><tr class="placeholder-row-v2"><td colspan="${headers.length}">등록된 데이터가 없습니다.</td></tr></tbody>`;
  container.innerHTML = `<div class="table-container-v2"><table class="table-v2">${headHTML}${bodyHTML}</table></div>`;
}

function renderLeaderboardView(container, data) {
  const headersConfig = {
    total: [
      { key: "순위" },
      { key: "닉네임" },
      { key: "참여매장", class: "mobile-hide-v2" },
      { key: "라운드", class: "mobile-hide-v2" },
      { key: "A", class: "mobile-hide-v2" },
      { key: "B", class: "mobile-hide-v2" },
      { key: "C", class: "mobile-hide-v2" },
      { key: "보정치" },
      { key: "최종 성적" },
    ],
    course: [
      { key: "순위" },
      { key: "닉네임" },
      { key: "참여매장", class: "tablet-hide-v2 mobile-hide-v2" },
      { key: "라운드", class: "mobile-hide-v2" },
      { key: "코스 성적", class: "mobile-hide-v2" },
      { key: "실력 등급", class: "mobile-hide-v2" },
      { key: "보정치", class: "mobile-hide-v2" },
      { key: "최종 성적" },
    ],
  };
  
  let headers;
  if (currentViewMode === "total") {
    headers = headersConfig.total;
  } else if (currentViewMode === "courseA" || currentViewMode === "courseB" || currentViewMode === "courseC") {
    headers = headersConfig.course;
  } else {
    headers = activeTab === "total" ? headersConfig.total : headersConfig.course;
  }

  if (!data || data.length === 0) {
    renderEmptyView(container, headers);
    return;
  }

  const headHTML = `<thead><tr>${headers
    .map((h) => `<th class="${h.class || ""}">${h.key}</th>`)
    .join("")}</tr></thead>`;

  const prevData = getPrevLeaderboardData()?.[activeTab] || [];
  const leaderboardData = getLeaderboardData();
  
  const getCourseScore = (userId, course) => {
    const courseData = leaderboardData[course] || [];
    const player = courseData.find((p) => p.userId === userId);
    return player ? player.score : null;
  };

  const bodyHTML = data
    .map((player, index) => {
      const rank = player.tieCount > 1 ? `T${player.rank}` : player.rank;
      const prevPlayer = prevData.find((p) => p.userId === player.userId);
      let rankChangeClass = "";
      if (prevPlayer) {
        if (player.rank < prevPlayer.rank) rankChangeClass = "flash-up-v2";
        else if (player.rank > prevPlayer.rank) rankChangeClass = "flash-down-v2";
      }

      const totalRevision =
        (player.gradeRevision || 0) +
        (player.systemRevision || 0) +
        (player.genderRevision || 0);
      const revisionDisplay =
        totalRevision > 0 ? `+${totalRevision}` : totalRevision.toString();

      let finalScore;
      if (activeTab === "total") {
        const courseAScore = getCourseScore(player.userId, "courseA") || 0;
        const courseBScore = getCourseScore(player.userId, "courseB") || 0;
        const courseCScore = getCourseScore(player.userId, "courseC") || 0;
        const totalCourseScore = courseAScore + courseBScore + courseCScore;
        finalScore = totalCourseScore + totalRevision;
      } else {
        finalScore = (player.score || 0) + totalRevision;
      }

      const isTopThree = player.rank <= 3;
      const rowClass = isTopThree ? `rank-top-${player.rank}` : "";

      const rowCells =
        activeTab === "total"
          ? `<td class="rank-v2">${rank}</td>
             <td class="nickname-v2">${
               player.userNickname
             }<span class="user-id-v2">(${
              player.userId
            })</span><span class="shop-name-mobile-v2">${
              player.shopName || ""
            }</span></td>
             <td class="mobile-hide-v2">${player.shopName || ""}</td>
             <td class="mobile-hide-v2">${player.roundCount || "-"}</td>
             <td class="mobile-hide-v2">${formatSimpleScore(getCourseScore(player.userId, "courseA"))}</td>
             <td class="mobile-hide-v2">${formatSimpleScore(getCourseScore(player.userId, "courseB"))}</td>
             <td class="mobile-hide-v2">${formatSimpleScore(getCourseScore(player.userId, "courseC"))}</td>
             <td>${revisionDisplay}</td>
             <td>${formatFinalScore(finalScore)}</td>`
          : `<td class="rank-v2">${rank}</td>
             <td class="nickname-v2">${
               player.userNickname
             }<span class="user-id-v2">(${
              player.userId
            })</span><span class="shop-name-mobile-v2">${
              player.shopName || ""
            }</span></td>
             <td class="tablet-hide-v2 mobile-hide-v2">${player.shopName || ""}</td>
             <td class="mobile-hide-v2">${player.roundCount || "-"}</td>
             <td class="mobile-hide-v2">${formatSimpleScore(player.score)}</td>
             <td class="mobile-hide-v2">${formatSkillLevel(player.grade)}</td>
             <td class="mobile-hide-v2">${revisionDisplay}</td>
             <td>${formatFinalScore(finalScore)}</td>`;
      return `<tr class="${rankChangeClass} ${rowClass}" data-userid="${player.userId}">${rowCells}</tr>`;
    })
    .join("");
  container.innerHTML = `<div class="table-container-v2"><table class="table-v2">${headHTML}<tbody class="clickable-v2">${bodyHTML}</tbody></table></div>`;
}

function renderCourseRankingsView(container, leaderboardData) {
  const courseA = leaderboardData.courseA || [];
  const courseB = leaderboardData.courseB || [];
  const courseC = leaderboardData.courseC || [];

  const renderCourseSection = (courseData, courseLabel) => {
    if (!courseData || courseData.length === 0) {
      return `
        <div class="course-ranking-section-v2">
          <h3 class="course-ranking-title-v2">${courseLabel}코스</h3>
          <div class="table-container-v2">
            <table class="table-v2">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>닉네임</th>
                  <th>최종 성적</th>
                </tr>
              </thead>
              <tbody>
                <tr class="placeholder-row-v2">
                  <td colspan="3">등록된 데이터가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    const headers = [
      { key: "순위" },
      { key: "닉네임" },
      { key: "최종 성적" },
    ];
    const headHTML = `<thead><tr>${headers
      .map((h) => `<th>${h.key}</th>`)
      .join("")}</tr></thead>`;

    const bodyHTML = courseData
      .map((player) => {
        const rank = player.tieCount > 1 ? `T${player.rank}` : player.rank;
        const totalRevision =
          (player.gradeRevision || 0) +
          (player.systemRevision || 0) +
          (player.genderRevision || 0);
        const finalScore = (player.score || 0) + totalRevision;

        return `
          <tr data-userid="${player.userId}">
            <td class="rank-v2">${rank}</td>
            <td class="nickname-v2">${player.userNickname}<span class="user-id-v2">(${player.userId})</span></td>
            <td>${formatFinalScore(finalScore)}</td>
          </tr>
        `;
      })
      .join("");

    return `
      <div class="course-ranking-section-v2">
        <h3 class="course-ranking-title-v2">${courseLabel}코스</h3>
        <div class="table-container-v2">
          <table class="table-v2">
            ${headHTML}
            <tbody class="clickable-v2">${bodyHTML}</tbody>
          </table>
        </div>
      </div>
    `;
  };

  const html = `
    <div class="course-rankings-container-v2">
      ${renderCourseSection(courseA, "A")}
      ${renderCourseSection(courseB, "B")}
      ${renderCourseSection(courseC, "C")}
    </div>
  `;

  container.innerHTML = html;
}

function renderTicker(element, data) {
  const tickerWrap = document.querySelector(".ticker-wrap-v2");
  
  if (tickerWrap) tickerWrap.style.display = "block";
  
  if (!data || data.length === 0) {
    const defaultMessage = `<span class="ticker-emoji-v2">🎁</span><span class="ticker-text-bold-v2">스크래치 OPEN 4th</span><span class="ticker-separator-v2">|</span><span class="ticker-text-bold-v2">스크래치 선물 팡팡</span><span class="ticker-separator-v2">|</span><span class="ticker-text-normal-v2">연말연시를 맞이하여 고객분들께 감사의 선물을 드립니다</span><span class="ticker-emoji-v2">🎉</span><span class="ticker-separator-v2">|</span><span class="ticker-text-normal-v2">올해도 저희 스크래치를 찾아주신 여러분께 감사드립니다</span><span class="ticker-emoji-v2">🙏</span>`;
    element.innerHTML = `<div class="ticker-item-v2">${defaultMessage}</div>`.repeat(2);
    return;
  }
  
  const leaderboardData = getLeaderboardData();
  const getCourseScore = (userId, course) => {
    const courseData = leaderboardData[course] || [];
    const player = courseData.find((p) => p.userId === userId);
    return player ? player.score : null;
  };
  
  const top20 = data.slice(0, 20);
  const tickerContent = top20
    .map((p) => {
      const rank = p.tieCount > 1 ? `T${p.rank}` : p.rank;
      const courseAScore = getCourseScore(p.userId, "courseA") || 0;
      const courseBScore = getCourseScore(p.userId, "courseB") || 0;
      const courseCScore = getCourseScore(p.userId, "courseC") || 0;
      const totalCourseScore = courseAScore + courseBScore + courseCScore;
      const totalRevision =
        (p.gradeRevision || 0) +
        (p.systemRevision || 0) +
        (p.genderRevision || 0);
      const finalScore = totalCourseScore + totalRevision;
      return `<div class="ticker-item-v2"><span class="rank-v2-ticker">${rank}</span><span class="name-v2-ticker">${
        p.userNickname
      }</span><span class="score-v2-ticker">${formatTickerScore(
        finalScore
      )}</span></div>`;
    })
    .join("");
  element.innerHTML = tickerContent.repeat(2);
}

function renderHighlights(element, data) {
  if (!data || data.length < 1) {
    if (element) element.innerHTML = "";
    return;
  }
  const leaderboardData = getLeaderboardData();
  const getCourseScore = (userId, course) => {
    const courseData = leaderboardData[course] || [];
    const player = courseData.find((p) => p.userId === userId);
    return player ? player.score : null;
  };
  
  const sortedByFinal = [...data].map((p) => {
    const courseAScore = getCourseScore(p.userId, "courseA") || 0;
    const courseBScore = getCourseScore(p.userId, "courseB") || 0;
    const courseCScore = getCourseScore(p.userId, "courseC") || 0;
    const totalCourseScore = courseAScore + courseBScore + courseCScore;
    const totalRevision =
      (p.gradeRevision || 0) +
      (p.systemRevision || 0) +
      (p.genderRevision || 0);
    const finalScore = totalCourseScore + totalRevision;
    return { ...p, finalScore };
  });
  const best = sortedByFinal.sort((a, b) => a.finalScore - b.finalScore)[0];
  const most = [...data].sort((a, b) => (b.roundCount || 0) - (a.roundCount || 0))[0];
  if (element) {
    element.innerHTML = `
      <div class="highlight-item-v2">
        <div class="highlight-title-v2">최고 성적</div>
        <div class="highlight-value-v2">${best.userNickname}: ${formatSimpleScore(best.finalScore)}</div>
      </div>
      <div class="highlight-item-v2">
        <div class="highlight-title-v2">최다 라운드</div>
        <div class="highlight-value-v2">${most.userNickname}: ${most.roundCount || 0}회</div>
      </div>
    `;
  }
}

function setupEventListeners(elements) {
  const { contentElement, searchModal, overviewModal } = elements;

  document.getElementById("refresh-button-v2").addEventListener("click", () => {
    fetchAndRender(elements);
  });

  document.getElementById("sidebar-toggle-v2").addEventListener("click", () => {
    const mainGrid = document.getElementById("main-grid-v2");
    isSidebarCollapsed = !isSidebarCollapsed;
    localStorage.setItem("isSidebarCollapsed-v2", isSidebarCollapsed);
    mainGrid.classList.toggle("sidebar-collapsed", isSidebarCollapsed);
  });

  const viewToggle = document.getElementById("view-toggle-v2");
  
  if (viewToggle) {
    viewToggle.addEventListener("click", (e) => {
      const btn = e.target.closest(".toggle-btn-v2");
      if (btn) {
        currentViewMode = btn.dataset.view;
        localStorage.setItem("currentViewMode-4th-v2", currentViewMode);
        setViewModeUI();
        renderContent(contentElement);
      }
    });
  }

  const dropdownButton = document.getElementById("view-dropdown-button-v2");
  const dropdownMenu = document.getElementById("view-dropdown-menu-v2");
  const dropdownSelected = dropdownButton?.querySelector(".dropdown-selected-v2");
  const dropdownOptions = dropdownMenu?.querySelectorAll(".dropdown-option-v2");

  if (dropdownButton && dropdownMenu) {
    dropdownButton.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("active");
      dropdownButton.classList.toggle("active");
    });

    dropdownOptions?.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const value = option.dataset.value;
        const text = option.textContent;
        
        currentViewMode = value;
        localStorage.setItem("currentViewMode-4th-v2", currentViewMode);
        
        if (dropdownSelected) dropdownSelected.textContent = text;
        dropdownMenu.classList.remove("active");
        dropdownButton.classList.remove("active");
        
        setViewModeUI();
        renderContent(contentElement);
      });
    });

    document.addEventListener("click", (e) => {
      if (!dropdownButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove("active");
        dropdownButton.classList.remove("active");
      }
    });
  }

  const searchInput = document.getElementById("search-input-v2");
  const openModal = (modal) => modal.classList.add("active");

  document
    .getElementById("search-button-v2")
    .addEventListener("click", () =>
      handleSearch(searchInput, searchModal, openModal)
    );
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") handleSearch(searchInput, searchModal, openModal);
  });

  document
    .getElementById("overview-button-v2")
    .addEventListener("click", () => openModal(overviewModal));

  [searchModal, overviewModal].forEach((modal) => {
    if (modal) {
      const closeModal = () => modal.classList.remove("active");
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
      modal
        .querySelector(".modal-close-button-v2")
        .addEventListener("click", closeModal);
    }
  });

  contentElement.addEventListener("click", (e) => {
    const target = e.target.closest("tr[data-userid]");
    if (target) {
      const userId = target.dataset.userid;
      if (!userId || userId === "null") return;

      const allPlayersList = getAllPlayers();
      const leaderboardData = getLeaderboardData();
      const allData = [
        ...(leaderboardData.total || []),
        ...(leaderboardData.courseA || []),
        ...(leaderboardData.courseB || []),
        ...(leaderboardData.courseC || []),
      ];
      let player = allData.find((p) => p.userId === userId);
      const fullPlayerInfo = allPlayersList.find((p) => p.userId === userId);

      if (fullPlayerInfo) {
        player = { ...fullPlayerInfo, ...player };
        showPlayerModal(player, searchModal, openModal);
      } else if (player) {
        showPlayerModal(player, searchModal, openModal);
      }
    }
  });
}

function handleSearch(input, modal, openCallback) {
  const searchTerm = input.value.trim().toLowerCase();
  if (!searchTerm) return;
  const leaderboardData = getLeaderboardData();
  const allData = [
    ...(leaderboardData.total || []),
    ...(leaderboardData.courseA || []),
    ...(leaderboardData.courseB || []),
    ...(leaderboardData.courseC || []),
  ];
  const player = allData.find(
    (p) =>
      p.userNickname.toLowerCase().includes(searchTerm) ||
      p.userId.toLowerCase().includes(searchTerm)
  );

  if (player) {
    showPlayerModal(player, modal, openCallback);
  } else {
    const modalBody = modal.querySelector("#modal-body-v2");
    modalBody.innerHTML = `<p><strong>'${input.value}'</strong> 선수를 찾을 수 없습니다.</p>`;
    openCallback(modal);
  }
  input.blur();
}

function showPlayerModal(player, modal, openCallback) {
  if (!player) return;

  const leaderboardData = getLeaderboardData();
  const rank = player.tieCount > 1 ? `T${player.rank}` : player.rank || "-";
  let totalRounds = player.roundCount;

  const courseAData = (leaderboardData.courseA || []).find(
    (p) => p.userId === player.userId
  );
  const courseBData = (leaderboardData.courseB || []).find(
    (p) => p.userId === player.userId
  );
  const courseCData = (leaderboardData.courseC || []).find(
    (p) => p.userId === player.userId
  );

  const totalRevision =
    (player.gradeRevision || 0) +
    (player.systemRevision || 0) +
    (player.genderRevision || 0);
  
  const courseAScore = courseAData?.score || 0;
  const courseBScore = courseBData?.score || 0;
  const courseCScore = courseCData?.score || 0;
  const totalCourseScore = courseAScore + courseBScore + courseCScore;
  const finalScore = totalCourseScore + totalRevision;

  const detailsHTML = `
    <div class="search-result-item-v2">
      <span class="result-label-v2">순위</span>
      <span class="result-value-v2 rank-v2">${rank}</span>
    </div>
    <div class="search-result-item-v2">
      <span class="result-label-v2">참여 매장</span>
      <span class="result-value-v2">${player.shopName || "-"}</span>
    </div>
    <div class="search-result-item-v2">
      <span class="result-label-v2">라운드</span>
      <span class="result-value-v2">${totalRounds || "-"}</span>
    </div>
    <div class="search-result-item-v2">
      <span class="result-label-v2">A코스</span>
      <span class="result-value-v2">${formatSimpleScore(courseAData?.score)}</span>
    </div>
    <div class="search-result-item-v2">
      <span class="result-label-v2">B코스</span>
      <span class="result-value-v2">${formatSimpleScore(courseBData?.score)}</span>
    </div>
    <div class="search-result-item-v2">
      <span class="result-label-v2">C코스</span>
      <span class="result-value-v2">${formatSimpleScore(courseCData?.score)}</span>
    </div>
    <div class="search-result-item-v2">
      <span class="result-label-v2">실력 등급</span>
      <span class="result-value-v2">${formatSkillLevel(
        player.grade || courseAData?.grade || courseBData?.grade || courseCData?.grade
      )}</span>
    </div>
    <div class="search-result-item-v2">
      <span class="result-label-v2">보정치</span>
      <span class="result-value-v2">${
        totalRevision > 0 ? `+${totalRevision}` : totalRevision
      }</span>
    </div>
    <div class="search-result-item-v2">
      <span class="result-label-v2">최종 성적</span>
      <span class="result-value-v2 final-score-v2">${formatSimpleScore(finalScore)}</span>
    </div>
  `;

  const modalBody = modal.querySelector("#modal-body-v2");
  modalBody.innerHTML = `<h3 class="modal-body-title-v2">${player.userNickname} (${player.userId})</h3>${detailsHTML}`;
  openCallback(modal);
}

