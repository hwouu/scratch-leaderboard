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
      padding: 8vh 5vw;
      text-align: center;
      width: 80%;
      max-width: 1400px;
      display: flex;
      flex-direction: column;
      gap: 5vh;
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

    .prize-footer {
      margin-top: 2vh;
      padding-top: 4vh;
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

    /* === 카지노 잭팟 코인 이모지 효과 === */
    @keyframes jackpotPop {
      0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0; }
      10% { opacity: 1; }
      100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(var(--scale)); opacity: 0; }
    }

    .casino-coin {
      position: absolute;
      top: 50%;
      left: 50%;
      font-size: 4rem;
      pointer-events: none;
      z-index: 9999;
      animation: jackpotPop 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }

    /* === 숫자 롤링 시 반짝임(Glow) 효과 === */
    @keyframes textGlow {
      0% { text-shadow: 0 0 30px rgba(255, 193, 7, 0.4); transform: scale(1); }
      50% { text-shadow: 0 0 80px rgba(255, 193, 7, 1), 0 0 120px rgba(255, 255, 255, 0.6); transform: scale(1.05); color: #fffacd; }
      100% { text-shadow: 0 0 30px rgba(255, 193, 7, 0.4); transform: scale(1); }
    }

    .prize-amount.rolling {
      animation: textGlow 0.4s ease-in-out infinite alternate;
    }
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
          <div class="prize-label">🏆 홀인원 누적 상금 🏆</div>
          <div class="prize-amount-box">
            <div class="prize-amount" id="prize-amount">0</div>
            <div class="prize-currency">원</div>
          </div>
          <div class="prize-footer">
            현재 총 <span class="highlight-rounds" id="total-rounds">0</span> 라운드 진행 중! <span style="font-size:2vh; opacity:0.6; margin-left: 10px;">(1R당 2,000원 적립)</span>
          </div>
        </div>
      </main>
    </div>
  `;

  // === 이모지 잭팟 분수 효과 ===
  const triggerJackpot = () => {
    const wrapper = document.getElementById("prize-tv-wrapper");
    if (!wrapper) return;

    const emojis = ["💰", "🪙", "💸", "✨", "🎰", "💎"];
    const totalCoins = 40; // 뿜어져 나올 이모지 개수

    for (let i = 0; i < totalCoins; i++) {
      setTimeout(() => {
        const coin = document.createElement("div");
        coin.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        coin.className = "casino-coin";

        // 360도 무작위 방향으로 퍼지게 설정 (거리 200px ~ 600px)
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 400;
        const tx = Math.cos(angle) * distance + "px";
        const ty = Math.sin(angle) * distance + "px";

        // 크기도 제각각 다르게
        const scale = 0.7 + Math.random() * 1.3;

        coin.style.setProperty("--tx", tx);
        coin.style.setProperty("--ty", ty);
        coin.style.setProperty("--scale", scale);

        wrapper.appendChild(coin);

        // 1.5초 애니메이션 후 요소 삭제
        setTimeout(() => coin.remove(), 1500);
      }, i * 50); // 50ms 간격으로 총 2초 동안 연속 발사
    }
  };

  // === 카운팅 애니메이션 로직 ===
  const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;

    // 금액이 오를 때만 잭팟 이펙트 및 숫자 반짝임 시작
    if (start < end) {
      triggerJackpot();
      element.classList.add("rolling");
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // 카지노 슬롯처럼 초반엔 빠르고 끝에 천천히 멈추는 감속 효과
      const easeOutProgress =
        progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeOutProgress * (end - start) + start);

      element.textContent = current.toLocaleString();

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = end.toLocaleString();
        // 숫자 변경 완료 시 반짝임 효과 제거
        element.classList.remove("rolling");
      }
    };
    window.requestAnimationFrame(step);
  };

  // === API 데이터 연동 로직 ===
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
        totalRounds = data.total.reduce(
          (sum, player) => sum + (player.roundCount || 0),
          0,
        );
      }

      const targetPrize = totalRounds * 2000;
      document.getElementById("total-rounds").textContent =
        totalRounds.toLocaleString();

      const amountEl = document.getElementById("prize-amount");
      const currentPrize =
        parseInt(amountEl.textContent.replace(/,/g, "")) || 0;

      if (currentPrize !== targetPrize) {
        animateValue(amountEl, currentPrize, targetPrize, 2000);
      }
    } catch (error) {
      console.error("상금 데이터 업데이트 실패:", error);
    }
  };

  await updateData();

  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(updateData, 5 * 60 * 1000);
}
