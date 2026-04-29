import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let updateInterval;
let jackpotInterval;

/**
 * 스켈레톤 UI 렌더링 (헤더 타이틀 포함)
 */
function renderSkeleton() {
  const skeletonSlot = `<div class="slot skeleton"><div class="slot-info"></div></div>`;
  const skeletonMatch = `<div class="match-pair">${skeletonSlot}${skeletonSlot}</div>`;
  const skeletonRound = (count, title, cssClass = '') => `
    <div class="round-col ${cssClass}">
      <div class="round-header">${title}</div>
      ${Array(count).fill(skeletonMatch).join('')}
    </div>`;

  return `
    <div class="side-wing left">${skeletonRound(4, '16강')}${skeletonRound(2, '8강', 'r-8')}${skeletonRound(1, '4강', 'r-4')}</div>
    <div class="final-center"><div class="final-box skeleton" style="height: 160px;"></div></div>
    <div class="side-wing right">${skeletonRound(4, '16강')}${skeletonRound(2, '8강', 'r-8')}${skeletonRound(1, '4강', 'r-4')}</div>
  `;
}

export async function renderBracket2026_1st(stage, appElement) {
  if (!document.getElementById('bracket-v2-style')) {
    const link = document.createElement('link');
    link.id = 'bracket-v2-style'; link.rel = 'stylesheet'; link.href = '/css/bracket-v2.css';
    document.head.appendChild(link);
  }

  appElement.innerHTML = `
    <div class="bracket-wrapper" id="bracket-tv-wrapper">
      <div class="bracket-nav">
        <h2>2026 SCRATCH 1st <span style="color:var(--accent-yellow)">BRACKET</span> <span class="live-tag">LIVE</span></h2>
        <div class="header-actions">
          <button id="btn-open-overview-br" class="btn-glass" style="color: var(--accent-blue); border-color: var(--accent-blue);">
            <i class="fas fa-info-circle"></i> 개요
          </button>
          <a href="/2026-1st/16" class="btn-glass" style="color: var(--accent-yellow); border-color: var(--accent-yellow);">
            <i class="fas fa-list-ol"></i> 랭킹 보기
          </a>
        </div>
      </div>

      <div class="prize-glass-board">
        <div class="prize-label">Tournament Hole-In-One Prize</div>
        <div class="prize-amount" id="br-prize-amount">0<span class="prize-currency">원</span></div>
      </div>

      <div class="tournament-stage" id="bracket-render-area">
        ${renderSkeleton()}
      </div>

      <div class="footer-note" style="font-size: 1.6vh; color: #777; margin-top: 2vh; font-weight: 600;">
        "결승전 중 홀인원은 첫번째 홀인원 달성자에게 전액(100%) 지급됩니다"
      </div>
    </div>

    <div id="br-overview-modal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 3000; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: 0.3s;">
      <div class="overview-modal-content" style="position: relative; padding: 20px; text-align: center; max-width: 90vw;">
        <button id="btn-close-overview-br" style="position: absolute; top: -15px; right: -15px; background: #16181c; color: #fff; border: 2px solid #333; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer; z-index: 3001;">&times;</button>
        <img src="/assets/2026-1st-overview.jpg" class="overview-modal-img" style="max-width: 100%; max-height: 85vh; border-radius: 12px;" />
      </div>
    </div>
  `;

  // 10초 잭팟 이펙트
  const triggerJackpot = () => {
    const wrapper = document.getElementById("bracket-tv-wrapper");
    if (!wrapper) return;
    const emojis = ["💰", "✨", "🏆", "🔥"];
    for (let i = 0; i < 25; i++) {
      const coin = document.createElement("div");
      coin.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      coin.className = "casino-coin";
      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 300;
      coin.style.setProperty("--tx", Math.cos(angle) * distance + "px");
      coin.style.setProperty("--ty", Math.sin(angle) * distance + "px");
      coin.style.setProperty("--scale", 0.6 + Math.random() * 0.8);
      wrapper.appendChild(coin);
      setTimeout(() => coin.remove(), 1200);
    }
  };

  if (jackpotInterval) clearInterval(jackpotInterval);
  jackpotInterval = setInterval(triggerJackpot, 10000);

  // 상금 롤링 애니메이션
  const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;
    if (start < end) triggerJackpot();
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeOut * (end - start) + start);
      element.innerHTML = `${current.toLocaleString()}<span class="prize-currency">원</span>`;
      if (progress < 1) window.requestAnimationFrame(step);
      else element.innerHTML = `${end.toLocaleString()}<span class="prize-currency">원</span>`;
    };
    window.requestAnimationFrame(step);
  };

  const getPlayer = (rawList, slot) => {
    const players = Array.isArray(rawList) ? rawList : (rawList?.data || []);
    const p = players.find((x) => x.slotNo === slot);
    if (p && p.userNickname) {
      const score = p.totalScore !== undefined ? p.totalScore : (p.score !== undefined ? p.score : null);
      const rank = p.rank || p.preliminaryRank || 999;
      return { name: p.userNickname, rank: rank, score: score, hasData: true };
    }
    return { name: "-", rank: 999, score: null, hasData: false };
  };

  const checkWinner = (p1, p2) => {
    if (!p1.hasData || !p2.hasData || p1.score === null || p2.score === null) return { w1: false, w2: false };
    if (p1.score < p2.score) return { w1: true, w2: false };
    if (p2.score < p1.score) return { w1: false, w2: true };
    if (p1.rank < p2.rank) return { w1: true, w2: false };
    if (p2.rank < p1.rank) return { w1: false, w2: true };
    return { w1: false, w2: false };
  };

  const renderSlot = (p, isWin) => {
    const rankHtml = p.rank !== 999 ? `<span class="slot-rank">${p.rank}</span>` : '';
    const nameHtml = `<span class="slot-name">${p.name}</span>`;
    let scoreStr = '-';
    let scoreColorClass = '';
    
    if (p.score !== null) {
      scoreStr = p.score === 0 ? 'E' : (p.score > 0 ? `+${p.score}` : p.score);
      scoreColorClass = p.score > 0 ? 'score-over' : (p.score < 0 ? 'score-under' : '');
    }
    
    const winClass = isWin ? 'winner' : '';
    return `
      <div class="slot ${winClass}">
        <div class="slot-info">${rankHtml}${nameHtml}</div>
        <span class="slot-score ${scoreColorClass}">${scoreStr}</span>
      </div>`;
  };

  const renderMatches = () => {
    const data = getLeaderboardData();
    if (!data) return;

    const b16 = data.bracket16 || [];
    const b8 = data.bracket8 || [];
    const b4 = data.bracket4 || [];
    const bFinal = data.bracketFinal || [];

    const buildMatchPair = (list, idx1, idx2) => {
      const p1 = getPlayer(list, idx1);
      const p2 = getPlayer(list, idx2);
      const { w1, w2 } = checkWinner(p1, p2);
      return `<div class="match-pair">${renderSlot(p1, w1)}${renderSlot(p2, w2)}</div>`;
    };

    // 좌측 (1~8)
    let leftHtml = '<div class="side-wing left"><div class="round-col"><div class="round-header">16강</div>';
    for (let i = 1; i <= 8; i += 2) leftHtml += buildMatchPair(b16, i, i + 1);
    leftHtml += '</div><div class="round-col r-8"><div class="round-header">8강</div>';
    for (let i = 1; i <= 4; i += 2) leftHtml += buildMatchPair(b8, i, i + 1);
    leftHtml += '</div><div class="round-col r-4"><div class="round-header">4강</div>';
    leftHtml += buildMatchPair(b4, 1, 2);
    leftHtml += '</div></div>';

    // 중앙
    const f1 = getPlayer(bFinal, 1), f2 = getPlayer(bFinal, 2);
    const { w1: fw1, w2: fw2 } = checkWinner(f1, f2);
    const centerHtml = `
      <div class="final-center">
        <div class="final-box">
          <div class="final-label">🏆 FINAL 🏆</div>
          <div style="padding: 1.5vh;">
            ${renderSlot(f1, fw1)}
            <div style="text-align:center; color:#555; padding: 0.5vh 0; font-weight:900; font-size:1.2vh;">VS</div>
            ${renderSlot(f2, fw2)}
          </div>
        </div>
      </div>`;

    // 우측 (9~16)
    let rightHtml = '<div class="side-wing right"><div class="round-col"><div class="round-header">16강</div>';
    for (let i = 9; i <= 16; i += 2) rightHtml += buildMatchPair(b16, i, i + 1);
    rightHtml += '</div><div class="round-col r-8"><div class="round-header">8강</div>';
    for (let i = 5; i <= 8; i += 2) rightHtml += buildMatchPair(b8, i, i + 1);
    rightHtml += '</div><div class="round-col r-4"><div class="round-header">4강</div>';
    rightHtml += buildMatchPair(b4, 3, 4);
    rightHtml += '</div></div>';

    document.getElementById("bracket-render-area").innerHTML = leftHtml + centerHtml + rightHtml;
  };

  const updatePrize = async () => {
    try {
      await fetchLeaderboardData("2026-1st-bracket");
      renderMatches();

      const fixedQualGames = 955;
      const targetAmount = fixedQualGames * 2000;
      const amountEl = document.getElementById("br-prize-amount");
      
      if (amountEl) {
        const currentAmount = parseInt(amountEl.textContent.replace(/[^0-9]/g, "")) || 0;
        if (currentAmount !== targetAmount) animateValue(amountEl, currentAmount, targetAmount, 2000);
      }
    } catch (e) { console.error("Update Error:", e); }
  };

  const modal = document.getElementById("br-overview-modal");
  document.getElementById("btn-open-overview-br").onclick = () => { modal.style.opacity = "1"; modal.style.visibility = "visible"; };
  document.getElementById("btn-close-overview-br").onclick = () => { modal.style.opacity = "0"; modal.style.visibility = "hidden"; };
  modal.onclick = (e) => { if (e.target === modal) { modal.style.opacity = "0"; modal.style.visibility = "hidden"; } };

  await updatePrize();
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(updatePrize, 60000); 
}