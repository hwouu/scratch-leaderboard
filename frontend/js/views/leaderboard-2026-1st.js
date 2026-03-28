import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let refreshInterval;

export async function renderLeaderboard2026_1st(stage, appElement) {
  appElement.innerHTML = `
    <style>
      .tv-wrapper {
        height: 100vh;
        display: flex;
        flex-direction: column;
        padding: 3vh 3vw;
        box-sizing: border-box;
        overflow: hidden;
      }
      .tv-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3vw;
        flex: 1;
        min-height: 0;
        margin-top: 1vh;
      }
      
      /* 테이블 미세 조정 */
      .tv-grid .table-container { margin: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
      .tv-grid table { height: 100%; display: table; } 
      .tv-grid table thead { display: table-header-group; }
      .tv-grid table tbody { display: table-row-group; overflow: visible; }
      .tv-grid table tr { display: table-row; }
      
      .tv-grid table th { font-size: 1.4vh; padding: 1.5vh 2vw; }
      .tv-grid table td { padding: 1vh 2vw; }
      .tv-grid .rank { font-size: 2.6vh; }
      .tv-grid .nickname { font-size: 2.2vh; padding-left: 2vw !important; max-width: 250px; }
      .tv-grid .user-id { font-size: 1.3vh; margin-top: 0.4vh; }
      .tv-grid .final-score { font-size: 2.6vh; }
      
      /* 본선 진출자 강조 */
      .advanced-row td {
        background-color: rgba(40, 167, 69, 0.08) !important;
        border-bottom: 1px solid rgba(40, 167, 69, 0.2) !important;
      }
      body.light-mode .advanced-row td {
        background-color: rgba(40, 167, 69, 0.05) !important;
      }
      .advanced-row .rank {
        color: var(--accent-green) !important;
        text-shadow: 0 0 10px rgba(40,167,69,0.3);
      }

      /* 버튼 컨테이너 및 스타일 */
      .header-actions {
        display: flex;
        gap: 12px;
      }
      .action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: transparent;
        padding: 0.8vh 1.5vw;
        border-radius: 8px;
        text-decoration: none;
        font-size: 1.6vh;
        font-weight: 700;
        transition: all 0.2s ease;
        cursor: pointer;
      }
      .btn-prize {
        border: 1px solid var(--accent-yellow);
        color: var(--accent-yellow);
      }
      .btn-prize:hover {
        background-color: var(--accent-yellow);
        color: #000;
        box-shadow: 0 0 15px rgba(255, 193, 7, 0.4);
      }
      .btn-overview {
        border: 1px solid var(--accent-blue);
        color: var(--accent-blue);
      }
      .btn-overview:hover {
        background-color: var(--accent-blue);
        color: #fff;
        box-shadow: 0 0 15px rgba(0, 145, 255, 0.4);
      }

      /* 대회 개요 모달 스타일 */
      .overview-modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 3000;
        display: flex; justify-content: center; align-items: center;
        opacity: 0; visibility: hidden; transition: all 0.3s ease;
      }
      .overview-modal-overlay.active {
        opacity: 1; visibility: visible;
      }
      .overview-modal-content {
        position: relative;
        padding: 20px;
        text-align: center;
        max-width: 90vw;
      }
      .overview-modal-img {
        max-width: 100%;
        max-height: 85vh;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      }
      .overview-modal-close {
        position: absolute; top: -10px; right: -10px;
        background: var(--bg-surface-accent); color: var(--text-primary);
        border: 2px solid var(--border-color);
        width: 40px; height: 40px; border-radius: 50%; font-size: 24px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        z-index: 10; transition: all 0.2s;
      }
      .overview-modal-close:hover {
        transform: scale(1.1);
        background: var(--accent-red);
        color: #fff;
        border-color: var(--accent-red);
      }
    </style>

    <div class="tv-wrapper">
      <header style="flex-shrink: 0; margin-bottom: 1vh; padding: 0;">
        <div class="title-container" style="width: 100%; display: flex; flex-direction: column; gap: 1vh;">
          <div class="title-group" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div style="display: flex; align-items: center; gap: 1.5vh;">
              <h1 style="font-size: 3.5vh; margin: 0;">2026 Scratch 1st OPEN</h1>
              <span class="live-indicator" style="font-size: 1.4vh; padding: 0.5vh 1vh;">LIVE</span>
            </div>
            
            <div class="header-actions">
              <button id="btn-open-overview" class="action-btn btn-overview">
                <i class="fas fa-file-alt"></i> 대회 개요
              </button>
              <a href="/prize" target="_blank" class="action-btn btn-prize">
                <i class="fas fa-trophy"></i> 상금 뷰 열기
              </a>
            </div>
          </div>
          
          <div class="subtitle" style="display: flex; justify-content: space-between; width: 100%; margin: 0;">
            <span class="subtitle-text" style="font-size: 1.8vh; color: var(--accent-blue);">
              예선 순위 (Top 30) - 상위 16명 홀인원 본선 진출
            </span>
            <span class="last-updated" style="font-size: 1.5vh;">마지막 업데이트: <span id="tv-last-updated">-</span></span>
          </div>
        </div>
      </header>

      <main class="tv-grid" id="tv-grid-container">
        <div class="placeholder-container" style="grid-column: 1/-1; width: 100%;">
          <p><i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> 데이터를 불러오는 중입니다...</p>
        </div>
      </main>
    </div>

    <div id="tv-overview-modal" class="overview-modal-overlay">
      <div class="overview-modal-content">
        <button id="btn-close-overview" class="overview-modal-close">&times;</button>
        <img src="/assets/2026-1st-overview.jpg" alt="대회 개요 포스터" class="overview-modal-img" onerror="this.src='https://placehold.co/800x1131/1a1c1e/eaeaea?text=Image+Not+Found'" />
      </div>
    </div>
  `;

  // 모달 제어 로직
  const modal = document.getElementById("tv-overview-modal");
  document.getElementById("btn-open-overview").addEventListener("click", () => {
    modal.classList.add("active");
  });
  document
    .getElementById("btn-close-overview")
    .addEventListener("click", () => {
      modal.classList.remove("active");
    });
  // 모달 바깥(배경) 클릭 시 닫기
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });

  const renderData = () => {
    const data = getLeaderboardData();
    const container = document.getElementById("tv-grid-container");
    const timeEl = document.getElementById("tv-last-updated");

    if (timeEl) timeEl.textContent = new Date().toLocaleTimeString("ko-KR");

    if (!data || !data.total || data.total.length === 0) {
      container.innerHTML = `
        <div class="placeholder-container" style="grid-column: 1/-1; width: 100%;">
          <p>대회 시작 전이거나 데이터를 불러올 수 없습니다.</p>
        </div>`;
      return;
    }

    const top30 = data.total.slice(0, 30);
    const col1 = top30.slice(0, 15);
    const col2 = top30.slice(15, 30);

    const renderTable = (players) => {
      if (players.length === 0) return "<div></div>";

      const headHTML = `
        <thead>
          <tr>
            <th style="width: 15%;">순위</th>
            <th style="width: 50%; text-align: left; padding-left: 2vw;">선수 정보</th>
            <th style="width: 15%;">라운드</th>
            <th style="width: 20%;">성적</th>
          </tr>
        </thead>`;

      const bodyHTML = players
        .map((player) => {
          const isAdvanced = player.rank <= 16;
          const rankChangeClass = isAdvanced ? "advanced-row" : "";
          const rank = player.isTieRank ? `T${player.rank}` : player.rank;

          let scoreColor = "var(--text-primary)";
          if (player.score > 0) scoreColor = "var(--accent-red)";
          if (player.score < 0) scoreColor = "var(--accent-blue)";

          const scoreText =
            player.score === 0
              ? "E"
              : player.score > 0
                ? `+${player.score}`
                : player.score;

          return `
          <tr class="${rankChangeClass}">
            <td class="rank">${rank}</td>
            <td class="nickname">
              ${player.userNickname}
              <span class="user-id">(${player.userId}) <span style="margin-left: 5px; opacity: 0.7;">${player.shopName || ""}</span></span>
            </td>
            <td style="font-weight: 500; font-size: 1.8vh;">${player.roundCount}R</td>
            <td class="final-score" style="color: ${scoreColor};">${scoreText}</td>
          </tr>`;
        })
        .join("");

      return `
        <div class="table-container">
          <table>${headHTML}<tbody>${bodyHTML}</tbody></table>
        </div>`;
    };

    container.innerHTML = renderTable(col1) + renderTable(col2);
  };

  const loadAndRender = async () => {
    await fetchLeaderboardData(stage);
    renderData();
  };

  await loadAndRender();

  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(loadAndRender, 5 * 60 * 1000);
}
