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
      .tv-grid table tr { display: table-row; }
      
      .tv-grid table th { font-size: 0.85rem; padding: 0.8rem 0.2rem; text-align: center; }
      .tv-grid table td { padding: 0.7rem 0.2rem; text-align: center; vertical-align: middle; } 
      
      .tv-grid .rank { font-size: 1.5rem; font-weight: 800; }
      
      .tv-grid .player-info { text-align: left; padding-left: 1.5rem !important; }
      .tv-grid .nickname { font-size: 1.2rem; font-weight: 700; display: block; }
      
      .prize-tag {
        display: inline-block;
        margin-top: 0.4rem;
        font-size: 0.85rem;
        color: var(--accent-yellow);
        background: rgba(255, 193, 7, 0.1);
        padding: 0.2rem 0.6rem;
        border-radius: 6px;
        border: 1px solid rgba(255, 193, 7, 0.3);
        font-weight: 600;
        line-height: 1.2;
      }
      .prize-tag.logo-only {
        padding: 0.2rem 0;
        background: transparent;
        border: none;
      }
      
      .tv-grid .course-score { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
      .tv-grid .final-score { font-size: 1.6rem; font-weight: 800; }
      
      .advanced-row td {
        background-color: rgba(40, 167, 69, 0.08) !important;
        border-bottom: 1px solid rgba(40, 167, 69, 0.2) !important;
      }
      body.light-mode .advanced-row td {
        background-color: rgba(40, 167, 69, 0.05) !important;
      }
      .advanced-row .rank {
        color: var(--accent-green) !important;
        text-shadow: 0 0 10px rgba(40,167,69,0.3);
      }

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
      .overview-modal-close:hover {
        transform: scale(1.1); background: var(--accent-red); color: #fff; border-color: var(--accent-red);
      }

      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--accent-blue); border-radius: 4px; }
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
  `;

  const modal = document.getElementById('tv-overview-modal');
  document.getElementById('btn-open-overview').addEventListener('click', () => modal.classList.add('active'));
  document.getElementById('btn-close-overview').addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  // === PXG 및 23위 타이틀리스트 로고 포함 정확한 상품 맵핑 (SVG 반영 및 색상 반전) ===
  const getPrizeForRank = (rank) => {
    // filter: invert(1)을 추가하여 흑백 반전 적용
    const logoStyle = 'height: 1.8rem; object-fit: contain; vertical-align: middle; filter: invert(1);';
    switch(rank) {
      case 1: return `<img src="/assets/logo-titleist.svg" alt="Titleist" style="${logoStyle}">`;
      case 2: return '50,000 Point';
      case 3: return '50,000 Point';
      case 4: return '50,000 Point';
      case 5: return `<img src="/assets/logo-callaway.svg" alt="Callaway" style="${logoStyle}">`;
      case 6: return '30,000 Point';
      case 7: return '30,000 Point';
      case 8: return '30,000 Point';
      case 9: return '30,000 Point';
      case 10: return `<img src="/assets/logo-ping.svg" alt="Ping" style="${logoStyle}">`;
      case 11: return '20,000 Point';
      case 12: return '20,000 Point';
      case 13: return '20,000 Point';
      case 14: return '20,000 Point';
      case 15: return '20,000 Point';
      case 16: return `<img src="/assets/logo-pxg.svg" alt="PXG" style="${logoStyle}">`; 
      case 17: return '10,000 Point';
      case 18: return '10,000 Point';
      case 19: return '10,000 Point';
      case 20: return '10,000 Point';
      case 21: return '10,000 Point';
      case 22: return '10,000 Point';
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

    const top30 = data.total.slice(0, 30);
    const halfIndex = Math.ceil(top30.length / 2);
    const col1 = top30.slice(0, halfIndex);
    const col2 = top30.slice(halfIndex, top30.length);

    if (col2.length < col1.length) {
      col2.push({ isEmpty: true });
    }

    const formatCourseScore = (s) => s === undefined || s === null ? '-' : (s === 0 ? 'E' : (s > 0 ? `+${s}` : s));

    const renderTable = (players) => {
      if (players.length === 0) return '<div></div>';
      
      const headHTML = `
        <thead>
          <tr>
            <th style="width: 10%;">순위</th>
            <th style="width: 28%;">선수 정보</th>
            <th style="width: 11%;">라운드 수</th>
            <th style="width: 10%;">A코스</th>
            <th style="width: 10%;">B코스</th>
            <th style="width: 10%;">C코스</th>
            <th style="width: 21%;">합산성적</th>
          </tr>
        </thead>`;
      
      const bodyHTML = players.map(player => {
        if (player.isEmpty) {
          return `
            <tr style="visibility: hidden;">
              <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
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

        const prizeContent = getPrizeForRank(player.rank);
        let prizeHTML = '';
        if (prizeContent) {
          const isLogo = prizeContent.includes('<img');
          prizeHTML = `<div class="prize-tag ${isLogo ? 'logo-only' : ''}">${isLogo ? prizeContent : '🎁 ' + prizeContent}</div>`;
        }

        return `
          <tr class="${rankChangeClass}">
            <td class="rank">${rank}</td>
            <td class="player-info">
              <span class="nickname">${player.userNickname}</span>
              ${prizeHTML}
            </td>
            <td style="font-weight: 500; font-size: 1.1rem;">${player.roundCount}</td>
            <td class="course-score">${formatCourseScore(aScore)}</td>
            <td class="course-score">${formatCourseScore(bScore)}</td>
            <td class="course-score">${formatCourseScore(cScore)}</td>
            <td class="final-score" style="color: ${scoreColor};">${scoreText}</td>
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
