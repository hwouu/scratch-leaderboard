document.addEventListener('DOMContentLoaded', () => {
    const apiEndpoint = '/api';

    // DOM Elements
    const lastUpdatedElement = document.getElementById('last-updated-time');
    const leaderboardContentElement = document.getElementById('leaderboard-content');
    const tabs = document.querySelectorAll('.tab-button');
    const themeToggleButton = document.getElementById('theme-toggle');
    const updateNoticeElement = document.getElementById('update-notice');

    // State
    let leaderboardData = {};
    const REFRESH_INTERVAL_MS = 300000; // 5분
    let activeTab = localStorage.getItem('activeTab') || 'total'; // 로컬 스토리지에서 마지막 탭 불러오기

    // --- 테마 관리 --- //
    const applyTheme = (theme) => {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        themeToggleButton.textContent = theme === 'dark' ? '라이트 모드' : '다크 모드';
    };

    themeToggleButton.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // --- 데이터 렌더링 --- //
    const renderLeaderboard = () => {
        const data = leaderboardData[activeTab];

        if (!data || !Array.isArray(data) || data.length === 0) {
            leaderboardContentElement.innerHTML = '<p style="padding: 20px;">표시할 데이터가 없습니다.</p>';
            return;
        }

        const formatGrade = (gradeCode) => {
            if (!gradeCode || gradeCode.length < 4) return gradeCode;
            const animalMap = { 'REA': '독수리', 'RFA': '매', 'RCR': '학', 'RMA': '까치' };
            const levelMap = { '1': '골드', '2': '실버', '3': '브론즈' };
            const animal = animalMap[gradeCode.substring(0, 3)] || gradeCode.substring(0, 3);
            const level = levelMap[gradeCode.substring(3)] || gradeCode.substring(3);
            return `${animal} ${level}`;
        };

        const formatScore = (score) => {
            if (score === null || score === undefined || score === '-') return '-';
            const scoreValue = parseInt(score, 10);
            return scoreValue > 0 ? `+${scoreValue}` : scoreValue;
        };

        const headers = activeTab === 'total'
            ? ['순위', '닉네임', '참여매장', '라운드', 'A코스', 'B코스', 'C코스', '보정치', '최종 성적']
            : ['순위', '닉네임', '참여매장', '라운드', '코스 성적', '등급', '보정치', 'TOTAL'];

        const tableHead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
        
        const tableBody = data.map(player => {
            const rank = player.isTieRank ? `T${player.rank}` : player.rank;
            const rowCells = activeTab === 'total'
                ? [
                    `<td class="rank">${rank}</td>`,
                    `<td class="nickname">${player.userNickname}<span class="user-id">(${player.userId})</span></td>`,
                    `<td>${player.shopName}</td>`,
                    `<td>${player.roundCount}</td>`,
                    `<td>${formatScore(player.scores[0]?.score)}</td>`,
                    `<td>${formatScore(player.scores[1]?.score)}</td>`,
                    `<td>${formatScore(player.scores[2]?.score)}</td>`,
                    `<td>${player.revisionGrade}</td>`,
                    `<td class="final-score">${player.totalScore}</td>`
                  ]
                : [
                    `<td class="rank">${rank}</td>`,
                    `<td class="nickname">${player.userNickname}<span class="user-id">(${player.userId})</span></td>`,
                    `<td>${player.shopName}</td>`,
                    `<td>${player.roundCount}</td>`,
                    `<td>${formatScore(player.score)}</td>`,
                    `<td>${formatGrade(player.grade)}</td>`,
                    `<td>${player.revisionGrade}</td>`,
                    `<td class="final-score">${player.totalScore}</td>`
                  ];
            return `<tr>${rowCells.join('')}</tr>`;
        }).join('');

        leaderboardContentElement.innerHTML = `<table>${tableHead}<tbody>${tableBody}</tbody></table>`;
    };

    // --- 데이터 가져오기 --- //
    const fetchData = async () => {
        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            leaderboardData = await response.json();
            lastUpdatedElement.textContent = `${new Date().toLocaleString()}`;
            renderLeaderboard();
        } catch (error) {
            console.error('Failed to fetch leaderboard data:', error);
            leaderboardContentElement.innerHTML = '<p style="padding: 20px;">데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.</p>';
        }
    };

    // --- 탭 전환 --- //
    const setActiveTab = (tabName) => {
        activeTab = tabName;
        localStorage.setItem('activeTab', tabName); // 탭 선택을 로컬 스토리지에 저장
        tabs.forEach(t => {
            t.classList.toggle('active', t.dataset.target === tabName);
        });
        renderLeaderboard();
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => setActiveTab(tab.dataset.target));
    });

    // --- 초기화 --- //
    const init = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
        
        updateNoticeElement.textContent = `순위는 ${Math.round(REFRESH_INTERVAL_MS / 60000)}분 간격으로 자동 업데이트됩니다.`;

        setActiveTab(activeTab); // 저장된 탭 또는 기본 탭으로 시작
        
        fetchData();
        setInterval(fetchData, REFRESH_INTERVAL_MS);
    };

    init();
});
