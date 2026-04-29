import { fetchData } from "../services/api.js";

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
 * 스켈레톤 테이블 UI를 생성합니다.
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
            <th style="width: 12%;">순위</th>
            <th class="tb-player" style="width: 32%;">선수 정보</th>
            <th class="tb-hide-mobile" style="width: 12%;">Rnd</th>
            <th class="tb-hide-mobile" style="width: 12%;">A코스</th>
            <th class="tb-hide-mobile" style="width: 12%;">B코스</th>
            <th style="width: 20%;">합산성적</th>
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
  const halfCount = Math.ceil(config.total / 2) || 8; // 좌우 분할을 위한 절반 카운트 (16강 기준 8명)

  // 2. 기본 뼈대, 헤더 버튼(대회 개요 복구), 스켈레톤 초기 렌더링
  appElement.innerHTML = `
    <div class="tb-wrapper">
      <header class="tb-header">
        <div class="tb-title-group">
          <h1 class="tb-title">2026 Scratch 1st <span class="tb-live-badge">LIVE</span></h1>
          <div class="header-actions" style="display:flex; gap:10px; flex-wrap: wrap;">
            <button id="btn-open-overview-tb" class="btn-glass" style="border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; background: transparent; font-weight: bold;"><i class="fas fa-info-circle"></i> 대회 개요</button>
            <a href="/2026-1st/bracket" class="btn-glass" style="border: 1px solid var(--accent-yellow); color: var(--accent-yellow); padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: bold;"><i class="fas fa-sitemap"></i> 대진표 보기</a>
          </div>
        </div>
        <div class="tb-subtitle-group">
          <span class="tb-subtitle">${config.name} (Top ${config.advanceCount} 진출)</span>
          <span style="font-size: 0.9rem; color: #888;">업데이트: <span id="tb-last-updated">-</span></span>
        </div>
      </header>

      <main id="tb-content-area" class="tb-grid">
        ${renderSkeletonTable(halfCount)}
        ${renderSkeletonTable(halfCount)}
      </main>
    </div>

    <div id="tb-overview-modal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 3000; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: 0.3s;">
      <div class="overview-modal-content" style="position: relative; padding: 20px; text-align: center; max-width: 90vw;">
        <button id="btn-close-overview-tb" style="position: absolute; top: -15px; right: -15px; background: #16181c; color: #fff; border: 2px solid #333; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer; z-index: 3001;">&times;</button>
        <img src="/assets/2026-1st-overview.jpg" class="overview-modal-img" style="max-width: 100%; max-height: 85vh; border-radius: 12px; position: relative; z-index: 3000;" />
      </div>
    </div>
  `;

  // 모달 제어 이벤트 바인딩
  const modal = document.getElementById("tb-overview-modal");
  document.getElementById("btn-open-overview-tb").onclick = () => { modal.style.opacity = "1"; modal.style.visibility = "visible"; };
  document.getElementById("btn-close-overview-tb").onclick = () => { modal.style.opacity = "0"; modal.style.visibility = "hidden"; };
  modal.onclick = (e) => { if (e.target === modal) { modal.style.opacity = "0"; modal.style.visibility = "hidden"; } };

  // 점수 포맷팅 유틸
  const formatScore = (s) => s === undefined || s === null ? '-' : (s === 0 ? 'E' : (s > 0 ? `+${s}` : s));
  const getScoreColor = (score) => score > 0 ? 'var(--accent-red, #ff4757)' : (score < 0 ? 'var(--accent-blue, #3b82f6)' : '#fff');

  // 테이블 생성기 (1단위 테이블)
  const generateTableHtml = (playersGroup, startIndex) => {
    if (!playersGroup || playersGroup.length === 0) return `<div></div>`;

    const rowsHTML = playersGroup.map((player, idx) => {
      // 데이터가 없는 빈 슬롯 패딩 처리
      if (!player || !player.userId) {
        return `<tr style="visibility:hidden;"><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>`;
      }

      // 진출 여부 및 컷오프 계산
      const isAdvance = player.rank <= config.advanceCount;
      const isCutoffLine = player.rank === config.advanceCount && 
                           (idx + 1 === playersGroup.length || playersGroup[idx + 1]?.rank > config.advanceCount);
      
      let rowClass = isAdvance ? 'tb-row-advance' : 'tb-row-eliminated';
      if (isCutoffLine) rowClass += ' tb-cutoff-line';

      // API 제공 원본 배열에서 점수 추출 (별도 집계 우회)
      const scoresArr = player.scores || [];
      const aScore = scoresArr[0] ? scoresArr[0].score : null;
      const bScore = scoresArr[1] ? scoresArr[1].score : null;
      
      // 이미 계산되어 내려온 totalScore 직접 사용
      const finalScore = player.totalScore;
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

    return `
      <div class="tb-table-container">
        <table class="tb-table">
          <thead>
            <tr>
              <th style="width: 12%;">순위</th>
              <th class="tb-player" style="width: 32%;">선수 정보</th>
              <th class="tb-hide-mobile" style="width: 12%;">Rnd</th>
              <th class="tb-hide-mobile" style="width: 12%;">A코스</th>
              <th class="tb-hide-mobile" style="width: 12%;">B코스</th>
              <th style="width: 20%;">합산성적</th>
            </tr>
          </thead>
          <tbody>${rowsHTML}</tbody>
        </table>
      </div>
    `;
  };

  // 3. 실제 API 데이터 Fetch 및 렌더링
  const renderData = async () => {
    // 주의: 프론트단 재가공(api.js)을 피하기 위해 fetchData를 직접 호출하여 순수 API 원본 확보
    const rawData = await fetchData(stage);
    
    const timeEl = document.getElementById('tb-last-updated');
    if (timeEl) timeEl.textContent = new Date().toLocaleTimeString('ko-KR');
    const contentArea = document.getElementById('tb-content-area');

    if (!rawData || !rawData.total || rawData.total.length === 0) {
      contentArea.innerHTML = `<div class="tb-table-container" style="grid-column: 1/-1; padding: 3rem; text-align: center; color: #888;">아직 해당 라운드의 데이터가 없습니다.</div>`;
      return;
    }

    const players = rawData.total;
    
    // 좌우 8명씩 레이아웃이 무너지지 않도록 부족한 개수만큼 빈 객체 패딩 삽입
    let paddedPlayers = [...players];
    while (paddedPlayers.length < config.total) {
      paddedPlayers.push({});
    }

    // 배열을 좌측 / 우측용으로 분할
    const col1 = paddedPlayers.slice(0, halfCount);
    const col2 = paddedPlayers.slice(halfCount, config.total);

    // 2단 그리드 렌더링
    contentArea.innerHTML = generateTableHtml(col1, 0) + generateTableHtml(col2, halfCount);
  };

  // 최초 데이터 로드 및 갱신 셋업
  await renderData();

  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(renderData, 5 * 60 * 1000); // 5분마다 갱신
}