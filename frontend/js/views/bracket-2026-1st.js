import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let updateInterval;

/**
 * 스켈레톤 UI를 생성합니다.
 * 실제 데이터 구조와 동일하게 틀을 먼저 보여줍니다.
 */
function renderSkeleton() {
  const skeletonSlot = `<div class="slot skeleton"><span class="slot-name"></span></div>`;
  const skeletonMatch = `<div class="match-pair">${skeletonSlot}${skeletonSlot}</div>`;
  const skeletonRound = (count) => `<div class="round-col">${Array(count).fill(skeletonMatch).join('')}</div>`;

  return `
    <div class="side-wing left">
      ${skeletonRound(4)}
      ${skeletonRound(2)}
      ${skeletonRound(1)}
    </div>
    <div class="final-center">
      <div class="final-box skeleton" style="height: 150px;"></div>
    </div>
    <div class="side-wing right">
      ${skeletonRound(1)}
      ${skeletonRound(2)}
      ${skeletonRound(4)}
    </div>
  `;
}

export async function renderBracket2026_1st(stage, appElement) {
  // 1. 외부 CSS 동적 로드 (중복 로드 방지)
  if (!document.getElementById('bracket-v2-style')) {
    const link = document.createElement('link');
    link.id = 'bracket-v2-style';
    link.rel = 'stylesheet';
    link.href = '/css/bracket-v2.css';
    document.head.appendChild(link);
  }

  // 2. 기본 레이아웃 및 스켈레톤 초기 렌더링
  appElement.innerHTML = `
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
        ${renderSkeleton()}
      </div>

      <div class="footer-note" style="font-size: 1.6vh; color: #777; margin-top: 2vh; font-weight: 600;">
        "결승전 중 홀인원은 첫번째 홀인원 달성자에게 전액(100%) 지급됩니다"
      </div>
    </div>

    <div id="br-overview-modal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 3000; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: 0.3s;">
      <div class="overview-modal-content" style="position: relative; padding: 20px; text-align: center; max-width: 90vw;">
        <button id="btn-close-overview-br" style="position: absolute; top: -15px; right: -15px; background: #16181c; color: #fff; border: 2px solid #333; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer;">&times;</button>
        <img src="/assets/2026-1st-overview.jpg" class="overview-modal-img" style="max-width: 100%; max-height: 85vh; border-radius: 12px;" />
      </div>
    </div>
  `;

  // 3. 내부 유틸리티 함수 (상금 애니메이션 등)
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
    return p && p.userNickname 
      ? { name: p.userNickname, rank: p.preliminaryRank ? `#${p.preliminaryRank}` : "" }
      : { name: "-", rank: "" };
  };

  // 4. 메인 렌더링 로직
  const renderMatches = () => {
    const data = getLeaderboardData();
    if (!data) return;

    const b16 = data.bracket16 || [];
    const b8 = data.bracket8 || [];
    const b4 = data.bracket4 || [];
    const bFinal = data.bracketFinal || [];

    // 좌측 (1~8)
    let leftHtml = '<div class="side-wing left"><div class="round-col">';
    for (let i = 1; i <= 8; i += 2) {
      const p1 = getPlayer(b16, i), p2 = getPlayer(b16, i + 1);
      leftHtml += `<div class="match-pair">
        <div class="slot"><span class="slot-name">${p1.name}</span><span class="slot-rank">${p1.rank}</span></div>
        <div class="slot"><span class="slot-name">${p2.name}</span><span class="slot-rank">${p2.rank}</span></div>
      </div>`;
    }
    leftHtml += '</div><div class="round-col">';
    for (let i = 1; i <= 4; i += 2) {
      const p1 = getPlayer(b8, i), p2 = getPlayer(b8, i + 1);
      leftHtml += `<div class="match-pair" style="margin: 8vh 0;">
        <div class="slot"><span class="slot-name">${p1.name}</span></div>
        <div class="slot"><span class="slot-name">${p2.name}</span></div>
      </div>`;
    }
    leftHtml += '</div><div class="round-col">';
    const sfL1 = getPlayer(b4, 1), sfL2 = getPlayer(b4, 2);
    leftHtml += `<div class="match-pair" style="margin: 20vh 0;">
        <div class="slot"><span class="slot-name">${sfL1.name}</span></div>
        <div class="slot"><span class="slot-name">${sfL2.name}</span></div>
      </div></div>`;

    // 중앙
    const f1 = getPlayer(bFinal, 1), f2 = getPlayer(bFinal, 2);
    const centerHtml = `
      <div class="final-center">
        <div class="final-box">
          <div class="final-label">🏆 THE FINAL MATCH 🏆</div>
          <div class="slot" style="border:none; border-radius:0; justify-content:center; font-size: 2.2vh; padding: 2.5vh 0;"><span class="slot-name">${f1.name}</span></div>
          <div style="text-align:center; color:#555; background:#16181c; padding: 0.5vh 0; font-weight:800; font-size:1.2vh;">VS</div>
          <div class="slot" style="border:none; border-radius:0; justify-content:center; font-size: 2.2vh; padding: 2.5vh 0;"><span class="slot-name">${f2.name}</span></div>
        </div>
      </div>`;

    // 우측 (9~16)
    let rightHtml = '<div class="side-wing right"><div class="round-col">';
    for (let i = 9; i <= 16; i += 2) {
      const p1 = getPlayer(b16, i), p2 = getPlayer(b16, i + 1);
      rightHtml += `<div class="match-pair">
        <div class="slot"><span class="slot-rank">${p1.rank}</span><span class="slot-name">${p1.name}</span></div>
        <div class="slot"><span class="slot-rank">${p2.rank}</span><span class="slot-name">${p2.name}</span></div>
      </div>`;
    }
    rightHtml += '</div><div class="round-col">';
    for (let i = 5; i <= 8; i += 2) {
      const p1 = getPlayer(b8, i), p2 = getPlayer(b8, i + 1);
      rightHtml += `<div class="match-pair" style="margin: 8vh 0;">
        <div class="slot"><span class="slot-name">${p1.name}</span></div>
        <div class="slot"><span class="slot-name">${p2.name}</span></div>
      </div>`;
    }
    rightHtml += '</div><div class="round-col">';
    const sfR1 = getPlayer(b4, 3), sfR2 = getPlayer(b4, 4);
    rightHtml += `<div class="match-pair" style="margin: 20vh 0;">
        <div class="slot"><span class="slot-name">${sfR1.name}</span></div>
        <div class="slot"><span class="slot-name">${sfR2.name}</span></div>
      </div></div>`;

    document.getElementById("bracket-render-area").innerHTML = leftHtml + centerHtml + rightHtml;
  };

  const updatePrize = async () => {
    try {
      await fetchLeaderboardData("2026-1st-bracket");
      renderMatches();

      const fixedQualGames = 955; // 대표님 요청 고정값
      const targetAmount = fixedQualGames * 2000;
      const amountEl = document.getElementById("br-prize-amount");
      
      if (amountEl) {
        const currentAmount = parseInt(amountEl.textContent.replace(/[^0-9]/g, "")) || 0;
        if (currentAmount !== targetAmount) animateValue(amountEl, currentAmount, targetAmount, 2000);
      }
    } catch (e) { console.error("Update Error:", e); }
  };

  // 5. 이벤트 바인딩 및 초기화
  const modal = document.getElementById("br-overview-modal");
  document.getElementById("btn-open-overview-br").onclick = () => { modal.style.opacity = "1"; modal.style.visibility = "visible"; };
  document.getElementById("btn-close-overview-br").onclick = () => { modal.style.opacity = "0"; modal.style.visibility = "hidden"; };

  await updatePrize();
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(updatePrize, 60000); 
}