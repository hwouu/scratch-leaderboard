document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const lastUpdatedElement = document.getElementById("last-updated-time");
  const leaderboardContentElement = document.getElementById(
    "leaderboard-content"
  );
  const tabs = document.querySelectorAll(".tab-button");
  const themeToggleButton = document.getElementById("theme-toggle");
  const tickerElement = document.querySelector(".ticker");
  const highlightContentElement = document.getElementById("highlight-content");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const searchModal = document.getElementById("search-modal");
  const modalBody = document.getElementById("modal-body");
  const modalCloseButton = document.querySelector(".modal-close-button");
  const spinnerOverlay = document.getElementById("spinner-overlay");
  const refreshButton = document.getElementById("refresh-button");
  const viewToggleContainer = document.getElementById("view-toggle");
  const viewToggleButtons = viewToggleContainer.querySelectorAll(".toggle-btn");

  // State
  const apiEndpoint = "/api";
  let leaderboardData = {};
  let prevLeaderboardData = {};
  const REFRESH_INTERVAL_MS = 300000;
  let activeTab = localStorage.getItem("activeTab") || "total";
  let currentViewMode = "leaderboard"; // 'leaderboard' or 'cutoff'
  let isLoading = false;
  let refreshIntervalId = null;

  const tournamentSchedule = [
    { name: "[예선전]", start: "2025-09-01", end: "2025-09-15" },
    { name: "[32강]", start: "2025-09-15", end: "2025-09-19" },
    { name: "[16강]", start: "2025-09-19", end: "2025-09-23" },
    { name: "[8강]", start: "2025-09-23", end: "2025-09-27" },
    { name: "[4강]", start: "2025-09-27", end: "2025-10-01" },
    { name: "[결승/3위전]", start: "2025-10-01", end: "2025-10-05" },
  ];

  // --- UI 컨트롤 함수 --- //
  const showSpinner = () => {
    isLoading = true;
    spinnerOverlay.classList.remove("hidden");
    refreshButton.querySelector("i").classList.add("fa-spin");
  };

  const hideSpinner = () => {
    isLoading = false;
    spinnerOverlay.classList.add("hidden");
    refreshButton.querySelector("i").classList.remove("fa-spin");
  };

  const applyTheme = (theme) => {
    document.body.classList.toggle("light-mode", theme === "light");
    themeToggleButton.innerHTML =
      theme === "light"
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
  };

  const updateBodyLayout = () => {
    // Cutoff view is fullscreen, other views are scrollable
    if (activeTab === "total" && currentViewMode === "cutoff") {
      document.body.classList.remove("scrollable-view");
    } else {
      document.body.classList.add("scrollable-view");
    }
  };

  // --- 점수 포맷 --- //
  const formatFinalScore = (score) => {
    if (score === null || score === undefined) return "<span>-</span>";
    const scoreValue = parseInt(score, 10);
    return `<span class="final-score">${
      scoreValue > 0 ? `+${scoreValue}` : scoreValue
    }</span>`;
  };

  const formatSimpleScore = (score) => {
    if (score === null || score === undefined) return "-";
    const scoreValue = parseInt(score, 10);
    return scoreValue > 0 ? `+${scoreValue}` : scoreValue;
  };

  const formatTickerScore = (score) => {
    if (score === null || score === undefined) return "<span>-</span>";
    const scoreValue = parseInt(score, 10);
    let className = "";
    if (scoreValue > 0) className = "score-positive";
    if (scoreValue < 0) className = "score-negative";
    const scoreText = scoreValue > 0 ? `+${scoreValue}` : scoreValue;
    return `<span class="${className}">${scoreText}</span>`;
  };

  // --- 데이터 렌더링 --- //
  const renderSchedule = () => {
    const scheduleListElement = document.getElementById(
      "dynamic-schedule-list"
    );
    if (!scheduleListElement) return;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let currentEvent = null,
      nextEvent = null,
      currentEventIndex = -1;
    tournamentSchedule.forEach((event, index) => {
      const startDate = new Date(event.start + "T00:00:00");
      const endDate = new Date(event.end + "T00:00:00");
      endDate.setHours(23, 59, 59, 999);
      if (now >= startDate && now <= endDate) {
        currentEvent = event;
        currentEventIndex = index;
      }
    });
    if (
      currentEventIndex !== -1 &&
      currentEventIndex + 1 < tournamentSchedule.length
    ) {
      nextEvent = tournamentSchedule[currentEventIndex + 1];
    } else if (currentEventIndex === -1) {
      nextEvent = tournamentSchedule.find(
        (event) => new Date(event.start + "T00:00:00") > now
      );
    }
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
  };

  const renderTicker = (data) => {
    if (!data || data.length === 0) return;
    const top20 = data.slice(0, 20);
    tickerElement.innerHTML = top20
      .map(
        (p) =>
          `<div class="ticker-item"><span class="rank">${
            p.rank
          }</span><span class="name">${
            p.userNickname
          }</span><span class="score">${formatTickerScore(
            p.totalScore
          )}</span></div>`
      )
      .join("")
      .repeat(2);
  };

  const renderHighlights = (data) => {
    if (!data || data.length === 0) {
      highlightContentElement.innerHTML = "";
      return;
    }
    const best = [...data].sort((a, b) => a.totalScore - b.totalScore)[0];
    const most = [...data].sort((a, b) => b.roundCount - a.roundCount)[0];
    highlightContentElement.innerHTML = `<div class="highlight-item"><div class="highlight-title">최고 성적</div><div class="highlight-value">${
      best.userNickname
    }: ${formatSimpleScore(
      best.totalScore
    )}</div></div><div class="highlight-item"><div class="highlight-title">최다 라운드</div><div class="highlight-value">${
      most.userNickname
    }: ${most.roundCount}회</div></div>`;
  };

  const renderCutoffView = (data) => {
    const cutoffData = data.slice(0, 32);
    let columns = [[], [], [], []];
    cutoffData.forEach((player, index) => {
      const columnIndex = Math.floor(index / 8);
      if (columns[columnIndex]) {
        columns[columnIndex].push(player);
      }
    });

    const columnsHTML = columns
      .map(
        (columnData) => `
        <div class="cutoff-column">
            ${columnData
              .map((player) => {
                const rank = player.isTieRank ? `T${player.rank}` : player.rank;
                return `
                <div class="cutoff-item">
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

    leaderboardContentElement.innerHTML = `<div class="cutoff-container">${columnsHTML}</div>`;
  };

  const renderLeaderboard = () => {
    updateBodyLayout();
    const data = leaderboardData[activeTab];

    if (activeTab === "total" && currentViewMode === "cutoff") {
      renderCutoffView(data || []);
      return;
    }

    leaderboardContentElement.innerHTML = "";

    if (!data || !Array.isArray(data) || data.length === 0) {
      leaderboardContentElement.innerHTML = `<p style="padding: 20px;">표시할 데이터가 없습니다.</p>`;
      return;
    }

    const headers =
      activeTab === "total"
        ? [
            "순위",
            "닉네임",
            "참여매장",
            "라운드",
            "A",
            "B",
            "C",
            "보정치",
            "최종 성적",
          ]
        : [
            "순위",
            "닉네임",
            "참여매장",
            "라운드",
            "코스 성적",
            "보정치",
            "최종 성적",
          ];
    const headHTML = `<thead><tr>${headers
      .map((h) => {
        let className = "";
        if (
          h !== "순위" &&
          h !== "닉네임" &&
          h !== "보정치" &&
          h !== "최종 성적"
        )
          className = "mobile-hide";
        if (h === "참여매장") className = "mobile-hide";
        return `<th class="${className}">${h}</th>`;
      })
      .join("")}</tr></thead>`;
    const bodyHTML = data
      .map((player) => {
        const rank = player.isTieRank ? `T${player.rank}` : player.rank;
        const prevPlayer = (prevLeaderboardData[activeTab] || []).find(
          (p) => p.userId === player.userId
        );
        let rankChangeClass = "";
        if (prevPlayer) {
          if (player.rank < prevPlayer.rank) rankChangeClass = "flash-up";
          else if (player.rank > prevPlayer.rank)
            rankChangeClass = "flash-down";
        }
        const rowCells =
          activeTab === "total"
            ? `
              <td class="rank">${rank}</td>
              <td class="nickname">${
                player.userNickname
              }<span class="user-id">(${
                player.userId
              })</span><span class="shop-name-mobile">${
                player.shopName
              }</span></td>
              <td class="mobile-hide">${player.shopName}</td>
              <td class="mobile-hide">${player.roundCount}</td>
              <td class="mobile-hide">${formatSimpleScore(
                player.scores[0]?.score
              )}</td>
              <td class="mobile-hide">${formatSimpleScore(
                player.scores[1]?.score
              )}</td>
              <td class="mobile-hide">${formatSimpleScore(
                player.scores[2]?.score
              )}</td>
              <td>${player.revisionGrade}</td>
              <td>${formatFinalScore(player.totalScore)}</td>`
            : `
              <td class="rank">${rank}</td>
              <td class="nickname">${
                player.userNickname
              }<span class="user-id">(${
                player.userId
              })</span><span class="shop-name-mobile">${
                player.shopName
              }</span></td>
              <td class="mobile-hide">${player.shopName}</td>
              <td class="mobile-hide">${player.roundCount}</td>
              <td class="mobile-hide">${formatSimpleScore(player.score)}</td>
              <td>${player.revisionGrade}</td>
              <td>${formatFinalScore(player.totalScore)}</td>`;
        return `<tr class="${rankChangeClass}">${rowCells}</tr>`;
      })
      .join("");
    leaderboardContentElement.innerHTML = `<table>${headHTML}<tbody>${bodyHTML}</tbody></table>`;
  };

  const fetchData = async () => {
    if (isLoading) return;
    showSpinner();
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      prevLeaderboardData = leaderboardData;
      leaderboardData = await response.json();
      lastUpdatedElement.textContent = new Date().toLocaleTimeString("ko-KR");
      renderLeaderboard();
      renderTicker(leaderboardData.total || []);
      renderHighlights(leaderboardData.total || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      leaderboardContentElement.innerHTML = `<p style="padding: 20px;">데이터 로딩 실패.</p>`;
    } finally {
      hideSpinner();
    }
  };

  const handleSearch = () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) return;
    const data = leaderboardData[activeTab];
    if (!data) return;
    const player = data.find((p) =>
      p.userNickname.toLowerCase().includes(searchTerm)
    );
    if (player) {
      modalBody.innerHTML = `<h3 class="modal-body-title">${
        player.userNickname
      } (${
        player.userId
      })</h3><div class="search-result-item"><span class="result-label">순위</span><span class="result-value">${
        player.rank
      }</span></div><div class="search-result-item"><span class="result-label">최종 성적</span><span class="result-value">${formatSimpleScore(
        player.totalScore
      )}</span></div><div class="search-result-item"><span class="result-label">참여 매장</span><span class="result-value">${
        player.shopName
      }</span></div><div class="search-result-item"><span class="result-label">라운드</span><span class="result-value">${
        player.roundCount
      }</span></div>`;
    } else {
      modalBody.innerHTML = `<p><strong>'${searchInput.value}'</strong> 선수를 찾을 수 없습니다.</p>`;
    }
    searchModal.style.display = "flex";
  };

  const startAutoRefresh = () => {
    if (refreshIntervalId) clearInterval(refreshIntervalId);
    refreshIntervalId = setInterval(fetchData, REFRESH_INTERVAL_MS);
  };

  // --- 이벤트 리스너 --- //
  themeToggleButton.addEventListener("click", () => {
    const newTheme = document.body.classList.contains("light-mode")
      ? "dark"
      : "light";
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeTab = tab.dataset.target;
      localStorage.setItem("activeTab", activeTab);
      tabs.forEach((t) =>
        t.classList.toggle("active", t.dataset.target === activeTab)
      );
      viewToggleContainer.classList.toggle("hidden", activeTab !== "total");
      renderLeaderboard();
    });
  });

  viewToggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentViewMode = btn.dataset.view;
      viewToggleButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderLeaderboard();
    });
  });

  refreshButton.addEventListener("click", () => {
    fetchData();
    startAutoRefresh();
  });

  searchButton.addEventListener("click", handleSearch);
  searchInput.addEventListener(
    "keydown",
    (e) => e.key === "Enter" && handleSearch()
  );
  modalCloseButton.addEventListener(
    "click",
    () => (searchModal.style.display = "none")
  );
  searchModal.addEventListener(
    "click",
    (e) => e.target === searchModal && (searchModal.style.display = "none")
  );

  const init = () => {
    applyTheme(localStorage.getItem("theme") || "dark");
    document
      .querySelector(`.tab-button[data-target="${activeTab}"]`)
      .classList.add("active");
    viewToggleContainer.classList.toggle("hidden", activeTab !== "total");
    renderSchedule();
    fetchData();
    startAutoRefresh();
  };

  init();
});
