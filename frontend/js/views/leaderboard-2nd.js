import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let refreshInterval;

export async function renderLeaderboard2ndPage(stage, appElement) {
  const stageInfo = {
    "2nd-qualifying": { label: "예선", size: 50 },
    "2nd-64": { label: "64강", size: 64 },
    "2nd-32": { label: "32강", size: 32 },
    "2nd-16": { label: "16강", size: 16 },
    "2nd-8": { label: "8강", size: 8 },
    "2nd-4": { label: "4강", size: 4 },
    "2nd-final": { label: "결승", size: 2 },
  };

  const current = stageInfo[stage] || { label: "리더보드", size: 50 };

  const styles = `
    body { background-color: #0d0e10 !important; color: #fff; font-family: 'Pretendard', sans-serif; overflow-x: hidden; }
    .tv-wrapper { padding: 2vh 3vw; display: flex; flex-direction: column; gap: 1.5vh; min-height: 100vh; box-sizing: border-box; }
    .main-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 1vh; }
    .title-section h1 { font-size: 4vh; margin: 0; font-weight: 900; letter-spacing: -1px; }
    .title-section h1 span { color: var(--accent-blue); }
    .header-actions { display: flex; gap: 10px; }
    .btn-glass { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1vh 1.5vw; border-radius: 6px; font-size: 1.6vh; font-weight: 700; cursor: pointer; text-decoration: none; display: flex; align-items: center; gap: 8px;}
    .btn-glass:hover { background: rgba(255,255,255,0.15); border-color: #fff; }
    
    .tv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2vw; margin-top: 2vh; }
    .table-container { background: #16181c; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid #2d3139; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1f2229; color: #888; font-size: 1.6vh; padding: 1.5vh 0; font-weight: 700; border-bottom: 1px solid #2d3139; }
    td { padding: 1.5vh 0; text-align: center; border-bottom: 1px solid #2d3139; }
    
    .rank-cell { font-size: 2.2vh; font-weight: 900; color: var(--text-primary); }
    .name-cell { text-align: left !important; padding-left: 2vw !important; font-size: 2vh; font-weight: 700; }
    .score-cell { font-size: 1.8vh; color: #aaa; font-weight: 600; }
    .total-cell { font-size: 2.4vh; font-weight: 900; }

    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 3000; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
    .modal-overlay.active { opacity: 1; visibility: visible; }
    .overview-modal-content { position: relative; padding: 20px; text-align: center; max-width: 90vw; }
    .overview-modal-img { max-width: 100%; max-height: 85vh; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .modal-close-btn { position: absolute; top: -15px; right: -15px; background: #16181c; color: #fff; border: 2px solid #333; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; }

    @media (max-width: 768px) {
      .tv-grid { grid-template-columns: 1fr; }
      .name-cell { padding-left: 1rem !important; }
    }
  `;

  appElement.innerHTML = `
    <style>${styles}</style>
    <div class="tv-wrapper">
      <header class="main-header">
        <div class="title-section">
          <h1>2025 2nd 골목대장 토너먼트 <span>${current.label}</span></h1>
        </div>
        <div class="header-actions">
          <button id="btn-open-overview-2nd" class="btn-glass"><i class="fas fa-info-circle"></i> 대회 개요</button>
          <a href="/" class="btn-glass"><i class="fas fa-home"></i> 2026 대회 보기</a>
        </div>
      </header>
      <main class="tv-grid" id="tv-grid-container">
        <div style="grid-column:1/-1; text-align:center; padding:5vh; color:#888;">
          <i class="fas fa-spinner fa-spin"></i> 과거 대회 데이터를 불러오는 중...
        </div>
      </main>
    </div>

    <div id="tv-overview-modal-2nd" class="modal-overlay">
      <div class="overview-modal-content">
        <button id="btn-close-overview-2nd" class="modal-close-btn">&times;</button>
        <img src="/assets/2nd_overview.png" class="overview-modal-img" onerror="this.src='https://placehold.co/800x1131/1a1c1e/eaeaea?text=Image+Not+Found'" />
      </div>
    </div>
  `;

  const overviewModal = document.getElementById("tv-overview-modal-2nd");
  if (overviewModal) {
    document.getElementById("btn-open-overview-2nd").onclick = () =>
      overviewModal.classList.add("active");
    document.getElementById("btn-close-overview-2nd").onclick = () =>
      overviewModal.classList.remove("active");
    overviewModal.addEventListener("click", (e) => {
      if (e.target === overviewModal) overviewModal.classList.remove("active");
    });
  }

  const renderData = () => {
    const data = getLeaderboardData();
    const container = document.getElementById("tv-grid-container");
    if (!data || !data.total || data.total.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:5vh; color:#888;">데이터가 없습니다.</div>`;
      return;
    }

    const half = Math.ceil(data.total.length / 2);

    const renderTable = (list) => {
      const rows = list
        .map((p) => {
          const finalScore =
            p.totalScore !== undefined ? p.totalScore : p.score;
          const scoreColor =
            finalScore < 0
              ? "var(--accent-blue)"
              : finalScore > 0
                ? "var(--accent-red)"
                : "#fff";
          const fScoreText =
            finalScore === 0
              ? "E"
              : finalScore > 0
                ? "+" + finalScore
                : finalScore;

          return `
          <tr>
            <td class="rank-cell" style="width:15%">${p.rank}</td>
            <td class="name-cell" style="width:50%">${p.userNickname}</td>
            <td class="score-cell" style="width:15%">${p.roundCount || "-"}R</td>
            <td class="total-cell" style="width:20%; color:${scoreColor}">${fScoreText}</td>
          </tr>`;
        })
        .join("");

      return `
        <div class="table-container">
          <table>
            <thead>
              <tr><th>RANK</th><th style="text-align:left; padding-left:2vw;">PLAYER</th><th>ROUNDS</th><th>TOTAL</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    };

    container.innerHTML =
      renderTable(data.total.slice(0, half)) +
      renderTable(data.total.slice(half));
  };

  await fetchLeaderboardData(stage);
  renderData();

  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(async () => {
    await fetchLeaderboardData(stage);
    renderData();
  }, 60 * 1000); // 과거 대회이므로 1분에 한 번만 갱신합니다.
}
