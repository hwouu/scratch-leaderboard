import { fetchData } from "../services/api.js";

let refreshInterval;

/**
 * 단계(stage)에 따른 설정값을 반환합니다.
 */
function getTournamentConfig(stage) {
  const base = {
    "2026-1st-16": { name: "16강 본선", advanceCount: 8, total: 16, date: "26.04.28 ~ 26.05.01", courses: "A: 트윈 도브스 골프 / B: 뉴욕 센트럴파크 GC", bracketKey: "bracket16" },
    "2026-1st-8": { name: "8강 본선", advanceCount: 4, total: 8, date: "26.05.02 ~ 26.05.05", courses: "A: 트윈 도브스 골프 / B: 뉴욕 센트럴파크 GC", bracketKey: "bracket8" },
    "2026-1st-4": { name: "4강 본선", advanceCount: 2, total: 4, date: "26.05.06 ~ 26.05.09", courses: "A: 군자리 CC / B: 크리스밸리 CC", bracketKey: "bracket4" },
    "2026-1st-final": { name: "결승전", advanceCount: 1, total: 2, date: "26.05.10 ~ 26.05.13", courses: "A: 군자리 CC / B: 크리스밸리 CC", bracketKey: "bracketFinal" }
  };
  return base[stage] || { name: "토너먼트", advanceCount: 0, total: 16, date: "-", courses: "-", bracketKey: "" };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderSkeletonTable(rowCount) {
  return `
    <div class="tb-table-container">
      <table class="tb-table"><colgroup><col style="width: 15%;"><col style="width: 40%;"><col style="width: 15%;" class="tb-hide-mobile"><col style="width: 15%;" class="tb-hide-mobile"><col style="width: 15%;"></colgroup>
        <thead><tr><th>순위</th><th class="tb-player">선수 정보</th><th class="tb-hide-mobile">A코스</th><th class="tb-hide-mobile">B코스</th><th>합산성적</th></tr></thead>
        <tbody>
          ${Array.from({ length: rowCount }).map(() => `
            <tr class="tb-skeleton-row">
              <td><div class="tb-skeleton-box short"></div></td>
              <td class="tb-player"><div class="tb-skeleton-box left"></div></td>
              <td class="tb-hide-mobile"><div class="tb-skeleton-box short"></div></td>
              <td class="tb-hide-mobile"><div class="tb-skeleton-box short"></div></td>
              <td><div class="tb-skeleton-box short"></div></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

export async function renderLeaderboard2026_1st_tournament(stage, appElement) {
  if (!document.getElementById('tournament-board-style')) {
    const link = document.createElement('link'); link.id = 'tournament-board-style'; link.rel = 'stylesheet'; link.href = '/css/tournament-board.css';
    document.head.appendChild(link);
  }

  const config = getTournamentConfig(stage);
  const halfCount = Math.ceil(config.total / 2);
  const stagePrefix = config.name.split(' ')[0];

  appElement.innerHTML = `
    <div class="tb-wrapper">
      <header class="tb-header">
        <div class="tb-title-group">
          <h1 class="tb-title">2026 Scratch 1st <span style="color:var(--accent-yellow)">OPEN</span> <span class="tb-live-badge">LIVE</span></h1>
          <div class="header-actions" style="display:flex; gap:8px;">
            <button id="btn-refresh-tb" class="btn-glass pc-only-btn"><i class="fas fa-sync-alt"></i> <span class="btn-text">새로고침</span></button>
            <button id="btn-open-overview-tb" class="btn-glass pc-only-btn" style="color: var(--accent-blue); border-color: var(--accent-blue);"><i class="fas fa-info-circle"></i> <span class="btn-text">대회 개요</span></button>
            <a href="/2026-1st/bracket" class="btn-glass btn-bracket"><i class="fas fa-sitemap"></i> <span class="btn-text">대진표 보기</span></a>
          </div>
        </div>

        <div class="tb-info-bar">
          <div class="tb-info-left">
            <div class="tb-info-stage">${config.name} <span>(상위 ${config.advanceCount}명 진출)</span></div>
            <div class="tb-info-item"><i class="fas fa-calendar-alt"></i> ${stagePrefix} 진행 기간: <span class="tb-info-value">${config.date}</span></div>
            <div class="tb-info-item"><i class="fas fa-map-marker-alt"></i> 코스: <span class="tb-info-value">${config.courses}</span></div>
          </div>
          <div class="tb-info-update"><i class="fas fa-clock"></i> 최근 업데이트: <span id="tb-last-updated" class="tb-info-update-time">-</span></div>
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

    <div id="player-detail-modal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 4000; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: 0.3s; backdrop-filter: blur(5px);">
      <div class="player-modal-content">
        <button id="btn-close-player-modal" class="player-modal-close"><i class="fas fa-times"></i></button>
        <div class="pm-vs-container">
          <div class="pm-side pm-me">
            <div class="pm-label">나의 성적</div>
            <div class="pm-name" id="pm-name">-</div>
            <div class="pm-score" id="pm-total">-</div>
          </div>
          <div class="pm-vs-badge">VS</div>
          <div class="pm-side pm-opp">
            <div class="pm-label">상대 선수</div>
            <div class="pm-name" id="pm-opp-name">-</div>
            <div class="pm-score" id="pm-opp-score" style="color: #ccc;">-</div>
          </div>
        </div>
        <div class="pm-status-msg" id="pm-status">-</div>
        <div class="pm-detail-box">
          <div class="pm-detail-row"><span class="label">현재 전체 순위</span><span class="value" id="pm-rank">-</span></div>
          <div class="pm-detail-row"><span class="label">A코스 점수</span><span class="value" id="pm-a">-</span></div>
          <div class="pm-detail-row"><span class="label">B코스 점수</span><span class="value" id="pm-b">-</span></div>
        </div>
      </div>
    </div>
  `;

  const formatScore = (s) => s === undefined || s === null || s === '-' ? '-' : (s === 0 ? 'E' : (s > 0 ? `+${s}` : s));
  const getScoreColor = (score) => score > 0 ? '#ff4757' : (score < 0 ? '#3b82f6' : '#fff');

  const getMatchInfo = (playerName, bracketData, bracketKey) => {
    if (!bracketData || !bracketKey) return null;
    let bList = bracketData[bracketKey] || [];
    if (bList.data) bList = bList.data;
    if (!Array.isArray(bList)) return null;
    const me = bList.find(p => p.userNickname === playerName);
    if (!me) return null;
    const mySlot = me.slotNo;
    const oppSlot = mySlot % 2 === 1 ? mySlot + 1 : mySlot - 1;
    const opp = bList.find(p => p.slotNo === oppSlot);
    return {
      mySeedRank: me.preliminaryRank || me.rank || null,
      oppName: opp && opp.userNickname ? opp.userNickname : '대기중/부전승',
      oppScoreRaw: opp && opp.userNickname ? (opp.totalScore !== undefined ? opp.totalScore : opp.score) : null,
      oppSeedRank: opp && opp.userNickname ? (opp.preliminaryRank || opp.rank || null) : null
    };
  };

  const generateTableHtml = (playersGroup, bracketData) => {
    const hasValidData = playersGroup.some(p => p && p.userId);
    // PC 버전에서는 데이터가 없어도 빈 표(Skeleton/Placeholder)를 보여주기 위해 rowHTML 생성 강제
    const rowsHTML = playersGroup.map((player, idx) => {
      if (!player || !player.userId) {
        return `<tr class="tb-empty-row"><td class="tb-rank" style="color:#333;">-</td><td class="tb-player"><span class="tb-name" style="color:#333;">-</span></td><td class="tb-hide-mobile">-</td><td class="tb-hide-mobile">-</td><td>-</td></tr>`;
      }
      const isAdvancing = player.rank <= config.advanceCount;
      const isCutoffLine = player.rank === config.advanceCount && (playersGroup[idx + 1]?.rank > config.advanceCount || idx === playersGroup.length - 1);
      let rowClass = isAdvancing ? 'tb-row-top-eight' : '';
      if (isCutoffLine) rowClass += ' tb-cutoff-line';
      const scoresArr = player.scores || [];
      const aScore = scoresArr[0] ? scoresArr[0].score : null;
      const bScore = scoresArr[1] ? scoresArr[1].score : null;
      const myScoreRaw = player.totalScore;
      const scoreStr = formatScore(myScoreRaw);
      const scoreColor = getScoreColor(myScoreRaw);
      const rankStr = player.isTieRank ? `T${player.rank}` : player.rank;
      const matchInfo = getMatchInfo(player.userNickname, bracketData, config.bracketKey);
      const oppName = matchInfo ? matchInfo.oppName : '데이터 없음';
      const oppScoreRaw = matchInfo ? matchInfo.oppScoreRaw : null;
      const oppScoreStr = oppScoreRaw !== null && oppScoreRaw !== undefined ? formatScore(oppScoreRaw) : '-';
      const oppScoreColor = getScoreColor(oppScoreRaw);
      const mySeedRank = matchInfo?.mySeedRank ?? "";
      const oppSeedRank = matchInfo?.oppSeedRank ?? "";
      const safePlayerName = escapeHtml(player.userNickname);
      const safeOppName = escapeHtml(oppName);

      return `
        <tr class="${rowClass} clickable player-row" data-name="${safePlayerName}" data-rank="${rankStr}" data-a="${formatScore(aScore)}" data-b="${formatScore(bScore)}" data-total="${scoreStr}" data-color="${scoreColor}" data-raw="${myScoreRaw}" data-seed="${mySeedRank}" data-oppname="${safeOppName}" data-oppscore="${oppScoreStr}" data-oppcolor="${oppScoreColor}" data-oppraw="${oppScoreRaw !== null && oppScoreRaw !== undefined ? oppScoreRaw : 'null'}" data-oppseed="${oppSeedRank}">
          <td class="tb-rank">${rankStr}</td><td class="tb-player"><span class="tb-name">${safePlayerName}</span></td><td class="tb-score tb-hide-mobile">${formatScore(aScore)}</td><td class="tb-score tb-hide-mobile">${formatScore(bScore)}</td><td class="tb-final-score" style="color: ${scoreColor};">${scoreStr}</td>
        </tr>`;
    }).join('');

    return `
      <div class="tb-table-container ${!hasValidData ? 'tb-empty-table-container' : ''}">
        <table class="tb-table"><colgroup><col style="width: 15%;"><col style="width: 40%;"><col style="width: 15%;" class="tb-hide-mobile"><col style="width: 15%;" class="tb-hide-mobile"><col style="width: 15%;"></colgroup>
          <thead><tr><th>순위</th><th class="tb-player">선수 정보</th><th class="tb-hide-mobile">A코스</th><th class="tb-hide-mobile">B코스</th><th>합산성적</th></tr></thead>
          <tbody>${rowsHTML}</tbody>
        </table>
      </div>`;
  };

  const renderData = async () => {
    const [rawData, bracketData] = await Promise.all([
      fetchData(stage).catch(() => null),
      fetchData("2026-1st-bracket").catch(() => null)
    ]);
    const timeEl = document.getElementById('tb-last-updated');
    if (timeEl) timeEl.textContent = new Date().toLocaleTimeString('ko-KR');
    const contentArea = document.getElementById('tb-content-area');
    if (!rawData || !rawData.total || rawData.total.length === 0) {
      contentArea.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 3rem;">아직 해당 라운드의 데이터가 없습니다.</div>`;
      return;
    }
    const players = rawData.total;
    let paddedPlayers = [...players];
    while (paddedPlayers.length < config.total) paddedPlayers.push({});
    const col1 = paddedPlayers.slice(0, halfCount);
    const col2 = paddedPlayers.slice(halfCount, config.total);
    contentArea.innerHTML = generateTableHtml(col1, bracketData) + generateTableHtml(col2, bracketData);
  };

  // 새로고침 및 모달 이벤트 복구
  document.getElementById("btn-refresh-tb").onclick = async () => {
    document.getElementById('tb-content-area').innerHTML = renderSkeletonTable(halfCount) + renderSkeletonTable(halfCount);
    await renderData();
  };
  const modal = document.getElementById("tb-overview-modal");
  document.getElementById("btn-open-overview-tb").onclick = () => { modal.style.opacity = "1"; modal.style.visibility = "visible"; };
  document.getElementById("btn-close-overview-tb").onclick = () => { modal.style.opacity = "0"; modal.style.visibility = "hidden"; };

  // 선수 상세 모달 로직 (위와 동일)
  const pModal = document.getElementById("player-detail-modal");
  document.getElementById("tb-content-area").addEventListener("click", (e) => {
    const row = e.target.closest(".player-row");
    if (!row) return;
    document.getElementById("pm-name").textContent = row.dataset.name;
    document.getElementById("pm-rank").textContent = row.dataset.rank + "위";
    document.getElementById("pm-a").textContent = row.dataset.a;
    document.getElementById("pm-b").textContent = row.dataset.b;
    const totalEl = document.getElementById("pm-total");
    totalEl.textContent = row.dataset.total; totalEl.style.color = row.dataset.color;
    document.getElementById("pm-opp-name").textContent = row.dataset.oppname;
    const oppScoreEl = document.getElementById("pm-opp-score");
    oppScoreEl.textContent = row.dataset.oppscore; oppScoreEl.style.color = row.dataset.oppcolor;
    const statusEl = document.getElementById("pm-status");
    const myRaw = parseFloat(row.dataset.raw); const oppRawStr = row.dataset.oppraw;
    const mySeedRank = parseInt(row.dataset.seed, 10);
    const oppSeedRank = parseInt(row.dataset.oppseed, 10);
    const hasMyScore = !isNaN(myRaw); const hasOppScore = oppRawStr !== 'null' && oppRawStr !== 'undefined' && !isNaN(parseFloat(oppRawStr));
    if (!hasOppScore) {
      statusEl.textContent = hasMyScore ? "상대 기록 대기 중" : "경기 전";
      statusEl.style.color = hasMyScore ? "#fff" : "#aaa";
    } else {
      const oppRaw = parseFloat(oppRawStr); const diff = myRaw - oppRaw;
      if (diff < 0) { statusEl.textContent = `${Math.abs(diff)}타 차 리드 중`; statusEl.style.color = "#fff"; }
      else if (diff > 0) { statusEl.textContent = `${diff}타 차 추격 중`; statusEl.style.color = "#ff4757"; }
      else if (!isNaN(mySeedRank) && !isNaN(oppSeedRank) && mySeedRank !== oppSeedRank) {
        const isSeedAhead = mySeedRank < oppSeedRank;
        statusEl.textContent = isSeedAhead ? `동점, 예선 순위 우세 (${mySeedRank}위)` : `동점, 예선 순위 열세 (${mySeedRank}위)`;
        statusEl.style.color = isSeedAhead ? "#fff" : "#ff4757";
      }
      else { statusEl.textContent = "동점"; statusEl.style.color = "#ffc107"; }
    }
    pModal.style.opacity = "1"; pModal.style.visibility = "visible";
  });
  document.getElementById("btn-close-player-modal").onclick = () => { pModal.style.opacity = "0"; pModal.style.visibility = "hidden"; };

  await renderData();
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(renderData, 5 * 60 * 1000);
}
