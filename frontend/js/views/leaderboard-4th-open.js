import {
  fetchLeaderboardData,
  getLeaderboardData,
  getPrevLeaderboardData,
  getAllPlayers,
  getLastFetchTime,
} from "../services/api.js";

// --- 상태 변수 ---
let currentStage = "4th-open";
let activeTab = localStorage.getItem("activeTab-4th") || "total";
let currentViewMode =
  localStorage.getItem("currentViewMode-4th") || "leaderboard";
let isSidebarCollapsed = localStorage.getItem("isSidebarCollapsed") === "true";
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
  <div class="ticker-wrap">
    <div class="ticker"></div>
  </div>
  <div class="container">
    <header>
      </header>
    <main id="main-grid" class="grid-container">
      <aside class="sidebar">
        </aside>
      <div id="content"></div>
    </main>
  </div>
  <footer class="mobile-footer">
    </footer>
  <div id="search-modal" class="modal-overlay">
    <div class="modal-content">
      <button class="modal-close-button">&times;</button>
      <div id="modal-body"></div>
    </div>
  </div>
  <div id="overview-modal" class="modal-overlay">
    <div class="modal-content image-modal">
      <button class="modal-close-button">&times;</button>
      <img src="/assets/4th-open-overview.jpeg" alt="대회 요강" class="overview-image"
           onerror="this.onerror=null;this.src='https://placehold.co/800x1131/1a1c1e/eaeaea?text=Image%20Not%20Found';" />
    </div>
  </div>
  <div id="v2-promotion-toast" class="v2-promotion-toast">
    <div class="v2-promotion-content">
      <div class="v2-promotion-icon">✨</div>
      <div class="v2-promotion-text">
        <div class="v2-promotion-title">신버전 UI 체험하기</div>
        <div class="v2-promotion-subtitle">더 나은 경험을 제공하는 새로운 디자인</div>
      </div>
      <button id="v2-promotion-button" class="v2-promotion-button">체험하기</button>
      <button id="v2-promotion-close" class="v2-promotion-close">&times;</button>
    </div>
  </div>
`;

/**
 * 리더보드 페이지의 전체 구조를 렌더링하고 초기화합니다.
 * @param {string} stage - 렌더링할 스테이지 (항상 '4th-open')
 * @param {HTMLElement} app - 앱의 루트 요소
 */
export function renderLeaderboard4thOpenPage(stage, app) {
  currentStage = stage;
  app.innerHTML = leaderboardPageHTML;

  renderHeader(app.querySelector("header"));
  renderSidebar(app.querySelector(".sidebar"));
  renderMobileFooter(app.querySelector(".mobile-footer"));

  if (isSidebarCollapsed) {
    document.getElementById("main-grid").classList.add("sidebar-collapsed");
  }

  const elements = {
    contentElement: document.getElementById("content"),
    lastUpdatedElement: document.getElementById("last-updated-time"),
    tickerElement: document.querySelector(".ticker"),
    searchModal: document.getElementById("search-modal"),
    overviewModal: document.getElementById("overview-modal"),
  };

  initialize(elements);
}

// --- 템플릿 렌더링 함수들 ---
function renderHeader(header) {
  const currentTheme = localStorage.getItem("theme") || "dark";
  const themeIconClass =
    currentTheme === "light" ? "fas fa-moon" : "fa-regular fa-sun";

  header.innerHTML = `
        <div class="title-container">
            <div class="title-group">
                <h1>LEADER BOARD</h1>
                <span class="live-indicator">LIVE</span>
            </div>
            <div class="subtitle">
                <span class="subtitle-text">${tournamentInfo.name}</span>
                <span class="tournament-period mobile-show">${tournamentInfo.period}</span>
                <span class="last-updated">마지막 업데이트: <span id="last-updated-time"></span></span>
            </div>
        </div>
        <div class="header-controls-row">
            <div class="header-center">
                <div class="view-toggle-container desktop-show">
                    <div id="view-toggle-main" class="view-toggle">
                        <button class="toggle-btn" data-view="total" title="합산"><span>합산</span></button>
                        <button class="toggle-btn" data-view="distance" title="롱기/니어"><span>롱기/니어</span></button>
                        <button class="toggle-btn" data-view="course-rankings" title="코스별"><span>코스별</span></button>
                    </div>
                    <div id="view-toggle-courses" class="view-toggle">
                        <button class="toggle-btn" data-view="courseA" title="A코스"><span>A코스</span></button>
                        <button class="toggle-btn" data-view="courseB" title="B코스"><span>B코스</span></button>
                        <button class="toggle-btn" data-view="courseC" title="C코스"><span>C코스</span></button>
                    </div>
                </div>
                <div class="view-dropdown-container mobile-show">
                    <div class="custom-dropdown" id="view-dropdown-custom">
                        <button class="custom-dropdown-button" id="view-dropdown-button">
                            <span class="dropdown-selected">합산</span>
                            <i class="fas fa-chevron-down dropdown-icon"></i>
                        </button>
                        <div class="custom-dropdown-menu" id="view-dropdown-menu">
                            <div class="dropdown-option" data-value="total">합산</div>
                            <div class="dropdown-option" data-value="distance">롱기/니어</div>
                            <div class="dropdown-option" data-value="course-rankings">코스별</div>
                            <div class="dropdown-option" data-value="courseA">A코스</div>
                            <div class="dropdown-option" data-value="courseB">B코스</div>
                            <div class="dropdown-option" data-value="courseC">C코스</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="controls-container">
                <div class="search-container">
                    <input type="text" id="search-input" placeholder="닉네임 또는 아이디" />
                    <button id="search-button"><i class="fas fa-search"></i></button>
                </div>
                <button id="refresh-button" title="새로고침"><i class="fas fa-sync-alt"></i></button>
                <button id="sidebar-toggle" title="사이드바 열기/닫기"><i class="fas fa-expand"></i></button>
                <button id="overview-button" title="대회 요강"><i class="fas fa-file-alt"></i></button>
                <button id="theme-toggle" title="테마 변경"><i class="${themeIconClass}"></i></button>
            </div>
        </div>`;
}

function renderSidebar(sidebar) {
  sidebar.innerHTML = `
        <div class="info-panel">
            <h2>대회 정보</h2>
            <div class="info-group">
                <div class="info-item">
                    <span class="info-label">대회 방식</span><span class="info-value">${tournamentInfo.type}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">대회 기간</span><span class="info-value">${tournamentInfo.period}</span>
                </div>
            </div>
        </div>
        <footer class="desktop-footer">
            <div class="footer-links">
                <a href="https://www.golfzon.com/tournament/glf/view?wtm_code=1197844" target="_blank" title="대회 페이지"><i class="fas fa-trophy"></i></a>
                <a href="https://github.com/hwouu/scratch-leaderboard" target="_blank" title="Developer: hwouu"><i class="fab fa-github"></i></a>
                <a href="mailto:nhw3990@gmail.com" title="Contact"><i class="fas fa-envelope"></i></a>
            </div>
            <div class="footer-copyright">&copy; 2025 Scratch Leaderboard</div>
        </footer>`;
}

function renderMobileFooter(footer) {
  footer.innerHTML = `
        <div class="footer-links">
            <a href="https://www.golfzon.com/tournament/glf/view?wtm_code=1197844" target="_blank" title="대회 페이지"><i class="fas fa-trophy"></i></a>
            <a href="https://github.com/hwouu/scratch-leaderboard" target="_blank" title="Developer: hwouu"><i class="fab fa-github"></i></a>
            <a href="mailto:nhw3990@gmail.com" title="Contact"><i class="fas fa-envelope"></i></a>
            <a class="footer-copyright-mobile">&copy; 2025 Scratch Leaderboard</a>
        </div>`;
}

async function initialize(elements) {
  setupEventListeners(elements);
  setActiveTabUI();
  setViewModeUI();
  await fetchAndRender(elements);
  startAutoRefresh(elements);
}

async function fetchAndRender(elements) {
  const spinnerOverlay = document.getElementById("spinner-overlay");
  const refreshButton = document.getElementById("refresh-button");
  spinnerOverlay.classList.remove("hidden");
  if (refreshButton) refreshButton.querySelector("i").classList.add("fa-spin");

  const { success } = await fetchLeaderboardData(currentStage);
  if (success) {
    const leaderboardData = getLeaderboardData();
    elements.lastUpdatedElement.textContent =
      getLastFetchTime().toLocaleTimeString("ko-KR");
    renderContent(elements.contentElement);
    renderTicker(elements.tickerElement, leaderboardData.total);
  } else {
    elements.contentElement.innerHTML = `<div class="error-container"><div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div><h3 class="error-title">데이터 로딩 실패</h3><p class="error-message">데이터를 불러오는 데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.</p></div>`;
  }
  spinnerOverlay.classList.add("hidden");
  if (refreshButton)
    refreshButton.querySelector("i").classList.remove("fa-spin");
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
    .querySelectorAll(".tab-button")
    .forEach((t) =>
      t.classList.toggle("active", t.dataset.target === activeTab)
    );
  const dropdown = document.getElementById("tabs-dropdown");
  if (dropdown) dropdown.value = activeTab;
}

function setViewModeUI() {
  document
    .querySelectorAll(".toggle-btn")
    .forEach((b) => b.classList.remove("active"));
  const currentViewBtn = document.querySelector(
    `.toggle-btn[data-view="${currentViewMode}"]`
  );
  if (currentViewBtn) currentViewBtn.classList.add("active");

  // 커스텀 드롭다운 업데이트
  const dropdownSelected = document.querySelector(
    "#view-dropdown-button .dropdown-selected"
  );
  const dropdownOption = document.querySelector(
    `#view-dropdown-menu .dropdown-option[data-value="${currentViewMode}"]`
  );
  if (dropdownSelected && dropdownOption) {
    dropdownSelected.textContent = dropdownOption.textContent;
  }

  // 드롭다운 옵션 활성화 상태 업데이트
  document
    .querySelectorAll("#view-dropdown-menu .dropdown-option")
    .forEach((opt) => {
      opt.classList.remove("selected");
      if (opt.dataset.value === currentViewMode) {
        opt.classList.add("selected");
      }
    });
}

const formatFinalScore = (score) =>
  score === null || score === undefined
    ? "<span>-</span>"
    : `<span class="final-score">${
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
    : `<span class="score-final">${
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
  } else if (currentViewMode === "distance") {
    renderDistanceView(container, leaderboardData);
  } else if (currentViewMode === "total") {
    // 합산 뷰: 3열 레이아웃으로 표시
    const data = leaderboardData.total || [];
    renderTotalViewThreeColumns(container, data);
  } else if (
    currentViewMode === "courseA" ||
    currentViewMode === "courseB" ||
    currentViewMode === "courseC"
  ) {
    // 뷰 모드에 해당하는 탭 데이터 사용
    const data = leaderboardData[currentViewMode] || [];
    renderLeaderboardView(container, data);
  } else {
    // 기본: activeTab 사용
    const data = leaderboardData[activeTab] || [];
    if (activeTab === "total") {
      renderTotalViewThreeColumns(container, data);
    } else {
      renderLeaderboardView(container, data);
    }
  }
}

function renderEmptyView(container, headers) {
  const headHTML = `<thead><tr>${headers
    .map((h) => `<th class="${h.class || ""}">${h.key}</th>`)
    .join("")}</tr></thead>`;
  const bodyHTML = `<tbody><tr class="placeholder-row"><td colspan="${headers.length}">등록된 데이터가 없습니다.</td></tr></tbody>`;
  container.innerHTML = `<div class="table-container"><table>${headHTML}${bodyHTML}</table></div>`;
}

function renderTotalViewThreeColumns(container, data) {
  if (!data || data.length === 0) {
    container.innerHTML = `<div class="total-three-columns">
      <div class="total-column">
        <table>
          <thead><tr><th>순위</th><th>닉네임</th><th>최종 성적</th></tr></thead>
          <tbody><tr class="placeholder-row"><td colspan="3">등록된 데이터가 없습니다.</td></tr></tbody>
        </table>
      </div>
    </div>`;
    return;
  }

  const leaderboardData = getLeaderboardData();
  const prevData = getPrevLeaderboardData()?.total || [];

  // 합산 탭의 경우 각 코스의 스코어를 가져와야 함
  const getCourseScore = (userId, course) => {
    const courseData = leaderboardData[course] || [];
    const player = courseData.find((p) => p.userId === userId);
    return player ? player.score : null;
  };

  // 상위 30명만 가져오기
  const top30 = data.slice(0, 30);

  // 3개 그룹으로 나누기 (각 10명씩)
  const group1 = top30.slice(0, 10);   // 1~10위
  const group2 = top30.slice(10, 20);   // 11~20위
  const group3 = top30.slice(20, 30);   // 21~30위

  const renderColumn = (group, startRank, endRank) => {
    const headerText = `${startRank}~${endRank}위`;
    
    if (group.length === 0) {
      return `<div class="total-column">
        <h2 class="total-column-title">${headerText}</h2>
        <table>
          <thead><tr><th>순위</th><th>닉네임</th><th>최종 성적</th></tr></thead>
          <tbody><tr class="placeholder-row"><td colspan="3">-</td></tr></tbody>
        </table>
      </div>`;
    }

    const rowsHTML = group.map((player) => {
      const rank = player.tieCount > 1 ? `T${player.rank}` : player.rank;
      const prevPlayer = prevData.find((p) => p.userId === player.userId);
      let rankChangeClass = "";
      if (prevPlayer) {
        if (player.rank < prevPlayer.rank) rankChangeClass = "flash-up";
        else if (player.rank > prevPlayer.rank) rankChangeClass = "flash-down";
      }

      // 보정치 계산
      const totalRevision =
        (player.gradeRevision || 0) +
        (player.systemRevision || 0) +
        (player.genderRevision || 0) +
        (player.roundCountRevision || 0);

      // 최종 성적 계산 (각 코스 스코어 합산 + 보정치)
      const courseAScore = getCourseScore(player.userId, "courseA") || 0;
      const courseBScore = getCourseScore(player.userId, "courseB") || 0;
      const courseCScore = getCourseScore(player.userId, "courseC") || 0;
      const totalCourseScore = courseAScore + courseBScore + courseCScore;
      const finalScore = totalCourseScore + totalRevision;

      return `<tr class="${rankChangeClass}" data-userid="${player.userId}">
        <td class="rank">${rank}</td>
        <td class="nickname">${player.userNickname}<span class="user-id">(${player.userId})</span></td>
        <td>${formatFinalScore(finalScore)}</td>
      </tr>`;
    }).join("");

    return `<div class="total-column">
      <h2 class="total-column-title">${headerText}</h2>
      <table>
        <thead><tr><th>순위</th><th>닉네임</th><th>최종 성적</th></tr></thead>
        <tbody class="clickable">${rowsHTML}</tbody>
      </table>
    </div>`;
  };

  container.innerHTML = `
    <div class="total-three-columns">
      ${renderColumn(group1, 1, 10)}
      ${renderColumn(group2, 11, 20)}
      ${renderColumn(group3, 21, 30)}
    </div>
  `;
}

function renderLeaderboardView(container, data) {
  const headersConfig = {
    total: [
      { key: "순위" },
      { key: "닉네임" },
      { key: "참여매장", class: "mobile-hide" },
      { key: "라운드", class: "mobile-hide" },
      { key: "A", class: "mobile-hide" },
      { key: "B", class: "mobile-hide" },
      { key: "C", class: "mobile-hide" },
      { key: "보정치" },
      { key: "최종 성적" },
    ],
    course: [
      { key: "순위" },
      { key: "닉네임" },
      { key: "참여매장", class: "tablet-hide mobile-hide" },
      { key: "라운드", class: "mobile-hide" },
      { key: "코스 성적", class: "mobile-hide" },
      { key: "실력 등급", class: "mobile-hide" },
      { key: "보정치", class: "mobile-hide" },
      { key: "최종 성적" },
    ],
  };
  // 현재 뷰 모드에 따라 헤더 결정
  let headers;
  if (currentViewMode === "total") {
    headers = headersConfig.total;
  } else if (
    currentViewMode === "courseA" ||
    currentViewMode === "courseB" ||
    currentViewMode === "courseC"
  ) {
    headers = headersConfig.course;
  } else {
    headers =
      activeTab === "total" ? headersConfig.total : headersConfig.course;
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

  // 합산 탭의 경우 각 코스의 스코어를 가져와야 함
  const getCourseScore = (userId, course) => {
    const courseData = leaderboardData[course] || [];
    const player = courseData.find((p) => p.userId === userId);
    return player ? player.score : null;
  };

  const bodyHTML = data
    .map((player) => {
      const rank = player.tieCount > 1 ? `T${player.rank}` : player.rank;
      const prevPlayer = prevData.find((p) => p.userId === player.userId);
      let rankChangeClass = "";
      if (prevPlayer) {
        if (player.rank < prevPlayer.rank) rankChangeClass = "flash-up";
        else if (player.rank > prevPlayer.rank) rankChangeClass = "flash-down";
      }

      // 보정치 계산 (gradeRevision + systemRevision + genderRevision + roundCountRevision)
      const totalRevision =
        (player.gradeRevision || 0) +
        (player.systemRevision || 0) +
        (player.genderRevision || 0) +
        (player.roundCountRevision || 0);
      const revisionDisplay =
        totalRevision > 0 ? `+${totalRevision}` : totalRevision.toString();

      let finalScore;
      if (activeTab === "total") {
        // 합산 탭: 각 코스의 스코어 합산 + 보정치
        const courseAScore = getCourseScore(player.userId, "courseA") || 0;
        const courseBScore = getCourseScore(player.userId, "courseB") || 0;
        const courseCScore = getCourseScore(player.userId, "courseC") || 0;
        const totalCourseScore = courseAScore + courseBScore + courseCScore;
        finalScore = totalCourseScore + totalRevision;
      } else {
        // 코스별 탭: 해당 코스 스코어 + 보정치
        finalScore = (player.score || 0) + totalRevision;
      }

      const rowCells =
        activeTab === "total"
          ? `<td class="rank">${rank}</td>
             <td class="nickname">${
               player.userNickname
             }<span class="user-id">(${
              player.userId
            })</span><span class="shop-name-mobile">${
              player.shopName || ""
            }</span></td>
             <td class="mobile-hide">${player.shopName || ""}</td>
             <td class="mobile-hide">${player.roundCount || "-"}</td>
             <td class="mobile-hide">${formatSimpleScore(
               getCourseScore(player.userId, "courseA")
             )}</td>
             <td class="mobile-hide">${formatSimpleScore(
               getCourseScore(player.userId, "courseB")
             )}</td>
             <td class="mobile-hide">${formatSimpleScore(
               getCourseScore(player.userId, "courseC")
             )}</td>
             <td>${revisionDisplay}</td>
             <td>${formatFinalScore(finalScore)}</td>`
          : `<td class="rank">${rank}</td>
             <td class="nickname">${
               player.userNickname
             }<span class="user-id">(${
              player.userId
            })</span><span class="shop-name-mobile">${
              player.shopName || ""
            }</span></td>
             <td class="tablet-hide mobile-hide">${player.shopName || ""}</td>
             <td class="mobile-hide">${player.roundCount || "-"}</td>
             <td class="mobile-hide">${formatSimpleScore(player.score)}</td>
             <td class="mobile-hide">${formatSkillLevel(player.grade)}</td>
             <td class="mobile-hide">${revisionDisplay}</td>
             <td>${formatFinalScore(finalScore)}</td>`;
      return `<tr class="${rankChangeClass}" data-userid="${player.userId}">${rowCells}</tr>`;
    })
    .join("");
  container.innerHTML = `<div class="table-container"><table>${headHTML}<tbody class="clickable">${bodyHTML}</tbody></table></div>`;
}

function renderCourseRankingsView(container, leaderboardData) {
  const courseA = leaderboardData.courseA || [];
  const courseB = leaderboardData.courseB || [];
  const courseC = leaderboardData.courseC || [];

  const renderCourseSection = (courseData, courseLabel) => {
    if (!courseData || courseData.length === 0) {
      return `
        <div class="course-ranking-section">
          <h3 class="course-ranking-title">${courseLabel}코스</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>순위</th>
                  <th>닉네임</th>
                  <th>최종 성적</th>
                </tr>
              </thead>
              <tbody>
                <tr class="placeholder-row">
                  <td colspan="3">등록된 데이터가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    const headers = [{ key: "순위" }, { key: "닉네임" }, { key: "최종 성적" }];
    const headHTML = `<thead><tr>${headers
      .map((h) => `<th>${h.key}</th>`)
      .join("")}</tr></thead>`;

    const bodyHTML = courseData
      .map((player) => {
        const rank = player.tieCount > 1 ? `T${player.rank}` : player.rank;
        const totalRevision =
          (player.gradeRevision || 0) +
          (player.systemRevision || 0) +
          (player.genderRevision || 0) +
          (player.roundCountRevision || 0);
        const finalScore = (player.score || 0) + totalRevision;

        return `
          <tr data-userid="${player.userId}">
            <td class="rank">${rank}</td>
            <td class="nickname">${player.userNickname}<span class="user-id">(${
          player.userId
        })</span></td>
            <td>${formatFinalScore(finalScore)}</td>
          </tr>
        `;
      })
      .join("");

    return `
      <div class="course-ranking-section">
        <h3 class="course-ranking-title">${courseLabel}코스</h3>
        <div class="table-container">
          <table>
            ${headHTML}
            <tbody class="clickable">${bodyHTML}</tbody>
          </table>
        </div>
      </div>
    `;
  };

  const html = `
    <div class="course-rankings-container">
      ${renderCourseSection(courseA, "A")}
      ${renderCourseSection(courseB, "B")}
      ${renderCourseSection(courseC, "C")}
    </div>
  `;

  container.innerHTML = html;
}

function renderDistanceView(container, leaderboardData) {
  if (!leaderboardData) {
    container.innerHTML = `<div class="table-container"><table><tbody><tr class="placeholder-row"><td colspan="3">데이터를 불러오는 중...</td></tr></tbody></table></div>`;
    return;
  }

  // distance 데이터 파싱 함수
  const getTopPlayers = (dataArray, limit) => {
    if (!dataArray) {
      return { players: [], holeInfo: null };
    }
    
    let items = [];
    let holeInfo = null;
    
    if (Array.isArray(dataArray)) {
      items = dataArray;
    } else if (dataArray && typeof dataArray === 'object') {
      if (Array.isArray(dataArray.ranks)) {
        items = dataArray.ranks;
        holeInfo = {
          courseName: dataArray.courseName || "",
          holeNo: dataArray.holeNo || null,
        };
      } else if (Array.isArray(dataArray.data)) {
        items = dataArray.data;
      } else if (Array.isArray(dataArray.items)) {
        items = dataArray.items;
      } else {
        return { players: [], holeInfo: null };
      }
    } else {
      return { players: [], holeInfo: null };
    }
    
    if (items.length === 0) {
      return { players: [], holeInfo: holeInfo };
    }
    
    const players = items.slice(0, limit).map((player) => {
      const rank = player.rank || player.rankNo || player.rankNum || "-";
      const nickname = player.userNickname || player.nickname || player.userName || player.name || "-";
      const distance = player.distance || player.dist || player.yard || player.distanceValue || player.cm || 0;
      const gender = player.gender || player.genderCode || player.sex || null;
      
      return {
        rank: rank,
        nickname: nickname,
        userId: player.userId || "",
        distance: distance,
        gender: gender,
      };
    });
    
    return { players, holeInfo };
  };

  // 각 코스별 니어 데이터 가져오기 (5명)
  const courseA_nearest = getTopPlayers(leaderboardData.courseA_nearest, 5);
  const courseB_nearest = getTopPlayers(leaderboardData.courseB_nearest, 5);
  const courseC_nearest = getTopPlayers(leaderboardData.courseC_nearest, 5);

  // 각 코스별 롱기(남) 데이터 가져오기 (3명)
  let courseA_longest_male = getTopPlayers(leaderboardData.courseA_longest_male, 3);
  let courseB_longest_male = getTopPlayers(leaderboardData.courseB_longest_male, 3);
  let courseC_longest_male = getTopPlayers(leaderboardData.courseC_longest_male, 3);
  
  // gender 파라미터로 필터링된 데이터가 없으면 전체 데이터에서 필터링 시도
  if ((!courseA_longest_male.players || courseA_longest_male.players.length === 0) && leaderboardData.courseA_longest) {
    const allA = getTopPlayers(leaderboardData.courseA_longest, 100);
    if (allA.players && allA.players.length > 0) {
      const filtered = allA.players
        .filter((p) => {
          const gender = p.gender;
          return gender === 1 || gender === '1' || gender === 'M' || gender === 'male';
        })
        .slice(0, 3);
      courseA_longest_male = { players: filtered, holeInfo: allA.holeInfo };
    }
  }
  
  if ((!courseB_longest_male.players || courseB_longest_male.players.length === 0) && leaderboardData.courseB_longest) {
    const allB = getTopPlayers(leaderboardData.courseB_longest, 100);
    if (allB.players && allB.players.length > 0) {
      const filtered = allB.players
        .filter((p) => {
          const gender = p.gender;
          return gender === 1 || gender === '1' || gender === 'M' || gender === 'male';
        })
        .slice(0, 3);
      courseB_longest_male = { players: filtered, holeInfo: allB.holeInfo };
    }
  }
  
  if ((!courseC_longest_male.players || courseC_longest_male.players.length === 0) && leaderboardData.courseC_longest) {
    const allC = getTopPlayers(leaderboardData.courseC_longest, 100);
    if (allC.players && allC.players.length > 0) {
      const filtered = allC.players
        .filter((p) => {
          const gender = p.gender;
          return gender === 1 || gender === '1' || gender === 'M' || gender === 'male';
        })
        .slice(0, 3);
      courseC_longest_male = { players: filtered, holeInfo: allC.holeInfo };
    }
  }

  // 각 코스별 롱기(여) 데이터 가져오기 (3명)
  let courseA_longest_female = getTopPlayers(leaderboardData.courseA_longest_female, 3);
  let courseB_longest_female = getTopPlayers(leaderboardData.courseB_longest_female, 3);
  let courseC_longest_female = getTopPlayers(leaderboardData.courseC_longest_female, 3);
  
  // gender 파라미터로 필터링된 데이터가 없으면 전체 데이터에서 필터링 시도
  if ((!courseA_longest_female.players || courseA_longest_female.players.length === 0) && leaderboardData.courseA_longest) {
    const allA = getTopPlayers(leaderboardData.courseA_longest, 100);
    if (allA.players && allA.players.length > 0) {
      const filtered = allA.players
        .filter((p) => {
          const gender = p.gender;
          return gender === 2 || gender === '2' || gender === 'F' || gender === 'female';
        })
        .slice(0, 3);
      courseA_longest_female = { players: filtered, holeInfo: allA.holeInfo };
    }
  }
  
  if ((!courseB_longest_female.players || courseB_longest_female.players.length === 0) && leaderboardData.courseB_longest) {
    const allB = getTopPlayers(leaderboardData.courseB_longest, 100);
    if (allB.players && allB.players.length > 0) {
      const filtered = allB.players
        .filter((p) => {
          const gender = p.gender;
          return gender === 2 || gender === '2' || gender === 'F' || gender === 'female';
        })
        .slice(0, 3);
      courseB_longest_female = { players: filtered, holeInfo: allB.holeInfo };
    }
  }
  
  if ((!courseC_longest_female.players || courseC_longest_female.players.length === 0) && leaderboardData.courseC_longest) {
    const allC = getTopPlayers(leaderboardData.courseC_longest, 100);
    if (allC.players && allC.players.length > 0) {
      const filtered = allC.players
        .filter((p) => {
          const gender = p.gender;
          return gender === 2 || gender === '2' || gender === 'F' || gender === 'female';
        })
        .slice(0, 3);
      courseC_longest_female = { players: filtered, holeInfo: allC.holeInfo };
    }
  }

  // 거리 포맷팅 함수 (롱기: m, 니어: m, 소수점 2자리)
  const formatDistance = (distance) => {
    if (distance === "-" || distance === null || distance === undefined || distance === 0) {
      return "-";
    }
    if (typeof distance === 'number') {
      const rounded = Math.round(distance * 100) / 100; // 소수점 2자리 반올림
      return `${rounded}m`;
    }
    return String(distance);
  };

  // 테이블 렌더링 함수
  const renderTable = (players, title, holeInfo) => {
    if (!players || players.length === 0) {
      return `<div class="distance-table-section">
        <h3 class="distance-section-title">${title}${holeInfo}</h3>
        <div class="table-container">
          <table>
            <thead><tr><th>순위</th><th>닉네임</th><th>기록</th></tr></thead>
            <tbody><tr class="placeholder-row"><td colspan="3">데이터 없음</td></tr></tbody>
          </table>
        </div>
      </div>`;
    }

    const rowsHTML = players.map((player) => {
      const distanceText = formatDistance(player.distance);
      return `<tr data-userid="${player.userId}">
        <td class="rank">${player.rank}</td>
        <td class="nickname">${player.nickname}<span class="user-id">(${player.userId})</span></td>
        <td>${distanceText}</td>
      </tr>`;
    }).join("");

    return `<div class="distance-table-section">
      <h3 class="distance-section-title">${title}${holeInfo}</h3>
      <div class="table-container">
        <table>
          <thead><tr><th>순위</th><th>닉네임</th><th>기록</th></tr></thead>
          <tbody class="clickable">${rowsHTML}</tbody>
        </table>
      </div>
    </div>`;
  };

  // 코스별 섹션 렌더링
  const renderCourseSection = (courseLabel, nearestData, longestMaleData, longestFemaleData) => {
    const holeInfoText_nearest = nearestData.holeInfo && nearestData.holeInfo.courseName && nearestData.holeInfo.holeNo
      ? ` (${nearestData.holeInfo.courseName} ${nearestData.holeInfo.holeNo}H)`
      : "";
    const holeInfoText_longest_male = longestMaleData.holeInfo && longestMaleData.holeInfo.courseName && longestMaleData.holeInfo.holeNo
      ? ` (${longestMaleData.holeInfo.courseName} ${longestMaleData.holeInfo.holeNo}H)`
      : "";
    const holeInfoText_longest_female = longestFemaleData.holeInfo && longestFemaleData.holeInfo.courseName && longestFemaleData.holeInfo.holeNo
      ? ` (${longestFemaleData.holeInfo.courseName} ${longestFemaleData.holeInfo.holeNo}H)`
      : "";

    return {
      courseLabel: courseLabel,
      nearest: renderTable(nearestData.players, "니어리스트", holeInfoText_nearest),
      longestMale: renderTable(longestMaleData.players, "롱기스트(남)", holeInfoText_longest_male),
      longestFemale: renderTable(longestFemaleData.players, "롱기스트(여)", holeInfoText_longest_female),
    };
  };

  // 1:1:1 레이아웃으로 구성: 니어 | 롱기(남) | 롱기(여)
  container.innerHTML = `
    <div class="distance-container-three-columns">
      <!-- 니어 섹션 -->
      <div class="distance-award-column">
        <h2 class="distance-award-title">코스별 니어</h2>
        <div class="distance-courses-vertical">
          <div class="distance-course-section">
            <h3 class="distance-course-title">A코스</h3>
            ${renderTable(courseA_nearest.players, "니어리스트", courseA_nearest.holeInfo && courseA_nearest.holeInfo.courseName && courseA_nearest.holeInfo.holeNo ? ` (${courseA_nearest.holeInfo.courseName} ${courseA_nearest.holeInfo.holeNo}H)` : "")}
          </div>
          <div class="distance-course-section">
            <h3 class="distance-course-title">B코스</h3>
            ${renderTable(courseB_nearest.players, "니어리스트", courseB_nearest.holeInfo && courseB_nearest.holeInfo.courseName && courseB_nearest.holeInfo.holeNo ? ` (${courseB_nearest.holeInfo.courseName} ${courseB_nearest.holeInfo.holeNo}H)` : "")}
          </div>
          <div class="distance-course-section">
            <h3 class="distance-course-title">C코스</h3>
            ${renderTable(courseC_nearest.players, "니어리스트", courseC_nearest.holeInfo && courseC_nearest.holeInfo.courseName && courseC_nearest.holeInfo.holeNo ? ` (${courseC_nearest.holeInfo.courseName} ${courseC_nearest.holeInfo.holeNo}H)` : "")}
          </div>
        </div>
      </div>

      <!-- 롱기(남) 섹션 -->
      <div class="distance-award-column">
        <h2 class="distance-award-title">코스별 롱기(남)</h2>
        <div class="distance-courses-vertical">
          <div class="distance-course-section">
            <h3 class="distance-course-title">A코스</h3>
            ${renderTable(courseA_longest_male.players, "롱기스트(남)", courseA_longest_male.holeInfo && courseA_longest_male.holeInfo.courseName && courseA_longest_male.holeInfo.holeNo ? ` (${courseA_longest_male.holeInfo.courseName} ${courseA_longest_male.holeInfo.holeNo}H)` : "")}
          </div>
          <div class="distance-course-section">
            <h3 class="distance-course-title">B코스</h3>
            ${renderTable(courseB_longest_male.players, "롱기스트(남)", courseB_longest_male.holeInfo && courseB_longest_male.holeInfo.courseName && courseB_longest_male.holeInfo.holeNo ? ` (${courseB_longest_male.holeInfo.courseName} ${courseB_longest_male.holeInfo.holeNo}H)` : "")}
          </div>
          <div class="distance-course-section">
            <h3 class="distance-course-title">C코스</h3>
            ${renderTable(courseC_longest_male.players, "롱기스트(남)", courseC_longest_male.holeInfo && courseC_longest_male.holeInfo.courseName && courseC_longest_male.holeInfo.holeNo ? ` (${courseC_longest_male.holeInfo.courseName} ${courseC_longest_male.holeInfo.holeNo}H)` : "")}
          </div>
        </div>
      </div>

      <!-- 롱기(여) 섹션 -->
      <div class="distance-award-column">
        <h2 class="distance-award-title">코스별 롱기(여)</h2>
        <div class="distance-courses-vertical">
          <div class="distance-course-section">
            <h3 class="distance-course-title">A코스</h3>
            ${renderTable(courseA_longest_female.players, "롱기스트(여)", courseA_longest_female.holeInfo && courseA_longest_female.holeInfo.courseName && courseA_longest_female.holeInfo.holeNo ? ` (${courseA_longest_female.holeInfo.courseName} ${courseA_longest_female.holeInfo.holeNo}H)` : "")}
          </div>
          <div class="distance-course-section">
            <h3 class="distance-course-title">B코스</h3>
            ${renderTable(courseB_longest_female.players, "롱기스트(여)", courseB_longest_female.holeInfo && courseB_longest_female.holeInfo.courseName && courseB_longest_female.holeInfo.holeNo ? ` (${courseB_longest_female.holeInfo.courseName} ${courseB_longest_female.holeInfo.holeNo}H)` : "")}
          </div>
          <div class="distance-course-section">
            <h3 class="distance-course-title">C코스</h3>
            ${renderTable(courseC_longest_female.players, "롱기스트(여)", courseC_longest_female.holeInfo && courseC_longest_female.holeInfo.courseName && courseC_longest_female.holeInfo.holeNo ? ` (${courseC_longest_female.holeInfo.courseName} ${courseC_longest_female.holeInfo.holeNo}H)` : "")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTicker(element, data) {
  const tickerWrap = document.querySelector(".ticker-wrap");

  // 티커는 항상 표시
  if (tickerWrap) tickerWrap.style.display = "block";

  // 데이터가 없거나 업데이트되지 않았을 때 기본 메시지 표시
  if (!data || data.length === 0) {
    const defaultMessage = `<span class="ticker-emoji">🎁</span><span class="ticker-text-bold">스크래치 OPEN 4th</span><span class="ticker-separator">|</span><span class="ticker-text-bold">스크래치 선물 팡팡</span><span class="ticker-separator">|</span><span class="ticker-text-normal">연말연시를 맞이하여 고객분들께 감사의 선물을 드립니다</span><span class="ticker-emoji">🎉</span><span class="ticker-separator">|</span><span class="ticker-text-normal">올해도 저희 스크래치를 찾아주신 여러분께 감사드립니다</span><span class="ticker-emoji">🙏</span>`;
    element.innerHTML =
      `<div class="ticker-item">${defaultMessage}</div>`.repeat(2);
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
      // 최종 성적 계산 (각 코스 스코어 합산 + 보정치)
      const courseAScore = getCourseScore(p.userId, "courseA") || 0;
      const courseBScore = getCourseScore(p.userId, "courseB") || 0;
      const courseCScore = getCourseScore(p.userId, "courseC") || 0;
      const totalCourseScore = courseAScore + courseBScore + courseCScore;
      const totalRevision =
        (p.gradeRevision || 0) +
        (p.systemRevision || 0) +
        (p.genderRevision || 0) +
        (p.roundCountRevision || 0);
      const finalScore = totalCourseScore + totalRevision;
      return `<div class="ticker-item"><span class="rank">${rank}</span><span class="name">${
        p.userNickname
      }</span><span class="score">${formatTickerScore(
        finalScore
      )}</span></div>`;
    })
    .join("");
  element.innerHTML = tickerContent.repeat(2);
}

function renderHighlights(element, data) {
  if (!element) return;
  
  const leaderboardData = getLeaderboardData();
  if (!leaderboardData) {
    element.innerHTML = "";
    return;
  }


  // 코스별 니어/롱기 데이터 가져오기
  const getTopThree = (dataArray, courseLabel, type) => {
    if (!dataArray) {
      return { players: [], holeInfo: null };
    }
    
    // API 응답 형식: { courseName: "...", holeNo: X, ranks: [...] }
    let items = [];
    let holeInfo = null;
    
    if (Array.isArray(dataArray)) {
      items = dataArray;
    } else if (dataArray && typeof dataArray === 'object') {
      // distance API 형식: { courseName, holeNo, ranks: [...] }
      if (Array.isArray(dataArray.ranks)) {
        items = dataArray.ranks;
        holeInfo = {
          courseName: dataArray.courseName || "",
          holeNo: dataArray.holeNo || null,
        };
      } else if (Array.isArray(dataArray.data)) {
        items = dataArray.data;
      } else if (Array.isArray(dataArray.items)) {
        items = dataArray.items;
      } else {
        return { players: [], holeInfo: null };
      }
    } else {
      return { players: [], holeInfo: null };
    }
    
    if (items.length === 0) {
      return { players: [], holeInfo: holeInfo };
    }
    
    const players = items.slice(0, 3).map((player, index) => {
      // rank는 API에서 제공하거나 인덱스 기반으로 계산
      const rank = player.rank || player.rankNo || player.rankNum || (index + 1);
      const nickname = player.userNickname || player.nickname || player.userName || player.name || "-";
      // distance 필드명 확인 (dist, distance, yard 등 가능)
      const distance = player.distance || player.dist || player.yard || player.distanceValue || player.cm || "-";
      
      return {
        rank: rank,
        nickname: nickname,
        distance: distance,
        course: courseLabel,
        type: type,
      };
    });
    
    return { players, holeInfo };
  };

  // 각 코스별 니어/롱기 상위 3명 가져오기
  const courseA_nearest = getTopThree(leaderboardData.courseA_nearest, "A", "니어");
  const courseA_longest = getTopThree(leaderboardData.courseA_longest, "A", "롱기");
  const courseB_nearest = getTopThree(leaderboardData.courseB_nearest, "B", "니어");
  const courseB_longest = getTopThree(leaderboardData.courseB_longest, "B", "롱기");
  const courseC_nearest = getTopThree(leaderboardData.courseC_nearest, "C", "니어");
  const courseC_longest = getTopThree(leaderboardData.courseC_longest, "C", "롱기");


  const renderCourseSection = (data, courseLabel, type) => {
    const players = data.players || [];
    const holeInfo = data.holeInfo || {};
    const courseName = holeInfo.courseName || "";
    const holeNo = holeInfo.holeNo || null;
    
    // 홀 정보 포맷팅 (예: "VALLEY 1H" 또는 "어등 5H")
    const holeInfoText = courseName && holeNo 
      ? ` (${courseName} ${holeNo}H)` 
      : "";
    
    if (!players || players.length === 0) {
      return `<div class="highlight-course-section">
        <div class="highlight-course-title">${courseLabel}코스 ${type}${holeInfoText}</div>
        <div class="highlight-course-empty">데이터 없음</div>
      </div>`;
    }
    
    const playersHTML = players.map((player) => {
      return `<div class="highlight-player-item">
        <span class="highlight-player-rank">${player.rank}위</span>
        <span class="highlight-player-name">${player.nickname}</span>
      </div>`;
    }).join("");

    return `<div class="highlight-course-section">
      <div class="highlight-course-title">${courseLabel}코스 ${type}${holeInfoText}</div>
      <div class="highlight-players-list">${playersHTML}</div>
    </div>`;
  };

  // 니어리스트와 롱기스트 그룹화
  const renderNearestSection = () => {
    const hasData = (courseA_nearest.players && courseA_nearest.players.length > 0) || 
                    (courseB_nearest.players && courseB_nearest.players.length > 0) || 
                    (courseC_nearest.players && courseC_nearest.players.length > 0);
    if (!hasData) {
      return `<div class="highlight-item">
        <div class="highlight-title">니어리스트</div>
        <div class="highlight-value">데이터 없음</div>
      </div>`;
    }
    
    return `<div class="highlight-item">
      <div class="highlight-title">니어리스트</div>
      ${renderCourseSection(courseA_nearest, "A", "니어")}
      ${renderCourseSection(courseB_nearest, "B", "니어")}
      ${renderCourseSection(courseC_nearest, "C", "니어")}
    </div>`;
  };

  const renderLongestSection = () => {
    const hasData = (courseA_longest.players && courseA_longest.players.length > 0) || 
                    (courseB_longest.players && courseB_longest.players.length > 0) || 
                    (courseC_longest.players && courseC_longest.players.length > 0);
    if (!hasData) {
      return `<div class="highlight-item">
        <div class="highlight-title">롱기스트</div>
        <div class="highlight-value">데이터 없음</div>
      </div>`;
    }
    
    return `<div class="highlight-item">
      <div class="highlight-title">롱기스트</div>
      ${renderCourseSection(courseA_longest, "A", "롱기")}
      ${renderCourseSection(courseB_longest, "B", "롱기")}
      ${renderCourseSection(courseC_longest, "C", "롱기")}
    </div>`;
  };

  element.innerHTML = `
    ${renderNearestSection()}
    ${renderLongestSection()}
  `;
}

function setupEventListeners(elements) {
  const { contentElement, searchModal, overviewModal } = elements;

  document.getElementById("refresh-button").addEventListener("click", () => {
    fetchAndRender(elements);
  });

  document.getElementById("sidebar-toggle").addEventListener("click", () => {
    const mainGrid = document.getElementById("main-grid");
    isSidebarCollapsed = !isSidebarCollapsed;
    localStorage.setItem("isSidebarCollapsed", isSidebarCollapsed);
    mainGrid.classList.toggle("sidebar-collapsed", isSidebarCollapsed);
  });

  const viewToggleMain = document.getElementById("view-toggle-main");
  const viewToggleCourses = document.getElementById("view-toggle-courses");

  [viewToggleMain, viewToggleCourses].forEach((container) => {
    if (container) {
      container.addEventListener("click", (e) => {
        const btn = e.target.closest(".toggle-btn");
        if (btn) {
          currentViewMode = btn.dataset.view;
          localStorage.setItem("currentViewMode-4th", currentViewMode);
          setViewModeUI();
          renderContent(contentElement);
        }
      });
    }
  });

  // 커스텀 드롭다운 이벤트 리스너
  const dropdownButton = document.getElementById("view-dropdown-button");
  const dropdownMenu = document.getElementById("view-dropdown-menu");
  const dropdownSelected = dropdownButton?.querySelector(".dropdown-selected");
  const dropdownOptions = dropdownMenu?.querySelectorAll(".dropdown-option");

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
        localStorage.setItem("currentViewMode-4th", currentViewMode);

        if (dropdownSelected) dropdownSelected.textContent = text;
        dropdownMenu.classList.remove("active");
        dropdownButton.classList.remove("active");

        setViewModeUI();
        renderContent(contentElement);
      });
    });

    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener("click", (e) => {
      if (
        !dropdownButton.contains(e.target) &&
        !dropdownMenu.contains(e.target)
      ) {
        dropdownMenu.classList.remove("active");
        dropdownButton.classList.remove("active");
      }
    });
  }

  const searchInput = document.getElementById("search-input");
  const openModal = (modal) => modal.classList.add("active");

  document
    .getElementById("search-button")
    .addEventListener("click", () =>
      handleSearch(searchInput, searchModal, openModal)
    );
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") handleSearch(searchInput, searchModal, openModal);
  });

  document
    .getElementById("overview-button")
    .addEventListener("click", () => openModal(overviewModal));

  // V2 프로모션 토스트 이벤트 리스너
  const v2PromotionToast = document.getElementById("v2-promotion-toast");
  const v2PromotionButton = document.getElementById("v2-promotion-button");
  const v2PromotionClose = document.getElementById("v2-promotion-close");

  // localStorage에서 토스트 표시 여부 확인
  const shouldShowToast = localStorage.getItem("v2-promotion-dismissed") !== "true";
  
  // V2 프로모션 토스트 표시 비활성화
  // if (shouldShowToast && v2PromotionToast) {
  //   // 페이지 로드 후 3초 뒤에 토스트 표시
  //   setTimeout(() => {
  //     v2PromotionToast.classList.add("show");
  //   }, 3000);
  // }

  if (v2PromotionButton) {
    v2PromotionButton.addEventListener("click", () => {
      window.location.href = "/v2/4th-open";
    });
  }

  if (v2PromotionClose) {
    v2PromotionClose.addEventListener("click", () => {
      v2PromotionToast.classList.remove("show");
      localStorage.setItem("v2-promotion-dismissed", "true");
    });
  }

  [searchModal, overviewModal].forEach((modal) => {
    if (modal) {
      const closeModal = () => modal.classList.remove("active");
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
      modal
        .querySelector(".modal-close-button")
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
    const modalBody = modal.querySelector("#modal-body");
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
    (player.genderRevision || 0) +
    (player.roundCountRevision || 0);

  // 합산 성적 계산 (각 코스 스코어 합산 + 보정치)
  const courseAScore = courseAData?.score || 0;
  const courseBScore = courseBData?.score || 0;
  const courseCScore = courseCData?.score || 0;
  const totalCourseScore = courseAScore + courseBScore + courseCScore;
  const finalScore = totalCourseScore + totalRevision;

  const detailsHTML = `
        <div class="search-result-item"><span class="result-label">순위</span><span class="result-value rank">${rank}</span></div>
        <div class="search-result-item"><span class="result-label">참여 매장</span><span class="result-value">${
          player.shopName || "-"
        }</span></div>
        <div class="search-result-item"><span class="result-label">라운드</span><span class="result-value">${
          totalRounds || "-"
        }</span></div>
        <div class="search-result-item"><span class="result-label">A코스</span><span class="result-value">${formatSimpleScore(
          courseAData?.score
        )}</span></div>
        <div class="search-result-item"><span class="result-label">B코스</span><span class="result-value">${formatSimpleScore(
          courseBData?.score
        )}</span></div>
        <div class="search-result-item"><span class="result-label">C코스</span><span class="result-value">${formatSimpleScore(
          courseCData?.score
        )}</span></div>
        <div class="search-result-item"><span class="result-label">실력 등급</span><span class="result-value">${formatSkillLevel(
          player.grade ||
            courseAData?.grade ||
            courseBData?.grade ||
            courseCData?.grade
        )}</span></div>
        <div class="search-result-item"><span class="result-label">보정치</span><span class="result-value">${
          totalRevision > 0 ? `+${totalRevision}` : totalRevision
        }</span></div>
        <div class="search-result-item"><span class="result-label">최종 성적</span><span class="result-value final-score">${formatSimpleScore(
          finalScore
        )}</span></div>`;

  const modalBody = modal.querySelector("#modal-body");
  modalBody.innerHTML = `<h3 class="modal-body-title">${player.userNickname} (${player.userId})</h3>${detailsHTML}`;
  openCallback(modal);
}
