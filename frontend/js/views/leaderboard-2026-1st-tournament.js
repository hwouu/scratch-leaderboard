import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let refreshInterval;

export async function renderLeaderboard2026_1st_tournament(stage, appElement) {
  const stageInfo = {
    "2026-1st-16": {
      label: "16강",
      courseA: "트윈 도브스 골프",
      courseB: "뉴욕 센트럴파크 CC",
    },
    "2026-1st-8": {
      label: "8강",
      courseA: "트윈 도브스 골프",
      courseB: "뉴욕 센트럴파크 CC",
    },
    "2026-1st-4": {
      label: "4강",
      courseA: "군자리 CC",
      courseB: "크리스밸리 CC",
    },
    "2026-1st-third-place": {
      label: "3위 결정전",
      courseA: "군자리 CC",
      courseB: "크리스밸리 CC",
    },
    "2026-1st-final": {
      label: "결승전",
      courseA: "군자리 CC",
      courseB: "크리스밸리 CC",
    },
  };

  const currentInfo = stageInfo[stage] || {
    label: "본선",
    courseA: "-",
    courseB: "-",
  };

  appElement.innerHTML = `
    <style>
      body { overflow-y: auto !important; background-color: var(--bg-main); }
      
      .tv-wrapper {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        padding: 2rem 3% 3rem 3%; 
        box-sizing: border-box;
        overflow-y: auto; 
      }
      
      .header-info-box {
        background: linear-gradient(90deg, rgba(0, 145, 255, 0.05), rgba(40, 167, 69, 0.05));
        border: 1px solid rgba(0, 145, 255, 0.2);
        border-radius: 12px;
        padding: 1rem 2rem;
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .course-display { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); display: flex; gap: 3rem; }
      .course-display span { color: var(--accent-blue); font-weight: 800; }
      
      .tv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; flex: 1; align-items: start; }
      .table-container { margin: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.2); background: var(--bg-surface); border-radius: 12px; overflow: hidden; }
      table { width: 100%; display: table; table-layout: fixed; border-collapse: collapse; } 
      thead { background-color: rgba(255, 255, 255, 0.03); }
      th { font-size: 0.9rem; padding: 1rem 0.2rem; text-align: center; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); }
      td { padding: 0.9rem 0.2rem; text-align: center; vertical-align: middle; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
      tr:last-child td { border-bottom: none; }
      
      .rank { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
      .nickname { font-size: 1.3rem; font-weight: 700; text-align: left; padding-left: 1.5rem !important; }
      .final-score { font-size: 1.6rem; font-weight: 800; }
      .course-score { font-size: 1.2rem; font-weight: 600; color: var(--text-secondary); }

      .header-actions { display: flex; gap: 12px; }
      .action-btn { display: flex; align-items: center; gap: 8px; background-color: transparent; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-size: 0.95rem; font-weight: 700; transition: all 0.2s ease; cursor: pointer; }
      .btn-bracket { border: 1px solid var(--accent-yellow); color: var(--accent-yellow); }
      .btn-bracket:hover { background-color: var(--accent-yellow); color: #000; box-shadow: 0 0 15px rgba(255, 193, 7, 0.4); }
      .btn-overview { border: 1px solid var(--accent-blue); color: var(--accent-blue); }
      .btn-overview:hover { background-color: var(--accent-blue); color: #fff; box-shadow: 0 0 15px rgba(0, 145, 255, 0.4); }
      .btn-toggle { border: 1px solid var(--text-secondary); color: var(--text-secondary); }
      .btn-toggle:hover { background-color: var(--text-secondary); color: #000; }

      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--accent-blue); border-radius: 4px; }

      .overview-modal-overlay, .player-modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 3000;
        display: flex; justify-content: center; align-items: center;
        opacity: 0; visibility: hidden; transition: all 0.3s ease;
      }
      .overview-modal-overlay.active, .player-modal-overlay.active { opacity: 1; visibility: visible; }
      .overview-modal-content { position: relative; padding: 20px; text-align: center; max-width: 90vw; }
      .overview-modal-img { max-width: 100%; max-height: 85vh; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
      
      .player-modal-content {
        background: var(--bg-surface); border: 1px solid var(--border-color);
        border-radius: 16px; padding: 25px 20px; width: 85%; max-width: 400px;
        position: relative; box-shadow: 0 10px 40px rgba(0,0,0,0.5); text-align: center;
      }
      
      .modal-close {
        position: absolute; background: var(--bg-surface-accent); color: var(--text-primary);
        border: 2px solid var(--border-color); width: 40px; height: 40px; border-radius: 50%; font-size: 24px;
        cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;
      }
      .overview-modal-close { top: -10px; right: -10px; }
      .player-modal-close { top: 15px; right: 15px; background: transparent; border: none; font-size: 28px; }
      
      .player-modal-header { font-size: 1.6rem; font-weight: 800; margin-bottom: 20px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 15px; }
      .player-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: left; }
      .player-modal-item { background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); }
      .player-modal-item.full-width { grid-column: 1 / -1; }
      .pm-label { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px; display: block; font-weight: 600;}
      .pm-value { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); }
      .pm-score { font-size: 1.6rem; font-weight: 800; }
      .pm-courses { display: flex; justify-content: space-around; text-align: center; }
      .pm-courses > div { display: flex; flex-direction: column; gap: 5px; }

      @media (max-width: 1200px) { .tv-grid { grid-template-columns: 1fr; } }
      @media (max-width: 768px) {
        .tv-wrapper { padding: 1.5rem 4%; }
        .course-display { flex-direction: column; gap: 0.5rem; font-size: 1.1rem; text-align: center; }
        .header-actions { flex-wrap: wrap; margin-top: 0.5rem; justify-content: flex-start; gap: 6px; }
        .action-btn { font-size: 0.8rem; padding: 0.4rem 0.6rem; }
        .title-group { flex-direction: column; align-items: flex-start !important; gap: 0.5rem; }
        .title-group h1 { font-size: 1.6rem !important; }
        
        .hide-on-mobile { display: none !important; }
        .mobile-col-rank { width: 15% !important; }
        .mobile-col-info { width: 55% !important; padding-left: 0.2rem !important; }
        .mobile-col-score { width: 30% !important; }
        
        .tv-grid table th { font-size: 0.7rem !important; padding: 0.6rem 0.1rem; }
        .tv-grid table td { padding: 0.6rem 0.1rem; }
        .rank { font-size: 1.2rem !important; }
        .nickname { font-size: 1rem !important; padding-left: 0.5rem !important; }
        .final-score { font-size: 1.3rem !important; }
        
        .player-row { cursor: pointer; }
        .player-row:active { background-color: rgba(255, 255, 255, 0.1) !important; }
      }
    </style>

    <div class="tv-wrapper">
      <header style="flex-shrink: 0; padding: 0;">
        <div class="title-container" style="width: 100%; display: flex; flex-direction: column; gap: 1rem;">
          <div class="title-group" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div style="display: flex; align-items: center; gap: 0.8rem;">
              <h1 style="font-size: 2.2rem; margin: 0;">2026 Scratch 1st <span style="color:var(--accent-green);">${currentInfo.label}</span></h1>
              <span class="live-indicator" style="font-size: 0.9rem; padding: 0.3rem 0.6rem;">LIVE</span>
            </div>
            
            <div class="header-actions">
              ${stage === "2026-1st-final" ? `<a href="/2026-1st/third-place" class="action-btn btn-toggle"><i class="fas fa-medal"></i> 3위전 보기</a>` : ""}
              ${stage === "2026-1st-third-place" ? `<a href="/2026-1st/final" class="action-btn btn-bracket"><i class="fas fa-trophy"></i> 결승전 보기</a>` : ""}
              <button id="btn-open-overview" class="action-btn btn-overview"><i class="fas fa-file-alt"></i> 대회 개요</button>
              <a href="/2026-1st/bracket" target="_blank" class="action-btn btn-bracket"><i class="fas fa-sitemap"></i> 대진표 뷰 열기</a>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; margin: 0;">
            <span class="subtitle-text" style="font-size: 1.1rem; color: var(--accent-blue);">
              본선 토너먼트 - ${currentInfo.label} 매치플레이 진행 중
            </span>
            <span class="last-updated" style="font-size: 0.9rem; color: var(--text-secondary);">마지막 업데이트: <span id="tv-last-updated">-</span></span>
          </div>
        </div>

        <div class="header-info-box">
          <div class="course-display">
            <div>A코스: <span>${currentInfo.courseA}</span></div>
            <div>B코스: <span>${currentInfo.courseB}</span></div>
          </div>
        </div>
      </header>

      <main class="tv-grid" id="tv-grid-container">
        <div class="placeholder-container" style="grid-column: 1/-1; width: 100%;">
          <p><i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> 본선 데이터를 불러오는 중입니다...</p>
        </div>
      </main>
    </div>

    <div id="tv-overview-modal" class="overview-modal-overlay">
      <div class="overview-modal-content">
        <button id="btn-close-overview" class="modal-close overview-modal-close">&times;</button>
        <img src="/assets/2026-1st-overview.jpg" alt="대회 개요 포스터" class="overview-modal-img" onerror="this.src='https://placehold.co/800x1131/1a1c1e/eaeaea?text=Image+Not+Found'" />
      </div>
    </div>

    <div id="player-detail-modal" class="player-modal-overlay">
      <div class="player-modal-content">
        <button id="btn-close-player-modal" class="modal-close player-modal-close">&times;</button>
        <div class="player-modal-header" id="pm-nickname">닉네임</div>
        
        <div class="player-modal-grid">
          <div class="player-modal-item">
            <span class="pm-label">순위</span>
            <span class="pm-value" id="pm-rank" style="color: var(--accent-green);">1</span>
          </div>
          <div class="player-modal-item">
            <span class="pm-label">합산 성적</span>
            <span class="pm-score" id="pm-final-score">E</span>
          </div>
          <div class="player-modal-item full-width pm-courses">
            <div><span class="pm-label">A코스</span><span class="pm-value" id="pm-a">-</span></div>
            <div><span class="pm-label">B코스</span><span class="pm-value" id="pm-b">-</span></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const overviewModal = document.getElementById("tv-overview-modal");
  document
    .getElementById("btn-open-overview")
    .addEventListener("click", () => overviewModal.classList.add("active"));
  document
    .getElementById("btn-close-overview")
    .addEventListener("click", () => overviewModal.classList.remove("active"));
  overviewModal.addEventListener("click", (e) => {
    if (e.target === overviewModal) overviewModal.classList.remove("active");
  });

  const playerModal = document.getElementById("player-detail-modal");
  document
    .getElementById("btn-close-player-modal")
    .addEventListener("click", () => playerModal.classList.remove("active"));
  playerModal.addEventListener("click", (e) => {
    if (e.target === playerModal) playerModal.classList.remove("active");
  });

  window.openTournamentModal = (dataStr) => {
    if (window.innerWidth > 768) return;
    try {
      const data = JSON.parse(decodeURIComponent(dataStr));
      document.getElementById("pm-nickname").textContent = data.nickname;
      document.getElementById("pm-rank").textContent = data.rank;
      const scoreEl = document.getElementById("pm-final-score");
      scoreEl.textContent = data.finalScore;
      scoreEl.style.color = data.scoreColor;
      document.getElementById("pm-a").textContent = data.aScore;
      document.getElementById("pm-b").textContent = data.bScore;
      playerModal.classList.add("active");
    } catch (e) {}
  };

  const formatCourseScore = (s) =>
    s === undefined || s === null ? "-" : s === 0 ? "E" : s > 0 ? `+${s}` : s;

  const renderData = () => {
    const data = getLeaderboardData();
    const container = document.getElementById("tv-grid-container");
    const timeEl = document.getElementById("tv-last-updated");
    if (timeEl) timeEl.textContent = new Date().toLocaleTimeString("ko-KR");

    if (!data || !data.total || data.total.length === 0) {
      container.innerHTML = `<div class="placeholder-container" style="grid-column: 1/-1; width: 100%;"><p>현재 진행 중인 본선 데이터가 없습니다.</p></div>`;
      return;
    }

    const halfIndex = Math.ceil(data.total.length / 2);
    const col1 = data.total.slice(0, halfIndex);
    const col2 = data.total.slice(halfIndex, data.total.length);
    if (col2.length < col1.length) col2.push({ isEmpty: true });

    const renderTable = (players) => {
      if (players.length === 0) return "<div></div>";
      const headHTML = `
        <thead>
          <tr>
            <th class="mobile-col-rank" style="width: 15%;">순위</th>
            <th class="mobile-col-info" style="width: 40%; text-align: left; padding-left: 1.5rem;">선수 닉네임</th>
            <th class="hide-on-mobile" style="width: 15%;">A코스</th>
            <th class="hide-on-mobile" style="width: 15%;">B코스</th>
            <th class="mobile-col-score" style="width: 15%;">합산성적</th>
          </tr>
        </thead>`;

      const bodyHTML = players
        .map((player) => {
          if (player.isEmpty)
            return `<tr style="visibility: hidden;"><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>`;

          const rank = player.isTieRank ? `T${player.rank}` : player.rank;
          const finalScore =
            player.totalScore !== undefined ? player.totalScore : player.score;
          let scoreColor = "var(--text-primary)";
          if (finalScore > 0) scoreColor = "var(--accent-red)";
          if (finalScore < 0) scoreColor = "var(--accent-blue)";
          const scoreText =
            finalScore === 0
              ? "E"
              : finalScore > 0
                ? `+${finalScore}`
                : finalScore;

          const aScore = data.courseA?.find(
            (p) => p.userId === player.userId,
          )?.score;
          const bScore = data.courseB?.find(
            (p) => p.userId === player.userId,
          )?.score;

          const modalData = encodeURIComponent(
            JSON.stringify({
              nickname: player.userNickname,
              rank: rank,
              scoreColor: scoreColor,
              finalScore: scoreText,
              aScore: formatCourseScore(aScore),
              bScore: formatCourseScore(bScore),
            }),
          );

          return `
          <tr class="player-row" onclick="window.openTournamentModal('${modalData}')">
            <td class="rank mobile-col-rank">${rank}</td>
            <td class="nickname mobile-col-info">${player.userNickname}</td>
            <td class="course-score hide-on-mobile">${formatCourseScore(aScore)}</td>
            <td class="course-score hide-on-mobile">${formatCourseScore(bScore)}</td>
            <td class="final-score mobile-col-score" style="color: ${scoreColor};">${scoreText}</td>
          </tr>`;
        })
        .join("");
      return `<div class="table-container"><table>${headHTML}<tbody>${bodyHTML}</tbody></table></div>`;
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
