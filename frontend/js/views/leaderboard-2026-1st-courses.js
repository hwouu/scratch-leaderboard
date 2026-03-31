import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let refreshInterval;

export async function renderLeaderboard2026_1st_courses(stage, appElement) {
  appElement.innerHTML = `
    <style>
      body { overflow-y: auto !important; }
      
      .tv-wrapper {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        padding: 2rem 3% 3rem 3%; 
        box-sizing: border-box;
        overflow-y: auto; 
      }
      
      /* 3단 그리드 레이아웃 */
      .tv-grid-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
        flex: 1;
        margin-top: 1rem;
        align-items: start; 
      }
      
      .course-panel {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .course-title {
        text-align: center;
        font-size: 2rem;
        font-weight: 800;
        color: var(--accent-yellow);
        background: rgba(255, 193, 7, 0.1);
        border: 1px solid rgba(255, 193, 7, 0.3);
        padding: 0.8rem;
        border-radius: 12px;
        margin: 0;
        text-shadow: 0 0 10px rgba(255, 193, 7, 0.2);
      }
      
      .table-container { margin: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.2); border-radius: 12px; overflow: hidden; }
      table { width: 100%; display: table; table-layout: fixed; border-collapse: collapse; } 
      thead { display: table-header-group; background-color: var(--bg-surface-accent); }
      tbody { display: table-row-group; }
      tr { display: table-row; border-bottom: 1px solid var(--border-color); }
      tr:last-child { border-bottom: none; }
      
      th { font-size: 0.95rem; padding: 1rem 0.5rem; text-align: center; color: var(--text-secondary); font-weight: 700; }
      td { padding: 0.9rem 0.5rem; text-align: center; background-color: var(--bg-surface); } 
      
      .rank { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
      .nickname { font-size: 1.3rem; font-weight: 700; padding-left: 1rem !important; text-align: left; color: var(--text-primary); }
      .final-score { font-size: 1.6rem; font-weight: 800; }
      
      /* 코스 1등 강조 효과 */
      .top1-row td { background-color: rgba(255, 193, 7, 0.05); }
      .top1-row .rank { color: var(--accent-yellow) !important; text-shadow: 0 0 10px rgba(255,193,7,0.3); }

      .header-actions { display: flex; gap: 12px; }
      .action-btn {
        display: flex; align-items: center; gap: 8px;
        background-color: transparent; padding: 0.5rem 1rem;
        border-radius: 8px; text-decoration: none; font-size: 0.95rem;
        font-weight: 700; transition: all 0.2s ease; cursor: pointer;
      }
      .btn-back { border: 1px solid var(--text-secondary); color: var(--text-secondary); }
      .btn-back:hover { background-color: var(--text-secondary); color: #000; }
      
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--accent-blue); border-radius: 4px; }
    </style>

    <div class="tv-wrapper">
      <header style="flex-shrink: 0; margin-bottom: 1rem; padding: 0;">
        <div class="title-container" style="width: 100%; display: flex; flex-direction: column; gap: 1rem;">
          <div class="title-group" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <h1 style="font-size: 2.2rem; margin: 0;">2026 Scratch 1st OPEN</h1>
              <span class="live-indicator" style="font-size: 0.9rem; padding: 0.3rem 0.6rem;">LIVE</span>
            </div>
            
            <div class="header-actions">
              <button onclick="window.close()" class="action-btn btn-back">
                <i class="fas fa-times"></i> 창 닫기
              </button>
            </div>
          </div>
          
          <div class="subtitle" style="display: flex; justify-content: space-between; width: 100%; margin: 0;">
            <span class="subtitle-text" style="font-size: 1.1rem; color: var(--accent-green);">
              코스별 랭킹 (Top 10)
            </span>
            <span class="last-updated" style="font-size: 0.9rem;">마지막 업데이트: <span id="tv-last-updated">-</span></span>
          </div>
        </div>
      </header>

      <main class="tv-grid-3" id="tv-grid-container">
        <div class="placeholder-container" style="grid-column: 1/-1; width: 100%;">
          <p><i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> 데이터를 불러오는 중입니다...</p>
        </div>
      </main>
    </div>
  `;

  const renderData = () => {
    const data = getLeaderboardData();
    const container = document.getElementById("tv-grid-container");
    const timeEl = document.getElementById("tv-last-updated");
    if (timeEl) timeEl.textContent = new Date().toLocaleTimeString("ko-KR");

    if (!data || (!data.courseA && !data.courseB && !data.courseC)) {
      container.innerHTML = `
        <div class="placeholder-container" style="grid-column: 1/-1; width: 100%;">
          <p>진행 중인 코스 데이터가 없습니다.</p>
        </div>`;
      return;
    }

    // 각 코스별로 상위 10명만 추출
    const top10A = (data.courseA || []).slice(0, 10);
    const top10B = (data.courseB || []).slice(0, 10);
    const top10C = (data.courseC || []).slice(0, 10);

    const renderCourseTable = (title, players, titleColor) => {
      if (players.length === 0) {
        return `
          <div class="course-panel">
            <h2 class="course-title" style="color: ${titleColor}; border-color: ${titleColor}; text-shadow: none; background: transparent;">${title}</h2>
            <div class="table-container" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
              데이터 없음
            </div>
          </div>`;
      }

      const headHTML = `
        <thead>
          <tr>
            <th style="width: 18%;">순위</th>
            <th style="width: 54%; text-align: left; padding-left: 1.5rem;">선수 (ID)</th>
            <th style="width: 28%;">성적</th>
          </tr>
        </thead>`;

      const bodyHTML = players
        .map((player) => {
          const rank = player.isTieRank ? `T${player.rank}` : player.rank;
          const isTop1 = player.rank === 1 ? "top1-row" : "";

          let scoreColor = "var(--text-primary)";
          if (player.score > 0) scoreColor = "var(--accent-red)";
          if (player.score < 0) scoreColor = "var(--accent-blue)";
          const scoreText =
            player.score === 0
              ? "E"
              : player.score > 0
                ? `+${player.score}`
                : player.score;

          // 이름 표시 로직: 닉네임 우선, 닉네임 없으면 ID
          const displayName = player.userNickname || player.userId;

          return `
          <tr class="${isTop1}">
            <td class="rank">${rank}</td>
            <td class="nickname">${displayName}</td>
            <td class="final-score" style="color: ${scoreColor};">${scoreText}</td>
          </tr>`;
        })
        .join("");

      return `
        <div class="course-panel">
          <h2 class="course-title" style="color: ${titleColor}; border-color: ${titleColor}; text-shadow: 0 0 10px ${titleColor}40; background: ${titleColor}15;">${title}</h2>
          <div class="table-container"><table>${headHTML}<tbody>${bodyHTML}</tbody></table></div>
        </div>`;
    };

    container.innerHTML =
      renderCourseTable("A 코스", top10A, "var(--accent-yellow)") +
      renderCourseTable("B 코스", top10B, "var(--accent-green)") +
      renderCourseTable("C 코스", top10C, "var(--accent-blue)");
  };

  const loadAndRender = async () => {
    await fetchLeaderboardData(stage);
    renderData();
  };

  await loadAndRender();

  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(loadAndRender, 5 * 60 * 1000);
}
