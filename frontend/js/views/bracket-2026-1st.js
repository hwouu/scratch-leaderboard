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

    /* === 상단 상금 영역 === */
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
    
    .prize-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
      letter-spacing: 2px;
    }
    
    .prize-amount {
      font-size: 5rem;
      font-weight: 900;
      color: var(--accent-yellow);
      text-shadow: 0 0 30px rgba(255, 193, 7, 0.3);
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    
    .prize-currency {
      font-size: 2rem;
      color: var(--text-primary);
    }

    /* === 대진표 레이아웃 === */
    .bracket-scroll-container {
      width: 100%;
      overflow-x: auto;
      padding-bottom: 2rem;
      -webkit-overflow-scrolling: touch;
    }

    .bracket-container {
      display: flex;
      justify-content: center;
      gap: 3rem;
      min-width: 1000px; /* 모바일에서도 구조 유지 */
      margin: 0 auto;
    }

    .round-column {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      gap: 1.5rem;
      flex: 1;
    }

    .round-title {
      text-align: center;
      color: var(--text-secondary);
      font-weight: 700;
      font-size: 1.1rem;
      margin-bottom: 1rem;
      letter-spacing: 1px;
    }

    .match-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      overflow: hidden;
      width: 180px;
      margin: 0 auto;
      position: relative;
    }

    .player-slot {
      padding: 0.8rem 1rem;
      font-weight: 700;
      font-size: 1rem;
      color: var(--text-primary);
      text-align: center;
      background: rgba(255,255,255,0.02);
    }
    .player-slot:first-child { border-bottom: 1px solid var(--border-color); }
    .player-slot.winner { color: var(--accent-green); background: rgba(40,167,69,0.05); }
    
    .final-box {
      border: 2px solid var(--accent-yellow);
      box-shadow: 0 0 20px rgba(255,193,7,0.2);
    }

    .bracket-footer {
      margin-top: 2rem;
      font-size: 1.2rem;
      color: var(--text-secondary);
      font-weight: 600;
      text-align: center;
      background: rgba(255,255,255,0.05);
      padding: 1rem 2rem;
      border-radius: 50px;
    }

    /* === 애니메이션 === */
    @keyframes jackpotBurst {
      0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; }
      80% { opacity: 1; }
      100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(var(--scale)); opacity: 0; }
    }
    .casino-coin { position: absolute; top: 30%; left: 50%; font-size: 3rem; pointer-events: none; z-index: 9999; animation: jackpotBurst 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
    
    @keyframes textGlow {
      0% { text-shadow: 0 0 30px rgba(255, 193, 7, 0.4); transform: scale(1); }
      50% { text-shadow: 0 0 80px rgba(255, 193, 7, 1), 0 0 120px rgba(255, 255, 255, 0.6); transform: scale(1.05); color: #fffacd; }
      100% { text-shadow: 0 0 30px rgba(255, 193, 7, 0.4); transform: scale(1); }
    }
    .prize-amount.rolling { animation: textGlow 0.4s ease-in-out infinite alternate; }

    /* === 반응형 === */
    @media (max-width: 768px) {
      .bracket-wrapper { padding: 1rem 3%; }
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
      
      <div class="prize-header">
        <div class="prize-title">🏆 본선 홀인원 누적 상금 🏆</div>
        <div class="prize-amount" id="bracket-prize-amount">0<span class="prize-currency">원</span></div>
      </div>

      <div class="bracket-scroll-container">
        <div class="bracket-container">
          
          <div class="round-column">
            <div class="round-title">16강</div>
            ${Array(8)
              .fill(0)
              .map(
                () => `
              <div class="match-box">
                <div class="player-slot">준비중</div>
                <div class="player-slot">준비중</div>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <div class="round-column">
            <div class="round-title">8강</div>
            ${Array(4)
              .fill(0)
              .map(
                () => `
              <div class="match-box">
                <div class="player-slot">-</div>
                <div class="player-slot">-</div>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <div class="round-column">
            <div class="round-title">4강</div>
            ${Array(2)
              .fill(0)
              .map(
                () => `
              <div class="match-box">
                <div class="player-slot">-</div>
                <div class="player-slot">-</div>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <div class="round-column">
            <div class="round-title" style="color:var(--accent-yellow)">결승전</div>
            <div class="match-box final-box">
              <div class="player-slot" style="color:var(--accent-yellow); font-size:0.8rem; background:rgba(255,193,7,0.1)">👑 FINAL 🏆</div>
              <div class="player-slot" style="font-size:1.2rem">-</div>
              <div class="player-slot" style="font-size:1.2rem">-</div>
            </div>
          </div>

        </div>
      </div>

      <div class="bracket-footer">
        "결승전 중 홀인원은 첫번째에 모두 지급"
      </div>

    </div>
  `;

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

  const updatePrizeData = async () => {
    try {
      // 본선 상금 계산 공식: 예선게임수 X 2,000원 X (1/2^n)
      // 추후 확정 데이터 연동 시 아래 변수 값 교체 요망
      const qualifyTotalRounds = 1500; // [임시 데이터] 예선 총 라운드 수
      const tournamentHoleInOneCount = 0; // [임시 데이터] 본선 누적 홀인원 수 n

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
      console.error("상금 렌더링 에러", e);
    }
  };

  await updatePrizeData();
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(updatePrizeData, 5 * 60 * 1000);
}
