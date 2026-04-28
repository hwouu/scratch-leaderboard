import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let refreshInterval;

export async function renderLeaderboard2026_1st_tournament(stage, appElement) {
  // 단계별 코스 및 라벨 정보 매핑
  const stageInfo = {
    "2026-1st-16": {
      label: "16강 진행 중",
      courseA: "트윈 도브스 골프",
      courseB: "뉴욕 센트럴파크 CC",
    },
    "2026-1st-8": {
      label: "8강 진행 중",
      courseA: "트윈 도브스 골프",
      courseB: "뉴욕 센트럴파크 CC",
    },
    "2026-1st-4": {
      label: "4강 진행 중",
      courseA: "군자리 CC",
      courseB: "크리스밸리 CC",
    },
    "2026-1st-third-place": {
      label: "3위 결정전 진행 중",
      courseA: "군자리 CC",
      courseB: "크리스밸리 CC",
    },
    "2026-1st-final": {
      label: "결승전 진행 중",
      courseA: "군자리 CC",
      courseB: "크리스밸리 CC",
    },
  };

  const currentInfo = stageInfo[stage] || {
    label: "본선 진행 중",
    courseA: "-",
    courseB: "-",
  };

  const styles = `
    body { overflow-y: auto !important; background-color: var(--bg-main); }
    
    .tv-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 2rem 3% 3rem 3%; 
      box-sizing: border-box;
      overflow-y: auto; 
    }
    
    /* 상단 헤더 컨테이너 */
    .header-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .title-group {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .main-title {
      font-size: 2.4rem;
      margin: 0;
      font-weight: 900;
      color: var(--text-primary);
    }
    .main-title span { color: var(--accent-green); }
    
    .live-indicator {
      background-color: var(--accent-red, #dc3545);
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 800;
      animation: pulse 2s infinite;
    }

    /* 코스 정보 티커 (Ticker) 스타일 */
    .course-info-ticker {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.2rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .course-details {
      display: flex;
      gap: 3rem;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-secondary);
    }
    .course-details span { color: var(--accent-blue); font-weight: 800; margin-left: 8px; }

    /* 버튼 그룹 */
    .header-actions { display: flex; gap: 12px; }
    .action-btn {
      display: flex; align-items: center; gap: 8px;
      background-color: transparent; padding: 0.6rem 1.2rem;
      border-radius: 8px; text-decoration: none; font-size: 1rem;
      font-weight: 700; transition: all 0.2s ease; cursor: pointer;
    }
    .btn-bracket { border: 1px solid var(--accent-yellow); color: var(--accent-yellow); }
    .btn-bracket:hover { background-color: var(--accent-yellow); color: #000; box-shadow: 0 0 15px rgba(255, 193, 7, 0.4); }
    .btn-overview { border: 1px solid var(--text-secondary); color: var(--text-secondary); }
    .btn-overview:hover { background-color: var(--text-secondary); color: #fff; }
    .btn-toggle { border: 1px solid var(--accent-blue); color: var(--accent-blue); }
    .btn-toggle:hover { background-color: var(--accent-blue); color: #fff; box-shadow: 0 0 15px rgba(0, 145, 255, 0.4); }

    /* 리더보드 테이블 그리드 */
    .tv-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5rem;
      flex: 1;
      align-items: start; 
    }
    
    .table-container { margin: 0; box-shadow: 0 8px 30px rgba(0,0,0,0.2); background: var(--bg-surface); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); }
    table { width: 100%; display: table; table-layout: fixed; border-collapse: collapse; } 
    thead { background-color: rgba(255, 255, 255, 0.02); border-bottom: 1px solid var(--border-color); }
    th { font-size: 0.95rem; padding: 1.2rem 0.5rem; text-align: center; color: var(--text-secondary); font-weight: 700; }
    td { padding: 1.2rem 0.5rem; text-align: center; vertical-align: middle; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
    tr:last-child td { border-bottom: none; }
    
    .rank-cell { font-size: 1.6rem; font-weight: 900; color: var(--text-primary); }
    .name-cell { font-size: 1.3rem; font-weight: 700; text-align: left; padding-left: 2rem !important; color: var(--text-primary); }
    .score-cell { font-size: 1.2rem; font-weight: 600; color: var(--text-secondary); }
    .final-score-cell { font-size: 1.8rem; font-weight: 900; }

    /* 모달 공통 스타일 */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85); z-index: 4000;
      display: flex; justify-content: center; align-items: center;
      opacity: 0; visibility: hidden; transition: all 0.3s ease;
    }
    .modal-overlay.active { opacity: 1; visibility: visible; }
    
    .overview-modal-content { position: relative; padding: 20px; text-align: center; max-width: 90vw; }
    .overview-modal-img { max-width: 100%; max-height: 85vh; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    
    .player-modal-content {
      background: var(--bg-surface); border: 1px solid var(--border-color);
      border-radius: 16px; padding: 30px 25px; width: 85%; max-width: 420px;
      position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.5); text-align: center;
    }
    
    .modal-close-btn {
      position: absolute; top: -15px; right: -15px;
      background: var(--bg-surface); color: var(--text-primary);
      border: 2px solid var(--border-color); width: 45px; height: 45px; border-radius: 50%; font-size: 24px;
      cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: 0.2s;
    }
    .modal-close-btn:hover { background: var(--accent-red); color: white; border-color: var(--accent-red); transform: scale(1.1); }
    
    .player-modal-header { font-size: 1.8rem; font-weight: 900; margin-bottom: 25px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 15px; }
    .player-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left; }
    .player-modal-item { background: rgba(255,255,255,0.02); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
    .player-modal-item.full-width { grid-column: 1 / -1; }
    .pm-label { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px; display: block; font-weight: 700; text-transform: uppercase; }
    .pm-value { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); }
    .pm-score { font-size: 2rem; font-weight: 900; }
    .pm-courses { display: flex; justify-content: space-around; text-align: center; }
    .pm-courses > div { display: flex; flex-direction: column; gap: 8px; }

    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }

    /* =========================================
       반응형 (태블릿 & 모바일) 최적화
    ========================================= */
    @media (max-width: 1200px) {
      .tv-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .tv-wrapper { padding: 1.5rem 4%; gap: 1.5rem; }
      
      .title-row { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .main-title { font-size: 1.8rem; }
      .live-indicator { font-size: 0.8rem; padding: 0.2rem 0.6rem; }
      
      .header-actions { flex-wrap: wrap; width: 100%; }
      .action-btn { font-size: 0.85rem; padding: 0.5rem 0.8rem; flex: 1; justify-content: center; }
      
      .course-info-ticker { flex-direction: column; align-items: flex-start; padding: 1rem; gap: 1rem; }
      .course-details { flex-direction: column; gap: 0.5rem; font-size: 1rem; }
      .course-details span { display: block; margin-left: 0; margin-top: 4px; }

      .hide-on-mobile { display: none !important; }
      .mobile-col-rank { width: 18% !important; }
      .mobile-col-info { width: 54% !important; padding-left: 0.5rem !important; }
      .mobile-col-score { width: 28% !important; }
      
      th { font-size: 0.8rem; padding: 1rem 0.2rem; }
      td { padding: 1rem 0.2rem; }
      .rank-cell { font-size: 1.3rem; }
      .name-cell { font-size: 1.1rem; padding-left: 1rem !important; }
      .final-score-cell { font-size: 1.4rem; }
      
      /* 모바일에서는 행 터치 효과 추가 */
      .player-row { cursor: pointer; transition: background-color 0.2s; }
      .player-row:active { background-color: rgba(255, 255, 255, 0.05); }
    }
  `;

  appElement.innerHTML = `
    <style>${styles}</style>
    <div class="tv-wrapper">
      
      <header class="header-container">
        <div class="title-row">
          <div class="title-group">
            <h1 class="main-title">2026 SCRATCH 1st <br><span>${currentInfo.label}</span></h1>
            <span class="live-indicator">LIVE</span>
          </div>
          
          <div class="header-actions">
            ${stage === "2026-1st-final" ? `<a href="/2026-1st/third-place" class="action-btn btn-toggle"><i class="fas fa-medal"></i> 3위전 보기</a>` : ""}
            ${stage === "2026-1st-third-place" ? `<a href="/2026-1st/final" class="action-btn btn-toggle"><i class="fas fa-trophy"></i> 결승전 보기</a>` : ""}
            <button id="btn-open-overview" class="action-btn btn-overview"><i class="fas fa-file-alt"></i> 개요</button>
            <a href="/2026-1st/bracket" class="action-btn btn-bracket"><i class="fas fa-sitemap"></i> 대진표/상금</a>
          </div>
        </div>

        <div class="course-info-ticker">
          <div class="course-details">
            <div>COURSE A <span>${currentInfo.courseA}</span></div>
            <div>COURSE B <span>${currentInfo.courseB}</span></div>
          </div>
          <div style="font-size: 0.9rem; color: var(--text-secondary);">
            업데이트: <span id="tv-last-updated">-</span>
          </div>
        </div>
      </header>

      <main class="tv-grid" id="tv-grid-container">
        <div class="placeholder-container" style="grid-column: 1/-1; width: 100%; text-align: center; padding: 4rem 0; color: var(--text-secondary);">
          <i class="fas fa-spinner fa-spin" style="margin-right: 10px; font-size: 1.5rem;"></i> 본선 데이터를 불러오는 중입니다...
        </div>
      </main>
    </div>

    <div id="tv-overview-modal" class="modal-overlay">
      <div class="overview-modal-content">
        <button id="btn-close-overview" class="modal-close-btn">&times;</button>
        <img src="/assets/2026-1st-overview.jpg" alt="대회 개요 포스터" class="overview-modal-img" onerror="this.src='https://placehold.co/800x1131/1a1c1e/eaeaea?text=Image+Not+Found'" />
      </div>
    </div>

    <div id="player-detail-modal" class="modal-overlay">
      <div class="player-modal-content">
        <button id="btn-close-player-modal" class="modal-close-btn">&times;</button>
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

  // 모달 제어 로직
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

  // 글로벌 함수로 터치 모달 오픈 연결
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
    } catch (e) {
      console.error("Modal parsing error", e);
    }
  };

  const formatCourseScore = (s) =>
    s === undefined || s === null ? "-" : s === 0 ? "E" : s > 0 ? `+${s}` : s;

  const renderData = () => {
    const data = getLeaderboardData();
    const container = document.getElementById("tv-grid-container");
    const timeEl = document.getElementById("tv-last-updated");
    if (timeEl) timeEl.textContent = new Date().toLocaleTimeString("ko-KR");

    if (!data || !data.total || data.total.length === 0) {
      container.innerHTML = `<div class="placeholder-container" style="grid-column: 1/-1; width: 100%; text-align: center; padding: 4rem 0; color: var(--text-secondary);">현재 진행 중인 매치 데이터가 없습니다.</div>`;
      return;
    }

    // 데이터를 두 열로 분할
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
            <th class="mobile-col-info" style="width: 40%; text-align: left; padding-left: 2rem;">선수 닉네임</th>
            <th class="hide-on-mobile" style="width: 15%;">A코스</th>
            <th class="hide-on-mobile" style="width: 15%;">B코스</th>
            <th class="mobile-col-score" style="width: 15%;">TOTAL</th>
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

          // 모달 전달용 데이터 패키징
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
            <td class="rank-cell mobile-col-rank">${rank}</td>
            <td class="name-cell mobile-col-info">${player.userNickname}</td>
            <td class="score-cell hide-on-mobile">${formatCourseScore(aScore)}</td>
            <td class="score-score hide-on-mobile">${formatCourseScore(bScore)}</td>
            <td class="final-score-cell mobile-col-score" style="color: ${scoreColor};">${scoreText}</td>
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
  refreshInterval = setInterval(loadAndRender, 30 * 1000); // 30초 갱신
}
