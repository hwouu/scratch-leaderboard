import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let updateInterval;

export async function renderPrizePage(stage, appElement) {
  // 기존 프로젝트의 CSS 변수(--bg-surface, --border-color, --text-primary 등)를 완벽히 계승
  const styles = `
    .prize-tv-wrapper {
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 3vh 3vw;
      box-sizing: border-box;
      overflow: hidden;
      /* body의 기본 배경색 상속 */
    }
    
    .prize-content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-top: 2vh;
    }

    /* 기존 테이블/카드 컨테이너 UI 계승 */
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
      color: var(--accent-yellow, #ffd700); /* 기존 노란색 테마 포인트 */
      text-shadow: 0 0 30px rgba(255, 193, 7, 0.2);
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
      color: var(--accent-green, #28a745); /* 기존 초록색 강조 테마 */
      font-weight: 900;
      font-size: 4.5vh;
      margin: 0 15px;
    }
  `;

  appElement.innerHTML = `
    <style>${styles}</style>
    <div class="prize-tv-wrapper">
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

  // 숫자가 올라가는 카운팅 애니메이션 로직
  const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // 조금 더 부드러운 감속 (easeOutExpo) 효과
      const easeOutProgress =
        progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeOutProgress * (end - start) + start);

      element.textContent = current.toLocaleString();
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = end.toLocaleString();
      }
    };
    window.requestAnimationFrame(step);
  };

  const updateData = async () => {
    try {
      await fetchLeaderboardData(stage);
      const data = getLeaderboardData();

      // 시간 업데이트
      const timeEl = document.getElementById("prize-last-updated");
      if (timeEl) timeEl.textContent = new Date().toLocaleTimeString("ko-KR");

      // 총 라운드 수 계산
      let totalRounds = 0;
      if (data && data.total) {
        totalRounds = data.total.reduce(
          (sum, player) => sum + (player.roundCount || 0),
          0,
        );
      }

      // 1라운드 당 2,000원 계산
      const targetPrize = totalRounds * 2000;
      document.getElementById("total-rounds").textContent =
        totalRounds.toLocaleString();

      const amountEl = document.getElementById("prize-amount");
      const currentPrize =
        parseInt(amountEl.textContent.replace(/,/g, "")) || 0;

      // 상금이 변동되었을 때만 애니메이션 실행
      if (currentPrize !== targetPrize) {
        animateValue(amountEl, currentPrize, targetPrize, 2000);
      }
    } catch (error) {
      console.error("상금 데이터 업데이트 실패:", error);
    }
  };

  // 뷰 진입 시 즉시 실행
  await updateData();

  // 기존 5분 주기 폴링 유지
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(updateData, 5 * 60 * 1000);
}
