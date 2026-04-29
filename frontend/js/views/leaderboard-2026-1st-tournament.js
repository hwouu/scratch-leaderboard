import { fetchData } from "../services/api.js";

let refreshInterval;

/**
 * 단계(stage)에 따른 설정값을 반환합니다.
 */
function getTournamentConfig(stage) {
  const base = {
    "2026-1st-16": { name: "16강 본선", advanceCount: 8, total: 16, date: "4/28(화) ~ 5/2(토)", courses: "A: 아크로CC / B: 써닝포인트CC" },
    "2026-1st-8": { name: "8강 본선", advanceCount: 4, total: 8, date: "5/2(토) ~ 5/6(수)", courses: "A: 아크로CC / B: 써닝포인트CC" },
    "2026-1st-4": { name: "4강 본선", advanceCount: 2, total: 4, date: "5/6(수) ~ 5/10(일)", courses: "A: 아크로CC / B: 써닝포인트CC" },
    "2026-1st-third-place": { name: "3·4위전", advanceCount: 1, total: 2, date: "5/10(일) ~ 5/13(수)", courses: "A: 아크로CC / B: 써닝포인트CC" },
    "2026-1st-final": { name: "결승전", advanceCount: 1, total: 2, date: "5/10(일) ~ 5/13(수)", courses: "A: 아크로CC / B: 써닝포인트CC" }
  };
  return base[stage] || { name: "토너먼트", advanceCount: 0, total: 16, date: "-", courses: "-" };
}

function renderSkeletonTable(rowCount) {
  const rows = Array.from({ length: rowCount }).map(() => `
    <tr class="tb-skeleton-row">
      <td><div class="tb-skeleton-box short"></div></td>
      <td class="tb-player"><div class="tb-skeleton-box left"></div></td>
      <td class="tb-hide-mobile"><div class="tb-skeleton-box short"></div></td>
      <td class="tb-hide-mobile"><div class="tb-skeleton-box short"></div></td>
      <td><div class="tb-skeleton-box short"></div></td>
    </tr>
  `).join('');

  return `
    <div class="tb-table-container">
      <table class="tb-table">
        <colgroup>
          <col style="width: 15%;">
          <col style="width: 40%;">
          <col style="width: 15%;" class="tb-hide-mobile">
          <col style="width: 15%;" class="tb-hide-mobile">
          <col style="width: 15%;">
        </colgroup>
        <thead>
          <tr>
            <th>순위</th>
            <th class="tb-player">선수 정보</th>
            <th class="tb-hide-mobile">A코스</th>
            <th class="tb-hide-mobile">B코스</th>
            <th>합산성적</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

export async function renderLeaderboard2026_1st_tournament(stage, appElement) {
  if (!document.getElementById('tournament-board-style')) {
    const link = document.createElement('link');
    link.id = 'tournament-board-style'; link.rel = 'stylesheet'; link.href = '/css/tournament-board.css';
    document.head.appendChild(link);
  }

  const config = getTournamentConfig(stage);
  const halfCount = 8;
  const stagePrefix = config.name.split(' ')[0];

  appElement.innerHTML = `
    <div class="tb-wrapper">
      <header class="tb-header">
        <div class="tb-title-group">
          <h1 class="tb-title">2026 Scratch 1st <span style="color:var(--accent-yellow)">OPEN</span> <span class="tb-live-badge">LIVE</span></h1>
          <div class="header-actions" style="display:flex; gap:8px;">
            <button id="btn-refresh-tb" class="btn-glass"><i class="fas fa-sync-alt"></i> <span class="btn-text">새로고침</span></button>
            <button id="btn-open-overview-tb" class="btn-glass" style="color: var(--accent-blue); border-color: var(--accent-blue);"><i class="fas fa-info-circle"></i> <span class="btn-text">대회 개요</span></button>
            <a href="/2026-1st/bracket" class="btn-glass btn-bracket" style="color: var(--accent-yellow); border-color: var(--accent-yellow);"><i class="fas fa-sitemap"></i> <span class="btn-text">대진표</span></a>
          </div>
        </div>

        <div class="tb-info-bar">
          <div class="tb-info-left">
            <div class="tb-info-stage">${config.name} <span>(상위 ${config.advanceCount}명 진출)</span></div>
            <div class="tb-info-item"><i class="fas fa-calendar-alt"></i> ${stagePrefix} 진행 기간: <span class="tb-info-value">${config.date}</span></div>
            <div class="tb-info-item"><i class="fas fa-map-marker-alt"></i> 코스 정보: <span class="tb-info-value">${config.courses}</span></div>
          </div>
          <div class="tb-info-update">
            <i class="fas fa-clock"></i> 최근 업데이트: <span id="tb-last-updated" class="tb-info-update-time">-</span>
          </div>
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
        <img src="/assets/2026-1st-overview.jpg" style="max-width: 100%; max-height: 85vh; border-radius: 12px; position: relative;" />
      </div>
    </div>

    <div id="player-detail-modal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 4000; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: 0.3s;">
      <div class="player-modal-content">
        <button id="btn-close-player-modal" class="player-modal-close"><i class="fas fa-times"></i></button>
        <div class="player-modal-header" id="pm-name">선수명</div>
        <div class="player-modal-row"><span class="label">현재 순위</span><span class="value" id="pm-rank">-</span></div>
        <div class="player-modal-row"><span class="label">A코스 점수</span><span class="value" id="pm-a">-</span></div>
        <div class="player-modal-row"><span class="label">B코스 점수</span><span class="value" id="pm-b">-</span></div>
        <div class="player-modal-row" style="margin-top: 1.5rem; border-top: 1px solid #333; padding-top: 1.2rem; align-items: center;">
          <span class="label" style="color: #fff; font-weight: 800;">합산 성적</span>
          <span class="value" id="pm-total" style="font-size: 1.8rem; font-weight: 900;">-</span>
        </div>
      </div>
    </div>
  `;

  const formatScore = (s) => s === undefined || s === null ? '-' : (s === 0 ? 'E' : (s > 0 ? `+${s}` : s));
  const getScoreColor = (score) => score > 0 ? '#ff4757' : (score < 0 ? '#3b82f6' : '#fff');

  const generateTableHtml = (playersGroup) => {
    const rowsHTML = playersGroup.map((player, idx) => {
      // 1. 데이터가 없는 빈 슬롯은 모바일에서 숨기기 위해 'tb-empty-row' 클래스 부여
      if (!player || !player.userId) {
        return `<tr class="tb-empty-row"><td class="tb-rank" style="color:#333;">-</td><td class="tb-player"><span class="tb-name" style="color:#333;">-</span></td><td class="tb-hide-mobile">-</td><td class="tb-hide-mobile">-</td><td>-</td></tr>`;
      }

      const isTopEight = player.rank <= 8;
      const isCutoffLine = player.rank === config.advanceCount && (playersGroup[idx + 1]?.rank > config.advanceCount || idx === playersGroup.length - 1);
      
      let rowClass = isTopEight ? 'tb-row-top-eight' : '';
      if (isCutoffLine) rowClass += ' tb-cutoff-line';

      const scoresArr = player.scores || [];
      const aScore = scoresArr[0] ? scoresArr[0].score : null;
      const bScore = scoresArr[1] ? scoresArr[1].score : null;
      
      const scoreStr = formatScore(player.totalScore);
      const scoreColor = getScoreColor(player.totalScore);
      const rankStr = player.isTieRank ? `T${player.rank}` : player.rank;
      const f_aScore = formatScore(aScore);
      const f_bScore = formatScore(bScore);

      // 2. 행(Row) 클릭 이벤트를 위해 data-* 속성 및 'clickable player-row' 클래스 주입
      return `
        <tr class="${rowClass} clickable player-row" 
            data-name="${player.userNickname}" 
            data-rank="${rankStr}" 
            data-a="${f_aScore}" 
            data-b="${f_bScore}" 
            data-total="${scoreStr}" 
            data-color="${scoreColor}">
          <td class="tb-rank">${rankStr}</td>
          <td class="tb-player"><span class="tb-name">${player.userNickname}</span></td>
          <td class="tb-score tb-hide-mobile">${f_aScore}</td>
          <td class="tb-score tb-hide-mobile">${f_bScore}</td>
          <td class="tb-final-score" style="color: ${scoreColor};">${scoreStr}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="tb-table-container">
        <table class="tb-table">
          <colgroup>
            <col style="width: 15%;">
            <col style="width: 40%;">
            <col style="width: 15%;" class="tb-hide-mobile">
            <col style="width: 15%;" class="tb-hide-mobile">
            <col style="width: 15%;">
          </colgroup>
          <thead>
            <tr>
              <th>순위</th>
              <th class="tb-player">선수 정보</th>
              <th class="tb-hide-mobile">A코스</th>
              <th class="tb-hide-mobile">B코스</th>
              <th>합산성적</th>
            </tr>
          </thead>
          <tbody>${rowsHTML}</tbody>
        </table>
      </div>
    `;
  };

  const renderData = async () => {
    const rawData = await fetchData(stage);
    const timeEl = document.getElementById('tb-last-updated');
    if (timeEl) timeEl.textContent = new Date().toLocaleTimeString('ko-KR');
    const contentArea = document.getElementById('tb-content-area');

    if (!rawData || !rawData.total) {
      contentArea.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888;">데이터를 불러오지 못했습니다.</div>`;
      return;
    }

    const players = rawData.total;
    let paddedPlayers = [...players];
    while (paddedPlayers.length < 16) paddedPlayers.push({});

    const col1 = paddedPlayers.slice(0, 8);
    const col2 = paddedPlayers.slice(8, 16);

    contentArea.innerHTML = generateTableHtml(col1) + generateTableHtml(col2);
  };

  // 새로고침 버튼 이벤트
  document.getElementById("btn-refresh-tb").onclick = async () => {
    document.getElementById('tb-content-area').innerHTML = renderSkeletonTable(halfCount) + renderSkeletonTable(halfCount);
    document.getElementById('tb-last-updated').textContent = "업데이트 중...";
    await renderData();
  };

  // 개요 모달 이벤트
  const modal = document.getElementById("tb-overview-modal");
  document.getElementById("btn-open-overview-tb").onclick = () => { modal.style.opacity = "1"; modal.style.visibility = "visible"; };
  document.getElementById("btn-close-overview-tb").onclick = () => { modal.style.opacity = "0"; modal.style.visibility = "hidden"; };

  // [NEW] 선수 상세 정보 모달 제어 이벤트 (이벤트 위임 활용)
  const pModal = document.getElementById("player-detail-modal");
  document.getElementById("tb-content-area").addEventListener("click", (e) => {
    const row = e.target.closest(".player-row");
    if (!row) return;

    // data-* 속성 읽어서 모달 내용 채우기
    document.getElementById("pm-name").textContent = row.dataset.name;
    document.getElementById("pm-rank").textContent = row.dataset.rank + "위";
    document.getElementById("pm-a").textContent = row.dataset.a;
    document.getElementById("pm-b").textContent = row.dataset.b;
    
    const totalEl = document.getElementById("pm-total");
    totalEl.textContent = row.dataset.total;
    totalEl.style.color = row.dataset.color;

    // 모달 띄우기
    pModal.style.opacity = "1";
    pModal.style.visibility = "visible";
  });

  document.getElementById("btn-close-player-modal").onclick = () => { pModal.style.opacity = "0"; pModal.style.visibility = "hidden"; };
  pModal.onclick = (e) => { if (e.target === pModal) { pModal.style.opacity = "0"; pModal.style.visibility = "hidden"; } };

  await renderData();
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(renderData, 5 * 60 * 1000);
}