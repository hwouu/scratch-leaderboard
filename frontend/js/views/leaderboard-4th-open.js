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
    highlightContentElement: document.getElementById("highlight-content"),
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

  const tabsHTML = `
    <button class="tab-button" data-target="total">합산 성적</button>
    <button class="tab-button" data-target="courseA">A코스</button>
    <button class="tab-button" data-target="courseB">B코스</button>
    <button class="tab-button" data-target="courseC">C코스</button>
  `;

  const dropdownHTML = `
    <select id="tabs-dropdown">
        <option value="total">합산 성적</option>
        <option value="courseA">A코스</option>
        <option value="courseB">B코스</option>
        <option value="courseC">C코스</option>
    </select>
  `;

  header.innerHTML = `
        <div class="title-container">
            <div class="title-group">
                <h1>LEADER BOARD</h1>
                <span class="live-indicator">LIVE</span>
            </div>
            <div class="subtitle">
                <span class="subtitle-text">${tournamentInfo.name}</span>
                <span class="last-updated">마지막 업데이트: <span id="last-updated-time"></span></span>
            </div>
        </div>
        <div class="header-controls-row">
            <div class="header-center">
                <div class="tabs desktop-show">${tabsHTML}</div>
                <div class="tabs-dropdown-container mobile-show">${dropdownHTML}</div>
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
            <div class="info-group">
                <span class="info-label">코스 정보</span>
                <ul class="store-list">
                    <li><strong>A코스:</strong> ${tournamentInfo.courses.A}</li>
                    <li><strong>B코스:</strong> ${tournamentInfo.courses.B}</li>
                    <li><strong>C코스:</strong> ${tournamentInfo.courses.C}</li>
                </ul>
            </div>
        </div>
        <div class="highlight-panel">
            <h2>대회 하이라이트</h2>
            <div id="highlight-content"></div>
        </div>
        <footer class="desktop-footer">
            <div class="footer-links">
                <a href="https://www.golfzon.com/tournament/v2/view?tournamentId=1199912" target="_blank" title="Data from Golfzon"><i class="fas fa-database"></i></a>
                <a href="https://github.com/hwouu/scratch-leaderboard" target="_blank" title="Developer: hwouu"><i class="fab fa-github"></i></a>
                <a href="mailto:nhw3990@gmail.com" title="Contact"><i class="fas fa-envelope"></i></a>
            </div>
            <div class="footer-copyright">&copy; 2025 Scratch Leaderboard</div>
        </footer>`;
}

function renderMobileFooter(footer) {
  footer.innerHTML = `
        <div class="footer-links">
            <a href="https://www.golfzon.com/tournament/v2/view?tournamentId=1199912" target="_blank" title="Data from Golfzon"><i class="fas fa-database"></i></a>
            <a href="https://github.com/hwouu/scratch-leaderboard" target="_blank" title="Developer: hwouu"><i class="fab fa-github"></i></a>
            <a href="mailto:nhw3990@gmail.com" title="Contact"><i class="fas fa-envelope"></i></a>
            <a class="footer-copyright-mobile">&copy; 2025 Scratch Leaderboard</a>
        </div>`;
}

async function initialize(elements) {
  setupEventListeners(elements);
  setActiveTabUI();
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
    renderHighlights(elements.highlightContentElement, leaderboardData.total);
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
  const data = leaderboardData[activeTab] || [];
  renderLeaderboardView(container, data);
}

function renderEmptyView(container, headers) {
  const headHTML = `<thead><tr>${headers
    .map((h) => `<th class="${h.class || ""}">${h.key}</th>`)
    .join("")}</tr></thead>`;
  const bodyHTML = `<tbody><tr class="placeholder-row"><td colspan="${headers.length}">등록된 데이터가 없습니다.</td></tr></tbody>`;
  container.innerHTML = `<div class="table-container"><table>${headHTML}${bodyHTML}</table></div>`;
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
      { key: "코스 성적" },
      { key: "실력 등급", class: "mobile-hide" },
      { key: "보정치" },
      { key: "최종 성적" },
    ],
  };
  const headers =
    activeTab === "total" ? headersConfig.total : headersConfig.course;

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

      // 보정치 계산 (gradeRevision + systemRevision + genderRevision)
      const totalRevision =
        (player.gradeRevision || 0) +
        (player.systemRevision || 0) +
        (player.genderRevision || 0);
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
             <td class="mobile-hide">${formatSimpleScore(getCourseScore(player.userId, "courseA"))}</td>
             <td class="mobile-hide">${formatSimpleScore(getCourseScore(player.userId, "courseB"))}</td>
             <td class="mobile-hide">${formatSimpleScore(getCourseScore(player.userId, "courseC"))}</td>
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
             <td>${formatSimpleScore(player.score)}</td>
             <td class="mobile-hide">${formatSkillLevel(player.grade)}</td>
             <td>${revisionDisplay}</td>
             <td>${formatFinalScore(finalScore)}</td>`;
      return `<tr class="${rankChangeClass}" data-userid="${player.userId}">${rowCells}</tr>`;
    })
    .join("");
  container.innerHTML = `<div class="table-container"><table>${headHTML}<tbody class="clickable">${bodyHTML}</tbody></table></div>`;
}

function renderTicker(element, data) {
  if (!data || data.length === 0) {
    element.innerHTML = "";
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
        (p.genderRevision || 0);
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
  
  // 최종 성적 기준으로 정렬 (각 코스 스코어 합산 + 보정치)
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
    element.innerHTML = `<div class="highlight-item"><div class="highlight-title">최고 성적</div><div class="highlight-value">${
      best.userNickname
    }: ${formatSimpleScore(
      best.finalScore
    )}</div></div><div class="highlight-item"><div class="highlight-title">최다 라운드</div><div class="highlight-value">${
      most.userNickname
    }: ${most.roundCount || 0}회</div></div>`;
  }
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

  document.querySelector(".tabs").addEventListener("click", (e) => {
    if (e.target.classList.contains("tab-button")) {
      activeTab = e.target.dataset.target;
      localStorage.setItem("activeTab-4th", activeTab);
      setActiveTabUI();
      renderContent(contentElement);
    }
  });

  document.getElementById("tabs-dropdown").addEventListener("change", (e) => {
    activeTab = e.target.value;
    localStorage.setItem("activeTab-4th", activeTab);
    setActiveTabUI();
    renderContent(contentElement);
  });

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
    (player.genderRevision || 0);
  
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
          player.grade || courseAData?.grade || courseBData?.grade || courseCData?.grade
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

