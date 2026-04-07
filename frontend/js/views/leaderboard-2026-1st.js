import { fetchLeaderboardData, getLeaderboardData } from "../services/api.js";

let refreshInterval;

export async function renderLeaderboard2026_1st(stage, appElement) {
  appElement.innerHTML = `
    <style>
      body { overflow-y: auto !important; }
      
      .tv-wrapper {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        padding: 2rem 3% 3rem 3%; 
        box-sizing: border-box;
        overflow-y: auto; 
      }
      
      .tv-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        flex: 1;
        margin-top: 1rem;
        align-items: start; 
      }
      
      .tv-grid .table-container { margin: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
      .tv-grid table { width: 100%; display: table; table-layout: fixed; } 
      .tv-grid table thead { display: table-header-group; }
      .tv-grid table tbody { display: table-row-group; overflow: visible; }
      .tv-grid table tr { display: table-row; transition: background-color 0.2s; }
      
      .tv-grid table th { font-size: 0.85rem; padding: 0.8rem 0.2rem; text-align: center; }
      .tv-grid table td { padding: 0.7rem 0.2rem; text-align: center; vertical-align: middle; } 
      
      .tv-grid .rank { font-size: 1.5rem; font-weight: 800; }
      .tv-grid .player-info { text-align: left; padding-left: 1.5rem !important; }
      .tv-grid .nickname { font-size: 1.2rem; font-weight: 700; display: block; }
      .tv-grid .course-score { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
      .tv-grid .final-score { font-size: 1.6rem; font-weight: 800; }
      .expected-prize { font-size: 1rem; font-weight: 600; color: var(--accent-yellow); }
      
      .advanced-row td {
        background-color: rgba(40, 167, 69, 0.08) !important;
        border-bottom: 1px solid rgba(40, 167, 69, 0.2) !important;
      }
      body.light-mode .advanced-row td { background-color: rgba(40, 167, 69, 0.05) !important; }
      .advanced-row .rank { color: var(--accent-green) !important; text-shadow: 0 0 10px rgba(40,167,69,0.3); }

      .header-actions { display: flex; gap: 12px; }
      .action-btn {
        display: flex; align-items: center; gap: 8px;
        background-color: transparent; padding: 0.5rem 1rem;
        border-radius: 8px; text-decoration: none; font-size: 0.95rem;
        font-weight: 700; transition: all 0.2s ease; cursor: pointer;
      }
      .btn-prize { border: 1px solid var(--accent-yellow); color: var(--accent-yellow); }
      .btn-prize:hover { background-color: var(--accent-yellow); color: #000; box-shadow: 0 0 15px rgba(255, 193, 7, 0.4); }
      .btn-overview { border: 1px solid var(--accent-blue); color: var(--accent-blue); }
      .btn-overview:hover { background-color: var(--accent-blue); color: #fff; box-shadow: 0 0 15px rgba(0, 145, 255, 0.4); }
      .btn-course { border: 1px solid var(--accent-green); color: var(--accent-green); }
      .btn-course:hover { background-color: var(--accent-green); color: #fff; box-shadow: 0 0 15px rgba(40, 167, 69, 0.4); }

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
        border: 2px solid var(--border-color);
        width: 40px; height: 40px; border-radius: 50%; font-size: 24px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        z-index: 10; transition: all 0.2s;
      }
      .overview-modal-close:hover { transform: scale(1.1); background: var(--accent-red); color: #fff; border-color: var(--accent-red); }

      /* =========================================
         [신규] 선수 상세 정보 모달 (모바일용)
      ========================================= */
      .player-modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 4000;
        display: flex; justify-content: center; align-items: center;
        opacity: 0; visibility: hidden; transition: all 0.3s ease;
      }
      .player-modal-overlay.active { opacity: 1; visibility: visible; }
      .player-modal-content {
        background: var(--bg-surface); border: 1px solid var(--border-color);
        border-radius: 16px; padding: 25px 20px; width: 85%; max-width: 400px;
        position: relative; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        text-align: center;
      }
      .player-modal-close {
        position: absolute; top: 15px; right: 15px;
        background: transparent; color: var(--text-secondary);
        border: none; font-size: 28px; cursor: pointer; line-height: 1;
      }
      .player-modal-header { font-size: 1.6rem; font-weight: 800; margin-bottom: 20px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 15px; }
      .player-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: left; }
      .player-modal-item { background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); }
      .player-modal-item.full-width { grid-column: 1 / -1; }
      .pm-label { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px; display: block; font-weight: 600;}
      .pm-value { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); }
      .pm-score { font-size: 1.6rem; font-weight: 800; }
      .pm-courses { display: flex; justify-content: space-around; text-align: center; }
      .pm-courses > div { display: flex; flex-direction: column; gap: 5px; }

      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--accent-blue); border-radius: 4px; }

      /* =========================================
         태블릿 & 모바일 반응형 (Responsive) 설정
      ========================================= */
      @media (max-width: 1200px) {
        .tv-grid { grid-template-columns: 1fr; }
      }
      
      @media (max-width: 768px) {
        .tv-wrapper { padding: 1rem 5%; }
        .title-group { flex-direction: column; align-items: flex-start !important; gap: 0.5rem; }
        .header-actions { flex-wrap: wrap; margin-top: 0.5rem; justify-content: flex-start; }
        .subtitle { flex-direction: column; align-items: flex-start !important; gap: 0.5rem; }
        
        /* 모바일에서는 불필요한 열을 숨기고 심플하게 구성 */
        .hide-on-mobile { display: none !important; }
        .mobile-col-rank { width: 15% !important; }
        .mobile-col-info { width: 55% !important; }
        .mobile-col-score { width: 30% !important; }
        
        /* 모바일에서는 행 터치 효과 활성화 */
        .player-row { cursor: pointer; }
        .player-row:active { background-color: rgba(255, 255, 255, 0.1) !important; }
      }
    </style>

    <div class="tv-wrapper">
      <header style="flex-shrink: 0; margin-bottom: 1rem; padding: 0;">
        <div class="title-container" style="width: 100%; display: flex; flex-direction: column; gap: 1rem;">
          <div class="title-group" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <h1 style="font-size: 2.2rem; margin: 0;">2026 Scratch 1st OPEN</h1>
              <span class="live-indicator" style="font-size: 0.9rem; padding: 0.3rem 0.6rem;">LIVE</span>
            </div>
            
            <div class="header-actions">
              <button id="btn-open-overview" class="action-btn btn-overview">
                <i class="fas fa-file-alt"></i> 대회 개요
              </button>
              <a href="/2026-1st/courses" target="_blank" class="action-btn btn-course">
                <i class="fas fa-flag"></i> 코스 순위 열기
              </a>
              <a href="/prize" target="_blank" class="action-btn btn-prize">
                <i class="fas fa-trophy"></i> 상금 뷰 열기
              </a>
            </div>
          </div>
          
          <div class="subtitle" style="display: flex; justify-content: space-between; width: 100%; margin: 0;">
            <span class="subtitle-text" style="font-size: 1.1rem; color: var(--accent-blue);">
              예선 순위 (Top 30) - 상위 16명 홀인원 본선 진출
            </span>
            <span class="last-updated" style="font-size: 0.9rem;">마지막 업데이트: <span id="tv-last-updated">-</span></span>
          </div>
        </div>
      </header>

      <main class="tv-grid" id="tv-grid-container">
        <div class="placeholder-container" style="grid-column: 1/-1; width: 100%;">
          <p><i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> 데이터를 불러오는 중입니다...</p>
        </div>
      </main>
    </div>

    <div id="tv-overview-modal" class="overview-modal-overlay">
      <div class="overview-modal-content">
        <button id="btn-close-overview" class="overview-modal-close">&times;</button>
        <img src="/assets/2026-1st-overview.jpg" alt="대회 개요 포스터" class="overview-modal-img" onerror="this.src='https://placehold.co/800x1131/1a1c1e/eaeaea?text=Image+Not+Found'" />
      </div>
    </div>

    <div id="player-detail-modal" class="player-modal-overlay">
      <div class="player-modal-content">
        <button id="btn-close-player-modal" class="player-modal-close">&times;</button>
        <div class="player-modal-header" id="pm-nickname">선수 닉네임</div>
        
        <div class="player-modal-grid">
          <div class="player-modal-item">
            <span class="pm-label">순위</span>
            <span class="pm-value" id="pm-rank" style="color: var(--accent-green);">1</span>
          </div>
          <div class="player-modal-item">
            <span class="pm-label">합산 성적</span>
            <span class="pm-score" id="pm-final-score">E</span>
          </div>
          <div class="player-modal-item">
            <span class="pm-label">라운드 수</span>
            <span class="pm-value" id="pm-rounds">0</span>
          </div>
          <div class="player-modal-item">
            <span class="pm-label">예상 시상품</span>
            <span class="pm-value expected-prize" id="pm-prize">-</span>
          </div>
          <div class="player-modal-item full-width pm-courses">
            <div><span class="pm-label">A코스</span><span class="pm-value" id="pm-a">-</span></div>
            <div><span class="pm-label">B코스</span><span class="pm-value" id="pm-b">-</span></div>
            <div><span class="pm-label">C코스</span><span class="pm-value" id="pm-c">-</span></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // 모달 제어 이벤트
  const overviewModal = document.getElementById('tv-overview-modal');
  document.getElementById('btn-open-overview').addEventListener('click', () => overviewModal.classList.add('active'));
  document.getElementById('btn-close-overview').addEventListener('click', () => overviewModal.classList.remove('active'));
  overviewModal.addEventListener('click', (e) => { if (e.target === overviewModal) overviewModal.classList.remove('active'); });

  const playerModal = document.getElementById('player-detail-modal');
  document.getElementById('btn-close-player-modal').addEventListener('click', () => playerModal.classList.remove('active'));
  playerModal.addEventListener('click', (e) => { if (e.target === playerModal) playerModal.classList.remove('active'); });

  // 선수 팝업 열기 함수
  window.openPlayerModal = (dataStr) => {
    // 모바일(768px 이하)에서만 팝업 동작
    if (window.innerWidth > 768) return; 
    
    try {
      const data = JSON.parse(decodeURIComponent(dataStr));
      document.getElementById('pm-nickname').textContent = data.nickname;
      document.getElementById('pm-rank').textContent = data.rank;
      
      const scoreEl = document.getElementById('pm-final-score');
      scoreEl.textContent = data.finalScore;
      scoreEl.style.color = data.scoreColor;

      document.getElementById('pm-rounds').textContent = data.roundCount;
      document.getElementById('pm-a').textContent = data.aScore;
      document.getElementById('pm-b').textContent = data.bScore;
      document.getElementById('pm-c').textContent = data.cScore;
      document.getElementById('pm-prize').innerHTML = data.prize || '-';

      playerModal.classList.add('active');
    } catch (e) { console.error("Modal Data Parse Error", e); }
  };


  const getPrizeForRank = (rank) => {
    const logoStyle = 'height: 1.8rem; object-fit: contain; vertical-align: middle; filter: invert(1);';
    switch(rank) {
      case 1: return `<img src="/assets/logo-titleist.svg" alt="Titleist" style="${logoStyle}">`;
      case 2: return '50,000 P';
      case 3: return '50,000 P';
      case 4: return '50,000 P';
      case 5: return `<img src="/assets/logo-callaway.svg" alt="Callaway" style="${logoStyle}">`;
      case 6: return '30,000 P';
      case 7: return '30,000 P';
      case 8: return '30,000 P';
      case 9: return '30,000 P';
      case 10: return `<img src="/assets/logo-ping.svg" alt="Ping" style="${logoStyle}">`;
      case 11: return '20,000 P';
      case 12: return '20,000 P';
      case 13: return '20,000 P';
      case 14: return '20,000 P';
      case 15: return '20,000 P';
      case 16: return `<img src="/assets/logo-pxg.svg" alt="PXG" style="${logoStyle}">`; 
      case 17: return '10,000 P';
      case 18: return '10,000 P';
      case 19: return '10,000 P';
      case 20: return '10,000 P';
      case 21: return '10,000 P';
      case 22: return '10,000 P';
      case 23: return `<img src="/assets/logo-titleist.svg" alt="Titleist" style="${logoStyle}">`;
      default: return '';
    }
  };

  const renderData = () => {
    const data = getLeaderboardData();
    const container = document.getElementById('tv-grid-container');
    const timeEl = document.getElementById('tv-last-updated');
    if (timeEl) timeEl.textContent = new Date().toLocaleTimeString('ko-KR');

    if (data && (!data.total || data.total.length === 0)) {
      const playerMap = new Map();
      let hasAnyCourseData = false;

      ['courseA', 'courseB', 'courseC'].forEach(courseKey => {
        if (data[courseKey] && Array.isArray(data[courseKey])) {
          data[courseKey].forEach(p => {
            hasAnyCourseData = true;
            if (!playerMap.has(p.userId)) {
              playerMap.set(p.userId, { ...p, score: 0, totalScore: 0, roundCount: 0 });
            }
            const existing = playerMap.get(p.userId);
            existing.score += p.score;
            existing.totalScore += (p.totalScore !== undefined ? p.totalScore : p.score);
            existing.roundCount += p.roundCount;
          });
        }
      });

      if (hasAnyCourseData) {
        let syntheticTotal = Array.from(playerMap.values());
        
        syntheticTotal.forEach(p => {
          let roundRevision = 0;
          if (p.roundCount >= 35) roundRevision = -6;
          else if (p.roundCount >= 25) roundRevision = -4;
          else if (p.roundCount >= 20) roundRevision = -3;
          else if (p.roundCount >= 15) roundRevision = -2;
          else if (p.roundCount >= 10) roundRevision = -1;
          
          p.totalScore += roundRevision; 
        });

        syntheticTotal.sort((a, b) => {
          if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;
          return b.roundCount - a.roundCount;
        });
        
        let currentRank = 1;
        let tieCount = 0;

        syntheticTotal.forEach((p, i) => {
          if (i === 0) {
            p.rank = currentRank;
            p.isTieRank = 0;
          } else {
            const prev = syntheticTotal[i - 1];
            if (p.totalScore === prev.totalScore && p.roundCount === prev.roundCount) {
              p.rank = currentRank;
              p.isTieRank = 1;
              prev.isTieRank = 1;
              tieCount++;
            } else {
              currentRank += (tieCount + 1);
              p.rank = currentRank;
              p.isTieRank = 0;
              tieCount = 0;
            }
          }
        });
        
        data.total = syntheticTotal; 
      }
    }

    if (!data || !data.total || data.total.length === 0) {
      container.innerHTML = `
        <div class="placeholder-container" style="grid-column: 1/-1; width: 100%;">
          <p>진행 중인 선수 데이터가 없습니다.</p>
        </div>`;
      return;
    }

    data.total.forEach((p, i) => { p.absoluteIndex = i + 1; });

    const top30 = data.total.slice(0, 30);
    const halfIndex = Math.ceil(top30.length / 2);
    const col1 = top30.slice(0, halfIndex);
    const col2 = top30.slice(halfIndex, top30.length);

    if (col2.length < col1.length) { col2.push({ isEmpty: true }); }

    const formatCourseScore = (s) => s === undefined || s === null ? '-' : (s === 0 ? 'E' : (s > 0 ? `+${s}` : s));

    const renderTable = (players) => {
      if (players.length === 0) return '<div></div>';
      
      const headHTML = `
        <thead>
          <tr>
            <th class="mobile-col-rank" style="width: 9%;">순위</th>
            <th class="mobile-col-info" style="width: 24%; text-align: left; padding-left: 1.5rem;">선수 정보</th>
            <th class="hide-on-mobile" style="width: 9%;">라운드 수</th>
            <th class="hide-on-mobile" style="width: 8%;">A코스</th>
            <th class="hide-on-mobile" style="width: 8%;">B코스</th>
            <th class="hide-on-mobile" style="width: 8%;">C코스</th>
            <th class="mobile-col-score" style="width: 14%;">합산성적</th>
            <th class="hide-on-mobile" style="width: 20%;">시상품</th>
          </tr>
        </thead>`;
      
      const bodyHTML = players.map(player => {
        if (player.isEmpty) {
          return `
            <tr style="visibility: hidden;">
              <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
            </tr>`;
        }

        const isAdvanced = player.rank <= 16;
        const rankChangeClass = isAdvanced ? 'advanced-row' : '';
        const rank = player.isTieRank ? `T${player.rank}` : player.rank;
        
        const finalScore = player.totalScore !== undefined ? player.totalScore : player.score;
        let scoreColor = 'var(--text-primary)';
        if (finalScore > 0) scoreColor = 'var(--accent-red)';
        if (finalScore < 0) scoreColor = 'var(--accent-blue)';
        const scoreText = finalScore === 0 ? 'E' : (finalScore > 0 ? `+${finalScore}` : finalScore);
        
        const aScore = data.courseA?.find(p => p.userId === player.userId)?.score;
        const bScore = data.courseB?.find(p => p.userId === player.userId)?.score;
        const cScore = data.courseC?.find(p => p.userId === player.userId)?.score;

        const prizeContent = getPrizeForRank(player.absoluteIndex);

        // 팝업 모달로 전달할 데이터 패키징
        const modalDataObj = {
          nickname: player.userNickname,
          rank: rank,
          scoreColor: scoreColor,
          finalScore: scoreText,
          roundCount: player.roundCount,
          aScore: formatCourseScore(aScore),
          bScore: formatCourseScore(bScore),
          cScore: formatCourseScore(cScore),
          prize: prizeContent
        };
        const modalDataStr = encodeURIComponent(JSON.stringify(modalDataObj));

        return `
          <tr class="${rankChangeClass} player-row" onclick="window.openPlayerModal('${modalDataStr}')">
            <td class="rank mobile-col-rank">${rank}</td>
            <td class="player-info mobile-col-info">
              <span class="nickname">${player.userNickname}</span>
            </td>
            <td class="hide-on-mobile" style="font-weight: 500; font-size: 1.1rem;">${player.roundCount}</td>
            <td class="course-score hide-on-mobile">${formatCourseScore(aScore)}</td>
            <td class="course-score hide-on-mobile">${formatCourseScore(bScore)}</td>
            <td class="course-score hide-on-mobile">${formatCourseScore(cScore)}</td>
            <td class="final-score mobile-col-score" style="color: ${scoreColor};">${scoreText}</td>
            <td class="expected-prize hide-on-mobile">${prizeContent}</td>
          </tr>`;
      }).join('');
      
      return `<div class="table-container"><table>${headHTML}<tbody>${bodyHTML}</tbody></table></div>`;
    };

    container.innerHTML = renderTable(col1) + renderTable(col2);
  };

  const loadAndRender = async () => {
    await fetchLeaderboardData(stage);
    renderData();
  };

  await loadAndRender();

  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(loadAndRender, 5 * 60 * 1000);
}
