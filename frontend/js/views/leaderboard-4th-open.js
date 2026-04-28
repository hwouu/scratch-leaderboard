import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let refreshInterval;

export async function renderLeaderboard4thOpenPage(stage, appElement) {
  const styles = `
    body { background-color: #0d0e10 !important; color: #fff; font-family: 'Pretendard', sans-serif; overflow-x: hidden; }
    .tv-wrapper { padding: 2vh 3vw; display: flex; flex-direction: column; gap: 1.5vh; min-height: 100vh; box-sizing: border-box; }
    
    /* 헤더 스타일 */
    .main-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 1.5vh; }
    .title-section h1 { font-size: 3.5vh; margin: 0; font-weight: 900; letter-spacing: -1px; }
    .title-section h1 span { color: var(--accent-yellow); }
    .stage-date { font-size: 1.6vh; color: #888; font-weight: 700; margin-top: 0.5vh; display: block; }
    
    /* 우측 액션 버튼 */
    .header-actions { display: flex; gap: 10px; }
    .btn-glass { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1vh 1.5vw; border-radius: 6px; font-size: 1.6vh; font-weight: 700; cursor: pointer; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: 0.2s;}
    .btn-glass:hover { background: rgba(255,255,255,0.15); border-color: #fff; }

    /* 테이블 그리드 (A, B, C 코스 모두 노출) */
    .tv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2vw; flex: 1; min-height: 0; margin-top: 1vh; }
    .table-container { background: #16181c; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid #2d3139; display: flex; flex-direction: column; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    
    /* 3개 코스가 들어가므로 열 너비 분배 최적화 */
    .col-rank { width: 12%; }
    .col-player { width: 34%; }
    .col-course { width: 12%; }
    .col-total { width: 18%; }

    th { background: #1f2229; color: #888; font-size: 1.4vh; padding: 1.5vh 0; font-weight: 700; border-bottom: 1px solid #2d3139; text-transform: uppercase; }
    td { padding: 1.6vh 0; text-align: center; border-bottom: 1px solid #2d3139; vertical-align: middle; }
    
    .rank-cell { font-size: 2.2vh; font-weight: 900; color: var(--accent-yellow); }
    .name-cell { text-align: left !important; padding-left: 1.5vw !important; font-size: 2vh; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #eee;}
    .score-cell { font-size: 1.8vh; color: #aaa; font-weight: 600; }
    .total-cell { font-size: 2.4vh; font-weight: 900; }

    /* 모달 스타일 */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 3000; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
    .modal-overlay.active { opacity: 1; visibility: visible; }
    .overview-modal-content { position: relative; padding: 20px; text-align: center; max-width: 90vw; }
    .overview-modal-img { max-width: 100%; max-height: 85vh; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .modal-close-btn { position: absolute; top: -15px; right: -15px; background: #16181c; color: #fff; border: 2px solid #333; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: 0.2s; }
    .modal-close-btn:hover { background: var(--accent-red); border-color: var(--accent-red); }

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
          <h1>2025 스크래치 <span>선물팡팡 (4th OPEN)</span></h1>
          <span class="stage-date">대회 종료 (2025.12.15 ~ 2026.01.09)</span>
        </div>
        <div class="header-actions">
          <button id="btn-open-overview-4th" class="btn-glass"><i class="fas fa-info-circle"></i> 대회 개요</button>
          <a href="/" class="btn-glass"><i class="fas fa-home"></i> 2026 대회 보기</a>
        </div>
      </header>
      
      <main class="tv-grid" id="tv-grid-container">
        <div style="grid-column:1/-1; text-align:center; padding:5vh; color:#888; font-size: 1.8vh;">
          <i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> 과거 대회 데이터를 불러오는 중...
        </div>
      </main>
    </div>

    <div id="tv-overview-modal-4th" class="modal-overlay">
      <div class="overview-modal-content">
        <button id="btn-close-overview-4th" class="modal-close-btn">&times;</button>
        <img src="/assets/4th-open-overview.jpeg" class="overview-modal-img" onerror="this.src='https://placehold.co/800x1131/1a1c1e/eaeaea?text=Image+Not+Found'" />
      </div>
    </div>
  `;

  const overviewModal = document.getElementById("tv-overview-modal-4th");
  if (overviewModal) {
    document.getElementById("btn-open-overview-4th").onclick = () =>
      overviewModal.classList.add("active");
    document.getElementById("btn-close-overview-4th").onclick = () =>
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

    // 4th Open은 A, B, C 3개 코스의 성적을 모두 보여줌
    const players = data.total.slice(0, 40); // 상위 40명 노출
    const half = Math.ceil(players.length / 2);

    const renderTable = (list) => {
      const rows = list
        .map((p) => {
          const aScore = data.courseA?.find(
            (cp) => cp.userId === p.userId,
          )?.score;
          const bScore = data.courseB?.find(
            (cp) => cp.userId === p.userId,
          )?.score;
          const cScore = data.courseC?.find(
            (cp) => cp.userId === p.userId,
          )?.score;

          const formatScore = (s) =>
            s === undefined ? "-" : s === 0 ? "E" : s > 0 ? "+" + s : s;

          const finalScore =
            p.totalScore !== undefined ? p.totalScore : p.score;
          const scoreColor =
            finalScore < 0
              ? "var(--accent-blue)"
              : finalScore > 0
                ? "var(--accent-red)"
                : "#fff";

          return `
          <tr>
            <td class="rank-cell col-rank">${p.rank}</td>
            <td class="name-cell col-player">${p.userNickname}</td>
            <td class="score-cell col-course">${formatScore(aScore)}</td>
            <td class="score-cell col-course">${formatScore(bScore)}</td>
            <td class="score-cell col-course">${formatScore(cScore)}</td>
            <td class="total-cell col-total" style="color:${scoreColor}">${formatScore(finalScore)}</td>
          </tr>`;
        })
        .join("");

      return `
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="col-rank">RANK</th>
                <th class="col-player" style="text-align:left; padding-left:1.5vw;">PLAYER</th>
                <th class="col-course">A</th>
                <th class="col-course">B</th>
                <th class="col-course">C</th>
                <th class="col-total">TOTAL</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    };

    container.innerHTML =
      renderTable(players.slice(0, half)) + renderTable(players.slice(half));
  };

  await fetchLeaderboardData(stage);
  renderData();

  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(async () => {
    await fetchLeaderboardData(stage);
    renderData();
  }, 60 * 1000); // 과거 대회이므로 서버 부하를 줄이기 위해 1분마다 갱신
}
