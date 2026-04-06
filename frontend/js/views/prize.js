import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let updateInterval;

export async function renderPrizePage(stage, appElement) {
  const styles = `
    .prize-tv-wrapper {
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 3vh 3vw;
      box-sizing: border-box;
      overflow: hidden;
      position: relative;
    }
    
    .prize-content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-top: 2vh;
    }

    .prize-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      padding: 6vh 5vw; /* 패딩 살짝 조절 */
      text-align: center;
      width: 80%;
      max-width: 1400px;
      display: flex;
      flex-direction: column;
      gap: 4vh;
      position: relative;
      z-index: 10;
    }

    .prize-label {
      font-size: 4vh;
      font-weight: 700;
      color: var(--text-secondary);
      letter-spacing: 2px;
    }

    .prize-amount-box {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 1.5vw;
    }

    .prize-amount {
      font-size: 16vh;
      font-weight: 900;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      color: var(--accent-yellow, #ffd700);
      text-shadow: 0 0 30px rgba(255, 193, 7, 0.2);
      transition: color 0.3s ease;
    }

    .prize-currency {
      font-size: 6vh;
      font-weight: 700;
      color: var(--text-primary);
    }

    /* === 예상 최종 누적 상금 (추정치) 스타일 === */
    .estimated-prize-wrapper {
      display: flex;
      justify-content: center;
      margin-top: -1vh;
      margin-bottom: 1vh;
    }
    
    .estimated-prize-box {
      background: linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(0, 145, 255, 0.1));
      border: 1px solid rgba(40, 167, 69, 0.4);
      padding: 1.5vh 3vw;
      border-radius: 50px;
      display: inline-flex;
      align-items: baseline;
      gap: 1vw;
      box-shadow: 0 0 20px rgba(40, 167, 69, 0.15);
    }

    .est-label {
      font-size: 2.5vh;
      color: var(--text-secondary);
      font-weight: 700;
    }

    .est-amount {
      font-size: 5.5vh;
      font-weight: 900;
      color: var(--accent-green, #28a745);
      font-variant-numeric: tabular-nums;
      text-shadow: 0 0 15px rgba(40, 167, 69, 0.3);
    }

    .est-currency {
      font-size: 2.5vh;
      color: var(--text-primary);
      font-weight: 700;
    }

    .prize-footer {
      margin-top: 1vh;
      padding-top: 3vh;
      border-top: 1px solid var(--border-color);
      font-size: 3vh;
      color: var(--text-secondary);
    }

    .highlight-rounds {
      color: var(--accent-green, #28a745);
      font-weight: 900;
      font-size: 4.5vh;
      margin: 0 15px;
    }

    /* === 간결하고 임팩트 있는 단발성 폭발 애니메이션 === */
    @keyframes jackpotBurst {
      0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; }
      80% { opacity: 1; }
      100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(var(--scale)); opacity: 0; }
    }

    .casino-coin {
      position: absolute;
      top: 30%;
      left: 50%;
      font-size: 3.5rem;
      pointer-events: none;
      z-index: 9999;
      animation: jackpotBurst 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }

    /* === 숫자 롤링 시 반짝임(Glow) 효과 === */
    @keyframes textGlow {
      0% { text-shadow: 0 0 30px rgba(255, 193, 7, 0.4); transform: scale(1); }
      50% { text-shadow: 0 0 80px rgba(255, 193, 7, 1), 0 0 120px rgba(255, 255, 255, 0.6); transform: scale(1.05); color: #fffacd; }
      100% { text-shadow: 0 0 30px rgba(255, 193, 7, 0.4); transform: scale(1); }
    }

    @keyframes textGlowGreen {
      0% { text-shadow: 0 0 15px rgba(40, 167, 69, 0.3); transform: scale(1); }
      50% { text-shadow: 0 0 40px rgba(40, 167, 69, 1), 0 0 60px rgba(255, 255, 255, 0.6); transform: scale(1.05); color: #e8f5e9; }
      100% { text-shadow: 0 0 15px rgba(40, 167, 69, 0.3); transform: scale(1); }
    }

    .prize-amount.rolling { animation: textGlow 0.4s ease-in-out infinite alternate; }
    .est-amount.rolling { animation: textGlowGreen 0.4s ease-in-out infinite alternate; }
  `;

  appElement.innerHTML = `
    <style>${styles}</style>
    <div class="prize-tv-wrapper" id="prize-tv-wrapper">
      <header style="flex-shrink: 0; margin-bottom: 1vh; padding: 0;">
        <div class="title-container" style="width: 100%; display: flex; flex-direction: column; gap: 1vh;">
          <div class="title-group" style="display: flex; justify-content: flex-start; align-items: center; gap: 1.5vh;">
            <h1 style="font-size: 3.5vh; margin: 0;">2026 Scratch 1st OPEN</h1>
            <span class="live-indicator" style="font-size: 1.4vh; padding: 0.5vh 1vh;">LIVE</span>
          </div>
          <div class="subtitle" style="display: flex; justify-content: space-between; width: 100%; margin: 0;">
            <span class="subtitle-text" style="font-size: 1.8vh; color: var(--accent-blue);">
              홀인원 누적 상금 현황
            </span>
            <span class="last-updated" style="font-size: 1.5vh;">마지막 업데이트: <span id="prize-last-updated">-</span></span>
          </div>
        </div>
      </header>

      <main class="prize-content-area">
        <div class="prize-card">
          <div class="prize-label">🏆 본선 홀인원 누적 상금 🏆</div>
          <div class="prize-amount-box">
            <div class="prize-amount" id="prize-amount">0</div>
            <div class="prize-currency">원</div>
          </div>
          
          <div class="estimated-prize-wrapper">
            <div class="estimated-prize-box">
              <span class="est-label">최종 예상 상금 :</span>
              <span class="est-amount" id="est-amount">0</span>
              <span class="est-currency">원</span>
            </div>
          </div>

          <div class="prize-footer">
            현재 총 <span class="highlight-rounds" id="total-rounds">0</span> 라운드 진행 중! <span style="font-size:2vh; opacity:0.6; margin-left: 10px;">(1R당 2,000원 적립)</span>
          </div>
        </div>
      </main>
    </div>
  `;

  const triggerJackpot = () => {
    const wrapper = document.getElementById("prize-tv-wrapper");
    if (!wrapper) return;

    const emojis = ["💰", "✨"];
    const totalCoins = 24; 

    for (let i = 0; i < totalCoins; i++) {
      const coin = document.createElement("div");
      coin.textContent = Math.random() > 0.5 ? emojis[0] : emojis[1];
      coin.className = "casino-coin";

      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 250;
      const tx = Math.cos(angle) * distance + "px";
      const ty = Math.sin(angle) * distance + "px";
      const scale = 0.7 + Math.random() * 0.8;

      coin.style.setProperty("--tx", tx);
      coin.style.setProperty("--ty", ty);
      coin.style.setProperty("--scale", scale);

      wrapper.appendChild(coin);
      setTimeout(() => coin.remove(), 1200);
    }
  };

  // triggerEffect 변수를 통해 메인 상금일 때만 잭팟이 터지도록 제어
  const animateValue = (element, start, end, duration, triggerEffect = false) => {
    let startTimestamp = null;

    if (start < end) {
      if (triggerEffect) triggerJackpot();
      element.classList.add("rolling");
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeOutProgress * (end - start) + start);

      element.textContent = current.toLocaleString();

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = end.toLocaleString();
        element.classList.remove("rolling");
      }
    };
    window.requestAnimationFrame(step);
  };

  const updateData = async () => {
    try {
      await fetchLeaderboardData(stage);
      const data = getLeaderboardData();

      const timeEl = document.getElementById("prize-last-updated");
      if (timeEl) timeEl.textContent = new Date().toLocaleTimeString("ko-KR");

      let totalRounds = 0;

      if (data && data.info && data.info.roundCount !== undefined) {
        totalRounds = data.info.roundCount;
      } else if (data && data.total) {
        totalRounds = data.total.reduce((sum, player) => sum + (player.roundCount || 0), 0);
      }

      // 1. 현재 누적 상금 계산
      const targetPrize = totalRounds * 2000;
      document.getElementById("total-rounds").textContent = totalRounds.toLocaleString();

      // 2. 최종 예상 상금 계산 (추정치)
      const startDate = new Date("2026-03-31T00:00:00");
      const now = new Date();
      const diffTime = Math.max(0, now - startDate);
      const totalDays = 28; // 대회 총 일수
      
      // 현재 진행 일차 계산
      let currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      // 대표님 요청 공식: 아침시간 오차를 줄이기 위해 (현재일차 - 1) 적용
      let effectiveDay = currentDay - 1;
      
      // 1일차일 경우 0으로 나누는 것을 방지하기 위해 최소 1일로 보정
      if (effectiveDay < 1) effectiveDay = 1;
      // 대회가 끝나면 최대 28일로 고정
      if (effectiveDay > totalDays) effectiveDay = totalDays;

      // 일일 평균 금액 * 총 28일
      const estimatedTotalPrize = Math.floor((targetPrize / effectiveDay) * totalDays);

      // DOM 업데이트 및 애니메이션 실행
      const amountEl = document.getElementById("prize-amount");
      const estAmountEl = document.getElementById("est-amount");

      const currentPrize = parseInt(amountEl.textContent.replace(/,/g, "")) || 0;
      const currentEstPrize = parseInt(estAmountEl.textContent.replace(/,/g, "")) || 0;

      if (currentPrize !== targetPrize) {
        animateValue(amountEl, currentPrize, targetPrize, 2000, true); // 메인 상금은 잭팟 효과 ON
      }
      if (currentEstPrize !== estimatedTotalPrize) {
        animateValue(estAmountEl, currentEstPrize, estimatedTotalPrize, 2000, false); // 추정치는 텍스트 효과만
      }
      
    } catch (error) {
      console.error("상금 데이터 업데이트 실패:", error);
    }
  };

  await updateData();

  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(updateData, 5 * 60 * 1000);
}
