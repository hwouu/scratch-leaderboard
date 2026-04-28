import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let refreshInterval;

export async function renderLeaderboardPage(stage, appElement) {
  const stageInfo = {
    qualifying: { label: "예선", size: 50 },
    32: { label: "32강", size: 32 },
    16: { label: "16강", size: 16 },
    8: { label: "8강", size: 8 },
    4: { label: "4강", size: 4 },
    final: { label: "결승", size: 2 },
  };

  const current = stageInfo[stage] || { label: "리더보드", size: 50 };

  const styles = `
    body { background-color: #0d0e10 !important; color: #fff; font-family: 'Pretendard', sans-serif; overflow-x: hidden; }
    .tv-wrapper { padding: 2vh 3vw; display: flex; flex-direction: column; gap: 1.5vh; min-height: 100vh; box-sizing: border-box; }
    .main-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 1vh; }
    .title-section h1 { font-size: 4vh; margin: 0; font-weight: 900; letter-spacing: -1px; }
    .title-section h1 span { color: var(--accent-blue); }
    
    .tv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2vw; margin-top: 2vh; }
    .table-container { background: #16181c; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid #2d3139; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1f2229; color: #888; font-size: 1.6vh; padding: 1.5vh 0; font-weight: 700; border-bottom: 1px solid #2d3139; }
    td { padding: 1.5vh 0; text-align: center; border-bottom: 1px solid #2d3139; }
    
    .rank-cell { font-size: 2.2vh; font-weight: 900; color: var(--accent-blue); }
    .name-cell { text-align: left !important; padding-left: 2vw !important; font-size: 2vh; font-weight: 700; }
    .score-cell { font-size: 1.8vh; color: #aaa; font-weight: 600; }
    .total-cell { font-size: 2.4vh; font-weight: 900; }

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
          <h1>2025 1st 골목대장 토너먼트 <span>${current.label}</span></h1>
        </div>
        <a href="/" style="color: #888; text-decoration: none; border: 1px solid #555; padding: 0.5vh 1vw; border-radius: 4px; font-size: 1.5vh;">홈으로</a>
      </header>
      <main class="tv-grid" id="tv-grid-container">
        <div style="grid-column:1/-1; text-align:center; padding:5vh; color:#888;">
          <i class="fas fa-spinner fa-spin"></i> 과거 대회 데이터를 불러오는 중...
        </div>
      </main>
    </div>
  `;

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
  }, 60 * 1000); // 과거 대회이므로 1분에 한 번만 갱신
}
