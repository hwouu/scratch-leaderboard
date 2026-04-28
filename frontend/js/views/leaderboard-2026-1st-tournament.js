import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let refreshInterval;

export async function renderLeaderboard2026_1st_tournament(stage, appElement) {
  const stageInfo = {
    "2026-1st-16": {
      label: "16강 (Round of 16)",
      date: "2026.04.28 ~ 2026.05.01",
      size: 16,
      courseA: "트윈 도브스 골프",
      courseB: "뉴욕 센트럴파크 CC",
    },
    "2026-1st-8": {
      label: "8강 (Quarter Final)",
      date: "2026.05.02 ~ 2026.05.05",
      size: 8,
      courseA: "트윈 도브스 골프",
      courseB: "뉴욕 센트럴파크 CC",
    },
    "2026-1st-4": {
      label: "4강 (Semi Final)",
      date: "2026.05.06 ~ 2026.05.09",
      size: 4,
      courseA: "군자리 CC",
      courseB: "크리스밸리 CC",
    },
    "2026-1st-third-place": {
      label: "3위 결정전",
      date: "2026.05.10 ~ 2026.05.13",
      size: 2,
      courseA: "군자리 CC",
      courseB: "크리스밸리 CC",
    },
    "2026-1st-final": {
      label: "결승전 (The Final)",
      date: "2026.05.10 ~ 2026.05.13",
      size: 2,
      courseA: "군자리 CC",
      courseB: "크리스밸리 CC",
    },
  };

  const current = stageInfo[stage] || {
    label: "본선",
    date: "-",
    size: 16,
    courseA: "-",
    courseB: "-",
  };

  const styles = `
    body { background-color: #0d0e10 !important; color: #fff; overflow: hidden; font-family: 'Pretendard', sans-serif; }
    .tv-wrapper { height: 100vh; padding: 2vh 3vw; box-sizing: border-box; display: flex; flex-direction: column; gap: 1.5vh; }

    /* 헤더 폰트 확대 및 LIVE 배지 적용 */
    .main-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 1vh; flex-shrink: 0; }
    .title-section h1 { font-size: 4vh; margin: 0; font-weight: 900; letter-spacing: -1px; display: flex; align-items: center; gap: 1vw; }
    .title-section h1 span { color: var(--accent-green); }
    .live-tag { background: #ff0000; color: #fff; padding: 0.4vh 0.8vw; font-size: 1.8vh; font-weight: 800; border-radius: 4px; vertical-align: middle; animation: pulse 2s infinite; }
    .stage-date { font-size: 1.8vh; color: #aaa; font-weight: 700; margin-top: 0.8vh; display: block; }

    .header-actions { display: flex; gap: 0.8vw; }
    .btn-glass { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1vh 1.5vw; border-radius: 6px; font-size: 1.6vh; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5vw; text-decoration: none; transition: 0.2s; }
    .btn-glass:hover { background: rgba(255,255,255,0.15); border-color: #fff; }
    .btn-gold { border-color: var(--accent-yellow); color: var(--accent-yellow); }

    .header-info-ticker { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 1.5vh 2vw; border-radius: 8px; border-left: 5px solid var(--accent-blue); }
    .ticker-courses { display: flex; gap: 3vw; }
    .ticker-item { font-size: 2.2vh; font-weight: 700; }
    .ticker-label { color: #888; margin-right: 10px; }
    .ticker-value { color: #fff; }

    /* 리더보드 테이블 정렬 및 꽉 차는 레이아웃 적용 */
    .tv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2vw; flex: 1; min-height: 0; }
    .table-container { background: #16181c; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column; height: 100%; }
    
    /* table 높이를 100%로 주어 행들이 세로 여백 없이 꽉 차게 배분되도록 설정 */
    table { width: 100%; height: 100%; border-collapse: collapse; table-layout: fixed; border: none; }
    
    .col-rank { width: 15%; }
    .col-player { width: 40%; }
    .col-course { width: 15%; }
    .col-total { width: 15%; }

    th { background: #1f2229; color: #888; font-size: 1.6vh; height: 5vh; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #2d3139; }
    
    /* td에 height: auto를 주어 테이블 렌더러가 남은 공간을 N등분하여 꽉 차게 채움 */
    td { text-align: center; border-bottom: 1px solid #2d3139; vertical-align: middle; height: auto; }
    
    .rank-cell { font-size: 2.6vh; font-weight: 900; color: var(--accent-green); }
    .name-cell { text-align: left !important; padding-left: 2vw !important; font-size: 2.2vh; font-weight: 700; color: #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .score-cell { font-size: 2vh; color: #aaa; font-weight: 600; }
    .total-cell { font-size: 2.8vh; font-weight: 900; }

    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 3000; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
    .modal-overlay.active { opacity: 1; visibility: visible; }
    .overview-modal-content { position: relative; padding: 20px; text-align: center; max-width: 90vw; }
    .overview-modal-img { max-width: 100%; max-height: 85vh; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .modal-close-btn { position: absolute; top: -15px; right: -15px; background: #16181c; color: #fff; border: 2px solid #333; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; }

    @media (max-width: 1200px) { .tv-grid { grid-template-columns: 1fr; overflow-y: auto; } }
  `;

  appElement.innerHTML = `
    <style>${styles}</style>
    <div class="tv-wrapper">
      <header class="main-header">
        <div class="title-section">
          <h1>2026 SCRATCH 1st <span>${current.label}</span> <span class="live-tag">LIVE</span></h1>
          <span class="stage-date">${current.date}</span>
        </div>
        <div class="header-actions">
          <button id="btn-open-overview" class="btn-glass"><i class="fas fa-info-circle"></i> 대회 개요</button>
          <a href="/2026-1st/bracket" class="btn-glass btn-gold"><i class="fas fa-sitemap"></i> BRACKET VIEW</a>
        </div>
      </header>

      <div class="header-info-ticker">
        <div class="ticker-courses">
          <div class="ticker-item"><span class="ticker-label">COURSE A</span><span class="ticker-value">${current.courseA}</span></div>
          <div class="ticker-item"><span class="ticker-label">COURSE B</span><span class="ticker-value">${current.courseB}</span></div>
        </div>
        <div class="ticker-item" style="font-size: 1.6vh; color: #666;">
          LAST UPDATED: <span id="tv-last-updated" style="color:#aaa;">-</span>
        </div>
      </div>

      <main class="tv-grid" id="tv-grid-container"></main>
    </div>

    <div id="tv-overview-modal" class="modal-overlay">
      <div class="overview-modal-content">
        <button id="btn-close-overview" class="modal-close-btn">&times;</button>
        <img src="/assets/2026-1st-overview.jpg" class="overview-modal-img" onerror="this.src='https://placehold.co/800x1131/1a1c1e/eaeaea?text=Image+Not+Found'" />
      </div>
    </div>
  `;

  const renderData = () => {
    const data = getLeaderboardData();
    const container = document.getElementById("tv-grid-container");
    document.getElementById("tv-last-updated").textContent =
      new Date().toLocaleTimeString("ko-KR");

    let players = data?.total || [];

    // 화면을 꽉 채우기 위해 해당 단계(16강, 8강 등)의 인원 수만큼 무조건 배열을 채움
    const totalSlots = current.size;
    const filledPlayers = [...players];
    for (let i = players.length; i < totalSlots; i++) {
      filledPlayers.push({
        isEmptySlot: true,
        rank: i + 1,
        userNickname: "-",
        score: null,
      });
    }

    const half = Math.ceil(totalSlots / 2);

    const renderTable = (list) => {
      const rows = list
        .map((p) => {
          const aScore = data?.courseA?.find(
            (cp) => cp.userId === p.userId,
          )?.score;
          const bScore = data?.courseB?.find(
            (cp) => cp.userId === p.userId,
          )?.score;
          const finalScore =
            p.totalScore !== undefined ? p.totalScore : p.score;
          const scoreColor =
            finalScore < 0
              ? "var(--accent-blue)"
              : finalScore > 0
                ? "var(--accent-red)"
                : "#fff";

          const aScoreText =
            aScore === undefined
              ? "-"
              : aScore === 0
                ? "E"
                : aScore > 0
                  ? "+" + aScore
                  : aScore;
          const bScoreText =
            bScore === undefined
              ? "-"
              : bScore === 0
                ? "E"
                : bScore > 0
                  ? "+" + bScore
                  : bScore;
          const finalScoreText = p.isEmptySlot
            ? "-"
            : finalScore === 0
              ? "E"
              : finalScore > 0
                ? "+" + finalScore
                : finalScore;
          const finalColor = p.isEmptySlot ? "#333" : scoreColor;

          return `
          <tr>
            <td class="rank-cell col-rank">${p.rank}</td>
            <td class="name-cell col-player">${p.userNickname}</td>
            <td class="score-cell col-course">${aScoreText}</td>
            <td class="score-cell col-course">${bScoreText}</td>
            <td class="total-cell col-total" style="color:${finalColor}">${finalScoreText}</td>
          </tr>`;
        })
        .join("");

      return `
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="col-rank">RANK</th>
                <th class="col-player">PLAYER</th>
                <th class="col-course">A</th>
                <th class="col-course">B</th>
                <th class="col-total">TOTAL</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    };

    container.innerHTML =
      renderTable(filledPlayers.slice(0, half)) +
      renderTable(filledPlayers.slice(half));
  };

  const overviewModal = document.getElementById("tv-overview-modal");
  if (overviewModal) {
    document.getElementById("btn-open-overview").onclick = () =>
      overviewModal.classList.add("active");
    document.getElementById("btn-close-overview").onclick = () =>
      overviewModal.classList.remove("active");
    overviewModal.addEventListener("click", (e) => {
      if (e.target === overviewModal) overviewModal.classList.remove("active");
    });
  }

  await fetchLeaderboardData(stage);
  renderData();
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(async () => {
    await fetchLeaderboardData(stage);
    renderData();
  }, 30000);
}
