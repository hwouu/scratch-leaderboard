import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let refreshInterval;

/**
 * 단계(stage)에 따른 진출자 수와 라운드 이름을 반환합니다.
 */
function getTournamentConfig(stage) {
  if (stage.includes("-16")) return { name: "16강 본선", advanceCount: 8, total: 16 };
  if (stage.includes("-8")) return { name: "8강 본선", advanceCount: 4, total: 8 };
  if (stage.includes("-4")) return { name: "4강 본선", advanceCount: 2, total: 4 };
  if (stage.includes("-third-place")) return { name: "3·4위전", advanceCount: 1, total: 2 };
  if (stage.includes("-final")) return { name: "결승전", advanceCount: 1, total: 2 };
  return { name: "토너먼트", advanceCount: 0, total: 0 };
}

/**
 * 16강 기준 스켈레톤 테이블 UI를 생성합니다.
 */
function renderSkeletonTable(rowCount) {
  const rows = Array.from({ length: rowCount }).map(() => `
    <tr class="tb-skeleton-row">
      <td><div class="tb-skeleton-box short"></div></td>
      <td class="tb-player"><div class="tb-skeleton-box left"></div></td>
      <td class="tb-hide-mobile"><div class="tb-skeleton-box short"></div></td>
      <td class="tb-hide-mobile"><div class="tb-skeleton-box short"></div></td>
      <td class="tb-hide-mobile"><div class="tb-skeleton-box short"></div></td>
      <td><div class="tb-skeleton-box short"></div></td>
    </tr>
  `).join('');

  return `
    <div class="tb-table-container">
      <table class="tb-table">
        <thead>
          <tr>
            <th style="width: 10%;">순위</th>
            <th class="tb-player" style="width: 30%;">선수 정보</th>
            <th class="tb-hide-mobile" style="width: 15%;">라운드 수</th>
            <th class="tb-hide-mobile" style="width: 15%;">A코스</th>
            <th class="tb-hide-mobile" style="width: 15%;">B코스</th>
            <th style="width: 15%;">합산성적</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

export async function renderLeaderboard2026_1st_tournament(stage, appElement) {
  // 1. 외부 CSS 동적 로드
  if (!document.getElementById('tournament-board-style')) {
    const link = document.createElement('link');
    link.id = 'tournament-board-style';
    link.rel = 'stylesheet';
    link.href = '/css/tournament-board.css';
    document.head.appendChild(link);
  }

  const config = getTournamentConfig(stage);

  // 2. 기본 뼈대 및 스켈레톤 초기 렌더링
  appElement.innerHTML = `
    <div class="tb-wrapper">
      <header class="tb-header">
        <div class="tb-title-group">
          <h1 class="tb-title">2026 Scratch 1st <span class="tb-live-badge">LIVE</span></h1>
          <div class="header-actions" style="display:flex; gap:10px;">
            <a href="/2026-1st/bracket" class="btn-glass" style="border: 1px solid var(--accent-yellow); color: var(--accent-yellow); padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: bold;"><i class="fas fa-sitemap"></i> 대진표 보기</a>
          </div>
        </div>
        <div class="tb-subtitle-group">
          <span class="tb-subtitle">${config.name} (Top ${config.advanceCount} 진출)</span>
          <span style="font-size: 0.9rem; color: #888;">업데이트: <span id="tb-last-updated">-</span></span>
        </div>
      </header>

      <main id="tb-content-area">
        ${renderSkeletonTable(config.total || 8)}
      </main>
    </div>
  `;

  // 점수 포맷팅 유틸
  const formatScore = (s) => s === undefined || s === null ? '-' : (s === 0 ? 'E' : (s > 0 ? `+${s}` : s));
  const getScoreColor = (score) => score > 0 ? 'var(--accent-red, #ff4757)' : (score < 0 ? 'var(--accent-blue, #3b82f6)' : '#fff');

  // 3. 실제 데이터 렌더링 함수
  const renderData = () => {
    const data = getLeaderboardData();
    const timeEl = document.getElementById('tb-last-updated');
    if (timeEl) timeEl.textContent = new Date().toLocaleTimeString('ko-KR');

    const contentArea = document.getElementById('tb-content-area');
    
    // 데이터 가공 오류 및 빈 데이터 방어
    if (!data || !data.total || data.total.length === 0) {
      contentArea.innerHTML = `<div class="tb-table-container" style="padding: 3rem; text-align: center; color: #888;">아직 해당 라운드의 데이터가 없습니다.</div>`;
      return;
    }

    const players = data.total;

    const rowsHTML = players.map((player, index) => {
      // 진출 여부 계산 로직
      const isAdvance = player.rank <= config.advanceCount;
      const isCutoffLine = player.rank === config.advanceCount && index < players.length - 1 && players[index + 1].rank > config.advanceCount;
      
      let rowClass = isAdvance ? 'tb-row-advance' : 'tb-row-eliminated';
      if (isCutoffLine) rowClass += ' tb-cutoff-line';

      const aScore = data.courseA?.find(p => p.userId === player.userId)?.score;
      const bScore = data.courseB?.find(p => p.userId === player.userId)?.score;
      
      const finalScore = player.totalScore !== undefined ? player.totalScore : player.score;
      const scoreStr = formatScore(finalScore);
      const scoreColor = getScoreColor(finalScore);

      const rankStr = player.isTieRank ? `T${player.rank}` : player.rank;

      return `
        <tr class="${rowClass}">
          <td class="tb-rank">${rankStr}</td>
          <td class="tb-player"><span class="tb-name">${player.userNickname}</span></td>
          <td class="tb-hide-mobile" style="font-weight: 500;">${player.roundCount || 0}</td>
          <td class="tb-score tb-hide-mobile">${formatScore(aScore)}</td>
          <td class="tb-score tb-hide-mobile">${formatScore(bScore)}</td>
          <td class="tb-final-score" style="color: ${scoreColor};">${scoreStr}</td>
        </tr>
      `;
    }).join('');

    contentArea.innerHTML = `
      <div class="tb-table-container">
        <table class="tb-table">
          <thead>
            <tr>
              <th style="width: 10%;">순위</th>
              <th class="tb-player" style="width: 30%;">선수 정보</th>
              <th class="tb-hide-mobile" style="width: 15%;">라운드 수</th>
              <th class="tb-hide-mobile" style="width: 15%;">A코스</th>
              <th class="tb-hide-mobile" style="width: 15%;">B코스</th>
              <th style="width: 15%;">합산성적</th>
            </tr>
          </thead>
          <tbody>${rowsHTML}</tbody>
        </table>
      </div>
    `;
  };

  // 4. 최초 로드 및 갱신 인터벌 설정
  const loadAndRender = async () => {
    await fetchLeaderboardData(stage);
    renderData();
  };

  await loadAndRender();

  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(loadAndRender, 5 * 60 * 1000); // 5분마다 갱신
}