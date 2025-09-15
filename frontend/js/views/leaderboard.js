import {
  fetchLeaderboardData,
  getLeaderboardData,
  getPrevLeaderboardData,
  getAllPlayers,
  getLastFetchTime,
} from "../services/api.js";

// --- 상태 변수 ---
let currentStage = "qualifying";
let activeTab = localStorage.getItem("activeTab") || "total";
let currentViewMode = localStorage.getItem("currentViewMode") || "leaderboard";
let isSidebarCollapsed = localStorage.getItem("isSidebarCollapsed") === "true";
let refreshIntervalId = null;
const REFRESH_INTERVAL_MS = 300000; // 5분

const tournamentSchedule = [
  { name: "[예선전]", start: "2025-09-01", end: "2025-09-14" },
  { name: "[32강]", start: "2025-09-15", end: "2025-09-18" },
  { name: "[16강]", start: "2025-09-19", end: "2025-09-22" },
  { name: "[8강]", start: "2025-09-23", end: "2025-09-26" },
  { name: "[4강]", start: "2025-09-27", end: "2025-09-30" },
  { name: "[결승/3위전]", start: "2025-10-01", end: "2025-10-04" },
];

const courseInfoByDate = {
  예선: ["김제 스파힐스 CC", "사츠마 골프리조트", "지산 CC - 동/남"],
  "32강": ["오투 골프&리조트 - 함백/태백", "해피니스 CC - HIDDEN/HEALING"],
  "16강": ["피닉스 골드 골프 방콕", "라오라오베이 골프 리조트 - EAST"],
  "8강": ["이천 실크밸리 GC - SILK/VALLEY", "스톤비치 CC"],
  준결승: ["로드힐스 골프&리조트 - 힐스/로드", "알파인 골프리조트 치앙마이"],
  결승: ["이글릿지 CC - 닉팔도", "광주 무등 GGC"],
};

const stageNames = {
  qualifying: "예선전",
  32: "32강",
  16: "16강",
  8: "8강",
  4: "4강",
  final: "결승",
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
      <img src="/assets/tournament-overview.png" alt="대회 개요 포스터"
           onerror="this.onerror=null;this.src='https://placehold.co/800x1131/1a1c1e/eaeaea?text=Image%20Not%20Found';" />
    </div>
  </div>
  <div id="full-bracket-modal" class="modal-overlay">
    <div class="modal-content wide-modal">
      <button class="modal-close-button">&times;</button>
      <div id="full-bracket-content"></div>
    </div>
  </div>
`;

/**
 * 리더보드 페이지의 전체 구조를 렌더링하고 초기화합니다.
 * @param {string} stage - 렌더링할 스테이지 (e.g., 'qualifying', '32')
 * @param {HTMLElement} app - 앱의 루트 요소
 */
export function renderLeaderboardPage(stage, app) {
  currentStage = stage;
  app.innerHTML = leaderboardPageHTML;

  renderHeader(app.querySelector("header"), stage);
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
    scheduleListElement: document.getElementById("dynamic-schedule-list"),
    courseListElement: document.getElementById("dynamic-course-list"),
    mobileScheduleInfo: document.getElementById("mobile-schedule-info"),
    searchModal: document.getElementById("search-modal"),
    overviewModal: document.getElementById("overview-modal"),
  };

  initialize(elements, stage);
}

// --- 템플릿 렌더링 함수들 ---
function renderHeader(header, stage) {
  const currentTheme = localStorage.getItem("theme") || "dark";
  const themeIconClass =
    currentTheme === "light" ? "fas fa-moon" : "fa-regular fa-sun";

  const tabsHTML = `
    <button class="tab-button" data-target="total">합산</button>
    <button class="tab-button" data-target="courseA">A코스</button>
    <button class="tab-button" data-target="courseB">B코스</button>
    ${
      stage === "qualifying"
        ? '<button class="tab-button" data-target="courseC">C코스</button>'
        : ""
    }
  `;

  const dropdownHTML = `
    <select id="tabs-dropdown">
        <option value="total">합산</option>
        <option value="courseA">A코스</option>
        <option value="courseB">B코스</option>
        ${
          stage === "qualifying" ? '<option value="courseC">C코스</option>' : ""
        }
    </select>
  `;

  const bracketToggleHTML =
    stage !== "qualifying"
      ? `<button class="toggle-btn" data-view="bracket" title="대진표 보기"><i class="fas fa-sitemap"></i></button>`
      : "";

  header.innerHTML = `
        <div class="title-container">
            <div class="title-group">
                <h1>LEADER BOARD</h1>
                <span class="live-indicator">LIVE</span>
            </div>
            <div class="subtitle">
                <span class="subtitle-text">골목대장 토너먼트 1st - ${
                  stageNames[stage] || "토너먼트"
                }</span>
                <span class="last-updated">마지막 업데이트: <span id="last-updated-time"></span></span>
            </div>
            <div id="mobile-schedule-info" class="mobile-show"></div>
        </div>
        <div class="header-controls-row">
            <div class="header-center">
                <div class="tabs desktop-show">${tabsHTML}</div>
                <div class="tabs-dropdown-container mobile-show">${dropdownHTML}</div>
            </div>
            <div class="controls-container">
                <div id="view-toggle" class="view-toggle icon-toggle">
                    <button class="toggle-btn" data-view="leaderboard" title="리더보드 보기"><i class="fas fa-list-ol"></i></button>
                    <button class="toggle-btn" data-view="cutoff" title="컷오프 보기"><i class="fas fa-users"></i></button>
                    ${bracketToggleHTML}
                </div>
                <button id="full-bracket-button" title="전체 대진표 보기"><i class="fas fa-project-diagram"></i></button>
                <div class="search-container">
                    <input type="text" id="search-input" placeholder="닉네임 또는 아이디" />
                    <button id="search-button"><i class="fas fa-search"></i></button>
                </div>
                <button id="refresh-button" title="새로고침"><i class="fas fa-sync-alt"></i></button>
                <button id="sidebar-toggle" title="사이드바 열기/닫기"><i class="fas fa-expand"></i></button>
                <button id="overview-button" title="대회 개요"><i class="fas fa-file-alt"></i></button>
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
                    <span class="info-label">대회 방식</span><span class="info-value">토너먼트</span>
                </div>
            </div>
            <div class="info-group">
                <span class="info-label">대회 일정</span>
                <ul id="dynamic-schedule-list" class="schedule-list"></ul>
            </div>
            <div class="info-group">
                <span class="info-label">코스 정보</span>
                <ul id="dynamic-course-list" class="store-list"></ul>
            </div>
        </div>
        <div class="highlight-panel">
            <h2>대회 하이라이트</h2>
            <div id="highlight-content"></div>
        </div>
        <footer class="desktop-footer">
            <div class="footer-links">
                <a href="https://www.golfzon.com/tournament/v2/view?tournamentId=1250" target="_blank" title="Data from Golfzon"><i class="fas fa-database"></i></a>
                <a href="https://github.com/hwouu/scratch-leaderboard" target="_blank" title="Developer: hwouu"><i class="fab fa-github"></i></a>
                <a href="mailto:nhw3990@gmail.com" title="Contact"><i class="fas fa-envelope"></i></a>
            </div>
            <div class="footer-copyright">&copy; 2025 Scratch Leaderboard</div>
        </footer>`;
}

function renderMobileFooter(footer) {
  footer.innerHTML = `
        <div class="footer-links">
            <a href="https://www.golfzon.com/tournament/v2/view?tournamentId=1250" target="_blank" title="Data from Golfzon"><i class="fas fa-database"></i></a>
            <a href="https://github.com/hwouu/scratch-leaderboard" target="_blank" title="Developer: hwouu"><i class="fab fa-github"></i></a>
            <a href="mailto:nhw3990@gmail.com" title="Contact"><i class="fas fa-envelope"></i></a>
            <a class="footer-copyright-mobile">&copy; 2025 Scratch Leaderboard</a>
        </div>`;
}

async function initialize(elements, stage) {
  setupEventListeners(elements, stage);
  setActiveTabUI();
  setViewModeUI();
  await fetchAndRender(elements, stage);
  startAutoRefresh(elements, stage);
}

async function fetchAndRender(elements, stage) {
  const spinnerOverlay = document.getElementById("spinner-overlay");
  const refreshButton = document.getElementById("refresh-button");
  spinnerOverlay.classList.remove("hidden");
  if (refreshButton) refreshButton.querySelector("i").classList.add("fa-spin");

  const { success } = await fetchLeaderboardData(stage);
  if (success) {
    const leaderboardData = getLeaderboardData();
    elements.lastUpdatedElement.textContent =
      getLastFetchTime().toLocaleTimeString("ko-KR");
    renderContent(elements.contentElement);
    renderTicker(elements.tickerElement, leaderboardData.total);
    renderHighlights(elements.highlightContentElement, leaderboardData.total);
    renderScheduleAndCourses(
      elements.scheduleListElement,
      elements.courseListElement,
      elements.mobileScheduleInfo
    );
  } else {
    elements.contentElement.innerHTML = `<div class="error-container"><div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div><h3 class="error-title">데이터 로딩 실패</h3><p class="error-message">데이터를 불러오는 데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.</p></div>`;
  }
  spinnerOverlay.classList.add("hidden");
  if (refreshButton)
    refreshButton.querySelector("i").classList.remove("fa-spin");
}

function startAutoRefresh(elements, stage) {
  if (refreshIntervalId) clearInterval(refreshIntervalId);
  refreshIntervalId = setInterval(
    () => fetchAndRender(elements, stage),
    REFRESH_INTERVAL_MS
  );
}

function setActiveTabUI() {
  document
    .querySelectorAll(".tab-button")
    .forEach((t) =>
      t.classList.toggle("active", t.dataset.target === activeTab)
    );
  document.getElementById("tabs-dropdown").value = activeTab;
  document
    .getElementById("view-toggle")
    .classList.toggle("hidden", activeTab !== "total");
}

function setViewModeUI() {
  document
    .querySelectorAll(".toggle-btn")
    .forEach((b) => b.classList.remove("active"));
  const currentViewBtn = document.querySelector(
    `.toggle-btn[data-view="${currentViewMode}"]`
  );
  if (currentViewBtn) currentViewBtn.classList.add("active");
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

  if (activeTab === "total") {
    if (currentStage === "qualifying" && currentViewMode === "bracket") {
      currentViewMode = "leaderboard";
      setViewModeUI();
    }
    switch (currentViewMode) {
      case "cutoff":
        renderCutoffView(container, data);
        break;
      case "bracket":
        if (currentStage !== "qualifying") {
          renderBracketView(container, leaderboardData.brackets);
        } else {
          renderLeaderboardView(container, data);
        }
        break;
      default:
        renderLeaderboardView(container, data);
    }
  } else {
    renderLeaderboardView(container, data);
  }
}

function renderLeaderboardView(container, data) {
  const isQualifying = currentStage === "qualifying";
  const headersConfig = {
    total: [
      { key: "순위" },
      { key: "닉네임" },
      { key: "참여매장", class: "mobile-hide" },
      { key: "라운드", class: "mobile-hide" },
      { key: "A", class: "mobile-hide" },
      { key: "B", class: "mobile-hide" },
      ...(isQualifying ? [{ key: "C", class: "mobile-hide" }] : []),
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
  const headHTML = `<thead><tr>${headers
    .map((h) => `<th class="${h.class || ""}">${h.key}</th>`)
    .join("")}</tr></thead>`;

  const prevData = getPrevLeaderboardData()[activeTab] || [];
  const bodyHTML = data
    .map((player) => {
      const rank = player.isTieRank ? `T${player.rank}` : player.rank;
      const prevPlayer = prevData.find((p) => p.userId === player.userId);
      let rankChangeClass = "";
      if (prevPlayer) {
        if (player.rank < prevPlayer.rank) rankChangeClass = "flash-up";
        else if (player.rank > prevPlayer.rank) rankChangeClass = "flash-down";
      }
      const scores = player.scores || [];
      const qualifyingCells = isQualifying
        ? `<td class="mobile-hide">${formatSimpleScore(scores[2]?.score)}</td>`
        : "";
      const rowCells =
        activeTab === "total"
          ? `<td class="rank">${rank}</td>
             <td class="nickname">${
               player.userNickname
             }<span class="user-id">(${
              player.userId
            })</span><span class="shop-name-mobile">${
              player.shopName
            }</span></td>
             <td class="mobile-hide">${player.shopName}</td>
             <td class="mobile-hide">${player.roundCount}</td>
             <td class="mobile-hide">${formatSimpleScore(scores[0]?.score)}</td>
             <td class="mobile-hide">${formatSimpleScore(scores[1]?.score)}</td>
             ${qualifyingCells}
             <td>${player.revisionGrade}</td>
             <td>${formatFinalScore(player.totalScore)}</td>`
          : `<td class="rank">${rank}</td>
             <td class="nickname">${
               player.userNickname
             }<span class="user-id">(${
              player.userId
            })</span><span class="shop-name-mobile">${
              player.shopName
            }</span></td>
             <td class="tablet-hide mobile-hide">${player.shopName}</td>
             <td class="mobile-hide">${player.roundCount}</td>
             <td>${formatSimpleScore(player.score)}</td>
             <td class="mobile-hide">${formatSkillLevel(player.grade)}</td>
             <td>${player.revisionGrade}</td>
             <td>${formatFinalScore(player.totalScore)}</td>`;
      return `<tr class="${rankChangeClass}" data-userid="${player.userId}">${rowCells}</tr>`;
    })
    .join("");
  container.innerHTML = `<div class="table-container"><table>${headHTML}<tbody class="clickable">${bodyHTML}</tbody></table></div>`;
}

function renderCutoffView(container, data) {
  const cutoffData = data.slice(0, 32);
  let columns = [[], [], [], []];
  cutoffData.forEach((player, index) => {
    const columnIndex = Math.floor(index / 8);
    if (columns[columnIndex]) columns[columnIndex].push(player);
  });
  const columnsHTML = columns
    .map(
      (columnData) => `
      <div class="cutoff-column">
        ${columnData
          .map((player) => {
            const rank = player.isTieRank ? `T${player.rank}` : player.rank;
            return `<div class="cutoff-item" data-userid="${player.userId}">
                      <span class="rank">${rank}</span>
                      <div class="name-id" title="${player.userNickname}">
                        <span class="name">${player.userNickname}</span>
                        <span class="id">(${player.userId})</span>
                      </div>
                      <span class="score final-score">${formatSimpleScore(
                        player.totalScore
                      )}</span>
                    </div>`;
          })
          .join("")}
      </div>`
    )
    .join("");
  container.innerHTML = `<div class="cutoff-container">${columnsHTML}</div>`;
}

function renderBracketView(container, bracketData) {
  if (!bracketData || !Array.isArray(bracketData) || bracketData.length === 0) {
    container.innerHTML = `<div class="error-container"><div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div><h3 class="error-title">대진표 정보 없음</h3><p class="error-message">현재 대진표 데이터를 불러올 수 없습니다.</p></div>`;
    return;
  }

  const matchups = {};
  bracketData.forEach((player) => {
    if (!matchups[player.groupNo]) matchups[player.groupNo] = [];
    matchups[player.groupNo].push(player);
  });

  const getPlayerHTML = (player) => {
    if (!player) {
      return `<div class="player-details"><span class="rank">-</span><span class="name">TBA</span></div><span class="player-score">-</span>`;
    }
    const { userNickname, preliminaryRank, score, userId } = player;

    const fullPlayer = getAllPlayers().find(
      (p) => p.userNo === player.userNo || p.userId === userId
    );
    const shopName = fullPlayer ? fullPlayer.shopName : "";
    const shopNameHTML = shopName
      ? `<span class="player-shop" title="${shopName}">${shopName}</span>`
      : "";

    return `
      <div class="player-details">
          <span class="rank" title="예선 ${preliminaryRank}위">${preliminaryRank}</span>
          <div class="name-wrapper">
             <span class="name" title="${userNickname}">${userNickname}</span>
             ${shopNameHTML}
          </div>
      </div>
      <span class="player-score">${formatSimpleScore(score)}</span>`;
  };

  const bracketHTML = Object.values(matchups)
    .map((match) => {
      const [player1, player2] = match;
      let p1_class = "",
        p2_class = "";

      const p1_score = player1?.score;
      const p2_score = player2?.score;

      if (p1_score !== undefined && p2_score === undefined) {
        p1_class = "winning";
      } else if (p2_score !== undefined && p1_score === undefined) {
        p2_class = "winning";
      } else if (p1_score !== undefined && p2_score !== undefined) {
        if (p1_score < p2_score) p1_class = "winning";
        else if (p2_score < p1_score) p2_class = "winning";
      }

      return `
          <div class="matchup">
              <div class="matchup-body">
                  <div class="player p1 ${p1_class}" data-userid="${
        player1.userId
      }">
                      ${getPlayerHTML(player1)}
                  </div>
                  <div class="vs">VS</div>
                  <div class="player p2 ${p2_class}" data-userid="${
        player2.userId
      }">
                      ${getPlayerHTML(player2)}
                  </div>
              </div>
          </div>`;
    })
    .join("");

  container.innerHTML = `<div class="bracket-container">${bracketHTML}</div>`;
}

function renderTicker(element, data) {
  if (!data || data.length === 0) {
    element.innerHTML = "";
    return;
  }
  const top20 = data.slice(0, 20);
  const tickerContent = top20
    .map((p) => {
      const rank = p.isTieRank ? `T${p.rank}` : p.rank;
      return `<div class="ticker-item"><span class="rank">${rank}</span><span class="name">${
        p.userNickname
      }</span><span class="score">${formatTickerScore(
        p.totalScore
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
  const best = [...data].sort((a, b) => a.totalScore - b.totalScore)[0];
  const most = [...data].sort((a, b) => b.roundCount - a.roundCount)[0];
  if (element) {
    element.innerHTML = `<div class="highlight-item"><div class="highlight-title">최고 성적</div><div class="highlight-value">${
      best.userNickname
    }: ${formatSimpleScore(
      best.totalScore
    )}</div></div><div class="highlight-item"><div class="highlight-title">최다 라운드</div><div class="highlight-value">${
      most.userNickname
    }: ${most.roundCount}회</div></div>`;
  }
}

function renderScheduleAndCourses(
  scheduleListElement,
  courseListElement,
  mobileElement
) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let currentEvent = null,
    nextEvent = null;
  let currentEventName = "예선";

  const currentEventIndex = tournamentSchedule.findIndex((event) => {
    const startDate = new Date(event.start + "T00:00:00");
    const endDate = new Date(event.end + "T23:59:59");
    return now >= startDate && now <= endDate;
  });

  if (currentEventIndex !== -1) {
    currentEvent = tournamentSchedule[currentEventIndex];
    currentEventName = currentEvent.name
      .match(/\[(.*?)\]/)[1]
      .replace(/전$/, "");
    if (currentEventName.includes("결승")) currentEventName = "결승";
    if (currentEventIndex + 1 < tournamentSchedule.length) {
      nextEvent = tournamentSchedule[currentEventIndex + 1];
    }
  } else {
    nextEvent = tournamentSchedule.find(
      (event) => new Date(event.start + "T00:00:00") > now
    );
    const nextEventName =
      nextEvent?.name.match(/\[(.*?)\]/)[1].replace(/전$/, "") || "예선";
    currentEventName = courseInfoByDate[nextEventName] ? nextEventName : "예선";
  }

  if (scheduleListElement) {
    let scheduleHTML = "";
    if (currentEvent) {
      const start = currentEvent.start.substring(5).replace("-", ".");
      const end = currentEvent.end.substring(5).replace("-", ".");
      scheduleHTML += `<li><span class="event-status current">진행중</span> ${currentEvent.name} ${start} ~ ${end}</li>`;
    }
    if (nextEvent) {
      const start = nextEvent.start.substring(5).replace("-", ".");
      const end = nextEvent.end.substring(5).replace("-", ".");
      scheduleHTML += `<li><span class="event-status upcoming">예정</span> ${nextEvent.name} ${start} ~ ${end}</li>`;
    }
    scheduleListElement.innerHTML =
      scheduleHTML || "<li>모든 일정이 종료되었습니다.</li>";
  }

  if (courseListElement) {
    const courses = courseInfoByDate[currentEventName] || [];
    const courseLabels = ["A", "B", "C"];
    courseListElement.innerHTML = courses
      .map((course, index) => {
        const label = courseLabels[index]
          ? `<strong>${courseLabels[index]}코스:</strong> `
          : "";
        return `<li>${label}${course}</li>`;
      })
      .join("");
  }

  if (mobileElement) {
    if (currentEvent) {
      const start = currentEvent.start.substring(5).replace("-", ".");
      const end = currentEvent.end.substring(5).replace("-", ".");
      mobileElement.innerHTML = `<span class="event-status current">진행중</span> ${currentEvent.name} ${start} ~ ${end}`;
    } else {
      mobileElement.innerHTML = "다음 대회를 기다려주세요.";
    }
  }
}

function setupEventListeners(elements, stage) {
  const { contentElement, searchModal, overviewModal } = elements;
  const fullBracketModal = document.getElementById("full-bracket-modal");
  let timeInterval = null;

  document.getElementById("refresh-button").addEventListener("click", () => {
    fetchAndRender(elements, stage);
  });

  document.getElementById("sidebar-toggle").addEventListener("click", () => {
    const mainGrid = document.getElementById("main-grid");
    isSidebarCollapsed = !isSidebarCollapsed;
    localStorage.setItem("isSidebarCollapsed", isSidebarCollapsed);
    mainGrid.classList.toggle("sidebar-collapsed", isSidebarCollapsed);
    if (activeTab === "total" && currentViewMode === "bracket") {
      renderContent(contentElement);
    }
  });

  document.querySelector(".tabs").addEventListener("click", (e) => {
    if (e.target.classList.contains("tab-button")) {
      activeTab = e.target.dataset.target;
      localStorage.setItem("activeTab", activeTab);
      setActiveTabUI();
      renderContent(contentElement);
    }
  });

  document.getElementById("tabs-dropdown").addEventListener("change", (e) => {
    activeTab = e.target.value;
    localStorage.setItem("activeTab", activeTab);
    setActiveTabUI();
    renderContent(contentElement);
  });

  document.getElementById("view-toggle").addEventListener("click", (e) => {
    const btn = e.target.closest(".toggle-btn");
    if (btn) {
      currentViewMode = btn.dataset.view;
      localStorage.setItem("currentViewMode", currentViewMode);
      setViewModeUI();
      renderContent(contentElement);
    }
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

  document
    .getElementById("full-bracket-button")
    .addEventListener("click", () => {
      const leaderboardData = getLeaderboardData();
      const bracketSource =
        currentStage !== "qualifying" && leaderboardData.brackets
          ? leaderboardData.brackets
          : leaderboardData.total;

      if (bracketSource) {
        renderFullBracket(bracketSource);
        openModal(fullBracketModal);

        const timeElement = document.getElementById("current-time");
        if (timeElement) {
          const updateTime = () => {
            timeElement.textContent = new Date().toLocaleString("ko-KR");
          };
          updateTime();
          timeInterval = setInterval(updateTime, 1000);
        }
      }
    });

  [searchModal, overviewModal, fullBracketModal].forEach((modal) => {
    if (modal) {
      const closeModal = () => {
        modal.classList.remove("active");
        if (modal.id === "full-bracket-modal" && timeInterval) {
          clearInterval(timeInterval);
          timeInterval = null;
        }
      };
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
      modal
        .querySelector(".modal-close-button")
        .addEventListener("click", closeModal);
    }
  });

  contentElement.addEventListener("click", (e) => {
    const target = e.target.closest(
      "tr[data-userid], .cutoff-item[data-userid], .bracket-container .player[data-userid]"
    );
    if (target) {
      const userId = target.dataset.userid;
      const player = getAllPlayers().find((p) => p.userId === userId);
      if (player) showPlayerModal(player, searchModal, openModal);
    }
  });
}

function handleSearch(input, modal, openCallback) {
  const searchTerm = input.value.trim().toLowerCase();
  if (!searchTerm) return;
  const player = getAllPlayers().find(
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
  const rank = player.isTieRank ? `T${player.rank}` : player.rank || "-";
  let totalRounds = player.roundCount;
  if (totalRounds === undefined) {
    totalRounds =
      (player.courseRoundCounts.A || 0) +
      (player.courseRoundCounts.B || 0) +
      (player.courseRoundCounts.C || 0);
  }
  const courseAData = (leaderboardData.courseA || []).find(
    (p) => p.userId === player.userId
  );
  const courseBData = (leaderboardData.courseB || []).find(
    (p) => p.userId === player.userId
  );
  const courseCData =
    currentStage === "qualifying"
      ? (leaderboardData.courseC || []).find((p) => p.userId === player.userId)
      : null;

  const courseCHTML =
    currentStage === "qualifying"
      ? `<div class="search-result-item"><span class="result-label">C코스</span><span class="result-value">${formatSimpleScore(
          courseCData?.score
        )}</span></div>`
      : "";

  const detailsHTML = `
        <div class="search-result-item"><span class="result-label">순위</span><span class="result-value rank">${rank}</span></div>
        <div class="search-result-item"><span class="result-label">참여 매장</span><span class="result-value">${
          player.shopName
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
        ${courseCHTML}
        <div class="search-result-item"><span class="result-label">실력 등급</span><span class="result-value">${formatSkillLevel(
          player.grade || courseAData?.grade || courseBData?.grade
        )}</span></div>
        <div class="search-result-item"><span class="result-label">보정치</span><span class="result-value">${
          player.revisionGrade ?? "-"
        }</span></div>
        <div class="search-result-item"><span class="result-label">최종 성적</span><span class="result-value final-score">${formatSimpleScore(
          player.totalScore
        )}</span></div>`;

  const modalBody = modal.querySelector("#modal-body");
  modalBody.innerHTML = `<h3 class="modal-body-title">${player.userNickname} (${player.userId})</h3>${detailsHTML}`;
  openCallback(modal);
}

function renderFullBracket(data) {
  const bracketContent = document.getElementById("full-bracket-content");
  let players;

  if (currentStage !== "qualifying" && data[0]?.preliminaryRank !== undefined) {
    players = [...data].sort((a, b) => a.preliminaryRank - b.preliminaryRank);
  } else {
    players = data.slice(0, 32);
  }

  const createPlayerDiv = (player) => {
    if (!player) return `<div class="bracket-player placeholder">TBD</div>`;
    const rank =
      player.preliminaryRank !== undefined
        ? player.preliminaryRank
        : player.rank;
    const nickname = player.userNickname;
    const score =
      player.preliminaryScore !== undefined
        ? player.preliminaryScore
        : player.totalScore;
    return `<div class="bracket-player" title="${nickname} (${rank}위, ${formatSimpleScore(
      score
    )})">
                    <span class="player-rank">${rank}</span>
                    <span class="player-name">${nickname}</span>
                </div>`;
  };

  const createEmptyMatch = () =>
    `<div class="bracket-match">${createPlayerDiv(null)}${createPlayerDiv(
      null
    )}</div>`;

  const generateSideBracket = (matches) => {
    const round32 = matches
      .map(
        (match) =>
          `<div class="bracket-match">${createPlayerDiv(
            match.p1
          )}${createPlayerDiv(match.p2)}</div>`
      )
      .join("");
    const round16 = Array(4).fill(createEmptyMatch()).join("");
    const round8 = Array(2).fill(createEmptyMatch()).join("");
    const round4 = Array(1).fill(createEmptyMatch()).join("");
    return `
      <div class="bracket-side">
        <div class="bracket-round"><h3 class="round-title">${
          stageNames[currentStage] || "32강"
        }</h3><div class="matches-container">${round32}</div></div>
        <div class="bracket-round"><h3 class="round-title">16강</h3><div class="matches-container">${round16}</div></div>
        <div class="bracket-round"><h3 class="round-title">8강</h3><div class="matches-container">${round8}</div></div>
        <div class="bracket-round"><h3 class="round-title">4강</h3><div class="matches-container">${round4}</div></div>
      </div>`;
  };

  const matchups = [];
  for (let i = 0; i < 16; i++) {
    matchups.push({ p1: players[i], p2: players[31 - i] });
  }

  const leftMatches = matchups.slice(0, 8);
  const rightMatches = matchups.slice(8, 16);

  const leftBracketHTML = generateSideBracket(leftMatches);
  const rightBracketHTML = generateSideBracket(rightMatches);

  const centerHTML = `
        <div class="bracket-center">
            <div class="bracket-final-match"><h3 class="round-title">결승전</h3>${createEmptyMatch()}</div>
            <div class="bracket-third-place-match"><h3 class="round-title">3위 결정전</h3>${createEmptyMatch()}</div>
        </div>
    `;

  const footerHTML = `
        <div class="modal-footer-info">
            <div class="live-info"><span class="live-badge">LIVE</span> <span id="current-time"></span></div>
            <p class="notice">대진표는 이전 라운드 최종 성적 기준이며, 실시간 순위와 다를 수 있습니다.</p>
        </div>
    `;

  bracketContent.innerHTML = `
        <h2 class="modal-title">토너먼트 대진표</h2>
        <div class="bracket-symmetrical-container">
            ${leftBracketHTML}
            ${centerHTML}
            ${rightBracketHTML}
        </div>
        ${footerHTML}
    `;
}
