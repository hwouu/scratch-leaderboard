import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let updateInterval;

export async function renderBracket2026_1st(stage, appElement) {
  const styles = `
    .bracket-wrapper { background: #0b0c0e; height: 100vh; padding: 2vh 2vw; display: flex; flex-direction: column; align-items: center; color: #fff; overflow: hidden; font-family: 'Pretendard', sans-serif; }
    
    /* 상단 상금 보드 */
    .prize-glass-board { background: linear-gradient(180deg, #1e2128 0%, #111318 100%); border: 1px solid #333; border-radius: 16px; padding: 2vh 4vw; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); margin-bottom: 2vh; position: relative; z-index: 10; }
    .prize-label { font-size: 1.6vh; color: #888; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 0.5vh; }
    .prize-value { font-size: 6.5vh; font-weight: 900; color: var(--accent-yellow); text-shadow: 0 0 30px rgba(255,193,7,0.3); font-variant-numeric: tabular-nums; }
    .prize-currency { font-size: 2.5vh; color: #fff; margin-left: 10px; font-weight: 700; }

    /* 대진표 구조 */
    .tournament-stage { display: flex; justify-content: center; align-items: center; gap: 0; width: 100%; flex: 1; min-width: 1100px; }
    .side-wing { display: flex; gap: 0; align-items: center; }
    .side-wing.right { flex-direction: row-reverse; }

    .round-col { display: flex; flex-direction: column; justify-content: space-around; width: 180px; height: 55vh; }
    .match-pair { margin: 1.5vh 0; position: relative; padding: 0 20px; width: 100%; box-sizing: border-box; }
    
    .left .match-pair::after { content: ''; position: absolute; right: 0; top: 25%; height: 50%; width: 20px; border: 2px solid #333; border-left: none; border-radius: 0 8px 8px 0; }
    .right .match-pair::before { content: ''; position: absolute; left: 0; top: 25%; height: 50%; width: 20px; border: 2px solid #333; border-right: none; border-radius: 8px 0 0 8px; }

    .slot { background: #1c1f26; border: 1px solid #333; padding: 1.2vh 1vw; font-weight: 700; font-size: 1.8vh; display: flex; justify-content: space-between; border-radius: 4px; position: relative; z-index: 2; align-items: center; }
    .slot:first-child { margin-bottom: 2px; }
    .slot-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; }
    .slot-rank { color: #666; font-size: 1.4vh; font-weight: 600; }

    .final-center { display: flex; flex-direction: column; align-items: center; gap: 2vh; padding: 0 3vw; position: relative; }
    .center-line-horizontal { position: absolute; top: 50%; left: -20px; right: -20px; height: 2px; background: #333; z-index: 1; }
    .final-box { background: #16181c; border: 2px solid var(--accent-yellow); border-radius: 12px; width: 220px; padding: 0; box-shadow: 0 0 40px rgba(255,193,7,0.2); z-index: 2; overflow: hidden; }
    .final-label { background: rgba(255,193,7,0.1); color: var(--accent-yellow); font-size: 1.5vh; font-weight: 900; text-align: center; padding: 1vh; letter-spacing: 2px; border-bottom: 1px solid rgba(255,193,7,0.3); }

    /* 헤더 텍스트 확대 및 LIVE 배지 복구 */
    .bracket-nav { width: 100%; max-width: 1400px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2vh; }
    .bracket-nav h2 { margin: 0; font-weight: 900; font-size: 3.5vh; display: flex; align-items: center; gap: 10px; }
    .live-tag { background: #ff0000; color: #fff; padding: 0.3vh 0.8vw; font-size: 1.6vh; font-weight: 800; border-radius: 4px; vertical-align: middle; animation: pulse 2s infinite; }
    
    .header-actions { display: flex; gap: 10px; }
    .btn-glass { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1vh 1.5vw; border-radius: 6px; font-size: 1.6vh; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5vw; text-decoration: none; transition: 0.2s; }
    .btn-glass:hover { background: rgba(255,255,255,0.15); border-color: #fff; }
    .btn-gold { border-color: var(--accent-yellow); color: var(--accent-yellow); }

    .footer-note { font-size: 1.6vh; color: #777; margin-top: 1vh; font-weight: 600; }

    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
    @keyframes jackpotBurst { 0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; } 80% { opacity: 1; } 100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(var(--scale)); opacity: 0; } }
    .casino-coin { position: absolute; top: 30%; left: 50%; font-size: 3rem; pointer-events: none; z-index: 9999; animation: jackpotBurst 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 3000; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
    .modal-overlay.active { opacity: 1; visibility: visible; }
    .overview-modal-content { position: relative; padding: 20px; text-align: center; max-width: 90vw; }
    .overview-modal-img { max-width: 100%; max-height: 85vh; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .modal-close-btn { position: absolute; top: -15px; right: -15px; background: #16181c; color: #fff; border: 2px solid #333; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; }
  `;

  appElement.innerHTML = `
    <style>${styles}</style>
    <div class="bracket-wrapper" id="bracket-tv-wrapper">
      <div class="bracket-nav">
        <h2>2026 SCRATCH 1st <span style="color:var(--accent-yellow)">BRACKET</span> <span class="live-tag">LIVE</span></h2>
        <div class="header-actions">
          <button id="btn-open-overview-br" class="btn-glass"><i class="fas fa-info-circle"></i> 개요</button>
          <a href="/" class="btn-glass btn-gold"><i class="fas fa-list-ol"></i> 랭킹 보기</a>
        </div>
      </div>

      <div class="prize-glass-board">
        <div class="prize-label">Tournament Hole-In-One Prize</div>
        <div class="prize-amount" id="br-prize-amount">0<span class="prize-currency">원</span></div>
      </div>

      <div class="tournament-stage" id="bracket-render-area">
        <div style="text-align: center; width: 100%; color: #888; font-size: 2vh;">
          <i class="fas fa-spinner fa-spin" style="margin-right:10px;"></i> 대진표 데이터를 불러오는 중...
        </div>
      </div>

      <div class="footer-note">"결승전 중 홀인원은 첫번째 홀인원 달성자에게 전액(100%) 지급됩니다"</div>
    </div>

    <div id="br-overview-modal" class="modal-overlay">
      <div class="overview-modal-content">
        <button id="btn-close-overview-br" class="modal-close-btn">&times;</button>
        <img src="/assets/2026-1st-overview.jpg" class="overview-modal-img" />
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

  const getPlayer = (rawList, slot) => {
    if (!rawList) return { name: "준비중", rank: "" };
    let players = Array.isArray(rawList)
      ? rawList
      : rawList.data || rawList.result || [];

    const p = players.find((x) => x.slotNo === slot);
    if (p && p.userNickname) {
      return {
        name: p.userNickname,
        rank: p.preliminaryRank ? `#${p.preliminaryRank}` : "",
      };
    }
    return { name: "준비중", rank: "" };
  };

  const renderMatches = () => {
    const data = getLeaderboardData();
    if (!data) return;

    // api.js 수정에 의해 bracket16 등 키값이 보장됨
    const b16 = data.bracket16 || [];
    const b8 = data.bracket8 || [];
    const b4 = data.bracket4 || [];
    const bFinal = data.bracketFinal || [];

    // 좌측 날개 (1~8)
    let leftHtml = '<div class="side-wing left"><div class="round-col">';
    for (let i = 1; i <= 8; i += 2) {
      const p1 = getPlayer(b16, i);
      const p2 = getPlayer(b16, i + 1);
      leftHtml += `
        <div class="match-pair">
          <div class="slot"><span class="slot-name">${p1.name}</span><span class="slot-rank">${p1.rank}</span></div>
          <div class="slot"><span class="slot-name">${p2.name}</span><span class="slot-rank">${p2.rank}</span></div>
        </div>`;
    }
    leftHtml += '</div><div class="round-col">';
    for (let i = 1; i <= 4; i += 2) {
      const p1 = getPlayer(b8, i);
      const p2 = getPlayer(b8, i + 1);
      leftHtml += `
        <div class="match-pair" style="margin: 8vh 0;">
          <div class="slot"><span class="slot-name">${p1.name}</span></div>
          <div class="slot"><span class="slot-name">${p2.name}</span></div>
        </div>`;
    }
    leftHtml += '</div><div class="round-col">';
    const sfL1 = getPlayer(b4, 1);
    const sfL2 = getPlayer(b4, 2);
    leftHtml += `
        <div class="match-pair" style="margin: 20vh 0;">
          <div class="slot"><span class="slot-name">${sfL1.name}</span></div>
          <div class="slot"><span class="slot-name">${sfL2.name}</span></div>
        </div>
      </div></div>`;

    // 중앙 결승
    const f1 = getPlayer(bFinal, 1);
    const f2 = getPlayer(bFinal, 2);
    let centerHtml = `
      <div class="final-center">
        <div class="center-line-horizontal"></div>
        <div class="final-box">
          <div class="final-label">🏆 THE FINAL MATCH 🏆</div>
          <div class="slot" style="border:none; border-radius:0; justify-content:center; font-size: 2.2vh; padding: 2vh 0;"><span class="slot-name">${f1.name}</span></div>
          <div style="text-align:center; color:#555; background:#16181c; padding: 0.5vh 0;">VS</div>
          <div class="slot" style="border:none; border-radius:0; justify-content:center; font-size: 2.2vh; padding: 2vh 0;"><span class="slot-name">${f2.name}</span></div>
        </div>
      </div>
    `;

    // 우측 날개 (9~16) 역방향
    let rightHtml = '<div class="side-wing right"><div class="round-col">';
    for (let i = 9; i <= 16; i += 2) {
      const p1 = getPlayer(b16, i);
      const p2 = getPlayer(b16, i + 1);
      rightHtml += `
        <div class="match-pair">
          <div class="slot"><span class="slot-rank">${p1.rank}</span><span class="slot-name">${p1.name}</span></div>
          <div class="slot"><span class="slot-rank">${p2.rank}</span><span class="slot-name">${p2.name}</span></div>
        </div>`;
    }
    rightHtml += '</div><div class="round-col">';
    for (let i = 5; i <= 8; i += 2) {
      const p1 = getPlayer(b8, i);
      const p2 = getPlayer(b8, i + 1);
      rightHtml += `
        <div class="match-pair" style="margin: 8vh 0;">
          <div class="slot"><span class="slot-name">${p1.name}</span></div>
          <div class="slot"><span class="slot-name">${p2.name}</span></div>
        </div>`;
    }
    rightHtml += '</div><div class="round-col">';
    const sfR1 = getPlayer(b4, 3);
    const sfR2 = getPlayer(b4, 4);
    rightHtml += `
        <div class="match-pair" style="margin: 20vh 0;">
          <div class="slot"><span class="slot-name">${sfR1.name}</span></div>
          <div class="slot"><span class="slot-name">${sfR2.name}</span></div>
        </div>
      </div></div>`;

    document.getElementById("bracket-render-area").innerHTML =
      leftHtml + centerHtml + rightHtml;
  };

  const updatePrize = async () => {
    try {
      await fetchLeaderboardData("2026-1st-bracket");
      renderMatches();

      // 대표님 요청 고정상수: 955게임
      const fixedQualGames = 955;
      const targetAmount = fixedQualGames * 2000;

      const amountEl = document.getElementById("br-prize-amount");
      if (!amountEl) return;
      const currentAmount =
        parseInt(amountEl.textContent.replace(/[^0-9]/g, "")) || 0;

      if (currentAmount !== targetAmount) {
        animateValue(amountEl, currentAmount, targetAmount, 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const modal = document.getElementById("br-overview-modal");
  document.getElementById("btn-open-overview-br").onclick = () =>
    modal.classList.add("active");
  document.getElementById("btn-close-overview-br").onclick = () =>
    modal.classList.remove("active");

  await updatePrize();
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(updatePrize, 60000); // 1분 갱신
}
