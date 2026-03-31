import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let refreshInterval;

export async function renderLeaderboard2026_1st_courses(stage, appElement) {
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
      
      /* 3단 그리드 레이아웃 */
      .tv-grid-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2.5vw;
        flex: 1;
        margin-top: 1rem;
        align-items: start; 
      }
      
      /* 깔끔하고 모던한 카드형 패널 스타일 */
      .course-panel {
        display: flex;
        flex-direction: column;
        background-color: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        overflow: hidden;
      }

      /* 헤더 색상 통일 및 크기 축소 */
      .course-title {
        text-align: center;
        font-size: 1.3rem;
        font-weight: 800;
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.03);
        padding: 1rem;
        margin: 0;
        border-bottom: 1px solid var(--border-color);
        letter-spacing: 1px;
      }
      
      .table-container { margin: 0; }
      table { width: 100%; display: table; table-layout: fixed; border-collapse: collapse; } 
      thead { display: table-header-group; }
      tbody { display: table-row-group; }
      tr { display: table-row; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
      tr:last-child { border-bottom: none; }
      
      th { font-size: 0.9rem; padding: 1rem 0.5rem; text-align: center; color: var(--text-secondary); font-weight: 700; }
      td { padding: 0.9rem 0.5rem; text-align: center; } 
      
      .rank { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); }
      .nickname { font-size: 1.2rem; font-weight: 700; padding-left: 1.5rem !important; text-align: left; color: var(--text-primary); }
      .final-score { font-size: 1.5rem; font-weight: 800; }
      
      /* 1등 강조 효과 (은은하게) */
      .top1-row td { background-color: rgba(255, 193, 7, 0.06); }
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
        <div class="title-container" style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
          
          <div style="display: flex; align-items: center; gap: 1.5rem;">
            <h1 style="font-size: 2.2rem; margin: 0;">2026 Scratch 1st OPEN</h1>
            <span class="live-indicator" style="font-size: 0.9rem; padding: 0.3rem 0.6rem;">LIVE</span>
            <span class="subtitle-text" style="font-size: 1.1rem; color: var(--accent-green); font-weight: 700;">
              코스별 랭킹 (Top 10)
            </span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 2rem;">
            <span class="last-updated" style="font-size: 0.9rem; color: var(--text-secondary);">
              마지막 업데이트: <span id="tv-last-updated">-</span>
            </span>
            <div class="header-actions">
              <button onclick="window.close()" class="action-btn btn-back">
                <i class="fas fa-times"></i> 창 닫기
              </button>
            </div>
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

  // 개별 코스 데이터를 보정치가 적용된 totalScore 기준으로 재정렬하고 순위를 매기는 함수
  const processCourseData = (courseArray) => {
    if (!courseArray || courseArray.length === 0) return [];

    // 1. 보정치가 적용된 최종 점수(finalScore) 도출
    let processed = courseArray.map((p) => ({
      ...p,
      finalScore: p.totalScore !== undefined ? p.totalScore : p.score,
    }));

    // 2. 점수 오름차순 정렬
    processed.sort((a, b) => a.finalScore - b.finalScore);

    // 3. 공동 순위(Tie) 계산
    let currentRank = 1;
    let tieCount = 0;

    processed.forEach((p, i) => {
      if (i === 0) {
        p.calculatedRank = currentRank;
        p.isTieRank = false;
      } else {
        const prev = processed[i - 1];
        if (p.finalScore === prev.finalScore) {
          p.calculatedRank = currentRank;
          p.isTieRank = true;
          prev.isTieRank = true;
          tieCount++;
        } else {
          currentRank += tieCount + 1;
          p.calculatedRank = currentRank;
          p.isTieRank = false;
          tieCount = 0;
        }
      }
    });

    return processed.slice(0, 10);
  };

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

    const top10A = processCourseData(data.courseA);
    const top10B = processCourseData(data.courseB);
    const top10C = processCourseData(data.courseC);

    const renderCourseTable = (title, players) => {
      if (players.length === 0) {
        return `
          <div class="course-panel">
            <h2 class="course-title">${title}</h2>
            <div style="padding: 4rem 1rem; text-align: center; color: var(--text-secondary);">
              데이터 없음
            </div>
          </div>`;
      }

      const headHTML = `
        <thead>
          <tr>
            <th style="width: 18%;">순위</th>
            <th style="width: 54%; text-align: left; padding-left: 1.5rem;">선수 닉네임</th>
            <th style="width: 28%;">성적</th>
          </tr>
        </thead>`;

      const bodyHTML = players
        .map((player) => {
          const rank = player.isTieRank
            ? `T${player.calculatedRank}`
            : player.calculatedRank;
          const isTop1 = player.calculatedRank === 1 ? "top1-row" : "";

          let scoreColor = "var(--text-primary)";
          if (player.finalScore > 0) scoreColor = "var(--accent-red)";
          if (player.finalScore < 0) scoreColor = "var(--accent-blue)";
          const scoreText =
            player.finalScore === 0
              ? "E"
              : player.finalScore > 0
                ? `+${player.finalScore}`
                : player.finalScore;

          return `
          <tr class="${isTop1}">
            <td class="rank">${rank}</td>
            <td class="nickname">${player.userNickname}</td>
            <td class="final-score" style="color: ${scoreColor};">${scoreText}</td>
          </tr>`;
        })
        .join("");

      return `
        <div class="course-panel">
          <h2 class="course-title">${title}</h2>
          <div class="table-container">
            <table>${headHTML}<tbody>${bodyHTML}</tbody></table>
          </div>
        </div>`;
    };

    container.innerHTML =
      renderCourseTable("A 코스", top10A) +
      renderCourseTable("B 코스", top10B) +
      renderCourseTable("C 코스", top10C);
  };

  const loadAndRender = async () => {
    await fetchLeaderboardData(stage);
    renderData();
  };

  await loadAndRender();

  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(loadAndRender, 5 * 60 * 1000);
}
