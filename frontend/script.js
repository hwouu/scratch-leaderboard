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

  // State
  const apiEndpoint = "/api";
  let leaderboardData = {};
  let prevLeaderboardData = {};
  const REFRESH_INTERVAL_MS = 300000;
  let activeTab = localStorage.getItem("activeTab") || "total";

  const tournamentSchedule = [
    { name: "[예선전]", start: "2025-09-01", end: "2025-09-15" },
    { name: "[32강]", start: "2025-09-15", end: "2025-09-19" },
    { name: "[16강]", start: "2025-09-19", end: "2025-09-23" },
    { name: "[8강]", start: "2025-09-23", end: "2025-09-27" },
    { name: "[4강]", start: "2025-09-27", end: "2025-10-01" },
    { name: "[결승/3위전]", start: "2025-10-01", end: "2025-10-05" },
  ];

  // --- 테마 관리 --- //
  const applyTheme = (theme) => {
    document.body.classList.toggle("light-mode", theme === "light");
    themeToggleButton.innerHTML =
      theme === "light"
        ? '<i class="fas fa-moon"></i> 다크 모드'
        : '<i class="fas fa-sun"></i> 라이트 모드';
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

    let currentEvent = null;
    let nextEvent = null;
    let currentEventIndex = -1;

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
    const tickerHTML = top20
      .map(
        (p) => `
          <div class="ticker-item">
              <span class="rank">${p.rank}</span>
              <span class="name">${p.userNickname}</span>
              <span class="score">${formatTickerScore(p.totalScore)}</span>
          </div>
      `
      )
      .join("");
    tickerElement.innerHTML = tickerHTML.repeat(2);
  };

  const renderHighlights = (data) => {
    if (!data || data.length === 0) return;
    const bestScorePlayer = [...data].sort(
      (a, b) => a.totalScore - b.totalScore
    )[0];
    const mostRoundsPlayer = [...data].sort(
      (a, b) => b.roundCount - a.roundCount
    )[0];

    highlightContentElement.innerHTML = `
          <div class="highlight-item">
              <div class="highlight-title">최고 성적 (Top Score)</div>
              <div class="highlight-value">${
                bestScorePlayer.userNickname
              }: ${formatSimpleScore(bestScorePlayer.totalScore)}</div>
          </div>
          <div class="highlight-item">
              <div class="highlight-title">최다 라운드 (Most Rounds)</div>
              <div class="highlight-value">${mostRoundsPlayer.userNickname}: ${
      mostRoundsPlayer.roundCount
    }회</div>
          </div>`;
  };

  const renderLeaderboard = () => {
    const data = leaderboardData[activeTab];
    const prevData = prevLeaderboardData[activeTab] || [];

    if (!data || !Array.isArray(data) || data.length === 0) {
      leaderboardContentElement.innerHTML =
        '<p style="padding: 20px;">표시할 데이터가 없습니다.</p>';
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

    const tableHead = `<thead><tr>${headers
      .map((h) => `<th>${h}</th>`)
      .join("")}</tr></thead>`;

    const tableBody = data
      .map((player) => {
        const rank = player.isTieRank ? `T${player.rank}` : player.rank;
        const prevPlayer = prevData.find((p) => p.userId === player.userId);
        let rankChangeClass = "";
        if (prevPlayer) {
          if (player.rank < prevPlayer.rank) rankChangeClass = "flash-up";
          else if (player.rank > prevPlayer.rank)
            rankChangeClass = "flash-down";
        }

        const rowCells =
          activeTab === "total"
            ? [
                `<td class="rank">${rank}</td>`,
                `<td class="nickname">${player.userNickname}<span class="user-id">(${player.userId})</span></td>`,
                `<td>${player.shopName}</td>`,
                `<td>${player.roundCount}</td>`,
                `<td>${formatSimpleScore(player.scores[0]?.score)}</td>`,
                `<td>${formatSimpleScore(player.scores[1]?.score)}</td>`,
                `<td>${formatSimpleScore(player.scores[2]?.score)}</td>`,
                `<td>${player.revisionGrade}</td>`,
                `<td>${formatFinalScore(player.totalScore)}</td>`,
              ]
            : [
                `<td class="rank">${rank}</td>`,
                `<td class="nickname">${player.userNickname}<span class="user-id">(${player.userId})</span></td>`,
                `<td>${player.shopName}</td>`,
                `<td>${player.roundCount}</td>`,
                `<td>${formatSimpleScore(player.score)}</td>`,
                `<td>${player.revisionGrade}</td>`,
                `<td>${formatFinalScore(player.totalScore)}</td>`,
              ];
        return `<tr class="${rankChangeClass}">${rowCells.join("")}</tr>`;
      })
      .join("");

    leaderboardContentElement.innerHTML = `<table>${tableHead}<tbody>${tableBody}</tbody></table>`;

    if (activeTab === "total") {
      renderTicker(data);
      renderHighlights(data);
    }
  };

  // --- 데이터 가져오기 --- //
  const fetchData = async () => {
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      prevLeaderboardData = leaderboardData;
      leaderboardData = await response.json();

      lastUpdatedElement.textContent = `${new Date().toLocaleString()}`;
      renderLeaderboard();
    } catch (error) {
      console.error("Failed to fetch data:", error);
      leaderboardContentElement.innerHTML =
        '<p style="padding: 20px;">데이터를 불러오는 데 실패했습니다.</p>';
    }
  };

  // --- 검색 기능 --- //
  const displaySearchResult = (player) => {
    if (player) {
      modalBody.innerHTML = `
              <h3 class="modal-body-title">${player.userNickname} (${
        player.userId
      })</h3>
              <div class="search-result-item">
                  <span class="result-label">순위</span>
                  <span class="result-value">${player.rank}</span>
              </div>
              <div class="search-result-item">
                  <span class="result-label">최종 성적</span>
                  <span class="result-value">${formatSimpleScore(
                    player.totalScore
                  )}</span>
              </div>
              <div class="search-result-item">
                  <span class="result-label">참여 매장</span>
                  <span class="result-value">${player.shopName}</span>
              </div>
              <div class="search-result-item">
                  <span class="result-label">라운드</span>
                  <span class="result-value">${player.roundCount}</span>
              </div>
          `;
    } else {
      modalBody.innerHTML = `<p><strong>'${searchInput.value}'</strong> 선수를 찾을 수 없습니다.</p>`;
    }
    searchModal.style.display = "flex";
  };

  const handleSearch = () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) return;

    const data = leaderboardData[activeTab];
    if (!data) return;

    const foundPlayer = data.find((p) =>
      p.userNickname.toLowerCase().includes(searchTerm)
    );
    displaySearchResult(foundPlayer);
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
      renderLeaderboard();
    });
  });

  searchButton.addEventListener("click", handleSearch);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
  });
  modalCloseButton.addEventListener(
    "click",
    () => (searchModal.style.display = "none")
  );
  searchModal.addEventListener("click", (e) => {
    if (e.target === searchModal) searchModal.style.display = "none";
  });

  // --- 초기화 --- //
  const init = () => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    applyTheme(savedTheme);
    document
      .querySelector(`.tab-button[data-target="${activeTab}"]`)
      .classList.add("active");

    renderSchedule();
    fetchData();
    setInterval(fetchData, REFRESH_INTERVAL_MS);
  };

  init();
});
