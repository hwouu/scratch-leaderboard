import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let updateInterval;

export async function renderBracket2026_1st(stage, appElement) {
  const styles = `
    .bracket-wrapper {
      min-height: 100vh;
      padding: 2rem 4%;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--bg-main);
      overflow-x: hidden;
      font-family: 'Pretendard', sans-serif;
    }

    /* === 상단 네비게이션 헤더 === */
    .bracket-nav-header {
      width: 100%;
      max-width: 1400px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    
    .bracket-nav-title {
      color: var(--text-primary);
      font-size: 2rem;
      font-weight: 900;
      margin: 0;
    }
    .bracket-nav-title span { color: var(--accent-yellow); }

    .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .action-btn { 
      display: flex; align-items: center; gap: 8px; 
      background-color: transparent; padding: 0.6rem 1.2rem; 
      border-radius: 8px; text-decoration: none; font-size: 1rem; 
      font-weight: 700; transition: all 0.2s ease; cursor: pointer; 
    }
    .btn-overview { border: 1px solid var(--text-secondary); color: var(--text-secondary); }
    .btn-overview:hover { background-color: var(--text-secondary); color: #fff; }
    .btn-home { border: 1px solid var(--accent-green); color: var(--accent-green); }
    .btn-home:hover { background-color: var(--accent-green); color: #fff; box-shadow: 0 0 15px rgba(40,167,69,0.4); }

    /* === 상금 보드 (프리미엄 잭팟 스타일) === */
    .prize-header {
      text-align: center;
      margin-bottom: 3rem;
      width: 100%;
      max-width: 800px;
      padding: 2.5rem;
      background: linear-gradient(145deg, rgba(255,193,7,0.1) 0%, rgba(0,0,0,0) 100%);
      border-radius: 24px;
      border: 1px solid rgba(255,193,7,0.2);
      box-shadow: 0 15px 50px rgba(0,0,0,0.3);
      position: relative;
    }
    
    .prize-title { font-size: 1.2rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 1rem; letter-spacing: 4px; text-transform: uppercase; }
    .prize-amount { font-size: 5.5rem; font-weight: 900; color: var(--accent-yellow); text-shadow: 0 0 40px rgba(255, 193, 7, 0.4); line-height: 1; font-variant-numeric: tabular-nums; }
    .prize-currency { font-size: 2.5rem; color: var(--text-primary); margin-left: 10px; }

    /* === 대진표 컨테이너 및 플렉스 라인 로직 === */
    .bracket-scroll-container {
      width: 100%;
      overflow-x: auto;
      padding: 1rem 0 3rem 0;
      -webkit-overflow-scrolling: touch;
    }

    .bracket-container {
      display: flex;
      justify-content: center;
      gap: 0; /* 라인 연결을 위해 gap을 0으로 두고 내부 패딩 사용 */
      min-width: 1100px;
      margin: 0 auto;
    }

    .round-column {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      width: 240px;
      position: relative;
    }

    .round-title {
      text-align: center;
      color: var(--text-secondary);
      font-weight: 800;
      font-size: 1.1rem;
      margin-bottom: 2rem;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* 매치 페어 (라인이 그려지는 부모) */
    .match-pair {
      position: relative;
      margin: 1.5rem 0;
      padding-right: 30px; /* 오른쪽 연결 라인을 위한 공간 */
    }

    /* 커넥터 라인 (CSS) */
    .match-pair::after {
      content: '';
      position: absolute;
      right: 0;
      top: 25%;
      height: 50%;
      width: 30px;
      border: 2px solid var(--border-color);
      border-left: none;
      border-radius: 0 8px 8px 0;
    }

    /* 컬럼별 간격 및 라인 조정 */
    .round-column:nth-child(2) .match-pair { margin: 4rem 0; }
    .round-column:nth-child(3) .match-pair { margin: 9rem 0; }
    .round-column:last-child .match-pair { margin: 0; padding-right: 0; }
    .round-column:last-child .match-pair::after { display: none; } /* 결승전은 라인 숨김 */

    /* 개별 선수 슬롯 */
    .slot {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      padding: 1rem;
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--text-primary);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
    }
    .slot:first-child { border-radius: 8px 8px 0 0; border-bottom: none; }
    .slot:last-child { border-radius: 0 0 8px 8px; }
    
    .slot-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
    .slot-rank { font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; }
    
    /* 승자 효과 (추후 API 데이터에 따라 클래스 부여 가능) */
    .slot.winner { background: rgba(40,167,69,0.08); border-color: var(--accent-green); color: var(--accent-green); }
    
    /* 결승전 박스 특화 */
    .final-box { border: 2px solid var(--accent-yellow); box-shadow: 0 0 20px rgba(255,193,7,0.2); border-radius: 8px; }
    .final-badge { background: rgba(255,193,7,0.1); color: var(--accent-yellow); text-align: center; padding: 0.5rem; font-size: 0.9rem; font-weight: 800; border-bottom: 1px solid rgba(255,193,7,0.3); }

    .bracket-footer {
      margin-top: 2rem;
      font-size: 1.1rem;
      color: var(--text-secondary);
      font-weight: 600;
      text-align: center;
      background: rgba(255,255,255,0.03);
      padding: 1rem 2rem;
      border-radius: 50px;
      border: 1px solid rgba(255,255,255,0.05);
    }

    /* === 애니메이션 === */
    @keyframes jackpotBurst { 0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; } 80% { opacity: 1; } 100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(var(--scale)); opacity: 0; } }
    .casino-coin { position: absolute; top: 30%; left: 50%; font-size: 3rem; pointer-events: none; z-index: 9999; animation: jackpotBurst 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
    
    @keyframes textGlow { 0% { text-shadow: 0 0 30px rgba(255, 193, 7, 0.4); transform: scale(1); } 50% { text-shadow: 0 0 80px rgba(255, 193, 7, 1), 0 0 120px rgba(255, 255, 255, 0.6); transform: scale(1.05); color: #fffacd; } 100% { text-shadow: 0 0 30px rgba(255, 193, 7, 0.4); transform: scale(1); } }
    .prize-amount.rolling { animation: textGlow 0.4s ease-in-out infinite alternate; }

    /* === 개요 모달 === */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 3000; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
    .modal-overlay.active { opacity: 1; visibility: visible; }
    .overview-modal-content { position: relative; padding: 20px; text-align: center; max-width: 90vw; }
    .overview-modal-img { max-width: 100%; max-height: 85vh; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .modal-close-btn { position: absolute; top: -15px; right: -15px; background: var(--bg-surface); color: var(--text-primary); border: 2px solid var(--border-color); width: 45px; height: 45px; border-radius: 50%; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: 0.2s; }
    .modal-close-btn:hover { background: var(--accent-red); color: white; border-color: var(--accent-red); transform: scale(1.1); }

    /* === 모바일 반응형 === */
    @media (max-width: 768px) {
      .bracket-wrapper { padding: 1.5rem 4%; }
      .bracket-nav-header { flex-direction: column; align-items: flex-start; gap: 1rem; border-bottom: none; }
      .bracket-nav-title { font-size: 1.6rem; }
      .header-actions { width: 100%; justify-content: space-between; }
      .action-btn { font-size: 0.85rem; padding: 0.6rem 1rem; flex: 1; justify-content: center; }
      
      .prize-header { padding: 1.5rem 1rem; margin-bottom: 1.5rem; border-radius: 16px; }
      .prize-title { font-size: 1rem; letter-spacing: 2px; }
      .prize-amount { font-size: 3.5rem; }
      .prize-currency { font-size: 1.5rem; }
      
      /* 모바일에서는 대진표를 축소하여 스크롤 유도 */
      .bracket-container { transform: scale(0.85); transform-origin: top left; }
      .bracket-footer { font-size: 0.95rem; padding: 0.8rem 1rem; }
    }
  `;

  appElement.innerHTML = `
    <style>${styles}</style>
    <div class="bracket-wrapper" id="bracket-tv-wrapper">
      
      <header class="bracket-nav-header">
        <h1 class="bracket-nav-title">2026 SCRATCH 1st <span>BRACKET</span></h1>
        <div class="header-actions">
          <button id="btn-open-overview" class="action-btn btn-overview"><i class="fas fa-file-alt"></i> 대회 개요</button>
          <a href="/" class="action-btn btn-home"><i class="fas fa-list-ol"></i> 실시간 랭킹 보기</a>
        </div>
      </header>

      <div class="prize-header">
        <div class="prize-title">Tournament Hole-In-One Prize</div>
        <div class="prize-amount" id="bracket-prize-amount">0<span class="prize-currency">원</span></div>
      </div>

      <div class="bracket-scroll-container">
        <div class="bracket-container" id="bracket-render-area">
          <div style="text-align: center; width: 100%; padding: 4rem 0; color: var(--text-secondary);">
            <i class="fas fa-spinner fa-spin" style="margin-right:10px; font-size:1.5rem;"></i> 대진표 데이터를 불러오는 중...
          </div>
        </div>
      </div>

      <div class="bracket-footer">
        "결승전 중 홀인원 달성 시 누적 상금 전액 100% 지급"
      </div>

    </div>

    <div id="tv-overview-modal" class="modal-overlay">
      <div class="overview-modal-content">
        <button id="btn-close-overview" class="modal-close-btn">&times;</button>
        <img src="/assets/2026-1st-overview.jpg" alt="대회 개요" class="overview-modal-img" onerror="this.src='https://placehold.co/800x1131/1a1c1e/eaeaea?text=Image+Not+Found'" />
      </div>
    </div>
  `;

  // 모달 이벤트 바인딩
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
    const emojis = ["💰", "✨", "🏆", "💸"];
    for (let i = 0; i < 24; i++) {
      const coin = document.createElement("div");
      coin.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      coin.className = "casino-coin";
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 300;
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

  // API 배열(data/result 등)에서 slotNo 기준으로 선수 정보 추출
  const getPlayer = (bracketResponse, slotNo) => {
    if (!bracketResponse) return { name: "준비중", rank: "-" };
    let players = [];
    if (Array.isArray(bracketResponse)) players = bracketResponse;
    else if (bracketResponse.data && Array.isArray(bracketResponse.data))
      players = bracketResponse.data;
    else if (bracketResponse.result && Array.isArray(bracketResponse.result))
      players = bracketResponse.result;

    const player = players.find((p) => p.slotNo === slotNo);
    return player && player.userNickname
      ? { name: player.userNickname, rank: player.preliminaryRank || "-" }
      : { name: "준비중", rank: "-" };
  };

  const renderBracketUI = () => {
    const data = getLeaderboardData();
    const renderArea = document.getElementById("bracket-render-area");
    if (!renderArea) return;

    const b16 = data?.bracket16;
    const b8 = data?.bracket8;
    const b4 = data?.bracket4;
    const bFinal = data?.bracketFinal;

    // 16강 (8쌍)
    let html16 =
      '<div class="round-column"><div class="round-title">ROUND OF 16</div>';
    for (let i = 0; i < 8; i++) {
      const p1 = getPlayer(b16, i * 2 + 1);
      const p2 = getPlayer(b16, i * 2 + 2);
      html16 += `
        <div class="match-pair">
          <div class="slot"><span class="slot-name">${p1.name}</span> <span class="slot-rank">#${p1.rank}</span></div>
          <div class="slot"><span class="slot-name">${p2.name}</span> <span class="slot-rank">#${p2.rank}</span></div>
        </div>`;
    }
    html16 += "</div>";

    // 8강 (4쌍)
    let html8 =
      '<div class="round-column"><div class="round-title">QUARTER FINAL</div>';
    for (let i = 0; i < 4; i++) {
      const p1 = getPlayer(b8, i * 2 + 1);
      const p2 = getPlayer(b8, i * 2 + 2);
      html8 += `
        <div class="match-pair">
          <div class="slot"><span class="slot-name">${p1.name}</span></div>
          <div class="slot"><span class="slot-name">${p2.name}</span></div>
        </div>`;
    }
    html8 += "</div>";

    // 4강 (2쌍)
    let html4 =
      '<div class="round-column"><div class="round-title">SEMI FINAL</div>';
    for (let i = 0; i < 2; i++) {
      const p1 = getPlayer(b4, i * 2 + 1);
      const p2 = getPlayer(b4, i * 2 + 2);
      html4 += `
        <div class="match-pair">
          <div class="slot"><span class="slot-name">${p1.name}</span></div>
          <div class="slot"><span class="slot-name">${p2.name}</span></div>
        </div>`;
    }
    html4 += "</div>";

    // 결승 (1쌍, 커넥터 라인 제외)
    const f1 = getPlayer(bFinal, 1);
    const f2 = getPlayer(bFinal, 2);
    let htmlFinal = `
      <div class="round-column">
        <div class="round-title" style="color:var(--accent-yellow)">THE FINAL</div>
        <div class="match-pair">
          <div class="final-box">
            <div class="final-badge">👑 FINAL MATCH 🏆</div>
            <div class="slot" style="font-size:1.3rem; padding: 1.5rem 1rem;"><span class="slot-name">${f1.name}</span></div>
            <div class="slot" style="font-size:1.3rem; padding: 1.5rem 1rem; border-top: 1px solid var(--border-color);"><span class="slot-name">${f2.name}</span></div>
          </div>
        </div>
      </div>`;

    renderArea.innerHTML = html16 + html8 + html4 + htmlFinal;
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
      console.error("상금 및 대진표 데이터 오류", e);
    }
  };

  await updatePrizeData();
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(updatePrizeData, 60 * 1000); // 1분 갱신
}
