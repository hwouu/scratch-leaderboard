import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let updateInterval;

export async function renderPrizePage(stage, appElement) {
  appElement.innerHTML = `
    <div class="prize-container">
      <div class="prize-header">🏆 2026 Scratch 1st OPEN 홀인원 상금 🏆</div>
      <div class="prize-amount-wrapper">
        <div class="prize-amount" id="prize-amount">0</div>
        <div class="prize-currency">원</div>
      </div>
      <div class="prize-footer">
        현재 총 <span class="highlight-rounds" id="total-rounds">0</span> 라운드 진행 중! (1R당 2,000원 적립)
      </div>
    </div>
  `;

  // index.html을 직접 수정하지 않도록 동적으로 CSS 로드
  if (!document.getElementById("prize-css")) {
    const link = document.createElement("link");
    link.id = "prize-css";
    link.rel = "stylesheet";
    link.href = "/css/prize.css";
    document.head.appendChild(link);
  }

  const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
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

      let totalRounds = 0;
      if (data && data.total) {
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
        animateValue(amountEl, currentPrize, targetPrize, 2000); // 2초간 카운팅
      }
    } catch (error) {
      console.error("상금 데이터 업데이트 실패:", error);
    }
  };

  await updateData();

  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(updateData, 5 * 60 * 1000);
}
