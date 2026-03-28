import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let refreshInterval;

export async function renderLeaderboard2026_1st(stage, appElement) {
  appElement.innerHTML = `
    <style>
      .tv-board-container { padding: 2rem; max-width: 1400px; margin: 0 auto; color: var(--text-color); font-family: sans-serif; }
      .tv-board-title { text-align: center; font-size: 3rem; font-weight: 900; margin-bottom: 2rem; color: #f39c12; }
      .tv-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem 3rem; }
      .tv-row { display: flex; align-items: center; background: var(--card-bg, #222); padding: 1rem 1.5rem; border-radius: 8px; font-size: 1.5rem; font-weight: bold; border: 1px solid transparent; }
      .tv-row.advanced { border: 2px solid #00ff88; background: rgba(0, 255, 136, 0.05); }
      .tv-rank { width: 60px; font-size: 2rem; color: #aaa; text-align: center; }
      .tv-row.advanced .tv-rank { color: #00ff88; }
      .tv-name { flex-grow: 1; padding-left: 1rem; }
      .tv-rounds { width: 100px; text-align: right; font-size: 1.2rem; color: #888; }
      .tv-score { width: 90px; text-align: right; color: #ff4757; font-size: 1.8rem; }
      .tv-notice { grid-column: 1 / -1; text-align: center; margin-top: 2rem; font-size: 1.8rem; color: #00ff88; font-weight: bold; }
    </style>
    <div class="tv-board-container">
      <div class="tv-board-title">2026 Scratch 1st OPEN 예선 순위 (Top 30)</div>
      <div class="tv-grid" id="tv-grid">
        <div style="grid-column: 1/-1; text-align: center; font-size: 2rem;">데이터를 불러오는 중입니다...</div>
      </div>
    </div>
  `;

  const renderData = () => {
    const data = getLeaderboardData();
    const container = document.getElementById("tv-grid");

    if (!data || !data.total) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: red;">데이터 연동 대기 중입니다.</div>`;
      return;
    }

    const top30 = data.total.slice(0, 30);
    container.innerHTML = top30
      .map((player, index) => {
        const isAdvanced = index < 16;
        return `
        <div class="tv-row ${isAdvanced ? "advanced" : ""}">
          <div class="tv-rank">${player.rank}</div>
          <div class="tv-name">${player.userId}</div>
          <div class="tv-rounds">${player.roundCount} R</div>
          <div class="tv-score">${player.score > 0 ? "+" + player.score : player.score}</div>
        </div>
      `;
      })
      .join("");

    container.innerHTML += `<div class="tv-notice">※ 상위 16명 홀인원 본선 진출 ※</div>`;
  };

  const loadAndRender = async () => {
    await fetchLeaderboardData(stage);
    renderData();
  };

  await loadAndRender();

  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(loadAndRender, 5 * 60 * 1000);
}
