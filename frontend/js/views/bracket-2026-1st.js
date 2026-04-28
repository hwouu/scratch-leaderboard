import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let updateInterval;

export async function renderBracket2026_1st(stage, appElement) {
  const styles = `
    .bracket-wrapper {
      min-height: 100vh;
      padding: 2rem 5%;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--bg-main);
      overflow-x: hidden;
    }

    /* [신규] 상단 네비게이션 헤더 */
    .bracket-nav-header {
      width: 100%;
      max-width: 1200px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 0 1rem;
    }
    
    .bracket-nav-title {
      color: var(--text-primary);
      font-size: 1.8rem;
      margin: 0;
    }
    .bracket-nav-title span { color: var(--accent-yellow); }

    .header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .action-btn { display: flex; align-items: center; gap: 8px; background-color: transparent; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-size: 0.95rem; font-weight: 700; transition: all 0.2s ease; cursor: pointer; }
    .btn-overview { border: 1px solid var(--accent-blue); color: var(--accent-blue); }
    .btn-overview:hover { background-color: var(--accent-blue); color: #fff; }
    .btn-home { border: 1px solid var(--accent-green); color: var(--accent-green); }
    .btn-home:hover { background-color: var(--accent-green); color: #fff; }

    /* 대회 개요 모달 */
    .overview-modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85); z-index: 3000;
      display: flex; justify-content: center; align-items: center;
      opacity: 0; visibility: hidden; transition: all 0.3s ease;
    }
    .overview-modal-overlay.active { opacity: 1; visibility: visible; }
    .overview-modal-content { position: relative; padding: 20px; text-align: center; max-width: 90vw; }
    .overview-modal-img { max-width: 100%; max-height: 85vh; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .overview-modal-close {
      position: absolute; top: -10px; right: -10px;
      background: var(--bg-surface-accent); color: var(--text-primary);
      border: 2px solid var(--border-color); width: 40px; height: 40px; border-radius: 50%; font-size: 24px;
      cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;
    }

    .prize-header {
      text-align: center;
      margin-bottom: 2rem;
      width: 100%;
      max-width: 900px;
      padding: 2rem;
      background: var(--bg-surface);
      border-radius: 20px;
      border: 1px solid rgba(255,193,7,0.3);
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      position: relative;
      z-index: 10;
    }
    
    .prize-title { font-size: 1.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.5rem; letter-spacing: 2px; }
    .prize-amount { font-size: 5rem; font-weight: 900; color: var(--accent-yellow); text-shadow: 0 0 30px rgba(255, 193, 7, 0.3); line-height: 1; font-variant-numeric: tabular-nums; }
    .prize-currency { font-size: 2rem; color: var(--text-primary); }

    .bracket-scroll-container { width: 100%; overflow-x: auto; padding-bottom: 2rem; -webkit-overflow-scrolling: touch; }
    .bracket-container { display: flex; justify-content: center; gap: 3rem; min-width: 1000px; margin: 0 auto; }
    .round-column { display: flex; flex-direction: column; justify-content: space-around; gap: 1.5rem; flex: 1; }
    .round-title { text-align: center; color: var(--text-secondary); font-weight: 700; font-size: 1.1rem; margin-bottom: 1rem; letter-spacing: 1px; }
    .match-box { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); overflow: hidden; width: 180px; margin: 0 auto; position: relative; }
    .player-slot { padding: 0.8rem 1rem; font-weight: 700; font-size: 1rem; color: var(--text-primary); text-align: center; background: rgba(255,255,255,0.02); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .player-slot:first-child { border-bottom: 1px solid var(--border-color); }
    .final-box { border: 2px solid var(--accent-yellow); box-shadow: 0 0 20px rgba(255,193,7,0.2); }
    .bracket-footer { margin-top: 2rem; font-size: 1.2rem; color: var(--text-secondary); font-weight: 600; text-align: center; background: rgba(255,255,255,0.05); padding: 1rem 2rem; border-radius: 50px; }

    @keyframes jackpotBurst { 0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; } 80% { opacity: 1; } 100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(var(--scale)); opacity: 0; } }
    .casino-coin { position: absolute; top: 30%; left: 50%; font-size: 3rem; pointer-events: none; z-index: 9999; animation: jackpotBurst 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
    @keyframes textGlow { 0% { text-shadow: 0 0 30px rgba(255, 193, 7, 0.4); transform: scale(1); } 50% { text-shadow: 0 0 80px rgba(255, 193, 7, 1), 0 0 120px rgba(255, 255, 255, 0.6); transform: scale(1.05); color: #fffacd; } 100% { text-shadow: 0 0 30px rgba(255, 193, 7, 0.4); transform: scale(1); } }
    .prize-amount.rolling { animation: textGlow 0.4s ease-in-out infinite alternate; }

    @media (max-width: 768px) {
      .bracket-wrapper { padding: 1rem 3%; }
      .bracket-nav-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .bracket-nav-title { font-size: 1.4rem; }
      .action-btn { font-size: 0.8rem; padding: 0.4rem 0.6rem; }
      .prize-header { padding: 1.5rem 1rem; margin-bottom: 1.5rem; }
      .prize-title { font-size: 1.2rem; }
      .prize-amount { font-size: 3.5rem; }
      .prize-currency { font-size: 1.5rem; }
      .bracket-footer { font-size: 1rem; padding: 0.8rem 1.5rem; }
    }
  `;

  appElement.innerHTML = `
    <style>${styles}</style>
    <div class="bracket-wrapper" id="bracket-tv-wrapper">
      
      <header class="bracket-nav-header">
        <h1 class="bracket-nav-title">2026 Scratch 1st <span>본선 대진표</span></h1>
        <div class="header-actions">
          <button id="btn-open-overview" class="action-btn btn-overview"><i class="fas fa-file-alt"></i> 대회 개요</button>
          <a href="/" class="action-btn btn-home"><i class="fas fa-list-ol"></i> 현재 라운드 랭킹</a>
        </div>
      </header>

      <div class="prize-header">
        <div class="prize-title">🏆 본선 홀인원 누적 상금 🏆</div>
        <div class="prize-amount" id="bracket-prize-amount">0<span class="prize-currency">원</span></div>
      </div>

      <div class="bracket-scroll-container">
        <div class="bracket-container" id="bracket-render-area">
          <p style="color:white; font-size: 1.2rem;"><i class="fas fa-spinner fa-spin" style="margin-right:10px;"></i>대진표 데이터를 불러오는 중...</p>
        </div>
      </div>

      <div class="bracket-footer">
        "결승전 중 홀인원은 첫번째에 모두 지급"
      </div>

    </div>

    <div id="tv-overview-modal" class="overview-modal-overlay">
      <div class="overview-modal-content">
        <button id="btn-close-overview" class="overview-modal-close">&times;</button>
        <img src="/assets/2026-1st-overview.jpg" alt="대회 개요 포스터" class="overview-modal-img" onerror="this.src='https://placehold.co/800x1131/1a1c1e/eaeaea?text=Image+Not+Found'" />
      </div>
    </div>
  `;

  // 모달 제어 이벤트
  const overviewModal = document.getElementById("tv-overview-modal");
  if (overviewModal) {
    document
      .getElementById("btn-open-overview")
      .addEventListener("click", () => overviewModal.classList.add("active"));
    document
      .getElementById("btn-close-overview")
      .addEventListener("click", () =>
        overviewModal.classList.remove("active"),
      );
    overviewModal.addEventListener("click", (e) => {
      if (e.target === overviewModal) overviewModal.classList.remove("active");
    });
  }

  const triggerJackpot = () => {
    const wrapper = document.getElementById("bracket-tv-wrapper");
    if (!wrapper) return;
    const emojis = ["💰", "✨", "🏆"];
    for (let i = 0; i < 20; i++) {
      const coin = document.createElement("div");
      coin.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      coin.className = "casino-coin";
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 250;
      coin.style.setProperty("--tx", Math.cos(angle) * distance + "px");
      coin.style.setProperty("--ty", Math.sin(angle) * distance + "px");
      coin.style.setProperty("--scale", 0.6 + Math.random() * 0.8);
      wrapper.appendChild(coin);
      setTimeout(() => coin.remove(), 1200);
    }
  };

  const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;
    if (start < end) {
      triggerJackpot();
      element.classList.add("rolling");
    }
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeOut * (end - start) + start);
      element.innerHTML = `${current.toLocaleString()}<span class="prize-currency">원</span>`;
      if (progress < 1) window.requestAnimationFrame(step);
      else {
        element.innerHTML = `${end.toLocaleString()}<span class="prize-currency">원</span>`;
        element.classList.remove("rolling");
      }
    };
    window.requestAnimationFrame(step);
  };

  const getPlayerName = (bracketResponse, slotNo) => {
    if (!bracketResponse) return "준비중";
    let players = [];
    if (Array.isArray(bracketResponse)) players = bracketResponse;
    else if (bracketResponse.data && Array.isArray(bracketResponse.data))
      players = bracketResponse.data;
    else if (bracketResponse.result && Array.isArray(bracketResponse.result))
      players = bracketResponse.result;

    const player = players.find((p) => p.slotNo === slotNo);
    return player && player.userNickname ? player.userNickname : "준비중";
  };

  const renderBracketUI = () => {
    const data = getLeaderboardData();
    const renderArea = document.getElementById("bracket-render-area");
    if (!renderArea) return;

    const b16 = data?.bracket16;
    const b8 = data?.bracket8;
    const b4 = data?.bracket4;
    const bFinal = data?.bracketFinal;

    let round16Html =
      '<div class="round-column"><div class="round-title">16강</div>';
    for (let i = 0; i < 8; i++) {
      round16Html += `
        <div class="match-box">
          <div class="player-slot">${getPlayerName(b16, i * 2 + 1)}</div>
          <div class="player-slot">${getPlayerName(b16, i * 2 + 2)}</div>
        </div>`;
    }
    round16Html += "</div>";

    let round8Html =
      '<div class="round-column"><div class="round-title">8강</div>';
    for (let i = 0; i < 4; i++) {
      round8Html += `
        <div class="match-box">
          <div class="player-slot">${getPlayerName(b8, i * 2 + 1)}</div>
          <div class="player-slot">${getPlayerName(b8, i * 2 + 2)}</div>
        </div>`;
    }
    round8Html += "</div>";

    let round4Html =
      '<div class="round-column"><div class="round-title">4강</div>';
    for (let i = 0; i < 2; i++) {
      round4Html += `
        <div class="match-box">
          <div class="player-slot">${getPlayerName(b4, i * 2 + 1)}</div>
          <div class="player-slot">${getPlayerName(b4, i * 2 + 2)}</div>
        </div>`;
    }
    round4Html += "</div>";

    let roundFinalHtml = `
      <div class="round-column">
        <div class="round-title" style="color:var(--accent-yellow)">결승전</div>
        <div class="match-box final-box">
          <div class="player-slot" style="color:var(--accent-yellow); font-size:0.8rem; background:rgba(255,193,7,0.1)">👑 FINAL 🏆</div>
          <div class="player-slot" style="font-size:1.2rem">${getPlayerName(bFinal, 1)}</div>
          <div class="player-slot" style="font-size:1.2rem">${getPlayerName(bFinal, 2)}</div>
        </div>
      </div>`;

    renderArea.innerHTML =
      round16Html + round8Html + round4Html + roundFinalHtml;
  };

  const updatePrizeData = async () => {
    try {
      await fetchLeaderboardData(stage);
      renderBracketUI();

      // 상금 계산: 예선게임수(3838) X 2,000원 X (1/2^n)
      const qualifyTotalRounds = 3838;
      const tournamentHoleInOneCount = 0;
      const targetAmount = Math.floor(
        qualifyTotalRounds * 2000 * Math.pow(0.5, tournamentHoleInOneCount),
      );

      const amountEl = document.getElementById("bracket-prize-amount");
      if (!amountEl) return;
      const currentText = amountEl.textContent.replace(/[^0-9]/g, "");
      const currentAmount = parseInt(currentText) || 0;

      if (currentAmount !== targetAmount) {
        animateValue(amountEl, currentAmount, targetAmount, 2000);
      }
    } catch (e) {
      console.error("상금 및 대진표 업데이트 에러", e);
    }
  };

  await updatePrizeData();
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(updatePrizeData, 5 * 60 * 1000);
}
